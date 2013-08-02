Development notes
-----------------

Set up Github pages:

    $ git clone git@github.com:rstacruz/swipeshow.git --branch gh-pages pages
    $ make

To regenerate .min.js:

    $ make

To bump version:

    $ bump jquery.swipeshow.js
    
Or manually:

    $ vim jquery.swipeshow.js
    /swipeshow.version
