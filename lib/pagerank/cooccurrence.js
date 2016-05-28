function cooccurrences(docs) {

	// set cooccurrence settings
	var windowSize = 2;
	var cooccurrence_threshold = 1;
	var cooccurrences = new Object();

	for (doc = 0; doc < docs.length; doc++) {

		var wordsWithTags = docs[doc];

		for (currentWordWithTagIndx = 0; currentWordWithTagIndx < wordsWithTags.length; currentWordWithTagIndx++) {
		
			var currentWordWithTag = wordsWithTags[currentWordWithTagIndx];
		
			if(isSelectable(currentWordWithTag)) {
			
				var currentWord = getCleanString(currentWordWithTag);
				var windowCount = 1;
				
				if(cooccurrences[currentWord] == undefined) {
					cooccurrences[currentWord] = new Object();	
				}
				
				while(windowCount <= windowSize && currentWordWithTagIndx+windowCount < wordsWithTags.length) {

					var otherWordWithTagIndx = currentWordWithTagIndx+windowCount;
					var otherWordWithTag = wordsWithTags[otherWordWithTagIndx];
					var otherWord = getCleanString(otherWordWithTag);

					if(isSelectable(otherWordWithTag)) {	

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
	for(node_a_indx = 0; node_a_indx < nodes.length; node_a_indx++) {
		var node_a = nodes[node_a_indx];
		for(node_b_indx = node_a_indx+1; node_b_indx < nodes.length; node_b_indx++) {
			var node_b = nodes[node_b_indx];
			var sum = 0;
			sum = cooccurrences[node_a][node_b]? cooccurrences[node_a][node_b] : 0;
			sum += cooccurrences[node_b][node_a]? cooccurrences[node_b][node_a] : 0;
			
			if(sum >= cooccurrence_threshold) {
				cooccurrences[node_a][node_b] = sum;
				cooccurrences[node_b][node_a] = sum;
			} else {
				cooccurrences[node_a][node_b] = 0;
				cooccurrences[node_b][node_a] = 0;
			}
		}
	}

	return cooccurrences;
}

function getCleanString(wordWithTag) {
	return wordWithTag[0].toString().toLowerCase().replace(/[^0-9a-z]/g,"");
}

function isSelectable(wordWithTag) {
	return (wordWithTag[1].match(/(NN|NNP|NNPS|NNS)/g) || wordWithTag[1].match(/(JJ|JJR|JJS)/g)) && wordWithTag[0].length > 2
}

function isNoun(wordWithTag) {
	return wordWithTag[1].match(/(NN|NNP|NNPS|NNS)/g);
}

function isAdjective(wordWithTag) {
	return wordWithTag[1].match(/(JJ|JJR|JJS)/g);
}

function isSymbol(wordWithTag) {
	return wordWithTag[1].match(/(SYM|[\.,:$#"\(\)])/g);
}
