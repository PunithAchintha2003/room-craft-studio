# 3D Model Workflow Guide

## Blender to Web Pipeline for RoomCraft Studio

This guide covers the complete workflow for acquiring, optimizing, and integrating 3D furniture models into the RoomCraft Studio designer application.

---

## Table of Contents

1. [Model Acquisition](#model-acquisition)
2. [Blender Optimization](#blender-optimization)
3. [Export Settings](#export-settings)
4. [Upload to Supabase](#upload-to-supabase)
5. [Database Integration](#database-integration)
6. [Testing & Validation](#testing--validation)
7. [Troubleshooting](#troubleshooting)

---

## Model Acquisition

### Recommended Sources

#### Free Resources
- **Poly Haven** (polyhaven.com) - CC0 license, high quality
- **Sketchfab** (sketchfab.com) - Filter by "Downloadable" and "CC0/CC-BY"
- **CGTrader Free** (cgtrader.com/free-3d-models) - Various licenses
- **TurboSquid Free** (turbosquid.com/Search/3D-Models/free) - Mixed quality
- **Free3D** (free3d.com) - Community uploads

#### Target Categories & Quantities

**Chairs (4-6 models):**
- Modern dining chair
- Office chair (with wheels)
- Armchair/lounge chair
- Bar stool
- Accent chair
- Rocking chair (optional)

**Tables (5-7 models):**
- Rectangular dining table (6-seater)
- Round dining table
- Coffee table (rectangular)
- Coffee table (round)
- Side table/nightstand
- Desk
- Console table

**Sofas (4-5 models):**
- 2-seater sofa
- 3-seater sofa
- L-shaped sectional
- Loveseat
- Chaise lounge (optional)

**Beds (3-4 models):**
- Single bed
- Queen bed
- King bed
- Bunk bed (optional)

**Storage (4-6 models):**
- Bookshelf (tall)
- Cabinet (with doors)
- Drawer unit/dresser
- Wardrobe
- TV stand
- Sideboard (optional)

### Selection Criteria

✅ **Good Models:**
- Poly count: 5,000-50,000 triangles
- Clean, quad-based topology
- Properly UV-unwrapped
- Includes materials/textures
- Realistic proportions
- Single object or organized hierarchy

❌ **Avoid:**
- Models with millions of polygons
- Non-manifold geometry
- Missing UVs
- Excessive texture resolution (>4K)
- Models with complex physics simulations
- Multiple disconnected pieces

---

## Blender Optimization

### Step 1: Import & Initial Setup

1. **Open Blender** (version 3.6+ recommended)
2. **Delete default objects** (camera, light, cube)
3. **Import your model:**
   - File → Import → FBX/OBJ/GLTF
   - If textures don't load, manually load them in Shading workspace

### Step 2: Geometry Cleanup

#### Center Origin to Base
```
1. Select object (click on it)
2. Tab → Edit Mode
3. A → Select All
4. Shift+S → Cursor to Selected
5. Tab → Object Mode
6. Right-click object → Set Origin → Origin to 3D Cursor
7. Move cursor to Z=0: Shift+S → Cursor to World Origin
8. In Edit Mode: Select bottom vertices, Shift+S → Selection to Cursor
9. Tab → Object Mode
```

**Why this matters:** Ensures furniture sits correctly on the floor in Three.js.

#### Apply Transforms
```
1. Select object
2. Ctrl+A → Apply → All Transforms
```

**Why:** Baked transforms prevent scaling issues in web viewer.

#### Remove Unnecessary Elements
```
1. Tab → Edit Mode
2. Delete internal faces (faces you can't see inside furniture)
3. Delete duplicate vertices: A → M → By Distance
4. Remove cameras, lights, empties from outliner
```

### Step 3: Polygon Reduction

**Check current poly count:**
- Top right → Overlay menu → Statistics → Faces

**If over 50,000 triangles:**
```
1. Add Modifier → Decimate
2. Type: Collapse
3. Ratio: Start at 0.5, adjust until poly count is acceptable
4. Preview result, ensure detail is preserved
5. Apply modifier (⌘/Ctrl + A)
```

**Target poly counts by category:**
- Simple items (side tables, stools): 2,000-5,000
- Medium complexity (chairs, small tables): 5,000-15,000
- Large items (sofas, beds): 15,000-30,000
- Complex storage (bookshelves with details): 20,000-50,000

### Step 4: Material Setup

#### Switch to Shading Workspace
```
1. Top menu → Shading
2. Bottom panel shows node editor
3. Top viewport shows rendered preview (Z → Material Preview)
```

#### Ensure Principled BSDF
```
1. For each material:
   - Use Principled BSDF shader (industry standard)
   - Connect Image Texture → Base Color
   - If has roughness map: Image Texture → Roughness
   - If has normal map: Normal Map node → Normal
   - If metallic: Image Texture → Metallic
```

#### Optimize Textures
```
1. Select all texture nodes
2. Check image resolution (Image Editor panel)
3. If >2048x2048:
   - Image → Resize → 2048x2048 or 1024x1024
   - Image → Pack (embeds in .blend file)
```

#### Set Material Properties
```
Principled BSDF Settings for Common Materials:

Wood:
- Base Color: Wood texture or #8B7355
- Roughness: 0.4-0.6
- Metallic: 0.0

Fabric/Upholstery:
- Base Color: Fabric texture or solid color
- Roughness: 0.7-0.9
- Metallic: 0.0

Metal:
- Base Color: #CCCCCC or metal texture
- Roughness: 0.2-0.4
- Metallic: 0.8-1.0

Leather:
- Base Color: #4A4A4A
- Roughness: 0.3-0.5
- Metallic: 0.0
```

### Step 5: Scaling to Real-World Dimensions

#### Check Current Size
```
1. Tab → Edit Mode
2. N → Transform panel → Dimensions
3. Note current dimensions in meters
```

#### Scale to Real Dimensions

**Common furniture dimensions (Width × Depth × Height):**

Chairs:
- Dining chair: 0.5m × 0.5m × 1.0m
- Office chair: 0.6m × 0.6m × 1.2m
- Armchair: 0.8m × 0.9m × 0.9m
- Bar stool: 0.4m × 0.4m × 1.1m

Tables:
- Dining table (6-seat): 1.8m × 0.9m × 0.75m
- Coffee table: 1.2m × 0.7m × 0.45m
- Side table: 0.5m × 0.5m × 0.6m
- Desk: 1.5m × 0.75m × 0.75m

Sofas:
- 2-seater: 1.5m × 0.85m × 0.85m
- 3-seater: 2.2m × 0.9m × 0.85m
- L-shaped: 2.5m × 2.5m × 0.85m

Beds:
- Single: 1.0m × 2.0m × 0.5m
- Queen: 1.6m × 2.0m × 0.5m
- King: 2.0m × 2.0m × 0.5m

Storage:
- Bookshelf: 1.2m × 0.4m × 2.0m
- Wardrobe: 1.5m × 0.6m × 2.0m
- Dresser: 1.2m × 0.5m × 1.0m

**To scale:**
```
1. Tab → Object Mode
2. S → type scale factor → Enter
   OR
3. N → Transform → Scale → set X, Y, Z to achieve target dimensions
4. Ctrl+A → Apply → Scale (important!)
```

#### Verify Dimensions
```
1. Tab → Edit Mode
2. N → Transform → Dimensions
3. Confirm matches target (e.g., dining chair: W=0.5, D=0.5, H=1.0)
```

### Step 6: Final Checks

#### Fix Normals
```
1. Tab → Edit Mode
2. A → Select All
3. Shift+N → Recalculate Outside
```

#### Check for Errors
```
1. Edit Mode → Select → Select All by Trait:
   - Non-Manifold Geometry (should be none)
   - Loose Geometry (delete if found)
```

#### Name Objects Clearly
```
1. Outliner panel (top right)
2. Double-click object name
3. Use format: Category_Name (e.g., chair_modern_dining)
```

---

## Export Settings

### GLB Export Configuration

```
1. File → Export → glTF 2.0 (.glb / .gltf)

2. INCLUDE Section:
   ☑ Selected Objects (if multiple objects, select all first)
   ☑ Custom Properties
   ☑ Cameras (uncheck, not needed)
   ☑ Punctual Lights (uncheck, we use Three.js lights)

3. TRANSFORM Section:
   • +Y Up (default)
   • Forward: -Z Forward (default)

4. GEOMETRY Section:
   ☑ Apply Modifiers
   ☑ UVs
   ☑ Normals
   ☑ Tangents (for normal maps)
   ☑ Vertex Colors (if present)
   ☐ Loose Edges (uncheck)
   ☐ Loose Points (uncheck)

5. MATERIALS Section:
   • Materials: Export (default)

6. ANIMATION Section:
   ☐ Animation (uncheck, static furniture)

7. COMPRESSION Section:
   • Compress: Draco (if file >2MB, otherwise None)
   • Compression level: 6 (balanced)

8. Save as: category_name.glb
   Example: chair_modern_dining.glb
```

### File Size Guidelines

- **Target:** <2MB per model
- **Maximum:** 5MB per model
- **If over limit:**
  - Increase Draco compression (level 8-10)
  - Further reduce poly count
  - Reduce texture resolution to 1024x1024

---

## Upload to Supabase

### Access Supabase Storage

1. **Log into Supabase Dashboard**
   - URL: https://app.supabase.com
   - Project: RoomCraft Studio

2. **Navigate to Storage**
   - Left sidebar → Storage
   - Select bucket: `models`

### Upload GLB Files

```
1. Click "Upload file"
2. Select your exported .glb file
3. Ensure public access is enabled
4. Note the public URL format:
   https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/[filename].glb
```

### Naming Convention

Use descriptive, lowercase names with underscores:
```
✅ Good:
   chair_modern_dining.glb
   sofa_three_seater_grey.glb
   table_coffee_round.glb

❌ Bad:
   model1.glb
   Chair.glb
   3-seater sofa.glb (spaces)
```

### Test in glTF Viewer

Before adding to database:
```
1. Visit: https://gltf-viewer.donmccurdy.com/
2. Drag & drop your .glb file
3. Verify:
   - Model loads without errors
   - Textures display correctly
   - Scale looks appropriate
   - No missing materials
```

---

## Database Integration

### Update Seed Data

Edit `server/src/scripts/seedFurniture.ts`:

```typescript
{
  name: 'Modern Dining Chair',
  category: 'chair',
  dimensions: { 
    width: 0.5,   // in meters
    length: 0.5, 
    height: 1.0 
  },
  thumbnail: 'https://images.unsplash.com/photo-[...]/chair.jpg?w=400&h=300&fit=crop',
  thumbnailAlt: 'Modern Dining Chair',
  images: [
    'https://images.unsplash.com/photo-[...]/chair-1.jpg',
    'https://images.unsplash.com/photo-[...]/chair-2.jpg'
  ],
  description: 'Elegant modern dining chair with ergonomic design and sturdy construction.',
  specifications: new Map([
    ['Material', 'Solid oak with fabric upholstery'],
    ['Weight Capacity', '120kg'],
    ['Assembly', 'Required'],
    ['Care', 'Wipe clean with damp cloth']
  ]),
  model3D: {
    url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair_modern_dining.glb',
    format: 'glb' as const,
  },
  defaultColor: '#8B4513', // Saddle Brown
  isColorizable: true,
  price: 149.99,
  stock: 50,
  tags: ['modern', 'dining', 'wood', 'comfortable'],
  featured: false,
  averageRating: 0,
  reviewCount: 0
}
```

### Run Seed Script

```bash
cd server
npm run seed:furniture
```

Expected output:
```
🗑️  Clearing existing furniture...
🌱 Seeding furniture data...
✅ Successfully seeded 20 furniture items:
   - Modern Dining Chair (chair) - $149.99
   - Office Chair (chair) - $299.99
   [...]
```

---

## Testing & Validation

### In-App Testing

1. **Start the designer app:**
   ```bash
   cd designer
   npm run dev
   ```

2. **Navigate to editor:** http://localhost:3002/editor

3. **Open furniture library panel**

4. **Verify new models:**
   - Thumbnails load correctly
   - Category filter shows items
   - Clicking adds to design

5. **Test 2D view:**
   - Furniture appears with correct dimensions
   - Can drag, rotate, scale

6. **Test 3D preview:**
   - Click "3D Preview" button
   - Model loads without errors
   - Textures display correctly
   - No console errors
   - Performance is smooth (60fps)

### Performance Benchmarks

**Acceptable:**
- Model load time: <2 seconds
- FPS with 20 models: >55fps
- Memory increase per model: <50MB

**If performance issues:**
- Reduce poly count further
- Compress textures more
- Simplify materials

### Browser DevTools Check

```
1. Open DevTools (F12)
2. Network tab → Filter: "glb"
3. Refresh page, add furniture
4. Check:
   - File size (<5MB per model)
   - Load time (<2s)
   - HTTP 200 status
5. Performance tab → Record
6. Add 10-15 furniture items
7. Check FPS (should stay 55-60)
```

---

## Troubleshooting

### Model Not Loading

**Symptom:** 3D preview shows placeholder box

**Solutions:**
1. Check browser console for CORS errors
2. Verify Supabase URL is correct and public
3. Test URL directly in browser (should download GLB)
4. Ensure file extension is `.glb` not `.gltf`
5. Check GLB file isn't corrupted (re-export from Blender)

### Textures Missing

**Symptom:** Model is all gray/white

**Solutions:**
1. In Blender: File → External Data → Pack Resources
2. Re-export GLB with Materials: Export checked
3. Verify texture nodes are connected to Principled BSDF
4. Check texture paths in Blender (Image Editor)

### Model Too Large/Small

**Symptom:** Furniture appears giant or tiny in scene

**Solutions:**
1. In Blender, check dimensions (N → Transform)
2. Scale to real-world meters
3. Apply scale (Ctrl+A → Apply → Scale)
4. Re-export GLB
5. Update dimensions in seedFurniture.ts

### Model Upside Down

**Symptom:** Furniture appears inverted

**Solutions:**
1. In Blender: Rotate 180° on X-axis (R, X, 180, Enter)
2. Apply rotation (Ctrl+A → Apply → Rotation)
3. Re-export with +Y Up setting

### Poor Performance

**Symptom:** FPS drops below 30 with many models

**Solutions:**
1. Reduce poly count (target <30k per model)
2. Enable Draco compression in export
3. Reduce texture resolution to 1024x1024
4. Simplify materials (remove complex nodes)
5. Consider LOD (Level of Detail) system

### Shadow Artifacts

**Symptom:** Strange shadow shapes or z-fighting

**Solutions:**
1. In Blender: Recalculate normals (Shift+N)
2. Ensure no overlapping faces
3. Merge duplicate vertices (M → By Distance)
4. Fix non-manifold geometry

---

## Best Practices Summary

### ✅ Do's
- Always apply transforms before export
- Center origin to object base
- Use Principled BSDF for materials
- Keep poly count under 50k
- Test in glTF viewer before upload
- Use descriptive file names
- Document dimensions in seed data
- Version control GLB files (Git LFS)

### ❌ Don'ts
- Don't export with animations
- Don't include cameras/lights
- Don't use textures over 2048x2048
- Don't forget to pack textures
- Don't skip normal recalculation
- Don't use spaces in filenames
- Don't upload without testing

---

## Reference Links

- **Blender Manual:** https://docs.blender.org/manual/en/latest/
- **glTF Specification:** https://www.khronos.org/gltf/
- **Three.js GLTFLoader:** https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- **Draco Compression:** https://google.github.io/draco/
- **glTF Viewer:** https://gltf-viewer.donmccurdy.com/

---

## Appendix: Blender Keyboard Shortcuts

### Essential Shortcuts
- **Tab:** Toggle Edit/Object Mode
- **S:** Scale
- **R:** Rotate
- **G:** Move (Grab)
- **A:** Select All / Deselect All
- **X:** Delete
- **Ctrl+A:** Apply (transforms, modifiers)
- **Shift+D:** Duplicate
- **Shift+S:** Snap menu
- **N:** Properties panel
- **Z:** Viewport shading menu

### Edit Mode
- **Ctrl+R:** Loop cut
- **E:** Extrude
- **M:** Merge vertices
- **Shift+N:** Recalculate normals
- **Alt+Click:** Select edge loop

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Author:** RoomCraft Studio Team
