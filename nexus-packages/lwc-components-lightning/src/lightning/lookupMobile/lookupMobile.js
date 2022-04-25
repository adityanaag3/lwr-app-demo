import * as CONSTANTS from './constants';
import { api, LightningElement, track, createElement } from 'lwc';
import labelRequired from '@salesforce/label/LightningControl.required';
import LightningLookupMobileSelectionPanel from 'lightning/lookupMobileSelectionPanel';
import { showCustomOverlay } from 'lightning/deprecatedOverlayUtils';
import { computePanelHeader, computePlaceholder } from './utils';
import {
    log,
    LOGGING_CONSTANTS,
    LookupEventDispatcher,
    COMMON_LOOKUP_CONSTANTS,
    GET_LOOKUP_RECORDS_WIRE_CONSTANTS,
} from 'lightning/lookupUtils';
import { classSet } from 'lightning/utils';
import { dispatchGlobalEvent } from 'aura';
import { getRealDOMId, normalizeAriaAttribute } from 'lightning/utilsPrivate';

const i18n = {
    required: labelRequired,
};

export default class LightningLookupMobile extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * Error message to be displayed under the lookup input.
     * @type {String}
     */
    @api
    get errorMessage() {
        return this._errorMessage;
    }

    set errorMessage(value) {
        this._errorMessage = value;
        this.synchronizeA11y();
    }

    /**
     * The list of entity options to scope by.
     */
    @api filterItems;

    /**
     * The field level help text.
     * @type {String}
     */
    @api
    get fieldLevelHelp() {
        return this._fieldLevelHelp;
    }

    set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
        this.synchronizeA11y();
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }
        this.renderedElement.focus();
    }

    /**
     * The text label for the layout field.
     * @type {String}
     */
    @api label;

    /**
     * The list of items to be displayed
     * @type {Array}
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.items = value;
            this._lookupSelectionPanel.showActivityIndicator = false;
        }
    }

    /**
     * The array of selected values pill representation.
     * @type {Array}
     */
    @api pills = [];

    /**
     * Indicates whether or not the field is required.
     */
    @api required;

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    @api
    get textInfo() {
        return this._textInfo;
    }

    set textInfo(textInfo) {
        this._textInfo = textInfo;
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.placeholder = computePlaceholder(
                textInfo.targetEntityLabelPlural
            );
        }
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
     * The value for the input element.
     * @type {String}
     */
    @track inputValue;

    /**
     * The required label.
     * @type {String}
     */
    @track requiredLabel = i18n.required;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    /**
     * Indiciates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    _errorMessage;

    _fieldLevelHelp;

    /**
     * The items to passed to the selection panel.
     */
    _items;

    /**
     * Instance of the lookupMobileSelectionPanel
     */
    _lookupSelectionPanel;

    /**
     * Used to call focus on rendered element in the next renderedCallback
     */
    _queueFocus = false;

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    _textInfo;

    /**
     * An array of values of the selected lookup.
     * @type {Array}
     */
    _value;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    /**
     * Computes css classes to handle different label varients.
     * @return {String} String of css classes to be set on the label element.
     */
    get computedLabelClass() {
        const classnames = classSet('slds-form-element__label');
        classnames.add('slds-no-flex');

        return classnames
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .add({ 'slds-form-element_stacked': this.isLabelStacked })
            .add({ 'slds-form-element_horizontal': this.isLabelInline })
            .toString();
    }

    /**
     * Computes css classes to handle different label varients for fieldLevelHelp.
     * @return {String} String of css classes to be set on lightning-helptext element.
     */
    get computedFieldLevelHelpClass() {
        const classnames = classSet('lookup-mobile-field-level-help');

        return classnames
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    get computedAriaDescribedBy() {
        const ariaValues = [];

        if (this.errorMessage) {
            ariaValues.push(this.computedUniqueHelpElementId);
        }

        if (this.fieldLevelHelp) {
            ariaValues.push(this.computedUniqueFieldLevelHelpElementId);
        }
        return normalizeAriaAttribute(ariaValues);
    }

    get computedUniqueHelpElementId() {
        return getRealDOMId(this.template.querySelector('[data-help-message]'));
    }

    get computedUniqueFieldLevelHelpElementId() {
        return getRealDOMId(
            this.template.querySelector('.lookup-mobile-field-level-help')
        );
    }

    /**
     * @return {boolean} Indicates if the lookup has a pill selected.
     */
    get hasPills() {
        return this.pills && this.pills.length > 0;
    }

    get isLabelHidden() {
        return this.variant === CONSTANTS.LABEL_HIDDEN;
    }

    get isLabelInline() {
        return this.variant === CONSTANTS.LABEL_INLINE;
    }

    get isLabelStacked() {
        return this.variant === CONSTANTS.LABEL_STACKED;
    }

    get renderedElement() {
        if (!this._connected) {
            return null;
        }

        let element;
        if (this.hasPills) {
            element = this.template.querySelector(
                CONSTANTS.LIGHTNING_PILL_CONTAINER
            );
        } else {
            element = this.template.querySelector(
                CONSTANTS.LIGHTNING_LOOKUP_MOBILE_FAUX_INPUT
            );
        }
        return element;
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this._events = new LookupEventDispatcher(this);
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
    }

    renderedCallback() {
        this.synchronizeA11y();
        if (this._queueFocus) {
            this.focus();
            this._queueFocus = false;
        }
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    dispatchLookupRecordsRequest(requestParams, shouldLoadMore) {
        this._lookupSelectionPanel.showActivityIndicator = true;
        this._events.dispatchLookupRecordsRequestEvent(
            requestParams,
            shouldLoadMore
        );
    }

    /**
     * fires reportvalidity event when focus is removed from grouped combobox.
     */
    handleBlur() {
        this.dispatchEvent(new CustomEvent('reportvalidity'));
    }

    handlePillRemove(event) {
        // [Temporary] - W-7351876 - Prevent pill remove when disabled.
        // TODO: Use a proper disabled state for pill container when available.
        if (this.disabled) {
            return;
        }

        if (event && event.detail) {
            const removedValue = (event.detail.item || {}).value;
            log(
                LOGGING_CONSTANTS.LOG_EVENT_PILL_REMOVE,
                LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
                LOGGING_CONSTANTS.LOG_TARGET_RECORD_PILL_ITEM
            );
            if (!removedValue) {
                return;
            }
            this._events.dispatchPillRemoveEvent(removedValue);
            this._queueFocus = true;
        }
    }

    handleItemSelect(recordId) {
        if (!recordId) {
            return;
        }

        this._events.dispatchRecordItemSelectEvent(recordId);
        // Close the panel
        if (this._lookupSelectionPanel) {
            dispatchGlobalEvent('markup://force:hidePanel');
        }
    }

    showPanel() {
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
            LOGGING_CONSTANTS.LOG_TARGET_INPUT
        );
        // eslint-disable-next-line no-unused-vars
        let currentOverlay;

        this.createPanel();

        // @W-8148219: header property in panel expects HTMLElement directly
        const panelHeader = document.createElement('h1');
        panelHeader.classList.add('title', 'slds-truncate');
        panelHeader.appendChild(
            document.createTextNode(
                computePanelHeader(this._textInfo.sourceEntityLabel)
            )
        );
        showCustomOverlay({
            header: panelHeader,
            body: this._lookupSelectionPanel,
            isScrollable: false,
            panelType: 'mobileOverlay',
            showCloseButton: true,
        }).then((overlay) => {
            currentOverlay = overlay;
        });
    }

    createPanel() {
        this._lookupSelectionPanel = createElement(
            'lightning-lookup-mobile-selection-panel',
            { is: LightningLookupMobileSelectionPanel }
        );

        Object.assign(this._lookupSelectionPanel, {
            filterItems: this.filterItems,
            label: computePanelHeader(this._textInfo.sourceEntityLabel),
            placeholder: computePlaceholder(
                this._textInfo.targetEntityLabelPlural
            ),
        });

        // listen to the inputchange event fired by lookupMobileSelectionPanel
        this._lookupSelectionPanel.addEventListener('textinput', (event) => {
            const value = event.detail && event.detail.value;
            this.dispatchLookupRecordsRequest({
                [GET_LOOKUP_RECORDS_WIRE_CONSTANTS.QUERY_PARAMS_Q]: value,
            });
        });

        // listen to the select event fired by lookupMobileSelectionPanel
        this._lookupSelectionPanel.addEventListener('select', (event) => {
            const value = event.detail && event.detail.value;
            if (value === COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH) {
                this.dispatchLookupRecordsRequest({
                    [GET_LOOKUP_RECORDS_WIRE_CONSTANTS.QUERY_PARAMS_SEARCH_TYPE]:
                        GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL,
                });
            } else {
                this.handleItemSelect(value);
            }
        });

        this._lookupSelectionPanel.addEventListener('loadmore', () => {
            const shouldLoadMore = true;
            this.dispatchLookupRecordsRequest({}, shouldLoadMore);
        });
    }

    synchronizeA11y() {
        let element;
        if (this.disabled && this.hasPills) {
            element = this.template.querySelector('input');
        } else {
            element = this.template.querySelector(
                CONSTANTS.LIGHTNING_PILL_CONTAINER
            );
        }

        if (element) {
            element.setAttribute(
                [COMMON_LOOKUP_CONSTANTS.ARIA_DESCRIBEDBY],
                this.computedAriaDescribedBy
            );
        }
    }
}
