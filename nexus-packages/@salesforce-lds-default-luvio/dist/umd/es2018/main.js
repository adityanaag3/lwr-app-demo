/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@luvio/engine')) :
    typeof define === 'function' && define.amd ? define(['exports', '@luvio/engine'], factory) :
    (global = global || self, factory(global['lds-default-luvio'] = {}, global.luvioEngine));
}(this, (function (exports, engine) { 'use strict';

    // most recently set default Luvio instance
    let defaultLuvio;
    // callbacks to be invoked when default luvio instance is set/changed
    let callbacks = [];
    /**
     * Constructs/sets the default Luvio instance. Any previously-set default luvio instance
     * is overwritten.
     */
    function setDefaultLuvio(params) {
        const newLuvio = 'luvio' in params
            ? params.luvio
            : 'environment' in params
                ? new engine.Luvio(params.environment)
                : 'networkAdapter' in params
                    ? new engine.Luvio(new engine.Environment(params.store || new engine.Store(), params.networkAdapter))
                    : undefined;
        if (newLuvio === undefined) {
            throw new Error('unable to construct default Luvio instance from supplied parameters');
        }
        defaultLuvio = newLuvio;
        // inform observers
        for (let i = 0; i < callbacks.length; ++i) {
            callbacks[i](defaultLuvio);
        }
    }
    /**
     * Registers a callback to be invoked with the default Luvio instance. Note that the
     * callback may be invoked multiple times if the default Luvio changes.
     *
     * @param callback callback to be invoked with default Luvio instance
     */
    function withDefaultLuvio(callback) {
        if (defaultLuvio) {
            callback(defaultLuvio);
        }
        callbacks.push(callback);
    }

    exports.setDefaultLuvio = setDefaultLuvio;
    exports.withDefaultLuvio = withDefaultLuvio;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
// version: 1.13.0-8c83942c
