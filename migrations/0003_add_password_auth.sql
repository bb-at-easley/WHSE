-- Add password authentication support
-- Make email required and add password hash field

-- Add passwordHash column to User table
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Update the existing user to have an email (for testing)
UPDATE "User" SET "email" = "test@easleytransportation.com" WHERE "id" = "test-user-id";

-- Email is already unique from previous migration, but now it's required for new users