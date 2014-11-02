# castnow

castnow is commandline utility which can be used to playback media files on
your chromecast device. It supports playback of local video files, youtube
clips, videos on the web and torrents. You can also re-attach a running
playback session.

### usage

```

// start playback of a local video file
castnow ./myvideo.mp4

// start playback of some mp4 file over the web
castnow http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4

// start playback of some youtube clip
castnow https://www.youtube.com/watch?v=pcVRrlmpcWk

// start playback of some video over torrent
castnow <url-to-torrent-file OR magnet>

// transcode some other videoformat to mp4 while playback (requires ffmpeg)
castnow ./myvideo.avi --tomp4

// re-attach to an currently running playback session
castnow

### options

* `--tomp4` Transcode a video file to mp4 while playback. This option requires
ffmpeg to be installed on your computer. The play / pause controls are currently
not supported in transcode mode.

* `--device "my chromecast"` If you have more than one chromecast in your network
use the `--device` option to specify the device on which you want to start casting.
Otherwise castnow will just use the first device it finds in the network.

### player controls

```

space   // toggle between play and pause
m       // toggle between mute and unmute
up      // volume up
down    // volume down

```


### Installation

`npm install castnow -g`

## License
Copyright (c) 2014 Simon Kusterer
Licensed under the MIT license.
