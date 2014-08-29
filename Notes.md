Development notes
-----------------

How its set up:

 - published via __Bower__
 - tested via __mocha__ + __jsdom__ (see `test/`)
 - minified via __uglifyjs__ (see `Makefile`)
 - clone the site into `pages/`, which is managed via `Makefile`

Tests via JSDom:

    $ npm install
    $ npm test
    $ npm run autotest

Set up Github pages:

    $ git clone git@github.com:rstacruz/swipeshow.git --branch gh-pages pages
    $ make

To regenerate .min.js:

    $ make

To bump version:

    $ bump jquery.swipeshow.js *.json
    # npmjs.org/bump-cli
