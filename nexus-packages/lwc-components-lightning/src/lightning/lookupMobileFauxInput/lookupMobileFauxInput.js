import { api, LightningElement } from 'lwc';
import { BUTTON_SELECTOR, VARIANT } from './constants';
import { COMMON_LOOKUP_CONSTANTS } from 'lightning/lookupUtils';
import standard from './fauxInputStandard.html';
import labelHidden from './fauxInputLabelHidden.html';
import {
    getRealDOMId,
    normalizeAriaAttribute,
    synchronizeAttrs,
} from 'lightning/utilsPrivate';
import { classSet } from 'lightning/utils';

export default class LightningLookupMobileFauxInput extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Error message to be displayed below the input
     * @type {string}
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
     * Help message for the field.
     * @type {string}
     */
    @api
    get fieldLevelHelp() {
        return this._fieldLevelHelp;
    }

    set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
        this.synchronizeA11y();
    }

    @api
    focus() {
        if (this.button) {
            this.button.focus();
        }
    }

    /**
     * Label for the faux input button, shown as assistive text for hidden variant
     * @type {string}
     */
    @api label = '';

    /**
     * Indicates whether or not the field is required.
     * @type {boolean}
     */
    @api required = false;

    /**
     * The value of variant.
     * @type {string}
     */
    @api variant = VARIANT.STANDARD;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================

    _errorMessage;

    _fieldLevelHelp;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================

    get button() {
        return this.template.querySelector(BUTTON_SELECTOR);
    }

    get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
    }

    get isLabelInline() {
        return this.variant === VARIANT.LABEL_INLINE;
    }

    get isLabelStacked() {
        return this.variant === VARIANT.LABEL_STACKED;
    }

    /**
     * Computes css classes to handle different label varients.
     * @return {String} String of css classes to be set on pill presenter label element.
     */
    get computedLabelClass() {
        const classnames = classSet(
            'slds-faux-input_label slds-form-element_label'
        );
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
        const classnames = classSet('faux-input-field-level-help');

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
            this.template.querySelector('.faux-input-field-level-help')
        );
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================

    render() {
        return this.variant === VARIANT.LABEL_HIDDEN ? labelHidden : standard;
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    preventClickOutsideButton(event) {
        if (event.target !== this.button) {
            event.stopPropagation();
        }
        event.preventDefault();
    }

    synchronizeA11y() {
        if (this.button) {
            synchronizeAttrs(this.button, {
                [COMMON_LOOKUP_CONSTANTS.ARIA_DESCRIBEDBY]: this
                    .computedAriaDescribedBy,
            });
        }
    }
}
