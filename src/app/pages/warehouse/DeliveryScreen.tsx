import { getDelivery } from "./actions";
import { TruckloadClient } from "./TruckloadClient";

type DeliveryScreenProps = {
  deliveryId: string;
};

export async function DeliveryScreen({ deliveryId }: DeliveryScreenProps) {
  const delivery = await getDelivery(deliveryId);

  return <TruckloadClient delivery={delivery} />;
}