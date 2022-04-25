import { Environment, Luvio, NetworkAdapter, Store } from '@luvio/engine';
/**
 * Parameters accepted by setDefaultLuvio.
 */
export declare type SetDefaultLuvioParameters = {
    luvio: Luvio;
} | {
    environment: Environment;
} | {
    store?: Store;
    networkAdapter: NetworkAdapter;
};
/**
 * Callback used to inform interested parties that a new default Luvio has been set.
 */
export declare type Callback = (luvio: Luvio) => void;
/**
 * Constructs/sets the default Luvio instance. Any previously-set default luvio instance
 * is overwritten.
 */
export declare function setDefaultLuvio(params: SetDefaultLuvioParameters): void;
/**
 * Registers a callback to be invoked with the default Luvio instance. Note that the
 * callback may be invoked multiple times if the default Luvio changes.
 *
 * @param callback callback to be invoked with default Luvio instance
 */
export declare function withDefaultLuvio(callback: Callback): void;
