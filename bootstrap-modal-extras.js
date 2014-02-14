/***

    Extra functionality to be appended to the Modal object provided from bootstrap:

    overlay: Create an overlay pane on top of the body section, with a message if desired
    remove_overlay: Remove the created overlay
    center:  the Modal (in case window resizes)
    height: Sets the height of the Modal
    resize: Resizes the Modal (width, height)
    resize_to_contents: Resizes the Modal to the size of the contents in the modal body 
    maximize: Maximizes the Modal window (horizontally, vertically) to the viewport sizes (default: both)

 ***/

(function(jQuery) {
    'use strict';

    var modalVersion;

    if (jQuery.fn.modal) {
        if (jQuery.fn.modal.Modal) {
            modalVersion = 1;
        } else if (jQuery.fn.modal.Constructor) {
            modalVersion = 2;
        }
    }
    else {
        throw 'Bootstrap Modal not loaded';
    }

    //Utility functions
    var bind = function bind(fn, scope) {
            var index = 2;
            var origArgs = Array.prototype.slice.call(arguments, index);

            return function () {
                var context = scope || this,
                    args    = Array.prototype.slice.call(arguments);

                args = origArgs.concat(args);
                fn.apply(context, args);
            };
        },
        fnTimeout = function fnTimeout(fn, time) {
            var args = Array.prototype.slice.call(arguments, 2);
            return setTimeout(function () {
                return fn.apply(null, params);
            }, time);
        },
        fnCallStack = function fnCallStack(fn) {
        },
        checkBoolean = function checkBoolean(val) {
            return val === true || val === false;
        },
        throttle = function throttle(fn, threshhold, scope) {
            // From http://remysharp.com/2010/07/21/throttling-function-calls/#comment-216435
            var threshold = (typeof threshhold !== 'undefined') ? threshold : 250;
            var last,
                deferTimer;
            return function () {
                var context = scope || this;

                var now = +new Date(),
                    args = arguments;
                if (last && now < last + threshhold) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        };


    var ext = {
        version: modalVersion,

        getBody: function() {
            if (!this.$elementBody) {
                this.$elementBody = this.$element.find('.modal-body');
            }
            return this.$elementBody;
        },
        getHeader: function() {
            if (!this.$elementHeader) {
                this.$elementHeader = this.$element.find('.modal-header');
            }
            return this.$elementHeader;
        },
        getFooter: function() {
            if (!this.$elementFooter) {
                this.$elementFooter = this.$element.find('.modal-footer');
            }
            return this.$elementFooter;
        },
        overlay: function() {
            this.remove_overlay();
            var message = arguments[0] || '';
            var bodyEl = jQuery(this.getBody());

            bodyEl.css('position', 'relative')
                .css('overflow', 'hidden')
                .scrollTop(0);

            //Create Overlay
            var overlay = jQuery(bodyEl.clone().html(''));
            var width = bodyEl.outerWidth();
            var height = bodyEl.outerHeight();

            var content = jQuery('<div class="overlay-content"><p>'+message+'...</p></div>');
            content
                .width(width)
                .height(height);

            overlay.appendTo(bodyEl)
                .attr('class', null)
                .attr('style', null)
                .addClass('modal-overlay')
                .width(width)
                .height(height)
                .append(content);
            this.$overlay = overlay;
            return this;
        },
        remove_overlay: function() {
            if(this.$overlay) {
                this.$overlay.remove();
                this.$overlay = undefined;
            }
            this.getBody().css('overflow', 'auto');
        },
        center: function() {
            var winHeight = jQuery(window).height(),
                modHeight = this.$element.outerHeight(),
                topDiff = 0,
                top;

            if(this.version === 1 ) {
                topDiff = modHeight/2;
            } else {
                top = parseInt(this.$element.css('top').replace(/[^0-9.]+/g, ''), 10);
                topDiff = top-((winHeight-modHeight)/2);
            }

            this.$element.css('margin-top', -1 * (topDiff));
            this.$element.css('margin-left', -1 * (this.$element.outerWidth() / 2));
        },
        height: function(height) {
            this.getBody()
                .css('overflow', 'auto')
                .css('max-height', height + 'px')
                .css('height', height + 'px');
            this.center();
        },
        resize: function() {
            var width = arguments[0] || false;
            var height = arguments[1] || false;

            var header = this.getHeader();
            var body = this.getBody();
            var footer = this.getFooter();

            this.$element.css('overflow', 'visible');

            if (width) {
                if(String(width).indexOf('%') === -1) {
                    width = width + 'px';
                }
                this.$element.width(width).css('max-width', width);
            }
            if (height) {
                var padding = 0;
                if (this.$element.css('box-sizing') == 'content-box') {
                    padding = parseInt(header.outerHeight(true), 10) - parseInt(header.height(), 10);
                    padding += parseInt(footer.outerHeight(true), 10) - parseInt(footer.height(), 10);
                    padding -= parseInt(body.css('padding').replace(/[^0-9]/g, ''), 10);
                }
                
                var headerHeight = header.height(),
                    footerHeight = footer.height();
                if(headerHeight === 0) {
                    headerHeight = header.outerHeight();
                }
                if(footerHeight === 0) {
                    footerHeight = footer.outerHeight();
                }
                var maxBodyHeight = height - headerHeight - footerHeight - padding;
                this.$element.height(height).css('max-height', height + 'px');
                body.height(maxBodyHeight).css('max-height', (maxBodyHeight) + 'px');
            }
            this.$element.trigger('resize', width, height, maxBodyHeight)
        },
        resize_to_contents: function() {
            this.maximize(false);
            var maxWidth = 0;
            var padding = 0;
            jQuery.each(this.$element.find('.modal-body > * > *').andSelf(), function(idx, child) {
                padding += child.padding;
                if (jQuery(child).outerWidth(true) > maxWidth) {
                    maxWidth = jQuery(child).outerWidth(true);
                }
            });
            maxWidth += arguments[0] || 30;
            this.resize(maxWidth);
        },
        maximize: function() {
            var width = true;
            var height = true;

            var header = this.getHeader();
            var body = this.getBody();
            var footer = this.getFooter();

            var maxWidth = jQuery(window).width() - 40;
            var maxHeight = jQuery(window).height() - 40;

            if (arguments.length > 0) {
                if (checkBoolean(arguments[0])) {
                    width = arguments[0];
                }
                if (checkBoolean(arguments[1])) {
                    height = arguments[1];
                }
            }

            if(!this.boundResize)
            {
                var resize = throttle(bind(this.resizeFn, this, width, height), 50);
                jQuery(window).bind('resize', resize);
                this.boundResize = true;
            }

            if (width === true) {
                width = maxWidth;
            }
            if (height === true) {
                height = maxHeight;
            }
            this.resize(width, height);
            body.css('overflow', 'auto');
            this.center();
        },
        resizeFn: function(width, height) {
            if (typeof this.$element !== 'undefined' && this.$element.length === 1 && this.$element.is(':visible')) {
                this.maximize(width, height);
            }
        }
    };


    if(modalVersion === 1) {
        jQuery.extend(jQuery.fn.modal.Modal.prototype, ext);
    }
    else if (modalVersion === 2) {
        jQuery.extend(jQuery.fn.modal.Constructor.prototype, ext);
    }
}(window.jQuery));