# Karma Lookup tests

## How to run the test

Run all tests using Chrome Headless :

```bash
yarn test:karma
```

Run only the lookup related tests using Chrome browser with the debug prefix :

```bash
yarn debug:karma --grep "lightning-lookup"
```

## LDS Wire mocks

### Data used for mocks

JSON files are used to store the data in this directory : `ui-lightning-components/src/main/modules/lightning/lookup/__mocks__`.

Access to this data with the `getMock` function from `lightning/testUtils`. Use it inside a Karma test (describe, or it), otherwise it won't work.

### Wire mocks

Wires are mocked using a mock components resolver, see this file : `packages/karma-lwc-preprocessor/index.js`.
This file set up mocking ability using this folder `lookup/__raptorMocks__/`.

Example: this subtree : `__raptorMocks__/karma/lightning/uiActionsApi/uiActionsApi.js`, will mock this import : `lightning/uiActionsApi` (only for Karma tests).

Code example :

```javascript
import { getMock } from 'lightning/testUtils';
import {
    generateWireAdapterMock,
    getImmutableObservable,
    registerWireMock,
} from '../wire';

let STORE_MOCKS = {};

// This function will be used to mock the wire
function getMockWireA(param) { // param could be anything
    const val = STORE_MOCKS[param];
    return val
        ? Promise.resolve(val) // If we found the value send it back
        : Promise.reject({ // If not, reject it for example, or do something else
              error: `getMockWireA: recordId '${recordId}' not found !`,
          });
}

// This function create the adapter for your mocked wire
export const wireA = generateWireAdapterMock(function (config) {

    // Fill the store using getMock
    STORE_MOCKS = getMock('lightning/lookup/__mocks__/uiLookupsApi');

    if (!config || !config.param) {
        return undefined;
    }

    // If config contain expected param, call the getMockWireA function and proxify data using getImmutableObservable utils.
    return getImmutableObservable(getMockWireA(config.param));
});

// And finally, register the wire !
registerWireMock(wireA);
```
