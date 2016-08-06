# mauIRC
[![License](http://img.shields.io/:license-gpl3-blue.svg?style=flat-square)](http://www.gnu.org/licenses/gpl-3.0.html)
[![GitHub release](https://img.shields.io/github/release/tulir293/mauirc.svg?style=flat-square)](https://github.com/tulir293/mauirc/releases)
[![GitHub commits](https://img.shields.io/github/commits-since/tulir293/mauirc/v1.1.0.svg?style=flat-square)]()

A web-based UI-focused IRC client. Written in Go ([GopherJS](https://github.com/gopherjs/gopherjs)).

## Setup
You can find the basic minified sources from the [Release section](https://github.com/tulir293/mauirc/releases). Currently there are only releases for mauIRC 1.x, which was written directly in JS with jQuery. I'll make releases for 2.x as soon as it's functional.

### Compiling
You can compile the code yourself using GopherJS. Once you have the [Go toolkit](https://golang.org/doc/install), simply use `go get -u github.com/gopherjs/gopherjs` to get the GopherJS toolkit.
Then get the mauIRC sources using `go get -u maunium.net/go/mauirc` and use `make` in the mauIRC source directory.

Minifying the GopherJS output is included in GopherJS itself, but HTML and CSS minification require other tools.
The build scripts in mauIRC use the NPM packages `clean-css` and `html-minifier`. 
If you have the two packages installed, simply use `make build-min` to build a minified version.
You can also use `make package` to generate a `.tar.xz` package with the necessary files.

### Webserver setup
mauIRC only contains static files, but assumes that mauIRCd is running the same domain.
The easiest way to set this up is to have your webserver try to proxypass requests to mauIRCd.

Here's a basic Nginx config:
```nginx
server {
	listen			<ip>:80;
	
	location / {
		# mauIRC uses some Server-Side Includes
		ssi					on;
		ssi_silent_errors	on;
		
		root				<path to mauIRC>;
		
		try_files			$uri $uri/ @mauircd;
	}

	location @mauircd {
		proxy_pass				http://<mauIRCd ip:port>;
		
		# Optional headers
		proxy_set_header		Host			$host;
		proxy_set_header		X-Real-IP		$remote_addr;
		proxy_set_header		X-Forwarded-For	$remote_addr;
		
		port_in_redirect		off;
		proxy_connect_timeout	300;
		
		# Pass through WebSocket upgrade fields
		proxy_set_header		Upgrade			$http_upgrade;
		proxy_set_header		Connection		$connection_upgrade;
	}
}

map $http_upgrade $connection_upgrade {
	default	upgrade;
	''	close;
}
```
