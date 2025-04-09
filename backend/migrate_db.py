from app import app, db, User
from werkzeug.security import generate_password_hash

def migrate_database():
    with app.app_context():
        # Get all users
        users = User.query.all()
        
        # Update each user's password to be hashed
        for user in users:
            if hasattr(user, 'password'):
                # If the user has a plain password, hash it
                hashed_password = generate_password_hash(user.password)
                user.password_hash = hashed_password
                db.session.commit()
        
        print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database() 