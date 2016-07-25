# mauIRC
[![License](http://img.shields.io/:license-gpl3-blue.svg?style=flat-square)](http://www.gnu.org/licenses/gpl-3.0.html)

A web-based UI-focused IRC client.

## Setup
mauIRC only contains static files, but assumes that mauIRCd is running the same domain.
The easiest way to set this up is to have your webserver try to proxypass requests to mauIRCd.

### Very basic Nginx config
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
