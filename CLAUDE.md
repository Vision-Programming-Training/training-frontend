# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このプロジェクトについて

新人研修用ミニ EC の**フロントエンド**。フレームワーク・ビルドツール・パッケージマネージャを一切使わない、素の HTML + CSS + ES モジュール（`fetch`）だけの構成。`api.js` 内の `fetch("...")` を「クライアントとサーバーの境界」として見えるようにするのが教材としての狙いなので、**この境界を隠す抽象化（React / Vue / fetch ラッパー等）は導入しない**。

backend の言語には依存しない。接続先は [js/core/config.js](js/core/config.js) の `API_BASE_URL` 1 行だけで切り替える。

## 開発・実行

ビルド・テスト・lint は存在しない。`file://` で直接開くと CORS で動かないため、必ず簡易 HTTP サーバー経由で開く。

```bash
python -m http.server 5500   # → http://localhost:5500
```

VS Code の Live Server 拡張（`index.html` を右クリック →「Open with Live Server」）でも可。backend 側は `localhost`/`127.0.0.1` の `5500` と `8080` を CORS 許可済み。別ポートで開く場合は backend の許可設定に追記が必要。

動作には起動済みの backend（例: training-backend-csharp）が必要。

## アーキテクチャ

3 ページ構成（`index.html` = 店舗 / `orders.html` = 注文履歴 / `admin.html` = 管理）。各 HTML が直接読み込むのは 2 つの module だけ：共通ヘッダーの [js/ui/components/topbar.js](js/ui/components/topbar.js) と、その画面の入口 `js/entries/*.js`。残りは import で連鎖的に読み込まれる。

レイヤと依存の向き（**一方通行**）：

```
entries/*  →  core/api.js・core/cart.js・ui/render.js  →  core/config.js
```

- **core/** — DOM に依存しない土台。`api.js`（fetch だけ／状態を持たない）、`cart.js`（Map ベースの純粋なカート状態／`document` も `fetch` も出てこない）、`config.js`（接続先 URL）。
- **ui/** — DOM 操作だけ。`render.js` は通信もカート状態も知らず、ボタン押下時の処理は**ハンドラとして引数で受け取る**（例: `renderProducts(products, onAdd)`）。
- **entries/** — つなぎ役。画面要素の取得・イベント結線・「ボタンが押されたら何をするか」をここで決め、`ui/render.js` にハンドラを渡す。

`core/cart.js` と `ui/render.js` は互いを知らない。両者を結線するのは `entries/*.js` だけ。これが関心の分離の形であり、**新機能でもこの分離を崩さない**（fetch は `api.js`、DOM 操作は `render.js`、結線は `entries/*.js` に置く）。

## 約束ごと

- **金額計算はサーバーが正**。`cart.js` の小計はあくまで税抜の「目安」表示で、税込・クーポン適用後の確定金額は注文 API のレスポンスを使う。クライアント側で確定金額を計算し直さない。
- **DOM へ文字列を埋め込むときは `render.js` の `escapeHtml()` を必ず通す**（`innerHTML` を使うため）。金額表示は同じく `render.js` の `yen()` を使う。
- `topbar.js` のナビは `LINKS` 配列を 1 行足すだけで全ページに増える。アクティブ判定は `location` のファイル名で行う。
- README は `css/styles.css` 単一と書いているが、実際の CSS は `css/common.css`（全ページ共通）＋ ページ別 `css/{shop,orders,admin}.css` に分かれている。

## CSS の規約

`common.css` がレイアウト土台と共通部品（`.card` / `.topbar` / `.message.error|success` / `.total` / `button.primary` など）を持ち、各ページの CSS はそのページ固有のものだけを追加する。新しい共通部品は `common.css` に寄せる。
