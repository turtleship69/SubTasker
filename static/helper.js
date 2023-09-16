function normalize(str) {
    // Convert to lowercase
    const lowercaseStr = str.toLowerCase();

    // Remove anything that isn't alphanumeric or whitespace
    const alphanumericStr = lowercaseStr.replace(/[^a-zA-Z0-9\s]/g, "");

    // Convert all whitespace to dashes
    const normalizedStr = alphanumericStr.replace(/\s+/g, "-");

    return normalizedStr;
}

function getTaskDetails(taskList, path) {
    // Use lodash's _.get method to access the task object at the specified path
    fullPath = "subtasks." + path.replaceAll("/", ".");
    //console.log(fullPath);
    const task = _.get(taskList, fullPath);

    // Return the entire task details found at the specified path
    //console.log(task);
    return task;
}

function hideTasks(path) {
    // Select all div elements with a "data-path" attribute that starts with the given path
    const divsToHide = document.querySelectorAll(`[data-path^="${path}"]`);

    // Iterate through the selected divs
    divsToHide.forEach((div) => {
        // Check if the "data-path" attribute value is equal to the parameter
        if (div.getAttribute("data-path") !== path) {
            // Set the style.visibility to "none" to hide the div
            div.style.display = "none";
        }
    });
}

function showTasks(path) {
    // Select all div elements with a "data-path" attribute that starts with the given path
    const divsToShow = document.querySelectorAll(`[data-path^="${path}"]`);

    // Iterate through the selected divs
    divsToShow.forEach((div) => {
        // Set the style.visibility to "visible" to show the div
        div.style.display = "block";
    });
}

function toggleTaskVisibility(path, taskDiv, collapsible) {
    if (taskDiv.getAttribute("data-visible") === "true") {
        hideTasks(path);
        taskDiv.setAttribute("data-visible", "false");
        collapsible.innerHTML = "&minus;"
    } else {
        showTasks(path);
        taskDiv.setAttribute("data-visible", "true");
        collapsible.innerHTML = "&plus;"
    }
}