/**
 * @overview renders a generated summary of text
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'summary',

	config: {
		filtercount : 10,
		store : [ccm.store, {local : './json/textcorpus.json'} ],
		
		postagger_component : [
			ccm.instance, './components/ccm.postagger.js', 
			{dataset: 'demo', sourcekey : 'content', destkey : 'taggedcontent',
			store : [ ccm.store, './json/textcorpus.json' ]}
		],
		
		tfidf_component : [
			ccm.instance, './components/ccm.tfidf.js',
			{dataset: 'demo', sourcekey : 'taggedcontent', destkey : 'tfidf',
			store : [ ccm.store, './json/textcorpus.json' ]}
		],
			
		ranking_component : [
			ccm.instance, './components/ccm.pagerank.js',
			{dataset: 'demo', sourcekey : 'cooccurrences', destkey : 'keywords',
			store : [ ccm.store, './json/textcorpus.json' ]}
		]
	},
	  
	Instance: function () {
		
		var self = this;
	
		var content = [
			"The noisy miner (Manorina melanocephala) is a bird in the honeyeater family, Meliphagidae, and is endemic to eastern and south-eastern Australia. This miner is a grey bird, with a black head, orange-yellow beak and feet, a distinctive yellow patch behind the eye and white tips on the tail feathers. The Tasmanian race has a more intense yellow panel in the wing, and a broader white tip to the tail. Males, females and juveniles are similar in appearance, though young birds are a brownish-grey. As the common name suggests, the noisy miner is a vocal species with a large range of songs, calls, scoldings and alarms, and almost constant vocalizations particularly from young birds. One of four species in the genus Manorina, the noisy miner itself is divided into four subspecies. The separation of the Tasmanian M. m. leachi is of long standing, and the mainland birds were further split in 1999.",
			"Found in a broad arc from Far North Queensland through New South Wales and Victoria to Tasmania and eastern South Australia, the noisy miner primarily inhabits dry, open eucalypt forests that lack understory shrubs. These include forests dominated by spotted gum, box and ironbark, as well as in degraded woodland where the understory has been cleared, such as recently burned areas, farming and grazing areas, roadside reserves, and suburban parks and gardens with trees and grass but without dense shrubbery. The density of noisy miner populations has significantly increased in many locations across its range, particularly human-dominated habitats. While the popularity of nectar-producing garden plants such as the large-flowered grevilleas was thought to play a role in its proliferation, studies now show that the noisy miner has benefitted primarily from landscaping practices that create open areas dominated by eucalypts.",
			"noisy miners are gregarious and territorial; they forage, bathe, roost, breed and defend territory communally, forming colonies that can contain several hundred birds. Each bird has an 'activity space' and birds with overlapping activity spaces form associations called 'coteries', the most stable units within the colony. The birds also form temporary flocks called 'coalitions' for specific activities such as mobbing a predator. Group cohesion is facilitated not only by vocalizations, but also through ritualised displays which have been categorised as flight displays, postural displays, and facial displays. The noisy miner is a notably aggressive bird, and chasing, pecking, fighting, scolding, and mobbing occur throughout the day, targeted at both intruders and colony members.",
			"Foraging in the canopy of trees and on trunks and branches and on the ground, the noisy miner mainly eats nectar, fruit and insects. Most time is spent gleaning the foliage of eucalypts, and it can meet most of its nutritional needs from manna, honeydew and lerp gathered from the foliage. The noisy miner does not use a stereotyped courtship display, but copulation is a frenzied communal event. It breeds all year long, building a deep cup-shaped nest and laying two to four eggs. Incubation is by the female only, although up to twenty male helpers take care of the nestlings and fledglings. Noisy miners have a range of strategies to increase their breeding success including multiple broods and group mobbing of predators. The noisy miner's population increase has been correlated with the reduction of avian diversity in human-affected landscapes. Its territoriality means that translocation is unlikely to be a solution to its overabundance, and culling has been proposed, although the noisy miner is currently a protected species across Australia.",
			"The noisy miner is one of four species in the genus Manorina in the large family of honeyeaters known as Meliphagidae, the other three being the black-eared miner (M. melanotis), the yellow-throated miner (M. flavigula), and the bell miner (M. melanophrys). One of the most obvious characteristics of the genus is a patch of bare yellow skin behind the eyes, which gives them an odd 'cross-eyed' look. Within the genus, the noisy, black-eared and yellow-throated miners form the subgenus Myzantha.[11] The noisy miner occasionally hybridizes with the yellow-throated miner.[12] Molecular analysis has shown honeyeaters to be related to the Pardalotidae (pardalotes), Acanthizidae (Australian warblers, scrubwrens, thornbills, etc.), and the Maluridae (Australian fairy-wrens) in a large Meliphagoidea superfamily.[13]"
		]
	
		this.render = function (callback) {
			
			this.store.set({key : 'demo', 'content' : content});
			
			// tag content with pos tags
			self.postagger_component.setTaggedContentInStore(function() {

				// create cooccurrence/adjacency matrix
				self.tfidf_component.setAdjacencyMatrixInStore(function() {
					
					// create ranks
					self.ranking_component.setRanksInStore(function() {
						
						// filter ranks according to filtercount
						self.store.get('demo', function(dataset) {
						
							var ranks = dataset.keywords;
							
						});
					});
				});				
			});

			if (callback) callback();
		}
		
	}
  
});
