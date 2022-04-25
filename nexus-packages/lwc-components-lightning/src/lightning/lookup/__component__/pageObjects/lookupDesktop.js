import { shadowQuerySelector } from 'lightning/testUtils';
import { GroupedCombobox } from './groupedCombobox';
import { BaseComboboxItem } from './baseComboboxItem';

export class LookupDesktop extends GroupedCombobox {
    isAdvancedSearchPresent(term) {
        const textContent = this._advancedSearch
            ? this._advancedSearch.getPrimaryText()
            : '';
        return textContent === `Show All Results for "${term}"`;
    }

    isCreateNewPresent(entityName) {
        return (
            !!this._createNewItem &&
            this._createNewItem.getPrimaryText() === `New ${entityName}`
        );
    }

    get _createNewItem() {
        const createNewOptionItem = shadowQuerySelector(
            this.baseCombobox,
            'lightning-base-combobox-item[data-value="actionCreateNew"]'
        );
        return createNewOptionItem && new BaseComboboxItem(createNewOptionItem);
    }

    constructor(element) {
        super(shadowQuerySelector(element, 'lightning-grouped-combobox'));
        this.lookupDesktop = element;
    }
}
