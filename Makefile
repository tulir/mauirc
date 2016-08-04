build: build-js build-css build-html

build-min: build-min-js build-min-css build-min-html



build-js: $(shell find -name "*.go")
	gopherjs build -o index.js

build-min-js: $(shell find -name "*.go")
	gopherjs build -mo index.js



build-html: $(shell find -name "*.html")
	./build/html.sh

build-min-html: $(shell find -name "*.html")
	./build/html.min.sh



build-css: $(shell find -name "*.css")
	./build/css.sh

minify-css: build-css
	cleancss -o index.css index.css

build-min-css: build-css minify-css



package: minify
	tar cvfJ mauirc.tar.xz favicon.ico firacode.otf index.js index.css header.html templates.html index.html

gitpull:
	git pull

update: clean gitpull minify

clean:
	rm -f index.js index.js.map index.css templates.html mauirc.tar.xz
