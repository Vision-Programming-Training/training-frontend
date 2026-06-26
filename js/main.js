// 全体の組み立てと起動
// api.js（通信）・cart.js（状態）・ui.js（描画）を呼び分けて、1 本道のアプリにする
// 「ボタンが押されたら何をするか」をここで決め、ui.js にハンドラとして渡す

import { API_BASE_URL } from "./config.js";
import { fetchProducts, fetchCoupons, postOrder } from "./api.js";
import * as cart from "./cart.js";
import * as ui from "./ui.js";

// main 固有の画面要素
const couponEl = document.getElementById("coupon");
const orderBtn = document.getElementById("order-btn");

ui.setApiBase(API_BASE_URL);

// カートの状態を画面に反映し直す
function refreshCart() {
  ui.renderCart(cart.getCartItems(), cart.getSubtotal(), removeFromCart);
}

// 「カートに追加」ボタンの処理
function addToCart(product) {
  if (!cart.addToCart(product)) {
    alert(`「${product.name}」の在庫は ${product.stock} 個までです。`);
    return;
  }
  refreshCart();
}

// 「削除」ボタンの処理
function removeFromCart(productId) {
  cart.removeFromCart(productId);
  refreshCart();
}

// 商品一覧を読み込んで描画する
async function loadProducts() {
  try {
    const products = await fetchProducts();
    ui.renderProducts(products, addToCart);
  } catch (err) {
    ui.showProductsError(err.message);
  }
}

// 使えるクーポン一覧を読み込んで描画する
async function loadCoupons() {
  try {
    const coupons = await fetchCoupons();
    ui.renderCoupons(coupons);
  } catch (err) {
    ui.showCouponsError(err.message);
  }
}

// 注文を確定する
async function submitOrder() {
  const items = cart.getCartItems().map(({ product, quantity }) => ({
    productId: product.id,
    quantity,
  }));

  orderBtn.disabled = true;

  try {
    const order = await postOrder(items, couponEl.value.trim());
    // 1 本道なのでカートを空にして、最新の在庫を取り直す
    cart.clearCart();
    couponEl.value = "";
    refreshCart();
    await loadProducts();
    // 結果メッセージはカート再描画（resultEl をクリアする）の後に出す
    ui.showMessage(
      `注文が完了しました！\n注文番号: ${order.id}\nステータス: ${order.status}\nお支払い金額（税込）: ${ui.yen(order.totalAmount)}`,
      "success"
    );
  } catch (err) {
    ui.showMessage(err.message, "error");
  } finally {
    orderBtn.disabled = false;
  }
}

// ---- 起動 ----
orderBtn.addEventListener("click", submitOrder);

loadProducts();
loadCoupons();
refreshCart();
