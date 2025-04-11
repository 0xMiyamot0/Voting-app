AD_CONFIG = {
    'server': 'ldap://192.168.2.111',  # Using LDAP instead of LDAPS
    'base_dn': 'DC=zimg,DC=local',  # Domain name
    'user_dn': 'administrator@zimg.local',  # Using UPN format
    'password': '3CAteRa@TENDha',  # Admin password
    'search_base': 'DC=zimg,DC=local',  # Base search path
    'search_filter': '(&(objectClass=user)(objectCategory=person))',  # Filter for all users
    'attributes': [
        'sAMAccountName',    # Username
        'displayName',       # Full name
        'department',        # Department
        'mail',             # Email
        'title',            # Job title
        'telephoneNumber',  # Phone number
        'mobile',           # Mobile number
        'manager',          # Manager
        'memberOf',         # Group memberships
        'lastLogonTimestamp', # Last login time
        'distinguishedName'  # Full DN including OU
    ]
} 