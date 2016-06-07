/**
 * @overview part-of-speech tagger ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'postagger',

	config: {
		lib_lexer 		: [ccm.load, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/lib/jspos/lexer.js'],
		lib_lexicon 	: [ccm.load, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/lib/jspos/lexicon.js'],
		lib_postagger	: [ccm.load, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/lib/jspos/POSTagger.js'],
		store 			: [ccm.store, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/json/textcorpus.json'],
		store_dataset 	: 'demo',
		store_src_key 	: 'demo',
		store_dst_key	: 'demo',
		color_noun 		: '#ff6061',
		color_adjective : '#006639',
		color_verb 		: '#0089b7',
		color_default 	: '#000000'
	},
	  
	Instance: function () {
	
		var self = this;
		var lexer;
		var tagger;
		
		this.init = function(callback) {
			lexer = new Lexer();
			tagger = new POSTagger();
			if(callback) callback();
		}

		this.render = function(callback) {
	
			this.store.get(this.store_dataset, function(data) {
				
				var taggedCorpus = new Array();
				var html_content = "";
				
				for (var document of data[self.store_src_key]) {
					
					// generate pos-tags
					var taggedWords = tagger.tag(lexer.lex(document));
					taggedCorpus.push(taggedWords);
					
					html_content += "<p>";
					for(var taggedWord of taggedWords) {
						var color = getColor(taggedWord);	
						html_content += "<font color=" + color + ">";
						html_content += taggedWord[0] + " ";
						html_content += "</font>";
					}
					html_content += "</p>";
					
				}
				
				// render tagged data
				if(self.render_element) {
					self.render_element.html(ccm.helper.html(html_content));
				}
				// store tagged data
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = taggedCorpus;
				self.store.set(storable,callback);
				
			});
	
		}
		
		// ===================== PRIVATE FUNCTIONS =====================
		
		var getColor = function(taggedWord) {

			if(isNoun(taggedWord)) {
				return self.color_noun;
				
			} else if(isAdjective(taggedWord)) {
				return self.color_adjective;
				
			} else if(isVerb(taggedWord)) {
				return self.color_verb;
				
			} else {
				return self.color_default;
			}
		}
		
		var isNoun = function(taggedWord) {
			return taggedWord[1].match(/\b(NN|NNS|NNP|NNPS)\b/g) != null;
		}

		var isAdjective = function(taggedWord) {
			return taggedWord[1].match(/\b(JJ|JJR|JJS)\b/g) != null;
		}

		var isVerb = function(taggedWord) {		
			return taggedWord[1].match(/\b(VB|VBP|VBZ|VBG|VBN)\b/g) != null;
		}
		
	}
  
});
