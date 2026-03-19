# RoomCraft Studio - Project Report

## Document Control

- **Project**: RoomCraft Studio
- **Version**: 1.0
- **Date**: March 2026
- **Prepared by**: Group 96
- **Purpose**: Consolidated technical and product delivery report

---

## 1. Executive Summary

RoomCraft Studio is a multi-portal platform for furniture discovery, room design, and ecommerce execution. The solution includes three React frontends (`client`, `admin`, `designer`) and a shared Node.js/TypeScript REST API (`server`) backed by MongoDB.

The platform delivers end-to-end user value across:

- 2D room planning and 3D visualization
- Furniture catalog and product discovery
- Cart, wishlist, checkout, order lifecycle, and payment processing
- Administrative and designer workflows

From an engineering perspective, the system uses a layered backend architecture and feature-based frontend state management to keep implementation modular, testable, and maintainable.

---

## 2. Product Scope and Objectives

### Primary Objectives

- Enable users to design realistic room layouts in 2D and 3D.
- Support a full ecommerce flow from product browsing to payment.
- Provide role-specific portals for customers, administrators, and designers.
- Maintain a consistent design language and reusable component system.

### In Scope

- Customer SPA (`client/`) for catalog, design workflows, and ecommerce journeys.
- Admin SPA (`admin/`) for operational management and oversight.
- Designer SPA (`designer/`) for specialist design tasks.
- REST API (`server/`) for authentication, business logic, and data persistence.

---

## 3. Solution Architecture

### 3.1 System Composition

- `client/`: Customer-facing SPA (catalog, 2D/3D design, wishlist, cart, checkout, order history)
- `admin/`: Management portal (dashboard KPIs, furniture CRUD, user/design oversight)
- `designer/`: Designer portal with shared design system and specialized tools
- `server/`: Express + TypeScript API with JWT-based authentication and MongoDB/Mongoose

### 3.2 Backend Design

The backend follows a clear layered pattern:

- **Routes** map HTTP endpoints to controllers.
- **Controllers** validate requests and orchestrate service execution.
- **Services** implement domain logic (design, furniture, cart, order, wishlist, payment).
- **Models** define persistence schemas and relationships.

### 3.3 Cross-Cutting Concerns

- Authentication and authorization middleware
- Input validation and error handling middleware
- Logging, security headers, and upload handling
- Stripe webhook handling with raw body validation

### 3.4 Frontend Architecture

- React 18 + Vite + TypeScript
- Redux Toolkit slices for domain state (`design`, `furniture`, `cart`, `order`, `wishlist`, `checkout`)
- Shared MUI-based theming, tokens, and reusable UI patterns

---

## 4. Key Delivery Areas

### 4.1 3D Visualization Capability

The platform includes integrated 3D room visualization across portals using React Three Fiber and `@react-three/drei`.

Delivered capabilities include:

- Room shell rendering (floor/walls) from room configuration
- GLB/GLTF furniture model loading with loading/error fallback behavior
- Camera controls, lighting, shadows, and grid/camera presets (where applicable)
- 2D/3D workflow continuity between editors and viewers
- Screenshot capture support on the client viewer

Reported outcome: stable interaction quality and responsive rendering for typical furniture counts.

### 4.2 Ecommerce Capability

Ecommerce implementation extends the platform with:

- Per-user cart management and quantity updates
- Wishlist management with duplicate prevention
- Order creation, status tracking, and order history
- Stock-aware operations and inventory adjustments
- Stripe payment intent lifecycle and webhook verification

Frontend experience includes:

- Cart drawer and full cart page
- Product cards with price/stock/add-to-cart/wishlist actions
- Checkout state management and payment integration support

---

## 5. UX, HCI, and Accessibility Outcomes

The project includes structured UX artifacts and evidence-driven iteration:

- 7 personas across design and ecommerce user segments
- 6 storyboards covering major user journeys
- 16-task usability test plan with effectiveness/efficiency/satisfaction metrics
- 4 documented design iterations targeting checkout clarity, transparency, mobile flow, and stock communication
- WCAG 2.1 AA audit results at 97% compliance (35/36 criteria passed)

Measured UX impact reported in the documentation includes SUS improvement from 68 to 84 and reduced checkout friction across mobile and desktop workflows.

---

## 6. Delivery Timeline and Milestones

### Phase 2

- Delivered 2D editor foundations and supporting furniture/design state architecture.

### Phase 3

- Delivered full 3D visualization and portal-level preview capabilities.

### Ecommerce Expansion

- Delivered cart, wishlist, order, and payment modules with supporting UX documentation.

Each phase includes completion criteria, implementation metrics, and follow-up recommendations in the underlying phase documents.

---

## 7. Current Status Assessment

### Engineering Status

- Backend architecture is production-structured and modular.
- Multi-portal frontend implementation is functionally complete.
- Core ecommerce domain and payment integration are implemented.

### Product Status

- Core customer journey (discover -> design -> purchase) is implemented.
- Admin and designer operations are supported through dedicated interfaces.
- UX documentation and accessibility evidence are mature for reporting/submission.

### Known Extension Opportunities

- Expand advanced product-detail and checkout presentation pages.
- Add deeper analytics/observability for operational reporting.
- Increase automated regression coverage for critical purchase and design workflows.

---

## 8. Risks and Mitigations

- **Risk**: 3D performance variance on low-end devices.  
  **Mitigation**: Model fallback handling, controlled scene complexity, and staged optimization.

- **Risk**: Payment flow reliability and webhook integrity.  
  **Mitigation**: Stripe signature verification and explicit backend payment services.

- **Risk**: UX complexity across multi-step journeys.  
  **Mitigation**: Iterative usability testing, accessibility audits, and documented UX refinements.

---

## 9. Recommendations and Next Steps

- Finalize secondary ecommerce pages and polish edge-case states.
- Add additional automated tests for checkout/payment and 3D design synchronization.
- Introduce performance dashboards and error monitoring for production operations.
- Continue accessibility verification as UI surfaces evolve.

---

## 10. Conclusion

RoomCraft Studio is delivered as a technically solid, user-centered platform with aligned architecture, multi-portal execution, and measurable UX improvements. The system is suitable for academic submission and can be advanced toward broader production readiness through focused hardening, observability, and test expansion.

