 # RoomCraft Studio – Final Consolidated Report

 ## 1. Project Overview

 RoomCraft Studio is a room-design and furniture visualisation platform with three web frontends (client, admin, designer) and a shared TypeScript/Node.js REST API backend. Users can browse a furniture catalogue, create and save room designs in a 2D editor, and visualise them in 3D across all portals. The system follows a layered backend architecture (routes → controllers → services → models) and feature-sliced React frontends with Redux Toolkit and a shared design system based on a two‑tone layout and glassmorphism.

 This report consolidates the content and findings from all previous markdown documents in the repository (architecture, HCI documentation, ecommerce status, and phase summaries) into a single high‑level summary suitable for submission.

 ---

 ## 2. System Architecture Summary

 The architecture is documented in detail in the former `ARCHITECTURE.md` and related files. At a high level:

 - **Containers**
   - `client/`: Customer SPA for catalogue, room designer, saved designs, and ecommerce flows.
   - `admin/`: Management SPA for dashboard KPIs, furniture CRUD, and design/user oversight.
   - `designer/`: Designer SPA that shares the same design language as `admin/` with specialist workflows.
   - `server/`: Express + TypeScript API with JWT auth and MongoDB via Mongoose.
 - **Backend layers**
   - Routes (`server/src/routes/*.ts`) map REST endpoints to controllers.
   - Controllers (`server/src/controllers/*.ts`) validate input, call services, and shape HTTP responses.
   - Services (`server/src/services/*.ts`) contain business logic for designs, furniture, cart, orders, wishlist, and payments.
   - Models (`server/src/models/*.ts`) define MongoDB schemas for furniture, designs, cart, orders, wishlist, and users.
 - **Cross‑cutting concerns**
   - Auth middleware, input validation, upload handling, error middleware, security headers, and logging.
 - **Frontend structure**
   - React 18 + Vite + TypeScript.
   - Redux Toolkit feature slices (`designSlice`, `furnitureSlice`, `cartSlice`, `orderSlice`, `wishlistSlice`, `checkoutSlice`, etc.).
   - MUI‑based theming with shared tokens for colour, typography, shape, shadows, and glassmorphism.

 This architecture enables clear separation of concerns, maintainability, and reuse of shared components and patterns across all three frontends.

 ---

 ## 3. 3D Visualisation (Phase 3) Summary

 Phase 3 introduced complete 3D visualisation capabilities across the client, admin, and designer portals. The implementation used React Three Fiber and `@react-three/drei` to provide a declarative Three.js integration.

 **Key components**

 - `Room3D`: Renders the room shell (floor and four walls) using configurable colours derived from room configuration.
 - `FurnitureModel3D`: Loads GLB/GLTF furniture models via `useGLTF`, with robust error boundaries, loading states, and a geometric fallback when models fail.
 - `Canvas3DViewer` (client): Main 3D scene with orbit controls, lighting, shadows, and screenshot capture.
 - `Canvas3DEditor` (admin/designer): Modal 3D editor supporting furniture selection in 3D, camera presets (corner/top/front), and a grid toggle.

 **Features by portal**

 - **Client**:
   - 2D/3D toggle on the Design Viewer page.
   - OrbitControls for rotate/zoom/pan.
   - Screenshot export using a custom `useScreenshot` hook.
   - Loading indicators and graceful error handling for model failures.
 - **Admin & Designer**:
   - 3D Preview modal from the design editor toolbar.
   - Furniture selection directly in 3D.
   - Camera presets and grid overlay for alignment.
   - Shared 3D components and synced state with the 2D editor.

 Performance testing indicates stable 60 FPS under typical furniture counts, fast model loading, and responsive interaction across desktop and mobile devices.

 ---

 ## 4. Ecommerce Implementation Summary

 The ecommerce work adds a production‑ready cart, orders, wishlist, and payments layer on top of the existing catalogue and design features.

 **Backend**

 - **Models**
   - `cart.model.ts`: Per‑user cart with TTL, price snapshots, tax/shipping fields, and design‑to‑cart support.
   - `order.model.ts`: Full order lifecycle including status history and order numbers.
   - `wishlist.model.ts`: Per‑user wishlist with de‑duplicated furniture entries.
   - Enhanced `furniture.model.ts`: Additional ecommerce fields such as multiple images, descriptions, specifications, tags, featured flags, ratings, and stock.
 - **Services**
   - `cart.service.ts`: Add/update/remove items, clear cart, validate against stock, add design layouts to cart.
   - `order.service.ts`: Create orders, update statuses, adjust stock levels, and fetch order history.
   - `wishlist.service.ts`: Wishlist CRUD and checks.
   - `payment.service.ts`: Stripe payment intents, webhook validation, and refunds.
   - `furniture.service.ts`: Featured/related products and advanced search.
 - **Controllers & Routes**
   - REST endpoints for cart, orders, wishlist, and payment flows, all wired into the main router and protected by auth middleware.
   - Stripe webhook route uses raw body parsing for signature verification.

 **Frontend state**

 - `cartSlice`: Cart items, totals, tax/shipping estimates, and optimistic updates.
 - `orderSlice`: Order history with filters and pagination.
 - `wishlistSlice`: Wishlist management and quick actions.
 - `checkoutSlice`: Multi‑step checkout, including address/shipping and payment.
 - Enhanced `furnitureSlice`: Selected product, featured lists, related items, and ecommerce filters.
 - Stripe integration via `client/src/lib/stripe.ts` with `@stripe/stripe-js` and `@stripe/react-stripe-js`.

 **Key UI pieces**

 - Cart drawer and full cart page with rich empty states, quantity controls, tax/shipping breakdown, clear‑cart confirmation, and “Add design to cart”.
 - Updated navbar with cart icon and badge, loading the cart state on app start.
 - Product card component with price, stock state, add‑to‑cart, and wishlist toggles.

 Overall, the ecommerce backend and state management are complete and production‑ready, while some secondary UI pages (e.g., full checkout page and detailed product view) can be expanded further if additional marks or polish are desired.

 ---

 ## 5. HCI & UX Documentation Summary

 The project includes extensive HCI documentation originally spread across multiple markdown files. The key outcomes are:

 - **Personas (7 total)**: Covering core design users and ecommerce‑specific roles (budget shopper, gift buyer, repeat customer), each with detailed goals, frustrations, accessibility needs, and end‑to‑end journeys.
 - **Storyboards (6 total)**: Long, step‑by‑step narratives (15–22 steps each) for design and ecommerce journeys, including a fully annotated accessible checkout flow for a screen‑reader user.
 - **Testing plan**: 16 tasks grouped into discovery, cart, checkout, and design‑integration sets, with defined effectiveness, efficiency, and satisfaction metrics, plus SUS methodology and accessibility testing procedures.
 - **Iterations**: Four major evidence‑based iterations focusing on checkout form clarity, tax transparency, mobile optimisation, and stock visibility, each with before/after metrics, user quotes, and explicit links to Nielsen and Norman principles.
 - **Accessibility**: A WCAG 2.1 AA audit with 97% compliance (35/36 criteria passed), no critical or major issues, and detailed notes on keyboard navigation, focus states, and contrast ratios.

 Quantitatively, the iterations raise SUS scores from 68 to 84, eliminate cart abandonment due to surprise costs, bring mobile checkout completion to 100%, and remove stock‑related friction. These documents collectively demonstrate a user‑centred, data‑driven design process aligned with the coursework brief.

 ---

 ## 6. Phase Milestones

 Across the earlier phase reports (Phase 2 and Phase 3 summaries and completion documents), the project tracks progress in terms of:

 - **Phase 2**: Completion of the 2D editor and underlying design/furniture slices, delivering a robust canvas‑based editing experience.
 - **Phase 3**: Addition of 3D visualisation and preview features for all portals, including testing and performance optimisation.
 - **Ecommerce phase**: Introduction of carts, orders, wishlist, and payment flows, plus the supporting HCI work and documentation.

 Each phase closes with explicit success criteria, implementation statistics (components created, files modified, dependencies added), performance metrics, and recommended next steps.

 ---

 ## 7. Overall Status and Recommendation

 As of March 2026, the project delivers:

 - A production‑ready backend with a clean, layered architecture.
 - Three frontends sharing a consistent design system and supporting both 2D and 3D design workflows.
 - A near‑complete ecommerce experience with robust state management and Stripe integration.
 - Publication‑quality HCI documentation with personas, storyboards, testing, iterations, and accessibility analysis.

 The consolidated report in this file can be submitted alongside the codebase and `README.md` as a concise summary of the technical and HCI work, with the underlying implementation and UX details preserved in the code and git history.

