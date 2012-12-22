/**
 * @class Utopia.service.Socket
 * @singleton
 * @extends Object
 * @author Aron Homberg <info@aron-homberg.de>
 *
 * Web service socket.io
 */
var Socket = {

    /**
     * @var {Object} socket.io service reference
     */
    service: null,


    /**
     * @var {Array} clientPool Client socket pool
     */
    clientPool: [],


    /**
     * @var {Object} timeoutPool Client connection timeout pool
     */
    timeoutPool: {},


    /**
     * @var {Utopia.HookManager} hookManager Hook manager reference
     */
    hookManager: null,


    /**
     * @var {socket.io} Socket.io listening reference
     */
    io: null,


    /**
     * @var {Number} Session lifetime in ms
     */
    sessionLifetime: (parseInt(GLOBAL.config.socket) || 15) * 60 * 1000,


    /**
     * @var {Array} Array of handlers to load
     */
    handlers: [
        //'./handler/Account.js',
        //'./handler/Message.js'
    ],


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

        // Let socket.io service communicate through express webserver
        this.io = GLOBAL.socketio.listen(httpServer);

        // Set session lifetime to config value
        this.sessionLifetime = GLOBAL.config.socket.clientLifetime * 60 * 1000;

        // Register handlers from external
        this.initHandlers(hookManager);

        // Bind socket connection to new web clients
        this.io.sockets.on('connection', this.onConnection);

        console.log('  [OK] ...socket service started.');

        // Return the socket instance
        return this;
    },


    /**
     * Gets called for each web client that connects
     *
     * @param {Object} socket Client socket reference
     * @return void
     */
    onConnection: function(socket) {

        console.log('onConnection');

        // TODO: Add a lookup for clients reconnecting after server shutdown!

        // Push socket to client pool
        Socket.clientPool.push(socket);

        // Set a disconnect timeout
        Socket.setTimeout(socket);

        // Walk all handlers function references
        for (var i=0; i<Socket.handlers.length; i++) {

            // Attention: Socket.handlers entries will be
            // replaced by this.initHandlers()!
            for (var eventName in Socket.handlers[i]) {

                with({
                    socket: socket,
                    listenerFn: Socket.handlers[i][eventName],
                    Socket: Socket,
                    eventName: eventName
                }) {

                    // And register their event handlers on the socket connected
                    socket.on(eventName, function() {

                        var socketRequestArguments = arguments;

                        // Reset the disconnect timeout
                        Socket.setTimeout(socket);

                        // Call the session controller to authorize the current request.
                        // Afterwards the handler listener gets calls with information
                        // if it has been authorized or not.
                        GLOBAL.SessionController.authorizeRequest(socket, function(errorName, auth) {

                            // Call the event handler in Socket scope,
                            // Applying the socket reference as first argument
                            // followed by the real event parameters.
                            listenerFn.call(Socket, socket, socketRequestArguments, auth);

                            delete socketRequestArguments;
                        });
                    });
                }
            }
        }

        // Handle disconnects
        socket.on('disconnect', function () {

            console.log('Client disconnected...');

            // Disconnect the client socket
            Socket.disconnectClient(socket);
        });
    },


    /**
     * Loads and references all socket handlers
     * named in the Socket.handlers object.
     *
     * @param {Utopia.HookManager} hookManager Hook manager reference
     * @return void
     */
    initHandlers: function(hookManager) {

        for (var i=0; i<this.handlers.length; i++) {
            this.handlers[i] = require(this.handlers[i]).init(hookManager);
        }
    },


    /**
     * Disconnects client sockets after a specific time if
     * no user action happened.
     *
     * @param {socket.io} socket
     * @return void
     */
    setTimeout: function(socket) {

        // Clear timeout if already existing for socket
        // (this resets the disconnect timeout)
        if (Socket.timeoutPool[socket.id]) {
            clearTimeout(Socket.timeoutPool[socket.id]);
        }

        Socket.timeoutPool[socket.id] = setTimeout(function() {

            // Emit a timeout error
            socket.emit('timeout', {});

            // Disconnect the client socket
            socket.disconnect();

        }, parseInt(Socket.sessionLifetime));
    },


    /**
     * Disconnects a client socket completely.
     * Even destroys session and memory places.
     * @param socket
     * @return void
     */
    disconnectClient: function(socket) {

        // Pop client socket from pool
        Socket.clientPool.pop(socket);

        // Prune timeout
        delete Socket.timeoutPool[socket.id];

        // Free memory
        delete socket;
    },


    /**
     * Returns the io reference to e.g. add an additional
     * listener or emit events.
     * @return {socket.io}
     */
    getIO: function() {
        return this.io;
    }
};
module.exports = Socket;