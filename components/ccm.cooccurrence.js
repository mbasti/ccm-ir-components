/**
 * @overview cooccurrence ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {

	name: 'cooccurrence',

	config: {
		lib_graph 			: [ccm.load, 'http://mbasti.github.io/lib/sigma/sigma.min.js'],
		store 				: [ccm.store, 'http://mbasti.github.io/json/ccm.textcorpus.json'],
		store_dataset 		: 'demo',
		store_src_key 		: 'demo',
		store_dst_key		: 'demo',
		coocc_wordtypes		: ['nouns', 'adjectives'],
		coocc_windowSize 	: 2,
		coocc_threshold		: 1,
		color_noun 			: '#ff6061',
		color_adjective 	: '#006639',
		color_verb 			: '#0089b7'
	},
	  
	Instance: function () {
		
		var self = this;
		var sigma_graph = {nodes:[], edges:[]};
		var json_graph = new Object();
		
		this.render = function(callback) {

			this.store.get(self.store_dataset, function(data) {
				
				// update 'sigma_graph' and 'json_graph'
				calculateCooccurrences(data[self.store_src_key]);

				// render 'sigma_graph'
				if(self.render_element) {
					new sigma({
						graph: sigma_graph,
						container: self.render_element.selector.replace("#","")
					});
				}
				
				// store 'json_graph'
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = json_graph;
				self.store.set(storable, callback);
			});

		}

		// ===================== PRIVATE FUNCTIONS =====================
		
		var calculateCooccurrences = function(corpus) {
		
			for (var doc = 0; doc < corpus.length; doc++) {

				var taggedWords = corpus[doc];

				for (var currentWordWithTagIndx = 0;
					currentWordWithTagIndx < taggedWords.length;
					currentWordWithTagIndx++) {
				
					var currentWordWithTag = taggedWords[currentWordWithTagIndx];
					var currentWord = getCleanString(currentWordWithTag[0]);
					var currentPOS = currentWordWithTag[1];
					
					if(isSelectable(currentWord, currentPOS)) {
						
						if(!nodeExist(currentWord)) {
							addNode(currentWord, currentPOS);
						}
						
						for(var lookupCounter = 1;
						(lookupCounter <= self.coocc_windowSize) && 
						(currentWordWithTagIndx+lookupCounter < taggedWords.length);
						lookupCounter++) {

							var otherWordWithTagIndx = currentWordWithTagIndx+lookupCounter;
							var otherWordWithTag = taggedWords[otherWordWithTagIndx];
							var otherWord = getCleanString(otherWordWithTag[0]);
							var otherPOS = otherWordWithTag[1];
							
							if(isSelectable(otherWord, otherPOS) && (currentWord !== otherWord)) {
						
								if(!nodeExist(otherWord)) {
									addNode(otherWord, otherPOS);
								}
								
								if(nodesExist(currentWord, otherWord)) {
									incrementForBothNodes(currentWord, otherWord);	
								} else {
									json_graph[currentWord][otherWord] = 1;
									json_graph[otherWord][currentWord] = 1;
								}	
							}
						}
					}
				}
			}
			
			// check for plural forms, which also appears in their
			// singular form. Merge and keep the plural form
			for(word of Object.keys(json_graph)) {
				var singular = getSingular(word);
					if(isPlural(word) && nodeExist(singular)) {

						for(var adjacentWord of Object.keys(json_graph[singular])) {
							
							delete json_graph[adjacentWord][singular];
							
							if(adjacentWord == singular) {
								continue;
							}
													
							json_graph[word][adjacentWord] += json_graph[singular][adjacentWord];
							json_graph[adjacentWord][word] += json_graph[adjacentWord][singular];
						}
						
						delete json_graph[singular];
					}
			}
		
			// check if thresholds are reached, set edges
			// and remove 'empty' nodes for less space usage
			var words = Object.keys(json_graph);
			for(var word_a_indx = 0;
			word_a_indx < words.length;
			word_a_indx++) {
				
				var word_a = words[word_a_indx];
				
				for(var word_b_indx = word_a_indx+1;
				word_b_indx < words.length;
				word_b_indx++) {
					
					var word_b = words[word_b_indx];

					if(!nodesExist(word_a, word_b, json_graph)) {
						continue;
					}

					var cooccurrences = json_graph[word_a][word_b];

					if(cooccurrences >= self.coocc_threshold) {
						var gnode_a = sigma_graph.nodes[word_a_indx];
						var gnode_b = sigma_graph.nodes[word_b_indx];
						
						var xDiff = Math.abs(gnode_a.x - gnode_b.x)/1.25;
						var yDiff = Math.abs(gnode_a.y - gnode_b.y)/1.25;
						
						gnode_a.size += cooccurrences;
						gnode_b.size += cooccurrences;
						
						if(gnode_a.size > gnode_b.size) {	
							
							if(gnode_a.x > gnode_b.x) {	
								gnode_b.x += xDiff;
							} else {
								gnode_b.x -= xDiff;
							}
							
							if(gnode_a.y > gnode_b.y) {	
								gnode_b.y += yDiff;
							} else {
								gnode_b.y -= yDiff;
							}
							
						} else {
							if(gnode_b.x > gnode_a.x) {	
								gnode_a.x += xDiff;
							} else {
								gnode_a.x -= xDiff;
							}
							
							if(gnode_b.y > gnode_a.y) {	
								gnode_a.y += yDiff;
							} else {
								gnode_a.y -= yDiff;
							}
						}
						
						sigma_graph.edges.push({
							id: word_a_indx + "," + word_b_indx,
							source: word_a,
							target: word_b,
							label: cooccurrences,
							size: cooccurrences,
							color: '#ccc'
						});
						
					} else {
						delete json_graph[word_a][word_b];
						delete json_graph[word_b][word_a];

						// delete 'empty' nodes for less space usage
						if(Object.keys(json_graph[word_a]).length == 0) {
							delete json_graph[word_a];
						}
						if(Object.keys(json_graph[word_b]).length == 0) {
							delete json_graph[word_b];
						}
					}
				}
			}
		}

		var nodeExist = function(word) {
			return json_graph[word] != undefined;
		}

		var nodesExist = function(word_a, word_b) {
			return (
				json_graph[word_a] != undefined &&
				json_graph[word_b] != undefined &&
				json_graph[word_a][word_b] != undefined && 
				json_graph[word_b][word_a] != undefined
			);
		}

		var addNode = function(word, pos_tag) {
			json_graph[word] = new Object();
			sigma_graph.nodes.push({
				id: word,
				label: word,
				x: Math.random(),
				y: Math.random(),
				size: 0,
				color: getColor(pos_tag)
			});
		}

		var incrementForBothNodes = function(word_a, word_b) {
			json_graph[word_a][word_b] += 1;
			json_graph[word_b][word_a] += 1;
		}
		
		var isSelectable = function(word, pos_tag) {
			if(word.length > 2) {
				
				if(isNoun(pos_tag)) {
					return (self.coocc_wordtypes.indexOf('nouns') > -1);
					
				} else if(isAdjective(pos_tag)) {
					return (self.coocc_wordtypes.indexOf('adjectives') > -1);
					
				} else if(isVerb(pos_tag)) {
					return (self.coocc_wordtypes.indexOf('verbs') > -1);
					
				}
				
			}

		}

		var getColor = function(pos_tag) {
			
			if(isNoun(pos_tag)) {
				return self.color_noun;
						
			} else if(isAdjective(pos_tag)) {
				return self.color_adjective;
					
			} else if(isVerb(pos_tag)) {
				return self.color_verb;	
			}
			
		}

		var getCleanString = function(word) {
			return word.toLowerCase().replace(/[^0-9a-z-]/g,"");
		}
		
		var isNoun = function(word) {
			return word.match(/\b(NN|NNS|NNP|NNPS)\b/g) != null;
		}

		var isAdjective = function(word) {
			return word.match(/\b(JJ|JJR|JJS)\b/g) != null;
		}

		var isVerb = function(word) {		
			return word.match(/\b(VB|VBP|VBZ|VBG|VBN)\b/g) != null;
		}

		var isSymbol = function(word) {
			return word.match(/(SYM|[\.,:$#"\(\)])/g) != null;
		}
		
		var isPlural = function(word) {
			return word.match(/s\b/) != null;
		}
		
		var getSingular = function(word) {
			return word.replace(/s\b/, "");
		}
		
	}
	
});
