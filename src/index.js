'use strict';

/**
 * Dynamic-WebWorkers
 * 
 * A manager for dynamically generated, dedicated, web workers.
 * 
 * Supports:
 * - Named worker images
 * - Single instance workers
 * - Worker pools for concurrent processing
 * 
 * https://github.com/BitShredder/Dynamic-WebWorkers
 * 
 * License ISC
 */

 import workerManager from './workerManager';

 if (window.Worker && !window.wwm) {
    window.wwm = workerManager;
};
