# castnow

Castnow is a command-line utility that can be used to play back media files on
your Chromecast device. It supports playback of local video files, videos on the web and torrents.
You can also re-attach a running playback session \(this sentence should belong somewhere else).

### Interested in being a castnow maintainer?

I currently don't have that much time to maintain this project and have also lost some interest (to be honest).
Main reason is that we have had a new TV for a few months that supports casting directly to it using
DLNA \(you may wanna checkout [dlnacast](https://github.com/xat/dlnacast)).
Feel free to contact me \( [simon@sope.io](simon@sope.io) ) if you want to be added as a maintainer to castnow.

### Install
First you need to install **brew**, please follow your specific distro installation method here: https://github.com/Linuxbrew/brew#install

then you need to install **node**:

`brew install node`

Finally you can install castnow:

` npm install castnow -g`

or, if you installed brew for all users: 

`sudo npm install castnow -g`

### Usage

```

// start playback of a local video file
castnow ./myvideo.mp4

// start playback of video and mp3 files in the local directory
castnow ./mydirectory/

// playback 3 videos after each other
castnow video1.mp4 video2.mp4 video3.mp4

// start playback of an mp4 file over the web
castnow http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4

// start playback of a video over torrent
castnow <url-to-torrent-file OR magnet>

// start playback of a video over torrent with local subtitles
castnow <url-to-torrent-file OR magnet> --subtitles </local/path/to/subtitles.srt>

// transcode some other video format to mp4 while playback (requires ffmpeg)
castnow ./myvideo.avi --tomp4

// transcode only audio while playback (in case the video shows, but there's no audio)
castnow ./myvideo.mkv --tomp4 --ffmpeg-vcodec copy

// change the increment at which the volume steps up or down. A lower number
// is helpful if your speakers are very loud, and you want more precision over
// the change in volume
castnow ./song.mp3 --volume-step "0.01"

// re-attach to a currently running playback session
castnow

```

### Options

* `--tomp4` Transcode a video file to mp4 during playback. This option requires
ffmpeg to be installed on your computer. The play / pause controls are currently
not supported in transcode mode.

* `--device "my chromecast"` If you have more than one Chromecast on your network,
use the `--device` option to specify the device on which you want to start casting.
Otherwise, castnow will just use the first device it finds in the network.

* `--address 192.168.1.4` The IP address or hostname of your chromecast. This will skip
the MDNS scan.

* `--subtitles <path/URL>` This can be a path or URL to a vtt or srt file that
contains subtitles.

* `--subtitle-scale 1.5` Scaling factor for the size of the subtitle font. Default is 1.0.

* `--subtitle-color #FFFFFFFF` Foreground RGBA color of the subtitle font.

* `--myip 192.168.1.8` Your main IP address \(useful if you have multiple network adapters)

* `--quiet` Hide the player timeline.

* `--peerflix-<option> <argument>` Pass options to peerflix.

* `--ffmpeg-<option> <argument>` Pass options to ffmpeg.

* `--type <type>` Explicity set the mime-type of the first item in the playlist (e.g. 'video/mp4').

* `--seek <hh:mm:ss>` Seek to the specified time on start using the format hh:mm:ss or mm:ss.

* `--bypass-srt-encoding` Disable automatic UTF-8 encoding of SRT subtitles.

* `--loop` Play the list of files over and over in a loop, forever.

* `--shuffle` Play the list of files in random order.

* `--recursive` List all files in directories recursively.

* `--volume-step` Step at which the volume changes. Helpful for speakers that are softer or louder than normal. Value ranges from 0 to 1. Default is 0.05.

* `--command <key1>,<key2>,...` Execute key command(s) (where each `<key>` is one of the keys listed under *player controls*, below).

* `--exit` Exit when playback begins or `--command <key>` completes.

* `--help` Display help message.

Optionally, options can be preset by storing them in a file named `.castnowrc` in the current
user's home directory.  For example:

```
--myip=192.168.1.8
--volume-step=0.01
```

### Player Controls

```

space   // toggle between play and pause
m       // toggle mute
t       // toggle subtitles
up      // volume up
down    // volume down
left    // seek backward (keep pressed / multiple press for faster seek)
right   // seek forward (keep pressed / multiple press for faster seek)
n       // next item in the playlist (only supported in launch-mode)
s       // stop playback
q       // quit

```

### YouTube Support

We had to drop direct YouTube support for now since google changed the chromecast YouTube API.
However, there is a nice workaround in combination with the tool [youtube-dl](https://github.com/rg3/youtube-dl):

`youtube-dl -o - https://youtu.be/BaW_jenozKc | castnow --quiet -`

Thanks to [trulex](https://github.com/trulex) for pointing that out.

### Non-Interactive

Castnow can also be used in cron jobs or via window-manager bindings; for example:

```
// Play/pause.
castnow --command space --exit

// Louder.
castnow --command up --exit
```

#### Usage via [screen](https://www.gnu.org/software/screen/) command

To avoid starting a new castnow command every time (which takes long time) you should use background sessions.

```
// run castnow in backgound only once:
screen -d -m -S cast_session castnow /path/to/mp3/

// use the running session:
// Play/pause.
screen -S cast_session -X stuff ' '

// Mute.
screen -S cast_session -X stuff 'm'

// Subtitles.
screen -S cast_session -X stuff 't'

// Volume up.
screen -S cast_session -X stuff $'\e[A'

// Volume down.
screen -S cast_session -X stuff $'\e[B'

// Seek backward.
screen -S cast_session -X stuff $'\e[D'

// Seek forward.
screen -S cast_session -X stuff $'\e[C'

// Next item in the playlist.
screen -S cast_session -X stuff 'n'

// stop playback.
screen -S cast_session -X stuff 's'

// quit/stop session
screen -S cast_session -X stuff 'q'
// or
screen -S cast_session -X quit
```

### reporting bugs/issues

Please include the debug output in your issues. You can enable the debug messages by setting the
DEBUG environment variable before running the castnow command like this: `DEBUG=castnow* castnow ./myvideo.mp4`.
Some problems have already been addressed in our wiki https://github.com/xat/castnow/wiki.

### contributors

* [tooryx](https://github.com/tooryx)
* [przemyslawpluta](https://github.com/przemyslawpluta)

## License
Copyright (c) 2015 Simon Kusterer

Licensed under the MIT license.
