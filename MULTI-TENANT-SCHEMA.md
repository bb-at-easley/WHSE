# Multi-Tenant Warehouse Management Schema

Based on the Linear Model approach for maximum flexibility and scalability.

## Core Architecture

### Tenant Isolation Strategy
- **Linear Model**: Add `organization_id` to every table except `User`
- **Compound Keys**: Use `(organization_id, id)` as primary keys
- **Query Scoping**: All queries MUST include `organization_id` filter
- **URL Structure**: Include org ID in all routes: `/org/{orgId}/warehouse/dashboard`

## Database Schema

### Core Models

```prisma
// Core tenant model - represents warehouses/companies
model Organization {
  id          String @id @default(cuid())
  name        String
  slug        String @unique // for URLs: /org/acme-warehouse
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  memberships Membership[]
  deliveries  Delivery[]
  locations   Location[]
  pallets     Pallet[]
}

// Individual users - can belong to multiple orgs
model User {
  id          String @id @default(cuid())
  username    String @unique
  email       String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  credentials  Credential[]
  memberships  Membership[]
}

// Junction table - users to organizations
model Membership {
  id             String @id @default(cuid())
  role           Role   @default(MEMBER)
  user_id        String
  organization_id String
  invited_by_id  String?
  createdAt      DateTime @default(now())
  
  // Relations
  user         User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  invitedBy    User? @relation("InvitedBy", fields: [invited_by_id], references: [id])
  
  @@unique([user_id, organization_id])
}

enum Role {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}
```

### Warehouse Domain Models

```prisma
// All warehouse models include organization_id for tenant isolation

model Delivery {
  id              String @id @default(cuid())
  organization_id String
  delivery_number String
  truck_number    String?
  status          DeliveryStatus @default(ACTIVE)
  expected_pallets Int?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  pallets      Pallet[]
  
  @@unique([organization_id, delivery_number])
}

model Pallet {
  id              String @id @default(cuid())
  organization_id String
  pallet_id       String // External pallet identifier (PAL-001234)
  delivery_id     String
  location_id     String?
  status          PalletStatus @default(STAGED)
  scanned_at      DateTime @default(now())
  stored_at       DateTime?
  
  // Relations
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  delivery     Delivery @relation(fields: [delivery_id], references: [id], onDelete: Cascade)
  location     Location? @relation(fields: [location_id], references: [id])
  
  @@unique([organization_id, pallet_id])
}

model Location {
  id              String @id @default(cuid())
  organization_id String
  zone            String // A, B, C
  aisle           String // 01, 02, 03
  position        String // 1, 2, 3
  is_active       Boolean @default(true)
  
  // Relations
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  pallets      Pallet[]
  
  @@unique([organization_id, zone, aisle, position])
}

enum DeliveryStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum PalletStatus {
  STAGED
  STORED
  PICKED
  SHIPPED
}
```

## Implementation Guidelines

### 1. Authentication & Session Management

```typescript
// Session should track both user and active organization
interface AppContext {
  session: Session | null;
  user: User | null;
  organization: Organization | null; // Currently active org
  membership: Membership | null;     // User's role in active org
}

// Store in session:
interface SessionData {
  userId: string;
  activeOrgId: string;
  accessibleOrgs: string[]; // All orgs user belongs to
}
```

### 2. Route Structure

```typescript
// All warehouse routes MUST include organization slug
export const warehouseRoutes = [
  route("/org/:orgSlug/dashboard", DashboardScreen),
  route("/org/:orgSlug/delivery/:id", DeliveryScreen),
  route("/org/:orgSlug/receiving/new", NewReceivingScreen),
  route("/org/:orgSlug/locations", LocationScreen),
];

// Middleware to load organization and verify membership
async function orgMiddleware({ params, ctx }) {
  const org = await db.organization.findUnique({
    where: { slug: params.orgSlug }
  });
  
  if (!org || !ctx.user) {
    return new Response(null, { status: 404 });
  }
  
  const membership = await db.membership.findUnique({
    where: { 
      user_id_organization_id: {
        user_id: ctx.user.id,
        organization_id: org.id
      }
    }
  });
  
  if (!membership) {
    return new Response(null, { status: 403 });
  }
  
  ctx.organization = org;
  ctx.membership = membership;
}
```

### 3. Database Query Patterns

```typescript
// ALWAYS scope queries by organization_id
async function getActiveDeliveries(organizationId: string) {
  return db.delivery.findMany({
    where: { 
      organization_id: organizationId,
      status: 'ACTIVE' 
    },
    include: { pallets: true }
  });
}

// Server function example
"use server";
export async function addPallet(formData: FormData) {
  const { ctx } = requestInfo;
  
  // Verify organization access
  if (!ctx.organization) {
    throw new Error("No organization context");
  }
  
  return db.pallet.create({
    data: {
      organization_id: ctx.organization.id, // ALWAYS include
      pallet_id: formData.get("palletId"),
      delivery_id: formData.get("deliveryId"),
      // ... other fields
    }
  });
}
```

### 4. Permission System

```typescript
enum Permission {
  VIEW_DELIVERIES = "view:deliveries",
  MANAGE_DELIVERIES = "manage:deliveries",
  MANAGE_LOCATIONS = "manage:locations",
  MANAGE_USERS = "manage:users",
  ADMIN_SETTINGS = "admin:settings"
}

const ROLE_PERMISSIONS = {
  VIEWER: [Permission.VIEW_DELIVERIES],
  MEMBER: [Permission.VIEW_DELIVERIES, Permission.MANAGE_DELIVERIES],
  MANAGER: [Permission.VIEW_DELIVERIES, Permission.MANAGE_DELIVERIES, Permission.MANAGE_LOCATIONS],
  ADMIN: [Permission.VIEW_DELIVERIES, Permission.MANAGE_DELIVERIES, Permission.MANAGE_LOCATIONS, Permission.MANAGE_USERS],
  OWNER: Object.values(Permission) // All permissions
};

function hasPermission(membership: Membership, permission: Permission): boolean {
  return ROLE_PERMISSIONS[membership.role].includes(permission);
}
```

### 5. Organization Switching

```typescript
// Allow users to switch between organizations they belong to
route("/switch-org/:orgSlug", async ({ params, ctx }) => {
  const membership = await db.membership.findUnique({
    where: {
      user_id_organization_id: {
        user_id: ctx.user.id,
        organization_id: params.orgId
      }
    }
  });
  
  if (!membership) {
    return new Response(null, { status: 403 });
  }
  
  // Update session
  await sessions.update(ctx.session.id, {
    activeOrgId: params.orgId
  });
  
  return new Response(null, {
    status: 302,
    headers: { Location: `/org/${params.orgSlug}/dashboard` }
  });
});
```

## Migration Strategy

### Phase 1: Single Organization
- Start with one default organization for your warehouse
- All existing functionality works unchanged
- Add organization_id to all new tables

### Phase 2: Multi-Organization Support  
- Add organization switching UI
- Implement invitation system
- Update all existing queries to include organization_id

### Phase 3: Full Multi-Tenancy
- Custom domains per organization
- Organization-specific settings
- Advanced permission system

## Security Considerations

1. **Row Level Security**: Every query MUST include organization_id filter
2. **URL Tampering**: Always verify user has access to organization in URL
3. **Session Security**: Store minimal data in sessions, verify on each request
4. **Audit Logging**: Track which user performed which action in which organization

## Benefits of This Approach

- **Scalable**: Can handle thousands of organizations
- **Flexible**: Users can belong to multiple warehouses
- **Secure**: Complete data isolation between tenants
- **Future-Proof**: Easy to add features like organization settings, billing, etc.
- **Developer Friendly**: Clear patterns for all database operations