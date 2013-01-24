/*! Swipeshow (c) 2013 Rico Sta. Cruz, MIT license. */

// Opinionated, touch-enabled simple slideshow using Cycler.js.
//
//     <div class="slideshow">
//       <ul class="slides">
//         <li class="slide"> ... </il>
//         <li class="slide"> ... </li>
//         <li class="slide"> ... </li>
//       </ul>
//     
//       <!-- optional controls: -->
//       <button class="next"></button>
//       <button class="previous"></button>
//     </div>
//
// To use:
//
//     $(".slideshow").swipeshow();
//
// Options:
//
//     $(".slideshow").swipeshow({
//       autostart: true,
//       interval: 3000,     /* Time between movement (ms) */
//       initial: 0,         /* First slide's index */
//       speed: 700,         /* Animation speed (ms) */
//
//       onactivate: function(){},
//       onpause: function(){},
//     });
//
//     $(".slideshow").data('slideshow').next();
//     $(".slideshow").data('slideshow').previous();
//     $(".slideshow").data('slideshow').goTo(2);
//
//     $(".slideshow").data('slideshow').pause();
//     $(".slideshow").data('slideshow').start();
//
// Classes it adds:
//
//  - `.slide`  -- gets `active` when it's the moving one
//  - `.slides` -- gets `gliding` when it's gliding
//
// Assumptions it makes:
//
//  - Markup is like above (`.slideshow > .slides > .slide`).
//  - If there are images inside the slides, it will wait to load them before
//    starting the slideshow.

(function($) {
  $.fn.swipeshow = function(options) {
    if (!options) options = {};

    options = $.extend({}, {
      speed: 700
    }, options);

    $(this).each(function() {
      var $slideshow = $(this);
      var $container = $slideshow.find('> .slides');
      var $slides    = $container.find('> .slide');

      var width = $slideshow.width();

      // Use Cycler.
      var c = new Cycler($slides, $.extend({}, options, {
        onactivate: function(current, i, prev, j) {
          if (options.onactivate) options.onactivate(current, i, prev, j);

          // Set classes
          if (prev) $(prev).removeClass('active');
          if (current) $(current).addClass('active');

          // Move
          setOffset($container, -1 * width * i, options.speed);
        }
      }));

      // Defer starting until images are loaded.
      if (options.autostart !== false) {
        c.disabled = true;
        $slideshow.addClass('disabled');
        $slideshow.find('img').onloadall(function() {
          c.disabled = false;
          $slideshow.removeClass('disabled');
          c.start();
        });
      }

      // Bind
      bindSwipe($slideshow, $container, c);

      // Bind a "next slide" button.
      $slideshow.find('.next').on('click', function(e) {
        e.preventDefault();
        if (!c.disabled) c.next();
      });

      // Bind a "previous slide" button.
      $slideshow.find('.previous').on('click', function(e) {
        e.preventDefault();
        if (!c.disabled) c.previous();
      });

      // Save the cycler for future use.
      $slideshow.data('slideshow', c);
    });

    return this;
  };

  // Use transitions?
  var transitions = true;

  var offsetTimer;

  function setOffset($el, left, speed) {
    $el.data('swipeshow:left', left);
    if (transitions) {
      if (speed === 0) {
        $el.css({ transform: 'translate3d('+left+'px,0,0)', transition: 'none' });
      } else {
        $el.css({ transform: 'translate3d('+left+'px,0,0)', transition: 'all '+speed+'ms ease' });
      }
    } else {
      if (speed === 0) {
        $el.css({left: left});
      } else {
        $el.animate({left: left}, speed);
      }
    }

    $el.addClass('gliding');

    if (typeof offsetTimer === 'undefined')
      clearTimeout(offsetTimer);

    offsetTimer = setTimeout(function() {
      $el.removeClass('gliding');
      offsetTimer = undefined;
    }, speed);
  }

  function getOffset($el) {
    return $el.data('swipeshow:left') || 0;
  }

  // Binds swiping behavior.
  function bindSwipe($slideshow, $container, c) {
    var moving = false;
    var origin;
    var start;
    var timestart;

    var width = $slideshow.width();
    var length = c.list.length;
    var friction = 0.1;

    // Prevent
    $container.find('img').on('mousedown', function(e) {
      e.preventDefault();
    });

    $container.on('mousedown touchstart', function(e) {
      // Only prevent mouse clicks. This allows vertical scrolling on mobile.
      // Do this before the sanity checks... you don't want the user to
      // accidentally drag the <img>.
      if (e.type === 'mousedown')
        e.preventDefault();

      if (c.disabled) return;
      if ($container.is(':animated')) return;

      moving = true;
      origin = { x: getX(e) };
      start  = { x: getOffset($container), started: c.isStarted() };

      c.pause();

      timestart = +new Date();
    });

    $('body').on('mousemove touchmove', function(e) {
      if (c.disabled) return;
      if ($container.is(':animated')) return;
      if (!moving) return;

      var delta = getX(e) - origin.x;
      var target = start.x + delta;
      var max = -1 * width * (length - 1);

      // Only prevent scrolling when it's moved too far to the right/left
      if (Math.abs(delta) > 10)
        e.preventDefault();

      // Have some friction when scrolling out of bounds.
      if (target > 0) target *= friction;
      if (target < max) target = max + (target - max) * friction;

      setOffset($container, target, 0);
    });

    $('body').on('mouseup touchend', function(e) {
      if (c.disabled) return;
      if ($container.is(':animated')) return;
      if (!moving) return;

      var left  = getOffset($container);

      // Account for velocity.
      var delta = getX(e) - origin.x;
      var duration = +new Date() - timestart;
      var coef = 9 * Math.max(0, 300 - duration) / 300;

      // Find out what slide it stopped to.
      var index = -1 * Math.round(left / width);
      if (index < 0) index = 0;
      if (index > c.list.length-1) index = c.list.length-1;

      // Switch to that slide.
      c.goTo(index);

      e.preventDefault();

      // Restart the slideshow if it was already started before.
      if (start.started) c.start();

      moving = false;
    });

  }

  // Extracts the X from given event object. Works for mouse or touch events.
  function getX(e) {
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0])
      return e.originalEvent.touches[0].clientX;

    if (e.clientX)
      return e.clientX;
  }
})(jQuery);

(function($) {
  $.fn.onloadall = function(callback) {
    var $images = this;

    var images = {
      loaded: 0,
      total: $images.length
    };

    // Wait till all images are loaded...
    $images.on('load.onloadall', function() {
      if (++images.loaded >= images.total) { callback.apply($images); }
    });

    $(function() {
      $images.each(function() {
        if (this.complete) $(this).trigger('load.onloadall');
      });
    });

    return this;
  };
})(jQuery);

