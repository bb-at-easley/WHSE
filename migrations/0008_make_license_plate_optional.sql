-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licensePlate" TEXT,
    "deliveryId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "location" TEXT,
    "pieceCount" INTEGER,
    "notes" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pallet_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pallet" ("deliveryId", "id", "licensePlate", "location", "notes", "pieceCount", "scannedAt", "status") SELECT "deliveryId", "id", "licensePlate", "location", "notes", "pieceCount", "scannedAt", "status" FROM "Pallet";
DROP TABLE "Pallet";
ALTER TABLE "new_Pallet" RENAME TO "Pallet";
CREATE INDEX "Pallet_deliveryId_idx" ON "Pallet"("deliveryId");
CREATE INDEX "Pallet_licensePlate_idx" ON "Pallet"("licensePlate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
