/**
 * @overview cooccurrence ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {

	name: 'cooccurrence',

	config: {
		dataset : 'demo',
		sourcekey : 'keyrank-demo',
		destkey : 'keyrank-demo',
		windowSize : 2,
		cooccurrence_threshold : 1,
		color_noun : 'red',
		color_adjective : 'green',
		store : [ccm.store, './json/textcorpus.json'],
		lib_graph : [ccm.load, './lib/sigma/sigma.min.js']
	},
	  
	Instance: function () {
		
		var self = this;
		
		var g = {
			nodes: [],
			edges: []
		};
		
		this.render = function(callback) {

			var cooccurrences;
			this.store.get(self.dataset, function(textcorpus) {
				cooccurrences = calculateCooccurrences(textcorpus[self.sourcekey]);

				var storable = new Object();
				storable['key'] = self.dataset;
				storable[self.destkey] = cooccurrences;
				self.store.set(storable);
				
				// render the graph with sigma lib
				sigma_graph = new sigma({
					graph: g,
					container: self.element.selector.replace("#","")
				});
			});

			if (callback) callback();
		}

		/*
		 * ============================================================
		 * PRIVATE FUNCTIONS
		 * ============================================================
		 */
		var calculateCooccurrences = function(corpus) {
			
			var cooccurrences = new Object();

			for (var doc = 0; doc < corpus.length; doc++) {

				var wordsWithTags = corpus[doc];

				for (var currentWordWithTagIndx = 0; currentWordWithTagIndx < wordsWithTags.length; currentWordWithTagIndx++) {
				
					var currentWordWithTag = wordsWithTags[currentWordWithTagIndx];
					var currentWord = getCleanString(currentWordWithTag[0]);
					var currentPOS = currentWordWithTag[1];

					if(isSelectable(currentWord, currentPOS)) {
						var windowCount = 1;
						
						while(windowCount <= self.windowSize && currentWordWithTagIndx+windowCount < wordsWithTags.length) {

							var otherWordWithTagIndx = currentWordWithTagIndx+windowCount;
							var otherWordWithTag = wordsWithTags[otherWordWithTagIndx];
							var otherWord = getCleanString(otherWordWithTag[0]);
							var otherPOS = otherWordWithTag[1];
							
							if(isSelectable(otherWord, otherPOS) && currentWord !== otherWord) {
						
								if(!nodeExist(currentWord, cooccurrences)) {
									addNode(currentWord, currentPOS, cooccurrences);
								}
								
								if(!nodeExist(otherWord, cooccurrences)) {
									addNode(otherWord, otherPOS, cooccurrences);
								}
								
								if(nodesExist(currentWord, otherWord, cooccurrences)) {
									incrementForBothNodes(currentWord, otherWord, cooccurrences);	
								} else {
									cooccurrences[currentWord][otherWord] = 1;
									cooccurrences[otherWord][currentWord] = 1;
								}
								
							}

							windowCount++;
						}
					}
				}
			}
			
			// check if threshold is reached and add edges
			var words = Object.keys(cooccurrences);
			for(var word_a_indx = 0; word_a_indx < words.length; word_a_indx++) {
				
				var word_a = words[word_a_indx];
				
				for(var word_b_indx = word_a_indx+1; word_b_indx < words.length; word_b_indx++) {
					
					var word_b = words[word_b_indx];
					
					if(!nodesExist(word_a, word_b, cooccurrences)) {
						continue;
					}

					var sum = cooccurrences[word_a][word_b];

					if(sum >= self.cooccurrence_threshold) {
						var gnode_a = g.nodes[word_a_indx];
						var gnode_b = g.nodes[word_b_indx];
						
						var xDiff = Math.abs(gnode_a.x - gnode_b.x)/1.25;
						var yDiff = Math.abs(gnode_a.y - gnode_b.y)/1.25;
						
						gnode_a.size += sum;
						gnode_b.size += sum;
						
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
						
						g.edges.push({
							id: word_a_indx + "," + word_b_indx,
							source: word_a,
							target: word_b,
							label: sum,
							size: sum,
							color: '#ccc'
						});
						
					} else {
						delete cooccurrences[word_a][word_b];
						delete cooccurrences[word_b][word_a];

						// delete 'empty' nodes for less space usage
						if(Object.keys(cooccurrences[word_a]).length === 0) {
							delete cooccurrences[word_a];
						}
						if(Object.keys(cooccurrences[word_b]).length === 0) {
							delete cooccurrences[word_b];
						}
					}
				}
			}

			return cooccurrences;
		}

		var nodeExist = function(word, adjacencyMatrix) {
			return adjacencyMatrix[word] != undefined;
		}

		var nodesExist = function(word_a, word_b, adjacencyMatrix) {
			return (
				adjacencyMatrix[word_a] != undefined &&
				adjacencyMatrix[word_b] != undefined &&
				adjacencyMatrix[word_a][word_b] != undefined && 
				adjacencyMatrix[word_b][word_a] != undefined
			);
		}

		var addNode = function(word, pos_tag, adjacencyMatrix) {
			adjacencyMatrix[word] = new Object();
			g.nodes.push({
				id: word,
				label: word,
				x: Math.random(),
				y: Math.random(),
				size: 0,
				color: isAdjective(pos_tag) ? self.color_adjective : self.color_noun
			});
		}

		var incrementForBothNodes = function(word_a, word_b, adjacencyMatrix) {
			adjacencyMatrix[word_a][word_b] += 1;
			adjacencyMatrix[word_b][word_a] += 1;
		}

		var isSelectable = function(word, pos_tag) {
			return (isAdjective(pos_tag) || isNoun(pos_tag) ) && word.length > 2;
		}

		var getCleanString = function(word) {
			return word.toLowerCase().replace(/[^0-9a-z]/g,"");
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
		
	}
	
});
