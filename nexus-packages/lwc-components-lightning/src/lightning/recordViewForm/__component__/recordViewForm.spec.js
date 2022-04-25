import { createElement, register } from 'lwc';
import MockRecordHolder from 'lightningtest/mockRecordViewHolder';
import { registerMockedWireService } from 'lwc-wire-service-sfdc-mocks';
registerMockedWireService({ register });
import { shadowQuerySelector } from 'lightning/testUtils';

const DEFAULT_RECORD_ID = 'a00R0000000jq5eIAA';
const DEFAULT_API_NAME = 'Bad_Guy__c';

const createMockedForm = (recordId, objectApiName, props = {}) => {
    const element = createElement('lightningtest-mock-record-view-holder', {
        is: MockRecordHolder,
    });
    if (recordId) {
        element.recordId = recordId;
    }
    if (objectApiName) {
        element.objectApiName = objectApiName;
    }
    Object.assign(element, props);
    document.body.appendChild(element);

    return element;
};

describe('record view form', () => {
    it('wires recordUi to output fields', () => {
        return new Promise((resolve, reject) => {
            const element = createMockedForm(
                DEFAULT_RECORD_ID,
                DEFAULT_API_NAME
            );
            element.addEventListener('load', () => {
                // give wire time to wire
                const outputField = shadowQuerySelector(
                    element,
                    'lightning-output-field'
                );
                if (outputField) {
                    expect(outputField).toBeDefined();
                    resolve();
                } else {
                    reject('Output field is missing');
                }
            });

            const form = shadowQuerySelector(
                element,
                'lightning-record-view-form'
            );
            form.addEventListener('error', (error) => {
                reject(error);
            });
        });
    });
});
