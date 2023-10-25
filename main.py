from datetime import datetime
from flask import Flask, render_template, request, send_from_directory, session, jsonify, redirect
import os
import jwt #upm package(pyjwt)
from pprint import pprint
import secrets
import json
from uuid import uuid4
from config import API_URL, public_keys, AUDIENCE

app = Flask(__name__)
app.secret_key = secrets.token_hex()


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
        #if the user is still wuthenticated with hanko, auto log in
        #otherwise, ask to login
        return redirect("/auth2")
        # return render_template("home.html")
    return render_template("todo.html", API_URL=API_URL)

@app.route("/auth")
def auth():
    return render_template("auth.html", API_URL=API_URL)

@app.route("/auth2") 
def auth2():
    # Retrieve the JWT from the cookie
    jwt_cookie = request.cookies.get("hanko")
    # print(jwt_cookie)
    if not jwt_cookie:
        return redirect("/auth")
    try:
        kid = jwt.get_unverified_header(jwt_cookie)["kid"]
        public_key = public_keys[kid]
        payload = jwt.decode(
            str(jwt_cookie), 
            public_key,
            algorithms=["RS256"],
            audience=AUDIENCE,
        )
        pprint(payload)
    except Exception as e:
        # The JWT is invalid
        print(e)
        session.clear()
        return redirect("/auth")
    secret = secrets.token_hex(16)
    sessions[secret] = payload["sub"]
    session['biscuit'] = secret
    if not os.path.exists(f"tasks/{payload['sub']}.json"):
        with open(f"tasks/{payload['sub']}.json", "w") as f: 
            f.write(DEFAULT_TASKS_LIST)
    redirect_url = request.args.get("redirect_url")
    if redirect_url:
        return redirect(f"/{redirect_url}")
    return redirect("/")

@app.route("/auth_check")
def auth_check(): 
    if session["biscuit"] in sessions.keys():
        return sessions[session["biscuit"]]
    else: 
        return "No session found"

@app.route("/account")
def account():
    return render_template("account.html", API_URL=API_URL)

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
            audience=AUDIENCE,
        )
        pprint(payload)
        # The JWT is valid, you can use the payload
        # to authenticate requests on your backend
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

@app.route("/logout")
def logout():
    biscuit = session["biscuit"]
    old = sessions.pop(biscuit)
    session.clear()
    if old: 
        return '{"message": "cleared successfully"}'
    else: 
        return '{"message": "no matching session found"}', 404





@app.route("/tasks.json")
def tasks():
    sesh = session['biscuit']
    user = sessions[sesh]
    with open(f"tasks/{user}.json") as f:
        user_tasks = f.read()
    return jsonify(
        json.loads(user_tasks)
    )


@app.route('/tasks/create', methods=['POST'])
def create_task():
    user_id = sessions[session['biscuit']]
    task_data = request.get_json()  # Assuming the task data is sent in the request body
    task_file_path = f"tasks/{user_id}.json"

    assert os.path.exists(task_file_path)
    with open(task_file_path, 'r') as file:
        tasks = json.load(file)


    # Make dictionary of task details
    ID = str(uuid4())
    task = {
        "name": task_data["name"],
        "subtasks": {}
    }

    # Add date to dictionary
    try:
        datetime.strptime(task_data["due_date"], "%Y-%m-%d")
        print("The date is in the correct format!")
        task["due_date"] = task_data["due_date"]
    except KeyError:
        print("No date")
    except ValueError:
        print("The date is not in the correct format or missing.")
        task["due_date"] = "1970-01-01"

    # Add details to dictionary
    if task_data.get("details"):
        task["details"] = task_data["details"]


    path = task_data.get("path")
    #print(f"Path: {path}")

    if not path: 
        tasks["subtasks"][ID] = task
    else: 
        path = path.split("/")
        parent = tasks["subtasks"]
        for i in path:
            parent = parent[i]
        parent["subtasks"][ID] = task
        #print(parent)


    with open(task_file_path, 'w') as file:
        json.dump(tasks, file, indent=4)

    #pprint(tasks, depth=2)

    return jsonify({'message': 'Task created successfully'})

@app.route('/tasks/delete', methods=['POST'])
def delete_task():
    user_id = sessions[session['biscuit']]
    path = request.json['path']  # Assuming the task ID is passed as a query parameter
    task_file_path = f"tasks/{user_id}.json"

    if not os.path.exists(task_file_path):
        return jsonify({'message': 'User does not have any tasks'})

    with open(task_file_path, 'r') as file:
        tasks = json.load(file)

    #tasks = [task for task in tasks if task['id'] != task_id]

    #path = path
    parent = tasks["subtasks"]
    for i in path.split("/")[:-1]:
        parent = parent[i]
    #parent = parent["subtasks"]
    parent.pop(path.split("/")[-1])
    #print(parent)

    with open(task_file_path, 'w') as file:
        json.dump(tasks, file, indent=4)

    return jsonify({'message': 'success'})
    
@app.route('/tasks/modify', methods=['POST'])
def modify_task():
    user_id = sessions[session['biscuit']]
    task_file_path = f"tasks/{user_id}.json"
    assert os.path.exists(task_file_path)
    with open(task_file_path, 'r') as file:
        tasks = json.load(file)

    path = request.json["path"]

    parent = tasks["subtasks"]
    #print(path.split("/"))
    for i in path.split("/"):
        parent = parent[i]
    #parent = parent["subtasks"]
    #pprint(parent, depth=1, sort_dicts=False)


    #task_data = request.get_json()  # Assuming the modified task data is sent in the request body
    task_data = {
        "name": request.json.get("name"),
        "due_date": request.json.get("due_date"),
        "details": request.json.get("details")
    }
    task_data = {k: v for k, v in task_data.items() if v is not None} # Clear None values

    for key, value in task_data.items():
        parent[key] = value

    #pprint(tasks)

    with open(task_file_path, 'w') as file:
        json.dump(tasks, file, indent=4)

    return jsonify({'message': 'Task modified successfully'})

@app.route('/tasks/complete', methods=['POST'])
def complete_task():
    user_id = sessions[session['biscuit']]
    path = request.json['path']  # Assuming the task ID is passed as a query parameter
    task_file_path = f"tasks/{user_id}.json"

    if not os.path.exists(task_file_path):
        return jsonify({'message': 'User does not have any tasks'})

    with open(task_file_path, 'r') as file:
        tasks = json.load(file)

    #tasks = [task for task in tasks if task['id'] != task_id]

    #path = path
    parent = tasks["subtasks"]
    for i in path.split("/")[:-1]:
        parent = parent[i]
    #parent = parent["subtasks"]
    t = parent.pop(path.split("/")[-1])
    
    t["id"] = path.split("/")[-1]
    t["path"] = path.split("/")[:-2]
    print(t)

    if not tasks.get("completed"):
        tasks["completed"] = []
    
    tasks["completed"].append(t)

    with open(task_file_path, 'w') as file:
        json.dump(tasks, file, indent=4)

    return jsonify({'message': 'success'})


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.root_path,
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/manifest.json')
def get_manifest():
    with open('static/manifest.json') as f:
        return jsonify(json.load(f))


# No caching at all for API endpoints.
@app.after_request
def add_header(response):
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store'
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
