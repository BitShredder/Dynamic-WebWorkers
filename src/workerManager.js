'use strict';

import DynamicWebWorker from './DynamicWebWorker';
import createWorkerTemplate from './workerTemplate';


const images = new Map();
const workers = new Map();

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
function generateCode (name, executables, helpers) {

    let helperFns = [];
    let execFns = '';


    for (let fnName in executables) {
        if (executables.hasOwnProperty(fnName)) {
            execFns += `'${fnName}': ${executables[fnName].toString()},\n`;
        }
    }

    if (helpers.length > 0) {
        helperFns = helpers.map(function (fn) {
            if (typeof fn === 'function') {
                return fn.toString();
            }
        });
    }

    return createWorkerTemplate(name, execFns, helperFns.join('\n'));
}

/**
 * @property {WorkerManager} workerManager
 */
const workerManager = {

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
    createImage: function (name, executables, helpers, callback, errorCallback, useChannels) {

        const code = generateCode(name, executables, helpers);
        const image = {
            code,
            callback,
            errorCallback,
            useChannels
        };

        images.set(name, image);
    },

    /**
     * Spin up a new instance of a named worker
     * 
     * @param {string} name     Name of worker template to use
     */
    start: function (name) {

        const image = images.get(name);

        if (!image) {
            throw new Error(`"${name}" was not found in available images`);
        }

        const worker = DynamicWebWorker.createWorker(new Blob([image.code]));

        if (!worker) {
            throw new Error(`Could not create worker from image`);
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
    shutdown: function (name) {

        const worker = workers.get(name);

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
    exec: function (name, fn, args) {

        worker = workers.get(name);

        if (!worker) {
            throw new Error(`"${name}" is not a running worker`);
        }

        worker.exec(fn, args);
    }
};

export default workerManager;
