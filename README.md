# mauIRC
[![License](http://img.shields.io/:license-gpl3-brightgreen.svg?style=flat-square)](http://www.gnu.org/licenses/gpl-3.0.html)
[![GitHub release](https://img.shields.io/github/release/tulir/mauirc.svg?maxAge=600&style=flat-square)](https://github.com/tulir/mauirc/releases)
![GitHub commits](https://img.shields.io/github/commits-since/tulir/mauirc/v2.0.1.svg?maxAge=600&style=flat-square)
![Rewrites](https://img.shields.io/:number%20of%20complete%20rewrites-2-yellow.svg?style=flat-square)

A web-based UI-focused IRC client. Originally written in ES5/CSS/(HTML with jQuery Templates), previously written in Go/CSS/GoHTML, now written in ES6/SCSS/(HTML with Handlebars)

## Setup
### Packages
You can find production-processed packages from the [Release section](https://github.com/tulir/mauirc/releases).

### Development
You should use [HTMLHint](https://github.com/yaniswang/HTMLHint), [ESLint](http://eslint.org/), [Sass Lint](https://www.npmjs.com/package/sass-lint) and [CSSComb](http://csscomb.com/) with the config files in the root of the repository.

### Compiling
Install required packages with `npm install` and use `make` to compile everything. All the targets place all required files into the `dist` folder.

Make targets:
* `default` - Compile everything without any compatibility patches/minification. Also copies required compiled/minified dependencies from `node_modules` to `dist/lib`
* `compatibility` - Same as `default`, but with Babel (ES6 compat) and Autoprefixer (CSS compat)
* `minify` - Same as `default`, but minify code
* `production` - `compatibility` and `minify` combined
* `package` - Package `LICENSE` and the output of `production` into a `.tar.xz` archive.
* `lint` - Run linters on all HTML and JavaScript files (SCSS not yet supported).
* `docs` - Generate JSDocs (output to `dist/docs`). Included in `package` archive if ran in advance.

### Webserver setup
mauIRC only contains static files, but assumes that a mauIRC server is running the same domain.
The easiest way to set this up is to have your webserver try to proxypass requests to the mauIRC server.

Here's a basic Nginx config:
```nginx
server {
	listen			<ip>:80;

	location / {
		root              <path to mauIRC>;

		try_files         $uri $uri/ @backend;
	}

	location @backend {
		proxy_pass            http://<mauIRC server ip:port>;

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
