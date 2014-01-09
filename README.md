DrumJS
======

DrumJs is a jQuery plugin, which allows to replace a simple native HTMLselect Element with 3d cylinder as an alternate selector.

The user can, similar to the ios datepicker, select a value by rotating the cylinder vertically with the mouse or with touch gestures.

This plugin is based on HammerJS, a JavaScript library which provides a canonical treatment of touch gestures for different operating systems and a simulation for desktop browser with the mouse.

### Prerequisites

The plugin follows the progressive enhancement approach and works on an HTMLselect element as a data source. A selected item is stored and read from the selectedIndex value of the the Htmlselect element.

The enhancement to a drumjs widget is done by calling calling the plugin on a selected HTMLselect element:

 ```
<select>
  <option>A</option>
  <option>B</option>
  <option selected>C</option>
  <option>D</option>
  ...
  <option>Z</option>
</select>
<script>
$("select").drum();
</script>
```

### Thanx

Many thanks to David DeSandro for his extensive tutorial about 3d animations with css.

http://desandro.github.io/3dtransforms/