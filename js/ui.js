// 描画（DOM 操作）層。
// 画面要素を取得し、データを受け取って HTML を組み立てるだけ。
// 通信（api.js）やカートの状態（cart.js）には依存しない。
// ボタンが押されたときの処理は、呼び出し側から「ハンドラ」として渡してもらう。

// ---- 画面要素 ----
const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cart");
const cartTotalEl = document.getElementById("cart-total");
const checkoutEl = document.getElementById("checkout");
const resultEl = document.getElementById("result");
const apiBaseEl = document.getElementById("api-base");

// 金額を ¥1,234 の形式に整える。
export function yen(value) {
  return `¥${Number(value).toLocaleString("ja-JP")}`;
}

// HTML に値を埋め込む前のエスケープ（XSS 対策）。
export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// 接続先サーバーの URL を画面に表示する。
export function setApiBase(url) {
  apiBaseEl.textContent = url;
}

// 商品一覧を描画する。onAdd(product) は「カートに追加」ボタンの押下処理。
export function renderProducts(products, onAdd) {
  if (products.length === 0) {
    productsEl.innerHTML = `<p class="empty">商品がありません。</p>`;
    return;
  }

  productsEl.innerHTML = "";
  for (const product of products) {
    const soldOut = product.stock <= 0;
    const card = document.createElement("div");
    card.className = "card product";
    card.innerHTML = `
      <div>
        <div>${escapeHtml(product.name)}</div>
        <div class="muted">${yen(product.price)}（税抜） / 在庫 ${product.stock}</div>
      </div>
    `;

    const button = document.createElement("button");
    button.textContent = soldOut ? "在庫切れ" : "カートに追加";
    button.disabled = soldOut;
    button.addEventListener("click", () => onAdd(product));

    card.appendChild(button);
    productsEl.appendChild(card);
  }
}

// 商品一覧の取得に失敗したときの表示。
export function showProductsError(message) {
  productsEl.innerHTML = `<div class="message error">${escapeHtml(message)}\nサーバーが起動しているか、config.js の API_BASE_URL を確認してください。</div>`;
}

// カートを描画する。onRemove(productId) は「削除」ボタンの押下処理。
export function renderCart(items, subtotal, onRemove) {
  resultEl.innerHTML = "";

  if (items.length === 0) {
    cartEl.innerHTML = `<p class="empty">カートは空です。</p>`;
    cartTotalEl.textContent = "";
    checkoutEl.style.display = "none";
    return;
  }

  cartEl.innerHTML = "";
  for (const { product, quantity } of items) {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>${escapeHtml(product.name)} <span class="muted">× ${quantity}</span></div>
    `;

    const right = document.createElement("div");
    right.innerHTML = `<span style="margin-right:.5rem;">${yen(product.price * quantity)}</span>`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "削除";
    removeBtn.addEventListener("click", () => onRemove(product.id));
    right.appendChild(removeBtn);

    row.appendChild(right);
    cartEl.appendChild(row);
  }

  // 税抜小計の目安。確定金額（税込・クーポン適用後）はサーバーが計算して返す。
  cartTotalEl.textContent = `税抜小計（目安）: ${yen(subtotal)}`;
  checkoutEl.style.display = "block";
}

// 注文結果などのメッセージを表示する。
export function showMessage(text, type) {
  resultEl.innerHTML = "";
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  resultEl.appendChild(div);
}
