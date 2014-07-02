/*!
 * jQuery ALDO Hotspot 1.0
 * https://github.com/aldogroup
 *
 * Copyright 2013 Aldo Group
 * Released under the MIT license
 */

(function($) {

  /**
   * Places the target element at the mouse click position
   */
  $.fn.positionAtEvent = function(target, xPosition, yPosition) {
    var container = $(target);
    $(this).css('left', event.pageX - container.offset().left - ($(this).xOffset(xPosition)) + 'px');
    $(this).css('top', event.pageY - container.offset().top - ($(this).yOffset(yPosition)) + 'px');
  };

  /**
   * Calculates the x-axis offset
   */
  $.fn.xOffset = function(xPosition) {
    switch (xPosition) {
    case 'left':
      return 0;
      break;
    default:
      return $(this).width() / 2;
    }
  };

  /**
   * Calculates the y-axis offset
   */
  $.fn.yOffset = function(yPosition) {
    switch (yPosition) {
    case 'top':
      return 0;
      break;
    default:
      return $(this).height() / 2;
    }
  };

  /**
   * Returns an array of position coordinates for a given element
   */
  $.fn.coordinates = function() {
    return {
      right: parseInt($(this).css('right').replace('px', '')),
      bottom: parseInt($(this).css('bottom').replace('px', '')),
      left: parseInt($(this).css('left').replace('px', '')),
      top: parseInt($(this).css('top').replace('px', ''))
    };
  };

  var container = $('body');

  $.fn.hotspot = function(options) {

    // Establish our default settings
    var settings = $.extend({
        debug: false
    }, options);

    var dragging = false;
    var currentSpot;
    var spots = [];

    var xPosition = 'left';
    var yPosition = 'top';

    /**
     * Constructor
     */
    function Spot(type, data) {

      // Set up our instance variables
      this.element        = $(JST.spot({}));
      this.tools          = $(JST.tools({}));
      this.generateButton = $('.generate-btn', this.tools);
      this.clearButton    = $('.clear-btn', this.tools);
      this.inputText      = this.element.find('input');
      this.data           = data;

      this.prepNewSpot();
      spots.push(this);
    }

    /**
     * prepNewSpot
     *
     * Gets called by the constructor. Prepares any necessary
     * changes to the current spot object before launching.
     */
    Spot.prototype.prepNewSpot = function() {
      this.element.addClass('current resizing').show();

      if (settings.debug === false) {
        this.inputText.hide();
      }

      this.addSpotCount($('.spot').length + 1);
      this.prepNewToolsMenu();
    }

    /**
     * prepNewToolsMenu
     *
     * Checks if the tools menu was already added to the DOM.
     * If not, append it to the body.
     */
    Spot.prototype.prepNewToolsMenu = function() {
      if ($('ul.tools').length)
        return

      this.tools.appendTo(container);
    };

    /**
     * makeEditable
     *
     * Main functions that calls all our functionality for
     * each spot object. Call draggable and resizable and
     * adds all the necessary click event handlers.
     */
    Spot.prototype.makeEditable = function() {
      this.element.removeClass('current resizing').show();
      this.inputText.select();

      this.makeDraggable();
      this.makeResizable();

      $('.delete-spot', this.element).bind('click', {
        self: this
      }, this.clickDeleteEvent),
      $('div.overlay', this.element).bind('click', {
        self: this
      }, this.clickOverlayEvent),
      this.clearButton.bind('click', {
        self: this
      }, this.clickClearAllSpots),
      this.generateButton.bind('click', {
        self: this
      }, this.clickGenerateCoordinates);
    }

    /**
     * makeDraggable
     *
     * Calls jQuery UI's draggable and specifies the
     * draggable options - containment and ties in to
     * the start and stop events.
     */
    Spot.prototype.makeDraggable = function() {
      var self = this;

      this.element.draggable({
        containment: 'parent',
        handle: 'div.overlay',
        start: function(event, ui) {
          self.element.addClass('dragging');
        },
        stop: function(event, ui) {
          self.element.removeClass('dragging');
          self.updateTextarea();
        }
      });
    };

    /**
     * makeResizable
     *
     * Calls jQuery UI's resizable and specifies the
     * resizable options - handles, containement and ties
     * in to the start and stop events.
     */
    Spot.prototype.makeResizable = function() {
      var self = this;

      this.element.resizable({
        handles: {
          s: '.bottom',
          n: '.top',
          e: '.right',
          w: '.left',
          se: '.bottom-right',
          sw: '.bottom-left'
        },
        containment: 'parent',
        start: function(event, ui) {
          self.element.addClass('resizing');
        },
        stop: function(event, ui) {
          self.element.removeClass('resizing');
          self.updateTextarea();
        }
      });
    };

    /**
     * updateTextArea
     *
     * Updates the debugger text with the current spot object's
     * styling: width, height, top and left coordinates.
     */
    Spot.prototype.updateTextarea = function() {
      var width  = this.element.width(),
          height = this.element.height(),
          top    = this.element.coordinates().top,
          left   = this.element.coordinates().left,
          output = 'style="width:'+width+';height:'+height+';top:'+top+';left:'+left+'"';

      return this.inputText.val(output).select().prop('disabled', true);
    };

    /**
     * clickOverlayEvent
     *
     * Selects the clicked spot object's debugger text
     */
    Spot.prototype.clickOverlayEvent = function(event) {
      event.preventDefault();
      event.data.self.inputText.select().prop('disabled', true);
    };

    /**
     * clickGenerateCoordinates
     *
     * Generates the coordinates.
     */
    Spot.prototype.clickGenerateCoordinates = function(event) {
      event.preventDefault();

      var output = '';

      $('.spot').each(function(index, value) {
        output += $(this).find('.count > span').text() + ". ";

        var styleAttr = $(this).attr('style');

        // Check to see if we're dealing with a small box
        if ($(this).width() <= 50 || $(this).height() <= 40) {
          output += styleAttr.split('display: block; ').pop() + "\n";
        } else {
          output += styleAttr.replace('display: block; ', '') + "\n";
        }
      });

      console.log(output);
    };

    /**
     * clickClearAllSpots
     *
     * Destroys all spot objects and resets the spot array
     */
    Spot.prototype.clickClearAllSpots = function(event) {
      event.preventDefault();

      $('.spot').remove();
      spots.length = 0;
    };

    /**
     * clickDeleteEvent
     *
     * Destroys the clicked spot object
     */
    Spot.prototype.clickDeleteEvent = function(event) {
      event.preventDefault();
      event.data.self.remove();
    };

    /**
     * remove
     *
     * Gets called by the clickDeleteEvent handler
     */
    Spot.prototype.remove = function() {
      this.element.remove();
      spots.splice($.inArray(this, spots), 1);
    };

    /**
     * addSpotCount
     *
     * Adds the count number to the top left of the spot div which
     * allows us to keep track of the hotspots once we export to
     * the console.
     */
     Spot.prototype.addSpotCount = function(count) {
       this.element.find('span').html(count);
     };

    /**
     * calculateDragDistance
     *
     * Calculates the drag distance between the starting mouse position
     * and modifies the width and height of the current spot accordingly.
     */
    Spot.prototype.calculateDragDistance = function() {
      var spot = currentSpot.element;

      spot.css('width', event.pageX-spot.parent().offset().left-spot.coordinates().left+'px');
      spot.css('height', event.pageY-spot.parent().offset().top-spot.coordinates().top+'px');
    };

    // Prevent the default behavior on all DOM elements
    container.on('click', function(event) {
      if (window.hotspotEnabled) {
        event.preventDefault();
      }
    });

    // The user clicked - check if where they clicked
    // was a valid area and create a new spot object is so.
    container.on('mousedown', function(event) {
      if (window.hotspotEnabled) {
        if (event.which == 1) {
          var target = event.target

          if ( ! isValidStartingPoint(target))
            return;

          dragging = true;

          createHotSpot(target);
        }
      }
    });

    // Once the user finishes clicking...
    container.on('mouseup', function(event) {
      if (window.hotspotEnabled) {
        if (dragging) {
          dragging = false;
          currentSpot.makeEditable();
        }
      }
    });

    // Is the user dragging?
    container.on('mousemove', function(event) {
      if (window.hotspotEnabled) {
        if (dragging) {
          event.preventDefault();

          currentSpot.calculateDragDistance();
          currentSpot.updateTextarea();
        }
      }
    });

    // Creates a new spot object, appends it to the DOM
    // and positions it where the user clicked.
    function createHotSpot(target) {
      currentSpot = new Spot('new');
      currentSpot.element.appendTo(target);
      currentSpot.element.positionAtEvent(target, xPosition, yPosition);
    }

    // Returns true if the DOM element that was clicked
    // contains a relative position
    function isValidStartingPoint(parent) {
      return ($(parent).css('position') == 'relative');
    }
  }

  // Hotspot, fire away!
  //container.hotspot();

  window.JST = window.JST || {};

  var template = function(str) {
    var fn = new Function('obj', 'var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push(\''+str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<%=([\s\S]+?)%>/g, function(match, code) {
      return "',"+code.replace(/\\'/g, "'")+",'";
    }).replace(/<%([\s\S]+?)%>/g, function(match, code) {
      return "');"+code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ')+"__p.push('";
    }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')+"');}return __p.join('');");
    return fn;
  };

  window.JST['spot'] = template('<div class="spot" style="width: 50px; height: 40px;"><div class="border"></div><div class="bottom ui-resizable-s ui-resizable-handle"></div><div class="top ui-resizable-n ui-resizable-handle"></div><div class="right ui-resizable-e ui-resizable-handle"></div><div class="left ui-resizable-w ui-resizable-handle"></div><div class="top-right corner ui-resizable-ne ui-resizable-handle"></div><div class="bottom-right corner ui-resizable-se ui-resizable-handle"></div><div class="bottom-left ui-resizable-sw corner ui-resizable-handle"></div><div class="overlay"></div><a class="delete-spot">Delete</a><div class="count"><span>2</span></div><div class="spot-body" style="top: 60px;"><div id="spot-input"><input type="text" name="textarea"><p class="body"></p></div></div></div>');

  window.JST['tools'] = template('<ul class="tools"><li class="clear-btn">Clear</li><li class="generate-btn">Generate</li></ul>');

})(jQuery);
