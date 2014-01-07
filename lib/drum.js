(function($) {
	"use strict";

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

		this.angle = settings.theta * index;
		this.elem = document.createElement('figure');
		$(this.elem).addClass('a' + this.angle);
		$(this.elem).css('opacity', '0.5');
		$(this.elem).css(
			settings.transformProp, 
			settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + settings.radius + 'px)'
		);

		this.setText = function () {
			$(this.elem).text(this.dataModel.getText());
		}

		this.setText();

		this.update = function (data_index) {
			if (this.dataModel.index != data_index) {
				this.dataModel.index = data_index;
				this.setText();
			}
		}
	}

	var Drum = function(element, options)
   	{
		var elem = ($(element))[0];
		var obj = this;

		var settings = $.extend({
			panelCount : 24,
			rotateFn : 'rotateX',
			transformProp: 'WebkitTransform',
			width: 100
		}, options || {});

		settings.rotation = 0;
		settings.distance = 0;
		settings.last_angle = 0;
		settings.theta = 360 / settings.panelCount;

		settings.data = [];
		for (var i=0; i<elem.children.length; i++) {
			settings.data.push($(elem.children[i]).text());
		}

		$(element).hide();

		var wrapper = document.createElement( "div" );
		$(wrapper).addClass("drum-wrapper");
		$(wrapper).width(settings.width);
		$(elem).after(wrapper);

		var container = document.createElement( "div" );
		$(container).addClass("container");

		var drum = document.createElement( "div" );
		$(drum).addClass("drum");
		$(drum).appendTo(container);

		$(container).appendTo(wrapper);

		settings.radius = Math.round( ( $(drum).height() / 2 ) / Math.tan( Math.PI / settings.panelCount ) );
		settings.mapping = [];
		var c = 0;
		for (var i=0; i < settings.panelCount; i++) {
			if (settings.data.length == i) 
				break;
			var j = c;
			if (c >= (settings.panelCount / 2)) {
				j = settings.data.length - (settings.panelCount - c);
			}
			c++;

			var panel = new PanelModel(i, j, settings);
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
				if (deg > 0)
					return l;
				else
					return 0;
			}
			return angle;
		};

		var getSelected = function () {
			var nearest = getNearest();    	
			for (var i in settings.mapping) {
				if (settings.mapping[i].angle == nearest) {
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
				$(selected.elem).css("opacity", 1);
				$("figure:not(.a" + selected.angle + ", .hidden)", drum).css("opacity", "0.5");
				if (selected.angle != settings.last_angle && [0,90,180,270].indexOf(selected.angle) >= 0) {
					settings.last_angle = selected.angle;
					update(selected);
				}
			}			
		};
		transform();

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
			var selected = getSelected().dataModel;
			elem.selectedIndex = selected.index;
		});

		$(element).data('settings', settings);
	};

	$.fn.drum = function(options)
	{
		return this.each(function()
		{
			var element = $(this);
			if (element.data('drum')) return;

			var drum = new Drum(this, options);
			element.data('drum', drum);
		});
	};
})(jQuery);