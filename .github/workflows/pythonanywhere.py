# this file is run by github actions and reloads the pythonanywhere webapp
from sys import argv
from pprint import pprint
import requests

username = argv[1]
token = argv[2]
host = argv[3]

# get recent console from /api/v0/user/{username}/consoles/
response = requests.get(
    f"https://{host}/api/v0/user/{username}/consoles/",
    headers={"Authorization": f"Token {token}"},
)

data = response.json()

pprint(data)

if data[0]['working_directory'] == f'/home/{username}/SubTasker':
    pass
elif data.get(-1)['working_directory'] == f'/home/{username}/SubTasker':
    pass
else:
    # change dir to above path sending request to /api/v0/user/{username}/consoles/{id}/send_input/
    response = requests.post(
        f"https://{host}/api/v0/user/{username}/consoles/{data[0]['id']}/send_input/",
        headers={"Authorization": f"Token {token}"},
        data={"input": "cd /home/{username}/SubTasker\n"}
    )

#pull latest git changes
response = requests.post(
    f"https://{host}/api/v0/user/{username}/consoles/{data[-1]['id']}/send_input/",
    headers={"Authorization": f"Token {token}"},
    data={"input": "git pull\n"}
)

data = response.json()
pprint(data)

#reload app making request to /api/v0/user/{username}/webapps/{domain_name}/reload/
response = requests.post(
    f"https://{host}/api/v0/user/{username}/webapps/{username}.pythonanywhere.com/reload/",
    headers={"Authorization": f"Token {token}"}
)

data = response.json()
pprint(data)