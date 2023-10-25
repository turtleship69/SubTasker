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
        const taskDetails = subtask.details;

        result.push({ name: taskName, path: taskPath, details: taskDetails, id: taskId });

        if (typeof subtask.subtasks === "object" && Object.keys(subtask.subtasks).length > 0) {
            generateTaskList(subtask, taskPath, result);
        }
    }
    return result;
}

//generate Divs For each task
function generateTaskDiv(taskName, taskPath, taskDetails = "") {
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

    //check if details starts with url, and add quick link™
    if (taskDetails.substring(0, 8) == "https://" || taskDetails.substring(0, 7) == "http://") {
        const url = taskDetails.split(' ')[0];

        anchor = document.createElement("a")
        anchor.href = url
        anchor.target = "_blank"

        anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="1em" style="vertical-align: middle; margin-left: 2px;">
        <path
            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
        </svg>`

        taskDiv.appendChild(anchor);   
    }


    return taskDiv;
}

function addTaskDivsToTaskList(pathsList, taskList) {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear the previous contents

    pathsList.forEach((pathItem) => {
        const { name: taskName, path: taskPath, details: taskDetails, id: taskId } = pathItem;
        const taskDiv = generateTaskDiv(taskName, taskPath, taskDetails);

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