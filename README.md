# Dynamic-WebWorkers
Generate WebWorkers on the fly

The purpose of this library is to allow you to spin up WebWorkers  to run methods, already in your codebase, as a background service. You may simply want to avoid additional network overhead by creating a new Worker with an external URL or you have a processing intensive application that can respond dynamically to long running methods that are blocking the call stack and start running them in the background on demand.

The aim of this project is to eventually implement the following WIP

## Current Work in progress...

* Spin up WebWorkers as needed for background processing
* Manage WebWorker pool for concurrent processing
* Use code templates or existing library code
* Manage individual process callbacks
* Event based error handling
* Full documentation with example use cases

## Build the library
To build the library, install the dependencies via NPM and run the build script
```
$ npm install
$ npm run build
```

This build process bundles the library and wraps the code in a **IIFE** which can be included into your web pages. The module will export the `WorkerManager` into the global scope as `window.wwm`.

## Testing
There currently some very basic functional tests using **chromedriver** to run a series of functional tests to:

1. Test that the `WorkerManager` is available in the global scope
2. Test that new images can be registered
3. Test that a new Worker can be created from an image
4. Test that running workers execute code
5. Test that responses are received back in the main thread on completion of code oexecution 
