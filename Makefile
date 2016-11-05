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
handlebarsArgs=-e "html" -f dist/templates.js ./pages/*.html
htmlminArgs=--html5 --collapse-boolean-attributes --remove-tag-whitespace \
	--collapse-inline-tag-whitespace --remove-attribute-quotes \
	--remove-comments --remove-empty-attributes --remove-redundant-attributes
postcssArgs=--use autoprefixer --autoprefixer.browsers "> 0.25%"

jsFiles=js/index.js

dist-dir:
	@mkdir -p dist

static-files:
	@echo "Copying static files"
	@sed -e "s/<!-- This is replaced with res\/header\.html in the Makefile -->/`sed 's:/:\\/:g' res/header.html`/" index.html > dist/index.html
	@cp res/favicon.ico dist/
	@cp res/firacode.otf dist/

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
	@echo "Adding prefixes to CSS"
	@$(scss) --source-map-embed --output-style expanded --indent-type tab $(scssArgs)

scss-autoprefixer: scss
	@echo "Adding prefixes to compiled SCSS"
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

scss-min: dist-dir
	@echo "Adding prefixes to CSS"
	@$(scss) --output-style compressed $(scssArgs)

scss-min-autoprefixer: scss-min scss-autoprefixer

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
	rm -rf dist ranssi.tar.xz

package: production
	@echo "Packaging for production"
	@tar cfJ mauirc.tar.xz dist res index.html LICENSE package.json
	@echo "Extract mauirc.tar.xz somewhere and run \`npm install --production\`"


package-with-npm: production
	@echo "Packaging for production (with npm packages)"
	@tar cfJ mauirc.tar.xz dist res index.html LICENSE \
		node_modules/jquery/dist/jquery.min.js \
		node_modules/marked/marked.min.js \
		node_modules/handlebars/dist/handlebars.runtime.min.js \
		node_modules/moment/min/moment.min.js node_modules/moment/locale/fi.js \
		node_modules/normalize.css/normalize.css \
		node_modules/hashmux/dist/hashmux.min.js
	@echo "Extract mauirc.tar.xz anywhere"
