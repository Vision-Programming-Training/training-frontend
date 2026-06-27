// API 呼び出し層（クライアントとサーバーの境界）
// この fetch の行こそが「ブラウザ」と「サーバー」が別物で、HTTP で通信していることを表す
// DOM やカートの状態には一切触れない（サーバーとの通信だけに責任を持つ）

import { API_BASE_URL } from "./config.js";

// 商品一覧を取得する
export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) {
    throw new Error(`商品の取得に失敗しました (HTTP ${res.status})`);
  }
  return res.json();
}

// 利用できるクーポン一覧を取得する
export async function fetchCoupons() {
  const res = await fetch(`${API_BASE_URL}/api/coupons`);
  if (!res.ok) {
    throw new Error(`クーポンの取得に失敗しました (HTTP ${res.status})`);
  }
  return res.json();
}

// 注文一覧を取得する（明細・商品名・注文時点の単価込み）
export async function fetchOrders() {
  const res = await fetch(`${API_BASE_URL}/api/orders`);
  if (!res.ok) {
    throw new Error(`注文履歴の取得に失敗しました (HTTP ${res.status})`);
  }
  return res.json();
}

// 商品の価格を変更する（管理者用。失敗時はサーバーが返したエラーメッセージを投げる）
export async function updateProductPrice(productId, price) {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/price`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && data.error ? data.error : `価格の変更に失敗しました (HTTP ${res.status})`;
    throw new Error(message);
  }
  return data;
}

// 注文を作成する（失敗時はサーバーが返したエラーメッセージを投げる）
export async function postOrder(items, couponCode) {
  const body = { items };
  if (couponCode) {
    body.couponCode = couponCode;
  }

  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && data.error ? data.error : `注文に失敗しました (HTTP ${res.status})`;
    throw new Error(message);
  }
  return data;
}
