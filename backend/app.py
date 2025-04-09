from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
import os
import pandas as pd
from werkzeug.utils import secure_filename
import secrets
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from ldap3 import Server, Connection, ALL, SUBTREE, NTLM
from ad_config import AD_CONFIG

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///voting.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'xls'}

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    has_voted = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    votes = db.Column(db.Integer, default=0)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def authenticate_ad_user(username, password):
    try:
        # Try to connect with user credentials
        server = Server(AD_CONFIG['server'], get_info=ALL)
        user_dn = f"{username}@zimg.local"
        
        # Try to bind with user credentials
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        if conn.bound:
            # Search for user details
            conn.search(
                search_base=AD_CONFIG['base_dn'],
                search_filter=f'(&(objectClass=user)(sAMAccountName={username}))',
                attributes=['displayName', 'mail', 'department', 'memberOf']
            )
            
            if len(conn.entries) > 0:
                user_data = conn.entries[0]
                is_admin = any('CN=Domain Admins' in str(group) for group in user_data.memberOf)
                return {
                    'success': True,
                    'user_info': {
                        'username': username,
                        'display_name': str(user_data.displayName) if hasattr(user_data, 'displayName') else username,
                        'email': str(user_data.mail) if hasattr(user_data, 'mail') else '',
                        'department': str(user_data.department) if hasattr(user_data, 'department') else '',
                        'is_admin': is_admin
                    }
                }
        return {'success': False, 'error': 'Invalid credentials'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # First try AD authentication
    auth_result = authenticate_ad_user(username, password)
    
    if auth_result['success']:
        # Check if user exists in local DB
        user = User.query.filter_by(username=username).first()
        
        if not user:
            # Create new user in local DB
            user = User(
                username=username,
                is_admin=auth_result['user_info']['is_admin'],
                has_voted=False
            )
            # Set a random password for local DB (won't be used for login)
            user.set_password(secrets.token_urlsafe(32))
            db.session.add(user)
            db.session.commit()
        else:
            # Update admin status from AD
            if user.is_admin != auth_result['user_info']['is_admin']:
                user.is_admin = auth_result['user_info']['is_admin']
                db.session.commit()
        
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_admin': user.is_admin,
                'has_voted': user.has_voted,
                'name': auth_result['user_info']['display_name'],
                'email': auth_result['user_info']['email'],
                'department': auth_result['user_info']['department']
            }
        })
    
    # If AD auth fails, try local DB (for admin user)
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_admin': user.is_admin,
                'has_voted': user.has_voted,
                'name': username,
                'email': f"{username}@zimg.local"
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/check-auth', methods=['GET'])
@login_required
def check_auth():
    return jsonify({
        'is_admin': current_user.is_admin,
        'has_voted': current_user.has_voted
    })

@app.route('/api/employees')
@login_required
def get_employees():
    try:
        print("Fetching employees...")  # Debug print
        employees = Employee.query.all()
        print(f"Found {len(employees)} employees")  # Debug print
        employee_list = [{
            'id': emp.id,
            'name': emp.name,
            'department': emp.department,
            'votes': emp.votes
        } for emp in employees]
        print("Employee list:", employee_list)  # Debug print
        return jsonify(employee_list)
    except Exception as e:
        print(f"Error in get_employees: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/vote', methods=['POST'])
@login_required
def vote():
    try:
        if current_user.has_voted:
            return jsonify({'error': 'You have already voted'}), 400
        
        data = request.get_json()
        if not data or 'employee_ids' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        employee_ids = data['employee_ids']
        
        if len(employee_ids) != 3:
            return jsonify({'error': 'You must vote for exactly 3 employees'}), 400
        
        # Check if all employee IDs exist
        for emp_id in employee_ids:
            if not Employee.query.get(emp_id):
                return jsonify({'error': f'Employee with ID {emp_id} not found'}), 404
        
        # Record votes
        for emp_id in employee_ids:
            employee = Employee.query.get(emp_id)
            employee.votes += 1
            vote = Vote(user_id=current_user.id, employee_id=emp_id)
            db.session.add(vote)
        
        current_user.has_voted = True
        db.session.commit()
        return jsonify({'message': 'Vote recorded successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/results')
@login_required
def get_results():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    employees = Employee.query.order_by(Employee.votes.desc()).all()
    return jsonify([{
        'id': emp.id,
        'name': emp.name,
        'department': emp.department,
        'votes': emp.votes
    } for emp in employees])

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    try:
        logout_user()
        response = jsonify({'message': 'Logged out successfully'})
        response.delete_cookie('session')
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-voters', methods=['POST'])
@login_required
def upload_voters():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Read the Excel file
            df = pd.read_excel(filepath)
            
            # Check required columns
            required_columns = ['username', 'password']
            if not all(col in df.columns for col in required_columns):
                return jsonify({'error': f'Excel file must contain these columns: {required_columns}'}), 400
            
            # Process each row
            imported = 0
            skipped = 0
            for _, row in df.iterrows():
                # Check if user already exists
                if User.query.filter_by(username=row['username']).first():
                    skipped += 1
                    continue
                
                # Create new user
                user = User(
                    username=row['username'],
                    is_admin=row.get('is_admin', False),
                    has_voted=False
                )
                user.set_password(row['password'])
                db.session.add(user)
                imported += 1
            
            # Commit all changes
            db.session.commit()
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify({
                'message': f'Successfully imported {imported} voters, skipped {skipped} existing users'
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate reset token (in a real app, this would be a secure random token)
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    
    user.reset_token = reset_token
    user.reset_token_expires = expires
    db.session.commit()
    
    # In a real app, you would send an email with the reset link
    # For now, we'll just return the token (in production, never do this!)
    return jsonify({
        'message': 'Password reset instructions have been sent',
        'reset_token': reset_token  # Remove this in production
    })

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    reset_token = data.get('reset_token')
    new_password = data.get('new_password')
    
    if not reset_token or not new_password:
        return jsonify({'error': 'Reset token and new password are required'}), 400
    
    user = User.query.filter_by(reset_token=reset_token).first()
    if not user:
        return jsonify({'error': 'Invalid reset token'}), 400
    
    if user.reset_token_expires < datetime.datetime.utcnow():
        return jsonify({'error': 'Reset token has expired'}), 400
    
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'})

@app.route('/api/fetch-ad-users', methods=['POST'])
@login_required
def fetch_ad_users():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Connect to AD
        server = Server(AD_CONFIG['server'], get_info=ALL)
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        # Search for users
        conn.search(search_base=AD_CONFIG['search_base'],
                   search_filter=AD_CONFIG['search_filter'],
                   search_scope=SUBTREE,
                   attributes=AD_CONFIG['attributes'])
        
        users = []
        for entry in conn.entries:
            user_data = {
                'username': str(entry.sAMAccountName),
                'name': str(entry.displayName),
                'department': str(entry.department) if hasattr(entry, 'department') else '',
                'email': str(entry.mail) if hasattr(entry, 'mail') else ''
            }
            users.append(user_data)
        
        return jsonify({
            'message': 'Users fetched successfully',
            'users': users
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/import-ad-users', methods=['POST'])
@login_required
def import_ad_users():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.get_json()
        users = data.get('users', [])
        
        imported = 0
        skipped = 0
        
        for user in users:
            # Check if user already exists
            if User.query.filter_by(username=user['username']).first():
                skipped += 1
                continue
            
            # Create new user
            new_user = User(
                username=user['username'],
                is_admin=False,
                has_voted=False
            )
            # Generate a random password
            password = secrets.token_urlsafe(12)
            new_user.set_password(password)
            
            db.session.add(new_user)
            imported += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {imported} users, skipped {skipped} existing users'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/fetch-ous', methods=['POST'])
@login_required
def fetch_ous():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Connect to AD
        server = Server(AD_CONFIG['server'], get_info=ALL)
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        # Search for all OUs
        conn.search(search_base=AD_CONFIG['base_dn'],
                   search_filter='(objectClass=organizationalUnit)',
                   search_scope=SUBTREE,
                   attributes=['distinguishedName', 'name', 'description'])
        
        ous = []
        for entry in conn.entries:
            ou_data = {
                'dn': str(entry.distinguishedName),
                'name': str(entry.name),
                'description': str(entry.description) if hasattr(entry, 'description') else ''
            }
            ous.append(ou_data)
        
        # Sort OUs by their DN length (to show hierarchy)
        ous.sort(key=lambda x: len(x['dn']))
        
        return jsonify({
            'message': 'OUs fetched successfully',
            'ous': ous
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voters-count')
@login_required
def get_voters_count():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        total_voters = User.query.count()
        return jsonify({'count': total_voters})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-votes', methods=['POST'])
@login_required
def delete_votes():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Delete all votes
        Vote.query.delete()
        # Reset vote counts for all employees
        Employee.query.update({Employee.votes: 0})
        # Reset has_voted for all users
        User.query.update({User.has_voted: False})
        
        db.session.commit()
        return jsonify({'message': 'All votes have been deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 