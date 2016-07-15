minify:
	./build/minify-js.sh
	./build/minify-css.sh
	./build/minify-html.sh

package: minify
	tar cvfJ mauirc.tar.xz favicon.ico firacode.otf index.min.* templates.min.html index.html

gitpull:
	git pull

update: clean gitpull minify

clean:
	mv -f index.max.html index.html
	rm -f index.min.js index.js index.min.css index.css templates.min.html mauirc.tar.xz
