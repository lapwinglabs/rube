T= ./node_modules/.bin/duo-test -B build/build.js -c make -P 3000

build/build.js: test/index.js
	@duo --stdout test/index.js > build/build.js

test:
	@./node_modules/.bin/mocha \
		--reporter spec

test-browser: build/build.js
	@$(T) browser

dist: components dist-build dist-minify

browserify:
	@./node_modules/.bin/browserify index.js > out.js

dist-build:
	@mkdir -p dist/
	@duo -g Rube --stdout index.js > dist/rube.js

dist-minify: dist/rube.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://marijnhaverbeke.nl/uglifyjs \
		> $<.tmp
	@mv $<.tmp dist/rube.min.js

.PHONY: test
