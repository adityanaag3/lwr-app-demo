Use the `lightning-record-edit-form` component to create a form that's used to add a Salesforce record or update fields in an existing record on an object. The component displays fields with their labels and the current values, and enables you to edit their values.

`lightning-record-edit-form` supports the following features.

  * Editing a record's specified fields, given the record ID.
  * Creating a record using specified fields.
  * Customizing the form layout
  * Custom rendering of record data

If you don't require customizations, use [`lightning-record-form`](docs/component-library/bundle/lightning-record-form/documentation) instead.

To specify editable fields, use `lightning-input-field` components inside `lightning-record-edit-form` component. See the **Editing a Record** section.

To display record fields as read-only in `lightning-record-edit-form`, use `lightning-output-field` components to specify those fields. You can also use HTML and other display components such as `lightning-formatted-name` to display non-editable content.

To display all fields as read-only, use the `lightning-record-form` component with `mode="readonly"` or the `lightning-record-view-form` component instead of `lightning-record-edit-form`.

To understand the different use cases, see [Work with Records Using Base Components](docs/component-library/documentation/lwc/lwc.data_get_user_input_intro).

#### Working with Salesforce Data

`lightning-record-edit-form` implements Lightning Data Service and doesn't require additional Apex controllers to create or update record data. This component also takes care of field-level security and sharing for you, so users see only the data they have access to. For more information, see [Lightning Data Service](docs/component-library/documentation/en/lwc/lwc.data_ui_api).

When possible, let `lightning-record-edit-form` load and manage the data for you as it implements Lightning Data Service. Using `lightning-record-edit-form` to create or update records with Apex controllers can lead to unexpected behaviors. Additionally, data provisioned by Apex is not managed and you must handle data refresh by invoking the Apex method again on your own. For more information, see [Data Guidelines](docs/component-library/documentation/en/lwc/lwc.data_guidelines) in the Lightning Web Components Developer Guide.

You can use Apex if you are working with an object that's not supported by the User Interface API, or if you have to use a SOQL query to select certain records. See the **Supported Objects** section. 

#### Object API Name

Each Salesforce record is associated with a Salesforce object. For example, a contact record is associated with the Contact object. Record IDs are created with prefixes that indicate the object. The `lightning-record-edit-form` component requires you to specify the `object-api-name` attribute to establish the relationship between a record and an object. The object API name must be appropriate for the use of the component. For example, if you include `lightning-record-edit-form` on a record page for an account, set `object-api-name="Account"`. If a record is changed, the component submits changes only if the record ID agrees with the specified object API name. If there's a mismatch, and the component includes `lightning-messages`, users see an error indicating the API name is invalid.

We strongly recommend importing references to objects and fields. Salesforce verifies that the objects and fields exist, prevents objects and fields from being deleted, and cascades any renamed objects and fields into your component's source code. For more information, see [Understand the Wire Service](docs/component-library/documentation/en/lwc/lwc.data_wire_service_about).

#### Supported Objects

This component doesn't support all Salesforce standard objects. For example,
the Event and Task objects are not supported. This limitation also applies to a record
that references a field that belongs to an unsupported object.

External objects are not supported.

To work with the User object, specify `FirstName` and `LastName` instead of the `Name` compound field for the `field-name` values of `lightning-input-field`.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

You can use Apex if you are working with an object that's not supported by the User Interface API, or if have to use a SOQL query to select certain records. 
For more information, see [Data Guidelines](docs/component-library/documentation/en/lwc/lwc.data_guidelines) in the Lightning Web Components Developer Guide.

#### Editing a Record

To enable record editing, pass in the ID of the record and the corresponding
object API name to be edited. Specify the fields you want to include in the
record edit layout using `lightning-input-field`. For more information, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.

Include a `lightning-button` component with `type="submit"`. When you press the Enter key or click the button, it validates the fields and submits the values.


```html
<template>
    <lightning-record-edit-form record-id="003XXXXXXXXXXXXXXX"
                                object-api-name="Contact">
        <lightning-messages>
        </lightning-messages>
        <lightning-output-field field-name="AccountId">
        </lightning-output-field>
        <lightning-input-field field-name="FirstName">
        </lightning-input-field>
        <lightning-input-field field-name="LastName">
        </lightning-input-field>
        <lightning-input-field field-name="Email">
        </lightning-input-field>
        <lightning-button
            class="slds-m-top_small"
            variant="brand"
            type="submit"
            name="update"
            label="Update">
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

#### Creating a Record

To enable record creation, pass in the object API name for the record to be
created. Specify the fields you want to include in the record create layout
using `lightning-input-field` components. For more information, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.

Include a `lightning-button` component with `type="submit"`. When you press the Enter key or click the button, it validates the fields and submits the values.

```html
<template>
    <lightning-record-edit-form object-api-name="Contact">
        <lightning-messages>
        </lightning-messages>
        <lightning-input-field field-name="Name">
        </lightning-input-field>
            <lightning-button
                class="slds-m-top_small"
                type="submit"
                label="Create new">
            </lightning-button>
    </lightning-record-edit-form>
</template>
```

#### Submitting Form Values with a Button

`lightning-record-edit-form` renders the fields within the HTML `form` element and uses a button for form submission. 
Customizing the `form` element for form submission is not supported.
We recommend that you use `lightning-button` with `type="submit"` as shown in the previous sections.
The default `type` on `lightning-button` is `button`, which does nothing unless you include an `onclick` handler. 
If you use an HTML `button` element within `lightning-record-edit-form`, the default is `type="submit"`.

When you submit the form, the component fires the custom events in this order.

 * `click` if you use the `onclick` event handler on the button
 * `submit`
 * `success` or `error`

You can edit the field values programmatically using the `onsubmit` event handler or selectively handle any of the custom events. See **Overriding Default Behaviors**.

#### Error Handling

`lightning-record-edit-form` handles field-level validation errors and Lightning Data Service errors automatically.
For example, entering an invalid email format for the Email field
results in an error message when you move focus away from the field. Similarly, a
required field like the Last Name field displays an error message when you leave
the field blank and move focus away.

A Lightning Data Service error is returned when a resource becomes inaccessible on the server or an invalid record ID is passed in, for example. To display the error message automatically, include `lightning-messages` immediately before or after the `lightning-input-field` components. For more information, see **Overriding Default Behaviors**.

`lightning-record-edit-form` also verifies data input based on your validation rules. The form submits and saves data input only if all data in the fields are valid. The form clears validation rule errors when an `onchange` event is fired on the overall form, and also when you update a field with a validation rule error.

If a single field has multiple validation errors, the form shows only the first error on the field. Similarly, if a submitted form has multiple errors, the form displays only the first error encountered. When you correct the displayed error, the next error is displayed.

We recommend using custom validation rules to verify data input instead of implementing client-side validation errors. A validation rule can contain a formula or expression that evaluates the data in one or more fields. You can include an error message to display on an invalid field. See [Validation Rules](https://help.salesforce.com/articleView?id=fields_about_field_validation.htm) in Salesforce Help for more information.

#### Returning the Record Id

A record Id is generated when a record is created successfully. To return the Id, use the `onsuccess` handler.
This example shows an Id field that's populated when you create an account by providing an account name and pressing the __Create Account__ button.

```html
<template>
    <lightning-record-edit-form object-api-name="Account" onsuccess={handleSuccess}>
        <lightning-messages></lightning-messages>
        <div class="slds-m-around_medium">
            <lightning-input-field field-name='Id' value={accountId}></lightning-input-field>
            <lightning-input-field field-name='Name'></lightning-input-field>
            <div class="slds-m-top_medium">
                <lightning-button variant="brand" type="submit" name="save" label="Create Account">
                </lightning-button>
           </div>
       </div>
    </lightning-record-edit-form>
</template>
```

The record Id of the newly created acount is assigned to the `accountId` property.

```javascript
import { LightningElement } from 'lwc';

export default class createRecordForm extends LightningElement {
   accountId;
   handleSuccess(event) {
       this.accountId = event.detail.id;
   }
}
```

#### Displaying Forms Based on a Record Type

If your org uses record types, picklist fields display values according to
your record types. You must provide a record type ID using the `record-type-id`
attribute if you have multiple record types on an object and you don't have a
default record type. Otherwise, the default record type ID is used.

To retrieve a list of record type IDs in your org, use the `getObjectInfo` wire adapter. For more information, see the [getObjectInfo documentation](docs/component-library/documentation/lwc/lwc.reference_wire_adapters_object_info).

Passing in a record type as a field on this component is not supported.

#### Creating Multiple Columns

To create a multi-column layout for your record edit layout, use the Grid
utility classes in Lightning Design System. This example creates a two-column
layout.

```html
<template>
    <lightning-record-edit-form
            record-id="003XXXXXXXXXXXXXXX"
            object-api-name="Contact">
        <div class="slds-grid">
            <div class="slds-col slds-size_1-of-2">
                <!-- Your lightning-input-field components here -->
            </div>
            <div class="slds-col slds-size_1-of-2">
                    <!-- More lightning-input-field components here -->
            </div>
        </div>
    </lightning-record-edit-form>
</template>
```
#### Prepopulating Field Values

 To provide a custom field value when the form displays, use the `value` attribute on `lightning-input-field`. If you're providing a record ID, the value returned by the record on load does not override this custom value.

 This example displays a form with a custom value for the account name field.
The form creates a new account record when the button is clicked.

 ```html
<template>
    <lightning-record-edit-form object-api-name="Account">
        <lightning-input-field field-name="Name"
                               value="My Field Value">
        </lightning-input-field>
        <lightning-button class="slds-m-top_small"
                          type="submit"
                          label="Create new">
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

This example displays a form with a custom value for the account name field.
The form updates the account record when the button is clicked.

 ```html
<template>
    <lightning-record-edit-form record-id={recordId}
                                object-api-name={objectApiName}>
        <lightning-input-field field-name="Name"
                            value="My Field Value"></lightning-input-field>
        <lightning-button class="slds-m-top_small"
                        type="submit"
                        label="Update record"></lightning-button>
    </lightning-record-edit-form>
</template>
```

 Define the `recordId` and the `objectApiName` in your JavaScript code. The component inherits the record ID and object API name from the record page it's placed on.

 ```javascript
import { LightningElement, api } from 'lwc';
 export default class FieldValueExample extends LightningElement {
    @api recordId;
    @api objectApiName;
}
 ```

 To programmatically set the value when the form loads, provide your value in JavaScript. This example sets the value using the `myValue` property. You can set this value programmatically at a later time, as shown by the `onclick` event handler, which calls the `overrideValue` method.

 ```html
<template>
    <lightning-record-edit-form object-api-name="Account">
        <lightning-input-field field-name="Name"
                               value={myValue}></lightning-input-field>
        <lightning-button class="slds-m-top_small"
                          type="submit"
                          label="Create new"></lightning-button>
    </lightning-record-edit-form>

     <lightning-button label="Override Value"
                      onclick={overrideValue}></lightning-button>

 </template>
```

 The `myValue` property reassigned a new value when the **Override Value** button is clicked.

 ```javascript
import { LightningElement, api } from 'lwc';
export default class FieldValueCreateExample extends LightningElement {
    myValue = "My Account Name";
    overrideValue(event) {
        this.myValue = "My New Name";
    }
}
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

If you specify a variant for `lightning-input-field` or `lightning-output-field`, the variant overrides the display density for that field.

#### Setting the Form Display Density

To display a record form with a particular density, set the `density` attribute to one of these values.
* `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
* `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change. To reduce the whitespace between the label and field when the form uses compact density, use the `slds-form-element_1-col` class on `lightning-input-field` or `lightning-output-field`.
* `auto` makes the form use the default behavior described in __Form Display Density__.

#### Overriding Default Behaviors

To customize the behavior of your form when it loads or when data is
submitted, use the `onload` and `onsubmit` attributes to specify event
handlers. If you capture the submit event and submit the form
programmatically, use `event.preventDefault()` to cancel the default behavior
of the event. This prevents a duplicate form submission.

Errors are automatically handled. To customize the behavior of the form when
it encounters an error on submission or when data is submitted successfully,
use the `onerror` and `onsuccess` attributes to specify event handlers.

Here are some example event handlers for `onsubmit` and `onsuccess`.

 ```javascript
handleSubmit(event){
    event.preventDefault();       // stop the form from submitting
    const fields = event.detail.fields;
    fields.Street = '32 Prince Street';
    this.template.querySelector('lightning-record-edit-form').submit(fields);
}
handleSucess(event){
    const updatedRecord = event.detail.id;
    console.log('onsuccess: ', updatedRecord);
}
```

To see all the response data:

```javascript
handleSuccess(event){
    const payload = event.detail;
    console.log(JSON.stringify(payload));
}
```

#### Resetting the Form

To reset the form fields to their initial values, use the `reset()` method on `lightning-input-field`.

We recommend creating a button that reverts the field values to their initial values using `lightning-button`. The default `type` for `lightning-button` is `button`, which does nothing unless you include an `onclick` handler.

If you use an HTML `button` element within `lightning-record-edit-form` to perform an action such as resetting the field values, specify `type="button"`.
By default, an HTML `button` element uses `type="submit"` when it's rendered in an HTML `form` element. Additionally, using `type="reset"` on a button deletes the form values and does not preserve the intial values.

This example creates a form with two fields, followed by Cancel and Save Record buttons. When you click the Cancel button, the `handleReset` method resets the fields to their initial values. Add this example to an account record page to inherit its record ID.

 ```html
<template>
    <lightning-record-edit-form
        record-id={recordId}
        object-api-name={objectApiName}>
        <lightning-input-field field-name="Name"></lightning-input-field>
        <lightning-input-field field-name="Industry"></lightning-input-field>
        <div class="slds-m-top_medium">
            <lightning-button class="slds-m-top_small" label="Cancel" onclick={handleReset}></lightning-button>
            <lightning-button class="slds-m-top_small" type="submit" label="Save Record"></lightning-button>
        </div>
    </lightning-record-edit-form>
```

 Call the `reset()` method on each field.

 ```javascript
handleReset(event) {
    const inputFields = this.template.querySelectorAll(
        'lightning-input-field'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            field.reset();
        });
    }
}
```

#### Resetting Individual Fields

To reset the value of a specific field, first find the fields to reset using the `class` or `name` attribute.

This example uses the `class` attribute to assign a unique identifier to the Name compound field and Title field. It assumes that you created a custom class `contactName`.

```html
<template>
    <lightning-record-edit-form
        record-id={recordId}
        object-api-name={objectApiName}>
        <!--Other fields here -->
        <lightning-input-field field-name="Name" class="contactName">
        </lightning-input-field>
        <lightning-input-field field-name="Title" class="contactName">
        </lightning-input-field>
         <lightning-button class="slds-m-top_small" label="Cancel" onclick={handleReset}></lightning-button>
    </lightning-record-edit-form>
</template>
```

Use `querySelectorAll` to query all fields matching the `.contactName` class.

```javascript
handleReset(event) {
    const inputFields = this.template.querySelectorAll(
        '.contactName'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            field.reset();
        });
    }
}
```

If you are not using a custom class, use `name` instead. This example uses the `name` attribute to assign an identifier for the field to be reset
to its initial value.

```html
<template>
    <lightning-record-edit-form
        record-id={recordId}
        object-api-name={objectApiName}>
        <!--Other fields here -->
        <lightning-input-field name="email" field-name="Email">
        </lightning-input-field>
        <lightning-button class="slds-m-top_small" label="Reset Email" onclick={handleReset}>
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

You can use the same `name` attribute values on multiple fields. Match the field name in the `forEach` block to trigger a reset on the email field.

```javascript
handleReset(event) {
    const inputFields = this.template.querySelectorAll(
        'lightning-input-field'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            if(field.name === "email") {
                field.reset();
            }
        });
    }
}
```

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

    <lightning-record-edit-form record-id={recordId} 
                                object-api-name={objectApiName}
                                density="compact">
        <template if:true={showFields}>
            <lightning-input-field field-name='Name'>
            </lightning-input-field>
            <lightning-input-field field-name='Industry'>
            </lightning-input-field>
        </template>    
    </lightning-record-edit-form>
</template>
```

The checkbox toggles between hiding and showing the fields using the `onchange` event handler.

```js
import { LightningElement, api } from 'lwc';

export default class RecordEditFormConditional extends LightningElement {
    @api recordId;
    @api objectApiName; 
    showFields = true;
    
    toggleFields() {
      this.showFields = !this.showFields;
    }
}
```

#### Usage Considerations

Nesting `lighting-record-edit-form` in another instance of the component, or nesting it in `lightning-record-form` or `lightning-record-view-form` is not supported.

The form displays read-only input fields the same as output fields, without borders or gray backgrounds, unlike disabled input fields.

The `Id` field for a record ID displays as read-only even when specified with `lightning-input-field`.

Formula fields are automatically calculated, and displayed read-only on record forms. Formula fields always display the calculated value.

When using `lightning-input-field`, rich text fields can't be used for image
uploads.

For more information about supported field types such as name fields and lookup fields, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.

Consider using the [`lightning-record-form`](bundle/lightning-record-form/documentation)
component to create record forms more easily.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](docs/component-library/documentation/lwc/lwc.migrate_map_aura_lwc_components) in the Lightning Web Components Developer Guide.

#### Custom Events

**`error`**

The event fired when the record edit form returns a server-side error.

Use the `event.detail` property to return the error.

Parameter|Type|Description
-----|-----|----------
message|string|General description of error.
detail|object|Description of error details, if any.
output|object|[Record exception errors](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_exception.htm#ui_api_responses_record_exception)  with `errors` and `fieldErrors` properties. For example, to return the error details when a required field is missing, use `event.detail.output.fieldErrors`.

To display your error messages in the form, we recommend using `lightning-messages` as shown in the examples. `lightning-messages` can be used without a custom `error` event handler.

 Include `lightning-messages` immediately before or after the `lightning-input-field` components to automatically display the string that's returned by `message`, and the  `detail` or `fieldErrors` message if it's available.

 The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`load`**

The event fired when the record edit form loads record data. 
If you load the fields dynamically, `load` is fired before the child elements of `lightning-record-edit-form` finish loading. Consider the [`connectedCallback()` lifecycle](docs/component-library/documentation/lwc/lwc.create_lifecycle_hooks_dom) hook to perform initialization tasks. Alternatively, to load values or set properties dynamically, use a [getter and setter](docs/component-library/documentation/lwc/lwc.js_props_getters_setters) instead.

`load` is fired when the form gets new data from Lightning Data Service, which can be once or multiple times after the component is initialized. For example, the `load` event is fired when:
* The `record-id` value changes
* The `fields` list changes
* The form includes picklist fields
* The record type changes

If you require the `load` event to be called only once, write code to prevent it from running more than once.

Use the `event.detail` property to return the [record UI](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_ui.htm), and [picklist values](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_values.htm) if you include picklist fields in the form.

 The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`submit`**

The event fired when the submit button is pressed. Client-side validation errors, if any, are displayed. The form is then submitted only when all fields in the form are valid.  The form can be submitted only after it's loaded.

The `submit` event returns the following parameters.

 Parameter|Type|Description
-----|-----|----------
fields|object|The editable fields that are provided for submission during a record create or edit. For example, if you include a `lightning-input-field` component with the `Name` field, `fields` returns `FirstName`, `LastName`, and `Salutation`. Read-only fields, such as the record ID, can't be changed in a form. If you include a read-only field in a form, it's not included in the `fields` object returned by the `onsubmit` event handler.

The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|true|This event bubbles up through the DOM.
cancelable|true|This event can be canceled. You can call `preventDefault()` on this event.
composed|true|This event propagates outside of the component in which it was dispatched.

**`success`**

The event fired when the record data is updated successfully. The `load` event then fires to return the updated data.

Use the `event.detail` property to return the saved record. For more information, see the [User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm).

The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|true|This event bubbles up through the DOM.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|true|This event propagates outside of the component in which it was dispatched.

#### Source Code

`lightning-record-edit-form` is available in the [Base Components Recipes GitHub repository](https://github.com/salesforce/base-components-recipes#documentation). It's transpiled into the `c` namespace so that you can use it in your own projects.

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning-record-edit-form`, see the following components in the LWC Recipes repo.
 * `c-record-edit-form-dynamic-contact`
 * `c-record-edit-form-static-contact`

#### See Also

[Work with Records Using Base Components](docs/component-library/documentation/lwc/lwc.data_get_user_input_intro)

[recordEditFormStaticContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordEditFormStaticContact) example in lwc-recipes repository

[recordEditFormDynamicContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordEditFormDynamicContact) example in lwc-recipes repository