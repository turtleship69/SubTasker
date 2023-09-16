import requests, jwt

API_URL = "https://86480f40-596b-4bb1-a8b1-8bb9f84b26b5.hanko.io"

AUDIENCE = "localhost"


# Retrieve the JWKS from the Hanko API
jwks_url = f"{API_URL}/.well-known/jwks.json"
jwks_response = requests.get(jwks_url)
jwks_data = jwks_response.json()
public_keys = {}
for jwk in jwks_data["keys"]:
    kid = jwk["kid"]
    public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)