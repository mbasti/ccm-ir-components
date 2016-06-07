/**
 * @overview renders a tagcloud from a ranking
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'keycloud',

	config: {
		lib_tagcloud			: [ccm.load, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/lib/jquery.tagcloud.js'],
		store 					: [ccm.store, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/json/textcorpus.json'],
		store_dataset 			: 'demo',
		store_ranking_key		: 'demo',
		store_matrix_key		: 'demo',
		cloud_renderLimit 		: 15,
		cloud_mergeTerms 		: false,
		cloud_defaults	: {
			size: {start: 10, end: 50, unit: 'pt'},
			color: {start: '#727a7e', end: '#a00'}
		}
	},
	  
	Instance: function () {
		
		var self = this;
		
		this.init = function(callback) {
			jQuery.fn.tagcloud.defaults = self.cloud_defaults;			
			if(callback) callback();
		}
	
		this.render = function (callback) {

			// filter rankings according to 'cloud_renderLimit'
			self.store.get(self.store_dataset, function(data) {

				var rankings = data[self.store_ranking_key];
				var adjacencyMatrix = data[self.store_matrix_key];
				
				var selectedRanks = selectRanks(rankings);
				
				if(self.cloud_mergeTerms) {
					selectedRanks = mergeRanks(selectedRanks, adjacencyMatrix);
				}

				// randomize dataset so it looks better
				var keys = Object.keys(selectedRanks);
				var i = 0, j = 0, temp = null;
				for (i = keys.length - 1; i > 0; i -= 1) {
					j = Math.floor(Math.random() * (i + 1));
					temp = keys[i];
					keys[i] = keys[j];
					keys[j] = temp;
				}

				// render selectedRanks
				var render_element = self.render_element;
				var div_id = self.render_element.selector.replace("#","") + "-cloud";
				var html_structure = {tag: 'div', id: div_id, inner: []};
				for (var key of keys){
					html_structure.inner.push({tag:'a', rel:selectedRanks[key], inner: ' ' + key + ' '});
				}
				render_element.html(ccm.helper.html(html_structure));
				render_element.find('#' + div_id + ' a').tagcloud();

			});

			if (callback) callback();
		}

		// ===================== PRIVATE FUNCTIONS =====================

		var selectRanks = function(rankings) {
			var keys = Object.keys(rankings);
			var selectedRanks = new Object();
			keys.sort(function(word_a, word_b){return rankings[word_a] <= rankings[word_b]});
			keys = keys.slice(0,self.cloud_renderLimit-1);
			for(var key of keys) {
				selectedRanks[key] = rankings[key];
			}
			return selectedRanks;
		}
		
		var mergeRanks = function(rankings, adjacencyMatrix) {
			var remainingRankings = JSON.parse(JSON.stringify(rankings));
			var mergedRanks = new Object();
			var mergeClusters = new Object();
			
			for(var rank in remainingRankings) {
				// merge with adjacent ranks
				var adjacentNodes = filterarray(Object.keys(adjacencyMatrix[rank]), Object.keys(rankings));
				var mergedRankString = rank;
				mergeClusters[rank] = adjacentNodes;
				for(var adjacentNode of adjacentNodes) {
					mergedRankString += "-" + adjacentNode;
					delete remainingRankings[adjacentNode];
				}

				delete remainingRankings[rank];

				// look for transitive adjacent ranks
				for(var otherRank in remainingRankings) {

					if(adjacencyMatrix[rank][otherRank] != undefined) {
						var adjacentNodesOfOthernode = Object.keys(adjacencyMatrix[otherRank]);
						delete remainingRankings[otherRank];
						mergedRankString += "-" + otherRank;
						
						for(var adjNodeOfOtherNode of adjacentNodesOfOthernode) {
							if(mergeClusters[rank].indexOf(adjNodeOfOtherNode) < 0 && remainingRankings[adjNodeOfOtherNode]) {
								mergedRankString += "-" +adjNodeOfOtherNode;
								mergeClusters[rank].push(adjNodeOfOtherNode);
								delete remainingRankings[adjNodeOfOtherNode];
							}											
						}
					}
				}
				mergedRanks[mergedRankString] = rankings[rank];

			}
			return mergedRanks;
		}
		
		var filterarray = function(arr1, arr2) {
			var result = arr1.filter(function(n) {
				return arr2.indexOf(n) > -1;
			});
			return result;
		}
		
	}
  
});

