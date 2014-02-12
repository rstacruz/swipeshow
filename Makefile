# Builds the pages/ directory.

all: \
	jquery.swipeshow.min.js \
	sample/style.css \
	pages \

%.min.js: %.js
	./node_modules/.bin/uglifyjs "$<" > "$@"

pages: \
	pages/index.html \
	pages/style.css \
	pages/swipeshow.css \
	pages/slideshow-theme.css \
	pages/jquery.swipeshow.min.js \
	pages/jquery.swipeshow.css \
	pages/1.jpg \
	pages/2.jpg \
	pages/3.jpg \

%/:
	mkdir -p "$@"

pages/%.html: sample/%.html
	mkdir -p pages
	cat "$<" | sed "s/\.\.\///g" > "$@"

pages/%.js: %.js
	cp "$<" "$@"

pages/%.css: %.css
	cp "$<" "$@"

pages/%: sample/%
	cp "$<" "$@"

.PHONY: server
