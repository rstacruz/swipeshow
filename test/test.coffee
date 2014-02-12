require './setup'

beforeEach ->
  $("body").html('')

describe 'Swipeshow sanity tests', ->
  it '$.swipeshow', ->
    expect($.swipeshow).be.object

  it '$.unswipeshow', ->
    expect($.unswipeshow).be.function

  it '$.fn.swipeshow', ->
    expect($.fn.swipeshow).be.function

describe 'Slideshow', ->
  beforeEach ->
    @$show = $("""
      <div class='swipeshow'>
        <div class="slides">
          <div class="slide one">one</div>
          <div class="slide two">two</div>
          <div class="slide three">three</div>
        </div>
      </div>
    """).appendTo('body')

  beforeEach ->
    @$show.width(256)

  beforeEach ->
    @$show.swipeshow()

  it 'markup preserved', ->
    expect($('.swipeshow').length).eql 1
    expect($('.slides').length).eql 1
    expect($('.slide').length).eql 3

  describe 'initial magic classes', ->
    it '.swipeshow', ->
      expect($('.swipeshow')).have.class 'swipeshow-active'
      expect($('.swipeshow')).have.class 'running'

    it 'activate first slide', ->
      expect($('.one')).have.class 'active'

  it 'set width of slides', ->
    expect($('.slides').width()).eql 768

  it 'slide left', ->
    expect($('.slide').eq(0)).have.css 'left', '0px'
    expect($('.slide').eq(1)).have.css 'left', '256px'
    expect($('.slide').eq(2)).have.css 'left', '512px'

  it 'slide width', ->
    expect($('.slide').eq(0)).have.css 'width', '256px'
    expect($('.slide').eq(1)).have.css 'width', '256px'
    expect($('.slide').eq(2)).have.css 'width', '256px'

  # it 'x', -> console.log $("body").html()
