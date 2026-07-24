"""Build the trophy-room statues as gold GLBs, headless.

Run:  /Applications/Blender.app/Contents/MacOS/Blender --background \
        --factory-startup --python scripts/build-statues.py

Each statue is a stylized athlete built from rounded capsule limbs (spheres at
the joints, cylinders between) on a small disc base — the 3D cousin of the
hand-drawn SVG statues in trophy-room-experience.tsx. Figures are ~2 units
tall, centered on the origin, standing on z=0 (the glTF exporter converts to
Y-up). Output: public/assets/statues/<name>.glb
"""

import math
import os
import sys

import bpy
from mathutils import Quaternion, Vector

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "statues")
LOGO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "trophies")

# Objects that must stay OUT of the gold join/remesh (they carry their own
# textured material). Reset per statue in main().
DECALS = []

LIMB_R = 0.055
HEAD_R = 0.135
TORSO_R = 0.085


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def gold_material():
    """Bright polished gold.

    Deliberately NOT fully metallic: a metalness-1 surface reflects only what's
    in the environment, so under the shelf's few direct lights it renders
    almost black. Semi-metallic + a bright base color keeps the diffuse
    response that makes the statues read as gold on a dark stage.
    """
    m = bpy.data.materials.new("TrophyGold")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.92, 0.63, 0.14, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.72
    bsdf.inputs["Roughness"].default_value = 0.29
    if "Emission Color" in bsdf.inputs:  # lifts the shadow side off black
        bsdf.inputs["Emission Color"].default_value = (0.40, 0.24, 0.05, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.07
    return m


def sphere(loc, r):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=16)
    return bpy.context.object


def cyl_between(a, b, r):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d.length, location=(a + b) / 2, vertices=24)
    obj = bpy.context.object
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = d.to_track_quat("Z", "Y")
    return obj


def limb(a, b, r=LIMB_R):
    cyl_between(a, b, r)
    sphere(a, r)
    sphere(b, r)


def disc(loc, r, depth, axis="Z"):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=40)
    obj = bpy.context.object
    if axis == "X":
        obj.rotation_euler = (0, math.radians(90), 0)
    elif axis == "Y":
        obj.rotation_euler = (math.radians(90), 0, 0)
    return obj


def ellipsoid(loc, scale, rot_euler=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=loc, segments=24, ring_count=16)
    obj = bpy.context.object
    obj.scale = scale
    obj.rotation_euler = rot_euler
    return obj


def base_disc():
    disc((0, 0, 0.035), 0.34, 0.07)


def body(hips, chest, head, shoulders, elbows, hands, knees, feet):
    """Shared trunk/limbs from a joint dict-of-points."""
    limb(hips, chest, TORSO_R)
    sphere(head, HEAD_R)
    limb(chest, ((chest[0] + head[0]) / 2, (chest[1] + head[1]) / 2, (chest[2] + head[2]) / 2), 0.05)
    for side in (0, 1):
        limb(shoulders[side], elbows[side])
        limb(elbows[side], hands[side])
        limb(hips, knees[side])
        limb(knees[side], feet[side])
    limb(shoulders[0], shoulders[1], 0.05)


# ---------------------------------------------------------------- poses ----

def build_basketball():
    base_disc()
    body(
        hips=(0, 0, 0.95),
        chest=(0.02, 0, 1.34),
        head=(0.02, 0.02, 1.62),
        shoulders=[(-0.16, 0, 1.42), (0.19, 0, 1.42)],
        elbows=[(-0.24, 0.06, 1.60), (0.31, 0.06, 1.58)],
        hands=[(-0.10, 0.12, 1.80), (0.15, 0.12, 1.83)],
        knees=[(-0.15, 0.06, 0.52), (0.17, -0.02, 0.48)],
        feet=[(-0.14, -0.04, 0.16), (0.19, -0.10, 0.12)],
    )
    sphere((0.03, 0.15, 1.97), 0.16)  # the ball, at the top of the shot


def build_golf():
    """Address stance, the moment before the takeaway: knees flexed, spine
    tilted forward from the hips, arms hanging to a shared grip, club head
    grounded at a teed ball."""
    base_disc()
    hands = (0.02, 0.26, 0.94)
    body(
        hips=(0, -0.05, 0.90),
        chest=(0, 0.11, 1.28),
        head=(0, 0.20, 1.52),  # forward of the chest: eyes down on the ball
        shoulders=[(-0.17, 0.11, 1.36), (0.17, 0.11, 1.36)],
        elbows=[(-0.15, 0.20, 1.14), (0.15, 0.20, 1.14)],
        hands=[hands, hands],
        knees=[(-0.17, 0.07, 0.48), (0.17, 0.07, 0.48)],
        feet=[(-0.19, -0.02, 0.07), (0.19, -0.02, 0.07)],
    )
    club_end = (0.07, 0.31, 0.05)
    cyl_between(hands, club_end, 0.018)
    ellipsoid(club_end, (0.07, 0.045, 0.035), (0, 0, math.radians(15)))
    sphere((0.16, 0.28, 0.095), 0.028)  # the ball, teed on the base


def build_lifting():
    base_disc()
    body(
        hips=(0, 0, 0.88),
        chest=(0, 0, 1.30),
        head=(0, 0.02, 1.58),
        shoulders=[(-0.19, 0, 1.38), (0.19, 0, 1.38)],
        elbows=[(-0.25, 0, 1.60), (0.25, 0, 1.60)],
        hands=[(-0.27, 0, 1.83), (0.27, 0, 1.83)],
        knees=[(-0.18, 0.05, 0.50), (0.18, 0.05, 0.50)],
        feet=[(-0.21, 0, 0.07), (0.21, 0, 0.07)],
    )
    disc((0, 0, 1.86), 0.028, 1.30, axis="X")  # bar
    for x in (-0.52, -0.45, 0.45, 0.52):
        disc((x, 0, 1.86), 0.15 if abs(x) > 0.5 else 0.11, 0.045, axis="X")


def build_football():
    base_disc()
    body(
        hips=(0, 0, 0.93),
        chest=(0, 0.05, 1.33),
        head=(0, 0.06, 1.61),
        shoulders=[(-0.18, 0.05, 1.41), (0.18, 0.05, 1.41)],
        elbows=[(-0.30, 0.24, 1.46), (0.34, -0.09, 1.56)],
        hands=[(-0.36, 0.44, 1.52), (0.30, -0.24, 1.76)],
        knees=[(-0.19, -0.02, 0.50), (0.17, 0.10, 0.48)],
        feet=[(-0.21, -0.06, 0.07), (0.18, 0.13, 0.07)],
    )
    ellipsoid((0.32, -0.30, 1.83), (0.085, 0.135, 0.085), (math.radians(35), 0, math.radians(-15)))


def build_baseball():
    base_disc()
    hands = (0.28, 0.24, 1.36)
    body(
        hips=(0, 0, 0.92),
        chest=(0.04, 0, 1.32),
        head=(0.05, 0.02, 1.60),
        shoulders=[(-0.14, 0.02, 1.40), (0.20, 0.02, 1.40)],
        elbows=[(0.02, 0.18, 1.34), (0.27, 0.10, 1.34)],
        hands=[hands, hands],
        knees=[(-0.16, 0, 0.48), (0.17, 0, 0.48)],
        feet=[(-0.19, 0, 0.07), (0.19, 0, 0.07)],
    )
    bat_end = (0.52, 0.60, 1.72)
    cyl_between(hands, bat_end, 0.034)
    sphere(bat_end, 0.042)


def build_mma():
    base_disc()
    body(
        hips=(0, 0, 0.93),
        chest=(0, 0.06, 1.33),
        head=(0, 0.10, 1.58),
        shoulders=[(-0.18, 0.04, 1.40), (0.17, 0.06, 1.40)],
        elbows=[(-0.24, 0.16, 1.42), (0.20, 0.30, 1.44)],
        hands=[(-0.10, 0.22, 1.50), (0.08, 0.52, 1.46)],
        knees=[(-0.17, -0.04, 0.50), (0.16, 0.12, 0.48)],
        feet=[(-0.20, -0.10, 0.07), (0.17, 0.16, 0.07)],
    )
    sphere((-0.10, 0.24, 1.51), 0.075)  # guard fist
    sphere((0.08, 0.55, 1.46), 0.08)   # punching fist


# ------------------------------------------------------- team crests ----
# Teams get a standing crest instead of an athlete: a shield on a short pillar,
# with a team-specific emblem raised off its face.


def shield(bottom_z, w, h, thickness=0.07):
    """A solid shield tapering to a point, standing with its tip at bottom_z.

    Built as one flat n-gon (outline traced down the right edge and mirrored)
    then thickened with a Solidify modifier — a single clean surface rather
    than stacked slabs.
    """
    top = bottom_z + h
    steps = 22
    right = []
    for i in range(steps + 1):
        t = i / steps  # 0 at the top edge, 1 at the tip
        x = (w / 2) * math.cos(t * math.pi / 2) ** 0.62
        right.append((x, top - t * h))
    outline = [(-x, z) for x, z in reversed(right[:-1])] + right

    verts = [(x, 0.0, z) for x, z in outline]
    mesh = bpy.data.meshes.new("shield")
    mesh.from_pydata(verts, [], [list(range(len(verts)))])
    mesh.update()
    obj = bpy.data.objects.new("shield", mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = 0
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)
    # A raised rim around the face reads as an engraved crest.
    for sign in (-1, 1):
        sphere((sign * w / 2 * 0.92, 0, top - 0.02), thickness * 0.62)


def logo_decal(png, center, size):
    """The team's real logo, mounted flat on the shield face.

    A textured quad rather than modeled geometry: the marks have fine interior
    detail (wordmarks, outlines) that no amount of extruded slabs would read as
    the actual logo. It's excluded from the gold remesh so it keeps its own
    material and UVs, and faces -Y, which the glTF Y-up conversion turns into
    +Z — i.e. toward the camera.
    """
    path = os.path.abspath(os.path.join(LOGO_DIR, png))
    bpy.ops.mesh.primitive_plane_add(size=1, location=center)
    obj = bpy.context.object
    obj.rotation_euler = (math.radians(90), 0, 0)
    obj.scale = (size, size, 1)

    mat = bpy.data.materials.new("TeamLogo")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    nt.links.new(bsdf.inputs["Base Color"], tex.outputs["Color"])
    nt.links.new(bsdf.inputs["Alpha"], tex.outputs["Alpha"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.45
    if "Emission Color" in bsdf.inputs:
        # The shelf is a dark stage and the logo isn't metal, so a little
        # self-illumination keeps it as legible as the gold around it.
        nt.links.new(bsdf.inputs["Emission Color"], tex.outputs["Color"])
        bsdf.inputs["Emission Strength"].default_value = 0.30
    # Cut out the transparent margin (these PNGs have hard edges, so a mask
    # beats real blending — no sort-order artifacts against the shield).
    for attr, value in (("blend_method", "CLIP"), ("surface_render_method", "DITHERED")):
        try:
            setattr(mat, attr, value)
        except (AttributeError, TypeError):
            pass
    obj.data.materials.append(mat)
    DECALS.append(obj)
    return obj


def pillar(top_z, r=0.11):
    disc((0, 0, top_z / 2), r, top_z)
    disc((0, 0, top_z + 0.02), r * 1.5, 0.05)


SHIELD_BOTTOM = 0.62
SHIELD_W = 0.78
SHIELD_H = 1.20
SHIELD_FACE = -0.055  # y of the shield's front face (emblems sit just proud)


def crest(png):
    """A shield on a pillar wearing the team's actual logo."""
    base_disc()
    pillar(SHIELD_BOTTOM)
    shield(SHIELD_BOTTOM, SHIELD_W, SHIELD_H)
    # Centered on the shield's upper body, just proud of its front face.
    logo_decal(png, (0, SHIELD_FACE - 0.005, 1.34), 0.56)


def build_crest_thunder():
    crest("thunder.png")


def build_crest_padres():
    crest("padres.png")


STATUES = {
    "basketball": build_basketball,
    "golf": build_golf,
    "lifting": build_lifting,
    "football": build_football,
    "baseball": build_baseball,
    "mma": build_mma,
    "crest-thunder": build_crest_thunder,
    "crest-padres": build_crest_padres,
}


def export(name):
    # Join the gold body into one smooth-shaded mesh. Decals stay separate:
    # the remesh below would destroy their UVs and the join would flatten them
    # into the gold material.
    for o in bpy.context.scene.objects:
        o.select_set(False)
    meshes = [
        o for o in bpy.context.scene.objects if o.type == "MESH" and o not in DECALS
    ]
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name

    # The join alone leaves a pile of intersecting primitives, and each keeps
    # its own normals — so the figure shades per-part, with visible seams at
    # every sphere/cylinder joint. A voxel remesh unions them into one
    # continuous surface (like a single cast), which is what lets smooth
    # shading read as one statue. Voxel size must stay below the thinnest
    # feature (club shaft r=0.018, stitch beads r=0.0135).
    remesh = obj.modifiers.new("Remesh", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = 0.012
    bpy.ops.object.modifier_apply(modifier=remesh.name)

    # Remesh output is dense; decimate keeps the GLBs web-sized.
    target = 48000
    npoly = len(obj.data.polygons)
    if npoly > target:
        dec = obj.modifiers.new("Decimate", "DECIMATE")
        dec.ratio = target / npoly
        bpy.ops.object.modifier_apply(modifier=dec.name)

    bpy.ops.object.shade_smooth()
    mat = gold_material()
    obj.data.materials.append(mat)

    path = os.path.abspath(os.path.join(OUT_DIR, f"{name}.glb"))
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB")
    print(f"exported {path}")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, build in STATUES.items():
        reset_scene()
        DECALS.clear()
        build()
        export(name)


main()
