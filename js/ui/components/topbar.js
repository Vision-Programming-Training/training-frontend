// 全ページ共通のヘッダーナビ（topbar）
// 各 HTML から <script type="module" src="js/ui/components/topbar.js"> で読み込むと、
// このモジュールが自分でヘッダーを <body> の先頭に差し込み、
// 現在ページのタブを location から判定してハイライトする。

const BRAND = "🛒 Vision 市場";

// ナビの並び（ここに 1 行足すだけで全ページにタブが増える）
const LINKS = [
  { href: "index.html", label: "店舗" },
  { href: "orders.html", label: "注文履歴" },
  { href: "admin.html", label: "管理" },
];

// 現在開いているページのファイル名（"/" 終端や末尾なしは index.html とみなす）
function currentPage() {
  const last = location.pathname.split("/").pop();
  return last === "" ? "index.html" : last;
}

function mountTopbar() {
  const here = currentPage();

  const links = LINKS.map(({ href, label }) => {
    const isActive = href === here;
    const cls = isActive ? "nav-link active" : "nav-link";
    const aria = isActive ? ' aria-current="page"' : "";
    return `<a class="${cls}" href="${href}"${aria}>${label}</a>`;
  }).join("");

  const header = document.createElement("header");
  header.className = "topbar";
  header.innerHTML = `
    <a class="brand" href="index.html">${BRAND}</a>
    <nav class="nav">${links}</nav>
  `;

  // module script は defer 相当で DOM 解析後に実行されるため body は存在する
  document.body.prepend(header);
}

mountTopbar();
