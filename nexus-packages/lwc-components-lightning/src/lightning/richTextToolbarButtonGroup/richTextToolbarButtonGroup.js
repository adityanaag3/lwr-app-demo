import { LightningElement, api } from 'lwc';
/**
 * Creates a custom button group in lightning-input-rich-text.
 * @slot default Placeholder for custom buttons.
 */
export default class LightningRichTextToolbarGroup extends LightningElement {
    /**
     * Describes the custom button category to assistive technologies.
     */
    @api ariaLabel;

    /**
     * Set order on buttons for styling purposes
     * The buttons in turn set classes which apply
     * styling based on their position
     */
    handleSlotChange() {
        const slotElements = this.template
            .querySelector('slot')
            .assignedNodes();
        const numberOfSlotItems = slotElements.length;

        if (numberOfSlotItems === 1) {
            slotElements[0].order = 'only';
        } else if (numberOfSlotItems > 1) {
            for (let i = 0; i < numberOfSlotItems; i++) {
                if (i === 0) {
                    slotElements[i].order = 'first';
                } else if (i === numberOfSlotItems - 1) {
                    slotElements[i].order = 'last';
                } else {
                    slotElements[i].order = 'middle';
                }
            }
        }
    }
}
