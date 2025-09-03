"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";

export async function createDelivery(truckNumber?: string) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }
  
  if (!ctx.organization) {
    throw new Error("Organization context required");
  }

  const delivery = await db.delivery.create({
    data: {
      truckNumber,
      userId: ctx.user.id,
      organizationId: ctx.organization.id,
    },
    include: {
      pallets: true
    }
  });

  return delivery;
}

export async function addPallet(deliveryId: string, licensePlate: string, orgSlug: string, location?: string, pieceData?: {
  partNumber?: string;
  partDescription?: string;
  pieceCount?: number;
}) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    return { error: "User not authenticated" };
  }
  
  // Load organization context in server function
  const { loadOrganizationContext } = await import("@/worker");
  const orgResult = await loadOrganizationContext(orgSlug, ctx);
  if (orgResult) {
    return { error: "Organization not found or access denied" };
  }
  
  console.log("CTX with org context:", ctx);
  
  if (!ctx.organization) {
    return { error: "Organization context required" };
  }

  // Check if LP already exists within this organization (only if LP is provided and not empty)
  if (licensePlate && licensePlate.trim()) {
    const existingPallet = await db.pallet.findFirst({
      where: { 
        licensePlate: licensePlate.trim(),
        delivery: {
          organizationId: ctx.organization?.id
        }
      },
      include: { delivery: true }
    });

    if (existingPallet) {
      return { error: `License Plate ${licensePlate} already exists in delivery ${existingPallet.delivery?.easleyProNumber || existingPallet.deliveryId}` };
    }
  }

  // Determine status based on whether location is provided
  const status = location ? "STORED" : "RECEIVED";

  const pallet = await db.pallet.create({
    data: {
      licensePlate: licensePlate && licensePlate.trim() ? licensePlate.trim() : null, // Allow null LP, trim if provided
      deliveryId,
      location: location && location.trim() ? location.trim() : null,
      status,
      pieceCount: pieceData?.pieceCount
    }
  });

  // Create Piece record if part info is provided
  if (pieceData?.partNumber && pieceData?.partDescription) {
    await db.piece.create({
      data: {
        palletId: pallet.id,
        partNumber: pieceData.partNumber,
        description: pieceData.partDescription,
        quantity: pieceData.pieceCount
      }
    });
  }

  return pallet;
}

export async function updateDeliveryStatus(deliveryId: string, status: "ACTIVE" | "COMPLETED" | "PAUSED") {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }
  
  if (!ctx.organization) {
    throw new Error("Organization context required");
  }

  // First verify the delivery belongs to this organization
  const existingDelivery = await db.delivery.findUnique({
    where: { id: deliveryId },
    select: { organizationId: true }
  });
  
  if (!existingDelivery || existingDelivery.organizationId !== ctx.organization.id) {
    throw new Error("Delivery not found");
  }

  const delivery = await db.delivery.update({
    where: { id: deliveryId },
    data: { status },
    include: {
      pallets: true
    }
  });

  return delivery;
}

export async function getAllDeliveries() {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }
  
  if (!ctx.organization) {
    throw new Error("Organization context required");
  }

  // Get all deliveries for this organization from last 30 days, active first
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deliveries = await db.delivery.findMany({
    where: { 
      organizationId: ctx.organization.id,
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    include: {
      pallets: true
    },
    orderBy: [
      { status: "asc" }, // ACTIVE comes before COMPLETED
      { createdAt: "desc" }
    ]
  });

  return deliveries;
}

// Keep the old function for backwards compatibility
export async function getActiveDeliveries() {
  const all = await getAllDeliveries();
  return all.filter(d => d.status === "ACTIVE");
}

export async function getDelivery(deliveryId: string) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }
  
  if (!ctx.organization) {
    throw new Error("Organization context required");
  }

  const delivery = await db.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      pallets: {
        orderBy: {
          scannedAt: "desc"
        },
        include: {
          pieces: {
            select: {
              partNumber: true,
              description: true
            }
          }
        }
      }
    }
  });

  if (!delivery || delivery.organizationId !== ctx.organization.id) {
    throw new Error("Delivery not found");
  }

  return delivery;
}

export async function updatePallet(palletId: string, orgSlug: string, data: {
  licensePlate: string;
  location?: string;
  partNumber?: string;
  partDescription?: string;
  pieceCount?: number;
}) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    return { error: "User not authenticated" };
  }
  
  // Load organization context in server function
  const { loadOrganizationContext } = await import("@/worker");
  const orgResult = await loadOrganizationContext(orgSlug, ctx);
  if (orgResult) {
    return { error: "Organization not found or access denied" };
  }
  
  if (!ctx.organization) {
    return { error: "Organization context required" };
  }

  // Check if LP already exists on a different pallet within this organization (only if LP is provided and not empty)
  if (data.licensePlate && data.licensePlate.trim()) {
    const existingPallet = await db.pallet.findFirst({
      where: { 
        licensePlate: data.licensePlate.trim(),
        NOT: { id: palletId }, // Exclude current pallet
        delivery: {
          organizationId: ctx.organization?.id
        }
      },
      include: { delivery: true }
    });

    if (existingPallet) {
      return { error: `License Plate ${data.licensePlate} already exists in delivery ${existingPallet.delivery?.easleyProNumber || existingPallet.deliveryId}` };
    }
  }

  // Update pallet
  const status = data.location ? "STORED" : "RECEIVED";
  
  const pallet = await db.pallet.update({
    where: { id: palletId },
    data: {
      licensePlate: data.licensePlate && data.licensePlate.trim() ? data.licensePlate.trim() : null, // Allow null LP, trim if provided
      location: data.location && data.location.trim() ? data.location.trim() : null,
      status,
      pieceCount: data.pieceCount || null
    }
  });

  // Update or create piece record
  if (data.partNumber && data.partDescription) {
    // Try to update existing piece first
    const existingPiece = await db.piece.findFirst({
      where: { palletId }
    });

    if (existingPiece) {
      await db.piece.update({
        where: { id: existingPiece.id },
        data: {
          partNumber: data.partNumber,
          description: data.partDescription,
          quantity: data.pieceCount
        }
      });
    } else {
      await db.piece.create({
        data: {
          palletId,
          partNumber: data.partNumber,
          description: data.partDescription,
          quantity: data.pieceCount
        }
      });
    }
  }

  return pallet;
}