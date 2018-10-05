'use strict'

/**
 * @param {DOMString} objectUrl 
 * @param {boolean} useChannels
 * @constructor
 */
function DynamicWebWorker (objectUrl, useChannels) {

    this.objectUrl = objectUrl;
    this.worker = new Worker(this.objectUrl);

    if (this.worker) {
        this.state = DynamicWebWorker.STATE_IDLE;
    } else {
        this.state = DynamicWebWorker.STATE_FAILURE;
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
DynamicWebWorker.createWorker = function createWorker (initialiser, useChannels) {

    if (!(initialiser instanceof Blob)) {
        throw new TypeError('Worker initialiser must be of type "Blob"');
    }

    const objectUrl = URL.createObjectURL(initialiser);

    return new DynamicWebWorker(objectUrl, useChannels);
}


/**
 * @property {number}
 */
DynamicWebWorker.STATE_FAILURE = -1;

/**
 * @property {number}
 */
DynamicWebWorker.STATE_IDLE = 0;

/**
 * @property {number}
 */
DynamicWebWorker.STATE_BUSY = 1;

/**
 * @property {number}
 */
DynamicWebWorker.STATE_ERROR = 2;


DynamicWebWorker.prototype = {

    /**
     * Assigns event handlers for message and error events
     * 
     * @param {string}
     * @param {function}
     */
    on: function on (event, callback) {

        this.worker[`on${event}`] = callback;
    },

    /**
     * Creates messagePorts to connect worker to another worker via channels
     * 
     * @param {WebWorker}
     * @param {MessagePort | null}
     */
    connectTo: function connect (worker, messagePort) {

    },

    /**
     * Shuts down the worker and cleans up the ObjectURL and message ports.
     * 
     * @param {function} callback   Optional callback to run after shutdown
     */
    shutdown: function shutDown (callback) {

        this.worker.terminate();
        URL.revokeObjectURL(this.objectUrl);

        if (callback) {
            callback.apply()
        }
    },

    /**
     * Executes a worker method passing an array of arguments
     * 
     * @param {string} name     Name of method to execute
     * @param {array} args      Array of arguments to call method with
     */
    exec: function (fn, args) {

        this.worker.state = DynamicWebWorker.STATE_BUSY;
        this.worker.postMessage({
            exec: fn,
            args: args
        });
    }
}

export default DynamicWebWorker;