# Builds the pages/ directory.

all: \
	sample/style.css \
	pages \
	pages/index.html \
	pages/style.css \
	pages/jquery.swipeshow.js \
	pages/cycler.js \
	pages/1.jpg \
	pages/2.jpg \
	pages/3.jpg \

pages:
	mkdir -p pages

pages/%.js: %.js
	cp "$<" "$@"

pages/%.html: sample/%.html
	cat "$<" | sed "s/\.\.\//\.\//g" > "$@"

pages/%: sample/%
	cp "$<" "$@"

sample/style.css: sample/style.sass _slideshow.sass
	sass "$<" > "$@"

.PHONY: server
