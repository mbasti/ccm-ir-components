/*
 * weighted directed matrix of size n*n
 */
function pageRank(adjacencyMatrix) {
	// ranking settings
	var dumpingFactor = 0.85;
	var convergence_threshold = 0.0001;
	var nodeCount = adjacencyMatrix.length;

	var ranks  = new Array();
	for (i = 0; i < nodeCount; i++) {
		ranks[i] = 0.25;
	}

	// compute output pointers once
	var outPointerCounts = new Array();
	for(i = 0; i < nodeCount; i++) {
		var outPointerCount = 0; // ....?
		for(j = 0; j < nodeCount; j++) {
			outPointerCount += adjacencyMatrix[i][j];
		}
		outPointerCounts[i] = outPointerCount;
	}

	// compute rank till abort condition is true
	do {
		var convergenced = false;
		var old_ranks = ranks.slice(0);
		for(node = 0; node < nodeCount; node++) {
			var sum = 0;
			document.write("<tr>");
			for(i = 0; i < nodeCount; i++) {
				if(adjacencyMatrix[i][node] == 1) {
					sum += (adjacencyMatrix[i][node]/outPointerCounts[i]) * old_ranks[i];
				}
			}
			ranks[node] = ((1 - dumpingFactor)/nodeCount) + (dumpingFactor*sum);
			if(Math.abs(ranks[node]-old_ranks[node]) <= convergence_threshold) {
				convergenced = true;
			}
			var val =Math.floor(ranks[node] * 1000) / 1000;
			document.write("<td> " + val + "  </td>");
		}
		document.write("</tr><br />");
	} while(!convergenced);
}
