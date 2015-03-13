var sound = {
  effects: {
    'splash': '1.mp3',
    'monolith': '2.mp3'
  },
  init: function () {
    for (var name in sound.effects) {
      var audio = new Audio('music/' + sound.effects[name]);
      audio.preload = true;
      audio.load();
      sound.effects[name] = audio;
    }
  },
  play: function (name) {
    var effect = sound.effects[name];
    effect.play();
  },
  stop: function (name) {
    if (name) {
      var effect = sound.effects[name];
      effect.pause();
    } else {
      for (var name in sound.effects) {
        var effect = sound.effects[name];
        effect.pause();
      }
    }
  }
};