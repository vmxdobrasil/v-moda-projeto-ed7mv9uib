import pb from '@/lib/pocketbase/client'

export async function getFashionistaOrders() {
  return pb.send('/backend/v1/pickup/orders', { method: 'GET' })
}

export async function verifyPickupCode(code: string) {
  return pb.send('/backend/v1/pickup/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getOrderImageUrl(product: any): string {
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL
  if (product?.gallery) {
    return `${baseUrl}/api/files/${product.collectionId}/${product.id}/${product.gallery}?thumb=100x100`
  }
  if (product?.image) {
    return `${baseUrl}/api/files/${product.collectionId}/${product.id}/${product.image}?thumb=100x100`
  }
  return `https://img.usecurling.com/p/100/100?q=fashion`
}

export async function getSellerOrders(userId: string) {
  return pb.collection('orders').getFullList({
    sort: '-created',
    filter: `seller_id="${userId}"`,
    expand: 'customer',
  })
}

export async function getAllOrders() {
  return pb.collection('orders').getFullList({
    sort: '-created',
    expand: 'customer',
  })
}

export async function getOrderItems(orderId: string) {
  return pb.collection('order_items').getFullList({
    filter: `order_id="${orderId}"`,
    expand: 'project_id',
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  return pb.collection('orders').update(orderId, { status })
}
