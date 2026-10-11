
"use strict";

// ----------------------------------------
// 1. DYNAMIC TO-DO LIST
// ----------------------------------------

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskFeedback = document.getElementById("task-feedback");
const clearCompletedButton = document.getElementById("clear-completed");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");
const progressCount = document.getElementById("progress-count");
const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");

// Load saved tasks. If storage is unavailable or contains invalid
// data, start with an empty list.
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("taskflow-tasks");

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter((task) =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.warn("Could not load saved tasks.", error);
        return [];
    }
}

let tasks = loadTasks();

// Save the current task list to this browser.
function saveTasks() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.warn("Could not save tasks.", error);
        taskFeedback.textContent =
            "Storage is unavailable. Your latest changes may not persist.";
        taskFeedback.classList.add("error");
        return false;
    }
}

// Update the task statistics and progress bar.
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const remaining = total - completed;
    const percentage = total === 0 ? 0 : (completed / total) * 100;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;
    progressCount.textContent = `${completed} / ${total}`;
    progressFill.style.width = `${percentage}%`;

    progressFill.parentElement.setAttribute(
        "aria-label",
        `${Math.round(percentage)} percent of tasks completed`
    );

    if (total === 0) {
        progressLabel.textContent = "Ready when you are";
    } else if (remaining === 0) {
        progressLabel.textContent = "Everything completed!";
    } else {
        progressLabel.textContent = `${remaining} task(s) to go`;
    }
}

// Draw the task list using DOM manipulation.
function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete: ${task.text}`);

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
            saveTasks();
            renderTasks();

            taskFeedback.textContent = "Task removed.";
            taskFeedback.classList.remove("error");
        });

        item.append(checkbox, taskText, deleteButton);
        taskList.appendChild(item);
    });

    emptyState.hidden = tasks.length !== 0;
    updateStatistics();
}

// Add a task when the user submits the form.
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskFeedback.textContent = "Please enter a task first.";
        taskFeedback.classList.add("error");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();

    taskFeedback.textContent = "Task added successfully!";
    taskFeedback.classList.remove("error");
});

// Remove every completed task.
clearCompletedButton.addEventListener("click", () => {
    const previousLength = tasks.length;
    tasks = tasks.filter((task) => !task.completed);

    if (tasks.length === previousLength) {
        taskFeedback.textContent = "There are no completed tasks to clear.";
        taskFeedback.classList.remove("error");
        return;
    }

    saveTasks();
    renderTasks();

    taskFeedback.textContent = "Completed tasks cleared.";
    taskFeedback.classList.remove("error");
});

// Render saved tasks when the page first loads.
renderTasks();


// ----------------------------------------
// 2. CONTACT FORM VALIDATION
// ----------------------------------------

const contactForm = document.getElementById("contact-form");
const contactFeedback = document.getElementById("contact-feedback");

const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    subject: document.getElementById("subject"),
    message: document.getElementById("message")
};

// Display or clear a field's validation error.
function setFieldError(fieldName, message) {
    const field = fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);

    errorElement.textContent = message;
    field.classList.toggle("invalid", Boolean(message));

    if (message) {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }
}

// Check the user's input before accepting the demo form.
function validateContactForm() {
    let isValid = true;

    Object.keys(fields).forEach((fieldName) => {
        const value = fields[fieldName].value.trim();
        let error = "";

        if (!value) {
            error = "This field is required.";
        } else if (fieldName === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {
                error = "Please enter a valid email address.";
            }
        }

        setFieldError(fieldName, error);

        if (error) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate while the user corrects individual fields.
Object.entries(fields).forEach(([fieldName, field]) => {
    field.addEventListener("input", () => {
        setFieldError(fieldName, "");

        contactFeedback.textContent = "";
        contactFeedback.classList.remove("error");
    });

    field.addEventListener("blur", () => {
        const value = field.value.trim();

        if (!value) {
            setFieldError(fieldName, "This field is required.");
        } else if (fieldName === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {
                setFieldError(fieldName, "Please enter a valid email address.");
            } else {
                setFieldError(fieldName, "");
            }
        } else {
            setFieldError(fieldName, "");
        }
    });
});

// Process a valid submission.
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    contactFeedback.textContent = "";
    contactFeedback.classList.remove("error");

    if (!validateContactForm()) {
        contactFeedback.textContent =
            "Please correct the highlighted fields and try again.";
        contactFeedback.classList.add("error");

        const firstInvalidField = contactForm.querySelector(".invalid");

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return;
    }

    contactFeedback.textContent =
        "Validation successful! This demo does not send messages to a server.";

    contactForm.reset();

    Object.keys(fields).forEach((fieldName) => {
        setFieldError(fieldName, "");
    });
});
