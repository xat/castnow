# castnow

castnow is commandline utility which can be used to playback media files on
your chromecast device. It supports playback of local video files, youtube
clips, videos on the web and torrents. You can also re-attach a running
playback session.

### interested in beeing a castnow maintainer?

I currently don't have that much time to maintain this project and also lost some interest (to be honest).
Main reason is that we have a new TV since a few months which supports casting to it directly using
DLNA (you may wanna checkout [dlnacast](https://github.com/xat/dlnacast)).
Feel free to contact me ( [simon@sope.io](simon@sope.io) ) if you want to be added as maintainer to castnow.

### usage

```

// start playback of a local video file
castnow ./myvideo.mp4

// start playback of video and mp3 files in the local directory
castnow ./mydirectory/

// playback 3 videos after each other
castnow video1.mp4 video2.mp4 video3.mp4

// start playback of some mp4 file over the web
castnow http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4

// start playback of some youtube clip
castnow https://www.youtube.com/watch?v=pcVRrlmpcWk

// start playback of some video over torrent
castnow <url-to-torrent-file OR magnet>

// start playback of some video over torrent, with local subtitles
castnow <url-to-torrent-file OR magnet> --subtitles </local/path/to/subtitles.srt>

// transcode some other videoformat to mp4 while playback (requires ffmpeg)
castnow ./myvideo.avi --tomp4

// re-attach to an currently running playback session
castnow

```

### options

* `--tomp4` Transcode a video file to mp4 while playback. This option requires
ffmpeg to be installed on your computer. The play / pause controls are currently
not supported in transcode mode.

* `--device "my chromecast"` If you have more than one chromecast in your network
use the `--device` option to specify the device on which you want to start casting.
Otherwise castnow will just use the first device it finds in the network.

* `--address <IP>` The IP address of your chromecast. This will skip the MDNS scan.

* `--subtitles <path/URL>` This can be a path or URL to a vtt or srt file which
contains subtitles.

* `--myip <IP>` Your main IP address (useful if you have multiple network adapters)

* `--quiet` Hide the player timeline.

* `--peerflix-* <val>` Pass options to peerflix.

* `--ffmpeg-* <val>` Pass options to ffmpeg.

* `--type <val>` Explicity set the mime-type of the first item in the playlist (e.g. 'video/mp4').

* `--seek <val>` Seek to the specified time on start using the format hh:mm:ss or mm:ss.

* `--bypass-srt-encoding` Disable automatic UTF8 encoding of SRT subtitles.

* `--loop` Play the list of files over and over in a loop, forever.

* `--help` Display help message.

### player controls

```

space   // toggle between play and pause
m       // toggle between mute and unmute
up      // volume up
down    // volume down
left    // seek backward (keep pressed / multiple press for faster seek)
right   // seek forward (keep pressed / multiple press for faster seek)
n       // next item in the playlist (only supported in launch-mode)
s       // stop playback
q       // quit

```

### reporting bugs/issues

Please always append the debug output to your issues. You can enable the debug messages by setting the
DEBUG ENV variable before running the castnow-command like this: `DEBUG=castnow* castnow ./myvideo.mp4`.
Some problems are also already addressed in our wiki https://github.com/xat/castnow/wiki.

### installation

`npm install castnow -g`

### contributers

* [tooryx](https://github.com/tooryx)
* [przemyslawpluta](https://github.com/przemyslawpluta)

## License
Copyright (c) 2015 Simon Kusterer
Licensed under the MIT license.
