from ldap3 import Server, Connection, ALL, SUBTREE
from ad_config import AD_CONFIG

def test_ad_connection():
    try:
        print("Attempting to connect to Active Directory...")
        print(f"Server: {AD_CONFIG['server']}")
        print(f"User DN: {AD_CONFIG['user_dn']}")
        
        # Create server object
        server = Server(AD_CONFIG['server'], get_info=ALL)
        print("\nServer info:")
        print(f"Host: {server.host}")
        print(f"Port: {server.port}")
        print(f"SSL: {server.ssl}")
        
        # Try to connect
        print("\nAttempting to bind...")
        conn = Connection(server, 
                        user=AD_CONFIG['user_dn'],
                        password=AD_CONFIG['password'],
                        auto_bind=True)
        
        print("\nConnection successful!")
        print(f"Authentication method: {conn.authentication}")
        
        # Test search
        print("\nTesting search...")
        conn.search(search_base=AD_CONFIG['base_dn'],
                   search_filter='(objectClass=user)',
                   search_scope=SUBTREE,
                   attributes=['sAMAccountName'],
                   size_limit=1)
        
        print(f"Search successful! Found {len(conn.entries)} entries")
        
        # Get root DSE
        print("\nRoot DSE information:")
        root_dse = server.info
        for attr in root_dse.raw['supportedLDAPVersion']:
            print(f"Supported LDAP version: {attr}")
        print(f"Server name: {root_dse.raw['serverName']}")
        print(f"Domain name: {root_dse.raw['rootDomainNamingContext']}")
        
        return True
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        return False

if __name__ == "__main__":
    test_ad_connection() 