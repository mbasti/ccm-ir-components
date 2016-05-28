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
		
		this.render = function (callback) {

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
					container: 'ccm-cooccurrences'//self.element.selector.replace("#","")
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
				
					if(isSelectable(currentWordWithTag)) {
						
						var currentWord = getCleanString(currentWordWithTag);
						var windowCount = 1;
						
						if(cooccurrences[currentWord] == undefined) {
							cooccurrences[currentWord] = new Object();

							g.nodes.push({
								id: currentWord,
								label: currentWord,
								x: Math.random(),
								y: Math.random(),
								size: 0,
								color: isAdjective(currentWordWithTag) ? self.color_adjective : self.color_noun
							});
							
						}
						
						while(windowCount <= self.windowSize && currentWordWithTagIndx+windowCount < wordsWithTags.length) {

							var otherWordWithTagIndx = currentWordWithTagIndx+windowCount;
							var otherWordWithTag = wordsWithTags[otherWordWithTagIndx];
							var otherWord = getCleanString(otherWordWithTag);

							if(isSelectable(otherWordWithTag) && currentWord !== otherWord) {	
								
								if(cooccurrences[currentWord][otherWord] == undefined) {
									cooccurrences[currentWord][otherWord] = 0;
								}

								cooccurrences[currentWord][otherWord] += 1;

							}

							windowCount++;
						}
					}
				}
			}

			// sum counts, check if threshold is reached and mirror matrix
			var nodes = Object.keys(cooccurrences);
			for(var node_a_indx = 0; node_a_indx < nodes.length; node_a_indx++) {
				var node_a = nodes[node_a_indx];
				for(var node_b_indx = node_a_indx+1; node_b_indx < nodes.length; node_b_indx++) {
					var node_b = nodes[node_b_indx];
					var sum = 0;
					sum = cooccurrences[node_a][node_b]? cooccurrences[node_a][node_b] : 0;
					sum += cooccurrences[node_b][node_a]? cooccurrences[node_b][node_a] : 0;
					if(sum >= self.cooccurrence_threshold) {
						cooccurrences[node_a][node_b] = sum;
						cooccurrences[node_b][node_a] = sum;
						
						var gnode_a = g.nodes[node_a_indx];
						var gnode_b = g.nodes[node_b_indx];
						
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
							id: node_a_indx + "," + node_b_indx,
							source: node_a,
							target: node_b,
							label: sum,
							size: sum,
							color: '#ccc'
						});
						
					} else {
						//cooccurrences[node_a][node_b] = 0;
						//cooccurrences[node_b][node_a] = 0;
						delete cooccurrences[node_a][node_b];
						delete cooccurrences[node_b][node_a];
					}
				}
			}
			
			return cooccurrences;
		}

		var isSelectable = function(wordWithTag) {
			return (isAdjective(wordWithTag) || isNoun(wordWithTag) ) && wordWithTag[0].length > 2;
		}

		var getCleanString = function(wordWithTag) {
			return wordWithTag[0].toString().toLowerCase().replace(/[^0-9a-z]/g,"");
		}
		
		var isNoun = function(wordWithTag) {
			return wordWithTag[1].match(/\b(NN|NNS|NNP|NNPS)\b/g) != null;
		}

		var isAdjective = function(wordWithTag) {
			return wordWithTag[1].match(/\b(JJ|JJR|JJS)\b/g) != null;
		}

		var isVerb = function(wordWithTag) {		
			return wordWithTag[1].match(/\b(VB|VBP|VBZ|VBG|VBN)\b/g) != null;
		}

		var isSymbol = function(wordWithTag) {
			return wordWithTag[1].match(/(SYM|[\.,:$#"\(\)])/g) != null;
		}
		
	}
	
});
