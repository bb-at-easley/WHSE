import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";

export default defineScript(async ({ env }) => {
  await setupDb(env);

  // Clean existing data
  await db.$executeRawUnsafe(`\
    DELETE FROM Membership;
    DELETE FROM Organization;
    DELETE FROM User;
    DELETE FROM sqlite_sequence;
  `);

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

  console.log("🌱 Finished seeding:");
  console.log(`   📦 Created organization: ${easleyOrg.name} (/${easleyOrg.slug})`);
  console.log(`   👤 Created user: ${testUser.username} as OWNER`);
});
