-- Update User table to add missing columns
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Make email unique
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Drop the unique constraint on Credential userId (multiple credentials per user allowed)
DROP INDEX "Credential_userId_key";

-- CreateTable Organization
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Membership  
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex  
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");