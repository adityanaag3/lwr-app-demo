import { LightningElement, api, track } from 'lwc';
import {
    getUiField,
    Fields,
    isCompoundField,
    isPersonAccount,
    getInternalIdForExternalObject,
    isTypeReferenceWithLightningLookupUnsupported,
} from 'lightning/fieldUtils';
import { normalizeVariant, VARIANT } from 'lightning/inputUtils';
import { classListMutation } from 'lightning/utilsPrivate';

import * as depUtils from 'lightning/dependencyUtils';

const STATE_FIELD = 'State';
const COUNTRY_FIELD = 'Country';
const STATE_CODE_FIELD = 'StateCode';
const COUNTRY_CODE_FIELD = 'CountryCode';
const SLDS_FIELD_CLASS = 'slds-form-element__static';

/**
 * Represents a read-only display of a label, help text, and value for a field on a Salesforce object.
 */
export default class LightningOutputField extends LightningElement {
    @track computedFieldClass = SLDS_FIELD_CLASS;
    @track _fieldName;
    @track _label = '';

    // raw field name is stored to validate that when object filed
    // references are used that the objectApiName matches the form
    _rawFieldName;
    _labelAlignment = 'stacked';

    @track _variant;
    _rawVariant;

    set fieldClass(val) {
        this.computedFieldClass = `${val} ${SLDS_FIELD_CLASS}`;
    }

    /**
     * A CSS class for the outer element, in addition to the component's base classes.
     * @type {string}
     */
    @api
    get fieldClass() {
        return this.computedFieldClass;
    }

    /**
     * Changes the appearance of the output. Accepted variants
     * include standard and label-hidden. This value defaults to standard.
     * @type {string}
     * @default standard
     */
    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._rawVariant = value;
        this._variant = normalizeVariant(value);
        this.updateClassList();
    }

    set fieldName(value) {
        this._rawFieldName = value;
        this._fieldName =
            value && value.fieldApiName ? value.fieldApiName : value;
    }

    /**
     * The API name of the field to be displayed.
     * @type {string}
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    setReady() {
        // if no good data ever arrives the empty field stays hidden
        this.classList.remove('slds-hide');
    }

    connectedCallback() {
        this.classList.add('slds-form-element', 'slds-hide');
        this.updateClassList();
    }

    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked': this.isStackedLabel(),
            'slds-form-element_horizontal': this.isHorizontalLabel(),
        });
    }

    isStackedLabel() {
        // only add the form class if density or variant is stacked
        return (
            (this._labelAlignment === 'stacked' && !this._rawVariant) ||
            this._rawVariant === VARIANT.LABEL_STACKED
        );
    }

    isHorizontalLabel() {
        // only add the form class if density or variant is horizontal
        return (
            (this._labelAlignment === 'horizontal' && !this._rawVariant) ||
            this._rawVariant === VARIANT.LABEL_INLINE
        );
    }

    @track uiField = {};

    renderedCallback() {
        // Fire event to notify containers if we haven't gotten uiField yet
        if (!this.uiField.type) {
            this.dispatchEvent(
                // eslint-disable-next-line lightning-global/no-custom-event-bubbling
                new CustomEvent('registeroutputfield', {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                })
            );
        }
    }

    updateFieldInfo(record, objectInfo) {
        try {
            const fieldData = getUiField(this.fieldName, record, objectInfo);
            this.uiField = fieldData;
        } catch (e) {
            console.warn(e); // eslint-disable-line no-console
            return;
        }
        this.setReady();
    }

    /**
     * Reserved for internal use.
     * @param {object} data The record and objectInfo data
     */
    @api
    wireRecordUi(data) {
        if (
            this._rawFieldName &&
            data.objectInfo &&
            this._rawFieldName.objectApiName &&
            this._rawFieldName.objectApiName !== data.objectInfo.apiName
        ) {
            throw new Error(
                `objectApiName (${this._rawFieldName.objectApiName}) for field ${this.fieldName} does not match the objectApiName provided for the form (${data.objectInfo.apiName}).`
            );
        }

        this.recordFields = data.record.fields;
        this.fields = data.objectInfo.fields;

        this.updateFieldInfo(data.record, data.objectInfo);
        this.isCompoundField = isCompoundField(
            this.fieldName,
            data.objectInfo,
            isPersonAccount(data.record)
        );
        this._labelAlignment = data.labelAlignment
            ? data.labelAlignment
            : 'stacked';
        this.updateFieldLabel(data.layoutFieldData);
        this.updateClassList();
    }

    /**
     * Reserved for internal use.
     * @param {*} picklistValues Reserved for internal use
     */
    @api
    wirePicklistValues(picklistValues) {
        if (
            this.uiField.type !== Fields.BOOLEAN &&
            this.uiField.type !== Fields.PICKLIST
        ) {
            return;
        }

        const controllerMissing = depUtils.isControllerMissing(
            this.uiField,
            this.fields,
            picklistValues
        );

        if (controllerMissing) {
            // This is developer error so we should show a warning in the console without gacking.
            // When we return, the value of the picklist will be set and the option list will be
            // undefined. The picklist will render as disabled/readOnly so it will be safe to use
            // in the form.
            console.warn(
                `Field [${this.uiField.controllerName}] controls the field [${this.fieldName}] but was not found in the form`
            );
            return;
        }

        const isController = depUtils.hasDependents(
            this.uiField,
            this.fields,
            picklistValues
        );

        if (!isController) {
            return;
        }

        this.dispatchEvent(
            // eslint-disable-next-line lightning-global/no-custom-event-bubbling
            new CustomEvent('registerfielddependency', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    fieldName: this.fieldName,
                    fieldElement: {
                        updateFieldOptions: () => {},
                        setFieldValue: () => {},
                        getFieldValue: () => {
                            return this.value;
                        },
                    },
                },
            })
        );
    }

    updateFieldLabel(layoutData = {}) {
        const layoutLabel =
            layoutData[this.fieldName] && layoutData[this.fieldName].label;
        this._label = layoutLabel || this.uiField.label;
    }

    /** Value Getters **/
    get showLabel() {
        return this.variant !== VARIANT.LABEL_HIDDEN;
    }

    get showInlineHelpText() {
        return this.inlineHelpText && this.inlineHelpText.trim() !== '';
    }

    get fieldLabel() {
        return this._label;
    }

    get displayValue() {
        if (this.uiField.displayValue == null) {
            // fall back to value if displayValue is missing
            return this.value;
        }

        let displayValue;
        if (this.isTypeAddress) {
            displayValue = this.normalizeAddressValue(
                this.uiField.displayValue
            );
        } else {
            displayValue = this.uiField.displayValue;
        }

        if (typeof this.uiField.displayValue === 'object') {
            return Object.assign({}, this.value, displayValue);
        }

        return displayValue;
    }

    get value() {
        if (this.isTypeAddress) {
            return this.normalizeAddressValue(this.uiField.value);
        } else if (
            isTypeReferenceWithLightningLookupUnsupported(
                this.fieldName,
                this.uiField
            )
        ) {
            return getInternalIdForExternalObject(
                this.recordFields,
                this.uiField
            );
        }
        return this.uiField.value;
    }

    get scale() {
        return this.uiField.scale;
    }

    get latitude() {
        return this.uiField.value.latitude;
    }

    get longitude() {
        return this.uiField.value.longitude;
    }

    get inlineHelpText() {
        return this.uiField.inlineHelpText;
    }

    // Temporary until formatted-date-time is able to accept date time string formats
    get dateValue() {
        const date = new Date(this.uiField.value);
        return date.getTime();
    }

    /** Type resolution getters **/
    get isTypeString() {
        return (
            Fields.STRING === this.uiField.type &&
            !this.uiField.htmlFormatted &&
            !this.isCompoundField
        );
    }

    get isTypeReference() {
        return Fields.REFERENCE === this.uiField.type;
    }

    get isTypeBoolean() {
        return Fields.BOOLEAN === this.uiField.type;
    }

    get isTypeCurrency() {
        return Fields.CURRENCY === this.uiField.type;
    }

    get isTypeDate() {
        return Fields.DATE === this.uiField.type;
    }

    get isTypeDateTime() {
        return Fields.DATETIME === this.uiField.type;
    }

    get isTypeEmail() {
        return Fields.EMAIL === this.uiField.type;
    }

    get isTypeLocation() {
        return Fields.LOCATION === this.uiField.type;
    }

    get isTypeInt() {
        return Fields.INT === this.uiField.type;
    }

    get isTypeDouble() {
        return Fields.DOUBLE === this.uiField.type;
    }

    get isTypePercent() {
        return Fields.PERCENT === this.uiField.type;
    }

    get isTypePhone() {
        return Fields.PHONE === this.uiField.type;
    }

    get isTypePicklist() {
        return Fields.PICKLIST === this.uiField.type;
    }

    get isTypeMultiPicklist() {
        return Fields.MULTI_PICKLIST === this.uiField.type;
    }

    get isTypeTextArea() {
        return (
            Fields.TEXTAREA === this.uiField.type &&
            Fields.PLAIN_TEXTAREA === this.uiField.extraTypeInfo &&
            !this.uiField.htmlFormatted
        );
    }

    get isTypeRichText() {
        return (
            (Fields.TEXTAREA === this.uiField.type &&
                Fields.RICH_TEXTAREA === this.uiField.extraTypeInfo) ||
            (Fields.STRING === this.uiField.type && this.uiField.htmlFormatted)
        );
    }

    get isTypeEncryptedString() {
        return Fields.ENCRYPTED_STRING === this.uiField.type;
    }

    get isTypeUrl() {
        return this.uiField.type === Fields.URL;
    }

    get isTypeName() {
        return (
            this.isCompoundField &&
            (Fields.PERSON_NAME === this.uiField.extraTypeInfo ||
                Fields.SWITCHABLE_PERSON_NAME === this.uiField.extraTypeInfo)
        );
    }

    get isTypeAddress() {
        return this.uiField.compound && Fields.ADDRESS === this.uiField.type;
    }

    getStateCountryValue(fieldValue, fieldName) {
        const codeFieldName = `${fieldName}Code`;

        // if stateCode and countryCode values present use that,
        // rather than raw value
        if (codeFieldName in fieldValue) {
            return fieldValue[codeFieldName];
        }

        return fieldValue[fieldName];
    }

    normalizeAddressValue(value) {
        const prefix = this.getFieldPrefix();

        return Object.keys(value).reduce((ret, rawKey) => {
            const key = this.removePrefix(rawKey, prefix);

            if (key === STATE_FIELD || key === STATE_CODE_FIELD) {
                ret[STATE_FIELD] = this.getStateCountryValue(value, rawKey);
            } else if (key === COUNTRY_FIELD || key === COUNTRY_CODE_FIELD) {
                ret[COUNTRY_FIELD] = this.getStateCountryValue(value, rawKey);
            } else {
                ret[key] = value[rawKey];
            }

            return ret;
        }, {});
    }

    getFieldPrefix() {
        if (!this.fieldPrefix) {
            this.fieldPrefix = this.fieldName.split(/Address$/)[0];
        }
        return this.fieldPrefix;
    }

    removePrefix(str, prefix) {
        return prefix ? str.replace(prefix, '') : str;
    }
}
