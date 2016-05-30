/**
 * @overview pagerank ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'pagerank',

	config: {
		dataset : 'demo',
		sourcekey : 'keyrank-demo',
		destkey : 'keyrank-demo',
		store : [ccm.store, './json/textcorpus.json'],
		dumpingFactor : 0.85,
		convergenceThreshold : 0.0001
	},
	  
	Instance: function () {
		
		var self = this;
		
		var keywords;
		
		this.render = function (callback) {

			this.store.get(self.dataset, function(textcorpus) {
				ranks = calculateRanks(textcorpus[self.sourcekey]);
				
				var storable = new Object();
				storable['key'] = self.dataset;
				storable[self.destkey] = ranks;
				self.store.set(storable);

				// render ranks as ordered list
				var element = ccm.helper.element(self);
				var html_structure = {tag: 'ol', id: self.destkey, inner: []};
				var nodes = Object.keys(ranks);
				nodes.sort(function(node_a, node_b){return ranks[node_a] <= ranks[node_b] });
				for (var rank of nodes) {
					html_structure.inner.push({tag: 'li', inner: rank + ": " + ranks[rank]});
				}
				element.html(ccm.helper.html(html_structure));
			});

			if (callback) callback();
		}
		
		/*
		 * ============================================================
		 * PRIVATE FUNCTIONS
		 * ============================================================
		 */
		var calculateRanks = function(adjacencyMatrix) {
			
			// set ranking settings
			var initRankValue = 1;
			var nodeCount = Object.keys(adjacencyMatrix).length;

			// init ranks
			var ranks = new Object();
			for(node in adjacencyMatrix) {
				ranks[node] = initRankValue;
			}

			// sum outgoing weights for every nodes once
			var outgoingWeights = new Object();
			for (node in adjacencyMatrix) {
				var outgoingWeightSum = 0;
				for(follower in adjacencyMatrix) {
					if(node == follower) continue;
						outgoingWeightSum += adjacencyMatrix[node][follower] ? adjacencyMatrix[node][follower] : 0;
					}
				outgoingWeights[node] = outgoingWeightSum;
			}

			// compute rank till convergenced
			var convergenced = false;
			while(!convergenced) {
				var previousRanks = JSON.parse(JSON.stringify(ranks));

				// compute rank for node_a
				for(node_a in adjacencyMatrix) {
					var sum = 0;

					// iterate over nodes which points to a
					for(node_b in adjacencyMatrix) {
						if(adjacencyMatrix[node_b][node_a] >= 1) {
							sum += (adjacencyMatrix[node_b][node_a]/outgoingWeights[node_b]) * previousRanks[node_b];
						}
					}

					// update rank
					ranks[node_a] = ((1 - self.dumpingFactor)/nodeCount) + (self.dumpingFactor*sum);

					// check if convergenced
					if(!convergenced && Math.abs(ranks[node_a]-previousRanks[node_a]) <= self.convergenceThreshold) {
						convergenced = true;
					}
				}
			}
			
			return(ranks);
		}

	}
  
});
