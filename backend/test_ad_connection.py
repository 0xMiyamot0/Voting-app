from ldap3 import Server, Connection, ALL, SUBTREE
from ad_config import AD_CONFIG
import sys

def test_ad_connection():
    try:
        print(f"Attempting to connect to AD server: {AD_CONFIG['server']}")
        server = Server(AD_CONFIG['server'], get_info=ALL)
        
        print(f"Attempting to bind with user: {AD_CONFIG['user_dn']}")
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        print("Successfully connected to AD server")
        
        # Test search
        print(f"Testing search with base: {AD_CONFIG['search_base']}")
        conn.search(search_base=AD_CONFIG['search_base'],
                   search_filter=AD_CONFIG['search_filter'],
                   search_scope=SUBTREE,
                   attributes=['sAMAccountName'])
        
        print(f"Search successful. Found {len(conn.entries)} users")
        
        # Print first 5 users as a sample
        print("\nSample users:")
        for i, entry in enumerate(conn.entries[:5]):
            print(f"{i+1}. {entry.sAMAccountName}")
        
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing AD connection...")
    success = test_ad_connection()
    if success:
        print("\nAD connection test successful!")
        sys.exit(0)
    else:
        print("\nAD connection test failed!")
        sys.exit(1) 