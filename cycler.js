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
      if ((!self._timer) && (!silent)) self.onstart.apply(self);

      self.pause(true);
      self._timer = setTimeout(function() {
        self.next();
      }, self.interval);
      return self;
    },

    pause: function(silent) {
      if (this._timer) {
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
