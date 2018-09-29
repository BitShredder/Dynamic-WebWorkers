(function () {
    /**
     * @property {number}
     */

    var STATE_IDLE = 0;

    /**
     * @property {number}
     */
    var STATE_BUSY = 1;

    /**
     * @property {number}
     */
    var STATE_ERROR = 2;

    /**
     * @param {DOMString} objectUrl 
     * @param {boolean} useChannels
     * @constructor
     */
    function DynamicWebWorker(objectUrl, useChannels) {

        this.objectUrl = objectUrl;
        this.worker = new Worker(this.objectUrl);

        if (this.worker) {
            this.state = STATE_IDLE;
        } else {
            this.state = STATE_ERROR;
        }

        this.channel = null;
    }

    /**
     * Static method to create a web worker from a Blob
     * 
     * @param {Blob} initialiser 
     * @param {boolean} useChannels
     * @returns {DynamicWebWorker}
     */
    DynamicWebWorker.createWorker = function createWorker(initialiser, useChannels) {

        if (!(initialiser instanceof Blob)) {
            throw new TypeError('Worker initialiser must be of type "Blob"');
        }

        var objectUrl = URL.createObjectURL(initialiser);

        return new DynamicWebWorker(objectUrl, useChannels);
    };

    DynamicWebWorker.prototype = {

        /**
         * Assigns event handlers for message and error events
         * 
         * @param {string}
         * @param {function}
         */
        on: function on(event, callback) {

            this.worker['on' + event] = callback;
        },

        /**
         * Creates messagePorts to connect worker to another worker via channels
         * 
         * @param {WebWorker}
         * @param {MessagePort | null}
         */
        connectTo: function connect(worker, messagePort) {},

        /**
         * Shuts down the worker and cleans up the ObjectURL and message ports.
         * 
         * @param {function} callback   Optional callback to run after shutdown
         */
        shutdown: function shutDown(callback) {

            this.worker.terminate();
            URL.revokeObjectURL(this.objectUrl);

            if (callback) {
                callback.apply();
            }
        },

        /**
         * Executes a worker method passing an array of arguments
         * 
         * @param {string} name     Name of method to execute
         * @param {array} args      Array of arguments to call method with
         */
        exec: function exec(fn, args) {

            this.worker.state = STATE_BUSY;
            this.worker.postMessage({
                exec: fn,
                args: args
            });
        }
    };

    var createWorkerTemplate$1 = createWorkerTemplate = function createWorkerTemplate(name, executables, helpers) {

        return '\n/**\n * dynamic-webworker - https://github.com/TheKarmicKoder/Dynamic-Webworkers\n * name: ' + name + '\n * created: ' + Date.now() + '\n */\n\n' + helpers + '\n\nself.methods = {\n    ' + executables + '\n}\n\nself.onmessage = (event) => {\n\n    if (event instanceof Object && event.data.hasOwnProperty(\'exec\')) {\n        var args = event.data.args || null;\n        self.methods[event.data.exec].call(self, args);\n    }\n}\n\nfunction done (fnName) {\n\n    self.postMessage({\n        fn: fnName,\n        response: Array.prototype.splice.call(arguments, 1)\n    });\n}\n';
    };

    var images = new Map();
    var workers = new Map();

    /**
     * Generates the code for a given worker from the executable function collection
     * and all required helper functions.
     * 
     * Requires all exececutable methids to be named in the collection 
     * 
     * @param {string} name                 Name of worker
     * @param {object} executables          Collection of named functions 
     * @param {array} helpers               Array of functions to inject into worker
     */
    function generateCode(name, executables, helpers) {

        var helperFns = [];
        var execFns = '';

        for (var fnName in executables) {
            if (executables.hasOwnProperty(fnName)) {
                execFns += '\'' + fnName + '\': ' + executables[fnName].toString() + ',\n';
            }
        }

        if (helpers.length > 0) {
            helperFns = helpers.map(function (fn) {
                if (typeof fn === 'function') {
                    return fn.toString();
                }
            });
        }

        return createWorkerTemplate$1(name, execFns, helperFns.join('\n'));
    }

    /**
     * @property {WorkerManager} workerManager
     */
    var workerManager = {

        /**
         * Creates a named WebWorker image
         * 
         * New instances of workers use templates to spin up.
         * @param {string} name             Name of named image/worker
         * @param {object} executables      Collection of named executable functions
         * @param {array} helpers           An array of helper functions required by the worker
         * @param {function} callback       A function to bind to messages from the worker
         * @param {function} errorCallback  Function to bind errors to
         * @param {boolean} useChannels     Flag to indicate if the worker will communicate with other workers
         */
        createImage: function createImage(name, executables, helpers, callback, errorCallback, useChannels) {

            var code = generateCode(name, executables, helpers);
            var image = {
                code: code,
                callback: callback,
                errorCallback: errorCallback,
                useChannels: useChannels
            };

            images.set(name, image);
        },

        /**
         * Spin up a new instance of a named worker
         * 
         * @param {string} name     Name of worker template to use
         */
        start: function start(name) {

            var image = images.get(name);

            if (!image) {
                throw new Error('"' + name + '" was not found in available images');
            }

            var worker = DynamicWebWorker.createWorker(new Blob([image.code]));

            if (!worker) {
                throw new Error('Could not create worker from image');
            }

            worker.on('message', image.callback);
            worker.on('error', image.errorCallback);

            workers.set(name, worker);
        },

        /**
         * Shuts down a named running worker
         * 
         * @param {string} name     Name of worker to shutdown
         */
        shutdown: function shutdown(name) {

            var worker = workers.get(name);

            if (!worker) {
                return;
            }

            worker.shutdown();
            workers.delete(name);
        },

        /**
         * Executes a named method on a named worker with an array of arguments
         * 
         * @param {string} name     Name of worker to execute method on
         * @param {string} fn       Method to execute
         * @param {array} args      Arguments to pass to method
         */
        exec: function exec(name, fn, args) {

            worker = workers.get(name);

            if (!worker) {
                throw new Error('"' + name + '" is not a running worker');
            }

            worker.exec(fn, args);
        }
    };

    if (window.Worker && !window.wwm) {
      window.wwm = workerManager;
    }

}());
