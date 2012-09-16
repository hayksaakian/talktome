//A jQ plugin for adding mouseover tooltips to elements. Draws from title attributes (by default).
//Creates one new div per page for tooltip
(function($){
  $.fn.tooltip = function(userOptions) {
    var options = $.extend({
          //Delay before tip shows when hovering over selected element
          delay:        200,
          //Delay before fading after mousing away from selected element
          fadeDelay:    400,
          //Amount of time to fade to nothing
          fadeOutTime:  0,
          //CSS class assigned to tooltip div
          className:    "tooltip",
          //Attribute to draw text from for tip
          attribute:    "title",
          //Arbitrary html to override text pulled from attribute
          html:         null
        }, userOptions);

    this.live("hover", function(event) {
      var elem = $(this),
          dataName = "tooltipData",
          stored = elem.data(dataName) || {},
          tip = stored.tip || $("<div></div>").appendTo("body"),
          fadeTip = stored.fadeTip || function() {
            tip.fadeOut(options.fadeOutTime);
          },
          html = stored.html || options.html || elem.attr(options.attribute),
          offset = elem.offset();

      //Cases where there is no text to display, do not continue setting up tooltips for the element
      if(!html)
        return;

      //Handle mouseleave half of hover ([live](http://api.jquery.com/live/) docs might make this clearer)
      if("mouseleave" === event.type) {
        stored.cancelDisplay = true;
        elem.data(dataName, stored);
        setTimeout(fadeTip, options.fadeDelay);
        return;
      }

      //All this stuff gets stored in element's "tooltipData" data
      stored = {
        tip:      tip,
        fadeTip:  fadeTip,
        html:     html
      };
      
      elem.data(dataName, stored);

      tip.addClass(options.className).html(html);

      elem.attr(options.attribute, "");

      setTimeout(function() {
        stored = stored || elem.data(dataName);
        if(stored.cancelDisplay) {
          delete stored.cancelDisplay;
          elem.data(stored);
          return;
        }
        //Positions 5px above and horizontally centered over trigger element. To add variations need to add code (and positioning options)
        tip.css({
          position:     "absolute",
          "top":        offset.top - tip.outerHeight() - 5,
          left:         offset.left + elem.outerWidth()/2 - tip.outerWidth()/2,
          display:      "block"
        });
      }, options.delay);

      return false;

    });

    return this;
  };
}(jQuery));
