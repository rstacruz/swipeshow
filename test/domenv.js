/**
 * Builds a dom environment.
 *
 *     Dom = require('./support/domenv')
 *     Dom.scripts = {
 *       'jq-2.0': fs.readFileSync('vendor/jquery-2.0.js')
 *       'spine':  fs.readFileSync('vendor/spinejs-1.2.0.js')
 *     }
 *
 *     before(Dom(['jq-2.0', 'spine']));
 */

var domEnv = module.exports = function (scripts) {
  return function (done) {
    return require('jsdom').env({
      html: domEnv.html,
      src: scripts.map(function (n) {
        return domEnv.scripts[n];
      }),
      done: function (errors, window) {
        window.console = {
          log: function () {},
          error: console.error
        };
        global.window = window;
        domEnv.export.forEach(function (name) {
          global[name] = window[name];
        });
        if (errors) errors.forEach(console.log);
        return done(errors);
      }
    });
  };
};

/**
 * HTML to load
 */

domEnv.html = '<!doctype html><html><head></head><body></body></html>';

/**
 * Export these to global
 */

domEnv.export = ['jQuery', '$'];

/**
 * Script sources
 */

domEnv.scripts = {};
