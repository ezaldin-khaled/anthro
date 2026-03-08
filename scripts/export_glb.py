"""
Export Blender scene to GLB for the web hero.
Run from project root (anthro/) with Blender:

  blender "Assets/untitled.blend k.blend" --background --python scripts/export_glb.py

Requires Blender 3.x+ with glTF 2.0 support (built-in).
Output: public/assets/hero-model.glb
"""

import bpy
import os

# Project root = parent of 'scripts'
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
out_path = os.path.join(project_root, "public", "assets", "hero-model.glb")

os.makedirs(os.path.dirname(out_path), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_lights=True,
    export_cameras=False,
)

print(f"Exported: {out_path}")
