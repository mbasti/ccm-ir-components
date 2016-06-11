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
	
		this.render = function (callback) {
			
			this.store.get(this.store_dataset, function(data) {
				
				var documents = data[self.store_corpus_key];
				var matrix = data[self.store_matrix_key];
				var words = Object.keys(matrix[0]);
				
				console.log(matrix);
				// create pseudo document
				var pseudoDocument = new Object();
				
				for(var word of words) {
					var mean = 0;
					console.log(word);
					for(var document of Object.keys(matrix)) {
						console.log(document);
						mean += matrix[document][word];
					}
					mean /= documents.length;
					pseudoDocument[word] = mean;
				}
			console.log('check');
				var similarities = [];
				for(var document of Object.keys(matrix)) {
					
					similarities.push(centrality(pseudoDocument, document, matrix));
				}
				
				console.log(similarities);
				
				var docs = Object.keys(matrix);
				docs.sort(function(document1, document2){
					return centrality(pseudoDocument,document1,matrix) > centrality(pseudoDocument,document1,matrix);
				});
				
				console.log(docs);
				
			});
			
		}
		
		var centrality = function(document1, document2, matrix) {
			var cosine;
						
			var dotProduct = 0;
			for(var word of Object.keys(matrix[document1])) {
				dotProduct += matrix[document1][word]*matrix[document2][word];
			}

			var norm1 = 0, norm2 = 0;
			for(var word of Object.keys(matrix[document1])) {
				norm1 += matrix[document1][word]*matrix[document1][word];
				norm2 += matrix[document2][word]*matrix[document2][word];
			}
			norm1 = Math.sqrt(norm1);
			norm2 = Math.sqrt(norm2);
			
			cosine = dotProduct / (norm1 * norm2);
			return cosine;
		}
		
	}
  
});
