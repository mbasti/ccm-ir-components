/**
 * @overview stemmer ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'stemmer',

	config: {
		dataset : 'demo',
		sourcekey : 'content',
		destkey : 'keyrank-demo',
		language : 'english',
		store : [ccm.store, './json/textcorpus.json'],
		lib_stemmer : [ccm.load, './lib/Snowball.min.js'],
	},
	  
	Instance: function () {
	
		var self = this;
		var stemmer;

		this.init = function(callback) {
			stemmer = new Snowball(this.language);
			if(callback()) callback();
		}

		this.render = function (callback) {
			
			var stemmedContent = new Array();
			
			this.store.get(this.dataset, function (textcorpus) {
				
				var htmltext = "";
				
				for (doc of textcorpus[self.sourcekey]) {

					var stemmedDoc = "";
					
					for(word of doc.split(/ +/)) {
						stemmer.setCurrent(word);
						stemmer.stem();
						stemmedDoc += stemmer.getCurrent() + " ";
					}
					
					stemmedContent.push(stemmedDoc);
					htmltext += "<p>" + stemmedDoc + "</p>";
				}

				var element = ccm.helper.element(self);
				element.html(ccm.helper.html(htmltext));

				var storable = new Object();
				storable['key'] = self.dataset;
				storable[self.destkey] = stemmedContent;
				self.store.set(storable);
			});
			
			if(callback) callback();
		}
		
	}
  
});
