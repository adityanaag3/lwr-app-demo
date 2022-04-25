import { getMock } from 'lightning/testUtils';
import { Lookup } from './pageObjects/lookup';

class SingleEntitySingleValueLookup extends Lookup {
    constructor(params) {
        params = {
            fieldName: 'Contact.AccountId',
            maxValues: 1,
            objectInfos: getMock('lightning/lookup/__mocks__/objectInfos'),
            record: getMock('lightning/lookup/__mocks__/recordWithoutValue'),
            showCreateNew: true,
            ...params,
        };
        super(params);
    }
}

/* eslint-disable @lwc/lwc/no-async-await */
describe('lightning-lookup', () => {
    // Tips: Comment me to keep components after the test
    afterEach(() => {
        Array.from(
            document.body.querySelectorAll('lightning-lookup')
        ).forEach((element) => element.remove());
    });

    describe('Entity Selector', () => {
        it('should not display the entity selector', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();

            expect(lookup.isEntitySelectorDisplayed()).toBeFalse();
        });
    });

    describe('Labels', () => {
        it('should display "Select an option or remove the search term." when the input contains a searchTerm and the user blur the input', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'Uni';

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);
            await lookup.blurAndWaitForHelpMessage();

            // Assert
            expect(lookup.getHelpMessageText()).toEqual(
                'Select an option from the picklist or remove the search term.'
            );
        });

        it('should have "Recent Accounts" group header when items are coming from MRU', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();

            // Assert
            const groupedHeaderLabel = await lookup.getTitleUsedForItems();
            expect(groupedHeaderLabel).toEqual('Recent Accounts');
        });

        it('should have "Search Accounts..." in the input placeholder', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Assert
            const inputPlaceHolder = await lookup.getInputPlaceholder();
            expect(inputPlaceHolder).toEqual('Search Accounts...');
        });

        it('should have "None" label when no label is provided', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Assert
            const labelText = lookup.getLabelText();
            const assistiveTextPresent = lookup.labelHasAssistiveText();
            expect(labelText).toEqual('None');
            expect(assistiveTextPresent).toBeFalse();
        });

        it('should have correct label when label is provided', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                label: 'Account Name',
            });

            // Assert
            const labelText = lookup.getLabelText();
            const assistiveTextPresent = lookup.labelHasAssistiveText();
            expect(labelText).toContain('Account Name');
            expect(assistiveTextPresent).toBeFalse();
        });

        it('should not have label when label-hidden variant is used', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                variant: 'label-hidden',
            });

            // Assert
            // Label is present but not displayed, this is done by slds-assistive-text class
            const assistiveTextPresent = lookup.labelHasAssistiveText();
            expect(assistiveTextPresent).toBeTrue();
        });
    });

    describe('Pills', () => {
        it('should display a pill when a value is already present', async () => {
            // Arrange
            const record = getMock(
                'lightning/lookup/__mocks__/recordWithValue'
            );
            const lookup = new SingleEntitySingleValueLookup({
                value: '001xx000003GqKdAAK',
                record,
            });

            // Assert
            expect(lookup.getSelectedValue()).toBe('Edge Communications');
            expect(lookup.isInputPillPresent()).toBe(true);
        });

        it('should add a pill when the user click on a record', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems('Uni');
            await lookup.selectItem('University of Arizona');

            // Assert
            expect(lookup.getSelectedValue()).toBe('University of Arizona');
            expect(lookup.isInputPillPresent()).toBe(true);
        });

        it('should remove a pill when the X button on a pill is clicked', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();
            await lookup.selectItem('Edge Communications');
            await lookup.removePill();

            // Assert
            expect(lookup.isInputPillPresent()).toBe(false);
        });

        it('should not remove a pill when the X button on a pill is clicked and the component is disabled', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                record: getMock('lightning/lookup/__mocks__/recordWithValue'),
                disabled: true,
            });

            // Act
            await lookup.removePill();

            // Assert
            expect(lookup.isInputPillPresent()).toBe(true);
            expect(lookup.getSelectedValue()).toBe('Edge Communications');
        });
    });

    describe('Items', () => {
        let LOOKUPS_MOCKS;
        beforeEach(() => {
            LOOKUPS_MOCKS = getMock('lightning/lookup/__mocks__/uiLookupsApi');
        });
        it('should not display more than 5 records when searchType is MRU and the server response contains more than 5 records', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const suggestions =
                LOOKUPS_MOCKS['Contact.AccountId:Account::Recent:1:25'].records;

            // Act
            await lookup.openDropdown();
            const displayedItems = await lookup.getDisplayedItems();

            // Assert
            expect(displayedItems.length).toEqual(5);
            expect(lookup.isSpinnerPresent()).toBeFalse();
            displayedItems.forEach((item, index) => {
                expect(item.hasIcon()).toBeTrue();
                expect(item.getPrimaryText()).toEqual(
                    suggestions[index].fields.Name.value
                );
                expect(item.getSecondaryText()).toEqual(
                    suggestions[index].fields.DisambiguationField.value
                );
            });
        });
        it('should not display more than 5 records when searchType is TA and the server response contains more than 5 records', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'Uni';
            const suggestions =
                LOOKUPS_MOCKS['Contact.AccountId:Account:Uni:TypeAhead:1:25']
                    .records;

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);
            const displayedItems = await lookup.getDisplayedItems();

            // Assert
            expect(displayedItems.length).toEqual(5);
            expect(lookup.isSpinnerPresent()).toBeFalse();
            displayedItems.forEach((item, index) => {
                expect(item.hasIcon()).toBeTrue();
                expect(item.getPrimaryText()).toEqual(
                    suggestions[index].fields.Name.value
                );
                expect(item.getHighlightedText().toLowerCase()).toBe(
                    queryTerm.toLowerCase()
                );
                expect(item.getSecondaryText()).toEqual(
                    suggestions[index].fields.DisambiguationField.value
                );
            });
        });
        it('should not display secondary field on TA when response does not contain any', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'Univer';
            const suggestions =
                LOOKUPS_MOCKS['Contact.AccountId:Account:Univer:TypeAhead:1:25']
                    .records;

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);
            const displayedItems = await lookup.getDisplayedItems();

            // Assert
            expect(displayedItems.length).toEqual(1);
            expect(lookup.isSpinnerPresent()).toBeFalse();
            displayedItems.forEach((item, index) => {
                expect(item.hasIcon()).toBeTrue();
                expect(item.getPrimaryText()).toEqual(
                    suggestions[index].fields.Name.value
                );
                expect(item.getHighlightedText().toLowerCase()).toBe(
                    queryTerm.toLowerCase()
                );
                expect(item.getSecondaryText()).toBeFalsy();
            });
        });
        it('should display a spinner when search is in progress', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'Salesforce';

            // Act
            await lookup.openDropdown();
            await lookup.typeText(queryTerm);
            // Assert
            expect(lookup.isSpinnerPresent()).toBeTrue();
        });
    });

    describe('Create New', () => {
        it('should not show "+ New <Entity>" item when showCreateNew prop is true and uiActions call returns no actions for MRU', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                fieldName: 'Contact.ReportsToId',
                showCreateNew: true,
            });

            // Act
            await lookup.openDropdown();

            // Assert
            expect(lookup.isCreateNewPresent('Contact')).toBeFalse();
        });
        it('should not show "+ New <Entity>" item when showCreateNew prop is true and uiActions call returns no actions for TA', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                fieldName: 'Contact.ReportsToId',
                showCreateNew: true,
            });
            const queryTerm = 'Andy';

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);

            // Assert
            expect(lookup.isCreateNewPresent('Contact')).toBeFalse();
        });
        it('should not show "+ New <Entity>" item when showCreateNew prop is false', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup({
                showCreateNew: false,
            });

            // Act
            await lookup.openDropdown();

            // Assert
            expect(lookup.isCreateNewPresent('Account')).toBeFalse();
        });
        it('should show "+ New <Entity>" item when showCreateNew prop is true and uiActions call returns the create new action when there is no results', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'k';

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);

            // Assert
            expect(lookup.isCreateNewPresent('Account')).toBeTrue();
        });
        it('should show "+ New <Entity>" item when showCreateNew prop is true and uiActions call returns the create new action', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();
            const queryTerm = 'Uni';

            // Act
            await lookup.openDropdown();
            await lookup.typeTextAndWaitForItems(queryTerm);

            // Assert
            expect(lookup.isCreateNewPresent('Account')).toBeTrue();
        });
    });

    describe('Advanced Search', () => {
        [
            {
                param: {},
                expected: true,
                expectation:
                    'should show advanced search option when showAdvancedSearch is enabled (using default value)',
            },
            {
                param: { showAdvancedSearch: false },
                expected: false,
                expectation:
                    'should not show advanced search option when showAdvancedSearch is disabled',
            },
            {
                param: { showAdvancedSearch: true },
                expected: true,
                expectation:
                    'should show advanced search option when showAdvancedSearch is enabled',
            },
        ].forEach((testCase) => {
            it(testCase.expectation, async () => {
                // Arrange
                const lookup = new SingleEntitySingleValueLookup(
                    testCase.param
                );

                // Act
                await lookup.openDropdown();
                await lookup.typeTextAndWaitForItems('Uni');

                expect(lookup.isAdvancedSearchPresent('Uni')).toBe(
                    testCase.expected
                );
            });
        });
    });

    describe('Bugs', () => {
        it('should not scope result to search term when RRH revert button is clicked', async () => {
            // Arrange
            const lookup = new SingleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();
            const mruItems = lookup.getDisplayedItemTexts();
            await lookup.typeTextAndWaitForItems('Uni');
            await lookup.selectItem('University of Arizona');

            // Simulate the revert action in RRH
            lookup.element.value = [];
            await lookup.openDropdown();

            // Assert
            const items = lookup.getDisplayedItemTexts();
            expect(items).toEqual(mruItems);
            expect(lookup._spinner).toBeNull();
        });
    });
});
