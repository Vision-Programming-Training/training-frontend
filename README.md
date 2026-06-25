# training-frontend

新人研修用ミニ EC の **フロントエンド**。素の HTML + JavaScript（`fetch`）だけで作った、商品一覧 → カート → 注文の 1 本道の画面です。

このフロントは **backend の言語に依存しません**。サーバーを C# 版・Java 版・Node 版などに入れ替えても、このフロントを 1 個使い回せます。接続先は `config.js` で切り替えます。

## このフロントの狙い

- `api.js` の中の `fetch("...")` の行こそが **クライアントとサーバーの境界**です。「画面（ブラウザ）」と「サーバー」が別物で、HTTP で通信していることがコードから見えるように、あえて素の構成にしています。
- フレームワーク（React / Vue / Blazor など）は使いません。境界を隠さないためです。

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
const API_BASE_URL = "http://localhost:5000";

// 例: 別のサーバー版に切り替える場合
// const API_BASE_URL = "http://localhost:8080";
```

サーバーを別言語版に入れ替えても、フロントはこの URL を変えるだけで再利用できます。

## ファイル構成

JavaScript は役割ごとに ES モジュールで分けています（読み込むのは `main.js` だけ。残りは import で連鎖的に読み込まれます）。

```
training-frontend/
├── index.html      画面の骨組み（js/main.js を type="module" で読み込む）
├── README.md
├── css/
│   └── styles.css  見た目（スタイル）
└── js/
    ├── config.js   接続先サーバーのベース URL（ここだけ切り替える）
    ├── api.js      fetch で API を叩く（クライアントとサーバーの境界）
    ├── cart.js     カートの状態管理（DOM・通信に依存しない純粋なロジック）
    ├── ui.js       描画（DOM 操作だけ）
    └── main.js     全体の組み立てと起動（api / cart / ui を呼び分ける）
```

依存の向きは `main.js → api.js / cart.js / ui.js → config.js` の一方通行です。`cart.js` と `ui.js` は互いを知らず、つなぎ役の `main.js` がボタンの処理を「ハンドラ」として `ui.js` に渡します。これが**関心の分離**の形です。

## 使い方

1. backend を起動する（`dotnet run --project src` など）。
2. このフロントを簡易サーバーで開く。
3. 商品一覧から「カートに追加」→ 必要ならクーポンコード（`WELCOME500` / `SALE10`）を入力 →「この内容で注文する」。
4. 注文番号と税込金額が表示され、在庫が更新されます。
