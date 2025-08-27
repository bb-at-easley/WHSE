-- Simplify User model - remove username, add fullName
-- This is a breaking change, so we'll recreate the user table

-- First, backup existing data
CREATE TABLE "User_backup" AS SELECT * FROM "User";

-- Drop the existing User table (this will cascade to related tables)
DROP TABLE "User";

-- Recreate User table with new schema
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recreate the test user with new schema
INSERT INTO "User" ("id", "fullName", "email", "passwordHash", "createdAt", "updatedAt")
VALUES (
    "test-user-id",
    "Test User", 
    "test@easleytransportation.com",
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);