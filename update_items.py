from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


BASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = BASE_DIR / "fanza_items.db"
ITEMS_FILE = BASE_DIR / "items.js"


def run_script(script_name, description):
    """指定したPythonファイルを実行し、失敗したら処理を停止する。"""
    print(f"\n--- {description} ---")

    subprocess.run(
        [sys.executable, script_name],
        cwd=BASE_DIR,
        check=True,
    )


def main():
    """作品データの取得・書き出し・検証を順番に実行する。"""

    if not DATABASE_FILE.exists():
        print("\n更新を中止しました。")
        print(f"データベースが見つかりません: {DATABASE_FILE}")
        print(
            "fanza_items.dbを元の場所へ戻してから"
            "再実行してください。"
        )
        raise SystemExit(1)

    print("作品データの一括更新を開始します。")

    with tempfile.TemporaryDirectory() as temporary_directory:
        backup_directory = Path(temporary_directory)
        database_backup = backup_directory / DATABASE_FILE.name
        items_backup = backup_directory / ITEMS_FILE.name

        database_existed = DATABASE_FILE.exists()
        items_existed = ITEMS_FILE.exists()

        if database_existed:
            shutil.copy2(DATABASE_FILE, database_backup)

        if items_existed:
            shutil.copy2(ITEMS_FILE, items_backup)

        try:
            run_script(
                "sync_api_items.py",
                "1. API取得・SQLite保存",
            )
            run_script(
                "export_db_items.py",
                "2. items.js生成",
            )
            run_script(
                "validate_items.py",
                "3. データ検証",
            )

        except subprocess.CalledProcessError:
            print("\n更新中にエラーが発生しました。")
            print("更新前のファイルへ戻します。")

            if database_existed:
                shutil.copy2(database_backup, DATABASE_FILE)
            elif DATABASE_FILE.exists():
                DATABASE_FILE.unlink()

            if items_existed:
                shutil.copy2(items_backup, ITEMS_FILE)
            elif ITEMS_FILE.exists():
                ITEMS_FILE.unlink()

            print("更新前の状態へ戻しました。")
            raise SystemExit(1)

    print("\nすべての処理が正常に完了しました。")


if __name__ == "__main__":
    main()