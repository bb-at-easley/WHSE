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

  console.log("🌱 Finished seeding:");
  console.log(`   📦 Created organization: ${easleyOrg.name} (/${easleyOrg.slug})`);
  console.log(`   👤 Created user: ${testUser.username} as OWNER`);
});
