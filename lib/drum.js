(function($) {
	"use strict";

	var DrumIcon = new function () {
		var width = 20;
		var height = 5;

		var svgelem = function (tagName) {
			return document.createElementNS("http://www.w3.org/2000/svg", tagName);
		}
		var svgcanvas = function () {
			var svg = $(svgelem("svg"));
			$(svg).attr("width", width);
			$(svg).attr("height", height);

			var g = $(svgelem("g"));
			$(svg).append(g);

			return svg;				
		}
		var container = function (className) {
			var container = document.createElement("div");
			$(container).attr("class", className);
			var inner = document.createElement("div");
			$(container).append(inner);
			return container;
		}
		return {
			up : function () {
				var svg = svgcanvas();

				var l1 = $(svgelem("line"));
				$(l1).attr("stroke", "#999999");
				$(l1).attr("fill", "none");
				$(l1).attr("x1", "0");
				$(l1).attr("x2", width/2);
				$(l1).attr("y1", height*0.9);
				$(l1).attr("y2", "0");
				$(svg).find("g").append(l1);

				var l2 = $(svgelem("line"));
				$(l2).attr("stroke", "#999999");
				$(l2).attr("fill", "none");
				$(l2).attr("x1", width/2);
				$(l2).attr("x2", width);
				$(l2).attr("y1", "0");
				$(l2).attr("y2", height*0.9);
				$(svg).find("g").append(l2);

				var cont = container("dial up");
				$(cont).find("div").append(svg);
				return cont;				
			},
			down : function () {
				var svg = svgcanvas();

				var l1 = $(svgelem("line"));
				$(l1).attr("stroke", "#999999");
				$(l1).attr("fill", "none");
				$(l1).attr("x1", "0");
				$(l1).attr("x2", width/2);
				$(l1).attr("y1", "0");
				$(l1).attr("y2", height*0.9);
				$(svg).find("g").append(l1);

				var l2 = $(svgelem("line"));
				$(l2).attr("stroke", "#999999");
				$(l2).attr("fill", "none");
				$(l2).attr("x1", width/2);
				$(l2).attr("x2", width);
				$(l2).attr("y1", height*0.9);
				$(l2).attr("y2", "0");
				$(svg).find("g").append(l2);

				var cont = container("dial down");
				$(cont).find("div").append(svg);
				return cont;
			}
		}
	}

	var PanelModel = function (index, data_index, settings) 
	{
		this.index = index;
		this.dataModel = new (function (data, i) {
			this.data = data;
			this.index = i;
			this.getText = function () {
				return this.data[this.index];
			}
		})(settings.data, data_index);

		this.init = function () {
			this.angle = settings.theta * index;
			this.elem = document.createElement('figure');
			$(this.elem).addClass('a' + this.angle);
			$(this.elem).css('opacity', '0.5');
			$(this.elem).css(
				settings.transformProp, 
				settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + settings.radius + 'px)'
			);
			this.setText();
		}

		this.setText = function () {
			$(this.elem).text(this.dataModel.getText());
		}

		this.update = function (data_index) {
			if (this.dataModel.index != data_index) {
				this.dataModel.index = data_index;
				this.setText();
			}
		}
	}

	var Drum = function(element, options)
   	{
		var HTMLselect = ($(element))[0];
		var obj = this;

		var settings = $.extend({
			panelCount : 24,
			rotateFn : 'rotateX',
			transformProp: 'WebkitTransform',
			className: ''
		}, options || {});

		settings.rotation = 0;
		settings.distance = 0;
		settings.last_angle = 0;
		settings.theta = 360 / settings.panelCount;

		settings.initselect = HTMLselect.selectedIndex;

		settings.data = [];
		for (var i=0; i<HTMLselect.children.length; i++) {
			settings.data.push($(HTMLselect.children[i]).text());
		}

		$(element).hide();

		var wrapper = document.createElement( "div" );
		$(wrapper).addClass("drum-wrapper");
		
		if (settings.id)
			$(wrapper).attr('id', settings.id);
		else if (HTMLselect.id)
			$(wrapper).attr('id', 'drum_' + HTMLselect.id);
		else if ($(HTMLselect).attr('name'))
			$(wrapper).attr('id', 'drum_' + $(HTMLselect).attr('name'));			
		
		if (settings.className) 
			$(wrapper).addClass(settings.className);
		
		if (settings.width)
			$(wrapper).width(settings.width);

		$(HTMLselect).after(wrapper);

		var container = document.createElement( "div" );
		$(container).addClass("container");

		var drum = document.createElement( "div" );
		$(drum).addClass("drum");
		$(drum).appendTo(container);

		$(container).appendTo(wrapper);

		var dialUp = DrumIcon.up();
		$(wrapper).append(dialUp);

		var dialDown = DrumIcon.down();
		$(wrapper).append(dialDown);

		$(wrapper).hover(function () {
			$(this).find(".up").show();
			$(this).find(".down").show();
		}, function () {
			$(this).find(".up").hide();
			$(this).find(".down").hide();
		});

		settings.radius = Math.round( ( $(drum).height() / 2 ) / Math.tan( Math.PI / settings.panelCount ) );
		settings.mapping = [];
		var c = 0;
		for (var i=0; i < settings.panelCount; i++) {
			if (settings.data.length == i) break;
			var j = c;
			if (c >= (settings.panelCount / 2)) {
				j = settings.data.length - (settings.panelCount - c);
			}
			c++;

			var panel = new PanelModel(i, j, settings);
			panel.init();
			settings.mapping.push(panel);

			$(drum).append(panel.elem);
		}

		var getNearest = function (deg) {
			deg = deg || settings.rotation;
			var th = (settings.theta / 2);
			var n = 360;
			var angle = ((deg + th) % n + n) % n;
			angle = angle - angle % settings.theta;
			var l = (settings.data.length - 1) * settings.theta;
			if (angle > l) {
				if (deg > 0) return l;
				else return 0;
			}
			return angle;
		};

		var getSelected = function () {
			var nearest = getNearest();    	
			for (var i in settings.mapping) {
				if (settings.mapping[i].angle == nearest) {
					//console.log({i:i, j:settings.mapping[i].dataModel.index, val: settings.mapping[i].dataModel.getText()});
					return settings.mapping[i];
					break;
				}
			}
		};

		var update = function (selected) {
			var c, list = [], pc = settings.panelCount, ph = settings.panelCount / 2, l = settings.data.length;
			var i = selected.index; 
			var j = selected.dataModel.index;
			for (var k=j-ph; k<=j+ph-1; k++) {
				c = k;
				if (k < 0) c = l+k;
				if (k > l-1) c = k-l;
				list.push(c);
			}
			var t = list.slice(ph-i); 
			list = t.concat(list.slice(0, pc - t.length));
			for (var i=0; i<settings.mapping.length; i++) {
				settings.mapping[i].update(list[i]);
			}
		}

		var transform = function() {
			$(drum).css(settings.transformProp, 'translateZ(-' + settings.radius + 'px) ' + settings.rotateFn + '(' + settings.rotation + 'deg)');

			var selected = getSelected();
			if (selected) {
				var data = selected.dataModel;
				
				var last_index = HTMLselect.selectedIndex;
				HTMLselect.selectedIndex = data.index;

				if (last_index != data.index && settings.onChange) 
					settings.onChange(HTMLselect);

				$(selected.elem).css("opacity", 1);
				$("figure:not(.a" + selected.angle + ", .hidden)", drum).css("opacity", "0.5");
				if (selected.angle != settings.last_angle && [0,90,180,270].indexOf(selected.angle) >= 0) {
					settings.last_angle = selected.angle;
					update(selected);
				}
			}			
		};

		this.setIndex = function (dataindex) {
			var page = Math.floor(dataindex / settings.panelCount);
			var index = dataindex - (page * settings.panelCount);
			var selected = new PanelModel(index, dataindex, settings);
			update(selected);
			settings.rotation = index * settings.theta;
			transform();
		};

		this.setIndex(settings.initselect);

		this.getIndex = function () {
			return getSelected().dataModel.index;
		};

		settings.touch = Hammer(wrapper, {
			prevent_default: true,
			no_mouseevents: true
		});
		
		settings.touch.on("dragstart", function (e) { 
			settings.distance = 0;
		});

		settings.touch.on("drag", function (e) {
			var evt = ["up", "down"];
			if (evt.indexOf(e.gesture.direction)>=0) {
				settings.rotation += Math.round(e.gesture.deltaY - settings.distance) * -1;
				transform();
				settings.distance = e.gesture.deltaY;
			}
		});

		settings.touch.on("dragend", function (e) {
			settings.rotation = getNearest();
			transform();
		});

		$(dialUp).click(function (e) {
			var deg = settings.rotation + settings.theta + 1;
			settings.rotation = getNearest(deg);
			transform();
		});
		$(dialDown).click(function (e) {
			var deg = settings.rotation - settings.theta - 1;
			settings.rotation = getNearest(deg);
			transform();
		});

		$(HTMLselect).data('settings', settings);
	};

	var methods = {
		getIndex : function () {
			return $(this).data('drum').getIndex();
		},
		setIndex : function (index) {
			$(this).data('drum').setIndex(index);
		},
		init : function (options) {
			var element = $(this);
			if (!element.data('drum')) {
				var drum = new Drum(element, options);
				element.data('drum', drum);
			}
		}
    };

	$.fn.drum = function(methodOrOptions)
	{
		var _arguments = arguments;
		return this.each(function() {
			if ( methods[methodOrOptions] ) {
				return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( _arguments, 1 ));
			} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
				return methods.init.apply( this, _arguments );
			} else {
				$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.drum' );
			}    		
		});
	};
})(jQuery);