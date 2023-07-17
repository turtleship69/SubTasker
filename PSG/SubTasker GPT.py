import PySimpleGUI as sg
import json

# Load tasks from JSON file
def load_tasks():
    with open("tasks.json", "r") as file:
        data = json.load(file)
    return data["todos"]

# Update tasks in JSON file
def save_tasks(tasks):
    with open("tasks.json", "w") as file:
        json.dump({"todos": tasks}, file)

# Build the GUI
def build_gui(tasks):
    layout = [
        [sg.Text("Todo List", font=("Helvetica", 20))],
        [sg.Listbox(values=tasks, size=(40, 10), key="-TASKS-", enable_events=True)],
        [sg.InputText(key="-INPUT-"), sg.Button("Add"), sg.Button("Complete"), sg.Button("Remove")],
        [sg.Button("Exit")]
    ]

    return sg.Window("Todo List App", layout)

# Format tasks for display in the listbox
def format_tasks(tasks, indentation=0):
    formatted_tasks = []
    for task in tasks:
        formatted_tasks.append("   " * indentation + task["title"])
        if task["todos"]:
            subtasks = format_tasks(task["todos"], indentation + 1)
            formatted_tasks.extend(subtasks)
    return formatted_tasks

# Main function
def main():
    tasks = load_tasks()
    window = build_gui(format_tasks(tasks))

    while True:
        event, values = window.read()

        if event == "Exit" or event == sg.WINDOW_CLOSED:
            break

        if event == "-TASKS-":
            selected_tasks = values["-TASKS-"]
            if selected_tasks:
                selected_task = selected_tasks[0]
                new_task = values["-INPUT-"]
                for task in tasks:
                    if task["title"] == selected_task:
                        task["todos"].append({"title": new_task, "completed": False, "todos": []})
                window["-TASKS-"].update(values=format_tasks(tasks))
                save_tasks(tasks)

        if event == "Add":
            new_task = values["-INPUT-"]
            selected_tasks = values["-TASKS-"]
            if selected_tasks:
                selected_task = selected_tasks[0]
                for task in tasks:
                    if task["title"] == selected_task:
                        task["todos"].append({"title": new_task, "completed": False, "todos": []})
            else:
                tasks.append({"title": new_task, "completed": False, "todos": []})
            window["-TASKS-"].update(values=format_tasks(tasks))
            save_tasks(tasks)

        if event == "Complete":
            selected_tasks = values["-TASKS-"]
            if selected_tasks:
                selected_task = selected_tasks[0]
                for task in tasks:
                    if task["title"] == selected_task:
                        task["completed"] = True
            window["-TASKS-"].update(values=format_tasks(tasks))
            save_tasks(tasks)

        if event == "Remove":
            selected_tasks = values["-TASKS-"]
            if selected_tasks:
                selected_task = selected_tasks[0]
                tasks = [task for task in tasks if task["title"] != selected_task]
                window["-TASKS-"].update(values=format_tasks(tasks))
                save_tasks(tasks)

    window.close()

if __name__ == "__main__":
    main()
