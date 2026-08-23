from pathlib import Path
import json
import sqlite3


BASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = BASE_DIR / "fanza_items.db"
ITEMS_FILE = BASE_DIR / "items.js"

ITEMS_PREFIX = "const items = "
VALID_ITEM_TYPES = {"2d", "vr"}


def load_items_js():
    """items.jsを読み込み、Pythonのリストへ変換する。"""
    if not ITEMS_FILE.exists():
        raise ValueError("items.jsが見つかりません。")

    text = ITEMS_FILE.read_text(encoding="utf-8").strip()

    if not text.startswith(ITEMS_PREFIX):
        raise ValueError("items.jsの先頭が「const items =」ではありません。")

    json_text = text[len(ITEMS_PREFIX):].strip()

    if not json_text.endswith(";"):
        raise ValueError("items.jsの末尾にセミコロンがありません。")

    items = json.loads(json_text[:-1])

    if not isinstance(items, list):
        raise ValueError("items.jsのデータが配列ではありません。")

    return items


def load_database_summary():
    """SQLiteの正常性と登録作品を確認する。"""
    if not DATABASE_FILE.exists():
        raise ValueError("fanza_items.dbが見つかりません。")

    with sqlite3.connect(DATABASE_FILE) as connection:
        quick_check = connection.execute(
            "PRAGMA quick_check"
        ).fetchone()[0]

        if quick_check != "ok":
            raise ValueError(
                f"SQLiteの整合性に問題があります: {quick_check}"
            )

        rows = connection.execute(
            """
            SELECT content_id, item_type
            FROM items
            ORDER BY content_id
            """
        ).fetchall()

    database_ids = {row[0] for row in rows}
    type_counts = {"2d": 0, "vr": 0}

    for _, item_type in rows:
        if item_type in type_counts:
            type_counts[item_type] += 1

    return database_ids, type_counts


def validate_items(items, database_ids):
    """items.jsの必須項目、型、URL、重複を検証する。"""
    errors = []
    seen_ids = set()

    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            errors.append(f"{index}件目: 作品データがオブジェクトではありません。")
            continue

        item_id = item.get("id")

        required_fields = ("id", "title", "image", "url", "type")

        for field in required_fields:
            value = item.get(field)

            if not isinstance(value, str) or not value.strip():
                errors.append(
                    f"{index}件目（ID: {item_id}）: "
                    f"{field}が空欄です。"
                )

        if item_id in seen_ids:
            errors.append(f"作品IDが重複しています: {item_id}")
        else:
            seen_ids.add(item_id)

        if item.get("type") not in VALID_ITEM_TYPES:
            errors.append(
                f"{index}件目（ID: {item_id}）: "
                "typeが2dまたはvrではありません。"
            )

        price = item.get("price")

        if (
            not isinstance(price, int)
            or isinstance(price, bool)
            or price < 0
        ):
            errors.append(
                f"{index}件目（ID: {item_id}）: "
                "priceが0以上の整数ではありません。"
            )

        for field in ("genres", "actresses"):
            if not isinstance(item.get(field), list):
                errors.append(
                    f"{index}件目（ID: {item_id}）: "
                    f"{field}が配列ではありません。"
                )

        for field in ("image", "url"):
            value = item.get(field)

            if (
                isinstance(value, str)
                and value
                and not value.startswith(("https://", "http://"))
            ):
                errors.append(
                    f"{index}件目（ID: {item_id}）: "
                    f"{field}が正しいURLではありません。"
                )

    items_js_ids = {
        item.get("id")
        for item in items
        if isinstance(item, dict) and item.get("id")
    }

    if items_js_ids != database_ids:
        errors.append(
            "SQLiteとitems.jsの作品IDが一致していません。"
        )

    if len(items) != len(database_ids):
        errors.append(
            "SQLiteとitems.jsの作品数が一致していません。"
        )

    if errors:
        displayed_errors = errors[:20]

        message = "\n".join(
            f"- {error}" for error in displayed_errors
        )

        if len(errors) > 20:
            message += f"\n- ほか{len(errors) - 20}件のエラーがあります。"

        raise ValueError(
            f"データ検証に失敗しました。\n{message}"
        )


def main():
    try:
        items = load_items_js()
        database_ids, database_type_counts = load_database_summary()
        validate_items(items, database_ids)

    except (
        OSError,
        sqlite3.Error,
        json.JSONDecodeError,
        ValueError,
    ) as error:
        print(f"\n検証エラー:\n{error}")
        raise SystemExit(1)

    items_type_counts = {
        "2d": sum(item["type"] == "2d" for item in items),
        "vr": sum(item["type"] == "vr" for item in items),
    }

    if items_type_counts != database_type_counts:
        print("\n検証エラー:")
        print("SQLiteとitems.jsの2D・VR件数が一致していません。")
        raise SystemExit(1)

    print("\nデータ検証に成功しました。")
    print(f"作品数: {len(items)}")
    print(f"2D作品: {items_type_counts['2d']}")
    print(f"VR作品: {items_type_counts['vr']}")
    print("必須データ欠損: 0件")
    print("作品ID重複: 0件")
    print("SQLiteとitems.js: 一致")


if __name__ == "__main__":
    main()