/**
 * @overview tf-idf ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {

	name: 'tfidf',

	config: {
		lib_graph 		: [ccm.load, './lib/sigma/sigma.min.js'],
		store			: [ccm.store, './json/textcorpus.json'],
		store_dataset	: 'demo',
		store_src_key	: 'demo',
		store_dst_key	: 'demo',
		tfidf_wordtypes	: ['nouns', 'adjectives']
	},
	  
	Instance: function () {
		
		var self = this;
		var sigma_graph = {nodes:[], edges:[]};
		
		this.render = function (callback) {

			this.store.get(self.store_dataset, function(data) {
				
				var corpus = data[self.store_src_key];
				var matrix = calculateTFIDFMatrix(corpus);
				
				for (var document1 = 0; document1 < corpus.length; document1++) {
					for (var document2 = document1+1; document2 < corpus.length; document2++) {

						var cosine;
						
						var dotProduct = 0;
						for(var word of Object.keys(matrix[document1])) {
							dotProduct += matrix[document1][word]*matrix[document2][word];
						}

						var norm1 = 0, norm2 = 0;
						for(var word of Object.keys(matrix[document1])) {
							norm1 += matrix[document1][word]*matrix[document1][word];
							norm2 += matrix[document2][word]*matrix[document2][word];
						}
						norm1 = Math.sqrt(norm1);
						norm2 = Math.sqrt(norm2);
						
						cosine = dotProduct / (norm1 * norm2);
						var gnode_a = sigma_graph.nodes[document1];
						var gnode_b = sigma_graph.nodes[document2];
						
						var xDiff = Math.abs(gnode_a.x - gnode_b.x)/(cosine+0.5);
						var yDiff = Math.abs(gnode_a.y - gnode_b.y)/(cosine+0.5);
						
						if(gnode_a.x > gnode_b.x) {	
							gnode_a.x -= xDiff;
						} else {
							gnode_a.x += xDiff;
						}
						
						if(gnode_a.y > gnode_b.y) {	
							gnode_a.y -= yDiff;
						} else {
							gnode_a.y += yDiff;
						}

					}
					
				}
				
				// render 'sigma_graph'
				if(self.render_element)
					new sigma({
						graph: sigma_graph,
						container: self.render_element.selector.replace("#","")
					});
				}
				
				// store tf-idf matrix
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = matrix;
				self.store.set(storable,callback);
			});

		}
		
		// ===================== PRIVATE FUNCTIONS =====================
		
		var calculateTFIDFMatrix = function(corpus) {

			var maxFreqForDocument = new Object();
			var matrix = new Object();
			var sumForWord = new Object();
	
			for (var document = 0; document < corpus.length; document++) {
				
					sigma_graph.nodes.push({
						id: document,
						label: 'document ' + document,
						size: 10,
						x: Math.random(),
						y: Math.random(),
						color: 'black'
					});
				
				matrix[document] = new Object();
				maxFreqForDocument[document] = 0;
				
				for (var taggedWord of corpus[document]) {
				
					var word = getCleanString(taggedWord[0]);
					var pos_tag = taggedWord[1];
				
					if(isSelectable(word, pos_tag)) {					
						
						if(matrix[document][word]) {
							matrix[document][word] += 1;
							 sumForWord[word] += 1;
						 } else {			 
							 matrix[document][word] = 1;
							 sumForWord[word] = 1;
						 }
						 
						 if(matrix[document][word] > maxFreqForDocument[document]) {
							maxFreqForDocument[document] = matrix[document][word];
						 }
						 
					}
				}
			}

			// weight terms
			var words = Object.keys(sumForWord);
			for (var document = 0; document < corpus.length; document++) {
				for(var word of words) {
					var tf = (matrix[document][word]? matrix[document][word] : 0) / maxFreqForDocument[document];
					var idf = Math.log(corpus.length)/sumForWord[word];
					matrix[document][word] = tf*idf;
				}
				
			}

			return matrix;
		}

		var getCleanString = function(word) {
			return word.toLowerCase().replace(/[^0-9a-z-]/g,"");
		}

		var isSelectable = function(word, pos_tag) {
			if(word.length > 2) {
				
				if(isNoun(pos_tag)) {
					return (self.tfidf_wordtypes.indexOf('nouns') > -1);
					
				} else if(isAdjective(pos_tag)) {
					return (self.tfidf_wordtypes.indexOf('adjectives') > -1);
					
				} else if(isVerb(pos_tag)) {
					return (self.tfidf_wordtypes.indexOf('verbs') > -1);
					
				}
				
			}

		}

		var isNoun = function(pos_tag) {
			return pos_tag.match(/\b(NN|NNS|NNP|NNPS)\b/g) != null;
		}

		var isAdjective = function(pos_tag) {
			return pos_tag.match(/\b(JJ|JJR|JJS)\b/g) != null;
		}

		var isVerb = function(pos_tag) {		
			return pos_tag.match(/\b(VB|VBP|VBZ|VBG|VBN)\b/g) != null;
		}

		var isSymbol = function(pos_tag) {
			return pos_tag.match(/(SYM|[\.,:$#"\(\)])/g) != null;
		}
		
	}
	
});
