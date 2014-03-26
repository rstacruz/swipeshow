Swipeshow
=========

The unassuming touch-enabled JavaScript slideshow. Requires jQuery 1.8.

 * __Showcase anything.__ You're not limited to images: any markup will do.
 * __Touch-enabled.__ Swipe away on your iPad, iPhone, Android device, or 
 anything touch-enabled.
 * __Style-it-yourself.__ The default CSS has nothing in it except laying out 
 your slides side-by-side. You'd be in charge of figuring out how to add borders 
 or anything else you like.
 * __Hardware-accelerated.__ Animations are done via CSS transitions, which will
 render smoothly on mobile devices. It will automatically fall back to
 frame-by-frame animation when transitions aren't available.

More features!

 * Auto-pauses on hover
 * Percent-based width slideshows are supported
 * Graceful degradation (shows slide #1 when JS isn't available)
 * [Auto-advance](#options) can be turned on/off (`autostart`)
 * [Configurable](#options), like... totally
 * [Can be controlled](#controlling-the-slideshow) via JavaScript

How to use
----------

### How to use

Follow the HTML markup guide (see below), then use the sample CSS (also listed
below). Then just fire `$('...').swipeshow()`.

### HTML markup

Simply create an element that includes the class `swipeshow` and contains some
slides.

Swipeshow goes by the assumption that your slideshow element looks like
`.slides > .slide`. You are free to put other elements inside `.slide` or `.swipeshow`.

``` html
<div class="my-gallery swipeshow">
  <ul class="slides">
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
  </ul>
</div>
```

In this example, we used the class `my-gallery swipeshow`: where `my-gallery`
is a unique name we gave our slideshow so we can style it later.

### CSS

Define the dimensions of your slideshow. For responsive layouts, you may
also use percent-based widths (`width: 100%`).

``` css
.my-gallery {
  width: 200px;
  height: 200px; }
```

### JavaScript

...and that's it!

``` html
<link rel='stylesheet' href='jquery.swipeshow.css'>
<script src='jquery.swipeshow.js'></script>
```

``` js
$(function() {
  $(".my-gallery").swipeshow();
});
```

Options
-------

All these options are optional.

``` js
$(".my-gallery").swipeshow({
  autostart: true,    /* Set to `false` to keep it steady */
  interval: 3000,     /* Time between switching slides (ms) */
  initial: 0,         /* First slide's index */
  speed: 700,         /* Animation speed (ms) */
  friction: 0.3,      /* Bounce-back behavior; use `0` to disable */
  mouse: true,        /* enable mouse dragging controls */
  keys: true,         /* enable left/right keyboard keys */

  onactivate: function(){},
  onpause: function(){},
});
```

The ```onactivate``` hook is called when you first initialize swipeshow, and again each time a swipe event occurs. The method receives the following arguments:

  * current slide (DOM object)
  * current slide index
  * previous slide (DOM object)
  * previous slide index

Next/previous buttons
---------------------

Add some buttons with the class `.next` and `.previous` inside `.swipeshow`.
They will work as expected.
(style them yourself)

``` html
<div class="my-gallery swipeshow">
  <ul class="slides">
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
  </ul>

  <!-- optional controls: -->
  <button class="next"></button>
  <button class="previous"></button>
</div>
```

If you prefer them to be elsewhere, you can pass them as jQuery objects to 
the options:

``` js
$(".my-gallery").swipeshow({
  $next: $("button.next"),
  $previous: $("button.previous")
});
```

Dots
----

To have dots, simply have a `.dots` container after the `.slides`:

``` html
<div class="my-gallery swipeshow">
  <ul class="slides">
    <li class="slide"> ... </il>
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
  </ul>

  <!-- optional controls: -->
  <div class='dots'></div>
</div>
```

They will be populated like so:

``` html
<div class='dots active'></div>
  <button class='dot-item'><span class='dot' data-number='1'></button>
  <button class='dot-item'><span class='dot' data-number='2'></button>
  <button class='dot-item active'><span class='dot' data-number='3'></button>
</div>
```

If you would prefer them to be elsewhere in your markup, just pass an object to 
`$dots` in the options:

``` js
$(".my-gallery").swipeshow({
  $dots: $("div.dots")
});
```

Controlling the slideshow
-------------------------

Access them using `$(".my-gallery").swipeshow()`:

``` js
$(".my-gallery").swipeshow().next();
$(".my-gallery").swipeshow().previous();
$(".my-gallery").swipeshow().goTo(2);

$(".my-gallery").swipeshow().pause();
$(".my-gallery").swipeshow().start();
```

Magic classes
-------------

Your markup gets additional CSS classes depending on things. This allows you to 
style more stuff via CSS.

 - `.swipeshow`
   - has the `touch` class when touch is on, or `no-touch` on desktops.
   - has `running` when the slideshow is auto-advancing.
   - has `paused` when the slideshow is paused (like on hover).
   - has `swipeshow-active` after Swipeshow is initialized.
 - `.slides`
   - has the `gliding` class when it's gliding.
   - has the `grabbed` class when it's currently being dragged.
 - `.slide`
   - has the `active` class when it's the selected one.
 - `<html>`
   - has the `swipeshow-grabbed` class when grabbing a slide.

Unbinding Swipeshow
-------------------

You can destroy a Swipeshow by doing:

``` js
$(".my-gallery").unswipeshow();
```

This is different from `.swipeshow().pause()` in that it unbinds all events and
destroys any trace of there ever been a slideshow.

This is useful if you want to, say, re-initialize the slideshow with new items
(since you can't change items while a slideshow is happening).

Cycler
------

Need more control over your slideshow? Use [Cycler.js]: a very simple library
for doing slideshow animations. It is bundled with swipeshow, and is also
available separately.

It lets you define all behavior yourself and just provides you a model-like
interface to manage the slides and timers.

[Cycler.js]: https://github.com/rstacruz/jquery-stuff/blob/master/cycler

Alternatives
------------

You may also want to try other libraries. These libraries also support touch, swipe, and mobile-friendly transitions:

 * [Slidesjs](http://www.slidesjs.com/)
 * [Flexslider](https://github.com/woothemes/flexslider)

Limitations
-----------

Some known limitations:

 - It's assumed that the length of slides are fixed. You can't add or remove new
 slides while a slideshow is running.

To get around these limitations, you can always destroy a swipeshow by using
`.unswipeshow()` and re-initializing it.

Also:

 - Only horizontal scrolling is supported. (Seriously, a vertical slideshow is
 silly)

License
-------

MIT
