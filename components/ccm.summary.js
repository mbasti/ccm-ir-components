/**
 * @overview ccm-component which renders a generated summary of text
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'summary',

	config: {
		store 			: [ccm.store, './json/textcorpus.json'],
		store_dataset	: 'demo',
		store_src_key	: 'demo',
		store_dst_key	: 'demo'
	},
	  
	Instance: function () {
		
		var self = this;
	
		this.render = function (callback) {
			if (callback) callback();
		}
		
	}
  
});
