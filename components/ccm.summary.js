/**
 * @overview ccm-component which renders a generated summary of text
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'summary',

	config: {
		store 				: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.textcorpus.json'],
		store_dataset		: 'demo',
		store_corpus_key	: 'demo',
		store_matrix_key	: 'demo'
	},
	  
	Instance: function () {
		
		var self = this;
	
		var matrix;
		var pseudoDocument;
		var words;
		
		this.render = function (callback) {
			
			this.store.get(this.store_dataset, function(data) {
				
				//var documents = data[self.store_corpus_key];
				var documents = Object.keys(matrix);
				matrix = data[self.store_matrix_key];
				words = Object.keys(matrix[0]);
				
				console.log(matrix);
				// create pseudo document
				pseudoDocument = new Object();
				
				for(var word of words) {
					var mean = 0;
					for(var document of documents) {
						mean += matrix[document][word];
					}
					mean /= documents.length;
					pseudoDocument[word] = mean;
				}

				var similarities = [];
				for(var document of documents) {
					similarities.push(centrality(pseudoDocument, document, matrix));
				}
				
				console.log(similarities);
				
				documents.sort(function(document1, document2){
					return centrality(document1) > centrality(document2);
				});
				
				console.log(documents);
				
			});
			
		}
		
		var centrality = function(document) {
			var cosine;
						
			var dotProduct = 0;
			for(var word of words) {
				dotProduct += pseudoDocument[word]*matrix[document][word];
			}

			var norm1 = 0, norm2 = 0;
			for(var word of words) {
				norm1 += pseudoDocument[word]*pseudoDocument[word];
				norm2 += matrix[document][word]*matrix[document][word];
			}
			norm1 = Math.sqrt(norm1);
			norm2 = Math.sqrt(norm2);
			
			cosine = dotProduct / (norm1 * norm2);
			return cosine;
		}
		
	}
  
});
