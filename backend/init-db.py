from app import app, db, User, Employee

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if database is empty
        if User.query.first() is None:
            # Add admin user
            admin = User(username='admin', password='admin123', is_admin=True)
            db.session.add(admin)
            
            # Add regular user
            user = User(username='user', password='user123', is_admin=False)
            db.session.add(user)
            
            # Add initial employees grouped by department
            employees = [
                # فنی (Technical)
                Employee(name='علی محمدی', department='فنی'),
                Employee(name='نازنین جعفری', department='فنی'),
                Employee(name='رضا حسینی', department='فنی'),
                Employee(name='سارا رضایی', department='فنی'),
                Employee(name='محمد کریمی', department='فنی'),
                Employee(name='فاطمه موسوی', department='فنی'),
                
                # مالی (Financial)
                Employee(name='مریم احمدی', department='مالی'),
                Employee(name='امیر علیزاده', department='مالی'),
                Employee(name='لیلا محمدی', department='مالی'),
                Employee(name='حسین رضوانی', department='مالی'),
                Employee(name='زهرا صادقی', department='مالی'),
                Employee(name='مهدی قاسمی', department='مالی'),
                
                # فروش (Sales)
                Employee(name='سعید رحیمی', department='فروش'),
                Employee(name='نرگس محمدی', department='فروش'),
                Employee(name='محسن کریمی', department='فروش'),
                Employee(name='زینب احمدی', department='فروش'),
                Employee(name='علی اکبری', department='فروش'),
                Employee(name='مرضیه رضایی', department='فروش'),
                
                # بازاریابی (Marketing)
                Employee(name='حسن محمدی', department='بازاریابی'),
                Employee(name='فریبا جعفری', department='بازاریابی'),
                Employee(name='محمدرضا حسینی', department='بازاریابی'),
                Employee(name='زهرا رضایی', department='بازاریابی'),
                Employee(name='علی کریمی', department='بازاریابی'),
                Employee(name='نرگس موسوی', department='بازاریابی'),
                
                # پشتیبانی (Support)
                Employee(name='محمد احمدی', department='پشتیبانی'),
                Employee(name='زهرا علیزاده', department='پشتیبانی'),
                Employee(name='رضا محمدی', department='پشتیبانی'),
                Employee(name='فاطمه رضوانی', department='پشتیبانی'),
                Employee(name='سعید صادقی', department='پشتیبانی'),
                Employee(name='مریم قاسمی', department='پشتیبانی'),
            ]
            
            for employee in employees:
                db.session.add(employee)
            
            # Add initial voters
            voters = [
                User(username='voter1', password='pass123', is_admin=False),
                User(username='voter2', password='pass123', is_admin=False),
                User(username='voter3', password='pass123', is_admin=False),
                User(username='voter4', password='pass123', is_admin=False),
                User(username='voter5', password='pass123', is_admin=False),
                User(username='voter6', password='pass123', is_admin=False),
                User(username='voter7', password='pass123', is_admin=False),
                User(username='voter8', password='pass123', is_admin=False),
                User(username='voter9', password='pass123', is_admin=False),
                User(username='voter10', password='pass123', is_admin=False)
            ]
            
            for voter in voters:
                db.session.add(voter)
            
            db.session.commit()
            print("Database initialized with sample data!")
        else:
            print("Database already contains data. Skipping initialization.")

if __name__ == '__main__':
    init_db() 