# Steam Grid Maker — Animated Border + GIF

This version includes the previous fixes plus:

- Animated background border drawn **inside** the canvas edge, so canvas dimensions never change.
- Animated neon border with moving dash/glow.
- Animated snow-border mode using the supplied snow reference as an internal overlay.
- Neon + snow combined mode.
- Export GIF button.
- GIF loops forever.
- GIF export hides the editor selection outline.
- GIF settings for FPS, duration and output scale.
- Default GIF settings are intentionally mobile-friendly to reduce memory use and file size.
- PNG export is still available.

The GIF encoder is loaded from jsDelivr using gif.js. gif.js is a browser-side GIF encoder that supports web workers and looping GIF output.
