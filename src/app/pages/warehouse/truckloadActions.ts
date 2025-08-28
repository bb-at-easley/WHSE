"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";

export async function updateTruckload(deliveryId: string, data: {
  truckNumber?: string;
  trailerNumber?: string;
  sealNumber?: string;
  bolNumber?: string;
  easleyProNumber?: string;
  notes?: string;
  status?: "ACTIVE" | "COMPLETED" | "PAUSED";
}) {
  const { ctx } = requestInfo;
  
  if (!ctx.user) {
    throw new Error("User not authenticated");
  }

  const delivery = await db.delivery.update({
    where: { id: deliveryId },
    data: {
      truckNumber: data.truckNumber || null,
      trailerNumber: data.trailerNumber || null,
      sealNumber: data.sealNumber || null,
      bolNumber: data.bolNumber || null,
      easleyProNumber: data.easleyProNumber || null,
      notes: data.notes || null,
      status: data.status || "ACTIVE"
    },
    include: {
      pallets: true
    }
  });

  if (!delivery || delivery.userId !== ctx.user.id) {
    throw new Error("Truckload not found");
  }

  return delivery;
}