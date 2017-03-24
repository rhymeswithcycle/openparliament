OP.utils = {

    rot13: function (t){
        return t.replace(/[a-z0-9]/ig, function(chr) {
            var cc = chr.charCodeAt(0);
            if (cc >= 65 && cc <= 90) cc = 65 + ((cc - 52) % 26);
            else if (cc >= 97 && cc <= 122) cc = 97 + ((cc - 84) % 26);
            else if (cc >= 48 && cc <= 57) cc = 48 + ((cc - 43) % 10);
            return String.fromCharCode(cc);
        });
    },

    getQueryParam: function(name, qs) {

        if (!qs) {
            qs = window.location.search;
        }
        else {
            qs = '?' + qs.split('?')[1];
        }

        var match = RegExp('[?&]' + name + '=([^&]*)')
            .exec(qs);

        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

    },

    openShareWindow: function(url) {
        var width = 550;
        var height = 450;
        var left = Math.round((screen.width / 2) - (width / 2));
        var top = 0;
        if (screen.height > height) {
            top = Math.round((screen.height / 2) - (height / 2));
        }
        window.open(url, "openparliament_share", "width=" + width +
            ",height=" + height + ",left=" + left, ",top=" + top +
            "personalbar=no,toolbar=no,scrollbars=yes,location=yes,resizable=yes");
    },

    notify: function(message, tag, opts) {
        /** Display a notification to the user.
         * tag should be 'warning', 'success', or 'error'
         * see defaults for options
         */
        tag = tag || 'warning';
        opts = opts || {};
        _.defaults(opts, {
            'animateIn': true,
            'allowHTML': false,
            'onClose': null,
            'hideAfter': (tag == 'error' ? 10000 : 5000) // # of milliseconds after which to hide the message, 0 to require manual close
        });
        var $target = $('#notifications');

        var escaper = opts.allowHTML ? '<%=' : '<%-';
        // if (!opts.allowHTML) {
        //     message = _.escape(message);
        // }

        var template = _.template('<div class="top-notification <%= tag %>"><div class="row columns">' +
        '<a class="close">&times;</a>' + escaper + ' message %></div></div>');
        var $el = $(template({ message: message, tag: tag}));
        if ($(document).scrollTop() > $target.offset().top) {
            if (!$('#fixed-notification-container').length) {
                $('body').append('<div id="fixed-notification-container"></div>');
            }
            $target = $('#fixed-notification-container');
        }
        if (opts.animateIn) {
            $el.hide();
        }
        $target.append($el);
        if (opts.animateIn) {
            $el.slideDown();
        }

        if (opts.onClose) {
            $el.find('a.close').click(opts.onClose);
        }

        var close = function() {
            $el.find('a.close').click();
        };

        if (opts.hideAfter) {
            setTimeout(close, opts.hideAfter);
        }
        return { close: close};
    }    

};

// https://developer.mozilla.org/en-US/docs/DOM/document.cookie
OP.cookies = {
    getItem: function (sKey) {
        if (!sKey || !this.hasItem(sKey)) { return null; }
        var ck = unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        if (ck.substr(0, 1) === '"' && ck.substr(-1, 1) === '"') {
            return ck.substr(1, ck.length-2);
        }
        return ck;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
};

OP.auth = {
    email: OP.cookies.getItem('email'),

    logout: function() {
        $.ajax({
            type: 'POST',
            url: '/accounts/logout/',
            success: function() { window.location.reload(); },
            error: function (res, status, xhr) {
                OP.utils.notify("Oops! There was a problem logging you out.", 'error');
            }
        });
    }
};

jQuery.fn.overflowtip = function() {
    return this.each(function() {
        if (this.clientWidth < this.scrollWidth
            || (this.clientHeight + 5) < this.scrollHeight) {
            $(this).attr('title', $(this).text());
        	$(this).attr('data-tooltip', true);
        	$(this).addClass('has-tip');
        }
    });
};

$('.overflowtip').overflowtip();
$(document).foundation();

$(function() {
	if (window.Raven) {
	    Raven.config(
	        'https://b5fd50dac5844b9a872b9fb5718ae980@sentry.io/113972',
	        {
	            whitelistUrls: [ /openparliament\.ca/ ],
	            ignoreUrls: [  /extensions\//i, /^chrome:\/\//i ]
	        }
	    ).install();
	}

	$('#navbar-buttons-search').click(function(e) {
		e.preventDefault();
		var $searchbar = $('#navbar-search');
		if ($searchbar.is(':visible')) {
			$searchbar.slideUp('fast');
			$('#navbar-buttons-search').removeClass('active');
		}
		else {
			$searchbar.slideDown('fast', function() {
				$searchbar.find('input').focus();
			});
			$('#navbar-buttons-search').addClass('active');
		}
	});

    $('body').on('click', '.top-notification a.close', function(e) {
        e.preventDefault();
        var $notification = $(e.target).closest('.top-notification');
        
        $notification.slideUp(function() {
            $notification.remove(); // We won't need it again after it's been closed
        });
    }).on('click', 'a.auth-logout', function(e) {
        e.preventDefault();
        OP.auth.logout();
    });;

    $(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
        if (jqXHR.getResponseHeader('X-OP-Redirect')) {
            window.location.href = jqXHR.getResponseHeader('X-OP-Redirect');
        }
    });    

    // This event is to be triggered on AJAX loads too
    $(document).bind('contentLoad', function() {
        // $('.tip, .related_link').tooltip({delay: 100, showURL: false});

        $('a.maillink').attr('href', OP.utils.rot13('znvygb:zvpunry@zvpunryzhyyrl.pbz'));

        $('a[href$="#hl"]').each(function () {
            this.href = this.href.substring(0, this.href.length - 3);
        });
    });

    $(document).trigger('contentLoad');

});