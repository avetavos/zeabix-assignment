export interface OrderMessage {
  id: string;
  type: 'OrderPlaced';
  aggregateId: string;
  payload: string;
  createdAt: number;
  traceId: string;
}

export interface OrderItem {
  sku: string;
  qty: number;
}
