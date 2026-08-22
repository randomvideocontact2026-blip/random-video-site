from pathlib import Path
import json
import random
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request


BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
DATABASE_FILE = BASE_DIR / "fanza_items.db"


def load_env(file_path):
    env = {}

    with file_path.open("r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")

    return env


env = load_env(ENV_FILE)

API_ID = env.get("DMM_API_ID")
AFFILIATE_ID = env.get("DMM_AFFILIATE_ID")

if not API_ID or not AFFILIATE_ID:
    raise SystemExit(
        ".envにDMM_API_IDまたはDMM_AFFILIATE_IDがありません。"
    )



def fetch_items(hits=10, offset=1, cid=None):
    """DMM APIから指定件数の作品情報を取得する。"""
    params = {
        "api_id": API_ID,
        "affiliate_id": AFFILIATE_ID,
        "site": "FANZA",
        "service": "digital",
        "floor": "videoa",
        "hits": hits,
        "offset": offset,
        "sort": "date",
        "output": "json",
    }

    if cid:
        params["cid"] = cid

    endpoint = "https://api.dmm.com/affiliate/v3/ItemList"
    request_url = endpoint + "?" + urllib.parse.urlencode(params)

    request = urllib.request.Request(
        request_url,
        headers={"User-Agent": "IssakuIchie/1.0"},
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.load(response)

    except urllib.error.HTTPError as error:
        try:
            error_data = json.loads(error.read().decode("utf-8"))
            error_result = error_data.get("result", {})
            error_status = error_result.get("status", error.code)
            error_message = error_result.get("message", "詳細不明")

        except (json.JSONDecodeError, UnicodeDecodeError):
            error_status = error.code
            error_message = "詳細を読み取れませんでした"

        raise SystemExit(
            f"APIエラー: {error_status} / {error_message}"
        )

    except urllib.error.URLError:
        raise SystemExit(
            "APIへ接続できませんでした。通信環境を確認してください。"
        )

    result = data.get("result", {})
    status = result.get("status")

    if str(status) != "200":
        message = result.get("message", "詳細不明")
        raise SystemExit(f"APIエラー: {status} / {message}")

    items = result.get("items", [])
    total_count = result.get("total_count", 0)

    return items, total_count



def convert_api_item(item):
    """APIの作品情報をデータベースへ保存できる形に変換する。"""
    item_info = item.get("iteminfo") or item.get("itemInfo") or {}

    def get_names(category):
        values = item_info.get(category, [])

        if not isinstance(values, list):
            return []

        return [
            value.get("name")
            for value in values
            if isinstance(value, dict) and value.get("name")
        ]

    genres = get_names("genre")
    actresses = get_names("actress")
    series = get_names("series")
    makers = get_names("maker")
    directors = get_names("director")
    labels = get_names("label")

    item_type = "vr" if "VR専用" in genres else "2d"

    image_info = item.get("imageURL", {})
    image_url = (
        image_info.get("large")
        or image_info.get("list")
        or image_info.get("small")
    )

    price_info = item.get("prices", {})
    price_text = str(price_info.get("price", "")).replace(",", "").strip()

    for separator in ("〜", "～", "~"):
        price_text = price_text.split(separator, 1)[0].strip()
    price = int(price_text) if price_text.isdigit() else None

    return {
        "content_id": item.get("content_id"),
        "title": item.get("title"),
        "product_url": item.get("affiliateURL"),
        "image_url": image_url,
        "price": price,
        "item_type": item_type,
        "genres_json": json.dumps(genres, ensure_ascii=False),
        "actresses_json": json.dumps(actresses, ensure_ascii=False),
        "series_json": json.dumps(series, ensure_ascii=False),
        "makers_json": json.dumps(makers, ensure_ascii=False),
        "directors_json": json.dumps(directors, ensure_ascii=False),
        "labels_json": json.dumps(labels, ensure_ascii=False),
        "raw_json": json.dumps(item, ensure_ascii=False),
    }

def create_database():
    """作品データを保存するSQLiteデータベースを準備する。"""
    with sqlite3.connect(DATABASE_FILE) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                content_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                product_url TEXT NOT NULL,
                image_url TEXT,
                price INTEGER,
                item_type TEXT NOT NULL
                    CHECK (item_type IN ('2d', 'vr')),
                genres_json TEXT NOT NULL DEFAULT '[]',
                actresses_json TEXT NOT NULL DEFAULT '[]',
                series_json TEXT NOT NULL DEFAULT '[]',
                makers_json TEXT NOT NULL DEFAULT '[]',
                directors_json TEXT NOT NULL DEFAULT '[]',
                labels_json TEXT NOT NULL DEFAULT '[]',
                raw_json TEXT NOT NULL,
                fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

    print(f"データベースを作成しました: {DATABASE_FILE}")

    

def save_items(api_items):
    """APIから取得した作品をデータベースへ追加または更新する。"""
    converted_items = []
    skipped_count = 0

    for api_item in api_items:
        converted_item = convert_api_item(api_item)

        required_values = (
            converted_item["content_id"],
            converted_item["title"],
            converted_item["product_url"],
        )

        if not all(required_values):
            skipped_count += 1
            continue

        converted_items.append(converted_item)

    if not converted_items:
        print("保存できる作品がありませんでした。")
        return 0

    with sqlite3.connect(DATABASE_FILE) as connection:
        connection.executemany(
            """
            INSERT INTO items (
                content_id,
                title,
                product_url,
                image_url,
                price,
                item_type,
                genres_json,
                actresses_json,
                series_json,
                makers_json,
                directors_json,
                labels_json,
                raw_json
            )
            VALUES (
                :content_id,
                :title,
                :product_url,
                :image_url,
                :price,
                :item_type,
                :genres_json,
                :actresses_json,
                :series_json,
                :makers_json,
                :directors_json,
                :labels_json,
                :raw_json
            )
            ON CONFLICT(content_id) DO UPDATE SET
                title = excluded.title,
                product_url = excluded.product_url,
                image_url = excluded.image_url,
                price = excluded.price,
                item_type = excluded.item_type,
                genres_json = excluded.genres_json,
                actresses_json = excluded.actresses_json,
                series_json = excluded.series_json,
                makers_json = excluded.makers_json,
                directors_json = excluded.directors_json,
                labels_json = excluded.labels_json,
                raw_json = excluded.raw_json,
                updated_at = CURRENT_TIMESTAMP
            """,
            converted_items,
        )

    print(f"データベースへ保存した件数: {len(converted_items)}")

    if skipped_count:
        print(f"必須情報がなく保存しなかった件数: {skipped_count}")

    return len(converted_items)



def sync_pages(page_count=1, hits=100):
    """APIを複数ページに分けて取得し、データベースへ保存する。"""
    total_processed = 0

    for page_index in range(page_count):
        offset = page_index * hits + 1

        print(
            f"{page_index + 1}ページ目を取得します"
            f"（開始位置: {offset}）"
        )

        api_items, total_count = fetch_items(
            hits=hits,
            offset=offset,
        )

        print(f"APIから取得した件数: {len(api_items)}")
        total_processed += save_items(api_items)

        if len(api_items) < hits:
            break

        if page_index < page_count - 1:
            time.sleep(1)

    print(f"今回処理した合計件数: {total_processed}")
    print(f"取得可能な作品総数: {total_count}")

    return total_processed

def sync_random_pages(page_count=2, hits=100):
    """作品一覧の広い範囲からページをランダムに選んで保存する。"""
    if page_count < 1:
        raise ValueError("page_countは1以上にしてください。")

    if not 1 <= hits <= 100:
        raise ValueError("hitsは1から100の範囲にしてください。")

    _, total_count = fetch_items(hits=1, offset=1)
    total_count = int(total_count or 0)

    if total_count == 0:
        print("取得可能な作品がありませんでした。")
        return 0

    available_page_count = (total_count + hits - 1) // hits

    # 先頭の100作品は取得済みなので、2ページ目以降から選ぶ。
    candidate_page_indexes = list(range(1, available_page_count))

    if not candidate_page_indexes:
        candidate_page_indexes = [0]

    selected_page_indexes = random.sample(
        candidate_page_indexes,
        min(page_count, len(candidate_page_indexes)),
    )

    total_processed = 0

    for run_number, page_index in enumerate(
        selected_page_indexes,
        start=1,
    ):
        offset = page_index * hits + 1

        print(
            f"ランダム取得 {run_number}回目"
            f"（開始位置: {offset}）"
        )

        api_items, _ = fetch_items(
            hits=hits,
            offset=offset,
        )

        print(f"APIから取得した件数: {len(api_items)}")
        total_processed += save_items(api_items)

        if run_number < len(selected_page_indexes):
            time.sleep(1)

    print(f"今回処理した合計件数: {total_processed}")
    print(f"取得可能な作品総数: {total_count}")

    return total_processed


if __name__ == "__main__":
    create_database()
    sync_random_pages()