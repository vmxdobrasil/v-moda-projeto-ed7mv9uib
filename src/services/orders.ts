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
