//var buzz = require('one-buzz');
var emitter = require('emitter');
var buzz = require('buzz')

var player = null
var sounds = {};
var isReady = false
var readyCallbacks = []
var ua = navigator.userAgent.toLowerCase();

var ie = ua.indexOf('msie') != -1 ? parseInt(ua.split('msie')[1]) : false;

if(ua.indexOf('.net')>=0){
  ie = true
}

var isSoundManager = !buzz.isSupported()

if(isSoundManager){

  var manager = require('soundmanager2');
  soundManager.setup({

    url:'build/sounds-r-us/lib/swfs/',
    debugMode:false,
    onready:function(){
      isReady = true
      readyCallbacks.forEach(function(fn){
        fn()
      })
    }
  })
}

function makePlayer(){

  var media = new emitter();

  function process_url(url){
    return url.replace(/\.\w+$/, '')
  }

  function playSound(sound){
    if(isSoundManager){
      sound.play()
    }
    else{
      sound.load().play()
    }
  }

  function create_buzz_sound(url, loaded_callback){

    var name = process_url(url)

    if(sounds[name]){
      var sound = sounds[name]
      setTimeout(function(){
        loaded_callback(sound)  
      }, 1)
      
      return
    }

    var sound = new buzz.sound(name, {

      formats:['mp3', 'ogg']

    })

    sound.load()

    var donecb = false
  
    setTimeout(function(){
      if(donecb){
        return
      }
      donecb = true
      loaded_callback(sound)
    }, 50)
  
    sounds[name] = sound
  }

  function create_soundmanager_sound(url, loaded_callback){

    if(!isReady){
      readyCallbacks.push(function(){
        create_soundmanager_sound(url, loaded_callback)        
      })
      return
    }

    var name = process_url(url)
    
    if(sounds[name]){
      var sound = sounds[name]
      return loaded_callback(sound)
    }

    var sound

    if(window['Media']){
      sound = new Media(url, loader_success, loader_error)
      sounds[name] = sound
      return loaded_callback(sound)
    }
    else{
      sound = soundManager.createSound({
        url: [
            name + '.mp3', name + '.ogg'
        ],
        autoLoad: true,
        autoPlay: false,
        onload: function(){
          loaded_callback(sound)
        },
        id: name
      })

      sounds[name] = sound
    }

  }

  function create_sound(url, loaded_callback){

    var fn = isSoundManager ? create_soundmanager_sound : create_buzz_sound

    fn(url, loaded_callback)
  }

  media.getsound = function(url){
    return sounds[process_url(url)]
  }

  media.loadsound = function(url, callback){

    create_sound(url, function(sound){
      callback(sound)
    })
    
  }

  media.playsound = function(url, done){

    //media.stopsound(url)
    create_sound(url, function(sound){
      
      playSound(sound)
      
      
      
    })

  }

  media.stopsound = function(url){

    var sound = media.getsound(url)
    if(!sound){
      return
    }

    if(sound.seekTo){
      sound.seekTo(0);
      sound.stop();
      sound.release();
    }
    else{
      sound.stop();  
    }
  }

  media.stopsounds = function(){
    var self = this;

    for(var name in sounds){
      media.stopsound(name)
    }
  }

  return media;
}


module.exports = function sound_stash(){
  if(!player){
    player = makePlayer()
  }
  return player
}
