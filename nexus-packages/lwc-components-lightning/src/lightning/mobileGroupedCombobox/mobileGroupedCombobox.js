import { LightningElement, api } from 'lwc';

import labelClear from '@salesforce/label/LightningControl.clear';
import labelLoading from '@salesforce/label/LightningControl.loading';
import labelSearch from '@salesforce/label/LightningLookup.search';

const i18n = {
    clear: labelClear,
    search: labelSearch,
    loading: labelLoading,
};

export default class LightningMobileGroupedCombobox extends LightningElement {
    _items = [];
    textClear = false;

    /**
     * Text label for the input. Label is not visible on screen.
     * @type {string}
     */
    @api ariaLabel = '';

    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     * @type {string}
     */
    @api placeholder = '';

    /**
     * The Lightning Design System name of the icon.
     * Names are written in the format {category}:{icon}; ex. 'utility:down'
     * Icon is displayed preceding the input.
     * @type {string}
     */
    @api filterIconName;

    /**
     * The filter icon alternative text is used to describe the icon.
     * This text should describe what happens when you click the button,
     * for example 'Upload File', not what the icon looks like, 'Paperclip'.
     * @type {string}
     */
    @api filterIconAlternativeText;

    /**
     * Specifies the value to be set on the input element.
     * @type {string}
     */
    @api inputText;

    /**
     * * If present, a spinner is displayed at the bottom of the listbox to indicate loading activity.
     * @type {boolean}
     * @default false
     */
    @api showActivityIndicator = false;

    /**
     * Array of items to be rendered in the listbox
     * Items include action item(s) and option group(s)
     * @type {object}
     */
    @api items;

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        this.template.querySelector('input').focus();
    }

    /**
     * Removes focus from the input element.
     */
    @api
    blur() {
        this.template.querySelector('input').blur();
    }

    /**
     * Clear Text Button click handler
     * When the clear text button is clicked:
     *  1. Clear input's value
     *  2. Set focus on the input
     *  3. Fire textinput event
     */
    handleClickClearText() {
        const input = this.template.querySelector('input');
        input.value = '';
        input.focus();
        this.textClear = false;
        this.dispatchEvent(
            new CustomEvent('textinput', { detail: { value: '' } })
        );
    }

    /**
     * Fire 'textinput' event with value of input everytime the user types into the input.
     * Set indicator of whether or not to show clear text button.
     * @param {object} event
     */
    handleInputChange(event) {
        const value = event.target.value;
        this.textClear = value ? true : false;
        this.dispatchEvent(new CustomEvent('textinput', { detail: { value } }));
    }

    /**
     * Fire 'select' event with value of selected item when the user taps on a selectable item
     * @param {object} event
     */
    handleSelected(event) {
        const value = event.currentTarget.getAttribute('data-value');
        this.dispatchEvent(new CustomEvent('select', { detail: { value } }));
    }

    get i18n() {
        return i18n;
    }
}
