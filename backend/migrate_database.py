
import sqlite3
import shutil
from pathlib import Path
from datetime import datetime


# ==================================================
# DATABASE LOCATION
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "flowguard.db"


# ==================================================
# CHECK DATABASE
# ==================================================

if not DB_PATH.exists():
    raise FileNotFoundError(
        f"Database not found: {DB_PATH}"
    )


# ==================================================
# CREATE BACKUP BEFORE MIGRATION
# ==================================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

BACKUP_PATH = BASE_DIR / f"flowguard_backup_{timestamp}.db"

shutil.copy2(DB_PATH, BACKUP_PATH)

print("Database backup created:")
print(BACKUP_PATH)


# ==================================================
# CONNECT TO SQLITE
# ==================================================

connection = sqlite3.connect(DB_PATH)

cursor = connection.cursor()


try:

    # ----------------------------------------------
    # CREATE USERS TABLE
    # ----------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name VARCHAR(150) NOT NULL,

            email VARCHAR(255) NOT NULL UNIQUE,

            hashed_password VARCHAR(255) NOT NULL

        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS ix_users_id
        ON users (id)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS ix_users_email
        ON users (email)
    """)

    print("Users table checked successfully.")


    # ----------------------------------------------
    # CHECK TRANSACTIONS TABLE
    # ----------------------------------------------

    cursor.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name = 'transactions'
    """)

    if cursor.fetchone() is None:

        raise RuntimeError(
            "Transactions table does not exist."
        )


    # ----------------------------------------------
    # CHECK EXISTING COLUMNS
    # ----------------------------------------------

    cursor.execute(
        "PRAGMA table_info(transactions)"
    )

    columns = [
        row[1]
        for row in cursor.fetchall()
    ]


    # ----------------------------------------------
    # ADD USER ID COLUMN IF MISSING
    # ----------------------------------------------

    if "user_id" not in columns:

        cursor.execute("""
            ALTER TABLE transactions
            ADD COLUMN user_id INTEGER
            REFERENCES users(id)
        """)

        print(
            "Added user_id column to transactions."
        )

    else:

        print(
            "user_id column already exists."
        )


    # ----------------------------------------------
    # CREATE INDEX
    # ----------------------------------------------

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS
        ix_transactions_user_id
        ON transactions (user_id)
    """)


    # ----------------------------------------------
    # SAVE MIGRATION
    # ----------------------------------------------

    connection.commit()

    print("\nMigration completed successfully!")

    print("Users table: Ready")

    print("Transactions ownership column: Ready")

    print("Existing transaction records: Preserved")

    print(f"Backup file: {BACKUP_PATH}")


except Exception:

    connection.rollback()

    print("\nMigration failed. Changes were rolled back.")

    raise


finally:

    connection.close()
