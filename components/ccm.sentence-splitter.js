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
				for (var document of documents) {
					for(var sentence of document.match(/[^\.!\?]+[\.!\?]+/g)) {
						sentences.push(sentence);
					}
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
