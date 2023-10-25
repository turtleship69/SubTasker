// Event handler for task div click
function handleTaskDivClick(taskDiv, taskPath) {
    // Remove selected-task class from the last selected div
    const lastSelectedTask = document.querySelector(".selected-task");
    if (lastSelectedTask) {
        lastSelectedTask.classList.remove("selected-task");
    }
    if (lastSelectedTask != taskDiv) {
        document.getElementById("selected-task-details").style.display = "block";

        // Add the selected-task class to the clicked div
        taskDiv.classList.add("selected-task");

        // Get the task details using the "data-path" attribute of the clicked div
        const taskDetails = getTaskDetails(taskList, taskPath);
        //console.log(taskDetails);

        // Update the fields with the task details
        if (taskDetails.name) { document.getElementById("name").value = taskDetails.name; } else { document.getElementById("name").value = ""; }
        if (taskDetails.due_date) { document.getElementById("due-date").value = taskDetails.due_date; } else { document.getElementById("due-date").value = ""; }
        if (taskDetails.details) { document.getElementById("details").value = taskDetails.details; } else { document.getElementById("details").value = ""; }
        if (taskDetails.image_url) { document.getElementById("image").value = taskDetails.image_url; } else { document.getElementById("image").value = ""; }
        document.getElementById("path").value = taskPath;
    } else {
        // Clear the fields
        document.getElementById("name").value = "";
        document.getElementById("due-date").value = "";
        document.getElementById("details").value = "";
        document.getElementById("image").value = "";
        document.getElementById("path").value = "";

        document.getElementById("selected-task-details").style.display = "none";
    }
}

function handleCheckmarkClick(taskPath, taskDiv) {
    console.log(taskPath);

    fetch('/tasks/complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path: taskPath
        })
    }).then(response => {
        if (response.ok) {
            return response.json().then(data => {
                taskDiv.remove()
                // Find all divs where the "data-path" attribute starts with the current task's path
                const divsToDelete = document.querySelectorAll(`[data-path^="${taskPath}"]`);
                console.log(divsToDelete);
                // Remove those divs from the DOM
                divsToDelete.forEach(div => div.remove());

                document.getElementById("path").value = "";
            });
        } else {
            console.log('Fetch was not successful');
        }
    })
}

function handleDeleteButtonClick() {
    // Find all elements with the class "selected-task"
    const selectedTasks = document.querySelectorAll(".selected-task");

    if (selectedTasks.length === 1) {
        // If there is exactly one selected task, get its "data-path" attribute
        const dataPath = selectedTasks[0].getAttribute("data-path");

        // Make the request to delete the task using fetch
        fetch('/tasks/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: dataPath
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Check if the request was successful
                if (data.message = "success") {
                    // Remove the selected task's div from the DOM
                    selectedTasks[0].remove();
                    // Find all divs where the "data-path" attribute starts with the current task's path
                    const divsToDelete = document.querySelectorAll(`[data-path^="${dataPath}"]`);
                    console.log(dataPath);
                    console.log(divsToDelete);
                    // Remove those divs from the DOM
                    divsToDelete.forEach(div => div.remove());
                    // Clear the selection
                    selectedTasks[0].classList.remove("selected-task");
                } else {
                    // Handle the case where the deletion request was not successful
                    alert("Deletion failed. Please try again.");
                }
            })
            .catch(error => console.error(error));
        selectedTasks[0].remove();
    } else if (selectedTasks.length === 0) {
        // If there are no selected tasks, alert the user
        alert("Please select a task to delete.");
    } else {
        // If there are more than one selected tasks, log a message
        console.log("Multiple tasks are selected. Please select only one task to delete.");
    }
}

function toggleTaskVisibility(path, taskDiv, collapsible) {
    if (taskDiv.getAttribute("data-visible") === "true") {
        hideTasks(path);
        // taskDiv.setAttribute("data-visible", "false");
        // collapsible.innerHTML = "&minus;"

        addToLocal(path);
    } else {
        showTasks(path);
        // taskDiv.setAttribute("data-visible", "true");
        // collapsible.innerHTML = "&plus;"

        removeFromLocal(path);
    }
}

function updateTask() {
    let body = {
        path: document.getElementById("path").value
    }

    if (document.getElementById("name").value) { body.name = document.getElementById("name").value; }
    if (document.getElementById("due-date").value) { body.due_date = document.getElementById("due-date").value; }
    if (document.getElementById("details").value) { body.details = document.getElementById("details").value; }

    fetch('/tasks/modify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (response.ok) {
            return response.json().then(data => {
                const span = document.querySelector(`div[data-path="${document.getElementById('path').value}"] span.task-name`);
                span.innerText = document.getElementById("name").value;
            });
        } else {
            console.log('Fetch was not successful');
        }
    });
}

