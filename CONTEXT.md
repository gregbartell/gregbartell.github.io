# Washington License Plate Collection

This context describes the catalog language for the Washington license plate
collection site.

## Language

**Plate Catalog**:
The authoritative set of plate entries in the collection. It defines the
current facts used to present plates and collection status.
_Avoid_: Checklist, inventory, plate list

**Category**:
A named group of related plate entries presented together in the catalog.
_Avoid_: Section, group, plate type

**Catalog Order**:
The presentation order for the catalog: categories are alphabetical except
Miscellaneous, which appears last; plates are alphabetical within each category.
_Avoid_: Sort order, display order, list order

**Photo Status**:
The current catalog state of a plate's selected photo: current, missing, or
needs-upgrade.
_Avoid_: Image status, asset state, photo quality

**Variant**:
A distinct plate design that the site intentionally presents as part of the
collection.
_Avoid_: Design, version, plate type

**Selected Asset**:
The image file chosen to represent a plate entry, written relative to the
collection image root.
_Avoid_: Primary image, featured image, catalog image

**Image Kind**:
Whether the selected asset represents a plate or an emblem. Image alt text is
derived from the plate title and this kind.
_Avoid_: Asset type, image type, media type
