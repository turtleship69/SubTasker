// Event handler for task div click
function handleTaskDivClick(taskDiv, taskPath) {
    // Remove selected-task class from the last selected div
    const lastSelectedTask = document.querySelector(".selected-task");
    if (lastSelectedTask) {
        lastSelectedTask.classList.remove("selected-task");
    }

    // Add the selected-task class to the clicked div
    taskDiv.classList.add("selected-task");

    // Get the task details using the "data-path" attribute of the clicked div
    const taskDetails = getTaskDetails(taskList, taskPath);
    //console.log(taskDetails);

    // Update the fields with the task details
    document.getElementById("name").value = taskDetails.name;
    document.getElementById("due-date").value = taskDetails.due_date;
    document.getElementById("details").innerText = taskDetails.details;
    document.getElementById("image").value = taskDetails.image_url;
}

function handleCheckmarkClick(taskPath, isChecked) {
    console.log(taskPath);
    if (isChecked) {
        // Add the task path to changes.completed
        changes.completed.push(taskPath);
        
        // Add the "completed-task" class
        
    } else {
        // Remove the task path from changes.completed
        const index = changes.completed.indexOf(taskPath);
        if (index !== -1) {
            changes.completed.splice(index, 1);
        }
    }

    // You can do further processing or updating here
    console.log(changes.completed);
}
