# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Preferred Working Style

The user prefers small, conversational interactions rather than large sweeping code changes. Engage in dialog, ask clarifying questions, and make incremental changes after discussion. Break down complex tasks into smaller steps and confirm approaches before implementation.

## Project Overview

This is a RedwoodSDK (RWSDK) project - a TypeScript framework for building server-driven web applications on Cloudflare Workers with React Server Components, WebAuthn authentication, and Prisma ORM with D1 database.

## Key Architecture

### Entry Point and App Structure
- **Main worker**: `src/worker.tsx` - defines the entire application using `defineApp()`
- **Middleware stack**: Session management, database setup, and user authentication run on every request
- **Context flow**: `AppContext` type provides `session` and `user` throughout the request lifecycle
- **Document root**: `src/app/Document.tsx` - HTML shell for all pages

### Core Components
- **Database**: Prisma with D1 adapter (`src/db.ts`) - requires `setupDb(env)` before use
- **Sessions**: Durable Objects for session storage (`src/session/` directory)
- **Authentication**: WebAuthn passkey-based auth (`src/app/pages/user/functions.ts`)
- **Routing**: File-based routing with co-located routes (e.g., `src/app/pages/user/routes.ts`)

### RedwoodSDK Patterns
- **Server Components**: Default for all React components unless marked with `"use client"`
- **Server Functions**: Functions marked with `"use server"` can be called from client components
- **Interruptors**: Middleware functions that run before route handlers (see `.cursor/rules/rwsdk_rwsdk-interruptors.mdc`)
- **Context Access**: Use `requestInfo.ctx` in server functions to access session/user data

## Development Commands

```bash
# Development
pnpm run dev              # Start Vite dev server
pnpm run dev:init         # Initialize development environment
pnpm run worker:run       # Run worker script

# Building & Deployment
pnpm run build            # Build for production
pnpm run release          # Full deploy pipeline (clean, generate, build, deploy)
pnpm run preview          # Preview production build

# Database
pnpm run migrate:dev      # Apply migrations locally
pnpm run migrate:prd      # Apply migrations to production
pnpm run migrate:new      # Create new migration
pnpm run seed             # Run database seed script

# Code Quality
pnpm run generate         # Generate Prisma client and Wrangler types
pnpm run check            # Run generate + types check
pnpm run types            # TypeScript type checking only
```

## Database Schema

The Prisma schema includes:
- **User** model: UUID-based users with username
- **Credential** model: WebAuthn credentials linked to users
- Generated client outputs to `generated/prisma/`

## Configuration Requirements

Before deployment, update `wrangler.jsonc`:
- Replace all `__change_me__` placeholders
- Set up D1 database binding with proper database ID
- Configure `WEBAUTHN_APP_NAME` environment variable

## Code Organization Principles

### Component Structure
- Server components (default) for data fetching and initial rendering
- Client components (`"use client"`) only when interactivity is needed
- Server functions (`"use server"`) for server-side operations from client components

### Route Organization
- Co-locate related routes in `src/app/pages/<section>/routes.ts`
- Import route arrays into main worker with `prefix()` function
- Use interruptors for authentication, validation, and middleware logic

### TypeScript Paths
- `@/*` maps to `src/*`
- `@generated/*` maps to `generated/*`
- Custom type definitions in `types/` directory

## Authentication Flow

WebAuthn passkey authentication with these key functions:
- `startPasskeyRegistration()` / `finishPasskeyRegistration()`
- `startPasskeyLogin()` / `finishPasskeyLogin()`
- Session management through Durable Objects
- Automatic session loading and user population in middleware

## Cursor Rules Integration

This project includes RedwoodSDK-specific Cursor rules in `.cursor/rules/`:
- **Interruptors**: Middleware patterns and validation chains
- **React**: Server/client component guidelines and data fetching
- **Request/Response**: Route handler patterns and error handling
- **Middleware**: Common headers, CORS, and request processing

Follow these patterns when implementing new features or routes.

## Warehouse Management System

### Current Implementation Status
This project includes a warehouse inventory management system with mobile-first design:

**Live Routes:**
- **Home**: `/` - Project overview and navigation
- **Warehouse Dashboard**: `/warehouse/dashboard` - Active delivery management
- **Delivery Screen**: `/warehouse/delivery/:id` - Mobile-optimized pallet scanning interface

**Key Features Implemented:**
- Thumb-zone optimized mobile interface
- Real-time activity feed for pallet scanning
- Offline sync indicators
- Interactive scanning simulation with haptic feedback

### Design System
**Clean Mobile-First** - Minimal, functional design optimized for warehouse mobile use:

**Color Palette:**
- Base: Clean whites and light grays (#ffffff, #f8f9fa, #f5f5f5)
- Primary accent: Blue (#2196F3, #1976D2, #1565C0) for actions and links
- Success states: Green (#4CAF50, #e8f5e8) for completed actions
- Warning states: Orange (#FF9800) for staging/sync indicators
- Text: Dark grays (#333, #666) for readability

**Typography:**
- Primary: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- Weight hierarchy: Bold (600-700) for titles, normal (400) for body
- Size hierarchy: 20px titles, 16px status, 14px secondary

**Interaction Design:**
- Subtle hover lift effects (translateY(-2px))
- Quick transitions (0.2s)
- Rounded corners (8px-20px) for mobile-friendly touch targets
- Soft shadows for depth (0 4px 20px rgba(0,0,0,0.1))

**Design Principles:**
- Clean simplicity over visual complexity
- High contrast for warehouse lighting conditions
- Large touch targets optimized for thumb-zone interaction
- Mobile-first responsive design

**Mobile Interaction Guidelines:**
- **Primary actions always in thumb zone** (bottom 30% of screen)
- **Secondary actions** can be higher but avoid top 20% when possible
- **Information display** flows from top to middle, actions anchor at bottom
- **Scrolling content** fills middle area, actions stay accessible
- **One-handed operation** prioritized for warehouse mobility

### Architecture Approach
**Colocation Structure** - Following RWSDK best practices:
```
src/app/pages/warehouse/
├── routes.ts              # Route definitions
├── DeliveryScreen.html    # HTML prototype (to convert to React)
└── [future components]    # React components, hooks, utilities
```

**Design Artifacts** - Comprehensive mockups in `design-artifacts/`:
- Style guides: Industrial comparisons and chosen Warm Nordic system
- Delivery screen variations with thumb-zone optimization analysis
- Dashboard layouts for active delivery management
- Find freight interfaces with multi-search capability
- Location scanning confirmation flows
- Warehouse map visualizations with location highlighting
- Interactive style guide with live color palette and components

### Next Development Priorities
1. **Database Schema**: Models for deliveries, pallets, locations
2. **React Conversion**: Transform HTML prototypes to proper React components
3. **Offline Sync**: IndexedDB + queue system for poor connectivity
4. **Barcode Integration**: Camera access and scanning functionality
5. **Real-time Collaboration**: Multi-worker scanning coordination

### Development Guidelines

**Current Editing:**
- Delivery screen HTML template: Edit `DeliveryScreenHTML()` function in `src/app/pages/warehouse/routes.ts`
- Dashboard/Home: Edit HTML strings in respective route handlers
- Style changes: Modify CSS within the template strings

**React Conversion Timing:**
Convert to React when you need:
1. **Real data integration** (database queries, form submissions)
2. **Complex interactivity** (barcode scanning, real-time updates)
3. **State management** (offline sync, multi-user coordination)
4. **Component reuse** (when HTML templates become repetitive)

**Addon vs Colocation Decision Framework:**

**Create as ADDON when:**
- Reusable across multiple warehouse projects
- Generic functionality (barcode scanning, offline sync utilities)
- No business logic dependencies
- Examples: `@rwsdk/barcode-scanner`, `@rwsdk/offline-sync`, `@rwsdk/mobile-ui`

**Keep in APP (colocated) when:**
- Specific to this warehouse's business logic
- Tightly coupled to your data models
- Custom workflow requirements
- Examples: Delivery management, location mapping, inventory rules

**Colocation Structure Benefits:**
- Related code stays together (`routes.ts` + components + hooks + types)
- Easy to find and modify warehouse-specific features
- Clear ownership and dependencies
- Following RWSDK best practices for maintainability

**Current Architecture Decision:**
- Core warehouse logic → APP (colocated in `src/app/pages/warehouse/`)
- Reusable mobile patterns → Future ADDON consideration
- Barcode scanning → ADDON (placeholder created at `addons/barcode-scanner/`)
- Offline sync utilities → ADDON (placeholder created at `addons/offline-sync/`)

**Addon Integration Pattern:**
Current placeholder imports in `routes.ts`:
```typescript
// PLACEHOLDER imports - these will be actual npm packages when addons are published
import { BarcodeScanner } from "../../../addons/barcode-scanner/index";
import { OfflineSync } from "../../../addons/offline-sync/index";
```

Future production imports:
```typescript
import { BarcodeScanner } from "@rwsdk/barcode-scanner";
import { OfflineSync } from "@rwsdk/offline-sync";
```

**Addon APIs Designed:**
- `BarcodeScanner.scan(options)` - Single scan with camera
- `OfflineSync.queueOperation(operation)` - Queue for sync when online
- React hooks: `useBarcodeScanner()`, `useOfflineSync()`
- UI components following Warm Nordic design system

### Usage Notes
- All warehouse features use the clean mobile-first design system
- Mobile interface prioritizes thumb-zone accessibility with sticky bottom actions
- HTML prototypes include detailed React conversion notes
- Offline-first design for warehouse connectivity challenges