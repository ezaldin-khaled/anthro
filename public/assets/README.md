# Hero 3D model

The hero uses **`hero-model.glb`** from your Blender file `Assets/untitled.blend k.blend`.

## One-time export (requires Blender)

From the **project root** (`anthro/`), run:

```bash
blender "Assets/untitled.blend k.blend" --background --python scripts/export_glb.py
```

This writes **`public/assets/hero-model.glb`**. The app loads it at `/assets/hero-model.glb`. If the file is missing or the export fails, the hero falls back to a reflective sphere.

## Manual export

1. Open `Assets/untitled.blend k.blend` in Blender.
2. **File → Export → glTF 2.0 (.glb)**
3. Save as **`hero-model.glb`** in this folder (`public/assets/`).
