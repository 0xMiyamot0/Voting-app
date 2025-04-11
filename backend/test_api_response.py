from app import app, db, User
from flask_login import login_user
import json

def test_api_response():
    with app.app_context():
        # Create a test admin user if it doesn't exist
        admin = User.query.filter_by(username='test_admin').first()
        if not admin:
            admin = User(username='test_admin', is_admin=True)
            admin.set_password('test123')
            db.session.add(admin)
            db.session.commit()
        
        # Login the admin user
        login_user(admin)
        
        # Create a test client
        with app.test_client() as client:
            # Make a request to the fetch-ad-users endpoint
            response = client.post('/api/fetch-ad-users')
            
            # Check if the response is successful
            if response.status_code == 200:
                data = json.loads(response.data)
                print("API Response Status: Success")
                print(f"Number of users: {len(data.get('users', []))}")
                
                # Check if OU is included in the response
                if data.get('users'):
                    print("\nSample users from API response:")
                    for i, user in enumerate(data['users'][:5]):  # Show first 5 users
                        print(f"{i+1}. {user.get('username')} - OU: {user.get('ou', 'Not found')}")
                else:
                    print("No users found in the response")
            else:
                print(f"API Response Status: Error ({response.status_code})")
                print(f"Response: {response.data}")

if __name__ == "__main__":
    test_api_response() 