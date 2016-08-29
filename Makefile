build: build-js build-css build-html
build-min: build-min-js build-min-css build-min-html


build-js: $(shell find . -name "*.go")
	gopherjs build -o index.js
build-min-js: $(shell find . -name "*.go")
	gopherjs build -mo index.js


build-html: $(shell find . -name "*.gohtml")
	./build/html.sh
build-min-html: $(shell find . -name "*.gohtml")
	./build/html.min.sh


build-css: $(shell find . -name "*.css")
	./build/css.sh
build-min-css: build-css
	cleancss -o index.css index.css


package: build-min package-existing
package-max: build package-existing
package-existing: res/ index.js index.css index.html templates.html
	tar cvfJ mauirc.tar.xz res/ index.js index.css index.html templates.html

goget:
	go get -u
update: clean goget build-min


clean:
	rm -f index.js.map index.js index.html index.css templates.html mauirc.tar.xz
