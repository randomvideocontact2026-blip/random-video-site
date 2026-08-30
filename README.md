# FANZガチャ

「FANZガチャ」は、FANZA作品をランダムに表示する非公式サイトです。

## 公開サイト

https://randomvideocontact2026-blip.github.io/random-video-site/

## 主な機能

- 条件なしで作品をランダム表示
- 2D・VRの切り替え
- タグによる絞り込み
- 女優名による絞り込み
- FANZAの商品ページへのリンク

## 作品表示の仕組み

FANZガチャでは、Cloudflare Workerを経由してFANZA Web APIへアクセスし、対象作品の中からランダムに1作品を取得します。

タグ、女優名、2D・VRなどの条件を指定した場合も、指定された条件をCloudflare Workerへ送り、条件に合うFANZA作品を検索します。

タグと女優はそれぞれ最大3件まで指定でき、複数指定した場合はすべての条件に該当する作品を検索します。

Cloudflare Workerを利用することで、API IDやアフィリエイトIDなどの認証情報を公開サイトのJavaScriptへ直接記載しない仕組みにしています。

## データ更新

ローカル環境では、次のコマンドで作品データを一括更新できます。

```powershell
python update_items.py