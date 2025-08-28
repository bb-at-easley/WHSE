-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN "easleyProNumber" TEXT;
ALTER TABLE "Delivery" ADD COLUMN "notes" TEXT;
ALTER TABLE "Delivery" ADD COLUMN "sealNumber" TEXT;
ALTER TABLE "Delivery" ADD COLUMN "trailerNumber" TEXT;

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "palletId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "poNumber" TEXT,
    "quantity" INTEGER,
    "barcode" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Piece_palletId_fkey" FOREIGN KEY ("palletId") REFERENCES "Pallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licensePlate" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "location" TEXT,
    "pieceCount" INTEGER,
    "notes" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pallet_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pallet" ("deliveryId", "id", "licensePlate", "location", "scannedAt", "status") SELECT "deliveryId", "id", "palletId", "location", "scannedAt", "status" FROM "Pallet";
DROP TABLE "Pallet";
ALTER TABLE "new_Pallet" RENAME TO "Pallet";
CREATE INDEX "Pallet_deliveryId_idx" ON "Pallet"("deliveryId");
CREATE INDEX "Pallet_licensePlate_idx" ON "Pallet"("licensePlate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Piece_palletId_idx" ON "Piece"("palletId");

-- CreateIndex
CREATE INDEX "Piece_partNumber_idx" ON "Piece"("partNumber");

-- CreateIndex
CREATE INDEX "Delivery_createdAt_idx" ON "Delivery"("createdAt");
