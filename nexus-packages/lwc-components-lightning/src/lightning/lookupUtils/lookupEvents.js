export class LookupEventDispatcher {
    constructor(lookupComponent) {
        this.dispatchEvent = lookupComponent.dispatchEvent.bind(
            lookupComponent
        );
    }

    dispatchChangeEvent(value) {
        this.dispatchEvent(createChangeEvent(value));
    }

    dispatchErrorEvent(error) {
        this.dispatchEvent(createErrorEvent(error));
    }

    dispatchCreateEvent(value, callback) {
        this.dispatchEvent(createCreateNewEvent(value, callback));
    }

    dispatchEntityFilterSelect(value) {
        this.dispatchEvent(createEntityFilterSelectEvent(value));
    }

    dispatchLookupRecordsRequestEvent(requestParams, shouldLoadMore) {
        this.dispatchEvent(
            createLookupRecordsRequestEvent(requestParams, shouldLoadMore)
        );
    }

    dispatchPillRemoveEvent(removedValue) {
        this.dispatchEvent(createPillRemoveEvent(removedValue));
    }

    dispatchRecordItemSelectEvent(selectedValue) {
        this.dispatchEvent(createRecordItemSelectEvent(selectedValue));
    }
}

function createChangeEvent(value) {
    return new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value },
    });
}

function createErrorEvent(error) {
    // eslint-disable-next-line lightning-global/no-custom-event-bubbling
    return new CustomEvent('error', {
        bubbles: true,
        composed: true,
        detail: { error },
    });
}

/**
 * @param {String} value - apiName of the entity for which to create new
 * @param {Function} callback - function to be called after a new record is created
 */
function createCreateNewEvent(value, callback) {
    // eslint-disable-next-line lightning-global/no-custom-event-bubbling
    return new CustomEvent('createnew', {
        bubbles: true,
        composed: true,
        detail: { value, callback },
    });
}

function createEntityFilterSelectEvent(value) {
    return new CustomEvent('entityfilterselect', {
        detail: { value },
    });
}

/**
 * @param {key, value} requestParams - the request parameters to send to parent
 * @param {Boolean} shouldLoadMore - if true lazy load more records with current request params
 */
function createLookupRecordsRequestEvent(requestParams, shouldLoadMore) {
    return new CustomEvent('lookuprecordsrequest', {
        detail: { requestParams, shouldLoadMore },
    });
}

/**
 * @param {String} removedValue - the value of the pill removed from the input.
 */
function createPillRemoveEvent(removedValue) {
    return new CustomEvent('pillremove', {
        detail: { removedValue },
    });
}

/**
 * @param {String} selectedValue - the value selected from the selection panel.
 */
function createRecordItemSelectEvent(selectedValue) {
    return new CustomEvent('recorditemselect', {
        detail: { selectedValue },
    });
}
