---
examples:
 - name: basic
   label: Pill Container
   description: A pill container showing pills that represent users.
---
A `lightning-pill-container` component represents a list of pills in a container
that resembles an input field. Use `lightning-pill-container`to display a user's
selection when filtering a list, such as from a multi-select picklist.

This component displays a pill using `lightning-pill`, which can contain an icon or avatar next to the text label.

This example creates three pills: a text-only pill, a pill with an avatar, and
a pill with an icon.

```html
<template>
    <lightning-pill-container
        items={items}>
    </lightning-pill-container>
</template>
```

```javascript
import { LightningElement } from 'lwc';
export default class PillContainerExample extends LightningElement {
    items = [
        {
            label: 'My Pill',
            name: 'mypill'
        },
        {
            type: 'avatar',
            label: 'Avatar Pill',
            name: 'avatarpill',
            src: '/my/path/avatar.jpg',
            fallbackIconName: 'standard:user',
            variant: 'circle',
            alternativeText: 'User avatar',
        },
        {
            type: 'icon',
            label: 'Icon Pill',
            name: 'iconpill',
            iconName: 'standard:account',
            alternativeText: 'Account',
        },
    ];
}
```

A text-only pill supports the following attributes. These attributes can also
be used to create a pill with an avatar or icon.

  * `label`: Required. The text label that displays in the pill.
  * `name`: The name for the pill. This value is optional and can be used to identify the pill in a callback.

To create a pill with an avatar, use the following attributes.

  * `type`: The media type. Use `avatar`.
  * `src`: Required. The URL of the avatar.
  * `fallbackIconName`: The Lightning Design System name of the icon used as a fallback when the image fails to load. The initials fallback relies on this for its background color. Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed. Only icons from the standard and custom categories are allowed.
  * `variant`: Changes the shape of the avatar. Valid values are empty, circle, and square. This value defaults to square.
  * `alternativeText`: The alternative text used to describe the avatar, which is displayed as hover text on the image.

To create a pill with an icon, use the following attributes.

  * `type`: The media type. Use `icon`.
  * `iconName`: Required. The Lightning Design System name of the icon. Names are written in the format '\utility:down\' where 'utility' is the category, and 'down' is the specific icon to be displayed. Only utility icons can be used in this component.
  * `alternativeText`: The alternative text used to describe the icon. This text should describe what happens when you click the button, for example 'Upload File', not what the icon looks like, 'Paperclip'.

`lightning-pill-container` provides two variants: `bare` and `standard` (default). They are visually the same. However, the `standard` variant renders pills in an unordered list element. For more information, see the **Accessibility** section.

#### Removing Pills

Clicking the remove button triggers the `onitemremove` handler.

```html
<template>
    <lightning-pill-container
            items={items}
            onitemremove={handleItemRemove}>
    </lightning-pill-container>
</template>
```

You can retrieve the name of the pill that's clicked in the event handler and
remove the pill from view.

```javascript
import { LightningElement, track } from 'lwc';

export default class PillContainerRemoveExample extends LightningElement {

    @track items = [
        {
            label: 'My Pill',
            name: 'mypill'
        },
        {
            type: 'avatar',
            label: 'Avatar Pill',
            name: 'avatarpill',
            src: '/my/path/avatar.jpg',
            fallbackIconName: 'standard:user',
            variant: 'circle',
            alternativeText: 'User avatar',
        },
        {
            type: 'icon',
            label: 'Icon Pill',
            name: 'iconpill',
            iconName: 'standard:account',
            alternativeText: 'Account',
        },
    ];
    handleItemRemove (event) {
            const name = event.detail.item.name;
            alert(name + ' pill was removed!');
            const index = event.detail.index;
            this.items.splice(index, 1);
        }
}
```

#### Component Styling

`lightning-pill-container` implements the 
[pills with container](https://lightningdesignsystem.com/components/pills/#Pill-with-Container) blueprint in the
Salesforce Lightning Design System (SLDS).

To apply additional styling, use the SLDS [utility classes](https://www.lightningdesignsystem.com/utilities/alignment)  with the `class` attribute.

To apply custom styling, use the `:host` selector or define a custom class using the `class` attribute. Use SLDS styling hooks to customize the component's styles. 

`lightning-pill-container` renders pills using `lightning-pill`. Use the    `--sds-c-pill-*` custom properties on `lightning-pill`.

Custom properties for pill containers work only with particular `lightning-pill-container` variants for the remove button.

CSS Custom Property | `lightning-pill-container` Variants
--------------------|------------------------------------
`--sds-c-icon-color-background` | `standard` (default)
`--sds-c-icon-color-foreground-default` | `standard` (default)
`--sds-c-button-color-background` | `bare`
`--sds-c-button-color-border` | `bare`
`--sds-c-button-radius-border` | `bare`
`--sds-c-button-sizing-border` | `bare`

See [Styling Hooks Overview](https://www.lightningdesignsystem.com/components/pills/#Styling-Hooks-Overview) for a list of CSS custom properties.

 For more information, see [Style Components Using Lightning Design System Styling Hooks](docs/component-library/documentation/lwc/lwc.create_components_css_custom_properties) in the Lightning Web Components Developer Guide.

To understand how we implemented SLDS in `lightning-pill-container`, see the **Source Code** section.

#### Accessibility

 By default, `lightning-pill-container` renders pills using the `standard` variant, which uses an unordered list element to display pills. Press the Tab key to focus on the first pill and use the Left Arrow and Right Arrow keys to navigate through the pills. Tabbing and navigating with arrow keys puts focus only on the pill borders, not on the remove buttons.

The `bare` variant provides a focusable remove button. Tab to focus on the pill and tab again to focus on the remove button.

On mobile devices, both variants display the close button as a focusable element for accessibility.

 To remove a pill, press the Delete or Backspace key when the pill receives focus. On mobile devices, you can tap the remove button to remove a pill.


#### Custom Events

**`itemremove`**

The event fired when a pill is removed.

The `itemremove` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
item|string|The name of the pill that's removed.
index|number|The position of the pill in the array.

The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|true|This event can be canceled. You can call `preventDefault()` on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.


#### Source Code

`lightning-pill-container` is available in the [Base Components Recipes GitHub repository](https://github.com/salesforce/base-components-recipes#documentation). It's transpiled into the `c` namespace so that you can use it in your own projects.