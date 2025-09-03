import { getDelivery } from "./actions";
import { TruckloadClient } from "./TruckloadClient";

type DeliveryScreenProps = {
  deliveryId: string;
  orgSlug: string;
};

export async function DeliveryScreen({
  deliveryId,
  orgSlug,
}: DeliveryScreenProps) {
  console.log("=== DELIVERY SCREEN DEBUG ===");
  console.log("deliveryId:", deliveryId);
  console.log("orgSlug:", orgSlug);

  const delivery = await getDelivery(deliveryId);
  console.log("Fetched delivery:", delivery);
  // Ensure licensePlate is always a string
  const safeDelivery = {
    ...delivery,
    pallets: delivery.pallets.map((pallet) => ({
      ...pallet,
      licensePlate: pallet.licensePlate ?? "",
    })),
  };

  return <TruckloadClient delivery={safeDelivery} orgSlug={orgSlug} />;
}
