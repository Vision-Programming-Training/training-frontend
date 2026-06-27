// 管理画面の組み立てと起動
// 店舗ページ（main.js）とは別の入口。商品マスタ（価格・在庫）を参照し、価格を変更する
// 通信は api.js、汎用の描画ヘルパ（yen / escapeHtml / setApiBase）は ui.js を再利用する

import { API_BASE_URL } from "./config.js";
import { fetchProducts, updateProductPrice } from "./api.js";
import { yen, escapeHtml, setApiBase } from "./ui.js";

// admin 固有の画面要素
const productsEl = document.getElementById("admin-products");
const resultEl = document.getElementById("admin-result");

setApiBase(API_BASE_URL);

// 結果メッセージ（成功・失敗）を表示する
function showMessage(text, type) {
  resultEl.innerHTML = "";
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  resultEl.appendChild(div);
}

// 商品マスタ一覧を描画する（各行に価格の編集欄と更新ボタンを置く）
function renderProducts(products) {
  if (products.length === 0) {
    productsEl.innerHTML = `<p class="empty">商品がありません。</p>`;
    return;
  }

  productsEl.innerHTML = "";
  for (const product of products) {
    const card = document.createElement("div");
    card.className = "card product";

    const info = document.createElement("div");
    info.innerHTML = `
      <div>${escapeHtml(product.name)} <span class="muted">(ID: ${product.id})</span></div>
      <div class="muted">現在価格 ${yen(product.price)}（税抜） / 在庫 ${product.stock}</div>
    `;

    const controls = document.createElement("div");
    controls.className = "admin-controls";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = product.price;
    input.setAttribute("aria-label", `${product.name} の新しい価格`);

    const button = document.createElement("button");
    button.className = "primary";
    button.textContent = "価格を更新";
    button.addEventListener("click", () => savePrice(product, input.value, button));

    controls.appendChild(input);
    controls.appendChild(button);

    card.appendChild(info);
    card.appendChild(controls);
    productsEl.appendChild(card);
  }
}

// 1 商品の価格を更新する
async function savePrice(product, rawValue, button) {
  const price = Number(rawValue);
  if (!Number.isFinite(price) || price < 0) {
    showMessage("価格は 0 以上の数値で入力してください。", "error");
    return;
  }

  button.disabled = true;
  try {
    const updated = await updateProductPrice(product.id, price);
    showMessage(`「${updated.name}」の価格を ${yen(updated.price)} に更新しました。`, "success");
    // 最新のマスタを取り直して再描画する
    await loadProducts();
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    button.disabled = false;
  }
}

// 商品マスタを読み込んで描画する
async function loadProducts() {
  try {
    const products = await fetchProducts();
    renderProducts(products);
  } catch (err) {
    productsEl.innerHTML = `<div class="message error">${escapeHtml(err.message)}\nサーバーが起動しているか、config.js の API_BASE_URL を確認してください。</div>`;
  }
}

// ---- 起動 ----
loadProducts();
