// define globals
var taskList;
var pathsList;


//fetch tasks from tasks.json
function getTasks() {
    var request = new XMLHttpRequest();
    request.open('GET', 'tasks.json', false); // Synchronous request (the last 'false' argument)
    request.send(null);

    if (request.status === 200) {
        try {
            return JSON.parse(request.responseText);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    } else {
        console.error('Error fetching tasks.json:', request.status, request.statusText);
    }
}


//generate a single leveled list of tasks
function generateTaskList(taskList, parentPath = "", result = []) {
    if (!taskList || typeof taskList.subtasks !== "object") return;

    for (const [taskId, subtask] of Object.entries(taskList.subtasks)) {
        const taskName = subtask.name;
        const taskPath = parentPath + (parentPath ? "/subtasks/" : "") + taskId;

        result.push({ name: taskName, path: taskPath, id: taskId });

        if (typeof subtask.subtasks === "object" && Object.keys(subtask.subtasks).length > 0) {
            generateTaskList(subtask, taskPath, result);
        }
    }
    return result;
}

//generate Divs For each task
function generateTaskDiv(taskName, taskPath) {
    const normalizedTaskName = normalize(taskName);
    const taskDiv = document.createElement("div");
    taskDiv.id = normalizedTaskName;
    taskDiv.setAttribute("data-path", taskPath);
    taskDiv.setAttribute("data-visible", "true");

    const collapsible = document.createElement("span");
    collapsible.style.userSelect = "none";
    collapsible.innerHTML = "&plus;";
    collapsible.classList.add("collapsible");
    collapsible.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleTaskVisibility(taskPath, taskDiv, collapsible);
        return false;
    })

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "cb-" + normalizedTaskName;
    checkbox.addEventListener("change", (event) => {
        event.preventDefault()
        event.stopPropagation();
        handleCheckmarkClick(taskPath, taskDiv)
    });

    // Calculate indentation based on the number of layers in the taskPath
    const indentationLevel = taskPath.split("/").length - 1;
    const indentation = "&nbsp;".repeat(indentationLevel * 4);
    const indent = document.createElement("span");
    indent.innerHTML = indentation;

    const taskText = document.createElement("span");
    taskText.innerHTML = taskName;
    taskText.classList.add("task-name")

    taskDiv.appendChild(collapsible);
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(indent);
    taskDiv.appendChild(taskText);

    return taskDiv;
}

function addTaskDivsToTaskList(pathsList, taskList) {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear the previous contents

    pathsList.forEach((pathItem) => {
        const { name: taskName, path: taskPath, id: taskId } = pathItem;
        const taskDiv = generateTaskDiv(taskName, taskPath);

        // Attach the click event listener to the taskDiv
        taskDiv.addEventListener("click", () => handleTaskDivClick(taskDiv, taskPath));

        taskListDiv.appendChild(taskDiv);
    });
}


taskList = getTasks();
console.log(`taskList:`);
console.log(taskList);

pathsList = generateTaskList(taskList);
console.log("pathsList: ")
console.log(pathsList);
pathsList.forEach(element => console.log(element.toString()));

// Run the function to add task divs to the "task-list" div
addTaskDivsToTaskList(pathsList);


let tasksToCollapse = getLocal();
tasksToCollapse.forEach(task => {
    hideTasks(task)
});