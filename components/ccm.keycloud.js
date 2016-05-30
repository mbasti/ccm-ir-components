/**
 * @overview renders keywords as tagcloud
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'keycloud',

	config: {
		filtercount : 15,
		merge_terms : false,
		dataset : "demo",
		cooccurrencekey : 'cooccurrences',
		keywordkey : 'keywords',
		store : [ccm.store, './json/textcorpus.json'],
		defaults: {
			size: {start: 8, end: 56, unit: 'pt'},
			color: {start: '#727a7e', end: '#a00'}
		},
		jquery_tagcloud_lib: [ ccm.load, './lib/jquery.tagcloud.js' ]
	},
	  
	Instance: function () {
		
		var self = this;
		
		this.init = function(callback) {
			jQuery.fn.tagcloud.defaults = self.defaults;			
			if(callback) callback();
		}
	
		this.render = function (callback) {

			// filter ranks according to filtercount
			self.store.get(self.dataset, function(dataset) {

				var original_ranks = dataset[self.keywordkey];
				var adjacencyMatrix = dataset[self.cooccurrencekey];
				var words = selectWords(original_ranks);
				
				if(self.merge_terms) {
					words = merge_words(words, adjacencyMatrix);
				}

				// randomize dataset
				var terms = Object.keys(words);
				var i = 0, j = 0, temp = null;
				for (i = terms.length - 1; i > 0; i -= 1) {
					j = Math.floor(Math.random() * (i + 1));
					temp = terms[i];
					terms[i] = terms[j];
					terms[j] = temp;
				}

				// render
				var element = self.element;
				var html_structure = {tag: 'div', id: self.dataset, inner: []};

				for (var term of terms){
					html_structure.inner.push({tag:'a', rel:words[term], inner: ' ' + term + ' '});
				}
				element.html(ccm.helper.html(html_structure));
				element.find('#' + self.dataset + " a").tagcloud();

			});

			if (callback) callback();
		}

		var selectWords = function(ranks) {
			var wordKeys = Object.keys(ranks);
			var words = new Object();
			wordKeys.sort(function(word_a, word_b){return ranks[word_a] <= ranks[word_b]});
			wordKeys = wordKeys.slice(0,self.filtercount-1);
			for(var wordKey of wordKeys) {
				words[wordKey] = ranks[wordKey];
			}
			return words;
		}
		
		var merge_words = function(ranks,adjacencyMatrix) {
			var original_ranks = JSON.parse(JSON.stringify(ranks));
			var merged_ranks = new Object();
			var clusters = new Object();
			
			for(var node in ranks) {
				var adjacentNodes = filterarray(Object.keys(adjacencyMatrix[node]), Object.keys(original_ranks));
				var merged_string = node;
				clusters[node] = adjacentNodes;
				for(var adjacentNodeIndx in adjacentNodes) {
					merged_string += "-" + adjacentNodes[adjacentNodeIndx];
					delete ranks[adjacentNodes[adjacentNodeIndx]];
				}

				delete ranks[node];
				for(var othernode in ranks) {

					if(adjacencyMatrix[node][othernode] != undefined) {
						var adjacentNodesOfOthernode = Object.keys(adjacencyMatrix[othernode]);
						delete ranks[othernode];
						merged_string += "-" + othernode;
						
						for(var adjNodeOfOtherNodeIndx in adjacentNodesOfOthernode) {
							var adjNodeOfOtherNode = adjacentNodesOfOthernode[adjNodeOfOtherNodeIndx];
							if(clusters[node].indexOf(adjNodeOfOtherNode) < 0 && ranks[adjNodeOfOtherNode]) {
								merged_string += "-" +adjNodeOfOtherNode;
								clusters[node].push(adjNodeOfOtherNode);
								delete ranks[adjNodeOfOtherNode];
							}											
						}
					}
				}
				merged_ranks[merged_string] = original_ranks[node];

			}
			return merged_ranks;
		}
		
		var filterarray = function(arr1, arr2) {
			var result = arr1.filter(function(n) {
				return arr2.indexOf(n) > -1;
			});
			return result;
		}
		
	}
  
});

