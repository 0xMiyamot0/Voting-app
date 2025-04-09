from app import app, db, User
import os

def update_database():
    with app.app_context():
        # Delete the existing database file
        if os.path.exists('voting.db'):
            os.remove('voting.db')
            print("Old database removed.")
        
        # Create all tables
        db.create_all()
        print("New database created with updated schema.")
        
        # Create admin user
        admin = User(username='admin', is_admin=True)
        admin.set_password('admin123')  # Change this to your desired password
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully!")

if __name__ == "__main__":
    update_database() 