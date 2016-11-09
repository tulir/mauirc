default: handlebars static-files scss js
	@echo "All done!"
compatibility: handlebars static-files scss-autoprefixer js-babel
	@echo "All done!"
minify: handlebars-min static-files-min scss-min js-min
	@echo "All done!"
production: handlebars-min static-files-min scss-min-autoprefixer js-min
	@echo "All done!"

handlebars=./node_modules/.bin/handlebars
htmlmin=./node_modules/.bin/html-minifier
scss=./node_modules/.bin/node-sass
postcss=./node_modules/.bin/postcss
babel=./node_modules/.bin/babel
jsdoc=./node_modules/.bin/jsdoc

scssArgs=--output dist style/index.scss --quiet
handlebarsArgs=-e "hbs" -f dist/templates.js ./pages
htmlminArgs=--html5 --collapse-boolean-attributes --remove-tag-whitespace \
	--collapse-inline-tag-whitespace --remove-attribute-quotes \
	--remove-comments --remove-empty-attributes --remove-redundant-attributes
postcssArgs=--use autoprefixer --autoprefixer.browsers "> 0.25%"

jsFiles=js/networks.js js/conn.js js/auth.js js/rawio.js js/messaging.js js/message.js js/main.js

dist-dir:
	@mkdir -p dist
	@mkdir -p dist/lib

static-files:
	@echo "Copying static files"
	@sed -e "s/<!-- This is replaced with res\/header\.html in the Makefile -->/`sed 's:/:\\/:g' res/header.html`/" index.html > dist/index.html
	@cp res/favicon.ico dist/
	@cp res/firacode.otf dist/
	@cp node_modules/jquery/dist/jquery.min.js dist/lib/jquery.js
	@cp node_modules/moment/min/moment.min.js dist/lib/moment.js
	@cp node_modules/sprintf-js/dist/sprintf.min.js dist/lib/sprintf.js
	@cp node_modules/handlebars/dist/handlebars.runtime.min.js dist/lib/handlebars.js
	@cp node_modules/hashmux/dist/hashmux.min.js dist/lib/hashmux.js
	@cp node_modules/normalize.css/normalize.css dist/lib/normalize.css

static-files-min: static-files
	@echo "Minifying HTML files"
	@cat dist/index.html | $(htmlmin) $(htmlminArgs) > dist/index.html

handlebars: dist-dir
	@echo "Compiling Handlebars templates"
	@$(handlebars) $(handlebarsArgs)

handlebars-min: dist-dir
	@echo "Compiling minified Handlebars templates"
	@$(handlebars) -m $(handlebarsArgs)

scss: dist-dir
	@echo "Compiling SCSS"
	@$(scss) --source-map-embed --output-style expanded --indent-type tab $(scssArgs)

scss-autoprefixer: scss
	@echo "Adding prefixes to compiled SCSS"
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

scss-min: dist-dir
	@echo "Compiling and minifying SCSS"
	@$(scss) --output-style compressed $(scssArgs)

scss-min-autoprefixer: scss-min
	@echo "Adding prefixes to compiled and minified SCSS"
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

js: dist-dir
	@echo "Concatenating JavaScript files"
	@cat $(jsFiles) > dist/index.js

js-babel: dist-dir
	@echo "Babelifying JavaScript files"
	@$(babel) --no-comments -s inline -o dist/index.js $(jsFiles)

js-min: dist-dir
	@echo "Babelifying and minifying JavaScript files"
	@$(babel) --presets babili --no-comments -o dist/index.js $(jsFiles)

docs: dist-dir
	@echo "Generating JSDocs"
	@mkdir -p dist/docs
	@$(jsdoc) -d dist/docs

clean:
	@echo "Cleaning working directory"
	rm -rf dist mauirc.tar.xz

package: production
	@echo "Packaging for production"
	@cp package.json LICENSE dist
	@cd dist
	@tar cfJ mauirc.tar.xz *
	@rm -f package.json LICENSE
	@mv mauirc.tar.xz ..
	@cd ..
	@echo "Extract mauirc.tar.xz anywhere"
