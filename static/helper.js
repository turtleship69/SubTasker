function normalize(str) {
    // Convert to lowercase
    const lowercaseStr = str.toLowerCase();

    // Remove anything that isn't alphanumeric or whitespace
    const alphanumericStr = lowercaseStr.replace(/[^a-zA-Z0-9\s]/g, "");

    // Convert all whitespace to dashes
    const normalizedStr = alphanumericStr.replace(/\s+/g, "-");

    return normalizedStr;
}

function getTaskDetailsWithLodash(taskList, path) {
    // Use lodash's _.get method to access the task object at the specified path
    fullPath = "subtasks." + path.replaceAll("/", ".");
    //console.log(fullPath);
    const task = _.get(taskList, fullPath);

    // Return the entire task details found at the specified path
    //console.log(task);
    return task;
}

function getTaskDetails(taskList, path) {
    const fullPath = "subtasks." + path.replaceAll("/", ".");
    const keys = fullPath.split(".");
    let task = taskList;
    
    for (const key of keys) {
        if (task.hasOwnProperty(key)) {
            task = task[key];
        } else {
            task = undefined;
            break;
        }
    }
    
    return task;
}

function hideTasks(path) {
    document.querySelector(`[data-path="${path}"]`).setAttribute("data-visible", "false");
    document.querySelector(`div[data-path="${path}"] > span.collapsible`).innerHTML = "&minus;"; 


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
    document.querySelector(`[data-path="${path}"]`).setAttribute("data-visible", "true");
    document.querySelector(`div[data-path="${path}"] > span.collapsible`).innerHTML = "&plus;"; 


    // Select all div elements with a "data-path" attribute that starts with the given path
    const divsToShow = document.querySelectorAll(`[data-path^="${path}"]`);

    // Iterate through the selected divs
    divsToShow.forEach((div) => {
        // Set the style.visibility to "visible" to show the div
        div.style.display = "block";
    });
}





// // Function to add a string to local storage
// function addToLocal(value) {
//     // Get the current value from local storage
//     const currentValue = localStorage.getItem("collapsed");

//     // If there's already a value, append the new value with a ";"
//     const updatedValue = currentValue ? currentValue + ";" + value : value;

//     // Store the updated value in local storage
//     localStorage.setItem("collapsed", updatedValue);
// }

// Function to remove a string from local storage

// Function to add a string to local storage
function addToLocal(value) {
    // Get the current value from local storage
    const currentValue = localStorage.getItem("collapsed");
  
    if (!currentValue) {
      // If there's no current value, simply store the new value
      localStorage.setItem("collapsed", value);
    } else {
      // Split the current value into an array using ";" as the delimiter
      const valuesArray = currentValue.split(";");
  
      // Check if the new value is already the start of another string in the list
      const indexToRemove = valuesArray.findIndex(item => item.startsWith(value));
  
      if (indexToRemove !== -1) {
        // If a matching value is found, remove it from the array
        valuesArray.splice(indexToRemove, 1);
      }
  
      // Add the new value to the beginning of the array
      valuesArray.unshift(value);
  
      // Join the updated array back into a single string with ";" as the delimiter
      const updatedValue = valuesArray.join(";");
  
      // Store the updated value in local storage
      localStorage.setItem("collapsed", updatedValue);
    }
  }
  

function removeFromLocal(value) {
    // Get the current value from local storage
    const currentValue = localStorage.getItem("collapsed");

    // If there's no current value, nothing to remove
    if (!currentValue) { return; }

    // Split the current value into an array using ";" as the delimiter
    const valuesArray = currentValue.split(";");

    // Remove the specified value from the array
    const updatedArray = valuesArray.filter(item => item !== value);

    // Join the updated array back into a single string with ";" as the delimiter
    const updatedValue = updatedArray.join(";");

    // Store the updated value in local storage
    localStorage.setItem("collapsed", updatedValue);
}

// Function to get the list of strings from local storage
function getLocal() {
    // Get the current value from local storage
    const currentValue = localStorage.getItem("collapsed");

    // If there's no current value, return an empty array
    if (!currentValue) {
        return [];
    }

    // Split the current value into an array using ";" as the delimiter
    const valuesArray = currentValue.split(";");

    // Return the array of strings
    return valuesArray;
}
