import {
    shadowQuerySelector,
    shadowQuerySelectorAll,
} from 'lightning/testUtils';
import { BaseCombobox } from './baseCombobox';
import { EntitySelector } from './entitySelector';

/* eslint-disable @lwc/lwc/no-async-await */
export class GroupedCombobox extends BaseCombobox {
    constructor(element) {
        const baseComboboxElements = Array.from(
            shadowQuerySelectorAll(element, 'lightning-base-combobox')
        );
        super(baseComboboxElements.pop());
        if (baseComboboxElements.length) {
            this._entitySelector = new EntitySelector(
                baseComboboxElements.pop()
            );
        }
        this.groupedCombobox = element;
    }

    // Public
    getHelpMessageText() {
        return this._helpMessage.textContent;
    }

    // Public
    getLabelText() {
        return this._label.textContent;
    }

    isEntitySelectorDisplayed() {
        return !!this._entitySelector;
    }

    labelHasAssistiveText() {
        return this._label.classList.contains('slds-assistive-text');
    }

    async blurAndWaitForHelpMessage() {
        this.blur();
        return this.waitFor(() => this._helpMessage);
    }

    async getDisplayedEntities() {
        await this._entitySelector.openDropdown();
        return this._entitySelector.getDisplayedItems();
    }

    async getDisplayedEntitiesTexts() {
        const entities = await this.getDisplayedEntities();
        return entities.map((item) => item.getPrimaryText());
    }

    async selectEntity(text) {
        const entities = await this.getDisplayedEntities();
        entities.find((item) => item.getPrimaryText() === text).click();
    }

    // Private
    get _helpMessage() {
        return shadowQuerySelector(
            this.groupedCombobox,
            'div.slds-form-element__help'
        );
    }

    // Private
    get _label() {
        return shadowQuerySelector(this.groupedCombobox, 'label');
    }
}
