import Element from 'lightning/lookup';
import { shadowQuerySelector } from 'lightning/testUtils';
import { createElement } from 'lwc';
import { LookupDesktop } from './lookupDesktop';

export class Lookup extends LookupDesktop {
    constructor(params) {
        const element = createElement('lightning-lookup', { is: Element });
        Object.assign(element, params);
        document.body.appendChild(element);
        super(shadowQuerySelector(element, 'lightning-lookup-desktop'));
        this.element = element;
    }
}
