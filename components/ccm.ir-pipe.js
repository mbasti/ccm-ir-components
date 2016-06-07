/**
 * @overview pipe for ccm-ir-components
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'ir-pipe',

	config: {
		jquery_ui_js	: [ccm.load, 'https://code.jquery.com/ui/1.11.4/jquery-ui.min.js'],
		jquery_ui_css	: [ccm.load, 'https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css'],
		html			: [ccm.store, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/json/bookmarklet_html.json'],
		style			: [ccm.load, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/css/ir-pipe.css'],
		store 			: [ccm.store, 'http://home.inf.fh-bonn-rhein-sieg.de/~bmager2s/json/components.json'],
		store_dataset 	: 'default',
		init_src_key 	: 'content'
	},
	  
	Instance: function () {
		
		var self = this;
		
		// used by ui
		var components;
		var prevSelectedComponent;
	
		// used by components in pipe
		var selectedComponents;
		var contentStore = ccm.store();	
		var rendercount = 0;
		
		this.render = function(callback) {
			
			var main = this.html.get('main');
			var element = ccm.helper.element(this);
			var availableComponents = main.inner[0].inner;
			
			this.store.get(self.store_dataset, function(data) {
				self.components = data;
				
				var componentNames = Object.keys(self.components);
				for(var componentName of componentNames) {
					var component_html = self.html.get('component');		
					component_html.value = componentName;
					component_html.inner = componentName;
					availableComponents.push(component_html);
				}
			
				element.html(ccm.helper.html(main.inner));
						
				$("#availableComponents").sortable({
					scrollSensitivity: 15,
					connectWith: "#selectedComponents"
				});

				$("#selectedComponents").sortable({
					scrollSensitivity: 15,
					connectWith: "#availableComponents"
				});

				$(".component").hover(
				
					// hover over component
					function() {
						updateComponentColorSelected(this);
						updateDescription(this);
					},
					
					// hover away from component
					function() {
						if(this != prevSelectedComponent) {
							updateComponentColorUnselected(this);
							if(prevSelectedComponent) {
								updateDescription(prevSelectedComponent);
							}
						}
					}
				);

				$(".component").mousedown(function() {
					if(this != prevSelectedComponent) {
						updateDescription(this);
						// hover will update the color for 'this'
						updateComponentColorUnselected(prevSelectedComponent);
						prevSelectedComponent = this;
					}
				});

				$("#render").click(function() {
					selectedComponents = [];
					var selection = document.getSelection();
					console.log(selection);
					if(selection.focusNode != null && selection.anchorNode != null) {
						
						var text = selection.focusNode.textContent.slice(selection.anchorOffset, selection.focusOffset);
						
						// reset result div
						$("#ir-pipe-result").html("");

						var prev_src_key = self.init_src_key;
						$("#selectedComponents li").each(function() {
							var componentName = $(this).attr('value');
							var component = ccm.helper.clone(self.components[componentName]);
							component.config.store = contentStore;
							component.config.store_dataset = self.store_dataset;
							component.config.store_src_key = prev_src_key;
							component.config.store_dst_key = componentName;
							prev_src_key = componentName;
							selectedComponents.push(component);
						});
					
						if(selectedComponents.length > 0) {
							
							// configure that last component should actually render
							selectedComponents[selectedComponents.length-1].config.render_element = $('#ir-pipe-result');
							
							var storable = new Object();
							storable[self.init_src_key] = [text];
							storable['key'] = self.store_dataset;
							
							contentStore.set(storable, function() {
								
								// render first component
								rendercount = 0;
								ccm.render(
									selectedComponents[0].path,
									selectedComponents[0].config,
									renderNext
								);	
								
							});
						}
						
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
			$(component).css("background" , "#F2F2F2");
		}
		
		var updateComponentColorUnselected = function(component) {
			$(component).css("background" , "#c0d6e4");
		}
		
		var renderNext = function() {
			rendercount++;
			if(rendercount < selectedComponents.length) {
				ccm.render(
					selectedComponents[rendercount].path,
					selectedComponents[rendercount].config,
					renderNext
				);
			}
		}
		
	}
  
});
