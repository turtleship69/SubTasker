# Subtasker

Subtasker is a to-do list web application designed to help you stay organized and manage your tasks effectively. 

## Features

- Log in easily with [passkeys](https://passkeys.io)
- Create, edit, complete, and delete tasks easily
- Organize tasks into subtasks
- User-friendly interface with a responsive design

## Technologies Used

- Backend: Flask
- Frontend: HTML, JavaScript
- Authentication: Hanko

## Self Hosting

1. Clone the repository.
2. Install the required dependencies using `pip install -r requirements.txt`.
3. Update the AUDIENCE (domain you are hosting on, localhost is the easiest option as a secure origin in required to use passkeys) and HANKO_URL (sign up for [Hanko cloud](https://hanko.io) for free) in [config.py](config.py).
4. Run the Flask development server using `python main.py`.
5. Access the application in your browser at `http://localhost` (or on your LAN/WAN ip on port 80).  
   Note that a secure context is needed for passkeys, so you need to either use localhost or a domain with https. 

## Usage

- Sign up or log in to your account. 
- If you have just signed up, or are on a new device, you can add a [passkeys](https://passkeys.io) for faster login next time
- (Optional - select a task you want to make a sub task under.)
- Create a new task by selecting new task, and entering the task details.
- Edit or delete tasks as needed.
- Mark tasks as complete or incomplete.
- Stay organized and track your progress effectively with Subtasker!

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [GPL-3.0 license](LICENSE).