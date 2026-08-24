# 一作一会

「一作一会」は、FANZA作品をランダムに表示する非公式サイトです。

## 公開サイト

https://randomvideocontact2026-blip.github.io/random-video-site/

## 主な機能

- 条件なしで作品をランダム表示
- 2D・VRの切り替え
- タグによる絞り込み
- 女優名による絞り込み
- 価格帯による絞り込み
- FANZAの商品ページへのリンク

## 作品表示の仕組み

条件を指定しない場合は、Cloudflare Workerを経由してFANZA Web APIへアクセスし、API対象作品の中からランダムに1作品を取得します。

タグ、女優名、価格帯、2D・VRなどの条件を指定した場合は、`items.js`に登録されている作品から条件に合う作品を表示します。

Cloudflare Workerを利用することで、API IDとアフィリエイトIDを公開サイトのJavaScriptへ直接記載しない仕組みにしています。

## データ更新

ローカル環境では、次のコマンドで作品データを一括更新できます。

```powershell
python update_items.py