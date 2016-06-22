/**
 * @overview pipe for ccm-ir-components
 * @author Bastian Mager <bastian.mager@smail.inf.h-brs.de> 2016
 */
ccm.component( {
  
	name: 'ir-pipe',

	config: {
		jquery_ui_js	: [ccm.load, 'https://code.jquery.com/ui/1.11.4/jquery-ui.min.js'],
		jquery_ui_css	: [ccm.load, 'https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css'],
		html_template	: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.ir-pipe_html.json'],
		style			: [ccm.load, 'https://mbasti.github.io/ccm-ir-components/css/ccm.ir-pipe.css'],
		store 			: [ccm.store, 'https://mbasti.github.io/ccm-ir-components/json/ccm.ir-components.json'],
		store_dataset 	: 'default',
		init_src_key 	: 'raw text'
	},
	  
	Instance: function () {
		
		var selectorRenderButton = "#ccm-ir-pipe-render-button";
		var selectorAvailableList = "#ccm-ir-pipe-availableComponents";
		var selectorSelectedList = "#ccm-ir-pipe-selectedComponents";
		var selectorAllComponents = ".ccm-ir-pipe-component";
		var selectorSelectedComponents = "#ccm-ir-pipe-selectedComponents li";
		var selectorDescResult = "#ccm-ir-pipe-descResult";
		var selectorDescExpects = "#ccm-ir-pipe-descExpects";
		var selectorDescPath = "#ccm-ir-pipe-descPath";
		var selectorPipeResult = "#ccm-ir-pipe-result";
		var selectorConfig = "#ccm-ir-pipe-config";
		var colorSelected = "#F2F2F2";
		var colorUnSelected = "#c0d6e4";
		
		var self = this;
		
		// used by ui
		var components;
		var prevSelectedComponent;
	
		// used by components in pipe
		var selectedComponents;
		var contentStore = ccm.store();	
		var rendercount = 0;
		var startTime;
		
		this.render = function(callback) {
			
			var main = this.html_template.get('main');
			var element = ccm.helper.element(this);
			var availableComponents = main.inner[0].inner[1].inner;
			
			this.store.get(self.store_dataset, function(data) {
				self.components = data;
				
				var componentNames = Object.keys(self.components);
				for(var componentName of componentNames) {
					var component_html = self.html_template.get('component');		
					component_html.value = componentName;
					component_html.inner = componentName;
					availableComponents.push(component_html);
				}
			
				element.html(ccm.helper.html(main.inner));
						
				$(selectorAvailableList).sortable({
					scrollSensitivity: 20,
					connectWith: selectorSelectedList
				});

				$(selectorSelectedList).sortable({
					scrollSensitivity: 20,
					connectWith: selectorAvailableList
				});

				$(selectorAllComponents).hover(
				
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
								//saveConfig(prevSelectedComponent);
							}
						}
					}
				);

				$(selectorAllComponents).mousedown(function() {
					if(this != prevSelectedComponent) {
						if(prevSelectedComponent) {
							updateComponentColorUnselected(prevSelectedComponent);
							saveConfig(prevSelectedComponent);
						}
						updateDescription(this);
						updateConfig(this);
						// hover will update the color for 'this'
						prevSelectedComponent = this;
					}
				});

				$(selectorRenderButton).click(function() {
					
					$(this).prop('disabled',true);
					
					// save selected componente config, which will normally
					// saved by hoover actions..
					if(prevSelectedComponent) {
						saveConfig(prevSelectedComponent);
					}
				
					selectedComponents = [];
					var selection = document.getSelection();
					
					if(selection != null && selection.toString().length > 0) {
						
						var text = selection.toString();
						
						// reset result div
						$(selectorPipeResult).html("");

						var prev_src_key = self.init_src_key;
						$(selectorSelectedComponents).each(function() {
							var componentName = $(this).attr('value');
							var component = ccm.helper.clone(self.components[componentName]);
							component.config.store = contentStore;
							component.config.store_dataset = self.store_dataset;
							prev_src_key = componentName;
							selectedComponents.push(component);
						});
					
						if(selectedComponents.length > 0) {
							
							// save start time
							startTime = new Date().getTime();
							
							// configure that last component should actually render
							selectedComponents[selectedComponents.length-1].config.render_element = $(selectorPipeResult);
							
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
						} else {
							$(selectorRenderButton).prop('disabled',false);
						}
						
					} else {
						$(selectorRenderButton).prop('disabled',false);
					}
					
				});	

				if(callback) callback();
				
			});
			
		}
		
		// ===================== PRIVATE FUNCTIONS =====================
		
		var updateDescription = function(jquerySelector) {
			var selectedComponent = self.components[$(jquerySelector).attr("value")];
			$(selectorDescPath).html(selectedComponent.path);
			$(selectorDescExpects).html(selectedComponent.expects);
			$(selectorDescResult).html(selectedComponent.result);
		}
		
		var updateConfig = function(jquerySelector) {
			var selectedComponent = self.components[$(jquerySelector).attr("value")];
			$(selectorConfig).val(JSON.stringify(selectedComponent.config));
		}
		
		var saveConfig = function(jquerySelector) {
			var selectedComponent = self.components[$(jquerySelector).attr("value")];
			var oldConfig = selectedComponent.config;
			
			try {
				selectedComponent.config = JSON.parse($(selectorConfig).val());
			} catch(err) {
				selectedComponent.config = oldConfig;
			} 
		}
		
		var updateComponentColorSelected = function(component) {
			$(component).css("background" , colorSelected);
		}
		
		var updateComponentColorUnselected = function(component) {
			$(component).css("background" , colorUnSelected);
		}
		
		var renderNext = function() {
			rendercount++;
			if(rendercount < selectedComponents.length) {
				ccm.render(
					selectedComponents[rendercount].path,
					selectedComponents[rendercount].config,
					renderNext
				);
			} else {
				var end = new Date().getTime();
				var time = end - startTime;
				console.log('ccm IR-Pipeline execution time: ' + time);
				$(selectorRenderButton).prop('disabled',false);
			}
		}
		
	}
  
});
