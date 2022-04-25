import labelCurrentSelection from '@salesforce/label/LightningLookup.currentSelection';

import * as LookupUtils from './utils';
import { COMMON_LOOKUP_CONSTANTS } from './constants';

const i18n = {
    currentSelection: labelCurrentSelection,
};

export class MetadataManager {
    /**
     * Computes a map of field info like isRequired, dependentFields, etc.
     * @param {Object} objectInfos - Source record's objectInfos.
     * @param {String} apiName - An api name.
     * @param {String} fieldApiName - The qualified field name.
     * @returns {Object} - A map of field infos.
     */
    static computeFieldInfo(objectInfos, apiName, fieldApiName) {
        let computedFieldInfo = {};

        if (!objectInfos || !apiName || !fieldApiName) {
            return computedFieldInfo;
        }

        const fieldName = LookupUtils.computeUnqualifiedFieldApiName(
            fieldApiName
        );
        const objectInfo = objectInfos[apiName] || {};
        const fieldInfo = objectInfo.fields
            ? objectInfo.fields[fieldName]
            : null;

        if (fieldInfo) {
            computedFieldInfo = {
                // See https://sfdc.co/dependent-lookups for more information.
                dependentFields: fieldInfo.filteredLookupInfo
                    ? fieldInfo.filteredLookupInfo.controllingFields
                    : undefined,
                fieldName,
                inlineHelpText: fieldInfo.inlineHelpText,
                isRequired: fieldInfo.required,
                references: fieldInfo.referenceToInfos,
                relationshipName: fieldInfo.relationshipName,
            };
        }

        return computedFieldInfo;
    }

    static computeFieldApiName(fieldName = '', sourceApiName = '') {
        if (fieldName === null) {
            fieldName = '';
        }

        if (sourceApiName === null) {
            sourceApiName = '';
        }

        let apiName = '';

        if (typeof fieldName === 'string' && fieldName.length) {
            const idx = fieldName.indexOf('.');
            if (idx >= 1) {
                apiName = fieldName;
            }
        } else if (
            typeof fieldName === 'object' &&
            typeof fieldName.objectApiName === 'string' &&
            typeof fieldName.fieldApiName === 'string'
        ) {
            apiName = fieldName.objectApiName + '.' + fieldName.fieldApiName;
        }

        if (!apiName.length && fieldName.length && sourceApiName.length) {
            apiName = sourceApiName + '.' + fieldName;
        }

        return apiName;
    }

    static computeObjectInfo(objectInfos, apiName) {
        if (!objectInfos || !apiName) {
            return {};
        }

        const objectInfo = objectInfos[apiName] || {};
        const themeInfo = objectInfo.themeInfo || {};

        return {
            apiName,
            color: themeInfo.color || '',
            iconAlternativeText: apiName,
            iconName: LookupUtils.getIconOf(objectInfo),
            iconUrl: themeInfo.iconUrl || '',
            keyPrefix: objectInfo.keyPrefix,
            label: objectInfo.label,
            labelPlural: objectInfo.labelPlural,
        };
    }

    /**
     * Computes a map of supported references apis with their infos like nameField, label, iconName etc.
     */
    static computeReferenceInfos(objectInfos = {}, referenceToInfos = []) {
        if (objectInfos === null) {
            objectInfos = {};
        }

        if (referenceToInfos === null) {
            referenceToInfos = [];
        }

        const references = {};
        const referenceToInfosLength = referenceToInfos.length;

        for (let i = 0; i < referenceToInfosLength; i++) {
            const reference = referenceToInfos[i];
            const apiName = reference.apiName;
            const nameFields = reference.nameFields;
            let nameField;
            if (Array.isArray(nameFields) && nameFields.length > 0) {
                if (nameFields.length > 1) {
                    nameField = 'Name';
                } else {
                    nameField = nameFields[0];
                }
                const objectInfo = MetadataManager.computeObjectInfo(
                    objectInfos,
                    apiName
                );
                objectInfo.nameField = nameField;
                objectInfo.optionalNameField = apiName + '.' + nameField;
                references[apiName] = objectInfo;
            }
        }
        return references;
    }

    fieldApiName;
    fieldInfo;
    fieldLevelHelp;
    /**
     * The reference api infos for given field.
     * For example -
     * {
     *  'Opportunity': {
     *          apiName: 'Opportunity',
     *          color: 'FCB95B',
     *          iconAlternativeText: 'Opportunity',
     *          iconName: 'standard:opportunity',
     *          iconUrl: 'http://.../standard/foo.png',
     *          keyPrefix: '006',
     *          label: 'Opportunity',
     *          labelPlural: 'Opportunities',
     *          nameField: 'Name',
     *          optionalNameField: 'Opportunity.Name',
     *      },
     *  'Account': {..},
     *  ...
     * }
     * @type {Object}
     */
    referenceInfos = {};

    _sourceObjectInfo = {};
    _targetObjectInfo = {};

    get dependentFields() {
        return this.fieldInfo.dependentFields;
    }

    get isFieldRequired() {
        return this.fieldInfo.isRequired;
    }

    get isSingleEntity() {
        return Object.keys(this.referenceInfos).length === 1;
    }

    get optionalNameFields() {
        let references = this.referenceInfos;
        if (references === null) {
            references = {};
        }

        const optionalNameFields = [];
        for (const reference in references) {
            if (
                // eslint-disable-next-line no-prototype-builtins
                references.hasOwnProperty(reference) &&
                // eslint-disable-next-line no-prototype-builtins
                references[reference].hasOwnProperty('optionalNameField')
            ) {
                optionalNameFields.push(
                    references[reference].optionalNameField
                );
            }
        }
        return optionalNameFields;
    }

    get sourceApiName() {
        return this._sourceObjectInfo.apiName;
    }

    get sourceEntityLabel() {
        return this._sourceObjectInfo.label;
    }

    get targetApiName() {
        return this._targetObjectInfo.apiName;
    }

    get targetLabel() {
        return this._targetObjectInfo.label;
    }

    get targetPluralLabel() {
        return this._targetObjectInfo.labelPlural;
    }

    constructor(fieldName, objectInfos, record, selectedEntityApiName) {
        if (
            !fieldName ||
            !Object.keys(record || {}).length ||
            !Object.keys(objectInfos || {}).length
        ) {
            return;
        }

        this._sourceObjectInfo = MetadataManager.computeObjectInfo(
            objectInfos,
            record.apiName
        );
        // Update field info.
        this.fieldApiName = MetadataManager.computeFieldApiName(
            fieldName,
            this._sourceObjectInfo.apiName
        );

        this.fieldInfo = MetadataManager.computeFieldInfo(
            objectInfos,
            this._sourceObjectInfo.apiName,
            this.fieldApiName
        );

        this.fieldLevelHelp = this.fieldInfo.inlineHelpText;

        this.referenceInfos = MetadataManager.computeReferenceInfos(
            objectInfos,
            this.fieldInfo.references
        );

        this._targetObjectInfo = MetadataManager.computeObjectInfo(
            objectInfos,
            selectedEntityApiName || this.getTargetApiName()
        );
    }

    _getFieldValue(record, field) {
        const { fields } = record;

        if (['Id', 'RecordTypeId'].includes(field)) {
            return record[this._uncapitalize(field)] || null;
        }

        if (
            !fields ||
            !fields[field] ||
            typeof fields[field].value == 'undefined'
        ) {
            return null;
        }

        return fields[field].value;
    }

    /**
     * Checks if object has no keys.
     * @param {String} obj - An object to be validated.
     * @returns {Boolean} - True if object has no keys.
     */
    _isEmptyObject(obj) {
        if (obj === undefined || obj === null) {
            return false;
        }

        // eslint-disable-next-line guard-for-in
        for (const name in obj) {
            return false;
        }
        return true;
    }

    _uncapitalize(s) {
        return s.charAt(0).toLowerCase() + s.slice(1);
    }

    /**
     * Returns the dependent field bindings map for a given Record representation.
     * @param  {Object} record - A record representation.
     */
    getBindingsMap(record) {
        if (!record || !this.dependentFields || !this.dependentFields.length) {
            return null;
        }

        return this.dependentFields.reduce(
            (acc, field) => ({
                ...acc,
                [field]: this._getFieldValue(record, field),
            }),
            {}
        );
    }

    /**
     * Returns a CSV string of dependent field bindings given a Record
     * representation and a list of dependent fields.
     * @param  {Object} record - A record representation.
     * @return {Object} - A CSV string of dependent field bindings.
     */

    getBindingsString(record) {
        const bindings = this.getBindingsMap(record);

        return (
            bindings &&
            Object.entries(bindings)
                .map(([key, value]) => `${key}=${value}`)
                .join(',')
        );
    }

    getTargetObjectIconDetails() {
        return {
            iconAlternativeText: this._targetObjectInfo.iconAlternativeText,
            iconName: this._targetObjectInfo.iconName,
        };
    }

    getTargetObjectAsScope() {
        let objectInfo = this._targetObjectInfo || {};

        return {
            iconUrl: objectInfo.iconUrl,
            label: objectInfo.label,
            labelPlural: objectInfo.labelPlural,
            name: objectInfo.apiName,
        };
    }

    getTargetApiName() {
        // Select first field reference apiName as target api if targetObjectInfo is empty or stale.
        if (this.isTargetEntityEmptyOrStale()) {
            const fieldReferences = this.fieldInfo.references;
            if (Array.isArray(fieldReferences) && fieldReferences.length) {
                return fieldReferences[0].apiName;
            }
            return undefined;
        }
        return this._targetObjectInfo.apiName;
    }

    getEntitiesLabelInfo() {
        return {
            sourceEntityLabel: this.sourceEntityLabel,
            targetEntityLabelPlural: this.targetPluralLabel,
            targetLabel: this.targetLabel,
        };
    }

    getReferencedApiNameField(apiName) {
        return (
            Object.prototype.hasOwnProperty.call(
                this.referenceInfos,
                apiName
            ) && this.referenceInfos[apiName].nameField
        );
    }

    getReferencedApiNameFieldFromTargetApi() {
        return this.getReferencedApiNameField(this.targetApiName);
    }

    getFilterItems() {
        const references = this.referenceInfos || {};
        const chosenApi = this.targetApiName;
        const referenceApiNames = Object.keys(references);

        let items = null;

        if (referenceApiNames.length > 1) {
            // Alphabetically sort api names.
            referenceApiNames.sort();
            items = [];
            referenceApiNames.forEach((apiName) => {
                const item = {
                    text: references[apiName].label,
                    type: COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_INLINE,
                    value: apiName,
                };

                if (chosenApi && apiName === chosenApi) {
                    item.highlight = true;
                    item.iconAlternativeText = `${i18n.currentSelection}`;
                    item.iconName = COMMON_LOOKUP_CONSTANTS.ICON_CHECK;
                    item.iconSize = COMMON_LOOKUP_CONSTANTS.ICON_SIZE_X_SMALL;
                }

                items.push(item);
            });
        }

        return items;
    }

    isTargetEntityEmptyOrStale() {
        return (
            this._isEmptyObject(this._targetObjectInfo) ||
            !Object.prototype.hasOwnProperty.call(
                this.referenceInfos,
                this._targetObjectInfo.apiName
            )
        );
    }
}
