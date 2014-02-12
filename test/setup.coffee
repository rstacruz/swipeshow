global.chai = require('chai')
global.assert = chai.assert
global.expect = chai.expect
chai.should()

beforeEach -> global.sinon = require('sinon').sandbox.create()
afterEach  -> global.sinon.restore()

Dom = require('./domenv')
read = require('fs').readFileSync

Dom.scripts =
 'jq-2.0':    read('vendor/jquery-2.0.3.js')
 'swipeshow': read('jquery.swipeshow.js')

before Dom(['jq-2.0', 'swipeshow'])
before -> chai.use(require('chai-jquery'))
