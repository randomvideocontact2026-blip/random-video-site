import openpyxl
import json

EXCEL_FILE = "一作一会_作品管理.xlsx"
OUTPUT_FILE = "items.js"

wb = openpyxl.load_workbook(EXCEL_FILE)
ws = wb["作品管理"]

items = []
seen_ids = set()

for row_number, row in enumerate(
    ws.iter_rows(min_row=2, values_only=True),
    start=2,
):
    product_id, title, price, item_type, genres, actresses, image, url = row

    if not product_id:
        continue

    product_id = str(product_id).strip()

    required_fields = {
        "title": title,
        "price": price,
        "type": item_type,
        "genres": genres,
        "actresses": actresses,
        "image": image,
        "url": url,
    }

    for field_name, value in required_fields.items():
        if value is None or str(value).strip() == "":
            raise ValueError(
                f"Excel {row_number}行目 / 作品ID {product_id} の {field_name} が空欄です"
            )

    item_type = str(item_type).strip()

    if item_type not in ("2d", "vr"):
        raise ValueError(
            f"Excel {row_number}行目 / 作品ID {product_id} の type が不正です: {item_type}"
        )

    try:
        price = int(price)
    except (TypeError, ValueError):
        raise ValueError(
            f"Excel {row_number}行目 / 作品ID {product_id} の price が不正です: {price}"
        )

    url = str(url).strip()

    if not url.startswith(("https://", "http://")):
        raise ValueError(
            f"Excel {row_number}行目 / 作品ID {product_id} の url が不正です: {url}"
        )

    image = str(image).strip()

    if not image.startswith(("https://", "http://")):
        raise ValueError(
            f"Excel {row_number}行目 / 作品ID {product_id} の image が不正です: {image}"
        )

    if product_id in seen_ids:
        raise ValueError(
            f"Excel {row_number}行目 / 重複した作品IDがあります: {product_id}"
        )

    seen_ids.add(product_id)

    genre_list = [genre.strip() for genre in str(genres).split("|") if genre.strip()]

    actress_list = [
        actress.strip() for actress in str(actresses).split("|") if actress.strip()
    ]

    item = {
        "id": product_id,
        "title": str(title),
        "price": price,
        "type": item_type,
        "genres": genre_list,
        "actresses": actress_list,
        "image": image,
        "url": url,
    }

    items.append(item)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("const items = ")
    f.write(json.dumps(items, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"{len(items)}作品を書き出しました。")
print(f"生成ファイル: {OUTPUT_FILE}")
