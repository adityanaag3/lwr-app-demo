import {
    shadowQuerySelector,
    shadowQuerySelectorAll,
} from 'lightning/testUtils';
import { BaseComboboxItem } from './baseComboboxItem';
import { PageObject } from './pageObject';

/* eslint-disable @lwc/lwc/no-async-await */
export class BaseCombobox extends PageObject {
    constructor(element) {
        super();
        this.baseCombobox = element;
    }

    // Public
    async openDropdown() {
        await this.waitFor(() => {
            // Sometime the first click seems to not be handled, we click through each iteration of the waiting loop
            this._input.click();
            return this._dropdownGroup;
        });
        await this.waitForItemsToBeDisplayed();
    }

    blur() {
        this._input.blur();
    }

    getDisplayedItems() {
        return this._items.map((item) => new BaseComboboxItem(item));
    }

    getDisplayedItemTexts() {
        return this.getDisplayedItems().map((item) => item.getPrimaryText());
    }

    getTitleUsedForItems() {
        return this._groupHeader.textContent;
    }

    getInputPlaceholder() {
        return this._input.placeholder;
    }

    getSelectedValue() {
        return this._inputPills.value;
    }

    isInputPillPresent() {
        return !!this._inputPills;
    }

    async removePill() {
        this._removePillButton.click();
        await this.waitFor(() => !this._inputPills);
    }

    async selectItem(text) {
        this._items
            .map((item) => new BaseComboboxItem(item))
            .find((item) => item.getPrimaryText() === text)
            .click();
        await this.waitForPillsToBeDisplayed();
    }

    async typeTextAndWaitForItems(text) {
        this.typeText(text);
        await this.waitForItemsToBeDisplayed();
    }

    async typeText(text) {
        const input = this._input;
        input.value = '';
        Array.from(text).forEach((char) => {
            input.value += char;
            input.dispatchEvent(new CustomEvent('input'));
        });
    }

    isSpinnerPresent() {
        return !!this._spinner;
    }

    async waitForItemsToBeDisplayed() {
        await this.waitFor(() => !this._spinner);
        await this.waitFor(() => this._dropdownGroup);
    }

    async waitForPillsToBeDisplayed() {
        await this.waitFor(() => this._inputPills);
    }

    // Private
    get _advancedSearch() {
        const firstNode = this._dropdown.firstChild;
        return firstNode.tagName === 'LIGHTNING-BASE-COMBOBOX-ITEM'
            ? new BaseComboboxItem(firstNode)
            : undefined;
    }

    get _removePillButton() {
        return shadowQuerySelector(this.baseCombobox, 'button');
    }

    get _dropdown() {
        return shadowQuerySelector(this.baseCombobox, 'div.slds-listbox');
    }

    get _dropdownGroup() {
        return shadowQuerySelector(this.baseCombobox, 'ul[role=group]');
    }

    get _groupHeader() {
        return shadowQuerySelector(
            this.baseCombobox,
            'ul[role=group] li:first-child h3'
        );
    }

    get _input() {
        return shadowQuerySelector(this.baseCombobox, 'input');
    }

    get _inputPills() {
        return shadowQuerySelector(
            this.baseCombobox,
            'input.slds-combobox__input-value'
        );
    }

    get _items() {
        return shadowQuerySelectorAll(
            this.baseCombobox,
            'ul li lightning-base-combobox-item'
        );
    }

    get _spinner() {
        return shadowQuerySelector(this.baseCombobox, '.slds-spinner');
    }
}
