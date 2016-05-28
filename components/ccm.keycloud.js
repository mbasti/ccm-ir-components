/**
 * @overview renders keywords as tagcloud
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'keycloud',

	config: {
		filtercount : 15,
		merge_words : true,
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
				var ranks = filter_ranks(original_ranks);
				
				if(self.merge_words) {
			//		ranks = merge_words(ranks, ranks);
				}
				
				// randomize dataset
				var terms = Object.keys(ranks);
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

				for (var termIndx in terms){
					var term = terms[termIndx];
					html_structure.inner.push({tag:'a', rel:ranks[term], inner: ' ' + term + ' '});
				}
				element.html(ccm.helper.html(html_structure));
				element.find('#' + self.dataset + " a").tagcloud();

			});

			if (callback) callback();
		}

		var filter_ranks = function(ranks) {
			var filtered_ranks = new Object();
			// find next maximal rank
			for(i = 0; i < self.filtercount; i++) {
				var maxVal = 0;
				var maxWord = null;
				for(word in ranks) {
					if (ranks[word] >= maxVal) {
						maxVal = ranks[word];
						maxWord = word;
					}
				}

				if(maxWord == null) {break;}

				filtered_ranks[maxWord] = maxVal;
				delete ranks[maxWord];
			}
			return filtered_ranks;
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

