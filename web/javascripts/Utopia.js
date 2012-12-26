var Utopia = {

    /**
     * @property {socket.io} socket Socket.io client socket
     */
    socket: null,

    localeLoaded: false,

    localeMap: {
        'de-DE': 'de',
        'de': 'de',
        'en': 'en',
        'en_GB': 'en',
        'en_US': 'en'
    },

    defaultLocale: 'de-DE',
    locale: 'en',
    mobileMode: false,

    requires: [
        "/javascripts/thirdparty/detectmobilebrowser.js"
    ],

    requiresCSS: [
        ""
    ],

    partsWithoutJS: [],

    // Application state machine
    states: {

        _defaultLoaded: false,
        history: [],
        current: '',
        _default: []
    },

    /**
     * Requires libs synchronously in sequence
     * @return void
     */
    requireJS: function () {

        var idx = 0, maxIdx = Utopia.requires.length - 1,
            callRequireInSequence = function (idx) {

                require([Utopia.requires[idx]], function () {
                    if (idx < maxIdx) {
                        idx++;
                        callRequireInSequence(idx);
                    }
                });
            };
        callRequireInSequence(idx);
    },

    /**
     * Requires libs synchronously in sequence
     * @return void
     */
    requireCSS: function () {

        var idx = 0, maxIdx = Utopia.requiresCSS.length - 1,
            callRequireInSequence = function (idx) {

                Utopia.loadStyleSheet(Utopia.requiresCSS[idx]);

                setTimeout(function () {

                    if (idx < maxIdx) {
                        idx++;
                        callRequireInSequence(idx);
                    }

                }, 50);
            };
        callRequireInSequence(idx);
    },

    /**
     * Initializes the application frontend
     * @return void
     */
    init: function () {

        // Check for mobile mode by known URL
        if (document.location.pathname.indexOf('mobile') > -1) {
            Utopia.mobileMode = true;
        }

        // Include requires
        Utopia.requireCSS();

        // Fetch locale from browser settings
        Utopia.locale = Utopia.localeMap[Utopia.defaultLocale || window.navigator.userLanguage || window.navigator.language];

        // Add locale to be loaded
        Utopia.requires.unshift('/' + Utopia.locale + '/i18n.js');

        // Include requires
        Utopia.requireJS();

        // Implement DOM ready management
        require(["/javascripts/thirdparty/domReady.js"], function (domReady) {

            // Call callback when DOM is ready
            domReady(function () {

                if (!Utopia.localeLoaded) {

                    var waitForLocale = setInterval(function () {

                        if (Utopia.localeLoaded) {
                            Utopia.onDomReady();
                            clearInterval(waitForLocale);
                        }
                    }, 10);

                } else {
                    Utopia.onDomReady();
                }
            });
        })
    },

    /**
     * Relocate to mobile device to the app
     * promotion page.
     * @return void
     */
    onMobileBrowser: function () {

        // Show mobile switch link
        document.getElementById('mobileLink').style.display = 'block';

        // Never ask if already in mobile mode
        if (document.location.pathname.indexOf('mobile') > -1) {
            Utopia.mobileMode = true;
            return;
        }

        // Check for decision already made
        var mobileAlreadyChoosen = Utopia.getCookie('mobileChoosen');

        if (!mobileAlreadyChoosen) {

            if (confirm(Utopia._('Go to mobile version?'))) {

                // Find next slash (/) position after $locale name
                var nextSlashPos = document.location.pathname.indexOf('/', 1);
                var mobileURL = document.location.pathname.substring(0, nextSlashPos)
                    + '/mobile' + document.location.pathname.substring(nextSlashPos);

                // Redirect to mobile
                document.location.href = mobileURL;

                Utopia.setCookie('mobileChoosen', true);

            } else {

                Utopia.setCookie('mobileChoosen', true);
            }
        }
    },

    /**
     * Load locale determined on browser settings
     * @return void
     */
    onDomReady: function () {

    },

    /**
     * Loads a stylesheet
     * @param {String} url CSS url
     * @return void
     */
    loadStyleSheet: function (url) {

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    },

    /**
     * Conditional logger method.
     * Prevents undefined errors if no developer tools are available.
     *
     * @param {* ...} args Any argument(s)
     * @return void
     */
    log: function (/* {*} args... */) {

        if (console.log) {
            console.log(arguments)
        }
    },

    /**
     * Translate method
     * @param {String} key Translation key
     * @return {String}
     */
    _: function (key) {
        return Utopia.i18n[key] || key;
    },

    /**
     * Shows a loading message
     * @param {String/Boolean} msg Message to show or boolean false to hide
     * @return void
     */
    showLoading: function (msg) {

        if (!msg) {

            // Hide
            $('.SiteLoadingMask').fadeTo(200, 0, function () {
                $('.SiteLoadingMask').attr('style', 'display: none');

                $('.SiteLoadingMaskIndicator').fadeTo(200, 0, function () {
                    $('.SiteLoadingMaskIndicator').attr('style', 'display: none');
                });
            });

        } else {

            $('.SiteLoadingMask').attr('style', 'display: block');

            // Show
            $('.SiteLoadingMask').fadeTo(200, 0.1);
            $('.SiteLoadingMaskIndicator').fadeTo(200, 1);

            // Set loading message if set
            if (typeof msg === 'string' && msg.length > 0) {
                $('.SiteLoadingMaskIndicator').html('<div class="msg">' + msg + '</div>');
            }

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
    },

    // Language chooser implementation
    LanguageChooser: {

        /**
         * Store locale setting in localStorage API
         * @param {String} locale Locale name
         * @return void
         */
        "switch": function (locale) {

            // Find next slash (/) position after $locale name
            var nextSlashPos = document.location.pathname.indexOf('/', 1);

            // Reload page to re-translate
            window.location.href = '/' + locale + document.location.pathname.substring(nextSlashPos);
        }
    }
};

// Shortcut for translation
window.Utopia = Utopia;
window._ = Utopia._;
window.log = Utopia.log;

// Load locale and show website elements
Utopia.init();