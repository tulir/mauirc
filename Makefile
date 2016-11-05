default: handlebars scss js
	@echo "Ready to use!"
compatibility: handlebars scss-autoprefixer js-babel
	@echo "Ready to use!"
minify: handlebars-min scss-min js-min
	@echo "Ready to use!"
production: handlebars-min scss-min-autoprefixer js-min
	@echo "Ready to use!"

handlebars=./node_modules/.bin/handlebars
markdown=./node_modules/.bin/marked
htmlmin=./node_modules/.bin/html-minifier
scss=./node_modules/.bin/node-sass
postcss=./node_modules/.bin/postcss
babel=./node_modules/.bin/babel
jsdoc=./node_modules/.bin/jsdoc

scssArgs=--output dist style/index.scss
markdownArgs=--gfm --tables --breaks --sanitize --smart-lists -i {}
handlebarsArgs=-e "html" -f dist/templates.js ./pages/*.html
htmlminArgs=--html5 --collapse-boolean-attributes --remove-tag-whitespace \
	--collapse-inline-tag-whitespace --remove-attribute-quotes \
	--remove-comments --remove-empty-attributes --remove-redundant-attributes
postcssArgs=--use autoprefixer --autoprefixer.browsers "> 0.25%"

jsFiles=js/index.js

dist-dir:
	@mkdir -p dist

handlebars: dist-dir
	$(handlebars) $(handlebarsArgs)

handlebars-min: dist-dir
	@$(handlebars) -m $(handlebarsArgs)

scss: dist-dir
	$(scss) --source-map-embed --output-style expanded --indent-type tab $(scssArgs)

scss-autoprefixer: scss
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

scss-min: dist-dir
	@$(scss) -q --output-style compressed $(scssArgs)

scss-min-autoprefixer: scss-min
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

js: dist-dir
	cat $(jsFiles) > dist/index.js

js-babel: dist-dir
	$(babel) --no-comments -s inline -o dist/index.js $(jsFiles)

js-min: dist-dir
	@$(babel) --presets babili --no-comments -o dist/index.js $(jsFiles)

docs: dist-dir
	@mkdir -p dist/docs
	$(jsdoc) -d dist/docs

clean:
	rm -rf dist ranssi.tar.xz

package: production
	@tar cfJ mauirc.tar.xz dist res index.html LICENSE package.json
	@echo "Extract mauirc.tar.xz somewhere and run \`npm install --production\`"


package-with-npm: production
	@tar cfJ mauirc.tar.xz dist res index.html LICENSE \
		node_modules/jquery/dist/jquery.min.js \
		node_modules/marked/marked.min.js \
		node_modules/handlebars/dist/handlebars.runtime.min.js \
		node_modules/moment/min/moment.min.js node_modules/moment/locale/fi.js \
		node_modules/normalize.css/normalize.css \
		node_modules/hashmux/dist/hashmux.min.js
	@echo "Extract mauirc.tar.xz anywhere"
