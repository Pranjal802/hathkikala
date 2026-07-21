import Product from '../models/Product.js';
import type { CartDocument } from '../models/Cart.js';

// The cart only stores productId + variantSku + a priceSnapshot (see Cart model).
// To actually render a cart page, the frontend needs live info too: current
// name/image/price/stock. This fetches all referenced products in ONE query
// and stitches everything together, rather than a query-per-item.
export async function toCartResponse(cart: CartDocument) {
  const productIds = [...new Set(cart.items.map((i) => i.productId.toString()))];
  const products = await Product.find({ _id: { $in: productIds } });
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;

  const items = cart.items.map((item) => {
    const product = productById.get(item.productId.toString());
    const variant = product?.variants.find((v) => v.sku === item.variantSku);

    // Product or variant may have been deleted/deactivated since it was added -
    // don't crash the whole cart response, just flag it so the FE can show
    // "no longer available" instead of stale/missing data.
    const isAvailable = Boolean(product?.isActive && variant?.isActive);
    const currentPrice = variant?.price ?? item.priceSnapshot;
    const priceChanged = currentPrice !== item.priceSnapshot;
    const availableStock = variant?.stockQty ?? 0;

    const lineTotal = item.priceSnapshot * item.quantity;
    subtotal += lineTotal;

    return {
      id: item._id?.toString(),
      productId: item.productId.toString(),
      productName: product?.name ?? 'Product no longer available',
      slug: product?.slug ?? null,
      thumbnail: product?.images[0]?.url ?? null,
      variantSku: item.variantSku,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      currentPrice,
      priceChanged,
      isAvailable,
      availableStock,
      lineTotal,
    };
  });

  return {
    id: cart._id.toString(),
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
  };
}
