minify:
	./build/minify-js.sh
	./build/minify-css.sh
	./build/minify-html.sh

gitpull:
	git pull

update: clean gitpull minify

clean:
	mv -f index.max.html index.html
	rm -f index.min.js index.js index.min.css index.css templates.min.html
