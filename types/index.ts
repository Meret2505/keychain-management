export type KeychainType = "GH" | "2G" | "Coupled" | "Square";
export type DeliveryType = "to deliver" | "comes and takes";
export type OrderStatus = "critical" | "normal" | "done";

export interface Order {
  id: string;
  group_id: string;
  date_accepted: string;
  date_delivery: string;
  customer_name: string;
  order_source: string;
  phrase: string;
  keychain_type: KeychainType;
  address: string;
  delivery_type: DeliveryType;
  amount: number;
  status: OrderStatus;
  accepted: boolean;
  done: boolean;
  created_at: string;
}

export interface OrderGroup {
  id: string;
  name: string;
  created_at: string;
  orders?: Order[];
}
