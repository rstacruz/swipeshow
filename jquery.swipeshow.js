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
//
//       <!-- optional pegs: (not implemented yet) -->
//       <ul class='pegs'>
//         <li class='peg'><button></button></li> <!-- populated manually -->
//       </ul>
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
//       friction: 0.3,      /* What happens when you swipe out of bounds? */
//       mouse: false,       /* enable mouse dragging controls */
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
//  - Buttons are optional, and will be found in `.slideshow > .next` (and `.previous`)
//  - If there are images inside the slides, it will wait to load them before
//    starting the slideshow.

(function($) {
  $.fn.swipeshow = function(options) {
    if (!options) options = {};

    options = $.extend({}, {
      speed: 700,
      friction: 0.3,
      mouse: false
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

      // Auto-size the container.
      $container.css({ width: width * $slides.length });

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
      bindSwipe($slideshow, $container, c, options);

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
  function bindSwipe($slideshow, $container, c, options) {
    var moving = false;
    var origin;
    var start;
    var timestart;

    var width = $slideshow.width();
    var length = c.list.length;
    var friction = options.friction;

    // Prevent
    $container.find('img').on('mousedown', function(e) {
      e.preventDefault();
    });

    $container.on('touchstart.swipeshow' + (options.mouse ? ' mousedown.swipeshow' : ''), function(e) {
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

    $('body').on('touchmove.swipeshow' + (options.mouse ? ' mousemove.swipeshow' : ''), function(e) {
      if (c.disabled) return;
      if ($container.is(':animated')) return;
      if (!moving) return;

      var delta = getX(e) - origin.x;
      var target = start.x + delta;
      var max = -1 * width * (length - 1);

      // Only prevent scrolling when it's moved too far to the right/left
      if (Math.abs(delta) > 5)
        e.preventDefault();

      // Have some friction when scrolling out of bounds.
      if (target > 0) target *= friction;
      if (target < max) target = max + (target - max) * friction;

      setOffset($container, target, 0);
    });

    $('body').on('touchend.swipeshow' + (options.mouse ? ' mouseup.swipeshow' : ''), function(e) {
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

// ============================================================================

/*! Onloadall (c) 2012 Rico Sta. Cruz, MIT license. */

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

// ============================================================================

/*! Cycler (c) 2012 Rico Sta. Cruz, MIT license. */

// Cycles between a given `list` at a given `interval`.
// Simply define an `onactivate` hook.
//
// All the options are optional except `onactivate`.
//
//     c = new Cycler(list, {
//       interval: 3000,
//       initial: 0, /* first slide's index */
//       onactivate: function(current, index, prev, prevIndex) { ... }, /* Required */
//       onstart: function() { ... },
//       onpause: function() { ... }
//     });
//
// Slideshow example
// -----------------
//
// The most common usecase of Cycler is to make your own carousel/slideshow
// implementation. Here's how you might make one:
//
//     var $parent = $(".slideshow");
//     var $images = $parent.find("img");
//
//     var c = new Cycler($images, {
//       interval: 5000,
//       onactivate: function(current) {
//         $images.hide();
//         $(current).show();
//       }
//     });
//
//     // Custom controls example
//     $parent.find("button.next").on("click", function() { c.next(); });
//     $parent.find("button.prev").on("click", function() { c.previous(); });
//
//     // Pause on hover example
//     $parent.on("hover", function() { c.pause(); }, function() { c.start(); });
//
// Navigating
// ----------
//
// You can switch by slides using `next()`, `previous()` and `goTo()`. When
// these are invoked, the interval timer is reset (that is, it will take 3000ms
// again to switch to the next slide).
//
// If these are called when the slideshow is paused, it should remain paused.
//
// Doing this will trigger the `onactivate` callback.
//
//     c.next();
//     c.previous();
//     c.goTo(0);
//
// The onactivate hook
// -------------------
//
// This is where the magic happens. It's called everytime a new slide is activated.
//
// The callback takes 4 arguments: the current list item (`current`) + its
// index in the list (`index`), and the previous item (`prev`) + its index (`prevIndex`).
//
//     var list = [ 'Apple', 'Banana', 'Cherry' ];
//
//     new Cycler(list, {
//       onactivate: function(current, index, prev, prevIndex) {
//         console.log("Switching from", prev, "to", current);
//         console.log("(from", prevIndex, "to", index, ")");
//       };
//     });
//
//     // Result:
//     //
//     // Switching from null to "Apple" (from null to 0)
//     // Switching from "Apple" to "Banana" (from 0 to 1)
//     // Switching from "Banana" to "Cherry" (from 1 to 2)
//     // Switching from "Cherry" to "Apple" (from 2 to 0)
//
// Pausing
// -------
//
// You can pause and unpause the slideshow with `pause()` and `start()`. Note
// that calling `start()` will reset the interval timer.
//
// These will call the `onpause` and `onstart` callbacks respectively.
//
//     c.pause();
//     c.start();
//
// You can pass `true` as an argument (eg, `c.pause(true)`) to these to supress
// triggering the callbacks.
//
// Properties
// ----------
//
//     c.current    /* Numeric index of current item */
//     c.list       /* The list being cycled */
//
// Chainability
// ------------
//
// All the methods are chainable, too, so you can do:
//
//     c.next().pause();

(function() {
  function Cycler(list, options) {
    this.interval   = options.interval || 3000;
    this.onactivate = options.onactivate || (function(){});
    this.onpause    = options.onpause || (function(){});
    this.onstart    = options.onstart || (function(){});
    this.initial    = (typeof options.initial === 'undefined') ? 0 : options.initial;
    this.autostart  = (typeof options.initial === 'undefined') ? true : options.autostart;
    this.list       = list;
    this.current    = null;

    this.goTo(this.initial);
    if (this.autostart && typeof options.interval === 'number') this.start();

    return this;
  }

  Cycler.prototype = {
    start: function(silent) {
      var self = this;
      if ((!self.isStarted()) && (!silent)) self.onstart.apply(self);

      self.pause(true);
      self._timer = setTimeout(function() {
        self.next();
      }, self.interval);
      return self;
    },

    pause: function(silent) {
      if (this.isStarted()) {
        if (!silent) this.onpause.apply(this);
        clearTimeout(this._timer);
        this._timer = null;
      }
      return this;
    },

    // Delays the interval a bit
    restart: function(silent) {
      if (this._timer) this.pause(true).start(silent);
      return this;
    },

    previous: function() {
      return this.next(-1);
    },

    isStarted: function() {
      return !! this._timer;
    },

    isPaused: function() {
      return ! this.isStarted();
    },

    next: function(i) {
      if (typeof i === 'undefined') i = 1;

      var len = this.list.length;
      if (len === 0) return this;

      // Get the index of the new item
      var idx = (this.current + i + len*2) % len;

      return this.goTo(idx);
    },

    goTo: function(idx) {
      if (typeof idx !== 'number') return this;

      var prev = this.current;
      this.current = idx;

      this.onactivate.call(this, this.list[idx], idx, this.list[prev], prev);
      this.restart(true);
      return this;
    }
  };

  window.Cycler = Cycler;
})();
