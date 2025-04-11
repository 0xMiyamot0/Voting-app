from ldap3 import Server, Connection, ALL, SUBTREE
from ad_config import AD_CONFIG
import datetime

def test_ou_extraction():
    try:
        print("Testing OU extraction from AD...")
        
        # Connect to AD
        server = Server(AD_CONFIG['server'], get_info=ALL)
        print(f"Connecting to AD server: {AD_CONFIG['server']}")
        
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        print(f"Connected to AD server. Bound as: {AD_CONFIG['user_dn']}")
        
        # Search for users
        conn.search(search_base=AD_CONFIG['search_base'],
                   search_filter=AD_CONFIG['search_filter'],
                   search_scope=SUBTREE,
                   attributes=['sAMAccountName', 'displayName', 'distinguishedName'])
        
        print(f"Search completed. Found {len(conn.entries)} users")
        
        # Extract and display OU for each user
        print("\nSample users with their OUs:")
        for i, entry in enumerate(conn.entries[:10]):  # Show first 10 users
            username = str(entry.sAMAccountName)
            display_name = str(entry.displayName) if hasattr(entry, 'displayName') else username
            
            # Extract OU from distinguishedName
            ou = "Unknown"
            if hasattr(entry, 'distinguishedName'):
                dn = str(entry.distinguishedName)
                # Extract OU from DN (format: CN=username,OU=ou_name,DC=domain,DC=com)
                ou_parts = dn.split(',')
                for part in ou_parts:
                    if part.startswith('OU='):
                        ou = part[3:]  # Remove 'OU=' prefix
                        break
            
            print(f"{i+1}. {username} ({display_name}) - OU: {ou}")
        
        print("\nOU extraction test completed!")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_ou_extraction() 