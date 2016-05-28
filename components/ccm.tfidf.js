/**
 * @overview tf-idf ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {

	name: 'tfidf',

	config: {
		dataset : 'demo',
		sourcekey : 'keyrank-demo',
		destkey : 'keyrank-demo',
		store : [ccm.store, './json/textcorpus.json']
		//style : [ccm.load, './css/tfidf.css'],
		//lib_graph : [ccm.load, './lib/sigma/sigma.min.js']
	},
	  
	Instance: function () {
		
		var self = this;
		/*
		var g = {
			nodes: [],
			edges: []
		};
		*/
		this.render = function (callback) {

			this.setAdjacencyMatrixInStore(function() {
/*
				// render the graph with sigma lib
				var element = ccm.helper.element(self);
				sigma_graph = new sigma({
					graph: g,
					container: element[0].id,
				});
*/
			});

			if (callback) callback();
		}
		
		this.setAdjacencyMatrixInStore = function(callback) {

			var matrix;
			this.store.get(self.dataset, function(textcorpus) {
				matrix = calculateTFIDFMatrix(textcorpus[self.sourcekey]);
				var storable = new Object();
				storable['key'] = self.dataset;
				storable[self.destkey] = matrix;
				self.store.set(storable,callback);
			});
		}
		
		/*
		 * ============================================================
		 * PRIVATE FUNCTIONS
		 * ============================================================
		 */
		var calculateTFIDFMatrix = function(docs) {

			var highestFrequencyInDoc = new Object();
			var matrix = new Object();

			for (var doc = 0; doc < docs.length; doc++) {

				highestFrequencyInDoc[doc] = 0;

				var wordsWithTags = docs[doc];

				for (var currentWordWithTagIndx = 0; currentWordWithTagIndx < wordsWithTags.length; currentWordWithTagIndx++) {
				
					var currentWordWithTag = wordsWithTags[currentWordWithTagIndx];
				
					if(isSelectable(currentWordWithTag)) {
						
						var cleanTerm = getCleanString(currentWordWithTag);
						
						if(matrix[cleanTerm]) {
							 matrix[cleanTerm][doc] += 1;
							 matrix[cleanTerm]['_sum'] += 1;
						 } else {
							 matrix[cleanTerm] = new Object();
							 matrix[cleanTerm][doc] = 1;
							 matrix[cleanTerm]['_sum'] = 1;
						 }
						 
						 if(matrix[cleanTerm][doc] > highestFrequencyInDoc[doc]) {
							highestFrequencyInDoc[doc] = matrix[cleanTerm][doc];
						 }
						 
					}
				}
			}

			var terms = Object.keys(matrix);
			for (var doc = 0; doc < docs.length; doc++) {
				for(var termIndx in terms) {
					var term = terms[termIndx];
					var tf = (matrix[term][doc]? matrix[term][doc] : 0) /highestFrequencyInDoc[doc];
					var idf = Math.log(docs.length)/matrix[term]['_sum'];
					matrix[term][doc] = tf*idf;
				}
				
			}
			
			return matrix;
		}

		var getCleanString = function(wordWithTag) {
			return wordWithTag[0].toString().toLowerCase().replace(/[^0-9a-z]/g,"");
		}

		var isSelectable = function(wordWithTag) {
			return (wordWithTag[1].match(/(NN|NNP|NNPS|NNS)/g) || wordWithTag[1].match(/(JJ|JJR|JJS)/g)) && wordWithTag[0].length > 2
		}

		var isNoun = function(wordWithTag) {
			return wordWithTag[1].match(/(NN|NNP|NNPS|NNS)/g);
		}

		var isAdjective = function(wordWithTag) {
			return wordWithTag[1].match(/(JJ|JJR|JJS)/g);
		}

		var isSymbol = function(wordWithTag) {
			return wordWithTag[1].match(/(SYM|[\.,:$#"\(\)])/g);
		}
		
	}
	
});
