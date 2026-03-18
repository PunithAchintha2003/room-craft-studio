## RoomCraft Studio

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-8a2be2?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production--ready-green)
![License](https://img.shields.io/badge/License-Course%20Project-lightgrey)

**Design, visualise, and shop for furniture in realistic 2D and 3D room layouts – with a full HCI process behind it.**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture-overview) • [HCI & UX](#hci-ux-documentation) • [Testing](#testing)

</div>

---

<h2 id="table-of-contents">📋 Table of Contents</h2>

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Scripts & Development Workflow](#scripts-development-workflow)
- [Configuration](#configuration)
- [Testing](#testing)
- [HCI & UX Documentation](#hci-ux-documentation)
- [Roadmap](#roadmap)
- [License](#license)

---

<h2 id="overview">🎯 Overview</h2>

RoomCraft Studio is a production‑ready **room‑design and furniture visualisation platform** with three React frontends and a shared Node.js/Express API. It combines a 2D room editor, 3D visualisation, and ecommerce features (cart, orders, wishlist, Stripe) on top of a clean, layered architecture.

It is built to look and feel like a real product **and** to showcase a complete HCI workflow: personas, storyboards, wireframes, usability testing, iterative redesign, accessibility auditing, and clean architecture.

### At a glance

- 👥 **Three apps** – Client, Admin, Designer.
- 🧩 **2D + 3D** – Canvas‑based editor plus full 3D viewer.
- 🛒 **Ecommerce‑ready** – Cart, orders, wishlist, Stripe integration.
- 🧠 **HCI‑driven** – Personas, storyboards, wireframes, testing, iterations, accessibility.
- 🧱 **Clean architecture** – Layered backend, feature‑sliced frontends, shared design system.

---

<h2 id="features">✨ Features</h2>

- **2D room designer**
  - Grid‑based editor with furniture placement, snapping, and design management.
  - Saved designs per user and design history.
  - Two‑tone layout that separates controls from canvas to reduce visual noise.

- **3D visualisation**
  - Interactive 3D viewer with orbit, zoom, and pan.
  - Realistic lighting, shadows, and contact shadows for depth perception.
  - Seamless 2D/3D toggle on the design viewer page.
  - Screenshot capture/export for presentations.
  - Admin 3D preview for validating designs before approval.
  - Full implementation details in `PHASE3_COMPLETE.md`.

- **Ecommerce**
  - Carts with TTL, price snapshots, and tax calculation.
  - Orders with full lifecycle status tracking.
  - Wishlists per user.
  - Stripe integration for payment intents, webhooks, and refunds.
  - Product cards with stock, ratings, tags, and “add to cart / wishlist” actions.
  - Implementation status and coverage in `ECOMMERCE_IMPLEMENTATION_STATUS.md`.

- **Design system**
  - Shared two‑tone background and glassmorphism components across all apps.
  - Theme tokens for colours, typography, shape, and elevation.
  - Dark/light mode with system preference support.

---

<h2 id="screenshots">🖼 Screenshots</h2>

> Screens below are examples; replace paths with your own captures under `docs/screenshots/`.

- **Welcome & catalog**

  `![Landing and catalog](docs/screenshots/landing-catalog.png)`

- **2D room editor**

  `![2D room editor](docs/screenshots/room-editor-2d.png)`

- **3D viewer**

  `![3D design viewer](docs/screenshots/room-viewer-3d.png)`

- **Cart & order summary**

  `![Cart and order summary](docs/screenshots/cart-summary.png)`

---

<h2 id="architecture-overview">🏗 Architecture overview</h2>

RoomCraft Studio is designed with a **clean, layered architecture** and clear separation of concerns. For full details and diagrams, see `ARCHITECTURE.md`.

- **Backend (`server/`)**
  - **Layers**: routes → controllers → services → models.
  - **Patterns**:
    - Controllers handle validation and HTTP response shaping.
    - Services encapsulate business logic (designs, furniture, cart, orders, wishlist, payments).
    - Models define persistence via Mongoose (MongoDB).
  - **Cross‑cutting concerns**:
    - Authentication and authorisation middleware.
    - Request validation.
    - Centralised error handling and logging.
    - Security middleware (Helmet, CORS, rate limiting as configured).
    - Stripe webhooks with raw body parsing.

- **Frontends (`client/`, `admin/`, `designer/`)**
  - React 18 + TypeScript single‑page applications.
  - Redux Toolkit feature slices for designs, furniture, cart, orders, wishlist, checkout, and 3D viewer.
  - Shared design tokens and theming to ensure consistent UX across all apps.

- **3D architecture**
  - React Three Fiber + Drei for 3D scenes.
  - Reusable primitives:
    - `Canvas3DViewer` – scene container.
    - `Room3D` – floor and wall geometry.
    - `FurnitureModel3D` – GLB/GLTF loader with loading states and fallbacks.
  - 3D viewer state (mode, camera, loading, errors) managed in a dedicated Redux slice.

---

<h2 id="tech-stack">🛠 Tech stack</h2>

- **Frontend**
  - React 18, TypeScript, Vite.
  - Redux Toolkit for state management.
  - MUI (Material UI) with custom themes and tokens.
  - React‑Konva for 2D canvas.
  - React Three Fiber + Drei + Three.js for 3D.

- **Backend**
  - Node.js, Express, TypeScript.
  - MongoDB with Mongoose.
  - Stripe for payments.

- **Tooling**
  - npm/Yarn (npm used in scripts).
  - ESLint + TypeScript configuration.

See `ARCHITECTURE.md` for a more detailed technology overview.

---

<h2 id="project-structure">📁 Project structure</h2>

- `client/` – customer‑facing SPA (2D/3D designer, ecommerce flows, HCI docs).
- `admin/` – admin dashboard and design editor with 3D preview.
- `designer/` – designer‑focused tooling, sharing the same design system.
- `server/` – REST API, authentication, ecommerce logic, and persistence.
- `ARCHITECTURE.md` – high‑level architecture, diagrams, and design decisions.
- `PHASE2_COMPLETE.md` / `PHASE3_COMPLETE.md` – phase‑specific implementation details.
- `ECOMMERCE_IMPLEMENTATION_STATUS.md` – ecommerce backend/state coverage and progress.
- `client/HCI_*.md` – HCI artefacts (personas, storyboards, wireframes, testing, iterations, accessibility).

---

<h2 id="prerequisites">📦 Prerequisites</h2>

- Node.js 18+ and npm.
- Running MongoDB instance.
- Stripe account (for end‑to‑end payment testing).

---

<h2 id="quick-start">⚡ Quick Start</h2>

Clone and install:

```bash
git clone <repo-url>
cd room-craft-studio
```

Install dependencies per app:

```bash
cd client && npm install
cd ../admin && npm install
cd ../designer && npm install
cd ../server && npm install
```

Run server + client (two terminals):

```bash
# Terminal 1 – API
cd server
npm run dev

# Terminal 2 – Client
cd client
npm run dev
```

The client will be available on port 3000 and the API on port 5001 (by default).

---

<h2 id="scripts-development-workflow">🧩 Scripts & Development Workflow</h2>

From the repo root, you can run each app individually.

- **Client** (port 3000)

  ```bash
  cd client
  npm run dev
  ```

- **Admin** (port 5173)

  ```bash
  cd admin
  npm run dev
  ```

- **Designer** (port 3002)

  ```bash
  cd designer
  npm run dev
  ```
  
  The Designer app is optimized for furniture design professionals conducting in-store consultations. Features include:
  - 2D room editor with actual furniture dimensions
  - Interactive 3D editing with TransformControls (G/R/S shortcuts)
  - Furniture thumbnails in 2D view
  - Real-time visualization
  - Keyboard shortcuts (press ? for help)
  - Professional design workflow

- **Server** (port 5001)

  ```bash
  cd server
  npm run dev
  ```

You can run multiple apps in parallel during development (for example, the client and server).

---

<h2 id="configuration">⚙️ Configuration</h2>

Environment variables for the backend are documented in `server/.env.example`. At minimum you will need:

- MongoDB connection string.
- JWT/auth configuration.
- Stripe API keys (if you want to run payment flows).

Create a `.env` file in `server/` based on `.env.example` and fill in the required values.

Frontends can optionally use a `.env` file for API base URLs if the defaults are not suitable; see `client/.env` and `admin/.env` if present.

---

<h2 id="testing">✅ Testing</h2>

The project includes both implementation‑level and UX‑level testing.

- **Backend / implementation testing**
  - Manual regression checklists for 2D/3D flows (documented in `PHASE3_COMPLETE.md`).
  - API endpoint verification for cart, orders, wishlist, and payment routes.
  - Error and edge cases covered: missing 3D models, failed payments, invalid input payloads.

- **Frontend / UX testing**
  - Usability testing plan with defined tasks, metrics, and success criteria (`client/HCI_TESTING_PLAN.md`).
  - Testing notes and observed issues (`client/HCI_TESTING_NOTES.md`).
  - Iterative redesigns driven by test results, with before/after metrics (`client/HCI_ITERATIONS_ECOMMERCE.md`).
  - Accessibility audit against WCAG 2.1 AA (`client/HCI_ACCESSIBILITY_REPORT.md`).

You can extend this with automated tests (unit/integration/end‑to‑end) following the existing architecture and state management patterns.

---

## Documentation

### User Guides
- **[Designer Guide](docs/DESIGNER_GUIDE.md)** - Complete manual for furniture design professionals
- **[3D Workflow](docs/3D_WORKFLOW.md)** - Blender to web pipeline for 3D models

### HCI & UX Documentation

In addition to the production‑ready implementation, RoomCraft Studio includes a full set of HCI artefacts:

- **Personas** – `client/HCI_PERSONAS.md`
- **Storyboards** – `client/HCI_STORYBOARDS.md`, `client/HCI_STORYBOARDS_ECOMMERCE.md`
- **Wireframes & IA** – `client/HCI_WIREFRAMES.md`
- **Usability testing** – `client/HCI_TESTING_PLAN.md`, `client/HCI_TESTING_NOTES.md`
- **Iterative redesign** – `client/HCI_ITERATIONS.md`, `client/HCI_ITERATIONS_ECOMMERCE.md`
- **Accessibility report** – `client/HCI_ACCESSIBILITY_REPORT.md`
- **Summary** – `HCI_DOCUMENTATION_SUMMARY.md`

These documents explain how UX decisions are grounded in user research, testing, and established HCI principles while still being directly tied to the running product.

---

### Designer App Enhanced Features

**2D Editor:**
- ✅ Actual furniture dimensions from database (no more hardcoded boxes)
- ✅ Furniture thumbnail overlays for visual clarity
- ✅ Improved selection and manipulation
- ✅ Grid snap and precise placement
- ✅ **Measurement tool with ruler mode** - Press M key to measure distances between any two points

**3D Editor:**
- ✅ Interactive TransformControls (move/rotate/scale)
- ✅ Keyboard shortcuts: G (move), R (rotate), S (scale)
- ✅ Real-time furniture manipulation in 3D space
- ✅ Multiple camera presets (corner, top, front)
- ✅ Enhanced lighting and shadows
- ✅ **Ground plane raycasting** - Click-to-place furniture support
- ✅ **Lighting Control Panel** - Time-of-day presets, intensity sliders, shadow toggle

**Material System:**
- ✅ **Material Picker** - 36 material presets across 6 categories (Wood, Fabric, Metal, Leather, Plastic, Glass)
- ✅ **PBR Controls** - Roughness and metalness sliders for realistic rendering

**Export Features:**
- ✅ **Enhanced Screenshot Export** - Multi-resolution (800x600 to 4K), transparent backgrounds, PNG/JPEG/WebP formats
- ✅ **PDF Report Generator** - Comprehensive reports with screenshots, furniture lists, and cost breakdowns
- ✅ **3D Scene Export** - GLB/GLTF/OBJ format export with metadata

**UX Improvements:**
- ✅ Keyboard shortcuts help dialog (press ?)
- ✅ Comprehensive tooltips throughout
- ✅ Professional design workflow
- ✅ Auto-save indicators
- ✅ Undo/redo with 50-step history
- ✅ **Interactive Tutorial** - First-time user guided tour with react-joyride

**Code Quality:**
- ✅ ESLint + Prettier configuration
- ✅ Pre-commit hooks with Husky + lint-staged
- ✅ Modular component architecture
- ✅ TypeScript strict mode
- ✅ Industry-standard code formatting

---

<h2 id="roadmap">🗺 Roadmap</h2>

Potential next steps:

- Extend ecommerce UIs (product detail, full checkout flow, order history pages).
- Further performance optimisation for 3D on low‑end/mobile devices.
- High‑resolution screenshot export and design thumbnails.
- Additional automated test coverage across backend and frontends.

See `ECOMMERCE_IMPLEMENTATION_STATUS.md` and `PHASE3_COMPLETE.md` for more detail on current coverage and planned work.

---

<h2 id="license">📄 License</h2>

This project is provided for educational and demonstration purposes.  
If you plan to use it in production or as a base for a commercial project, review and adapt the license and security configuration to your requirements.
