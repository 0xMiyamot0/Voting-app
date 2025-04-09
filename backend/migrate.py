from app import app, db

def migrate():
    with app.app_context():
        # Add new columns to User table
        db.engine.execute('ALTER TABLE user ADD COLUMN reset_token VARCHAR(100)')
        db.engine.execute('ALTER TABLE user ADD COLUMN reset_token_expires DATETIME')
        print("Migration completed successfully!")

if __name__ == '__main__':
    migrate() 