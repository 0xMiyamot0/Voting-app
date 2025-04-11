from app import app, db

def migrate():
    with app.app_context():
        try:
            # Add ratings column to Vote table
            db.engine.execute('ALTER TABLE vote ADD COLUMN ratings JSON')
            print("Migration completed successfully!")
        except Exception as e:
            print(f"Error during migration: {str(e)}")

if __name__ == '__main__':
    migrate() 