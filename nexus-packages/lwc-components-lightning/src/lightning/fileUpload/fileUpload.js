import { LightningElement, api, track } from 'lwc';
import { createComponent } from 'aura';
import { normalizeBoolean } from 'lightning/utilsPrivate';

/**
 * A file uploader for uploading and attaching files to records.
 */
export default class LightningFileUpload extends LightningElement {
    /**
     * Specifies the name of the input element.
     * @type {string}
     * @required
     */
    @api name;

    /**
     * The text label for the file uploader.
     * @type {string}
     * @required
     */
    @api label;

    /**
     * Comma-separated list of file extensions that can be uploaded
     * in the format .ext, such as .pdf, .jpg, or .png.
     * @type {list}
     */
    @api accept;

    /**
     * The record Id of the record that the uploaded file is associated to.
     * @type {string}
     */
    @api
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        this._recordId = value;
        if (!this.isValidRecordId(value)) {
            // eslint-disable-next-line no-console
            console.warn(
                `<lightning-file-upload> The recordId attribute value is invalid.`
            );
        }
    }
    @track _recordId;

    /**
     * Specifies whether this component should be displayed in a disabled state.
     * Disabled components can't be clicked. The default is false.
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }
    @track _disabled = false;

    /**
     * Specifies whether a user can upload more than one file simultaneously.
     * The default is false.
     * @type {boolean}
     * @default false
     */
    @api
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = normalizeBoolean(value);
    }
    @track _multiple = false;

    /**
     * Name of a custom field on the ContentVersion object. Set its value with the file-field-value attribute.
     * @type {string}
     */
    @api fileFieldName;

    /**
     * Value to store in the custom field specified by file-field-name for the uploaded file.
     * @type {string}
     */
    @api fileFieldValue;

    connectedCallback() {
        this.connected = true;
    }

    disconnectedCallback() {
        this.connected = false;
    }

    isValidRecordId(id) {
        if (id) {
            return typeof id === 'string' && id.length;
        }
        return true;
    }

    get inputElement() {
        return this.template.querySelector('lightning-input');
    }

    handleChange(event) {
        if (!this.isDisabled) {
            event.stopPropagation();
            this.upload(event.detail.files);
        }
    }

    upload(files) {
        if (files.length === 0) {
            return;
        }

        createComponent(
            'forceContent:fileUploadAction',
            {
                parentRecordId: this.recordId,
                fieldName: this.fileFieldName,
                fieldValue: this.fileFieldValue,
                accept: this.accept,
                disabled: this.disabled,
                multiple: this.multiple,
                onError: (error) => {
                    if (error && this.connected) {
                        this.inputElement.setCustomValidity(error);
                        this.inputElement.showHelpMessageIfInvalid();
                    }
                },
                onUpload: (detail) => {
                    if (this.connected) {
                        this.inputElement.setCustomValidity('');
                        this.inputElement.showHelpMessageIfInvalid();
                        this.dispatchEvent(
                            new CustomEvent('uploadfinished', {
                                detail,
                            })
                        );
                    }
                },
            },
            (newCmp, status) => {
                if (status === 'SUCCESS') {
                    newCmp.uploadFiles(files);
                }
            }
        );
    }

    get isDisabled() {
        return this.disabled || !this.isValidRecordId(this.recordId);
    }
}
