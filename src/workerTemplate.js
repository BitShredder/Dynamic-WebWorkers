'use strict';

export default createWorkerTemplate = function (name, executables, helpers) {

    return `
/**
 * dynamic-webworker - https://github.com/TheKarmicKoder/Dynamic-Webworkers
 * name: ${name}
 * created: ${Date.now()}
 */

${helpers}

self.methods = {
    ${executables}
}

self.onmessage = (event) => {

    if (event instanceof Object && event.data.hasOwnProperty('exec')) {
        var args = event.data.args || null;
        self.methods[event.data.exec].call(self, args);
    }
}

function done (fnName) {

    self.postMessage({
        fn: fnName,
        response: Array.prototype.splice.call(arguments, 1)
    });
}
`
};