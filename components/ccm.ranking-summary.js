/**
 * @overview ccm-component which renders a generated summary of text
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'ranking-summary',

	config: {
		store 				: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.textcorpus.json'],
		store_dataset		: 'demo',
		store_corpus_key	: 'demo',
		store_ranking_key	: 'demo',
		store_dst_key		: 'demo',
		compress_factor		: 0.2
	},
	  
	Instance: function () {
		
		var self = this;
		
		this.render = function (callback) {
	
			this.store.get(this.store_dataset, function(data) {
				
				var corpus = data[self.store_corpus_key];
				var ranks = data[self.store_ranking_key];
				var summary_size = corpus.length*self.compress_factor;
				if(summary_size < 1) summary_size = 1;
				
				ranks = Object.keys(ranks);
				
				// sort by ranking
				ranks.sort(function(a,b) {
					return ranks[a] <= ranks[b];
				});
				
				// select
				ranks = ranks.slice(0,summary_size);
				
				// sort by appearance
				ranks = ranks.sort(function(a, b) {
					return a - b;
				});

				// generate summary
				var summary = "";
				for(var rank of ranks) {
					summary += corpus[rank] + " ";
				}
				
				// render tagged data
				if(self.render_element) {
					self.render_element.html(ccm.helper.html(summary));
				}
				
				// store sentences
				var storable = new Object();
				storable['key'] = self.store_dataset;
				storable[self.store_dst_key] = summary;
				self.store.set(storable, callback);
			});

		}
		
	}
  
});
