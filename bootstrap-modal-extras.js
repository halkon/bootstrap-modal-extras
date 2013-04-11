/***
 *
 */

(function(jQuery) {
    'use strict';
    var ext = {
        getBody: function() {
            if(!this.$elementBody)
            {
                this.$elementBody = this.$element.find('.modal-body');
            }
            return this.$elementBody;
        },
        getHeader: function() {
            if(!this.$elementHeader)
            {
                this.$elementHeader = this.$element.find('.modal-header');
            }
            return this.$elementHeader;
        },
        getFooter: function() {
            if(!this.$elementFooter)
            {
                this.$elementFooter = this.$element.find('.modal-footer');
            }
            return this.$elementFooter;
        },
        overlay: function() {
            this.remove_overlay();
            var message = arguments[0] || '';
            var bodyEl = jQuery(this.getBody());

            bodyEl
                .css('position', 'relative')
                .css('overflow', 'hidden')
                .scrollTop(0);
    
            //Create Overlay
            var overlay = jQuery(bodyEl.clone().html(''));

            overlay
                .appendTo(bodyEl)
                .attr('class', null)
                .attr('style', null)
                .width(bodyEl.outerWidth())
                .height(bodyEl.outerHeight())
                .addClass('modal-validating')
                .addClass('modal-backdrop')
                .addClass('element-overlay')
                .css('position', 'absolute')
                .html('<p>{}...</p>'.format(message));
            return this;
        },
        remove_overlay: function() {
            this.getBody().find('.modal-backdrop').remove();
            this.getBody().css('overflow', 'auto');
        },

        center: function() {
            this.$element.css('margin-top', -1 * (this.$element.outerHeight() / 2));
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
                this.$element.width(width).css('max-width', width + 'px');
            }
            if (height) {
                var padding = 0;
                if (this.$element.css('box-sizing') == 'content-box') {
                    padding =  parseInt(header.outerHeight(true), 10) - parseInt(header.height(), 10);
                    padding += parseInt(footer.outerHeight(true), 10) - parseInt(footer.height(), 10);
                    padding -= parseInt(body.css('padding').replace(/[^0-9]/g, ''), 10);
                }
                this.$element.height(height).css('max-height', height + 'px');

                var headerHeight = parseInt(header.outerHeight(true), 10);
                var footerHeight = parseInt(footer.outerHeight(true), 10);

                var maxBodyHeight = height - headerHeight - footerHeight - padding;
                body.height(maxBodyHeight).css('max-height', (maxBodyHeight) + 'px');
            }
            this.center();
        },
        resize_to_contents: function() {
            this.maximize(false);
            var maxWidth = 0;
            var padding = 0;
            $.each(this.$element.find('.modal-body > * > *').andSelf(), function(idx, child) {
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
                if (_.isBoolean(arguments[0])) {
                    width = arguments[0];
                }
                if (_.isBoolean(arguments[1])) {
                    height = arguments[1];
                }
            }

            if (width === true) {
                width = maxWidth;
            }
            if (height === true) {
                height = maxHeight;
            }
            this.resize(width, height);
            body.css('overflow', 'auto');
            var resize = _.throttle(_.bind(function() {
                if (!_.isUndefined(this.$element)) {
                    this.maximize(width, height);
                }
            }, this), 750);
            jQuery(window).bind('resize', resize);

            this.center();
        }
    };

    if (jQuery.fn.modal) {
        if (jQuery.fn.modal.Modal) {
            $.extend(jQuery.fn.modal.Modal.prototype, modalConf);
        } else if (jQuery.fn.modal.Constructor) {
            $.extend(jQuery.fn.modal.Constructor.prototype, modalConf);
        }
    }
}(window.jQuery));