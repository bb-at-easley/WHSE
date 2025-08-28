"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";

export async function createDelivery(truckNumber?: string) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }

  const delivery = await db.delivery.create({
    data: {
      truckNumber,
      userId: ctx.user.id,
    },
    include: {
      pallets: true
    }
  });

  return delivery;
}

export async function addPallet(deliveryId: string, licensePlate: string, location?: string, pieceData?: {
  partNumber?: string;
  partDescription?: string;
  pieceCount?: number;
}) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }

  // Check if LP already exists
  const existingPallet = await db.pallet.findFirst({
    where: { licensePlate }
  });

  if (existingPallet) {
    throw new Error(`License Plate ${licensePlate} already exists`);
  }

  // Determine status based on whether location is provided
  const status = location ? "STORED" : "RECEIVED";

  const pallet = await db.pallet.create({
    data: {
      licensePlate,
      deliveryId,
      location,
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

  // Get all deliveries from last 30 days, active first
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deliveries = await db.delivery.findMany({
    where: { 
      userId: ctx.user.id,
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

  if (!delivery || delivery.userId !== ctx.user.id) {
    throw new Error("Delivery not found");
  }

  return delivery;
}