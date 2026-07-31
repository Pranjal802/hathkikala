import type { OrderDocument } from '../models/Order.js';

function attributesToPlainObject(attributes: Map<string, string> | Record<string, string>) {
  return attributes instanceof Map ? Object.fromEntries(attributes) : attributes;
}

// Orders are frozen snapshots (see Order model comments) - unlike Cart, we
// don't need to fetch live product data here at all, everything needed to
// display the order is already stored on the order itself.
export function toOrderResponse(order: OrderDocument) {
  return {
    id: order._id.toString(),
    userId: order.userId ? order.userId.toString() : null,
    status: order.status,
    trackingNumber: order.trackingNumber ?? null,
    courierName: order.courierName ?? null,
    trackingUrl: order.trackingUrl ?? null,
    customizationNotes: order.customizationNotes ?? null,
    cancelReason: order.cancelReason ?? null,
    staffNotes: order.staffNotes ?? [],
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      productName: item.productName,
      variantSku: item.variantSku,
      variantAttributes: attributesToPlainObject(item.variantAttributes),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
    shippingAddress: order.shippingAddress,
    payment: {
      provider: order.payment.provider,
      providerOrderId: order.payment.providerOrderId ?? null,
      providerPaymentId: order.payment.providerPaymentId ?? null,
      status: order.payment.status,
      amount: order.payment.amount,
      currency: order.payment.currency,
      paidAt: order.payment.paidAt ?? null,
    },
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    totalAmount: order.totalAmount,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
