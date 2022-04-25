import {
    shadowQuerySelector,
    shadowQuerySelectorAll,
} from 'lightning/testUtils';
import { PageObject } from './pageObject';

export class BaseComboboxItem extends PageObject {
    constructor(element) {
        super();
        this.element = element;
    }

    // Public
    click() {
        this.getPrimaryField().click();
    }

    getHighlightedText() {
        const titleWithHighlight = this.getPrimaryField();
        return (
            !!titleWithHighlight &&
            (shadowQuerySelector(titleWithHighlight, 'strong') || {})
                .textContent
        );
    }
    getPrimaryField() {
        const titles = this._titles;
        return titles && titles.length && titles[0];
    }

    getPrimaryText() {
        const field = this.getPrimaryField();
        return this._getTextNode(field);
    }

    getSecondaryField() {
        const titles = this._titles;
        return titles && titles.length && titles[1];
    }

    getSecondaryText() {
        const field = this.getSecondaryField();
        return field && this._getTextNode(field);
    }

    hasIcon() {
        return !!shadowQuerySelector(this.element, 'lightning-icon');
    }

    // Private
    _getTextNode(field) {
        return (field.shadowRoot ? field.shadowRoot : field).textContent;
    }

    get _titles() {
        const titlesWithoutHighlight = this._titlesWithoutHighlight;
        return titlesWithoutHighlight.length
            ? titlesWithoutHighlight
            : this._titlesWithHighlight;
    }

    get _titlesWithoutHighlight() {
        return Array.from(
            shadowQuerySelectorAll(
                this.element,
                'span.slds-media__body span.slds-truncate'
            )
        );
    }

    get _titlesWithHighlight() {
        return Array.from(
            shadowQuerySelectorAll(
                this.element,
                'lightning-base-combobox-formatted-text'
            )
        );
    }
}
