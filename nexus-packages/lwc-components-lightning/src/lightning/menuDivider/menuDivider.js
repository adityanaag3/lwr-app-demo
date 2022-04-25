import { LightningElement, api, track } from 'lwc';
import { classSet } from 'lightning/utils';
import { normalizeString as normalize } from 'lightning/utilsPrivate';

export default class LightningMenuDivider extends LightningElement {
    @track _variant = 'standard';

    connectedCallback() {
        this.setAttribute('role', 'separator');
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalize(value, {
            fallbackValue: 'standard',
            validValues: ['standard', 'compact'],
        });
    }

    get computedClass() {
        return classSet({
            'slds-has-divider_top-space': this.variant === 'standard',
            'slds-has-divider_top': this.variant === 'compact',
        }).toString();
    }
}
