default: handlebars static-files scss js
	@echo "All done!"
compatibility: handlebars static-files scss-autoprefixer js-babel
	@echo "All done!"
minify: handlebars-min static-files-min scss-min js-min
	@echo "All done!"
production: handlebars-min static-files-min scss-min-autoprefixer js-min
	@echo "All done!"

browserify=./node_modules/.bin/browserify
handlebars=./node_modules/.bin/handlebars
htmlmin=./node_modules/.bin/html-minifier
scss=./node_modules/.bin/node-sass
postcss=./node_modules/.bin/postcss
jsdoc=./node_modules/.bin/jsdoc

browserifyArgs=-t strictify --outfile dist/index.js -e js/main.js
scssArgs=--output dist style/index.scss --quiet
scssMinArgs=--output-style compressed
scssMaxArgs=--source-map-embed --output-style expanded --indent-type tab
handlebarsArgs=-e "hbs" -f dist/templates.tmp.js ./pages
htmlminArgs=--html5 --collapse-boolean-attributes --remove-tag-whitespace \
	--collapse-inline-tag-whitespace --remove-attribute-quotes \
	--remove-comments --remove-empty-attributes --remove-redundant-attributes
postcssArgs=--use autoprefixer --autoprefixer.browsers "> 0.25%"
headersReplace=<!-- This is replaced with res\/header\.html in the Makefile -->
headers=sed 's:/:\\/:g' res/header.html

dist-dir:
	@mkdir -p dist

static-files: dist-dir
	@echo "Copying static files"
	@sed -e "s/$(headersReplace)/`$(headers)`/" index.html > dist/index.html
	@cp res/favicon.ico dist/
	@cp res/firacode.otf dist/
	@cp -r res/img/ dist/
	@cp node_modules/normalize.css/normalize.css dist/normalize.css

static-files-min: static-files
	@echo "Minifying HTML files"
	@cat dist/index.html | $(htmlmin) $(htmlminArgs) > dist/index.min.html
	@mv -f dist/index.min.html dist/index.html

handlebars: dist-dir
	@echo "Compiling Handlebars templates"
	@$(handlebars) $(handlebarsArgs)
	@cat node_modules/handlebars/dist/handlebars.runtime.min.js \
		dist/templates.tmp.js > dist/templates.js
	@rm -f dist/templates.tmp.js

handlebars-min: dist-dir
	@echo "Compiling minified Handlebars templates"
	@$(handlebars) -m $(handlebarsArgs)
	@cat node_modules/handlebars/dist/handlebars.runtime.min.js \
		dist/templates.tmp.js > dist/templates.js
	@rm -f dist/templates.tmp.js

scss: dist-dir
	@echo "Compiling SCSS"
	@$(scss) $(scssMaxArgs) $(scssArgs)

scss-autoprefixer: scss
	@echo "Adding prefixes to compiled SCSS"
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

scss-min: dist-dir
	@echo "Compiling and minifying SCSS"
	@$(scss) $(scssMinArgs) $(scssArgs)

scss-min-autoprefixer: scss-min
	@echo "Adding prefixes to compiled and minified SCSS"
	@$(postcss) $(postcssArgs) -o dist/index.css dist/index.css

js: dist-dir
	@echo "Browserifying JavaScript files"
	@$(browserify) --debug $(browserifyArgs)

js-babel: dist-dir
	@echo "Browserifying and babelifying JavaScript files"
	@$(browserify) -t babelify $(browserifyArgs)

js-min: dist-dir
	@echo "Browserifying, babelifying and minifying JavaScript files"
	@$(browserify) -t babelify -t uglifyify $(browserifyArgs)

docs: dist-dir
	@echo "Generating JSDocs"
	@mkdir -p dist/docs
	@$(jsdoc) -d dist/docs js/main.js

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


lint-scss=./node_modules/.bin/sass-lint -c .sass-lint.yml -s scss
lint-html=./node_modules/.bin/htmlhint -c .htmlhintrc
lint-js=./node_modules/.bin/eslint -c .eslintrc.json

lint: htmlhint sass-lint eslint

htmlhint:
	@echo "Linting Handlebars and index.html templates"
	@$(lint-html) index.html pages/*.hbs

sass-lint:
	@echo "Full SCSS linting not yet implemented (use editor plugin)"
	#@echo "Linting SCSS files"
	#@$(lint-scss) style/components/button style/components/loader

eslint:
	@echo "Linting JavaScript files"
	@$(lint-js) js/
