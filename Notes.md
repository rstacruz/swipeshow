Development notes
-----------------

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
    # github.com/marksteve/bump
    
Or manually:

    $ vim jquery.swipeshow.js
    /swipeshow.version
