# mauIRC
[![License](http://img.shields.io/:license-gpl3-brightgreen.svg?style=flat-square)](http://www.gnu.org/licenses/gpl-3.0.html)
[![GitHub release](https://img.shields.io/github/release/tulir293/mauirc.svg?maxAge=600&style=flat-square)](https://github.com/tulir293/mauirc/releases)
![GitHub commits](https://img.shields.io/github/commits-since/tulir293/mauirc/v2.0.0.svg?maxAge=600&style=flat-square)
![Rewrites](https://img.shields.io/:number%20of%20code%20rewrites-2-yellow.svg?style=flat-square)

A web-based UI-focused IRC client. Originally written in JavaScript/CSS/HTML, previously written in Go/CSS/GoHTML, now written in ES6/SCSS/(HTML with Handlebars)

## Setup
### Packages
You can find the basic minified sources from the [Release section](https://github.com/tulir293/mauirc/releases).

### Compiling
#### Post-2.1
Install required packages with `npm install` and use `make` to compile everything.

Make targets:
* `default` - Compile everything without any compatibility patches/minification
* `compatibility` - Same as `default`, but with Babel (ES6 compat) and Autoprefixer (CSS compat)
* `minify` - Same as `default`, but minify code
* `production` - `compatibility` and `minify` combined
* `package` - Package `LICENSE`, the output of `production` and `package.json` into a `.tar.xz` archive.
* `package-with-dependencies` - Same as `package`, but include the necessary npm packages instead of `package.json`

#### Pre-2.1
You can compile the code yourself using GopherJS. Once you have the [Go toolkit](https://golang.org/doc/install), simply use `go get -u github.com/gopherjs/gopherjs` to get the GopherJS toolkit.
Then get the mauIRC sources using `go get -u maunium.net/go/mauirc` and use `make` in the mauIRC source directory.

Minifying the GopherJS output is included in GopherJS itself, but HTML and CSS minification require other tools.
The build scripts in mauIRC use the NPM packages `clean-css` and `html-minifier`.
If you have the two packages installed, simply use `make build-min` to build a minified version.
You can also use `make package` to generate a `.tar.xz` package with the necessary files.

### Webserver setup
mauIRC only contains static files, but assumes that a mauIRC server is running the same domain.
The easiest way to set this up is to have your webserver try to proxypass requests to the mauIRC server.

Here's a basic Nginx config:
```nginx
server {
	listen			<ip>:80;

	location / {
		# mauIRC uses some Server-Side Includes
		ssi               on;
		ssi_silent_errors on;

		root              <path to mauIRC>;

		try_files         $uri $uri/ @mauircd;
	}

	location @mauircd {
		proxy_pass            http://<mauIRCd ip:port>;

		# Forward the actual IP of the client to the server.
		# Remember to configure the server to trust these headers.
		proxy_set_header      X-Forwarded-For $remote_addr;

		port_in_redirect      off;
		proxy_connect_timeout 300;

		# Forward the WebSocket upgrade headers.
		proxy_set_header      Upgrade    $http_upgrade;
		proxy_set_header      Connection $connection_upgrade;
	}
}

map $http_upgrade $connection_upgrade {
	default	upgrade;
	''	close;
}
```
