<div align="center">

# 🏠 RoomCraft Studio

**Design, visualise, and shop for furniture in realistic 2D and 3D room layouts**  
*Built with a complete HCI process — from personas to accessibility.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Course%20Project-lightgrey)](./LICENSE)

[Features](#features) · [Quick Start](#quick-start) · [Architecture](#architecture-overview) · [Docs](#documentation) · [Testing](#testing)

🌐 Live Client: [room-craft-studio.vercel.app](https://room-craft-studio.vercel.app)  
🛠 Live Admin Portal: [room-craft-studio-admin-portal.vercel.app](https://room-craft-studio-admin-portal.vercel.app)  
📺 YouTube: [PUSL 3122 HCI Group 96 Presentation](https://youtu.be/zHbJxvBknQM)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#overview)
- [✨ Features](#features)
- [🏗 Architecture Overview](#architecture-overview)
- [🛠 Tech Stack](#tech-stack)
- [📦 Prerequisites](#prerequisites)
- [⚡ Quick Start](#quick-start)
- [📁 Project Structure](#project-structure)
- [🧩 Scripts & Development](#scripts-development-workflow)
- [⚙️ Configuration](#configuration)
- [✅ Testing](#testing)
- [📚 Documentation](#documentation)
- [👥 Team Contributions](#team-contributions)
- [🗺 Roadmap](#roadmap)
- [📄 License](#license)

---

<a id="overview"></a>
## 🎯 Overview

**RoomCraft Studio** is a production-ready **room-design and furniture visualisation platform** with three React frontends and a shared Node.js/Express API. It combines a 2D room editor, 3D visualisation, and ecommerce (cart, orders, wishlist, Stripe) on a clean, layered architecture.

It is built to feel like a real product **and** to showcase a full HCI workflow: personas, storyboards, wireframes, usability testing, iterative redesign, accessibility auditing, and clean architecture.

<table>
<tr>
<td width="50%">

### At a glance

- 👥 **Three apps** — Client, Admin, Designer  
- 🧩 **2D + 3D** — Canvas editor + full 3D viewer  
- 🛒 **Ecommerce-ready** — Cart, orders, wishlist, Stripe  
- 🧠 **HCI-driven** — Personas → testing → iterations → accessibility  
- 🧱 **Clean architecture** — Layered backend, feature-sliced frontends, shared design system  

</td>
</tr>
</table>

---

<a id="features"></a>
## ✨ Features

### 🖌 2D Room Designer

- Grid-based editor with furniture placement, snapping, and design management  
- Saved designs per user with design history  
- Two-tone layout separating controls from canvas to reduce visual noise  

### 🌐 3D Visualisation

- Interactive 3D viewer with orbit, zoom, and pan  
- Realistic lighting, shadows, and contact shadows  
- Seamless 2D/3D toggle on the design viewer page  
- Screenshot capture/export for presentations  
- Admin 3D preview for validating designs before approval  
- Full details in `PHASE3_COMPLETE.md`  

### 🛒 Ecommerce

- Carts with TTL, price snapshots, and tax calculation  
- Orders with full lifecycle status tracking  
- Wishlists per user  
- Stripe integration (payment intents, webhooks, refunds)  
- Product cards with stock, ratings, tags, add to cart/wishlist  
- Status and coverage in `ECOMMERCE_IMPLEMENTATION_STATUS.md`  

### 🎨 Design System

- Shared two-tone background and glassmorphism across all apps  
- Theme tokens for colours, typography, shape, and elevation  
- Dark/light mode with system preference support  

---

<a id="architecture-overview"></a>
## 🏗 Architecture Overview

RoomCraft Studio uses a **clean, layered architecture** with clear separation of concerns. See `ARCHITECTURE.md` for full details and diagrams.

### Backend (`server/`)

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP endpoints and routing |
| **Controllers** | Validation and response shaping |
| **Services** | Business logic (designs, furniture, cart, orders, wishlist, payments) |
| **Models** | Persistence via Mongoose (MongoDB) |

**Cross-cutting:** Auth middleware, request validation, centralised error handling and logging, security (Helmet, CORS, rate limiting), Stripe webhooks with raw body parsing.

### Frontends (`client/`, `admin/`, `designer/`)

- React 18 + TypeScript SPAs  
- Redux Toolkit feature slices (designs, furniture, cart, orders, wishlist, checkout, 3D viewer)  
- Shared design tokens and theming for consistent UX  

### 3D Stack

- **React Three Fiber** + **Drei** for 3D scenes  
- **Primitives:** `Canvas3DViewer`, `Room3D`, `FurnitureModel3D` (GLB/GLTF with loading states)  
- 3D viewer state (mode, camera, loading, errors) in a dedicated Redux slice  

---

<a id="tech-stack"></a>
## 🛠 Tech Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | React 18, TypeScript, Vite, Redux Toolkit, MUI (custom themes), React-Konva (2D), React Three Fiber + Drei + Three.js (3D) |
| **Backend** | Node.js, Express, TypeScript, MongoDB (Mongoose), Stripe |
| **Tooling** | npm, ESLint, TypeScript strict mode |

See `ARCHITECTURE.md` for a detailed technology overview.

---

<a id="prerequisites"></a>
## 📦 Prerequisites

- **Node.js** 18+ and **npm**  
- **MongoDB** (local or Atlas)  
- **Stripe** account (for end-to-end payment testing)  

---

<a id="quick-start"></a>
## ⚡ Quick Start

**1. Clone and enter the repo**

```bash
git clone <repo-url>
cd room-craft-studio
```

**2. Install dependencies** (run in each app directory)

```bash
cd client   && npm install
cd ../admin && npm install
cd ../designer && npm install
cd ../server && npm install
```

**3. Run the API and client** (two terminals)

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

- **Client:** http://localhost:3000  
- **API:** http://localhost:5001  

---

<a id="project-structure"></a>
## 📁 Project Structure

| Path | Description |
|------|-------------|
| `client/` | Customer-facing SPA (2D/3D designer, ecommerce, HCI docs) |
| `admin/` | Admin dashboard and design editor with 3D preview |
| `designer/` | Designer-focused tooling, shared design system |
| `server/` | REST API, auth, ecommerce, persistence |
| `ARCHITECTURE.md` | Architecture, diagrams, design decisions |
| `PHASE2_COMPLETE.md` / `PHASE3_COMPLETE.md` | Phase implementation details |
| `ECOMMERCE_IMPLEMENTATION_STATUS.md` | Ecommerce coverage and progress |
| `client/HCI_*.md` | HCI artefacts (personas, storyboards, wireframes, testing, accessibility) |

---

<a id="scripts-development-workflow"></a>
## 🧩 Scripts & Development Workflow

Run each app from its directory. You can run multiple apps in parallel (e.g. client + server).

| App | Port | Command |
|-----|------|--------|
| **Client** | 3000 | `cd client && npm run dev` |
| **Admin** | 5173 | `cd admin && npm run dev` |
| **Designer** | 3002 | `cd designer && npm run dev` |
| **Server** | 5001 | `cd server && npm run dev` |

**Designer app** is built for furniture design professionals and in-store consultations:

- 2D room editor with real furniture dimensions  
- Interactive 3D editing with TransformControls (G/R/S shortcuts)  
- Furniture thumbnails in 2D, real-time visualisation  
- Keyboard shortcuts (press `?` for help)  

---

<a id="configuration"></a>
## ⚙️ Configuration

Backend env vars are documented in `server/.env.example`. Minimum required:

- MongoDB connection string  
- JWT/auth configuration  
- Stripe API keys (for payment flows)  

Create `server/.env` from `server/.env.example` and fill in values.

Frontends can use `.env` for API base URLs if needed; see `client/.env` and `admin/.env` when present.

---

## ✅ Testing

- **Backend / implementation**  
  Manual regression checklists for 2D/3D flows (`PHASE3_COMPLETE.md`), API verification for cart, orders, wishlist, payments, and edge cases (missing 3D models, failed payments, invalid payloads).

- **Frontend / UX**  
  Usability testing plan, tasks, metrics (`client/HCI_TESTING_PLAN.md`), notes and issues (`client/HCI_TESTING_NOTES.md`), iterative redesigns (`client/HCI_ITERATIONS_ECOMMERCE.md`), WCAG 2.1 AA accessibility audit (`client/HCI_ACCESSIBILITY_REPORT.md`).

You can add automated tests (unit/integration/e2e) following the existing architecture and state patterns.

---

<a id="documentation"></a>
## 📚 Documentation

### User guides

- **[Designer Guide](docs/DESIGNER_GUIDE.md)** — Manual for furniture design professionals  
- **[3D Workflow](docs/3D_WORKFLOW.md)** — Blender → web pipeline for 3D models  

### HCI & UX

- **Personas** — `client/HCI_PERSONAS.md`  
- **Storyboards** — `client/HCI_STORYBOARDS.md`, `client/HCI_STORYBOARDS_ECOMMERCE.md`  
- **Wireframes & IA** — `client/HCI_WIREFRAMES.md`  
- **Usability testing** — `client/HCI_TESTING_PLAN.md`, `client/HCI_TESTING_NOTES.md`  
- **Iterative redesign** — `client/HCI_ITERATIONS.md`, `client/HCI_ITERATIONS_ECOMMERCE.md`  
- **Accessibility** — `client/HCI_ACCESSIBILITY_REPORT.md`  
- **Summary** — `HCI_DOCUMENTATION_SUMMARY.md`  

### Designer app — enhanced features

**🖌 2D Editor**

- ✅ Real furniture dimensions from DB (no hardcoded boxes)  
- ✅ Furniture thumbnail overlays  
- ✅ Improved selection, grid snap, precise placement  
- ✅ **Measurement tool** — Press `M` to measure between two points  

**🌐 3D Editor**

- ✅ TransformControls (move/rotate/scale) — G / R / S  
- ✅ Real-time 3D manipulation, multiple camera presets  
- ✅ Enhanced lighting and shadows  
- ✅ **Ground plane raycasting** — click-to-place furniture  
- ✅ **Lighting Control Panel** — time-of-day presets, intensity, shadow toggle  

**🎨 Material system**

- ✅ **Material Picker** — 36 presets (Wood, Fabric, Metal, Leather, Plastic, Glass)  
- ✅ **PBR controls** — Roughness and metalness sliders  

**📤 Export**

- ✅ **Screenshot export** — Multi-resolution (800×600 to 4K), PNG/JPEG/WebP, transparent background  
- ✅ **PDF reports** — Screenshots, furniture list, cost breakdown  
- ✅ **3D export** — GLB/GLTF/OBJ with metadata  

**✨ UX & quality**

- ✅ Keyboard shortcuts help (`?`), tooltips, auto-save, undo/redo (50 steps)  
- ✅ **Interactive tutorial** — react-joyride guided tour  
- ✅ ESLint + Prettier, Husky + lint-staged, TypeScript strict mode  

---

<a id="team-contributions"></a>
## 👥 Team Contributions

| Student ID | Name | Role | Contribution |
|-----------|------|------|--------------|
| 10952357 | Matara Hirimbura | Project Lead & Visualization Developer | Introduced the system, built 2D/3D visualization, and developed the design portal. |
| 10952604 | Rathnayaka Tharushika | Backend & Authentication Developer | Implemented login/signup, user role management, and user and designer management. |
| 10953498 | Manikkuge Navodya | Furniture Module Developer | Developed furniture browsing and admin furniture management. |
| 10952542 | Mohottalage Perera | Order & Wishlist Developer | Implemented wishlist and order management features. |
| 10952732 | Ekanayake Ekanayake | Review System Developer | Developed review and feedback management. |

---

<a id="roadmap"></a>
## 🗺 Roadmap

- Extend ecommerce UIs (product detail, full checkout, order history)  
- 3D performance tuning for low-end/mobile  
- High-res screenshot export and design thumbnails  
- Broader automated test coverage (backend + frontends)  

See `ECOMMERCE_IMPLEMENTATION_STATUS.md` and `PHASE3_COMPLETE.md` for current coverage and plans.

---

<a id="license"></a>
## 📄 License

This project is for **educational and demonstration** use. For production or commercial use, review and adapt the license and security configuration to your needs.
