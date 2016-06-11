/**
 * @overview stemmer ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'stemmer',

	config: {
		lib_lexer 		: [ccm.load, 'https://mbasti.github.io/ccm-ir-components/lib/jspos/lexer.js'],
		lib_stemmer 	: [ccm.load, 'https://mbasti.github.io/ccm-ir-components/lib/Snowball.min.js'],
		store 			: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.textcorpus.json'],
		store_dataset	: 'demo',
		store_src_key	: 'demo',
		store_dst_key	: 'demo',
		language		: 'english'
	},
	  
	Instance: function () {
	
		var self = this;
		var stemmer;

		this.init = function(callback) {
			stemmer = new Snowball(this.language);
			if(callback()) callback();
		}

		this.render = function (callback) {
			
			this.store.get(this.store_dataset, function(data) {
			
				var stemmedContent = new Array();	
				var html_content = "";
				
				var documents = data[self.store_src_key];
				
				for (var documentIndx in documents) {
					var document = documents[documentIndx];
					
					var stemmedDocument = "";
					for(var word of lexer.lex(document)) {
						stemmer.setCurrent(word);
						stemmer.stem();
						stemmedDocument += stemmer.getCurrent() + " ";
					}
					stemmedContent.push(stemmedDocument);
					
					html_content += "<p>" + stemmedDocument + "</p>";
					
					if(documentIndx < documents.length-1) {
							html_content += "<hr>";
					}
				}

				// render stemmed data
				if(self.render_element)	{
					self.render_element.html(ccm.helper.html(html_content));
				}

				// store stemmed data
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = stemmedContent;
				self.store.set(storable, callback);
			});
			
		}
		
	}
  
});
