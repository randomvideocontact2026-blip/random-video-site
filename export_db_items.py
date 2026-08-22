from pathlib import Path
import json
import sqlite3


BASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = BASE_DIR / "fanza_items.db"
OUTPUT_FILE = BASE_DIR / "items.js"


def load_database_items():
    """SQLiteからサイト表示用の作品データを読み込む。"""
    with sqlite3.connect(DATABASE_FILE) as connection:
        rows = connection.execute(
            """
            SELECT
                content_id,
                title,
                price,
                item_type,
                genres_json,
                actresses_json,
                image_url,
                product_url
            FROM items
            ORDER BY content_id
            """
        ).fetchall()

    items = []

    for row in rows:
        (
            content_id,
            title,
            price,
            item_type,
            genres_json,
            actresses_json,
            image_url,
            product_url,
        ) = row

        item = {
            "id": content_id,
            "title": title,
            "price": price,
            "type": item_type,
            "genres": json.loads(genres_json),
            "actresses": json.loads(actresses_json),
            "image": image_url,
            "url": product_url,
        }

        items.append(item)

    return items


def export_items():
    """データベースの作品をテスト用JavaScriptへ書き出す。"""
    items = load_database_items()

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        file.write("const items = ")
        file.write(json.dumps(items, ensure_ascii=False, indent=2))
        file.write(";\n")

    print(f"{len(items)}作品を書き出しました。")
    print(f"生成ファイル: {OUTPUT_FILE}")


if __name__ == "__main__":
    export_items()