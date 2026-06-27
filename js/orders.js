// 注文履歴ページの組み立てと起動
// 店舗ページ（main.js）・管理画面（admin.js）とは別の入口
// 確定済み注文を一覧し、各明細を「注文時点の単価」で表示する（A3 の論点を画面で確認できる）
// 通信は api.js、汎用の描画ヘルパ（yen / escapeHtml / setApiBase）は ui.js を再利用する

import { API_BASE_URL } from "./config.js";
import { fetchOrders } from "./api.js";
import { yen, escapeHtml, setApiBase } from "./ui.js";

// orders 固有の画面要素
const ordersEl = document.getElementById("orders");

setApiBase(API_BASE_URL);

// 注文ステータスを日本語ラベルにする
function statusLabel(status) {
  if (status === "Confirmed") return "確定";
  if (status === "Cancelled") return "キャンセル済み";
  return status;
}

// 注文日時を読みやすい文字列にする
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP");
}

// 1 注文の明細表を組み立てる
function renderItems(items) {
  const rows = items
    .map(
      (i) => `
        <tr>
          <td>${escapeHtml(i.productName)}</td>
          <td class="num">${yen(i.unitPrice)}</td>
          <td class="num">× ${i.quantity}</td>
          <td class="num">${yen(i.lineTotal)}</td>
        </tr>`
    )
    .join("");

  return `
    <table class="order-items">
      <thead>
        <tr><th>商品</th><th class="num">注文時単価</th><th class="num">数量</th><th class="num">小計</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// 注文一覧を描画する
function renderOrders(orders) {
  if (orders.length === 0) {
    ordersEl.innerHTML = `<p class="empty">注文がまだありません。</p>`;
    return;
  }

  ordersEl.innerHTML = "";
  for (const order of orders) {
    const card = document.createElement("div");
    card.className = "card";

    const couponLine = order.couponCode
      ? `<div class="muted">クーポン: <code>${escapeHtml(order.couponCode)}</code></div>`
      : "";

    card.innerHTML = `
      <div class="order-head">
        <div>
          <strong>注文 #${order.id}</strong>
          <span class="badge badge-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
        </div>
        <div class="muted">${escapeHtml(formatDate(order.createdAt))}</div>
      </div>
      ${renderItems(order.items)}
      ${couponLine}
      <div class="total">お支払い金額（税込）: ${yen(order.totalAmount)}</div>
    `;

    ordersEl.appendChild(card);
  }
}

// 注文履歴を読み込んで描画する
async function loadOrders() {
  try {
    const orders = await fetchOrders();
    renderOrders(orders);
  } catch (err) {
    ordersEl.innerHTML = `<div class="message error">${escapeHtml(err.message)}\nサーバーが起動しているか、config.js の API_BASE_URL を確認してください。</div>`;
  }
}

// ---- 起動 ----
loadOrders();
