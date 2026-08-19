# Steam Grid Maker — Border + Undo/Redo Edition

Added to the previous fixed version:

- Customizable **static background border** drawn inside the canvas, so the exported size never changes.
- Border styles: **solid, double, dashed, dotted**.
- Border color and optional second color.
- Optional two-color gradient and gradient angle.
- Border width, inset, opacity and corner radius.
- Separate glow enable, color, blur and opacity controls.
- Dash length, gap and double-line gap controls.
- **Undo / Redo** buttons with up to 50 history states.
- Ctrl/Cmd+Z for undo and Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y for redo on desktop.
- Touch/mouse image dragging is grouped into a single undo action.
- Slider edits are grouped so undo does not create hundreds of tiny steps.

Previous fixes remain:

- Contain preserves original image aspect ratio.
- Image neon border and shadow follow the actual rendered image dimensions.
- Android/mobile touch uses Pointer Events.
- Tapping/clicking empty canvas deselects.
- Export hides the editor selection outline.
- Everything remains local in the browser.
