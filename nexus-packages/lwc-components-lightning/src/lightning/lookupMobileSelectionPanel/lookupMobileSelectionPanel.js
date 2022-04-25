import emptyStateNoResultMRUText from '@salesforce/label/LightningLookup.emptyStateNoResultMRUText';
import emptyStateNoResultMRUWithoutText from '@salesforce/label/LightningLookup.emptyStateNoResultMRUWithoutText';
import emptyStateNoResultText from '@salesforce/label/LightningLookup.emptyStateNoResultText';
import labelAdvancedSearchMobile from '@salesforce/label/LightningLookup.advancedSearchMobile';
import { api, LightningElement, track } from 'lwc';
import {
    EMPTY_TEXT,
    LIGHTNING_MOBILE_COMBOBOX,
    STATE_DATA,
    STATE_CAN_LOAD_MORE,
    STATE_INITIAL_REQUEST_COMPLETE,
    STATE_SEARCH_TYPE,
} from './constants';
import {
    LookupPerformanceLogger,
    log,
    LOGGING_CONSTANTS,
    COMMON_LOOKUP_CONSTANTS,
    LookupUtils,
} from 'lightning/lookupUtils';
import {
    generatePlaceholderArray,
    getOuterHeight,
    getScrollHeight,
    getTopOffset,
    isScrollAtBottom,
} from './utils';
import panel from './lookupMobileSelectionPanel.html';
import stencil from './loadingStencil.html';

export default class LightningLookupMobileSelectionPanel extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * The list of entities to filter on.
     * @type {Array}
     */
    @api
    get filterItems() {
        return this._filterItems;
    }

    set filterItems(filterOptions) {
        this._filterItems = filterOptions;
        if (filterOptions.length) {
            this.filterIconName = filterOptions[0].iconName;
            this.filterIconAlternativeText =
                filterOptions[0].iconAlternativeText;
        }
    }

    /**
     * The list of items to display in combobox.
     * @type {Array}
     */
    @api
    get items() {
        return this.state[STATE_DATA];
    }

    set items(groupedItems) {
        let { searchType, items } = LookupUtils.getSearchTypeAndItems(
            groupedItems
        );

        // when lazy-loading records in advanced search just append records
        if (
            LookupUtils.isFullSearch(this._searchType) &&
            LookupUtils.isFullSearch(searchType)
        ) {
            this._appendRecords(items);
            this._updateState(
                STATE_CAN_LOAD_MORE,
                groupedItems[0].serverHasMoreRecordsToLoad
            );
            return;
        }

        // we don't want the items wrapped in a proxy
        this._updateState(STATE_DATA, JSON.parse(JSON.stringify(groupedItems)));
        this._updateState(STATE_INITIAL_REQUEST_COMPLETE, true);
        const canLoadMoreRecords =
            groupedItems[0] && groupedItems[0].serverHasMoreRecordsToLoad;
        this._updateState(STATE_CAN_LOAD_MORE, canLoadMoreRecords);
        this._focusCombobox();

        if (searchType && items) {
            this._updateState(STATE_SEARCH_TYPE, searchType);
            this._manageNoResultsEmptyState(searchType, items);
            this._lookupPerformanceLogger.startRenderMark();
            this._lookupPerformanceLogger.mergeTransactionAttributesWith({
                qResults: items.length,
                qType: searchType,
            });
        }
    }

    /**
     * The label for the lookup field
     * Not displayed but used for a11y
     */
    @api label;

    /**
     * The placeholder text to show in the input
     */
    @api placeholder;

    /**
     * Boolean value indicating whether or not to show the spinner
     */
    @api showActivityIndicator = false;

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================
    // @TODO Move under state
    emptyState = {
        show: false,
        text: '',
        subText: '',
    };

    filterIconName;

    filterIconAlternativeText;

    inputText = '';

    @track
    state = {
        [STATE_CAN_LOAD_MORE]: true,
        [STATE_DATA]: [],
        [STATE_INITIAL_REQUEST_COMPLETE]: false,
        [STATE_SEARCH_TYPE]: null,
    };

    stencilArray = [];

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    _filterItems = [];

    _lookupPerformanceLogger = new LookupPerformanceLogger();

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    get _searchType() {
        return this.state[STATE_SEARCH_TYPE];
    }

    get _canLoadMoreRecords() {
        return this.state[STATE_CAN_LOAD_MORE];
    }

    get _initialRequestComplete() {
        return this.state[STATE_INITIAL_REQUEST_COMPLETE];
    }

    get _items() {
        return this.state[STATE_DATA][0].items;
    }

    _lookupPerformanceLogger = new LookupPerformanceLogger({ isMobile: true });

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    connectedCallback() {
        this._lookupPerformanceLogger.startTransaction();
        this.stencilArray = generatePlaceholderArray();
        // request recent items when connected
        this._dispatchInputChangeEvent(EMPTY_TEXT);
    }

    render() {
        return this._initialRequestComplete ? panel : stencil;
    }

    renderedCallback() {
        this._lookupPerformanceLogger.endRenderMark();
        this._lookupPerformanceLogger.endTransaction();
    }

    // ================================================================================
    // HANDLER METHODS
    // ================================================================================
    handleInputChange(event) {
        if (!event.detail) {
            return;
        }

        const text = event.detail.value || '';
        if (this.inputText.trim() === text.trim()) {
            return;
        }

        this.inputText = text;
        this._lookupPerformanceLogger.startTransaction();

        this._lookupPerformanceLogger.mergeTransactionAttributesWith({
            qLength: text ? text.length : 0,
        });

        // re-dispatch event to be listened to by the panel instance in lookupMobile
        this._dispatchInputChangeEvent(text.trim());
    }

    handleSelect(event) {
        if (!event.detail) {
            return;
        }

        const value = event.detail && event.detail.value;

        this._logItemSelected(value);

        // re-dispatch event to be listened to by the panel instance in lookupMobile
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    value,
                },
            })
        );
    }

    handleTouchMove(event) {
        if (
            !LookupUtils.isFullSearch(this._searchType) ||
            this.showActivityIndicator ||
            !this._canLoadMoreRecords
        ) {
            return;
        }
        const scrollHeight = getScrollHeight(event);
        const outerHeight = getOuterHeight(event);
        const topOffset = getTopOffset(event);
        if (isScrollAtBottom(scrollHeight, outerHeight, topOffset)) {
            this.dispatchEvent(new CustomEvent('loadmore'));
        }
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    // use only for lazy loading additional records
    _appendRecords(records) {
        this._items.push(...records);
    }

    _dispatchInputChangeEvent(text) {
        this.dispatchEvent(
            new CustomEvent('textinput', {
                detail: {
                    value: text,
                },
            })
        );
    }

    _focusCombobox() {
        const combobox = this.template.querySelector(LIGHTNING_MOBILE_COMBOBOX);
        if (combobox) {
            combobox.focus();
        }
    }

    _computeEmptyState(items, searchType, advancedSearchActionPresent) {
        let emptyState = {
            show: false,
            subText: '',
            text: emptyStateNoResultText.replace('{0}', this.inputText),
        };
        if (items.length === 0) {
            emptyState.show = true;
            if (
                LookupUtils.isTypeAhead(searchType) &&
                advancedSearchActionPresent
            ) {
                emptyState.show = false;
            } else if (LookupUtils.isMRU(searchType)) {
                emptyState.subText = emptyStateNoResultMRUWithoutText;
                emptyState.text = emptyStateNoResultMRUText;
            }
        }
        return emptyState;
    }

    _manageNoResultsEmptyState(searchType, items) {
        const advancedSearchText = labelAdvancedSearchMobile.replace(
            '{0}',
            this.inputText
        );
        const advancedSearchActionPresent = !!this.items.find(
            (item) => item.action && item.text === advancedSearchText
        );
        if (searchType && items) {
            this.emptyState = this._computeEmptyState(
                items,
                searchType,
                advancedSearchActionPresent
            );
        }
    }

    _logItemSelected(value) {
        if (value === COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH) {
            log(
                LOGGING_CONSTANTS.LOG_EVENT_CLICK,
                LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
                LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_ACTION_OPTION,
                {
                    type: LOGGING_CONSTANTS.LOG_ACTION_SEARCH_OPTION,
                }
            );
            this._lookupPerformanceLogger.startTransaction();

            this._lookupPerformanceLogger.mergeTransactionAttributesWith({
                qLength: this.inputText ? this.inputText.length : 0,
            });
        } else {
            const { searchType, items } = LookupUtils.getSearchTypeAndItems(
                this.items
            );
            const itemCount = items.length;
            const position = items.findIndex((item) => {
                return item.value === value;
            });
            log(
                LOGGING_CONSTANTS.LOG_EVENT_CLICK,
                LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
                LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_SUGGESTION_OPTION,
                {
                    recordId: value,
                    position,
                    qLength: this.inputText.length,
                    origin: searchType,
                    qResults: itemCount,
                }
            );
        }
    }

    _updateState(key, value) {
        this.state[key] = value;
    }
}
