# Image and Media Rules

## Image Ownership

Images belong to the fragrance or commercial catalog entity, not to physical bottle inventory.

Bottle records do not require images.

## Upload Workflow

- Admin uploads one or more images.
- Images are displayed in their saved order.
- The first image is automatically used as the hero or primary image.
- Uploading later images does not change the hero unless the images are reordered.
- Drag-and-drop reordering is supported.
- Removing the first image makes the next image the hero.

## Data Model

A simple image record is sufficient:

```ts
interface FragranceImage {
  id: string;
  fragranceId: string;
  url: string;
  position: number;
  alt?: string;
}
```

A separate `isPrimary` field is not required because position determines the hero.

## Customer Gallery

- The first image appears as the hero.
- Remaining images appear in the gallery.
- Yet Another React Lightbox provides fullscreen viewing.

## Simplification

The system does not require:

- Image type classification
- Inventory photos
- Photo-source fields
- Separate hero selection controls
