# castnow v0.5

In software it's often said that a codebase needs at least 2 rewrites until
it's considered as "good" code. I hope for castnow one rewrite will do it though :)

### Why the rewrite?

castnow has some pain points at the moment which I think
only can be solved nicely through an rewrite.
Here are some:

* Custom Plugins are not supported
* It would be hard to build a Web-Interface based on the current code
* The Playlist functionality is more or less a hack since it was not part of the initial idea/concept
* When FFmpeg Transcoding is done the player controls are not supported
* You can't mix for example YouTube Videos together with MP4 Videos in the Playlist
* There are often crashes while playing
* Transcoding always converts video+audio although often only transcoding of the audio-stream would be needed


### v0.5 goals

#### Simplicity

Simplicity will stay the main focus. Someone should just need to type in `castnow <media source>`
into his terminal and castnow then should figure out by it self how to get the given media-input
running on Chromecast. Options like `--tomp4` or `--myip` should not be needed anymore.

#### Playlist first

Internally a Playlist will be the center of the architecture. The Playlist will communicate
with Chromecast through some kind of Engine thing. Items in the Playlist can be moved around and the User can jump forward and backward. The Playlist can contain items
of different types (for example youtube and some local mp4).
You may ask yourself why this Playlist thing is so important since the Playlist will
mostly contain just one item anyway. The answer is "Google Cast for Audio". With
a Playlist as center of the architecture it will be easy to support stuff like .m3u
files.

#### More Hackable

The goal here is that developers can pull in castnow as external library. For example someone could build an node-webkit (NW.js) app on top of castnow. Basicly this means the lib and bin stuff will get separated in the codebase.

#### User-Plugin support

If someone wants to write his own plugin without modifying the castnow codebase
he will be able todo that. The idea here is that the user can either use some
sort of `--plugins-directory` parameter. If he does not do that, castnow will look if a directory
`/home/<user>/.castnow/plugins` exists and load the plugins from out of there.

#### Better/Smarter transcoding

castnow will detect if ffmpeg or avconv is installed and if it has the minimum
required version. The plan is also to auto-detect if transcoding of an file is needed
using ffprobe. If only audio needs to be transcoded castnow will not transcode video.
Besides that the main goal is to support player controls for transcoding files (maybe
even seeking). We will also test if it's better to transcode to .mkv instead of .mp4.

#### Robustness

This includes stuff like handling connection losses correctly, prevent the player
from going into idle modus if the player was paused too long and stuff like that.

### What happens after v0.5.x

The plan is to add an minimalstic web interface with an REST API. This likely
will happen within v0.6.x. After that, if nothing goes wrong, v1.0 is ahead :)

### Contribution

Contributers are welcome :-)
All I ask for is that we all agree on a similar coding style and have the same project goals in mind. I for myself love splitting up stuff in smaller functions and then compose
them together. I'm also willing to give direct push access to people who are constantly contributing.

## License
Copyright (c) 2015 Simon Kusterer
Licensed under the MIT license.
