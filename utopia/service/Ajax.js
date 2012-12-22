var AJAX = {


    /**
     * @var {Utopia.HookManager} hookManager Hook manager reference
     */
    hookManager: null,

    /**
     * @property {Object} httpServer
     * HTTP server reference
     */
    httpServer: null,

    /**
     * @var {Array} Array of handlers to load
     */
    handlers: [
    ],

    /**
     * @property {Object} handlersByName
     * Handlers identified by name
     */
    handlersByName: {},

    /**
     * Initialize the global async hook
     *
     * @param {Object} httpServer Connect HTTP server reference
     * @param {Utopia.HookManager} hookManager Hook manager reference
     * @return {Utopia.service.Socket}
     */
    init: function(httpServer, hookManager) {

        // Set local reference
        this.hookManager = hookManager;

        // Set http server reference
        this.httpServer = httpServer;

        // Register handlers from external
        this.initHandlers(hookManager);

        console.log('  [OK] ...AJAX service started.');

        // Return the socket instance
        return this;
    },


    /**
     * Loads and references all Ajax handlers
     * named in the Socket.handlersByName object.
     *
     * @param {Utopia.HookManager} hookManager Hook manager reference
     * @return void
     */
    initHandlers: function(hookManager) {

        var handler = null;
        for (var i=0; i<this.handlers.length; i++) {

            handler = require(this.handlers[i]);
            if (!handler.name) handler.name = 'anonymousHandler-' + i;

            this.handlersByName[handler.name] = handler.init(hookManager)
        }
    },

    /**
     * Returns an Ajax handler instance by name
     * @param {String} name Name of the AJAX handler
     * @return {Object}
     */
    getHandler: function(name) {
        return this.handlersByName[name];
    }
};
module.exports = AJAX;