// カートの状態管理
// productId をキーに { product, quantity } を持つだけの、画面にも通信にも依存しない純粋なロジック
// DOM（document）も fetch も出てこないのがポイント

const items = new Map();

// カートの中身を配列で返す（描画側が回しやすいように）
export function getCartItems() {
  return [...items.values()];
}

// カートに入っている商品の種類数
export function getCartSize() {
  return items.size;
}

// 税抜小計の目安（確定金額は税込・クーポン適用後でサーバーが計算する）
export function getSubtotal() {
  let subtotal = 0;
  for (const { product, quantity } of items.values()) {
    subtotal += product.price * quantity;
  }
  return subtotal;
}

// 商品を 1 つ追加する（在庫を超える場合は追加せず false を返す）
export function addToCart(product) {
  const entry = items.get(product.id);
  const currentQty = entry ? entry.quantity : 0;

  if (currentQty + 1 > product.stock) {
    return false;
  }

  items.set(product.id, { product, quantity: currentQty + 1 });
  return true;
}

// 指定した商品をカートから取り除く
export function removeFromCart(productId) {
  items.delete(productId);
}

// カートを空にする
export function clearCart() {
  items.clear();
}
