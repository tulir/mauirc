minify: minify-js minify-css
	mv index.html index.max.html
	mv index.min.html index.html

pack-js:
	cat \
		./js/lib/linkify.min.js \
		./js/lib/linkify-html.min.js \
		./js/lib/linkify-jquery.min.js \
		./js/vars.js \
	    ./js/util.js \
	    ./js/channels.js \
	    ./js/userlist.js \
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
	    ./css/login.css \
	    ./css/messages.css \
	    ./css/messageview.css \
	    ./css/channels.css \
	    ./css/userlist.css \
		> ./index.css

pack: pack-js pack-css

minify-css: pack-css
	yui-compressor ./index.css -o ./index.min.css

minify-js: pack-js
	uglifyjs -cmo index.min.js -- index.js

minify-html:
	alias htmlminify='html-minifier --html-5 \
		--collapse-boolean-attributes \
		--collapse-inline-tag-whitespace \
		--collapse-whitespace \
		--remove-attribute-quotes \
		--remove-comments \
		--remove-redundant-attributes \
		--remove-script-type-attributes \
		--remove-style-link-type-attributes \
		--use-short-doctype'
	alias readtempl='tail -n +19'
	readtempl templates/action.html | htmlminify >> templates.min.html
	readtempl templates/action.html | htmlminify >> templates.min.html
	readtempl templates/action.html | htmlminify >> templates.min.html
	readtempl templates/action.html | htmlminify >> templates.min.html
	readtempl templates/action.html | htmlminify >> templates.min.html
	readtempl templates/action.html | htmlminify >> templates.min.html

clean:
	rm -f index.min.js index.js index.min.css index.css
	mv index.html index.min.html
	mv index.max.html index.html
