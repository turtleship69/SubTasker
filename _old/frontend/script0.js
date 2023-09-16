$(document).ready(function () {
    // Load tasks from JSON file
    $.getJSON('tasks.json', function (tasksData) {
        var tasks = tasksData['subtasks'];

        var completedTasks = [];

        // Function to create the task list with proper indentation and paths
        function createTaskList(tasks, level = 0, path = '') {
            var taskList = [];
            var taskPaths = {};

            for (var i = 0; i < tasks.length; i++) {
                var indent = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(level); // Four spaces per level of indentation
                var task = tasks[i];
                var taskName = indent + task['name'];
                var taskPath = path + '/' + i;
                var indentedTaskName = level.toString() + '¬' + task['name'];
                taskList.push(taskName);
                taskPaths[indentedTaskName] = taskPath;

                var subtasks = task['subtasks'];
                if (subtasks) {
                    var subtaskData = createTaskList(subtasks, level + 1, taskPath);
                    taskList = taskList.concat(subtaskData[0]);
                    Object.assign(taskPaths, subtaskData[1]);
                }
            }

            return [taskList, taskPaths];
        }

        symmetricalTasks = {"subtasks": tasks};

        console.log("Symmetrical Tasks:");
        console.log(symmetricalTasks);

        //Helper function to go to the Xth task of a given task list
        function goToTask(taskList, x) {
            return taskList["subtasks"][x]
        }

        // Function to find full task path in readable format
        // nagivate through the full list of paths and return a string e.g. "Complete Project/Research/Read articles"
        function findTaskPath(taskPath) {
            //split the path into a list of strings and remove the first element which is empty
            var pathList = taskPath.split('/').slice(1);
            
            //go through tasks for the entire list 
            var fullTaskPath = '';
            var currentTaskList = symmetricalTasks;
            for (var i = 0; i < pathList.length; i++) {
                var currentTaskList = goToTask(currentTaskList, pathList[i]);
                fullTaskPath += currentTaskList['name'] + '/';
            }

            //remove the last char
            fullTaskPath = fullTaskPath.slice(0, -1);
            return fullTaskPath;
        }

        //Function to get task details 
        function getTaskDetails(taskPath) {
            //split the path into a list of strings and remove the first element which is empty
            var pathList = taskPath.split('/').slice(1);
            console.log(pathList);
            
            //add a string "subtasks" before each number
            fullPathArray = [];
            for (var i = 0; i < pathList.length; i++) {
                fullPathArray.push("subtasks");
                fullPathArray.push(pathList[i]);
            }
            console.log(fullPathArray);
            var task = _.get(symmetricalTasks, fullPathArray)
            console.log(task);
            return task;
        }

        function setTaskDetails(taskPath, taskDetails) {
            //split the path into a list of strings and remove the first element which is empty
            var pathList = taskPath.split('/').slice(1);
            console.log(pathList);
            
            //add a string "subtasks" before each number
            fullPathArray = [];
            for (var i = 0; i < pathList.length; i++) {
                fullPathArray.push("subtasks");
                fullPathArray.push(pathList[i]);
            }
            console.log(fullPathArray);
            _.set(symmetricalTasks, fullPathArray, taskDetails);
            console.log(symmetricalTasks);
            _.set(tasks, fullPathArray, taskDetails);
            console.log(tasks);
        }
        


        // Create the task list for the UI
        var taskData = createTaskList(tasks);
        var taskList = taskData[0];
        var taskPaths = taskData[1];


        // Add checkboxes to the task list
        var taskListItems = '';
        for (var i = 0; i < taskList.length; i++) {
            var task = taskList[i];
            taskListItems += '<div>' +
                '<input type="checkbox" id="checkbox-' + i + '" />' +
                '<label>' + task + '</label></div>'; // for="checkbox-' + i + '"
        }
        $('#task-list').html(taskListItems);

        // Event handler for selecting a task
        $('#task-list div').click(function(e) {
            //console.log(this)
            var checkbox = $(this).find('input[type="checkbox"]');
            if (!$(e.target).is(':checkbox')) {
                // Label or div clicked
                e.stopPropagation();
                
                // Add selected class to the div
                $('#task-list div').removeClass('selected-task');
                $(this).addClass('selected-task');
                return;
            } else {
                // Checkbox clicked
                $(this).toggleClass('completed-task');
                
                
                
                //log the label
                var label = $(this).find('label');
                //console.log(label.text());
                
                //log the path
                var key = `${label.text().search(/\S/) / 4}¬${label.text().trimStart()}`;
                console.log(key);
                var path = taskPaths[key];
                console.log(path);
                
                var fullTaskPath = findTaskPath(path);
                console.log(fullTaskPath);
                
                //add the task to the completed tasks
                pathArray = path.split('/');
                pathArray.shift();
                //add a string "subtasks" before each number
                fullPathArray = [];
                for (var i = 0; i < pathArray.length; i++) {
                    fullPathArray.push("subtasks");
                    fullPathArray.push(pathArray[i]);
                }
                console.log(fullPathArray);
                var task = _.get(symmetricalTasks, fullPathArray)
                console.log(task);
                
                //add the task to the global completed tasks list
                taskTuple = {};
                taskTuple[fullTaskPath] = task;
                console.log(JSON.stringify(taskTuple));
                console.log(`Completed tasks before: ${completedTasks}`);
                if ($(this).hasClass('completed-task')) {
                    completedTasks.push(taskTuple);
                }
                else
                {
                    var index = completedTasks.findIndex((item) => item = taskTuple);
                    console.log(index);
                    if (index > -1) {
                        completedTasks.splice(index, 1);
                    }
                }
                
                console.log(`Completed tasks after: ${JSON.stringify(completedTasks, null, 2)}`);
            }
        });
        
        // Event handler for updating the task details in the info box
        $('#task-list div').click(function () {
            var selectedTaskName = $(this).find('label').text();
            var indentationLevel = selectedTaskName.search(/\S/) / 4;
            var taskName = selectedTaskName.trimStart();
            var selectedTaskPath = taskPaths[`${indentationLevel}¬${taskName}`];

            var pathIndices = selectedTaskPath.split('/').slice(1);
            var selectedTask = getTaskDetails(selectedTaskPath);

            

            $('#name').val(selectedTask['name']);
            $('#due-date').val(selectedTask['due_date']);
            $('#details').val(selectedTask['details']);
            $('#image').val(selectedTask['image_url']);
        });
        
        
        /*
        // Event handler for completing a task
        $('#task-list').on('change', 'input[type="checkbox"]', function (e) {
            //e.stopPropagation();
            var label = $(this).next('label');
            label.toggleClass('completed-task');
        });
        */

        // Event handler for saving a task
        $('#save').click(function () {
            //get selected task name by class
            selectedTaskName = $('#task-list .selected-task').find('label').text();
            //get indentation level
            indentationLevel = selectedTaskName.search(/\S/) / 4;
            //get task name
            taskName = selectedTaskName.trimStart();
            //get selected task path
            selectedTaskPath = taskPaths[`${indentationLevel}¬${taskName}`]
            console.log(selectedTaskPath);

            //update tasks with content from input boxes
            updatedTask = {
                'name': $('#name').val(),
                'due_date': $('#due-date').val(),
                'details': $('#details').val(),
                'image_url': $('#image').val()
            }

            setTaskDetails(selectedTaskPath, updatedTask);

            //restart the entire event loop from getJSON with the new tasks
            


            //update task list
            taskData = createTaskList(tasks);
            taskList = taskData[0];
            taskPaths = taskData[1];

            //update task list UI
            taskListItems = '';
            for (var i = 0; i < taskList.length; i++) {
                var task = taskList[i];
                taskListItems += '<div>' +
                    '<input type="checkbox" id="checkbox-' + i + '" />' +
                    '<label>' + task + '</label></div>'; // for="checkbox-' + i + '"
            }
            $('#task-list').html(taskListItems);

            




















            // var selectedTaskName = $('#task-list input[type="checkbox"]:checked').next('label').text();
            // var indentationLevel = parseInt(selectedTaskName.split('¬')[0]);
            // var taskName = selectedTaskName.split('¬')[1];
            // var selectedTaskPath = taskPaths[selectedTaskName];

            // var pathIndices = selectedTaskPath.split('/').slice(1);
            // var selectedTask = tasksData;

            // for (var i = 0; i < pathIndices.length; i++) {
            //     var index = parseInt(pathIndices[i]);
            //     selectedTask = selectedTask['subtasks'][index];
            // }

            // selectedTask['name'] = $('#name').val();
            // selectedTask['due_date'] = $('#due-date').val();
            // selectedTask['details'] = $('#details').val();
            // selectedTask['image_url'] = $('#image').val();

            // $.ajax({
            //     url: 'tasks.json',
            //     type: 'PUT',
            //     contentType: 'application/json',
            //     data: JSON.stringify(tasksData),
            //     success: function () {
            //         console.log('Task saved successfully.');
            //     }
            // });
        });

        // Event handler for deleting a task
        $('#delete').click(function () {
            var selectedTaskName = $('#task-list input[type="checkbox"]:checked').next('label').text();
            var indentationLevel = parseInt(selectedTaskName.split('¬')[0]);
            var taskName = selectedTaskName.split('¬')[1];
            var selectedTaskPath = taskPaths[selectedTaskName];

            var pathIndices = selectedTaskPath.split('/').slice(1);
            var parentTask = tasksData;
            var selectedTaskIndex = null;

            for (var i = 0; i < pathIndices.length - 1; i++) {
                var index = parseInt(pathIndices[i]);
                parentTask = parentTask['subtasks'][index];
            }
            selectedTaskIndex = parseInt(pathIndices[pathIndices.length - 1]);

            if (parentTask && parentTask['subtasks'] && selectedTaskIndex !== null) {
                var deletedTask = parentTask['subtasks'].splice(selectedTaskIndex, 1)[0];

                $.ajax({
                    url: 'tasks.json',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(tasksData),
                    success: function () {
                        console.log('Task deleted successfully.');
                    }
                });

                if (confirm('Task deleted. Undo?')) {
                    parentTask['subtasks'].splice(selectedTaskIndex, 0, deletedTask);
                    $.ajax({
                        url: 'tasks.json',
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(tasksData),
                        success: function () {
                            console.log('Task restored successfully.');
                        }
                    });
                }
            }
        });

        // Event handler for creating a new task
        $('#new-task').click(function () {
            var selectedTaskName = $('#task-list div.selected-task label').text();
            var indentationLevel = parseInt(selectedTaskName.split('¬')[0]);
            var taskName = selectedTaskName.split('¬')[1];
            var selectedTaskPath = taskPaths[selectedTaskName];

            var pathIndices = selectedTaskPath.split('/').slice(1);
            var selectedTask = tasksData;

            for (var i = 0; i < pathIndices.length; i++) {
                var index = parseInt(pathIndices[i]);
                selectedTask = selectedTask['subtasks'][index];
            }

            var newTask = {
                name: $('#name').val(),
                due_date: $('#due-date').val(),
                details: $('#details').val(),
                image_url: $('#image').val(),
                subtasks: []
            };

            selectedTask['subtasks'].push(newTask);

            $.ajax({
                url: 'tasks.json',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(tasksData),
                success: function () {
                    console.log('New task created successfully.');
                }
            });
        });
    });
});