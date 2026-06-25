// API 呼び出し層。ここがクライアントとサーバーの境界。
// この fetch の行こそが「ブラウザ」と「サーバー」が別物で、HTTP で通信していることを表す。
// DOM やカートの状態には一切触れない（サーバーとの通信だけに責任を持つ）。

import { API_BASE_URL } from "./config.js";

// 商品一覧を取得する。
export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) {
    throw new Error(`商品の取得に失敗しました (HTTP ${res.status})`);
  }
  return res.json();
}

// 注文を作成する。失敗時はサーバーが返したエラーメッセージを投げる。
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
