# castnow

castnow is commandline utility which can be used to playback media files on
your chromecast device. It supports playback of local video files, youtube
clips, videos on the web and torrents.
You can toggle beween play and pause with the space-key.

### Usage

```

// start playback of a local video file
castnow ./myvideo.mp4

// start playback of some mp4 file over the web
castnow http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4

// start playback of some youtube clip
castnow https://www.youtube.com/watch?v=pcVRrlmpcWk

// start playback of some video over torrent
castnow <url-to-torrent-file OR magnet> --torrent

// re-attach to an currently running playback session
castnow

```

### Installation

`npm install castnow -g`

## License
Copyright (c) 2014 Simon Kusterer
Licensed under the MIT license.
