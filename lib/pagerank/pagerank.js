/*
 * weighted directed matrix of size n*n
 */
function pageRank(adjacencyMatrix) {
	
	// set ranking settings
	var initRankValue = 1;
	var dumpingFactor = 0.85;
	var convergenceThreshold = 0.0001;
	var nodeCount = Object.keys(adjacencyMatrix).length;
	var filtercount = 10; // Math.round(nodeCount/3);

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
			if(node == follower) continue; // nil;
			outgoingWeightSum += adjacencyMatrix[node][follower];
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
			ranks[node_a] = ((1 - dumpingFactor)/nodeCount) + (dumpingFactor*sum);
			
			// check if convergenced
			if(!convergenced && Math.abs(ranks[node_a]-previousRanks[node_a]) <= convergenceThreshold) {
				convergenced = true;
			}
		}
	}
	
	// filter ranks
	var filtered_ranks = new Object();
	for(i = 0; i < filtercount; i++) {
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
	/*
	// merge adjacent nodes
	var foundAdjecentNodes = false;
	var merged_ranks = new Object();
	do {
		foundAdjacentNodes = false;
		for(node_a in filtered_ranks) {
			for(node_b in filtered_ranks) {
				if(node_a === node_b) {
					continue;
				}
				if(adjacencyMatrix[node_a][node_b] >= 1) {
						merged_ranks[node_a + " " + node_b] = filtered_ranks[node_a] + filtered_ranks[node_b];
						delete filtered_ranks[node_a];
						delete filtered_ranks[node_b];
						foundAdjacentNodes = true;
						break;
				}
			}
			if(foundAdjacentNodes) {
				break;
			}
		}
	} while(foundAdjacentNodes);
	
	// get the remaining non-adjacent nodes
	for(node in filtered_ranks) {
		merged_ranks[node] = filtered_ranks[node];
	}
	*/
	return(filtered_ranks);
}
