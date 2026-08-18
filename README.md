# Steam Grid Maker — Fixed

This version fixes:
- Contain mode keeps the original image aspect ratio.
- Neon border follows the actual rendered image dimensions instead of the square grid cell.
- Shadow follows the rendered image rather than being forced to the grid cell.
- Selection outline follows the actual rendered image.
- Android/mobile touch uses Pointer Events.
- Tapping/clicking empty canvas deselects the current image.
- Added an Unselect button.
- Export temporarily hides the selection outline, so it can never appear in exported PNGs.
- Desktop mouse dragging and wheel scaling remain supported.

Open `index.html` in a browser or deploy the folder to GitHub Pages.
