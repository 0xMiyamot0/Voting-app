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
import re
from flask_migrate import Migrate
from jdatetime import datetime as jdatetime

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
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)
    is_imported = db.Column(db.Boolean, default=False)  # Flag to indicate if user was imported from AD
    last_vote_date = db.Column(db.DateTime)  # تاریخ آخرین رای

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    votes = db.Column(db.Integer, default=0)
    is_imported = db.Column(db.Boolean, default=False)  # Flag to indicate if employee was imported by admin

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    ratings = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'employee_id', name='unique_user_employee_vote'),
    )

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
                # Check for admin group membership
                is_admin = False
                if hasattr(user_data, 'memberOf'):
                    admin_groups = ['CN=Domain Admins', 'CN=Enterprise Admins', 'CN=Administrators']
                    for group in user_data.memberOf:
                        if any(admin_group in str(group) for admin_group in admin_groups):
                            is_admin = True
                            break
                
                return {
                    'success': True,
                    'user_info': {
                        'username': username,
                        'display_name': str(user_data.displayName) if hasattr(user_data, 'displayName') else username,
                        'department': str(user_data.department) if hasattr(user_data, 'department') else '',
                        'is_admin': is_admin
                    }
                }
        return {'success': False, 'error': 'Invalid credentials'}
    except Exception as e:
        print(f"AD Authentication error: {str(e)}")  # Add debug logging
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
                'name': auth_result['user_info']['display_name'],
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
                'name': username
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/check-auth', methods=['GET'])
@login_required
def check_auth():
    return jsonify({
        'is_admin': current_user.is_admin,
    })

@app.route('/api/employees')
@login_required
def get_employees():
    try:
        print("Fetching employees...")  # Debug print
        # Only get employees that were imported by admin
        employees = Employee.query.filter_by(is_imported=True).all()
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
        data = request.get_json()
        print("Received vote data:", data)
        
        if not data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        if 'employeeId' not in data:
            return jsonify({'error': 'Employee ID is required'}), 400
            
        if 'ratings' not in data:
            return jsonify({'error': 'Ratings are required'}), 400
            
        employee_id = data['employeeId']
        ratings = data['ratings']
        
        # Check if employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        # Check if user has already voted for this employee
        existing_vote = Vote.query.filter_by(
            user_id=current_user.id,
            employee_id=employee_id
        ).first()
        
        if existing_vote:
            return jsonify({'error': 'You have already voted for this employee'}), 400
        
        # Check if user has voted this month
        if current_user.last_vote_date:
            last_vote_jdate = jdatetime.fromgregorian(datetime=current_user.last_vote_date)
            current_jdate = jdatetime.now()
            
            if last_vote_jdate.month == current_jdate.month and last_vote_jdate.year == current_jdate.year:
                return jsonify({'error': 'شما در این ماه قبلاً رای داده‌اید'}), 400
        
        # Check if user has reached the maximum number of votes
        user_votes = Vote.query.filter_by(user_id=current_user.id).count()
        if user_votes >= 3:
            return jsonify({'error': 'You have reached the maximum number of votes (3)'}), 400
        
        # Validate ratings
        if not isinstance(ratings, dict):
            return jsonify({'error': 'Invalid ratings format'}), 400
            
        if len(ratings) != 6:
            return jsonify({'error': 'All criteria must be rated'}), 400
        
        for criteria_id, rating in ratings.items():
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return jsonify({'error': f'Invalid rating value for criteria {criteria_id}: {rating}'}), 400
        
        # Create new vote
        vote = Vote(
            user_id=current_user.id,
            employee_id=employee_id,
            ratings=ratings
        )
        
        # Update employee votes
        employee.votes = (employee.votes or 0) + 1
        
        # Update user's last vote date
        current_user.last_vote_date = datetime.datetime.utcnow()
        
        db.session.add(vote)
        db.session.commit()
        
        return jsonify({'message': 'Vote recorded successfully'})
        
    except Exception as e:
        print(f"Error in vote endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/results')
@login_required
def get_results():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        selected_month = request.args.get('month')  # Get selected month from query parameters
        
        # Get all votes with their employees
        votes_query = db.session.query(Vote, Employee).join(Employee)
        
        # If a specific month is selected, filter the votes
        if selected_month:
            votes = votes_query.all()
            filtered_votes = []
            
            for vote, employee in votes:
                vote_date = jdatetime.fromgregorian(datetime=vote.created_at)
                if str(vote_date.month) == selected_month:
                    filtered_votes.append((vote, employee))
            
            # Create a dictionary to store aggregated votes for each employee
            employee_votes = {}
            for vote, employee in filtered_votes:
                if employee.id not in employee_votes:
                    employee_votes[employee.id] = {
                        'id': employee.id,
                        'name': employee.name,
                        'department': employee.department,
                        'votes': 0,
                        'total_rating': 0
                    }
                employee_votes[employee.id]['votes'] += 1
                employee_votes[employee.id]['total_rating'] += sum(vote.ratings.values()) / len(vote.ratings)
            
            # Convert to list and calculate average ratings
            results = []
            for emp_data in employee_votes.values():
                if emp_data['votes'] > 0:
                    results.append({
                        'id': emp_data['id'],
                        'name': emp_data['name'],
                        'department': emp_data['department'],
                        'votes': emp_data['votes']
                    })
            
            # Sort by number of votes
            results.sort(key=lambda x: x['votes'], reverse=True)
            
        else:
            # If no month selected, return all results
            employees = Employee.query.order_by(Employee.votes.desc()).all()
            results = [{
                'id': emp.id,
                'name': emp.name,
                'department': emp.department,
                'votes': emp.votes
            } for emp in employees]
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in get_results: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
        print(f"Connecting to AD server: {AD_CONFIG['server']}")
        
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        print(f"Connected to AD server. Bound as: {AD_CONFIG['user_dn']}")
        
        # Calculate date 1 month ago in Windows filetime format
        one_month_ago = datetime.datetime.now() - datetime.timedelta(days=30)
        windows_epoch = datetime.datetime(1601, 1, 1)
        delta = one_month_ago - windows_epoch
        one_month_ago_ts = int(delta.total_seconds() * 10000000)  # Convert to Windows filetime
        
        # Search for users who have been active in the last month
        search_filter = f'(&{AD_CONFIG["search_filter"]}(lastLogonTimestamp>={one_month_ago_ts})(!(memberOf=OU=OUTPUTMESENGER,DC=zimg,DC=local)))'
        
        print(f"Searching with filter: {search_filter}")
        print(f"Search base: {AD_CONFIG['search_base']}")
        
        # Search for users
        conn.search(search_base=AD_CONFIG['search_base'],
                   search_filter=search_filter,
                   search_scope=SUBTREE,
                   attributes=AD_CONFIG['attributes'])
        
        print(f"Search completed. Found {len(conn.entries)} active users")
        
        users = []
        for entry in conn.entries:
            # Skip users in OUTPUTMESENGER OU
            if hasattr(entry, 'distinguishedName'):
                dn = str(entry.distinguishedName)
                if 'OU=OUTPUTMESENGER' in dn:
                    continue

            # Convert lastLogonTimestamp to readable date if available
            last_logon = "Unknown"
            if hasattr(entry, 'lastLogonTimestamp') and entry.lastLogonTimestamp:
                try:
                    # Convert Windows filetime to datetime
                    last_logon_ts = int(str(entry.lastLogonTimestamp))
                    if last_logon_ts > 0:
                        # Windows filetime starts from 1601-01-01
                        windows_epoch = datetime.datetime(1601, 1, 1)
                        delta = datetime.timedelta(microseconds=last_logon_ts / 10)
                        last_logon_date = windows_epoch + delta
                        last_logon = last_logon_date.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        last_logon = "Never"
                except (ValueError, TypeError, AttributeError) as e:
                    print(f"Error converting lastLogonTimestamp for user {entry.sAMAccountName}: {e}")
                    last_logon = "Unknown"
            
            # Extract OU from distinguishedName
            ou = "Unknown"
            if hasattr(entry, 'distinguishedName'):
                dn = str(entry.distinguishedName)
                # Extract all OUs from DN (format: CN=username,OU=sub_ou,OU=parent_ou,DC=domain,DC=com)
                ou_parts = [part[3:] for part in dn.split(',') if part.startswith('OU=')]
                if ou_parts:
                    # Join all OUs with ' > ' to show hierarchy
                    ou = ' > '.join(reversed(ou_parts))
            
            user_data = {
                'username': str(entry.sAMAccountName),
                'name': str(entry.displayName),
                'ou': ou,
                'last_logon': last_logon
            }
            users.append(user_data)
        
        return jsonify({
            'message': 'Users fetched successfully',
            'users': users
        })
        
    except Exception as e:
        print(f"Error in fetch_ad_users: {str(e)}")
        return jsonify({'error': f'خطا در دریافت اطلاعات کاربران از Active Directory: {str(e)}'}), 500

@app.route('/api/import-ad-users', methods=['POST'])
@login_required
def import_ad_users():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.get_json()
        users = data.get('users', [])
        target_group = data.get('target_group')  # Get the target group from request
        
        if not target_group:
            return jsonify({'error': 'Target group is required'}), 400
        
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
                is_imported=True  # Mark as imported from AD
            )
            # Generate a random password
            password = secrets.token_urlsafe(12)
            new_user.set_password(password)
            
            db.session.add(new_user)
            
            # Create employee record with the target group as department
            new_employee = Employee(
                name=user['name'],
                department=target_group,  # Use the selected target group
                is_imported=True  # Mark as imported by admin
            )
            db.session.add(new_employee)
            
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
        print("Starting fetch_ous...")
        # Connect to AD
        server = Server(AD_CONFIG['server'], get_info=ALL)
        print(f"Connecting to AD server: {AD_CONFIG['server']}")
        
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        print("Connected to AD server")
        
        # First search for all OUs
        print("Searching for OUs...")
        conn.search(search_base=AD_CONFIG['base_dn'],
                   search_filter='(objectClass=organizationalUnit)',
                   search_scope=SUBTREE,
                   attributes=['name', 'distinguishedName'])
        
        print(f"Found {len(conn.entries)} OUs")
        
        # Get all OUs first
        all_ous = {}
        for entry in conn.entries:
            if hasattr(entry, 'distinguishedName'):
                dn = str(entry.distinguishedName)
                name = str(entry.name) if hasattr(entry, 'name') else dn.split(',')[0].split('=')[1]
                all_ous[dn] = {'name': name, 'active_users': 0}
                print(f"Found OU: {name} ({dn})")
        
        # Calculate date 1 month ago in Windows filetime format
        one_month_ago = datetime.datetime.now() - datetime.timedelta(days=30)
        windows_epoch = datetime.datetime(1601, 1, 1)
        delta = one_month_ago - windows_epoch
        one_month_ago_ts = int(delta.total_seconds() * 10000000)
        
        # Now search for active users
        print("Searching for active users...")
        user_filter = f'(&{AD_CONFIG["search_filter"]}(lastLogonTimestamp>={one_month_ago_ts}))'
        conn.search(search_base=AD_CONFIG['base_dn'],
                   search_filter=user_filter,
                   search_scope=SUBTREE,
                   attributes=['distinguishedName'])
        
        print(f"Found {len(conn.entries)} active users")
        
        # Count active users in each OU
        for entry in conn.entries:
            if hasattr(entry, 'distinguishedName'):
                user_dn = str(entry.distinguishedName)
                # Extract OU part from user's DN
                ou_parts = [part for part in user_dn.split(',') if part.startswith('OU=')]
                if ou_parts:
                    # Get the immediate parent OU
                    parent_ou = ','.join(user_dn.split(',')[1:])  # Remove CN part
                    if parent_ou in all_ous:
                        all_ous[parent_ou]['active_users'] += 1
                        print(f"Incrementing active users for OU: {all_ous[parent_ou]['name']}")
        
        # Filter OUs with active users and exclude OUTPUTMESENGER
        ous = [
            {'name': ou_data['name'], 'active_users': ou_data['active_users']}
            for ou_data in all_ous.values()
            if ou_data['active_users'] > 0 and ou_data['name'].lower() != 'outputmesenger'
        ]
        
        # Sort OUs by name
        ous.sort(key=lambda x: x['name'])
        
        print(f"Returning {len(ous)} OUs with active users")
        return jsonify({
            'message': 'OUs fetched successfully',
            'ous': ous
        })
        
    except Exception as e:
        print(f"Error in fetch_ous: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/fetch-ou-users', methods=['POST'])
@login_required
def fetch_ou_users():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.get_json()
        ou_name = data.get('ou_name')
        
        if not ou_name:
            return jsonify({'error': 'OU name is required'}), 400
        
        print(f"Fetching users for OU: {ou_name}")
        
        # Connect to AD
        server = Server(AD_CONFIG['server'], get_info=ALL)
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        # Calculate date 1 month ago in Windows filetime format
        one_month_ago = datetime.datetime.now() - datetime.timedelta(days=30)
        windows_epoch = datetime.datetime(1601, 1, 1)
        delta = one_month_ago - windows_epoch
        one_month_ago_ts = int(delta.total_seconds() * 10000000)
        
        # First, find the OU's distinguished name
        print("Searching for OU's distinguished name...")
        ou_filter = f'(name={ou_name})'
        conn.search(search_base=AD_CONFIG['base_dn'],
                   search_filter=ou_filter,
                   search_scope=SUBTREE,
                   attributes=['distinguishedName'])
        
        if not conn.entries:
            return jsonify({'error': f'OU {ou_name} not found'}), 404
        
        ou_dn = str(conn.entries[0].distinguishedName)
        print(f"Found OU DN: {ou_dn}")
        
        # Now search for active users in this OU
        search_filter = f'(&{AD_CONFIG["search_filter"]}(lastLogonTimestamp>={one_month_ago_ts}))'
        print(f"Search filter: {search_filter}")
        print(f"Search base: {ou_dn}")
        
        conn.search(search_base=ou_dn,
                   search_filter=search_filter,
                   search_scope=SUBTREE,
                   attributes=AD_CONFIG['attributes'])
        
        print(f"Found {len(conn.entries)} active users in OU {ou_name}")
        
        users = []
        for entry in conn.entries:
            # Skip users in OUTPUTMESENGER OU
            if hasattr(entry, 'distinguishedName'):
                dn = str(entry.distinguishedName)
                if 'OU=OUTPUTMESENGER' in dn:
                    continue
            
            user_data = {
                'username': str(entry.sAMAccountName),
                'name': str(entry.displayName)
            }
            users.append(user_data)
        
        return jsonify({
            'message': f'Users in OU {ou_name} fetched successfully',
            'users': users
        })
        
    except Exception as e:
        print(f"Error in fetch_ou_users: {str(e)}")
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
        
        db.session.commit()
        return jsonify({'message': 'All votes have been deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-ad-users', methods=['POST'])
@login_required
def delete_ad_users():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Get all users except the current admin user
        users_to_delete = User.query.filter(User.id != current_user.id).all()
        
        # Count users before deletion
        count = len(users_to_delete)
        
        # Delete all votes associated with these users
        for user in users_to_delete:
            Vote.query.filter_by(user_id=user.id).delete()
        
        # Delete all employees that were imported from AD
        Employee.query.filter_by(is_imported=True).delete()
        
        # Delete all users
        for user in users_to_delete:
            db.session.delete(user)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully deleted {count} users imported from Active Directory',
            'count': count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/vote/status', methods=['GET'])
@login_required
def get_vote_status():
    try:
        votes = Vote.query.filter_by(user_id=current_user.id).all()
        voted_employees = [vote.employee_id for vote in votes]
        
        return jsonify({
            'hasVoted': len(votes) >= 3,
            'votesCount': len(votes),
            'votesRemaining': max(0, 3 - len(votes)),
            'votedEmployees': voted_employees
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/<int:employee_id>/ratings', methods=['GET'])
@login_required
def get_employee_ratings(employee_id):
    try:
        # Get employee details
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'message': 'کارمند یافت نشد'}), 404

        # Get all votes for this employee
        votes = Vote.query.filter_by(employee_id=employee_id).all()
        
        # Get voter names
        voter_names = {}
        for vote in votes:
            voter = User.query.get(vote.user_id)
            if voter:
                voter_names[vote.user_id] = voter.username

        # Calculate average rating for each criterion
        criteria_ratings = {str(i): {'total': 0, 'count': 0} for i in range(1, 7)}
        for vote in votes:
            for i in range(1, 7):
                rating = vote.ratings.get(str(i), 0)
                criteria_ratings[str(i)]['total'] += rating
                criteria_ratings[str(i)]['count'] += 1

        # Calculate averages
        criteria_averages = {}
        for i in range(1, 7):
            if criteria_ratings[str(i)]['count'] > 0:
                criteria_averages[str(i)] = criteria_ratings[str(i)]['total'] / criteria_ratings[str(i)]['count']
            else:
                criteria_averages[str(i)] = 0

        # Format response
        response = {
            'id': employee.id,
            'name': employee.name,
            'department': employee.department,
            'votes': len(votes),
            'criteriaAverages': criteria_averages,
            'ratings': [
                {
                    'voterName': voter_names.get(vote.user_id, 'ناشناس'),
                    'criteriaRatings': vote.ratings,
                    'averageScore': sum(vote.ratings.values()) / 6,
                    'date': vote.created_at.isoformat()
                }
                for vote in votes
            ]
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({'message': f'خطا در دریافت اطلاعات: {str(e)}'}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 