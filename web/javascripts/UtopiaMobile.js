Utopia = {

    init: function () {

        $.mobile.loadingMessage = false;
        $.mobile.ajaxEnabled = false;

        Utopia.initListeners();
    },

    toNavigation: function() {
        window.scroll(0,0);
        Utopia.showNavigation(true);
    },

    initListeners: function () {

        $(document).ready(function () {

            $('#menu').click(Utopia.showNavigation);
        });
    },

    showNavigation: function () {

        var isVisible = $('#menu-popup').attr('isvisible');

        if ((isVisible === "false" || typeof isVisible === 'undefined') || arguments[0] === true) {

            $('#menu-popup').css('display', 'block');
            $('#menu-popup').attr('isvisible', true);

        } else {
            console.log('hide again')

            $('#menu-popup').css('display', 'none');
            $('#menu-popup').attr('isvisible', false);
        }
    },

    setCookie: function (c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    },

    getCookie: function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
    }
};

Utopia.init();