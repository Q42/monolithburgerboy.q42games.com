/// <reference path="utils.js" />
var avatar = {
  x: 100,
  y: 100,
  destX: 0,
  destY: 0,
  stepX: 6,
  stepY: 4,
  offsetX: 0,
  offsetY: 0,
  skin: 'roger',
  direction: 'right',
  frames: {
    'right': 8,
    'left': 8,
    'down': 4,
    'up': 4,
  },
  frame: 0,
  obj: null,
  walking: false,
  init: function (x, y) {
    this.obj = $('#avatar');
    this.x = this.destX = x, this.y = this.destY = y;
    this.offsetX = -this.obj.width() / 2;
    this.offsetY = -this.obj.height();
    this.obj.addClass(this.skin);
    this.obj.addClass(this.direction + this.frame);
    this.redraw();
    return this;
  },
  show: function () {
    this.obj.removeClass('hidden');
    return this;
  },
  hide: function () {
    this.obj.addClass('hidden');
    return this;
  },
  redraw: function () {
    this.obj.css({ 'left': this.x + this.offsetX, 'top': this.y + this.offsetY, 'z-index': this.y });
    this.obj.toggleClass('touch');
    return this;
  },
  walkto: function (x, y) {
    this.destX = x, this.destY = y;
    this.walking = true;
  },
  cycle: function () {
    if (!this.walking) return;

    this.obj.removeClass(this.direction + this.frame);
    var curX = this.x, curY = this.y;

    if (this.y < this.destY) {
      this.y = Math.min(this.y + this.stepY, this.destY);
      this.direction = 'down';
    }
    
    if (this.y > this.destY) {
      this.y = Math.max(this.y - this.stepY, this.destY);
      this.direction = 'up';
    }
    var allowY = allowPosition(this.x, this.y);
    if (!allowY) this.y = curY;

    if (this.x < this.destX) {
      this.x = Math.min(this.x + this.stepX, this.destX);
      this.direction = 'right';
    }
    if (this.x > this.destX) {
      this.x = Math.max(this.x - this.stepX, this.destX);
      this.direction = 'left';
    }
    var allowX = allowPosition(this.x, this.y);
    if (!allowX) this.x = curX;

    // not moved? set direction to current position
    if (this.x == curX && this.y == curY) {
      this.destX = this.x;
      this.destY = this.y;
      this.walking = false;
      finishedWalking();
    }

    this.frame = ++this.frame % this.frames[this.direction];
    this.obj.addClass(this.direction + this.frame);
    this.redraw();
  }
}