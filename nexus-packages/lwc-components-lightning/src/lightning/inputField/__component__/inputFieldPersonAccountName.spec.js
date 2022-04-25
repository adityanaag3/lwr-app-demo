import { createElement } from 'lwc';
import Element from 'lightning/inputField';
import { getMock } from 'lightning/testUtils';

const FAKE_OBJECT_INFOS = { isObjectInfos: true };
function createInputField(
    fieldName,
    nullify = false,
    value = undefined,
    params = {},
    events,
    createMode = false,
    labelAlignment
) {
    const personAccountStore = getMock(
        'lightning/inputField/__mocks__/personAccount'
    );
    const salutationPicklistStore = getMock(
        'lightning/inputField/__mocks__/picklistSalutation'
    );

    const element = createElement('lightning-input-field', { is: Element });
    // safe deep clone
    const data = JSON.parse(JSON.stringify(personAccountStore));
    element.fieldName = fieldName;

    if (value !== undefined) {
        element.value = value;
    }
    if (nullify) {
        data.record.fields[fieldName].value = null;
        if (fieldName === 'LookupId') {
            delete data.record.fields.Lookup;
        }
    }

    data.objectInfos = FAKE_OBJECT_INFOS;
    data.createMode = createMode;
    data.labelAlignment = labelAlignment;
    Object.assign(element, params);

    if (events) {
        Object.keys(events).forEach((eventName) => {
            element.addEventListener(eventName, events[eventName]);
        });
    }

    document.body.appendChild(element);
    element.wireRecordUi(data);
    element.wirePicklistValues(
        JSON.parse(JSON.stringify(salutationPicklistStore))
    );
    return element;
}

describe('lightning-input-field', () => {
    describe('Name Field', () => {
        it('should show Name field as compound field for Person Account', () => {
            const element = createInputField('Name');
            return Promise.resolve().then(() => {
                const inputName = element.shadowRoot.querySelector(
                    'lightning-input-name'
                );
                const picklist = inputName.shadowRoot.querySelector(
                    'lightning-picklist'
                );
                expect(picklist.value).toBe('Mr.');

                const inputs = inputName.shadowRoot.querySelectorAll(
                    'lightning-input'
                );
                expect(inputs.length).toBe(4);

                expect(inputs[0].value).toBe('person');
                expect(inputs[1].value).toBe('account');
                expect(inputs[2].value).toBe('person');
                expect(inputs[3].value).toBe('');
            });
        });
    });
});
