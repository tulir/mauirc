minify: minify-js minify-css

pack-js:
	cat \
		./js/vars.js \
	    ./js/util.js \
	    ./js/channels.js \
	    ./js/messaging.js \
	    ./js/mauirc.js \
	    ./js/auth.js \
	    ./js/load.js \
		> ./index.js
pack-css:
	cat \
	    ./css/util.css \
	    ./css/text.css \
	    ./css/alerts.css \
	    ./css/messages.css \
	    ./css/channels.css \
		> ./index.css

pack: pack-js pack-css

minify-css: pack-css
	yui-compressor ./index.css -o ./index.min.css

minify-js: pack-js
	uglifyjs -cmo index.min.js -- index.js

clean:
	rm -f index.min.js index.js index.min.css index.css
