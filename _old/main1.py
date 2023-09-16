from flask import Flask, render_template, request, make_response, session, jsonify
import os
import jwt #upm package(pyjwt)
import requests
from pprint import pprint
import secrets
import json

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
API_URL = "https://86480f40-596b-4bb1-a8b1-8bb9f84b26b5.hanko.io"#os.environ["HANKO_API_URL"]

# Retrieve the JWKS from the Hanko API
jwks_url = f"{API_URL}/.well-known/jwks.json"
jwks_response = requests.get(jwks_url)
jwks_data = jwks_response.json()
public_keys = {}
for jwk in jwks_data["keys"]:
    kid = jwk["kid"]
    public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(jwk) # type: ignore

pprint(public_keys)

# store session keys
sessions = {}

#default tasks list: 
with open("tasks/tasks.json") as f:
    DEFAULT_TASKS_LIST = f.read()

@app.route("/")
def index():
    sesh = session.get("biscuit")
    if sesh == None or sesh not in sessions.keys():
        session.clear()
        return 'Hello from Flask!<br><a href="/auth">/auth</a>'
    return render_template("todo.html")


@app.route("/auth")
def auth():
    return render_template("auth.html", API_URL=API_URL)

@app.route("/auth2") 
def auth2():
    error = None
    # Retrieve the JWT from the cookie
    jwt_cookie = request.cookies.get("hanko")
    # print(jwt_cookie)
    if not jwt_cookie:
        error = {
            "error": "Missing cookie",
            "clickable_link": {
                "url": "/",
                "title": "Homepage"
            },
            "auto_link": "/auth",
        }
    try:
        kid = jwt.get_unverified_header(jwt_cookie)["kid"]
        public_key = public_keys[kid]
        payload = jwt.decode(
            str(jwt_cookie), 
            public_key,
            algorithms=["RS256"],
            audience="localhost",
        )
        pprint(payload)
    except Exception as e:
        # The JWT is invalid
        print(e)
        params = {
            "error": str(e),
            "clickable_link": {
                "url": "/",
                "title": "Homepage"
            },
            "auto_link": "/auth",
        }
        return render_template("error.html", **params), 401
    secret = secrets.token_hex(16)
    sessions[secret] = payload["sub"]
    session['biscuit'] = secret
    if not os.path.exists(f"tasks/{payload['sub']}"):
        with open(f"tasks/{payload['sub']}.json", "w") as f: 
            f.write(DEFAULT_TASKS_LIST)
    return '<a href = "/auth3">👍</a>'

@app.route("/auth3")
def auth3(): 
    return sessions[session["biscuit"]]



@app.route("/post_auth")
def post_auth():
    # Retrieve the JWT from the cookie
    jwt_cookie = request.cookies.get("hanko")
    print(jwt_cookie)
    if not jwt_cookie:
        return "missing token"
    try:
        kid = jwt.get_unverified_header(jwt_cookie)["kid"]
        public_key = public_keys[kid]
        payload = jwt.decode(
            jwt_cookie,
            public_key,
            algorithms=["RS256"],
            audience="localhost",
        )
        pprint(payload)
        # sub = payload["sub"]
        # headers = {
        #     "Authorization": f"Bearer {jwt_cookie}",
        #     "Content-Type": "application/json",
        # }
        # url = f"{API_URL}/users/{sub}"
        # print(url)
        # r = requests.get(url, headers=headers)
        # pprint(r.json())
        # The JWT is valid, you can use the payload to authenticate requests on your backend
    except Exception as e:
        # The JWT is invalid
        print(e)
        params = {
            "error": str(e),
            "clickable_link": {
                "url": "/",
                "title": "Homepage"
            },
            "auto_link": "/auth",
        }
        return (
            render_template("error.html", **params),
            401,
        )
    
    return render_template("post_auth.html", API_URL=API_URL)


@app.route("/tasks.json")
def tasks():
    sesh = session['biscuit']
    user = sessions[sesh]
    with open(f"tasks/{user}.json") as f:
        user_tasks = f.read()
    return jsonify(
        json.loads(user_tasks)
    )


app.run(host="0.0.0.0", port=80)
