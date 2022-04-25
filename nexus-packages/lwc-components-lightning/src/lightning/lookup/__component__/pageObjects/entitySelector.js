import {
    shadowQuerySelector,
    shadowQuerySelectorAll,
} from 'lightning/testUtils';
import { BaseCombobox } from './baseCombobox';

/* eslint-disable @lwc/lwc/no-async-await */
export class EntitySelector extends BaseCombobox {
    async waitForItemsToBeDisplayed() {
        await this.waitFor(() => this._dropdownGroup);
    }

    get _dropdownGroup() {
        return shadowQuerySelector(this.baseCombobox, '.slds-dropdown');
    }

    get _items() {
        return shadowQuerySelectorAll(
            this.baseCombobox,
            'lightning-base-combobox-item'
        );
    }
}
