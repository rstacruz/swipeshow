## v0.10.9 - January 10, 2015

 * Fix clicks not firing in touch screen devices (@iankpconcentricsky, #28)

## v0.10.8 - August 29, 2014

 * Re-release with proper version numbers (`$.swipeshow.version`). No practical changes.

## v0.10.7 - August 29, 2014

 * Add CSS files to the bower.json manifest. (@billymoon, #26)

v0.10.6 - Mar 23, 2014
----------------------

 * Fix `input` elements not being clickable inside slideshows. (Ty Yalniz)

v0.10.5 - Feb 12, 2014
----------------------

 * Add tests.
 * Prevent disappearing YouTube videos. (@mariacha, #14)

v0.10.4 - Oct 4, 2013
---------------------

 * Support browsers without translate3d (eg, Opera).
 * Docs: document the onactivate hook. (@mikefowler, #10)
 * Allow usage as an NPM package. (@milesmatthias, #8)
 * Docs: update to be less ambiguous. (#11)
 * Bower support.

v0.10.3 - Aug 2, 2013
---------------------

  * Add support for keyboard keys (left and right). Disable it with `keys: 
  false`

v0.10.2 - Feb 23, 2013
----------------------

  * Added `swipeThreshold` option to allow adjusting the threshold for swipes.
  * Fix visibility of first slide.

v0.10.1 - Jan 27, 2013
----------------------

  * Slideshows now have default dimensions.
  * New: Dots are implemented.
  * New: There's a sample theme in sample/slideshow-theme.css.

v0.10.0 - Jan 26, 2013
----------------------

  * Percent-based widths are now supported (`width: 100%`).
  * CSS has been simplified.
  * Sass helpers have been deprecated. (since the CSS is already quite simple!)

Other changes and fixes:

  * Disable pause-on-hover for touch devices.
  * (Internal) lots of refactors.
  * Implement 'swipeshow-active' class.
  * Remove magic classes after `unswipeshow()`.

v0.9.2 - Jan 25, 2013
---------------------

  * Implement .unswipeshow().
  * Implement pause-on-hover.
  * Implement `paused` and `running` classes.

v0.9.1 - Jan 25, 2013
---------------------

  * Fix bug where iPhone dragging can reset the page to 0 unexpectedly.
  * Tweak scroll-prevention code.
  * Faster default speed.
  * When swiping from a button or link, make swiping harder (inertia).
  * Prevent tap callout in iOS.
  * Implement 'drag velocity'.
  * Recommend box-sizing: border-box in CSS.
  * Auto-detect transition support.
  * README: Mention CSS transitions.
  * README: fix Sass helpers link.
  * README: add a mention about Cycler.

v0.9.0 - Jan 25, 2013
---------------------

Initial.
