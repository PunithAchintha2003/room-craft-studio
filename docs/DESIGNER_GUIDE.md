# RoomCraft Studio Designer Guide

## Complete User Manual for Furniture Design Professionals

Welcome to RoomCraft Studio Designer - your professional tool for creating stunning furniture visualizations for customers. This guide will help you master every feature to deliver exceptional in-store consultation experiences.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating a New Design](#creating-a-new-design)
4. [2D Editor](#2d-editor)
5. [3D Preview & Editing](#3d-preview--editing)
6. [Furniture Library](#furniture-library)
7. [Room Configuration](#room-configuration)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Designer Application

1. **URL:** http://localhost:3002 (local development)
2. **Login:** Use your designer credentials
3. **Dashboard:** View your design statistics and recent projects

### First Time Setup

When you first log in, you'll see:
- **Dashboard:** Overview of your designs and furniture catalog
- **Quick Actions:** Create New Design, Browse Designs
- **Recent Designs:** Your last 5 projects

---

## Interface Overview

### Main Layout

The designer interface consists of four main areas:

```
┌────────────────────────────────────────────────────────────┐
│ Top Toolbar: Save, Undo/Redo, Zoom, Grid, 3D Preview, Help │
├────────────┬─────────────────────────┬──────────────────────┤
│            │                         │                      │
│   Room     │                         │    Furniture         │
│   Config   │     2D Canvas          │    Library           │
│            │     (Center)            │                      │
│            │                         │──────────────────────│
│            │                         │    Properties        │
│            │                         │    Panel             │
└────────────┴─────────────────────────┴──────────────────────┘
```

### Top Toolbar

- **Back Button:** Return to dashboard (warns if unsaved changes)
- **Design Name:** Current design title
- **Undo (⌘Z):** Reverse last action
- **Redo (⌘⇧Z):** Reapply undone action
- **Zoom In/Out:** Scale canvas view
- **Grid Toggle:** Show/hide alignment grid
- **3D Preview:** Open immersive 3D viewer
- **Save (⌘S):** Save current design
- **Help (?):** Keyboard shortcuts reference

---

## Creating a New Design

### Method 1: From Dashboard

1. Click "Create New Design" card
2. Enter room specifications
3. Start designing

### Method 2: From Designs List

1. Navigate to "Designs" page
2. Click "New Design" button
3. Configure room and begin

### Initial Room Setup

When creating a design, you'll set:
- **Room Name:** Descriptive title (e.g., "Johnson Living Room")
- **Dimensions:** Width, Length, Height in meters
- **Wall Color:** Click color picker or enter hex code
- **Floor Color:** Choose flooring appearance

**Recommended Room Sizes:**
- Living Room: 5m × 5m × 3m
- Bedroom: 4m × 4m × 3m
- Dining Room: 4m × 3.5m × 3m
- Office: 3m × 3m × 3m

---

## 2D Editor

### Canvas Overview

The 2D editor provides a top-down view of your room with:
- **Grid Lines:** 0.5m spacing for precise placement
- **Room Boundary:** Outlined in wall color
- **Furniture Items:** Shown with actual dimensions and thumbnails

### Adding Furniture

**Method 1: Click to Add**
1. Browse furniture library (right panel)
2. Click desired furniture
3. Item appears at room center
4. Drag to position

**Method 2: Drag and Drop**
1. Click and hold furniture in library
2. Drag onto canvas
3. Release at desired position

### Manipulating Furniture

#### Moving
- **Click and Drag:** Move furniture freely
- **With Grid Snap:** Aligns to 0.5m increments (recommended)
- **Boundaries:** Cannot move outside room

#### Rotating
1. Select furniture (click once)
2. Use transformer handles (circular)
3. Or: Type exact angle in properties panel (0-360°)
4. **Snap:** Rotates in 15° increments

#### Scaling
1. Select furniture
2. Drag corner handles to resize
3. Or: Use scale slider in properties (0.5x - 2x)
4. **Proportions:** Hold Shift to maintain aspect ratio

#### Changing Color
1. Select furniture
2. Click color picker in properties panel
3. Choose new color
4. **Note:** Only works for colorizable furniture

### Selection

**Single Select:**
- Click furniture to select
- Blue outline indicates selection

**Multi-Select:**
- Hold **Shift** + Click multiple items
- All selected items highlighted
- Transform together

**Deselect:**
- Click empty canvas area
- Or press **Esc**

### Deletion

- Select furniture
- Press **Delete** or **Backspace**
- Or click "Delete" in properties panel
- **Bulk Delete:** Select multiple → Delete all at once

---

## 3D Preview & Editing

### Opening 3D View

1. Click "3D Preview" button (top toolbar)
2. Full-screen modal opens
3. Real-time rendering of your design

### 3D Navigation

**Mouse Controls:**
- **Left Click + Drag:** Rotate camera around room
- **Right Click + Drag:** Pan camera horizontally
- **Scroll Wheel:** Zoom in/out
- **Double Click:** Focus on furniture (coming soon)

**Camera Presets:**
- Click camera icon to cycle through:
  - **Corner View:** Isometric perspective (default)
  - **Top View:** Birds-eye layout
  - **Front View:** Eye-level customer perspective

### Interactive 3D Editing

With furniture selected:

**Transform Modes:**
- **Move (G):** Drag furniture on floor plane
- **Rotate (R):** Spin furniture around Y-axis
- **Scale (S):** Resize proportionally

**Transform Controls:**
1. Select furniture in 3D view (click once)
2. Green outline appears
3. Toggle buttons appear (top-right):
   - ⊕ Move
   - ↻ Rotate
   - ⇱ Scale
4. Click and drag gizmo handles
5. Or press **G/R/S** keyboard shortcuts

**Snapping:**
- Movement: 0.5m grid snap
- Rotation: 15° increments
- Scale: 0.1x steps

### Lighting

Current lighting setup:
- **Ambient Light:** Soft overall illumination
- **Directional Light:** Simulates sunlight from top-right
- **Hemisphere Light:** Ground-reflected light
- **Contact Shadows:** Realistic furniture-floor shadows

*(Advanced lighting controls coming in future update)*

### Grid Helper

- Toggle with grid button (top-right)
- Shows 0.5m × 0.5m cells
- 1m major grid lines in red
- Helps align furniture precisely

---

## Furniture Library

### Categories

Filter by type:
- **All:** Show everything
- **Chairs:** Dining, office, lounge, stools
- **Tables:** Dining, coffee, side, desks
- **Sofas:** 2-seat, 3-seat, sectionals
- **Beds:** Single, queen, king
- **Storage:** Shelves, cabinets, wardrobes

### Search

- Type in search box
- Filters by furniture name
- Debounced for performance
- Clear with "×" button

### Furniture Cards

Each card shows:
- **Thumbnail Image:** Visual preview
- **Name:** Product title
- **Dimensions:** W × L × H in meters
- **Price:** Retail cost
- **Colorizable Badge:** If customizable

### Adding to Design

1. **Click:** Adds to center of room
2. **Drag:** Place at specific location
3. Multiple items allowed (no limit)

---

## Room Configuration

### Editing Room

Left sidebar controls:

**Dimensions:**
- **Width:** 1-20 meters
- **Length:** 1-20 meters
- **Height:** 2-5 meters
- Use sliders or type exact values

**Colors:**
- **Wall Color:** Click swatch to open picker
- **Floor Color:** Separate color control
- Hex codes supported (e.g., #FFFFFF)
- See changes in real-time

**Apply Button:**
- Saves room configuration
- Updates both 2D and 3D views
- Triggers undo history entry

### Common Room Presets

*Future Feature:* Save favorite room templates

**Typical Dimensions:**
- Small Bedroom: 3m × 3m
- Master Bedroom: 5m × 4m
- Living Room: 6m × 5m
- Dining Room: 4m × 3.5m
- Home Office: 3.5m × 3m

---

## Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + S` | Save design |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + ⇧ + Z` | Redo |
| `?` | Show keyboard shortcuts |
| `Esc` | Deselect all / Close dialog |

### 2D Editor

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Remove selected furniture |
| `⇧ + Click` | Multi-select furniture |
| `Click + Drag` | Move furniture |
| `M` | Measurement tool (future) |

### 3D Editor

| Shortcut | Action |
|----------|--------|
| `G` | Move (translate) mode |
| `R` | Rotate mode |
| `S` | Scale mode |
| `Scroll` | Zoom camera |
| `Click + Drag` | Rotate view |
| `Right Click + Drag` | Pan camera |

### Tips

💡 **Pro Shortcuts:**
- Press **G** then drag to move furniture in 3D
- Press **R** then drag to rotate furniture
- Press **?** anytime to see all shortcuts
- Use **⇧ + Drag** in 2D to select multiple items

---

## Best Practices

### For In-Store Consultations

1. **Preparation:**
   - Measure customer's room beforehand
   - Photograph existing furniture if applicable
   - Note customer style preferences

2. **Creating the Design:**
   - Start with room configuration
   - Add largest items first (sofas, beds, tables)
   - Fill in smaller pieces (chairs, side tables)
   - Use actual dimensions from catalog

3. **Customer Presentation:**
   - Begin in 2D to show layout
   - Switch to 3D for realistic view
   - Toggle between camera angles
   - Demonstrate furniture in context

4. **Collaboration:**
   - Make live edits based on feedback
   - Try different furniture combinations
   - Show color variations
   - Save multiple design options

5. **Closing:**
   - Save final design with customer name
   - Screenshot 3D views for customer
   - Generate PDF report (future feature)
   - Email design link to customer

### Design Tips

**Layout Principles:**
- **Traffic Flow:** Leave 1m walkways
- **Focal Points:** Arrange around windows/TV/fireplace
- **Balance:** Distribute visual weight evenly
- **Scale:** Ensure furniture fits proportionally
- **Functionality:** Consider real-world use

**Common Mistakes to Avoid:**
- ❌ Overcrowding rooms
- ❌ Blocking doorways
- ❌ Furniture too large/small for space
- ❌ Ignoring traffic patterns
- ❌ Forgetting to save regularly

**Optimization:**
- ✅ Use grid snap for alignment
- ✅ Start with room perimeter furniture
- ✅ Group related items (dining set)
- ✅ Test 3D view frequently
- ✅ Save iterations with unique names

---

## Troubleshooting

### Common Issues

#### 1. Furniture Not Loading

**Symptoms:** Gray boxes instead of 3D models

**Solutions:**
- Check internet connection
- Refresh page (⌘/Ctrl + R)
- Clear browser cache
- Verify furniture has valid 3D model URL

#### 2. Slow Performance

**Symptoms:** Laggy 2D/3D interactions

**Solutions:**
- Close other browser tabs
- Reduce design complexity (<50 items)
- Lower browser zoom level
- Use Chrome/Firefox (best performance)
- Check for available RAM

#### 3. Design Not Saving

**Symptoms:** "Failed to save" error message

**Solutions:**
- Check network connection
- Verify you're logged in
- Try again after a moment
- Contact IT if persists

#### 4. Undo Not Working

**Symptoms:** Undo button disabled

**Solutions:**
- Undo history has 50-step limit
- Reload page to reset (loses current changes)
- Save important work frequently

#### 5. 3D View Black Screen

**Symptoms:** 3D modal shows nothing

**Solutions:**
- Browser may not support WebGL
- Update graphics drivers
- Try different browser
- Check if hardware acceleration enabled

### Browser Requirements

**Recommended:**
- Chrome 90+ (best performance)
- Firefox 88+
- Safari 14+ (macOS only)
- Edge 90+

**Required:**
- WebGL 2.0 support
- Minimum 1280×720 resolution
- 4GB RAM
- Modern GPU

### Getting Help

**In-App:**
- Press `?` for keyboard shortcuts
- Click Help icon (top-right)
- Check tooltips (hover over buttons)

**External:**
- Email: support@roomcraft.studio
- Phone: 1-800-ROOMCRAFT
- Documentation: https://docs.roomcraft.studio
- Video Tutorials: https://learn.roomcraft.studio

---

## Advanced Features

### Coming Soon

🚀 **Planned Enhancements:**

- **Measurement Tools:** Distance ruler, dimension lines
- **Lighting Controls:** Time-of-day presets, custom lights
- **Material Picker:** Wood/fabric/metal textures
- **Room Features:** Doors, windows, wall cutouts
- **PDF Export:** Professional design reports
- **Interactive Tutorial:** Step-by-step guided tour
- **Design Templates:** Pre-made room layouts
- **Collaboration:** Share designs with team
- **AR Preview:** View designs with phone camera

### Beta Features

**Current Experimental:**
- 3D Transform Controls (G/R/S)
- Furniture Thumbnails in 2D
- Keyboard Shortcuts Dialog

---

## Appendix

### Furniture Dimensions Reference

**Chairs:**
- Dining Chair: 0.5m × 0.5m × 1.0m
- Office Chair: 0.6m × 0.6m × 1.2m
- Armchair: 0.8m × 0.9m × 0.9m

**Tables:**
- Dining (6-seat): 1.8m × 0.9m × 0.75m
- Coffee Table: 1.2m × 0.7m × 0.45m
- Side Table: 0.5m × 0.5m × 0.6m

**Sofas:**
- 2-Seater: 1.5m × 0.85m × 0.85m
- 3-Seater: 2.2m × 0.9m × 0.85m
- Sectional: 2.5m × 2.5m × 0.85m

**Beds:**
- Single: 1.0m × 2.0m × 0.5m
- Queen: 1.6m × 2.0m × 0.5m
- King: 2.0m × 2.0m × 0.5m

### Color Codes

**Popular Wall Colors:**
- White: #FFFFFF
- Cream: #F5F5DC
- Light Gray: #D3D3D3
- Beige: #F5F5DC
- Light Blue: #ADD8E6

**Popular Floor Colors:**
- Oak: #D2B48C
- Walnut: #8B7355
- Light Tile: #F0E68C
- Dark Tile: #696969
- Carpet Gray: #808080

---

**Version:** 1.0  
**Last Updated:** March 2026  
**For:** RoomCraft Studio Designer v1.0  
**Support:** support@roomcraft.studio
