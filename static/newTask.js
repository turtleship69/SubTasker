const newButton = document.getElementById("new");
const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");
const closeButton = document.getElementById("close-button");
const taskForm = document.getElementById("task-form");

newButton.addEventListener("click", () => {
    // Display the popup when the "new" button is clicked
    overlay.style.display = "block";
    popup.style.display = "block";
    document.getElementById("new_path").value = document.getElementById("path").value

    document.getElementById("new_name").focus()
});

// Function to close the popup
function closePopup() {
    overlay.style.display = "none";
    popup.style.display = "none";
    // Reset the form fields
    taskForm.reset();
}

// Close the popup when clicking the close button (x)
closeButton.addEventListener("click", closePopup);

// Close the popup when clicking anywhere outside the popup
overlay.addEventListener("click", closePopup);

// Prevent clicks within the popup from closing it
popup.addEventListener("click", function (event) {
    event.stopPropagation();
});



taskForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form values
    const name = document.getElementById("new_name").value;
    const due_date = document.getElementById("new_due_date").value;
    const details = document.getElementById("new_details").value;
    const path = document.getElementById("path").value;

    // Create an object to hold the parameters with values
    const formData = {};

    // Include parameters only if there is a value
    if (name) {formData.name = name;}
    if (due_date) {formData.due_date = due_date;}
    if (details) {formData.details = details;}
    if (path) {formData.path = path;}

    // Make the fetch request with the form data
    fetch('/tasks/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Close the popup after submitting the form
            popup.style.display = "none";
            // Reset the form fields
            taskForm.reset();
            // Just fucking reload the page
            location.reload()
        })
        .catch(error => console.error(error));
    closePopup();
});