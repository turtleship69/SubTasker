function normalize(str) {
  // Convert to lowercase
  const lowercaseStr = str.toLowerCase();

  // Remove anything that isn't alphanumeric or whitespace
  const alphanumericStr = lowercaseStr.replace(/[^a-zA-Z0-9\s]/g, '');

  // Convert all whitespace to dashes
  const normalizedStr = alphanumericStr.replace(/\s+/g, '-');

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

