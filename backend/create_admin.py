from app import app, db, User
from werkzeug.security import generate_password_hash

def create_admin_user():
    with app.app_context():
        # Check if admin user already exists
        admin = User.query.filter_by(username='admin').first()
        if admin:
            print("Admin user already exists. Updating password...")
            admin.set_password('admin123')  # Change this to your desired password
        else:
            print("Creating new admin user...")
            admin = User(username='admin', is_admin=True)
            admin.set_password('admin123')  # Change this to your desired password
            db.session.add(admin)
        
        db.session.commit()
        print("Admin user created/updated successfully!")

if __name__ == "__main__":
    create_admin_user() 