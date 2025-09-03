import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";

export default defineScript(async ({ env }) => {
  await setupDb(env);

  // Clean existing data (cascade deletes will handle relationships)
  await db.membership.deleteMany();
  await db.organization.deleteMany();
  await db.user.deleteMany();

  // Create Easley Transportation organization
  const easleyOrg = await db.organization.create({
    data: {
      id: "easley-org-id",
      name: "Easley Transportation",
      slug: "easley",
      settings: null,
    },
  });

  // Create test user
  const testUser = await db.user.create({
    data: {
      id: "test-user-id",
      username: "testuser",
      email: "test@easleytransportation.com",
    },
  });

  // Create membership - make test user an OWNER of Easley org
  await db.membership.create({
    data: {
      userId: testUser.id,
      organizationId: easleyOrg.id,
      role: "OWNER",
    },
  });

  // Create some sample deliveries for testing multi-tenant access
  const delivery1 = await db.delivery.create({
    data: {
      organizationId: easleyOrg.id,
      userId: testUser.id,
      easleyProNumber: "PRO-001234",
      truckNumber: "TR-4471",
      trailerNumber: "TRL-8891",
      status: "ACTIVE",
      notes: "Sample active delivery"
    },
  });

  const delivery2 = await db.delivery.create({
    data: {
      organizationId: easleyOrg.id,
      userId: testUser.id,
      easleyProNumber: "PRO-001235",
      truckNumber: "TR-4472",
      status: "COMPLETED",
      notes: "Sample completed delivery"
    },
  });

  // Create some sample pallets for the deliveries
  await db.pallet.create({
    data: {
      deliveryId: delivery1.id,
      licensePlate: "123456",
      location: "A-01-1",
      status: "STORED",
      pieceCount: 25
    }
  });

  await db.pallet.create({
    data: {
      deliveryId: delivery1.id,
      licensePlate: "123457",
      location: null,
      status: "RECEIVED",
      pieceCount: 15
    }
  });

  await db.pallet.create({
    data: {
      deliveryId: delivery2.id,
      licensePlate: "123458",
      location: "B-02-3",
      status: "STORED",
      pieceCount: 30
    }
  });

  console.log("🌱 Finished seeding:");
  console.log(`   📦 Created organization: ${easleyOrg.name} (/${easleyOrg.slug})`);
  console.log(`   👤 Created user: ${testUser.username} as OWNER`);
  console.log(`   🚚 Created ${2} sample deliveries with ${3} pallets`);
});
