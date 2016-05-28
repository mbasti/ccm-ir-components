/**
 * @overview pos tagger ccm-component
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'postagger',

	config: {
		//dataset : 'story1',
		sourcekey : 'content',
		destkey : 'keyrank-demo',
		color_noun : 'red',
		color_adjective : 'green',
		color_verb : 'blue',
		color_default : 'black',
		store : [ccm.store, './json/textcorpus.json'],
		lib_jspos_lexer : [ccm.load, './lib/jspos/lexer.js'],
		lib_jspos_lexicon : [ccm.load, './lib/jspos/lexicon.js'],
		lib_jspos_postagger : [ccm.load, './lib/jspos/POSTagger.js']
	},
	  
	Instance: function () {
	
		var self = this;
		var taggedContent = null;

		this.render = function (callback) {
			taggedContent = new Array();
			this.store.get(this.dataset, function (textcorpus) {

				for (var documentIndx in textcorpus[self.sourcekey]) {
					var words = new Lexer().lex(textcorpus[self.sourcekey][documentIndx]);
					var taggedWords = new POSTagger().tag(words);
					taggedContent[documentIndx] = taggedWords;
				}

				var storable = new Object();
				storable['key'] = self.dataset;
				storable[self.destkey] = taggedContent;
				self.store.set(storable);
				
				// render keywords as ordered list
				var element = ccm.helper.element(self);
				var textareastring = "";
				
				for (var docIndx in taggedContent) {
					var currentDoc = taggedContent[docIndx];
					textareastring += "<p>";
					for (var wordIndx in currentDoc) {
						var wordWithTag = currentDoc[wordIndx];
						var color = self.color_default;
						
						if(isNoun(wordWithTag)) {
							color = self.color_noun;
						} else if(isAdjective(wordWithTag)) {
							color = self.color_adjective;
						} else if(isVerb(wordWithTag)) {
							color = self.color_verb;
						}
						
						textareastring += "<font color=" + color + ">";
						textareastring += wordWithTag[0] + " ";
						textareastring += "</font>";
						
					}
					textareastring += "<p />";
				}

				element.html(ccm.helper.html(textareastring));
				
			});
			if(callback) callback();
		}
		
		var isNoun = function(wordWithTag) {
			return wordWithTag[1].match(/\b(NN|NNS|NNP|NNPS)\b/g) != null;
		}

		var isAdjective = function(wordWithTag) {
			return wordWithTag[1].match(/\b(JJ|JJR|JJS)\b/g) != null;
		}

		var isVerb = function(wordWithTag) {		
			return wordWithTag[1].match(/\b(VB|VBP|VBZ|VBG|VBN)\b/g) != null;
		}
		
	}
  
});
