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
 * [Auto-advance](#options) can be turned on/off (`autostart`)
 * [Configurable](#options), like... totally
 * [Can be controlled](#controlling-the-slideshow) via JavaScript

How to use
----------

### How to use

Follow the HTML markup guide (see below), then use the sample CSS (also listed
below). Then just fire `$('...').swipeshow()`.

### HTML markup

Swipeshow goes by the assumption that your slideshow element looks like `.slides
> .slide`. You are free to put whatever you want inside `.slide`, or even
`.slideshow`!

``` html
<div class="slideshow">
  <ul class="slides">
    <li class="slide"> ... </il>
    <li class="slide"> ... </li>
    <li class="slide"> ... </li>
  </ul>
</div>
```

### CSS

Here's the bare-bone CSS to make Swipeshow work. Notice that all it does is lay
out your `.slides` side-by-side; you'll be in charge of actually styling them
nicely.

By the way, there are [Sass helpers](#sass-helpers) that can make this easier
for you.

``` css
.slideshow,
.slideshow .slides,
.slideshow .slide {
  display: block;
  width: 200px;  /* Change me */
  height: 200px; /* Change me */
  margin: 0;
  padding: 0;
  list-style: none;

  /* For flicker-prevention */
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  -o-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);

  /* In case you add padding */
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  -ms-box-sizing: border-box;
  -o-box-sizing: border-box;
  box-sizing: border-box;
}

.slideshow {
  overflow: hidden;
  position: relative;
}

.slideshow .slides {
  width: 99999px;
  position: absolute;
  top: 0;
  left: 0;
}

.slideshow .slide {
  float: left;

  -webkit-user-select: none;   /* iOS: disable text select */
  -webkit-touch-callout: none; /* iOS: disable callout, image save panel (popup) */
}
```

### JavaScript

...and that's it!

``` js
$(function() {
  $(".slideshow").swipeshow();
});
```

Options
-------

All these options are optional.

``` js
$(".slideshow").swipeshow({
  autostart: true,    /* Set to `false` to keep it steady */
  interval: 3000,     /* Time between switching slides (ms) */
  initial: 0,         /* First slide's index */
  speed: 700,         /* Animation speed (ms) */
  friction: 0.3,      /* Bounce-back behavior; use `0` to disable */
  mouse: true,        /* enable mouse dragging controls */

  onactivate: function(){},
  onpause: function(){},
});
```

Next/previous buttons
---------------------

Add some buttons with the class `.next` and `.previous` inside `.slideshow`.
They will work as expected.
(style them yourself)

``` html
<div class="slideshow">
  <ul class="slides">
    <li class="slide"> ... </il>
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
$(".slideshow").swipeshow({
  $next: $("button.next"),
  $previous: $("button.previous")
});
```

Controlling the slideshow
-------------------------

Access them using `$(".slideshow").swipeshow()`:

``` js
$(".slideshow").swipeshow().next();
$(".slideshow").swipeshow().previous();
$(".slideshow").swipeshow().goTo(2);

$(".slideshow").swipeshow().pause();
$(".slideshow").swipeshow().start();
```

Magic classes
-------------

Your markup gets additional CSS classes depending on things. This allows you to 
style more stuff via CSS.

 - `.slideshow`
   - has the `touch` class when touch is on, or `no-touch` on desktops.
   - has `running` when the slideshow is auto-advancing.
   - has `paused` when the slideshow is paused (like on hover).
 - `.slides`
   - has the `gliding` class when it's gliding.
   - has the `grabbed` class when it's currently being dragged.
 - `.slide`
   - has the `active` class when it's the selected one.
 - `<html>`
   - has the `swipeshow-grabbed` class when grabbing a slide.

Sass helpers
------------

There are quick Sass mixins for use with Swipeshow: [swipeshow.scss].

``` css
@import 'swipeshow';

.slideshow {
  @include swipeshow(200px, 200px);
}

@include swipeshow-grab-cursor;
```

[swipeshow.scss]: https://github.com/rstacruz/swipeshow/blob/master/_swipeshow.scss

Unbinding Swipeshow
-------------------

You can destroy a Swipeshow by doing:

``` js
$(".slideshow").unswipeshow();
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

Limitations
-----------

Some known limitations:

 - It's assumed that the width is fixed. Variable-width slideshows aren't
 supported.

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
