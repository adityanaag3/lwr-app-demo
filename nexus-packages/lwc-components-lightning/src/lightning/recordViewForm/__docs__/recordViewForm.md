Use the `lightning-record-view-form` component to create a form that displays Salesforce record data for specified fields associated with that record. The fields are rendered with their labels and current values as read-only.

You can customize the form layout or provide custom rendering of record data.
If you don't require customizations, use `lightning-record-form` instead.

To specify read-only fields, use `lightning-output-field` components inside `lightning-record-view-form`.

`lightning-record-view-form` requires
a record ID to display the fields on the record. It doesn't require additional
Apex controllers or Lightning Data Service to display record data. This
component also takes care of field-level security and sharing for you, so
users see only the data they have access to.

#### Object API Name

Each Salesforce record is associated with a Salesforce object. For example, a contact record is associated with the Contact object. Record IDs are created with prefixes that indicate the object. The `lightning-record-view-form` component requires you to specify the `object-api-name` attribute to establish the relationship between a record and an object. The object API name must be appropriate for the use of the component. For example, if you include `lightning-record-view-form` on a record page for an account, set `object-api-name="Account"`. If the record ID and object API name don't agree, the form doesn't display.

We strongly recommend importing references to objects and fields. Salesforce verifies that the objects and fields exist, prevents objects and fields from being deleted, and cascades any renamed objects and fields into your component's source code. For more information, see [Understand the Wire Service](docs/component-library/documentation/en/lwc/lwc.data_wire_service_about).

#### Supported Objects

This component doesn't support all Salesforce standard objects. For example,
the Event and Task objects are not supported. This limitation also applies to a record
that references a field that belongs to an unsupported object.

External objects are not supported.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

#### Displaying Record Fields

To display the fields on a record, specify the fields using the
`lightning-output-field` component with the `field-name` attribute
set to the API field name.

```html
<template>
    <lightning-record-view-form
            record-id="003XXXXXXXXXXXXXXX"
            object-api-name="My_Contact__c">
        <div class="slds-box">
            <lightning-output-field field-name="Name">
            </lightning-output-field>
            <lightning-output-field field-name="Email__c">
            </lightning-output-field>
        </div>
    </lightning-record-view-form>
</template>
```
For more information, see the [`lightning-output-field`](bundle/lightning-output-field/documentation) documentation.

#### Using Record Edit Form and Record View Form Together

Here's an example that displays a record edit form and a record view form
for the same contact record. When you make edits and click the **Update Record**
button to submit the record edit form, the record view form updates automatically.

__Note:__ The forms are separate from each other. A form can't be nested in another form.

```html
<template>
    <div class="slds-p-bottom_large slds-p-left_large" style="width:500px">
        <lightning-record-edit-form
                    id="recordEditForm"
                    record-id="003R00000000000000"
                    object-api-name="Contact">
            <lightning-messages></lightning-messages>
            <lightning-input-field field-name="FirstName">
            </lightning-input-field>
            <lightning-input-field field-name="LastName">
            </lightning-input-field>
            <lightning-input-field field-name="Birthdate">
            </lightning-input-field>
            <lightning-input-field field-name="Phone">
            </lightning-input-field>
            <!--Picklist-->
            <lightning-input-field field-name="LeadSource">
            </lightning-input-field>
            <lightning-button type="submit"
                        label="Update Record"
                        class="slds-m-top_medium">
            </lightning-button>
        </lightning-record-edit-form>
    </div>
        <!-- Record Display -->
    <div class="slds-p-bottom_large slds-p-left_large" style="width:500px">
        <lightning-record-view-form
                record-id="003R00000000000000"
                object-api-name="Contact">
        <div class="slds-box">
            <lightning-output-field field-name="Name">
            </lightning-output-field>
            <lightning-output-field field-name="Birthdate">
            </lightning-output-field>
            <lightning-output-field field-name="Phone">
            </lightning-output-field>
            <lightning-output-field field-name="LeadSource">
            </lightning-output-field>
        </div>
        </lightning-record-view-form>
    </div>
</template>
```


#### Creating Multiple Columns

To create a multi-column layout for your record view, use the [Grid utility
classes](https://www.lightningdesignsystem.com/utilities/grid/) in Lightning Design System.
This example creates a two-column layout.

```html
<template>
    <lightning-record-view-form
            record-id="003XXXXXXXXXXXXXXX"
            object-api-name="My_Contact__c">
        <div class="slds-grid">
            <div class="slds-col slds-size_1-of-2">
                <!-- Your lightning-output-field components here -->
            </div>
            <div class="slds-col slds-size_1-of-2">
                <!-- More lightning-output-field components here -->
            </div>
        </div>
    </lightning-record-view-form>
</template>
```
#### Form Display Density

In the Salesforce user interface, the Display Density setting lets users choose how densely the content is displayed. The Comfy density shows labels on top of the fields and more space between page elements. Compact density shows labels next to the fields and less space between page elements.

The record form components, `lightning-record-form`, `lightning-record-edit-form`, and `lightning-record-view-form`,
handle form density in similar ways. The `density` attribute is set to `auto` by default for all record form components.

Display density is supported for `lightning-input-field` and `lightning-output-field` within the form; display density is not supported for custom components within the form.

With `auto` density:
* Record form components detect the Display Density setting and the width of the form's container to determine label position. The record form components don't change the space between elements, however.
* If your Salesforce density setting is Comfy, the fields always display with their labels above them.
* If your Salesforce density setting is Compact, the fields initially display with their labels next to them. If you resize the form container below a certain width or use the form in a narrow container, the fields display with their labels above them. This behavior is similar to how other elements behave in Lightning Experience when Compact density is enabled. The record form components use the same width settings to determine when to switch the display density.
* If a record form component doesn't detect the Salesforce density setting, the fields display with their labels next to them. If you resize the form container to a narrow width, the fields display with their labels above them.

Detecting the user's density setting is only supported in Lightning Experience. When a record form component runs outside Lightning Experience, and density is set to `auto`, the fields display with their labels next to them, and switch to labels above the fields when in a narrow container.

If you specify a variant for `lightning-output-field`, the variant overrides the display density for that field.

##### Setting the Form Display Density

To display a record form with a particular density, set the `density` attribute to one of these values.
* `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
* `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change. To reduce the whitespace between the label and field when the form uses compact density, use the `slds-form-element_1-col` class on `lightning-input-field` or `lightning-output-field`.
* `auto` makes the form use the default behavior described in __Form Display Density__.

#### Displaying Fields Conditionally

To display a field conditionally, use the `if:true|false` directive. 
This example displays or hides the `Name` and `Industry` account fields when you select or unselect a checkbox.

```html
<template>
    <lightning-input type="checkbox"
                     label="Show/Hide"
                     checked={showFields}
                     onchange={toggleFields}>
    </lightning-input>

    <lightning-record-view-form record-id={recordId}
                                object-api-name={objectApiName}
                                density="compact">
        <template if:true={showFields}>
            <lightning-output-field field-name='Name'>
            </lightning-output-field>
            <lightning-output-field field-name='Industry'>
            </lightning-output-field>
        </template>    
    </lightning-record-view-form>
</template>
```

The checkbox toggles between hiding and showing the fields using the `onchange` event handler.

```js
import { LightningElement, api } from 'lwc';

export default class RecordViewFormConditional extends LightningElement {
    @api recordId;
    @api objectApiName; 
    showFields = true;
    
    toggleFields() {
      this.showFields = !this.showFields;
    }
}
```

#### Usage Considerations

Nesting `lighting-record-view-form` in another instance of the component, or nesting it in `lightning-record-edit-form` or `lightning-record-form` is not supported.

Consider using the [`lightning-record-form`](bundle/lightning-record-form/documentation)
component to create record forms more easily.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](docs/component-library/documentation/lwc/lwc.migrate_map_aura_lwc_components) in the Lightning Web Components Developer Guide.

#### Custom Events

**`load`**

The event fired when the record view form loads record data. 
If you load the fields dynamically, `load` is fired before the child elements of `lightning-record-view-form` finish loading. Consider the [`connectedCallback()` lifecycle](docs/component-library/documentation/lwc/lwc.create_lifecycle_hooks_dom) hook to perform initialization tasks. Alternatively, to load values or set properties dynamically, use a [getter and setter](docs/component-library/documentation/lwc/lwc.js_props_getters_setters) instead.

`load` is fired when the form gets new data from Lightning Data Service, which can be once or multiple times after the component is initialized. For example, the `load` event is fired when:
* The `record-id` value changes
* The `fields` list changes
* The form includes picklist fields
* The record type changes

If you require the `load` event to be called only once, write code to prevent it from running more than once.

Use the `event.detail` property to return the [record UI](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_ui.htm).

The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

#### Source Code

`lightning-record-view-form` is available in the [Base Components Recipes GitHub repository](https://github.com/salesforce/base-components-recipes#documentation). It's transpiled into the `c` namespace so that you can use it in your own projects.

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning-record-view-form`, see the following components in the LWC Recipes repo.
 * `c-record-view-form-dynamic-contact`
 * `c-record-view-form-static-contact`

#### See Also

[Work with Records Using Base Components](docs/component-library/documentation/lwc/lwc.data_get_user_input_intro)

[recordViewFormStaticContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordViewFormStaticContact) example in lwc-recipes repository

[recordViewFormDynamicContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordViewFormDynamicContact) example in lwc-recipes repository

