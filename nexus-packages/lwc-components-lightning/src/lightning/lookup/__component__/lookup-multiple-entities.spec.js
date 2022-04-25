import { getMock } from 'lightning/testUtils';
import { Lookup } from './pageObjects/lookup';

class MultipleEntitySingleValueLookup extends Lookup {
    constructor(params) {
        params = {
            fieldName: 'Case.SourceId',
            maxValues: 1,
            objectInfos: getMock('lightning/lookup/__mocks__/objectInfos'),
            record: getMock(
                'lightning/lookup/__mocks__/caseRecordWithoutValue'
            ),
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

    describe('Switch Entities', () => {
        let LOOKUPS_MOCKS;
        beforeEach(() => {
            LOOKUPS_MOCKS = getMock('lightning/lookup/__mocks__/uiLookupsApi');
        });
        it('should display the entities list when clicking on entity selector', async () => {
            // Arrange
            const lookup = new MultipleEntitySingleValueLookup();

            // Act
            const entities = await lookup.getDisplayedEntitiesTexts();

            // Assert
            expect(entities).toEqual(['Email Message', 'Social Post']);
        });
        it('should search for suggestions on one entity and then on another when switched to it', async () => {
            // Arrange
            const lookup = new MultipleEntitySingleValueLookup();
            const emailSuggestions =
                LOOKUPS_MOCKS['Case.SourceId:EmailMessage::Recent:1:25']
                    .records;
            const socialPostSuggestions =
                LOOKUPS_MOCKS['Case.SourceId:SocialPost::Recent:1:25'].records;

            // Act
            await lookup.openDropdown();
            let displayedItems = await lookup.getDisplayedItems();

            // Assert
            expect(displayedItems.length).toEqual(1);
            displayedItems.forEach((item, index) => {
                expect(item.hasIcon()).toBeTrue();
                expect(item.getPrimaryText()).toEqual(
                    emailSuggestions[index].fields.Name.value
                );
            });

            // Act
            await lookup.selectEntity('Social Post');
            await lookup.openDropdown();
            displayedItems = await lookup.getDisplayedItems();

            // Assert
            expect(displayedItems.length).toEqual(1);
            displayedItems.forEach((item, index) => {
                expect(item.hasIcon()).toBeTrue();
                expect(item.getPrimaryText()).toEqual(
                    socialPostSuggestions[index].fields.Name.value
                );
            });
        });
        it('should update "+ new <Entity>" option for polymorphic lookups when new entity is selected.', async () => {
            // Arrange
            const lookup = new MultipleEntitySingleValueLookup();

            // Act
            await lookup.openDropdown();

            // Assert
            expect(lookup.isCreateNewPresent('Email Message')).toBeFalse();

            // Act
            await lookup.selectEntity('Social Post');
            await lookup.openDropdown();

            // Assert
            expect(lookup.isCreateNewPresent('Social Post')).toBeTrue();
        });
    });
});
