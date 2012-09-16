//"use strict";
//options consists of modal, fadeTime and positioning params, but also can take a top and left offsets for positioning the dialog,
//bind event listeners with the dialog via bind() which acts like regular jQuery bind method and send them open and close events

XL.Dialog = function(options) {
  if(!options || typeof options.box == "undefined") 
    throw("A box is required for the dialog");

  var defaults = {
        modal: false,
        fadeTime: 100,
        quickDismiss: false,
        closeCallback: null,
        positioning: XL.Dialog.AUTO,
				closer: ".closer",
				dialog: ".dialog",
				closeAfter: null,
				stayCentered: true,
				hideShimOnClose: true
			},
			prop,
			d = this,
			doc = $(document),
			body = $(document.body);

  for(prop in defaults) {
    if(typeof options[prop] == "undefined")
      options[prop] = defaults[prop];
  }

	if(!options.box)
		return;
  d.options = options;
  d.box = $(d.options.box);
  d.isOpen = false;
  
  d.shim = $("<div></div>");
	d.titleBar = $("<div class='titleBar'><a class='closer' href='#'>Close</a><span></span><div class='clear'></div></div>");
  d.originalContent = d.box.html();
  d.box.wrapInner('<div class="dialogContent">');
  d.content = d.box.find(".dialogContent");
  
  d.shim.css({
    position: "absolute",
    top: 0,
    left: 0,
    height: doc.height(),
    width: body.width(),
    zIndex: d.box.css("z-index")
  });
  d.shim.hide();
  d.shim.insertBefore(d.box);

	function handleWindowChange() {
		d.shim.css({
			height: doc.height(),
			width: body.width()
		});
		if(d.isOpen && d.options.stayCentered) {
			d.center.call(d);
		}
	}

	$(window).resize(handleWindowChange).scroll(handleWindowChange);

  
  d.shim.click(function() {
      if(d.options.quickDismiss)
        d.close();
  });


};

XL.Dialog.AUTO = "auto";
XL.Dialog.MANUAL = "manual";

XL.Dialog.prototype = {
  bind: function() {
    this.box.bind.apply(this.box, arguments);
  },
  unbind: function() {
    this.box.unbind.apply(this.box, arguments);
  },
	trigger: function(event) {
		this.box.trigger(event);
	},
  replaceContent: function(content) {
  	this.content.html(content);
  },
	getTitle: function() {
		return this.options.title;
	},
	setTitle: function(title) {
		this.options.title = title;
	},
  closeAfter: function(time) {
  	var d = this;
  	d.closeTimer = setTimeout(function() {
  		d.close();
  	}, time || 3000);
  },
	cancelCloseTimer: function() {
		clearTimeout(this.closeTimer);
	},
  replaceAndFade: function(content, time) {
  	var d = this;
  	d.replaceContent(content);
  	d.closeAfter(time);
  },
  open: function(options) {
    var d = this;
  	options = options || {};
    for(opt in d.options) {
    	if(typeof options[opt] == "undefined")
    		options[opt] = d.options[opt];
    }

    XL.activeDialog = d;
    if(options.positioning == XL.Dialog.AUTO)
      d.center();
		if(options.content)
			d.replaceContent(options.content);
		if(options.title && options.closer) {
			var titleBar = d.titleBar;

			titleBar.find("span").text(options.title);
      //modal or non-allowCloser dialogs have no close button
			if(options.modal && !options.allowCloser)
				titleBar.find(d.options.closer).remove();
			else {
        //handle normal case, setup close link
				d.box.find(d.options.closer).live("click", function() {
					d.close(!!options.allowCloser);
					return false;
				});
			}
			$(titleBar).prependTo(d.box);
		}
    d.shim.show();
		d.trigger("beforeOpen");
    d.box.fadeIn(options.fadeTime * 4);
    d.isOpen = true;
    XL.bindKey(27, function() {
        if(d.options.quickDismiss)
            d.close();
    });
    if(d.box.find("form")) {
    	d.box.find("form:first").find("input[type=text], input[type=email], textarea, select").first().focus();
    }    
    if(options.closeAfter)
    	d.closeAfter(options.closeAfter);
  },
  center: function() {
    var win = $(window),
        top,
        left;

        if(typeof this.options.top != "undefined")
            top = win.scrollTop() + this.options.top;
        else
            top = win.scrollTop() + (win.height() - this.box.height())/2;

        if(typeof this.options.left != "undefined")
            left = win.scrollLeft() + this.options.left;
        else
            left = win.scrollLeft() + (win.width() - this.box.width())/2; 

    this.box.css({
      top: top,
      left: left
    });
  },
  reset: function() {
			var d = this;
			d.content.html(d.originalContent);
  },
  close: function(force) {
      var d = this;
      if(d.options.closeCallback) {
          d.options.closeCallback.call(d);
      }
      if (d.options.modal && !force)
          return;
      if (d.isOpen) {
          d.cancelCloseTimer();
          XL.unbindKey(27);
          d.trigger("beforeClose");
          d.box.fadeOut(d.options.fadeTime, function() {
              XL.activeDialog = null;
              d.trigger("afterClose");
				d.reset();
      });
              d.isOpen = false;
              if (d.options.hideShimOnClose)
                  d.shim.hide();
    }
  }
};


//*Sort of* inherits from Dialog
XL.Dialog.Lightbox = function(options) {
    var l = this;

  l.parent = XL.Dialog;
  options = options || {};
	options.hideShimOnClose = false;
  l.parent.call(l, options);
  l.shim.css({
    backgroundColor: "black",
    opacity: 0.4
  });
};

XL.Dialog.Lightbox.prototype = new XL.Dialog({box:null});
//Show shim on opening a lightbox
XL.Dialog.Lightbox.prototype.open = function() {
	var l = this;
  l.shim.fadeIn(l.options.fadeTime);
  l.parent.prototype.open.apply(l, arguments);
};
//Fade out shim on close
XL.Dialog.Lightbox.prototype.close = function() {
	var l = this;
  l.bind("beforeClose", function() {
		l.shim.fadeOut(l.options.fadeTime);
	});
  l.parent.prototype.close.apply(l, arguments);
};

XL.getTempDialog = function() {
	if(XL.tempDialog)
		return XL.tempDialog;
	
	XL.tempDialog = new XL.Dialog({
		box: $('<div class="dialog">').appendTo("body")
	});
	return XL.tempDialog;
};

//Useful function, call from any screen which has required dialog.js
XL.sendDialogMessage = function(message, options) {
	options = options || {};

	if(XL.activeDialog) {
		var d = XL.activeDialog;
		d.replaceAndFade(message);
	}
	else {
		options = $.extend({content: message, closeAfter: 3000}, options);
		XL.getTempDialog().open(options);
	}
};
