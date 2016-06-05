/**
 * @overview pipe for ccm-ir-components
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'ir-pipe',

	config: {
		jquery_ui_js:[ccm.load,"https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"],
		jquery_ui_css:[ccm.load,"https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"],
		html			: [ccm.store, { local: './json/bookmarklet_html.json'}],
		style			: [ccm.load, './css/ir-pipe.css'],
		store 			: [ccm.store, './json/components.json'],
		store_dataset 	: 'demo',
		store_src_key 	: 'demo',
		store_dst_key	: 'demo'
	},
	  
	Instance: function () {
		
		var self = this;
		var rendercount = 0;
		var selectedComponents = [];
		var components;
		var color_red = '#ff6061';
		var color_green = '#006639';
		var color_blue = '#0089b7';

		var storyStore = ccm.store();
		
		this.init = function(callback) {
			if(callback) callback();
		}

		this.render = function(callback) {
			
			var element = ccm.helper.element(this);
			var main = this.html.get('main');
			
			var availableComponents = main.inner[0].inner;
			
			var oldSelectedComponent;
			
			this.store.get("components", function(data) {
				self.components = data;
				
				var componentNames = Object.keys(self.components);
				for(var component of componentNames) {
					var component_html = self.html.get('component');		
					component_html.value = component;
					component_html.inner = component.toString();
					availableComponents.push(component_html);
				}
					
				element.html(ccm.helper.html(main));
								
				$("#availableComponents").sortable({
					scrollSensitivity: 10,
					forceHelperSize: true,
					connectWith: "#selectedComponents"
				});

				$("#selectedComponents").sortable({
					 scrollSensitivity: 10,
					 forceHelperSize: true,
					connectWith: "#availableComponents"
				});

				$(".component").hover(
				
					// hover
					function() {
						updateComponentColorSelected(this);
						updateDescription(this);
					},
					
					// hover away
					function() {
						if(this != oldSelectedComponent) {
							updateComponentColorUnselected(this);
							updateDescription(oldSelectedComponent);
						}
					}
				);

				$(".component").mousedown(function() {
					if(this != oldSelectedComponent) {
						updateDescription(this);
						// hover will update the color for 'this'
						updateComponentColorUnselected(oldSelectedComponent);
						oldSelectedComponent = this;
					}
				});

				$("#ccm-render-button").click(function() {
					var anchorOffset = document.getSelection().anchorOffset;
					var focusOffset = document.getSelection().focusOffset;
					var text = document.getSelection().focusNode.textContent.slice(anchorOffset, focusOffset);
					storyStore.set({key : selectedStory, "content" : [text]});
					
					var old_src_key = "content";
					$("#usedComponents li").each(function() {
						var name = $(this).attr('value');
						var component = self.components[name];
						component.config.store_src_key = old_src_key;
						component.config.store_dst_key = name;
						old_src_key = name;
						selectedComponents.push(component);
					});
					
					if(selectedComponents.length > 0) {
						selectedComponents[selectedComponents.length-1].config.render_element = $('#ccm-result');
						ccm.render(selectedComponents[0]['path'],selectedComponents[0]['config'], renderNext);
					}
				});	
				
			});
			
		}
		
		// ===================== PRIVATE FUNCTIONS =====================
		
		var updateDescription = function(jquerySelector) {
			var selectedComponent = self.components[$(jquerySelector).attr("value")];
			$("#descPath").html(selectedComponent.path);
			$("#descExpects").html(selectedComponent.expects);
			$("#descResult").html(selectedComponent.result);
		}
		
		var updateComponentColorSelected = function(component) {
			$(component).animate({backgroundColor: "#F2F2F2"},100);
		}
		
		var updateComponentColorUnselected = function(component) {
			$(component).animate({backgroundColor: "#81BEF7"},100);
		}
		
		var renderNext = function() {
			rendercount++;
			if(rendercount < selectedComponents.length) {
				ccm.render(selectedComponents[rendercount]['path'],selectedComponents[rendercount]['config'],renderNext);
			}
		}
		
	}
  
});
