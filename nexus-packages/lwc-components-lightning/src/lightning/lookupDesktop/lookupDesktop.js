import labelSearchObjectsPlaceholder from '@salesforce/label/LightningLookup.searchObjectsPlaceholder';
import labelSearchPlaceholder from '@salesforce/label/LightningLookup.searchPlaceholder';
import labelSelectObject from '@salesforce/label/LightningLookup.selectObject';
import {
    COMMON_LOOKUP_CONSTANTS,
    GET_LOOKUP_RECORDS_WIRE_CONSTANTS,
    log,
    LOGGING_CONSTANTS,
    LookupEventDispatcher,
    LookupPerformanceLogger,
    LookupUtils,
    MetadataManager,
} from 'lightning/lookupUtils';
import { api, LightningElement, track } from 'lwc';
import { showAdvancedSearch } from './advancedSearch';
import * as CONSTANTS from './constants';

const i18n = {
    searchPlaceholder: labelSearchPlaceholder,
    searchObjectsPlaceholder: labelSearchObjectsPlaceholder,
    selectEntity: labelSelectObject,
};

/**
 * Displays an input lookup for the Desktop.
 */
export default class LightningLookupDesktop extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * @return {Boolean} - Indicates whether or not to show the create new option.
     */
    @api enableCreateNew;

    /**
     * Error message to be displayed under the lookup input.
     * @type {String}
     */
    @api
    get errorMessage() {
        return this._errorMessage;
    }

    set errorMessage(message) {
        this._errorMessage = message;
        // set message on grouped combobox.
        const groupedCombobox = this._groupedCombobox;

        if (groupedCombobox) {
            groupedCombobox.setCustomValidity(message);
            groupedCombobox.reportValidity();
        }
    }

    /**
     * @return {String} - The lookup field name.
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    /**
     * Sets the field name for the lookup.
     * @param {String|FieldId} value - The lookup field name.
     */
    set fieldName(value) {
        this._fieldName = value;
        this.updateState();
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }

        const combobox = this._groupedCombobox;
        if (combobox) {
            combobox.focus();
        }
    }

    /**
     * The combobox input text value.
     * @type {String}
     */
    @api inputText = '';

    /**
     * The list of items used to display in combobox.
     * @type {Array}
     */
    @api
    get items() {
        return this._items;
    }

    set items(groupedItems) {
        this._lookupPerformanceLogger.startRenderMark();
        let { items } = LookupUtils.getSearchTypeAndItems(groupedItems);
        this._lookupPerformanceLogger.mergeTransactionAttributesWith({
            qResults: items ? items.length : 0,
        });
        if (this.enableCreateNew === true) {
            groupedItems = [
                ...groupedItems,
                LookupUtils.computeCreateNewOption(this.textInfo.targetLabel),
            ];
        }
        this._items = groupedItems;
        this.showActivityIndicator = false;
    }

    /**
     * The text label for the field.
     * @type {String}
     */
    @api label;

    /**
     * @return {Number} - The maximum number of values supported by the lookup.
     */
    @api maxValues;

    /**
     * @return {Object} - The source record's objectInfos.
     */
    @api
    get objectInfos() {
        return this._objectInfos;
    }

    /**
     * Sets the source record's objectInfos.
     * @param {Object} value - The source record's objectInfos.
     */
    set objectInfos(value) {
        this._objectInfos = value;
        this.updateState();
    }

    /**
     * Selected records get from combobox
     * @type {Array}
     */
    @api
    get pills() {
        return this._pills;
    }

    set pills(pills) {
        this._pills = pills || [];
        this._value = this._pills.map((p) => p.value);
        if (this.maxValues === 1 && this._pills.length) {
            this.inputPill = this._pills[0];
            this.internalPills = [];
        } else {
            this.internalPills = this._pills;
            this.inputPill = null;
        }

        if (this._pills.length) {
            this.inputText = '';
            this.dispatchEvent(new CustomEvent('reportvalidity'));
        }

        this.updateFilterItems();
    }

    /**
     * @return {Object} - The source record representation.
     */
    @api
    get record() {
        return this._record;
    }

    /**
     * Sets the source record representation.
     * @param {Object} value - The source record.
     */
    set record(value) {
        this._record = value;
        this.updateState();
    }

    /**
     * The field info in the object info is not updated based on the layout metadata.
     * It allows field to be marked as required for the given layout.
     * @return {Boolean} - Indicates whether or not the field is required.
     */
    @api required;

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    @api textInfo;

    /**
     * Gets the validity constraint of the lookup.
     * @return {Object} - The current validity constraint.
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Sets the variant type for the lookup.
     * @type {String}
     */
    @api variant;

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================

    /**
     * The list of entities used to display. Format is {text, value}
     * @type {Array}
     */
    @track filterItems;

    /**
     * The name of entity field for accessibility purposes.
     * @type {String}
     */
    @track filterLabel;

    /**
     * The utility icon name for the combobox input.
     * @type {String}
     */
    @track inputIconName;

    /**
     * The max size (in characters) for the combobox input.
     * @type {Number}
     */
    @track inputMaxlength;

    /**
     * Selected value to pass to combobox as input pill.
     * Note - Should only get used in a single-value lookup.
     * @type {Object}
     */
    @track inputPill = null;

    /**
     * Selected records to pass to combobox pill container.
     * Note - Should only get used in a multi-value lookup.
     * @type {Array}
     */
    @track internalPills = [];

    /**
     * A localized placeholder for the input.
     * @type {String}
     */
    @track placeholder = '';

    /**
     * Indicates if the data is being received over wire. This is used to control the spinner.
     * @type {Boolean}
     */
    @track showActivityIndicator;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================

    /**
     * Indicates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    _errorMessage;

    /**
     * The qualified field name.
     * @type {String|FieldId}
     */
    _fieldName;

    _items = [];

    _lookupPerformanceLogger = new LookupPerformanceLogger();

    _metadataManager;

    /**
     * The additional optional fields for the @wire(getRecordUi).
     * @type {Array}
     */
    _optionalFields;

    /**
     * Internal copy of pills. It gets used to populate inputPill as well as internalPills in the
     * combobox pill container.
     * @type {Array}
     */
    _pills = [];

    _previousQueryTermSent;

    _selectedEntityApiName = undefined;

    /**
     * @return {Array} An array of selected lookup values.
     */
    _value;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================

    /**
     * The field level help text.
     * @type {String}
     */
    get fieldLevelHelp() {
        return this._metadataManager.fieldLevelHelp;
    }

    /**
     * Returns an input text for the entity filter.
     * @returns {String} See desc.
     */
    get filterInputText() {
        return this._metadataManager.targetLabel;
    }

    /**
     * The field api name to trigger @wire(getLookupRecords).
     * Note - Should be only used to trigger the wire.
     * @type {Object}
     */
    get _fieldApiName() {
        return this._metadataManager.fieldApiName;
    }

    /**
     * Returns the grouped combobox element
     * @returns {Object}
     */
    get _groupedCombobox() {
        return this.template.querySelector(CONSTANTS.LIGHTNING_COMBOBOX);
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this._metadataManager = new MetadataManager();
        this.inputIconName = COMMON_LOOKUP_CONSTANTS.ICON_SEARCH;
        this.inputMaxlength = CONSTANTS.INPUT_MAX_LENGTH;
        this.filterLabel = i18n.selectEntity;
        this._events = new LookupEventDispatcher(this);
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
    }

    renderedCallback() {
        this._lookupPerformanceLogger.endRenderMark();
        this._lookupPerformanceLogger.endTransaction();
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    /**
     * Callback method executed by the parent component to update values after handling "createnew" event.
     * @param {Array} values - An array of newly created record ids.
     */
    createNewCallback(values = []) {
        if (!Array.isArray(values) || !values.length) {
            return;
        }

        this.handleRecordOptionSelect(values[0], true);
    }

    getPlaceholder() {
        if (this._metadataManager.isSingleEntity) {
            // Returns "Search <label>", for example - "Search Accounts".
            return i18n.searchObjectsPlaceholder.replace(
                '{0}',
                this._metadataManager.targetPluralLabel
            );
        }
        // Returns "Search..."
        return i18n.searchPlaceholder;
    }

    /**
     * Handles advanced search by showing scoped results in a panel.
     */
    handleAdvancedSearchAction() {
        // Log click on advanced search option interaction.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_ACTION_OPTION,
            {
                scopeName: this._metadataManager.targetApiName,
                type: LOGGING_CONSTANTS.LOG_ACTION_SEARCH_OPTION,
            }
        );

        const scopeMap = this._metadataManager.getTargetObjectAsScope();
        const saveCallback = (values) => {
            // Advanced search returns an array of selected values.
            if (values && values.length > 0) {
                // Select first value as selected value.
                this.handleRecordOptionSelect(values[0]);
                this.dispatchEvent(new CustomEvent('reportvalidity'));
            }
        };
        const fieldName = LookupUtils.computeUnqualifiedFieldApiName(
            this._fieldApiName
        );
        const shouldShowCreateNew =
            this.enableCreateNew === true ||
            this.enableCreateNew === CONSTANTS.SHOW_CREATE_NEW_IN_ADVANCED_ONLY;
        const lookupAdvancedAttributes = {
            additionalFields: [],
            contextId: '',
            dependentFieldBindings: this._metadataManager.getBindingsMap(
                this._record
            ),
            entities: [scopeMap],
            field: fieldName,
            groupId: CONSTANTS.ADVANCED_SEARCH_GROUP_ID,
            label: this.label,
            maxValues: CONSTANTS.ADVANCED_SEARCH_MAX_VALUES,
            placeholder: this.placeholder,
            recordId: this.record ? this.record.id : '',
            saveCallback,
            scopeMap,
            scopeSets: { DEFAULT: [scopeMap] },
            source: this._metadataManager.sourceApiName,
            showCreateNew: shouldShowCreateNew,
            term: this.inputText,
        };

        showAdvancedSearch(lookupAdvancedAttributes);
    }

    /**
     * fires reportvalidity event when focus is removed from grouped combobox.
     */
    handleBlur() {
        this.dispatchEvent(new CustomEvent('reportvalidity'));
    }

    /**
     * Handles create new option selection.
     */
    handleCreateNewAction() {
        // Log click on create new option interaction.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_ACTION_OPTION,
            {
                scopeName: this._metadataManager.targetApiName,
                sourceName: this._metadataManager.sourceApiName,
                type: LOGGING_CONSTANTS.LOG_ACTION_CREATE_NEW_OPTION,
            }
        );

        this._events.dispatchCreateEvent(
            this._metadataManager.targetApiName,
            (values) => this.createNewCallback(values)
        );
    }

    /**
     * Handles the dropdown opening if it isn't empty (items are present)
     */
    handleDropdownOpen() {
        this.updateTerm(this.inputText);
    }

    /**
     * Handles the dropdown opening if it's empty (no items are present)
     */
    handleDropdownOpenRequest() {
        // Log lookup activation.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_INPUT,
            {
                scopeName: this._metadataManager.targetApiName,
            }
        );

        this._lookupPerformanceLogger.startTransaction();

        // Show MRU items only if user has not typed any inputText.
        if (!this.inputText.length) {
            this.updateTerm('');
        }
    }

    /**
     * Handles the oninput event from the combobox input, triggering an update to @wire parameters.
     * @param {Object} event - The input's oninput/onchange event.
     */
    handleTextInput(event) {
        // No-op if event detail is empty or inputPill is already populated.
        if (!event.detail || this.inputPill) {
            return;
        }
        const term = event.detail.text || '';
        if (this.inputText.trim() === term.trim()) {
            this.inputText = term;
            return;
        }

        this._lookupPerformanceLogger.startTransaction();

        // Update term.
        this.updateTerm(term);
    }
    /**
     * Handles the pillremove event fired from combo-box when a selected option is removed.
     * @param {Object} event - Contains details of the event being handled.
     */
    handlePillRemove(event) {
        log(
            LOGGING_CONSTANTS.LOG_EVENT_PILL_REMOVE,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_RECORD_PILL_ITEM,
            {
                scopeName: this._metadataManager.targetApiName,
            }
        );

        if (event && event.detail) {
            const removedValue = (event.detail.item || {}).value;
            if (!removedValue) {
                return;
            }
            this._events.dispatchPillRemoveEvent(removedValue);
            this.updateTerm('');
        }
    }

    /**
     * Handles record option selection
     * @param {String} value - The record id of the option or the whole record when it comes
     *  from advanced search.
     */
    handleRecordOptionSelect(value, isFromCreateNew = false) {
        // No-op if record id is empty.
        if (!value) {
            return;
        }

        this._logItemSelected(value, isFromCreateNew);

        this._events.dispatchRecordItemSelectEvent(value);
        this.inputText = '';
    }

    /**
     * Handles the select event fired from combo-box when an option is selected.
     * @param {Object} event - Contains details of the event being handled.
     */
    handleSelect(event) {
        const value = event.detail.value;
        switch (value) {
            case COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH:
                this.handleAdvancedSearchAction();
                break;
            case CONSTANTS.ACTION_CREATE_NEW:
                this.handleCreateNewAction();
                break;
            default:
                this.handleRecordOptionSelect(value);
                break;
        }
    }

    /**
     * Handles entity filter change.
     * @param {Object} event - The filter's onchange event object.
     */
    handleSelectFilter(event) {
        if (!event.detail) {
            return;
        }
        // Log click on filter item interaction.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_ENTITY_SELECTOR,
            LOGGING_CONSTANTS.LOG_TARGET_FILTER_ITEM,
            {
                scopeName: this._metadataManager.targetApiName,
            }
        );
        const selectedEntity = event.detail.value;
        // No-op if newly selected target api is the same as the previous one.
        if (selectedEntity === this._metadataManager.targetApiName) {
            return;
        }

        this._selectedEntityApiName = selectedEntity;
        this._events.dispatchEntityFilterSelect(selectedEntity);
        this.resetSearchTerm();
        // Update internal state.
        this.updateState();
    }

    resetSearchTerm() {
        this._previousQueryTermSent = undefined;
        this.updateTerm('');
    }

    /**
     * Updates combobox filter items.
     */
    updateFilterItems() {
        // For single-value lookup, if an inputPill is present then filter items shouldn't be shown.
        this.filterItems =
            this.maxValues === 1 && this.inputPill
                ? null
                : this._metadataManager.getFilterItems();
        this.placeholder = this.getPlaceholder();
    }

    /**
     * Updates lookup's internal state.
     */
    updateState() {
        if (
            !this._fieldName ||
            !Object.keys(this._record || {}).length ||
            !Object.keys(this._objectInfos || {}).length
        ) {
            return;
        }

        this._metadataManager = new MetadataManager(
            this._fieldName,
            this._objectInfos,
            this._record,
            this._selectedEntityApiName
        );

        // Update filter items for entity selection.
        this.updateFilterItems();
    }

    /**
     * Updates term state, triggering the @wire service on term change.
     * @param  {String} term - The search term.
     */
    updateTerm(term) {
        this._lookupPerformanceLogger.mergeTransactionAttributesWith({
            qType:
                term.length < 3
                    ? LOGGING_CONSTANTS.LOG_CONTEXT_Q_TYPE_MRU
                    : LOGGING_CONSTANTS.LOG_CONTEXT_Q_TYPE_TYPEAHEAD,
            targetApiName: this._metadataManager.targetApiName,
            qLength: term ? term.length : 0,
        });

        // Update combobox input text value.
        this.inputText = term;

        const trimmedTerm = term.trim();
        // W-7498419: We don't want to update the term each time the user open the dropdown
        // That's why we need to check if the term is different from the previous one.
        if (trimmedTerm !== this._previousQueryTermSent) {
            this._previousQueryTermSent = trimmedTerm;
            this._events.dispatchLookupRecordsRequestEvent({
                [GET_LOOKUP_RECORDS_WIRE_CONSTANTS.QUERY_PARAMS_Q]: trimmedTerm,
            });
            this.showActivityIndicator = true;
        }
    }

    _logItemSelected(value, isFromCreateNew) {
        let recordId = value;
        let { searchType: origin, items } = LookupUtils.getSearchTypeAndItems(
            this._items
        );
        if (typeof recordId === 'object') {
            recordId = value.id;
            origin = LOGGING_CONSTANTS.LOG_SELECTED_RESULT_FROM_ADVANCED_SEARCH;
        }
        if (isFromCreateNew) {
            origin = LOGGING_CONSTANTS.LOG_SELECTED_RESULT_FROM_CREATE_NEW;
        }
        const position = (items || []).findIndex((item) => {
            return item.value === recordId;
        });

        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_SUGGESTION_OPTION,
            {
                recordId,
                position,
                qLength: (this.inputText || '').length,
                origin,
            }
        );
    }
}
