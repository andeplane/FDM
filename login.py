# Use to login to "schema team testing" azure directory
import atexit
import os

from msal import PublicClientApplication, SerializableTokenCache

TENANT_ID = "431fcc8b-74b8-4171-b7c9-e6fab253913b"
CLIENT_ID = "140df241-50bf-4c16-a965-6fd4e5b87958"
CDF_CLUSTER = "bluefield"

CACHE_FILENAME = "token_cache.bin"
SCOPES = [f"https://{CDF_CLUSTER}.cognitedata.com/.default"]

AUTHORITY_HOST_URI = "https://login.microsoftonline.com"
AUTHORITY_URI = AUTHORITY_HOST_URI + "/" + TENANT_ID
PORT = 8095


def create_cache():
    cache = SerializableTokenCache()
    if os.path.exists(CACHE_FILENAME):
        cache.deserialize(open(CACHE_FILENAME, "r").read())
    atexit.register(lambda:
        open(CACHE_FILENAME, "w").write(cache.serialize()) if cache.has_state_changed else None
    )
    return cache


def authenticate_azure(app):
    # Firstly, check the cache to see if this end user has signed in before
    accounts = app.get_accounts()
    if accounts:
        creds = app.acquire_token_silent(SCOPES, account=accounts[0])
    else:
        # interactive login - make sure you have http://localhost:port in Redirect URI in App Registration as type "Mobile and desktop applications"
        creds = app.acquire_token_interactive(scopes=SCOPES, port=PORT,)

    return creds


app = PublicClientApplication(client_id=CLIENT_ID, authority=AUTHORITY_URI, token_cache=create_cache())

print(authenticate_azure(app)["access_token"])
