from app import db, app
from app import User, Employee, Vote
from sqlalchemy import text

def migrate():
    with app.app_context():
        # Drop the has_voted column from User table
        db.session.execute(text('ALTER TABLE user DROP COLUMN has_voted'))
        
        # Add created_at column to Vote table
        db.session.execute(text('ALTER TABLE vote ADD COLUMN created_at DATETIME'))
        
        # Add unique constraint to Vote table
        db.session.execute(text('''
            CREATE UNIQUE INDEX IF NOT EXISTS unique_user_employee_vote 
            ON vote (user_id, employee_id)
        '''))
        
        db.session.commit()

if __name__ == '__main__':
    migrate() 