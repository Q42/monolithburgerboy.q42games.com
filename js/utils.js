function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getXY(event) {
  var xyInfo = event;
  var touches = event.originalEvent.touches;
  if (touches) xyInfo = touches[0];
  x = xyInfo.pageX - screenOffsetLeft, y = xyInfo.pageY - screenOffsetTop;
}

function colorToRgb(color) {
  if (!isNaN(color))
    color = PALETTE[color];
  return hexToRgb(color);
}

function colorsMatch(c1, c2) {
  if (c1.r != c2.r) return false;
  if (c1.g != c2.g) return false;
  if (c1.b != c2.b) return false;
  return true;
}

$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
$.browser.android = /android/.test(navigator.userAgent.toLowerCase());
$.browser.ios = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());

if ($.browser.ios) $('html').addClass('ios');
if ($.browser.chrome) $('html').addClass('chrome');
if ($.browser.android) $('html').addClass('android');

window.requestAnimFrame = (function () {
  return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function (callback, element) {
		  window.setTimeout(function () {
		    callback(+new Date);
		  }, 10);
		};
})();

var Drawing = {
  crossingsForLine: function (x, y, x1, y1, x2, y2) {
    if (y1 > y2) return 0 - this.crossingsForLine(x, y, x2, y2, x1, y1);
    if (y1 == y2) return 0;
    if (y < y1 || y >= y2) return 0;
    if (x >= x1 && x >= x2) return 0;
    var t = (y - y1) / (y2 - y1);
    return ((x < x1 + t * (x2 - x1)) ? 1 : 0);
  },
  inPolygon: function (x, y, polygon) {
    // auto close the polygon by detecting if the last point is the same as the first. If not, add it   
    var firstPoint = { 'x': polygon[0], 'y': polygon[1] };
    var lastPoint = { 'x': polygon[polygon.length - 2], 'y': polygon[polygon.length - 1] };
    if (firstPoint.x != lastPoint.x || firstPoint.y != lastPoint.y)
      polygon.push(firstPoint.x, firstPoint.y);
    var result = 0;
    for (var p = 0; p < polygon.length; p += 2) {
      var x1 = polygon[p + 0];
      var y1 = polygon[p + 1];
      var x2 = polygon[p + 2];
      var y2 = polygon[p + 3];
      result += this.crossingsForLine(x, y, x1, y1, x2, y2);
    }
    return ((result & 1) == 1);
  },
  inAnyPolygon: function (x, y) {
    for (var i = 0; i < this.polygons.length; i++) {
      var polygon = this.polygons[i];
      try {
        if (polygon.inactive) {
          if (eval(polygon.inactive)) continue;
        }
      } catch (e) { }
      if (this.inPolygon(x, y, polygon.coords)) return polygon;
    }
    return false;
  }
};