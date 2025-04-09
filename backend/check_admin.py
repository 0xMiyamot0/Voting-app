from app import app, db, User

def check_admin():
    with app.app_context():
        # Get all users
        users = User.query.all()
        print("\nAll users in database:")
        for user in users:
            print(f"Username: {user.username}, Is Admin: {user.is_admin}")
        
        # Check if any admin exists
        admin = User.query.filter_by(is_admin=True).first()
        if admin:
            print("\nAdmin user found:")
            print(f"Username: {admin.username}")
            print(f"Is Admin: {admin.is_admin}")
        else:
            print("\nNo admin user found in database!")

if __name__ == "__main__":
    check_admin() 