import PySimpleGUI as sg
import json
from pprint import pprint, PrettyPrinter
pp = PrettyPrinter(indent=4, depth=4, sort_dicts=False)

# Load tasks from JSON file
with open('tasks.json', 'r') as file:
    tasks_data = json.load(file)
tasks = tasks_data['subtasks']

# Function to create the task list with proper indentation and paths
def create_task_list(tasks, level=0, path=''):
    task_list = []
    task_paths = {}
    for i, task in enumerate(tasks):
        indent = '    ' * level  # Four spaces per level of indentation
        task_name = indent + task['name']
        task_path = f"{path}/{i}"
        task_list.append(task_name)
        task_paths[task_name] = task_path
        subtasks = task.get('subtasks')
        if subtasks:
            subtask_list, subtask_paths = create_task_list(subtasks, level + 1, task_path)
            task_list.extend(subtask_list)
            task_paths.update(subtask_paths)
    return task_list, task_paths


# Create the task list for the UI
task_list, task_paths = create_task_list(tasks)



print("task paths:")
pprint(task_paths, depth=4, sort_dicts=False)


# PySimpleGUI UI layout
layout = [
    [
        sg.Listbox(values=task_list, size=(50, 20), key='-TASK LIST-', enable_events=True),
        sg.VSeperator(),
        sg.Column([
            [sg.Text('Name:', font='Any 12 bold', key="key")],
            [sg.InputText('', size=(30, 1), key='-NAME-')],
            [sg.Text('Due Date:', font='Any 12 bold')],
            [sg.InputText('', size=(30, 1), key='-DUE DATE-')],
            [sg.Text('Details:', font='Any 12 bold')],
            [sg.Multiline('', size=(30, 5), key='-DETAILS-')],
            [sg.Text('Image:', font='Any 12 bold')],
            [sg.InputText('', size=(30, 1), key='-IMAGE-')],
            [sg.Button('Save', key='-SAVE-'), sg.Button('Delete', key='-DELETE-')]
        ])
    ]
]


# # Add checkboxes to the task list
# for i, task in enumerate(layout[0][0].get()):
#     layout[0][0][i] = sg.Checkbox(task, key=f'-CHECKBOX-{i}-')

# Create the window
window = sg.Window('To-Do List', layout, finalize=True)









# # Create the window
# window = sg.Window('To-Do List', layout, finalize=True)
print(task_list, "\n\n\n")





print("\n\n\n\n")
# Event loop
while True:
    event, values = window.read()
    print("\n\n")
    print(values)
    if event == sg.WINDOW_CLOSED:
        break
    elif event == '-TASK LIST-':
        selected_task_name = values['-TASK LIST-'][0]
        selected_task_path = task_paths[selected_task_name]  # Removed [0] since the value is a string path
        #print(f"path indices: {task_paths}")
        path_indices = selected_task_path.split('/')[1:]
        selected_task = tasks_data
    
        for index in path_indices:
            if isinstance(selected_task, dict) and 'subtasks' in selected_task:
                subtasks = selected_task['subtasks']
                if subtasks and int(index) < len(subtasks):
                    selected_task = subtasks[int(index)]
                else:
                    break
            else:
                break
    
        if isinstance(selected_task, dict):
            window['-NAME-'].update(selected_task.get('name', ''))
            window['-DUE DATE-'].update(selected_task.get('due_date', ''))
            window['-DETAILS-'].update(selected_task.get('details', ''))
            window['-IMAGE-'].update(selected_task.get('image_url', ''))
        else:
            # Reset the fields if the selected task is not found
            window['-NAME-'].update('')
            window['-DUE DATE-'].update('')
            window['-DETAILS-'].update('')
            window['-IMAGE-'].update('')
    elif event == '-SAVE-':
        selected_task_name = values['-TASK LIST-'][0]
        selected_task_path = task_paths[selected_task_name]
        path_indices = selected_task_path.split('/')[1:]
        selected_task = tasks_data
    
        for index in path_indices:
            selected_task = selected_task['subtasks'][int(index)]
        selected_task['name'] = values['-NAME-']
        selected_task['due_date'] = values['-DUE DATE-']
        selected_task['details'] = values['-DETAILS-']
        selected_task['image_url'] = values['-IMAGE-']
        with open('tasks.json', 'w') as file:
            json.dump(tasks_data, file, indent=4)
    elif event == '-DELETE-':
        if len(values['-TASK LIST-']) > 0:
            selected_task_name = values['-TASK LIST-'][0]
            selected_task_path = task_paths[selected_task_name]
            path_indices = selected_task_path.split('/')[1:]
            parent_task = tasks_data
            selected_task_index = None
    
            for index in path_indices[:-1]:
                parent_task = parent_task['subtasks'][int(index)]
            selected_task_index = int(path_indices[-1])
    
            if parent_task and 'subtasks' in parent_task and selected_task_index is not None:
                deleted_task = parent_task['subtasks'].pop(selected_task_index)
                with open('tasks.json', 'w') as file:
                    json.dump(tasks_data, file, indent=4)
    
                # Show popup for undo option
                if sg.popup_yes_no('Task deleted. Undo?', auto_close=True, auto_close_duration=3) == 'Yes':
                    parent_task['subtasks'].insert(selected_task_index, deleted_task)
                    with open('tasks.json', 'w') as file:
                        json.dump(tasks_data, file, indent=4)
    
                # Update the task list in the GUI
                pp.pprint(tasks_data)
                task_list, task_paths = create_task_list(tasks_data['subtasks'])
                window['-TASK LIST-'].update(values=task_list)
                window['-NAME-'].update('')
                window['-DUE DATE-'].update('')
                window['-DETAILS-'].update('')
                window['-IMAGE-'].update('')
                window['-TASK LIST-'].set_focus()

window.close()
