/// <reference path="utils.js" />
var x, y, screenOffsetLeft, screenOffsetTop, cycleMs = 40, shape = [], lastCycle = 0, destinationRegion = null, dialog = false, story = true;
var screens = { '1': {
  'boundaries': {
    'screen1-floor': { 'polygon': [652, 372, 751, 411, 751, 469, 810, 499, 924, 515, 994, 510, 993, 732, 714, 680, 704, 655, 492, 585, 403, 587, 300, 501, 311, 453, 390, 415, 455, 396, 526, 386, 593, 375, 651, 373] },
    'closet': { 'enabled': function () { return $('.door').hasClass('open') }, 'polygon': [789, 491, 820, 489, 857, 461, 907, 456, 894, 498, 917, 513, 904, 542, 777, 517] }
  },
  'regions': {
    'coat': { 'enabled': function () { return $('.door').hasClass('open') }, 'hotspot': [871, 459], 'distance': 5, 'polygon': [855, 373, 889, 378, 895, 437, 854, 433] },
    'door': { 'hotspot': [854, 507], 'distance': 10, 'polygon': [804, 343, 907, 356, 912, 507, 803, 492] },
    'tablet': { 'enabled': function () { return !has('tablet') }, 'hotspot': [599, 604], 'distance': 10, 'polygon': [548, 582, 578, 575, 631, 597, 590, 616] },
    'baydoor': { 'hotspot': [519, 386], 'distance': 10, 'polygon': [466, 278, 572, 275, 570, 372, 463, 386] },
    'getfood': { 'enabled': function () { return !has('food') && has('tablet') }, 'hotspot': [675, 416], 'distance': 4, 'polygon': [671, 318, 731, 320, 725, 363, 671, 367] }
  }
}, '2': {
  'boundaries': {
    'island': { 'polygon': [373, 387, 581, 316, 646, 323, 729, 313, 915, 382, 666, 406, 462, 400] },
  },
  'regions': {
  }
}
}
var screenNr = 1, debug = false;
var screen = screens[screenNr + ''];

$(function load() {
  sound.init();
  gotoScreen0();
  resize();
  $(window).bind('resize', resize);
  $('#game').bind($.browser.ios ? 'touchstart' : 'click', clickScreen)
  $('#game').bind('mousemove', mouseMoveScreen)
  $('#game').bind('mouseleave', mouseLeaveScreen)
  $('body').bind('keyup', keyupBody)
  cycle();
});

function showScreen(nr) {
  $('.screen').hide();
  $('#screen' + nr).show();
  screenNr = nr;
  screen = screens[screenNr + ''];
}

function intro() {
  doActions(
  function () {
    showDialog("As we begin our story, we find you, our sanitation hero Roger Wilco, hard at work at the local Monolith Burger, doing what you do best.");
  },
  function () {
    setTimeout(function () {
      showDialog("Taking a nap.");
    }, 2000)
  },
  function () {
    setTimeout(function () {
      showDialog("A nap which, as always, is cut short by the sound of an alarm.||Or in this case: an annoying beep. After making sure you hear no footsteps you decide to face the galaxy again with open eyes.");
    }, 2000)
  },
  function () {
    setTimeout(function () {
      $('.door').addClass('open');
    }, 1000);
    setTimeout(function () {
      avatar.walkto(840, 570);
    }, 1500);
    setTimeout(function () {
      $('.door').removeClass('open');
    }, 2500);
    setTimeout(function () {
      showDialog("That was some dream you were having. You were making a comeback, together with some leisure suited guy. Weird.");
      story = false;
    }, 4000)
  }
  );
}

function keyupBody(event) {
  if (event.keyCode == 13 || event.keyCode == 27) {
    if (dialog)
      return hideDialog();
    if (screenNr == 0)
      gotoScreen1();
  }
}

function resize() {
  var offset = $('#game').offset();
  screenOffsetLeft = offset.left, screenOffsetTop = offset.top;
}

function cycle() {
  if (!dialog) {
    if (new Date() * 1 - lastCycle > cycleMs) {
      avatar.cycle();
      items.cycle();
      lastCycle = new Date() * 1;
    }
  }
  $('#cursor').css({ 'left': x, 'top': y });
  requestAnimFrame(cycle);
}

function mouseMoveScreen(event) {
  getXY(event);
}

function mouseLeaveScreen(event) {
  x = -999;
}

function clickScreen(event) {
  if (dialog) {
    hideDialog();
    return false;
  }
  if (story) {
    if (screenNr == 0)
      gotoScreen1();
    return false;
  }
  getXY(event);
  for (var regionName in screen.regions) {
    if (Drawing.inPolygon(x, y, screen.regions[regionName].polygon)) {
      var handled = clickedRegion(regionName, event.ctrlKey);
      if (handled) return;
    }
  }
  destinationRegion = null;
  if (event.ctrlKey) {
    shape.push(x, y);
    console.log(shape);
  }
  else {
    avatar.walkto(x, y);
  }
}

function clickedRegion(name, ignoreDistance) {
  if (story) return false;
  var region = screen.regions[name];
  // first make sure this region is enabled
  var isEnabled = false;
  if (region.enabled == undefined)
    isEnabled = true;
  else if (region.enabled.constructor == Boolean)
    isEnabled = region.enabled;
  else if (region.enabled.constructor == Function)
    isEnabled = region.enabled();
  // if not enabled, leave
  if (!isEnabled)
    return false;
  // otherwise check distance
  if (region.distance && !ignoreDistance)
    checkDistance(name);
  else
    doAction(name);
  return true;
}

function checkDistance(name) {
  var region = screen.regions[name];
  var curDistance = Math.sqrt(Math.pow(Math.abs(avatar.x - region.hotspot[0]), 2) + Math.pow(Math.abs(avatar.y - region.hotspot[1]), 2));
  if (curDistance > region.distance) {
    destinationRegion = name;
    avatar.walkto(region.hotspot[0], region.hotspot[1]);
  } 
  else
    doAction(name);
}

var actions = [];
function doActions(arr) {
  for (var i = 0; i < arguments.length; i++)
    actions.push(arguments[i]);
  doAction();
}

function doAction(name) {
  if (!name) {
    if (actions.length > 0) {
      actions = actions.reverse();
      var action = actions.pop();
      actions = actions.reverse();
      if (action.constructor == Function) {
        action();
        return;
      }
      else 
        name = action;
    }
  }
  switch (name) {
    case 'door':
      $('#screen1 .door').toggleClass('open');
      break;
    case 'baydoor':
      if (!has('keys'))
        return showDialog('You\'re not going anywhere without the keys to that scooter.');
      var baydoor = $('#screen1 .baydoor');
      if (!baydoor.hasClass('open'))
        baydoor.addClass('open');
      else
        outro();
      break;
    case 'tablet':
      if (!has('tablet')) {
        take('tablet');
        $('.tablet').addClass('hidden');
        doActions(function () {
          showDialog('You pick up the iTab and see a message. It reads:||"Roger, I know you\'re there! Listen, two of our VIP customers - Mark and Scott - have ordered the Monolith Special. But our delivery boy just called in sick."');
        }, function () {
          showDialog('"I want you to hop on the scooter and get it to them ASAP! The food should be ready any minute now. Hurry!"');
        }, function () {
          setTimeout(function () { doAction('food'); }, 1000)
        });
      }
      break;
    case 'coat':
      if (!has('coat')) {
        take('coat');
        $('.coat').addClass('hidden');
        doActions(function () {
          showDialog('You pick up the delivery suit. It\s hideous, but wait, what\'s this? Inside one of the pockets you find...');
        }, function () {
          showDialog('... a keycard!||(You are suddenly overwhelmed by a strange feeling of deja-vu).');
        }, function () {
          showDialog('On closer examination you discover the words "Monolith Scooter 2" on the card. This must be the key to that scooter!');
        });
        take('keys');
      }
      break;
    case 'food':
      $('.food').addClass('enter')
      setTimeout(function () {
        $('.food').addClass('hover').removeClass('enter');
      }, 1500);
      break;
    case 'getfood':
      if (has('food'))
        return showDialog('Already in possession.');
      if (!has('tablet'))
        return showDialog('What?');
      take('food');
      $('.food').removeClass().addClass('hidden');
      showDialog('You take the order for Mark and Scott.|"These guys have got taste!" you think.');
  }
}

function finishedWalking() {
  if (destinationRegion)
    doAction(destinationRegion);
  destinationRegion = null;
}

function allowPosition(x, y) {
  if (story) return true;
  for (var name in screen.boundaries) {
    var boundary = screen.boundaries[name];
    var checkBoundary = false;
    if (boundary.enabled == undefined)
      checkBoundary = true;
    else if (boundary.enabled.constructor == Boolean)
      checkBoundary = boundary.enabled;
    else if (boundary.enabled.constructor == Function)
      checkBoundary = boundary.enabled();
    if (checkBoundary && Drawing.inPolygon(x, y, boundary.polygon))
      return true;
  }
  return false;
}

function showAction(x, y, text) {
  $('#actions').css({ 'left': x, 'top': y });
  $('#itemname').html(text).css({ 'margin-left': -$('#itemname').width() / 2 - 10});
  $('#actions').removeClass('hidden');

}

function showDialog(text) {
  dialog = true;
  $('#dialog-text').html(text.replace(/\|/g, '<br/>'));
  $('#dialog').removeClass('hidden').addClass('shown');
}

function hideDialog() {
  $('#dialog').addClass('hidden').removeClass('shown');
  $('#dialog-text').html('');
  dialog = false;
  if (actions.length > 0)
    doAction();
}

function outro() {
  story = true;
  avatar.walkto(500, 380);
  $('#avatar').addClass('shown');
  setTimeout(function () {
    $('#avatar').addClass('hidden').removeClass('shown');
    setTimeout(function () {
      doActions(function(){
        showDialog('You enter the scooter bay and hop on the scooter that awaits you there.|Using the keycard, you start the engine and off you go to those Two Guys.');
      },
      function() { 
        setTimeout(gotoScreen2, 1000);
      });
    }, 1000);
  }, 500)
}

function gotoScreen0() {
  story = true;
  showScreen(0);
  sound.play('splash');
  setTimeout(function() {
    $('.qpresents').addClass('fade');
  }, 1 * 1000);
  setTimeout(function() {
    $('.splash').addClass('shown');
  }, 10 * 1000);
 setTimeout(function() {
    $('.about').addClass('fadelong');
  }, 15 * 1000);
}

function gotoScreen1() {
  sound.stop('splash');
  story = true;
  showScreen(1);
  avatar.init(880, 464).show();
  if (debug) {
    story = false; avatar.init(580, 464).show();
    return;
  }
  setTimeout(intro, 3000);
  sound.play('monolith');
}

function gotoScreen2() {
  story = false;
  showScreen(2);
  avatar.init(494, 358).show();
  setTimeout(function() {
    doActions(function() {
      showDialog("You've reached the end of this demo. We wanted to include more screens and stuff to do, but our time was limited (so here's a sketch). All you see here was done in about 16 hours, from sketching to artwork to building the entire engine. From scratch.||We built this demo to demonstrate how HTML5 can be used to quickly produce an adventure game.");
    }, 
    function() {
      showDialog("We would really like to see the new Space Quest being developed using a flexible engine like this, so it can find its way to the desktop (through Steam), browsers (Chrome Web Store and Mozilla's App Store), Apple App Store, Google Play and other appstores. That's all possible with HTML5 as a single codebase plus a few magic tricks.");
    }, 
    function() {
      showDialog("This demo was brought to you by Two Guys From Q42: Martin Kool and Richard Lems.||Martin did the coding in javascript, and transitions and keyframe animations in CSS. Richard did the sketching and amazing artwork. The engine is a spiritual successor to www.sarien.net||(c) 2012 Q42 - www.q42.com");
    },
    function() {
      setTimeout(function() {
        showDialog("And yes, that's Mark Crowe and Scott Murphy relaxing on their private little island in space ;)");
      }, 5000);
    }
    );
  }, 500);
}
