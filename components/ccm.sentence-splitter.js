/**
 * @overview ccm sentence splitter, splits and collects all sentence of
 * a textcorpus
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'sentence-splitter',

	config: {
		store 			: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.textcorpus.json'],
		store_dataset	: 'demo',
		store_src_key	: 'demo',
		store_dst_key	: 'demo'
	},
	  
	Instance: function () {
		
		var self = this;
	
		this.render = function (callback) {
			
			this.store.get(this.store_dataset, function(data) {

				var documents = data[self.store_src_key];
				var sentences = [];
				var html_content = "";
				for (var documentIndx in documents) {
					
					var document = documents[documentIndx];
					var sentence_matches = document.match(/[^\.!\?]+[\.!\?]+/g);
					if(sentence_matches) {
						for(var sentence of sentence_matches) {
							sentences.push(sentence);
							html_content += "<p>" + sentence + "</p>";
							html_content += "<hr>";
						}
					} else {
						// dont know what else todo, when the regex 
						// doesnt match
						sentences.push(document);
					}
					
				}
				
				// render tagged data
				if(self.render_element) {
					self.render_element.html(ccm.helper.html(html_content));
				}
				
				// store sentences
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = sentences;
				self.store.set(storable, callback);
			});
			
		}
		
	}
  
});
