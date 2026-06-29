# training-frontend

新人研修用ミニ EC「Vision 市場」の **フロントエンド**。素の HTML + JavaScript（`fetch`）だけで作っています。

- 店舗（商品一覧 → カート → 注文）
- 注文履歴（一覧・キャンセル）
- 管理（商品マスタ参照・価格変更）

の 3 ページを、共通ヘッダーのタブで行き来します。

このフロントは **backend の言語に依存しません**。<br>
サーバーを C# 版・Java 版・Node 版などに入れ替えても、このフロントを 1 個使い回せます。<br>
接続先は `config.js` で切り替えます。


## このフロントの狙い

- `api.js` の中の `fetch("...")` の行こそが **クライアントとサーバーの境界**です<br>
「画面（ブラウザ）」と「サーバー」が別物で、HTTP で通信していることがコードから見えるように、あえて素の構成にしています。

- フレームワークやライブラリ（React / Vue など）は使いません。境界を隠さないためです。

## 必要なもの

- 起動済みの backend サーバー（例: [training-backend-csharp](https://github.com/sebayashi-tomoya/training-backend-csharp)）
- ブラウザと、簡易 HTTP サーバー（後述）

## 起動手順

`index.html` をファイルとして直接開く（`file://`）と CORS でうまく動かないため、**簡易 HTTP サーバー経由で開きます**。

### 方法 A: VS Code の Live Server（おすすめ）

1. VS Code でこのフォルダを開く。
2. 拡張機能「Live Server」をインストール。
3. `index.html` を右クリック →「Open with Live Server」。
4. ブラウザで `http://localhost:5500`（または `http://127.0.0.1:5500`）が開きます。

### 方法 B: Python の簡易サーバー

```bash
# このフォルダ内で
python -m http.server 5500
# → ブラウザで http://localhost:5500 を開く
```

> backend 側は、これらのオリジン（`localhost:5500` / `127.0.0.1:5500` / `localhost:8080` / `127.0.0.1:8080`）からのアクセスを CORS で許可済みです。別のポートで開く場合は backend の許可設定に追記が必要です。

## 接続先サーバーの切り替え方

`config.js` の 1 行だけを変えます。

```js
// 例: C# 版（既定）
export const API_BASE_URL = "http://localhost:5000";

// 例: 別のサーバー版に切り替える場合
// export const API_BASE_URL = "http://localhost:8080";
```

サーバーを別言語版に入れ替えても、フロントはこの URL を変えるだけで再利用できます。

## ファイル構成

JavaScript は役割ごとに ES モジュールで分けています。各 HTML が読み込むのは「その画面の入口（`js/entries/*.js`）」と「共通ヘッダー（`js/ui/components/topbar.js`）」だけで、残りは import で連鎖的に読み込まれます。

```
training-frontend/
├── index.html      店舗ページ（js/entries/shop.js を読み込む）
├── orders.html     注文履歴ページ（js/entries/orders.js）
├── admin.html      管理画面（js/entries/admin.js）
├── README.md
├── css/
│   ├── common.css  全ページ共通の見た目（topbar・カード・メッセージなど）
│   ├── shop.css    店舗ページ固有のスタイル
│   ├── orders.css  注文履歴ページ固有のスタイル
│   └── admin.css   管理ページ固有のスタイル
└── js/
    ├── entries/    各 HTML の入口（画面と 1 対 1。組み立てと起動・イベント結線）
    │   ├── shop.js     店舗（商品一覧・カート・注文）
    │   ├── orders.js   注文履歴（一覧・キャンセル）
    │   └── admin.js    管理（商品マスタ参照・価格変更）
    ├── core/       DOM に依存しない土台
    │   ├── config.js   接続先サーバーのベース URL（ここだけ切り替える）
    │   ├── api.js      fetch で API を叩く（クライアントとサーバーの境界）
    │   └── cart.js     カートの状態管理（純粋なロジック）
    └── ui/         画面描画（DOM 操作）
        ├── render.js     描画ヘルパ（yen / escapeHtml / 各種 render）
        └── components/   複数ページで使い回す UI 部品
            └── topbar.js  共通ヘッダーナビ（自分で <header> を差し込む）
```

依存の向きは `entries/* → core/api・core/cart・ui/render → core/config` の一方通行です。<br>
`core/cart.js` と `ui/render.js` は互いを知らず、つなぎ役の `entries/*.js` がボタンの処理を「ハンドラ」として `ui/render.js` に渡します。<br>

これが**関心の分離**の形です。

## 使い方

1. backend を起動する（`dotnet run --project src` など）。
2. このフロントを簡易サーバーで開く。
3. **店舗**（`index.html`）で商品一覧から「カートに追加」→ 必要ならクーポンコード（`WELCOME500` / `SALE10`）を入力 →「この内容で注文する」。注文番号と税込金額が表示され、在庫が更新されます。
4. **注文履歴**（`orders.html`）で過去の注文を一覧表示し、注文をキャンセルできます（在庫が戻ります）。
5. **管理**（`admin.html`）で商品マスタを参照し、価格を変更できます。

各ページは共通ヘッダーのタブで行き来できます。
