---
examples:
 - name: basic
   label: Basic Accordion Section
   description: Content for an accordion is an accordion-section.
---

A `lightning-accordion-section` defines the content of an accordion section inside a `lightning-accordion` component.
Each section can contain HTML markup or Lightning components.

This component inherits styling from
[accordion](https://www.lightningdesignsystem.com/components/accordion) in the
Lightning Design System.

To additionally style this component, use Lightning Design System classes in
[Utilities](https://www.lightningdesignsystem.com/utilities/alignment).

This example creates a basic accordion with three sections, where section B is
expanded by specifying it with the `active-section-name` attribute in `lightning-accordion`.

```html
<template>
   <lightning-accordion active-section-name="B">
     <lightning-accordion-section name="A" label="Accordion Title A">This is the content area for section A</lightning-accordion-section>
     <lightning-accordion-section name="B" label="Accordion Title B">This is the content area for section B</lightning-accordion-section>
     <lightning-accordion-section name="C" label="Accordion Title C">This is the content area for section C</lightning-accordion-section>
   </lightning-accordion>
</template>
```

#### Adding an Action to a Section

This example creates the same basic accordion with an added `lightning-button-menu` on
the first section. The button menu is assigned to the `actions` slot which makes it display on the section header.

```html
<template>
   <lightning-accordion active-section-name="B">
     <lightning-accordion-section name="A" label="Accordion Title A">
        <lightning-button-menu slot="actions" alternative-text="Show menu" menu-alignment="right" >
                <lightning-menu-item value="New" label="Menu Item One"></lightning-menu-item>
                <lightning-menu-item value="Edit" label="Menu Item Two"></lightning-menu-item>
        </lightning-button-menu>
        <p>This is the content area for section A.</p>
     </lightning-accordion-section>
     <lightning-accordion-section name="B" label="Accordion Title B">This is the content area for section B</lightning-accordion-section>
     <lightning-accordion-section name="C" label="Accordion Title C">This is the content area for section C</lightning-accordion-section>
   </lightning-accordion>
</template>
```

#### Usage Considerations

If two or more sections use the same name and that name is also specified as
the `active-section-name`, the first section using that name is expanded by default.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](docs/component-library/documentation/lwc/lwc.migrate_map_aura_lwc_components) in the Lightning Web Components Developer Guide.

#### Source Code

`lightning-accordion-section` is available in the [Base Components Recipes GitHub repository](https://github.com/salesforce/base-components-recipes#documentation). It's transpiled into the `c` namespace so that you can use it in your own projects.