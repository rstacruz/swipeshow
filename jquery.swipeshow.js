/*! Swipeshow (c) 2013 Rico Sta. Cruz, MIT license.
 *  http://ricostacruz.com/swipeshow
 *  https://github.com/rstacruz/swipeshow
 */

;(function($){

/**
 * Opinionated, touch-enabled simple slideshow using Cycler.js.
 *
 *     <div class="slideshow">
 *       <ul class="slides">
 *         <li class="slide"> ... </il>
 *         <li class="slide"> ... </li>
 *         <li class="slide"> ... </li>
 *       </ul>
 *     
 *       <!-- optional controls: -->
 *       <button class="next"></button>
 *       <button class="previous"></button>
 *     </div>
 *
 * To use:
 *
 *     $(".slideshow").swipeshow();
 *
 * Options (all of these are optional):
 *
 *     $(".slideshow").swipeshow({
 *       autostart: true,
 *       interval: 3000,     // Time between movement (ms)
 *       initial: 0,         // First slide's index
 *       speed: 700,         // Animation speed (ms)
 *       friction: 0.3,      // What happens when you swipe out of bounds?
 *       mouse: true,        // enable mouse dragging controls?
 *       keys: true,
 *
 *       onactivate: function(){},
 *       onpause: function(){},
 *
 *       $next:     $("button.next"),
 *       $previous: $("button.previous"),
 *       $dots:     $("div.dots")
 *     });
 *
 *     $(".slideshow").swipeshow().next();
 *     $(".slideshow").swipeshow().previous();
 *     $(".slideshow").swipeshow().goTo(2);
 *
 *     $(".slideshow").swipeshow().pause();
 *     $(".slideshow").swipeshow().start();
 *
 * Assumptions it makes:
 *
 *  - Markup is like above (`.slideshow > .slides > .slide`).
 *  - Buttons (optional), by default, will be found in `.slideshow > .next` (and `.previous`)
 *  - If there are images inside the slides, it will wait to load them before
 *    starting the slideshow.
 */

  $.swipeshow = {};

  $.swipeshow.version = "0.10.9";

  // Detect transition support, jQuery 1.8+ style.
  var transitions = typeof $("<div>").css({transition: 'all'}).css('transition') == 'string';

  var touchEnabled = ('ontouchstart' in document.documentElement);

  // Checks for 3d support
  var has3d = (function() {
    var div = $("<div>");
    div.css('transform', 'translate3d(0,0,0)');
    return div.css('transform') !== '';
  })();

  // Count instances.
  var instances = 0;

  function Swipeshow(element, options) {
    this.$slideshow = $(element);
    this.$container = this.$slideshow.find('> .slides');
    this.$slides    = this.$container.find('> .slide');
    this.options    = options;
    this.tag        = '.swipeshow.swipeshow-'+(++instances);
    this.disabled   = false;

    // Buttons
    this.$next      = getElement(this.$slideshow, options.$next, '.next', '~ .controls .next');
    this.$previous  = getElement(this.$slideshow, options.$previous, '.previous', '~ .controls .previous');
    this.$dots      = getElement(this.$slideshow, options.$dots, '.dots', '~ .controls .dots');

    this._addClasses();
    this._bindButtons();
    this._buildDots();
    if (options.keys) this._bindKeys();

    this.cycler     = this._getCycler();
    if (options.autostart !== false) this._startSlideshow();

    // Bind events.
    this._bindSwipeEvents();
    this._bindHoverPausing();
    this._bindResize();

    return this;
  }

  Swipeshow.prototype = {
    // Public API: delegate to Cycler
    goTo:     function(n) { this.cycler.goTo(n); return this; },
    previous: function()  { this.cycler.previous(); return this; },
    next:     function()  { this.cycler.next(); return this; },
    pause:    function()  { this.cycler.pause(); return this; },
    start:    function()  { this.cycler.start(); return this; },

    isStarted: function()  { return this.cycler && this.cycler.isStarted(); },
    isPaused:  function()  { return !this.isStarted(); },

    defaults: {
      speed: 400,
      friction: 0.3,
      mouse: true,
      keys: true,
      swipeThreshold: { distance: 10, time: 400 }
    },

    unbind: function() {
      var $slideshow = this.$slideshow;
      var $container = this.$container;
      var $slides    = this.$slides;
      var $dots      = this.$dots;
      var tag = this.tag;

      // Kill the timer.
      this.cycler.pause();

      // Unbind the events based on their tag (eg, `swipeshow-1`).
      $container.find('img').off(tag);
      $container.off(tag);
      $(document).off(tag);
      $(window).off(tag);

      // Remove dots
      if ($dots.length) $dots.html('');

      // Unregister so that it can be initialized again later.
      $slideshow.data('swipeshow', null);

      // Remove magic classes
      $slideshow.removeClass('running paused swipeshow-active touch no-touch');
      $container.removeClass('gliding grabbed');
      $container.attr('style', '');
      $slides.removeClass('active');
      $slides.attr('style', '');
      $dots.removeClass('active');
      $('html').removeClass('swipeshow-grabbed');
    },

    /**
     * Returns the cycler instance.
     */

    _getCycler: function() {
      var ss = this;
      var options = this.options;

      return new Cycler(ss.$slides, $.extend({}, options, {
        autostart: false,
        onactivate: $.proxy(this._onactivate, this),
        onpause: $.proxy(this._onpause, this),
        onstart: $.proxy(this._onstart, this)
      }));
    },

    /**
     * On slideshow activate handler for Cycler.
     */

    _onactivate: function(current, i, prev, j) {
      if (this.options.onactivate) this.options.onactivate(current, i, prev, j);

      // Set classes
      if (prev) $(prev).removeClass('active');
      if (current) $(current).addClass('active');

      // Dots
      if (this.$dots.length) {
        this.$dots.find('.dot-item.active').removeClass('active');
        this.$dots.find('.dot-item[data-index="'+i+'"]').addClass('active');
      }

      // Move to the slide
      this._moveToSlide(i);
    },

    /**
     * Moves to slide number `i`. (Internal)
     * For external use, just use goto().
     */

    _moveToSlide: function(i) {
      var width = this.$slideshow.width();
      setOffset(this.$container, -1 * width * i, this.options.speed);
    },

    /**
     * On slideshow pause handler. (Internal)
     */

    _onpause: function() {
      if (this.options.onpause) this.options.onpause();
      this.$slideshow
        .addClass('paused')
        .removeClass('running');
    },

    /**
     * On slideshow start handler. (Internal)
     */

    _onstart: function() {
      if (this.options.onstart) this.options.onstart();
      this.$slideshow
        .removeClass('paused')
        .addClass('running');
    },

    /**
     * Add classes to $slideshow. (Internal)
     */

    _addClasses: function() {
      this.$slideshow.addClass('paused swipeshow-active');
      this.$slideshow.addClass(touchEnabled ? 'touch' : 'no-touch');
    },

    _buildDots: function() {
      var ss    = this;
      var $dots = ss.$dots;
      var tag   = ss.tag;

      if (!$dots.length) return;

      $dots.html('').addClass('active');

      ss.$slides.each(function(i) {
        $dots.append($(
          "<button class='dot-item' data-index='"+i+"'>"+
          "<span class='dot' data-number='"+(i+1)+"'></span>"+
          "</button>"
        ));
      });

      $dots.on('click'+tag, '.dot-item', function() {
        var index = +($(this).data('index'));
        ss.goTo(index);
      });

    },

    _bindKeys: function() {
      var ss = this;
      var tag = ss.tag;
      var RIGHT = 39, LEFT = 37;

      $(document).on('keyup'+tag, function(e) {
        if (e.keyCode == RIGHT)
          ss.next();
        else if (e.keyCode == LEFT)
          ss.previous();
      });
    },

    // Binds events to buttons.
    _bindButtons: function() {
      var ss = this;

      this.$next.on('click', function(e) {
        e.preventDefault();
        if (!ss.disabled) ss.next();
      });

      this.$previous.on('click', function(e) {
        e.preventDefault();
        if (!ss.disabled) ss.previous();
      });
    },

    /**
     * Starts the slideshow initially. (Internal)
     */

    _startSlideshow: function() {
      var ss = this;
      var $images = ss.$slideshow.find('img');

      // If there are images, defer starting until images are loaded.
      if ($images.length === 0) {
        ss.start();
      } else {
        ss.disabled = true;
        ss.$slideshow.addClass('disabled');

        $images.onloadall(function() {
          ss.disabled = false;
          ss.$slideshow.removeClass('disabled');
          ss.start();
        });
      }
    },

    /**
     * Re-adjusts the slideshow after resizing the window. (Internal)
     */

    _bindResize: function() {
      var ss = this;

      $(window).on('resize'+ss.tag, function() {
        var width = ss.$slideshow.width();

        // Re-sit the current slide
        setOffset(ss.$container, -1 * width * ss.cycler.current, 0);

        // Reposition the CSS of the container and slides
        ss._reposition();
      });

      $(window).trigger('resize'+ss.tag);
    },

    /**
     * Reposition the CSS of the container and slides. (Internal)
     */

    _reposition: function() {
      var width = this.$slideshow.width();
      var count = this.$slides.length;

      this.$slides.css({ width: width });
      this.$container.css({ width: width * count });
      this.$slides.css({ visibility: 'visible' });
      this.$slides.each(function(i) { $(this).css({ left: width * i }); });
    },

    /**
     * Binds pause-on-hover behavior. (Internal)
     */

    _bindHoverPausing: function() {
      // No need for this on touch-enabled browsers.
      if (touchEnabled) return;

      var ss = this;
      var tag = ss.tag;
      var hoverPaused = false;

      ss.$slideshow.on('mouseenter'+tag, function() {
        if (!ss.isStarted()) return;
        hoverPaused = true;
        ss.pause();
      });

      ss.$slideshow.on('mouseleave'+tag, function() {
        if (!hoverPaused) return;
        hoverPaused = false;
        ss.start();
      });
    },

    /**
     * Binds swiping behavior. (Internal)
     */

    _bindSwipeEvents: function() {
      var ss = this;
      var $slideshow = ss.$slideshow;
      var $container = ss.$container;
      var c = ss.cycler;
      var options = ss.options;
      var tag = ss.tag;

      // States
      var moving = false;
      var origin;
      var start;
      var delta;
      var lastTouch;
      var minDelta; // Minimum change for it to take effect.

      var width; // widtih of the slideshow
      var length = c.list.length;
      var friction = options.friction;

      // Store the tag so it can be unbound later.
      $slideshow.data('swipeshow:tag', tag);

      // Prevent dragging of the image.
      $container.find('img').on('mousedown'+tag, function(e) {
        e.preventDefault();
      });

      $container.on('touchstart'+tag + (options.mouse ? ' mousedown'+tag : ''), function(e) {
        // Don't do anything if flash.
        if (isFlash(e)) return;

        // Only prevent mouse clicks. This allows vertical scrolling on mobile.
        // Do this before the sanity checks... you don't want the user to
        // accidentally drag the <img>.
        if (e.type === 'mousedown')
          e.preventDefault();

        if (ss.disabled) return;
        if ($container.is(':animated')) $container.stop();

        // Make some elements hard to swipe from.
        if ($(e.target).is('button, a, input, select, [data-tappable]')) {
          minDelta = 100;
        } else {
          minDelta = 0;
        }

        // Add classes.
        $container.addClass('grabbed');
        $('html').addClass('swipeshow-grabbed');

        width  = $slideshow.width();
        moving = true;
        origin = { x: null };
        start  = { x: getOffset($container), started: c.isStarted() };
        delta  = 0;
        lastTouch = null;

        // Pause the slideshow, but resume it later.
        if (start.started) c.pause();
      });

      $(document).on('touchmove'+tag + (options.mouse ? ' mousemove'+tag : ''), function(e) {
        if (ss.disabled) return;
        if ($container.is(':animated')) return;
        if (!moving) return;

        // X can sometimes be NaN because the touch event may not have any X/Y info.
        var x = getX(e);
        if (isNaN(x)) return;

        // Regord the first touch now. on a touchmove, not a touchstart. They
        // sometimes return different x/y coordinates.
        if (origin.x === null) origin.x = x;

        delta = x - origin.x;

        // When swiping was triggered on a button, it should be harder to swipe from.
        if (Math.abs(delta) <= minDelta) delta = 0;

        var target = start.x + delta;
        var max = -1 * width * (length - 1);

        // Only prevent scrolling when it's moved too far to the right/left
        if (Math.abs(delta) > 3)
          e.preventDefault();

        // Have some friction when scrolling out of bounds.
        if (target > 0) target *= friction;
        if (target < max) target = max + (target - max) * friction;

        // Record when it was last touched, so that when the finger is lifted, we
        // know how long it's been since
        lastTouch = +new Date();
        
        setOffset($container, target, 0);
      });

      $(document).on('touchend'+tag + (options.mouse ? ' mouseup'+tag : ''), function(e) {
        if (ss.disabled) return;
        if ($container.is(':animated')) return;
        if (!moving) return;
        if (isFlash(e)) return;

        var left  = getOffset($container);

        // Set classes
        $container.removeClass('grabbed');
        $('html').removeClass('swipeshow-grabbed');

        // Find out what slide it stopped to.
        var index = -1 * Math.round(left / width);

        // If the finger moved, but not enough to advance...
        if (lastTouch && c.current === index) {
          var timeDelta = +new Date() - lastTouch;

          var threshold = options.swipeThreshold;
          // If distance is far enough, and time is short enough.
          // I just winged these magic numbers trying to compare the experience to iOS's Photo app.
          if (Math.abs(delta) > threshold.distance && timeDelta < threshold.time) {
            var sign = delta < 0 ? -1 : 1;
            index -= sign;
          }
        }

        if (index < 0) index = 0;
        if (index > c.list.length-1) index = c.list.length-1;

        // Switch to that slide.
        c.goTo(index);

        // Restart the slideshow if it was already started before.
        if (start.started) c.start();

        // Reset.
        moving = false;
      });
    }
  };

  $.fn.swipeshow = function(options) {
    if (!options) options = {};

    options = $.extend({}, Swipeshow.prototype.defaults, options);

    $(this).each(function() {
      // Idempotency: don't do anything if it's already been initialized.
      if ($(this).data('swipeshow')) return;

      var ss = new Swipeshow(this, options);
      $(this).data('swipeshow', ss);
    });

    return $(this).data('swipeshow');
  };

  /**
   * Unbinds everything.
   */

  $.fn.unswipeshow = function() {
    return this.each(function() {
      var ss = $(this).data('swipeshow');
      if (ss) ss.unbind();
    });
  };

  /**
   * Given a list of selectors, find one that matches and is based on a given `root`.
   *
   *     getElement($(".menu"), "a", "button");
   */

  function getElement(root) {
    var arg;
    for (var i=1; i < arguments.length; ++i) {
      arg = arguments[i];
      if (typeof arg === 'string') {
        var $el = $(arg, root);
        if ($el.length) return $el;
      } else if (typeof arg === 'object' && arg.constructor === $ && arg.length) {
        return arg;
      }
    }

    return $();
  }

  var offsetTimer;

  /**
   * Sets the X offset of the given element `$el` (usually `.slides`).
   * `speed` is in milliseconds. If `speed` is `0`, it happens instantly.
   */

  function setOffset($el, left, speed) {
    $el.data('swipeshow:left', left);
    if (transitions) {
      if (speed === 0) {
        $el.css({ transform: translate(left, 0), transition: 'none' });
      } else {
        $el.css({ transform: translate(left, 0), transition: 'all '+speed+'ms ease' });
      }
    } else {
      if (speed === 0) {
        $el.css({left: left});
      } else {
        $el.animate({left: left}, speed);
      }
    }

    // Add the class to the `.slides` so it can be styled appropriately if needed.
    $el.addClass('gliding');

    if (typeof offsetTimer === 'undefined')
      clearTimeout(offsetTimer);

    offsetTimer = setTimeout(function() {
      $el.removeClass('gliding');
      offsetTimer = undefined;
    }, speed);
  }

  function translate(x,y) {
    if (has3d) {
      return 'translate3d('+x+'px,'+y+'px,0)';
    } else {
      return 'translate('+x+'px,'+y+'px)';
    }
  }

  /**
   * Find the X offset of the container ('.slides').
   * Attempting to parse it out of the transform value ("matrix(1, 0, 0, 1,
   * -200, 0)") never seems to yield the right offset, so let's just go with
   * the stored value.
   */

  function getOffset($el) {
    return $el.data('swipeshow:left') || 0;
  }

  /**
   * Extracts the X from given event object. Works for mouse or touch events.
   */

  function getX(e) {
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0])
      return e.originalEvent.touches[0].clientX;

    if (e.clientX)
      return e.clientX;
  }

  /**
   * Checks if a given event is triggered in a Flash video.
   * https://github.com/rstacruz/swipeshow/issues/14
   */

  function isFlash(e) {
    return $(e.target).is('embed, object');
  }

})(jQuery);

// ============================================================================

/*! Onloadall (c) 2012-2013 Rico Sta. Cruz, MIT license. */

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

/*! Cycler (c) 2012-2013 Rico Sta. Cruz, MIT license. */

/*
 * Cycles between a given `list` at a given `interval`.
 * Simply define an `onactivate` hook.
 *
 * All the options are optional except `onactivate`.
 *
 *     c = new Cycler(list, {
 *       interval: 3000,
 *       initial: 0, // first slide's index
 *       onactivate: function(current, index, prev, prevIndex) { ... }, // Required
 *       onstart: function() { ... },
 *       onpause: function() { ... }
 *     });
 *
 * Slideshow example
 * -----------------
 *
 * The most common usecase of Cycler is to make your own carousel/slideshow
 * implementation. Here's how you might make one:
 *
 *     var $parent = $(".slideshow");
 *     var $images = $parent.find("img");
 *
 *     var c = new Cycler($images, {
 *       interval: 5000,
 *       onactivate: function(current) {
 *         $images.hide();
 *         $(current).show();
 *       }
 *     });
 *
 *     // Custom controls example
 *     $parent.find("button.next").on("click", function() { c.next(); });
 *     $parent.find("button.prev").on("click", function() { c.previous(); });
 *
 *     // Pause on hover example
 *     $parent.on("hover", function() { c.pause(); }, function() { c.start(); });
 *
 * Navigating
 * ----------
 *
 * You can switch by slides using `next()`, `previous()` and `goTo()`. When
 * these are invoked, the interval timer is reset (that is, it will take 3000ms
 * again to switch to the next slide).
 *
 * If these are called when the slideshow is paused, it should remain paused.
 *
 * Doing this will trigger the `onactivate` callback.
 *
 *     c.next();
 *     c.previous();
 *     c.goTo(0);
 *
 * The onactivate hook
 * -------------------
 *
 * This is where the magic happens. It's called everytime a new slide is activated.
 *
 * The callback takes 4 arguments: the current list item (`current`) + its
 * index in the list (`index`), and the previous item (`prev`) + its index (`prevIndex`).
 *
 *     var list = [ 'Apple', 'Banana', 'Cherry' ];
 *
 *     new Cycler(list, {
 *       onactivate: function(current, index, prev, prevIndex) {
 *         console.log("Switching from", prev, "to", current);
 *         console.log("(from", prevIndex, "to", index, ")");
 *       };
 *     });
 *
 *     // Result:
 *     //
 *     // Switching from null to "Apple" (from null to 0)
 *     // Switching from "Apple" to "Banana" (from 0 to 1)
 *     // Switching from "Banana" to "Cherry" (from 1 to 2)
 *     // Switching from "Cherry" to "Apple" (from 2 to 0)
 *
 * Pausing
 * -------
 *
 * You can pause and unpause the slideshow with `pause()` and `start()`. Note
 * that calling `start()` will reset the interval timer.
 *
 * These will call the `onpause` and `onstart` callbacks respectively.
 *
 *     c.pause();
 *     c.start();
 *
 * You can pass `true` as an argument (eg, `c.pause(true)`) to these to supress
 * triggering the callbacks.
 *
 * Properties
 * ----------
 *
 *     c.current    // Numeric index of current item
 *     c.list       // The list being cycled
 *
 * Chainability
 * ------------
 *
 * All the methods are chainable, too, so you can do:
 *
 *     c.next().pause();
 */

(function() {
  function Cycler(list, options) {
    this.interval   = options.interval || 3000;
    this.onactivate = options.onactivate || (function(){});
    this.onpause    = options.onpause || (function(){});
    this.onstart    = options.onstart || (function(){});
    this.initial    = (typeof options.initial === 'undefined') ? 0 : options.initial;
    this.autostart  = (typeof options.autostart === 'undefined') ? true : options.autostart;
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
      if (this.isStarted()) this.pause(true).start(silent);
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
