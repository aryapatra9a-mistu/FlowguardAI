
from sqlalchemy import inspect, text
from database import engine


def migrate():
    inspector = inspect(engine)

    columns = [
        column["name"]
        for column in inspector.get_columns("users")
    ]

    if "settings" in columns:
        print("Settings column already exists.")
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN settings TEXT")
        )

    print("Migration successful!")
    print("User settings column added.")


if __name__ == "__main__":
    migrate()
