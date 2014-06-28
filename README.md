sounds-r-us
===========

Just play it (tm)

## install

```
$ component install binocarlos/sounds-r-us
```

## usage

```js
var player = require('sounds-r-us')()


player.loadsound('url/to/sound.mp3', function(sound){
	sound.play()
})

player.playsound('auto/load.mp3')
```

## license

MIT