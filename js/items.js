var items = {
  c: 0,
  cycle: function () {
    this.c++;
    if (this.c % 7 == 0)
      this.cycleKeycard();
  },
  cycleKeycard: function (frame) {
    var el = $('#screen1 .tablet');
    var curFrame = el.attr('data-frame') * 1;
    if (isNaN(curFrame)) curFrame = -1;
    var maxFrames = el.attr('data-frames') * 1;
    el.removeClass('frame' + curFrame);
    curFrame = ++curFrame % maxFrames;
    el.attr('data-frame', curFrame).addClass('frame' + curFrame);
  }
}