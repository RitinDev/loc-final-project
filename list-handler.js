// Function to generate a unique ID for a new list
const generateUniqueID = (lists) => {
    // Generate a string comprising 5 random characters
    const id = Math.random().toString(36).slice(-5);
    // Go through the data and check if the ID already exists
    lists.forEach((list) => {
        if (list.list_code === id) {
            // If the ID exists, generate a new one
            return generateUniqueID(lists);
        }
    });
    // If the ID doesn't exist, return it
    return id;
}

// Function to create a new list and add it to the data
const newList = (id, password) => {
    // Create  a new list object
    const list = {
        list_code: id,
        list_password: password,
        list_tasks: []
    };
    return list;
}

// Function to get a list by its code
const getListByCode = (lists, code) => {
    // Go through the data and find the list with the given code
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].list_code === code) {
            // Return the list if found
            return lists[i];
        }
    }
    // Return null if the list is not found
    return null;
}

// Function to get a list by its code and password
const getListByCodeAndPassword = (lists, code, password) => {
    // Go through the data and find the list with the given code and password
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].list_code === code && lists[i].list_password === password) {
            // Return the list if found
            return lists[i];
        }
    }
    // Return null if the list is not found
    return null;
}

const bootstrapBadgeTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];

// Function to get a random bootstrap badge type
const getRandomBootstrapBadgeType = () => {
    // Get a random index
    const index = Math.floor(Math.random() * bootstrapBadgeTypes.length);
    // Return the badge type at the random index
    return bootstrapBadgeTypes[index];
}

// Function to get a list and display its tasks in the DOM
const displayList = (list) => {
    // Create the table element and add the table classes
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-dark', 'table-hover');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.setAttribute('scope', 'col');
    th1.textContent = 'Username';
    const th2 = document.createElement('th');
    th2.setAttribute('scope', 'col');
    th2.textContent = 'Description';
    const th3 = document.createElement('th');
    th3.setAttribute('scope', 'col');
    th3.textContent = 'Done';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    table.appendChild(thead);

    // Create the table body element
    const tbody = document.createElement('tbody');
    // Go through the list tasks and display them
    for (let i = 0; i < list.list_tasks.length; i++) {
        const task = list.list_tasks[i];
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const span = document.createElement('span');
        span.classList.add('badge', `bg-${getRandomBootstrapBadgeType()}`);
        span.textContent = task.task_made_by;
        td1.appendChild(span);
        const td2 = document.createElement('td');
        td2.textContent = task.task_description;
        // Add the required attributes for Bootstrap tooltips to the td2 element
        td2.setAttribute('data-bs-toggle', 'tooltip');
        td2.setAttribute('data-bs-placement', 'top');
        // Check if the task has a "date added" property
        if (task.task_date_added) {
            td2.setAttribute('data-bs-title', `${task.task_date_added}`);
            bootstrap.Tooltip.getOrCreateInstance(td2);
        }
        const td3 = document.createElement('td');
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
        button.setAttribute('type', 'button');
        button.textContent = 'Mark as Done';
        // Add an event listener to the button to remove the task from the list when clicked on it
        button.addEventListener('click', () => {
            // Create a POST request to /remove-task to remove the task from the list
            fetch('/remove-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list: list,
                    task: task
                })
            }).then((response) => {
                response.json().then((data) => {
                    if (data.error) {
                        console.log(data.error);
                    } else {
                        // If the task was removed successfully, reflect the changes in the DOM
                        tr.remove();
                        // Update the list in the local storage
                        updateListInLocalStorage(list);
                    }
                });
            });
        });
        td3.appendChild(button);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    // Append the table to the main element
    document.querySelector('main').appendChild(table);
    // Display a button at the bottom right of the table to export to CSV
    const exportButton = document.createElement('button');
    exportButton.classList.add('btn', 'btn-outline-secondary', 'mt-1', 'float-end');
    exportButton.setAttribute('type', 'button');
    exportButton.textContent = 'Export to CSV';
    // Add an event listener to the button to export the list to CSV when clicked on it
    exportButton.addEventListener('click', () => {
        // Create a POST request to /export-to-csv to export the list to CSV
        fetch('/export-to-csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                list: list
            })
        }).then((response) => {
            response.blob().then((blob) => {
                // Create a download link for the blob object
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = `${list.list_code}.csv`

                // Trigger a click event on the download link to initiate the download
                downloadLink.click();

                // If the list was exported successfully, turn the button into a success button for 2 seconds
                exportButton.classList.remove('btn-outline-secondary');
                exportButton.classList.add('btn-outline-success');
                exportButton.textContent = 'Tasks Exported Successfully!';
                setTimeout(() => {
                    exportButton.classList.remove('btn-outline-success');
                    exportButton.classList.add('btn-outline-secondary');
                    exportButton.textContent = 'Export to CSV';
                }, 2000);
            });
        }).catch((error) => {
            console.log(error);
            // If there was an error exporting the list, turn the button into a danger button for 2 seconds
            exportButton.classList.remove('btn-outline-secondary');
            exportButton.classList.add('btn-outline-danger');
            exportButton.textContent = 'Error Exporting Tasks';
            setTimeout(() => {
                exportButton.classList.remove('btn-outline-danger');
                exportButton.classList.add('btn-outline-secondary');
                exportButton.textContent = 'Export to CSV';
            }, 2000);
        });
    });
    // Append the button to the main element
    document.querySelector('main').appendChild(exportButton);
}

// Function to get the current date and time in the user's timezone
// Displayed in the tooltip of each task
// Date and time format inspired by Reddit's date and time format
const getCurrentDateTime = () => {
    // Get the user's current timezone
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get the current date and time in the user's timezone
    let now = new Date().toLocaleString("en-US", { timeZone: timeZone });

    // Format the date and time
    let options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZoneName: "long"
    };
    return new Date(now).toLocaleString("en-US", options);
}

// Function to make a new list task
const createTask = (madeBy, description) => {
    // Create a new task object
    const task = {
        task_made_by: madeBy,
        task_description: description,
        task_completed: false,
        task_date_added: getCurrentDateTime()
    };
    return task;
}

// Function to add a task to a list
const addTask = (list, task) => {
    // Create a POST request to /add-task to add the task to the list
    fetch('/add-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            list: list,
            task: task
        })
    }).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                console.log(data.error);
            } else {
                // If the task was added successfully, reflect the changes in the DOM
                const table = document.querySelector('table');
                const tbody = table.querySelector('tbody');
                const tr = document.createElement('tr');
                const td1 = document.createElement('td');
                const span = document.createElement('span');
                span.classList.add('badge', `bg-${getRandomBootstrapBadgeType()}`);
                span.textContent = task.task_made_by;
                td1.appendChild(span);
                const td2 = document.createElement('td');
                td2.textContent = task.task_description;
                // Add the required attributes for Bootstrap tooltips to the td2 element
                td2.setAttribute('data-bs-toggle', 'tooltip');
                td2.setAttribute('data-bs-placement', 'top');
                // Check if the task has a "date added" property
                if (task.task_date_added) {
                    td2.setAttribute('data-bs-title', `${task.task_date_added}`);
                    bootstrap.Tooltip.getOrCreateInstance(td2);
                }
                const td3 = document.createElement('td');
                const button = document.createElement('button');
                button.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
                button.setAttribute('type', 'button');
                button.textContent = 'Mark as Done';
                // Add an event listener to the button to remove the task from the list when clicked on it
                button.addEventListener('click', () => {
                    // Create a POST request to /remove-task to remove the task from the list
                    fetch('/remove-task', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            list: list,
                            task: task
                        })
                    }).then((response) => {
                        response.json().then((data) => {
                            if (data.error) {
                                console.log(data.error);
                            } else {
                                // If the task was removed successfully, reflect the changes in the DOM
                                tr.remove();
                                // Update the list in localStorage
                                updateListInLocalStorage(list);
                            }
                        });
                    });
                });

                // Update the list in localStorage
                updateListInLocalStorage(list);

                td3.appendChild(button);
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tbody.appendChild(tr);
            }
        });
    });
}

// Function to get the current date and time in the DD/MM/YYYY HH:MM format
// Used to display date modified in the list table
const getDateTimeShort = () => {
    // Get the user's current timezone
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get the current date and time in the user's timezone
    let now = new Date().toLocaleString("en-US", { timeZone: timeZone });

    // Format the date and time
    let options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
    };
    return new Date(now).toLocaleString("en-US", options);
}

// Function to display the lists stored in localStorage
// Used in the my-lists page
const displayMyLists = () => {
    // Get the lists from localStorage
    let lists = JSON.parse(localStorage.getItem('myLists'));

    // Sort the lists by date modified
    let sortedLists = Object.values(lists).sort((a, b) => {
        return new Date(b.date_modified) - new Date(a.date_modified);
    });

    // Get the main element
    const main = document.querySelector('main');

    // Create a table element
    const table = document.createElement('table');
    table.classList.add('table', 'table-hover', 'table-striped', 'table-dark');

    // Create a thead element
    const thead = document.createElement('thead');

    // Create a tr element
    const tr = document.createElement('tr');

    // Create th elements for the list code, date modified and remove list button
    ['List Code', 'Date Modified', 'Remove List'].forEach((text) => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.textContent = text;
        tr.appendChild(th);
    });

    // Append the tr element to the thead element
    thead.appendChild(tr);

    // Append the thead element to the table element
    table.appendChild(thead);

    // Create a tbody element
    const tbody = document.createElement('tbody');

    // Loop through the sorted lists
    sortedLists.forEach((list) => {
        // Create a tr element
        const tr = document.createElement('tr');

        // Create td elements for the list code and date modified
        [list.code, list.date_modified].forEach((text) => {
            const td = document.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
        });

        // Create td element for the remove list button
        const td3 = document.createElement('td');
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
        button.setAttribute('type', 'button');
        button.textContent = 'Remove';

        // Add an event listener to the button to remove the list when clicked on it
        button.addEventListener('click', () => {
            delete lists[list.code];
            localStorage.setItem('myLists', JSON.stringify(lists));
            tr.remove();
        });

        td3.appendChild(button);
        tr.appendChild(td3);

        // Append the tr element to the tbody element
        tbody.appendChild(tr);
    });

    // Append the tbody element to the table element
    table.appendChild(tbody);

    // Append the table element to the main element
    main.appendChild(table);
};

// Function to update a list's 'date_modified' property in localStorage
// Used when a task is added or removed from a list
const updateListInLocalStorage = (list) => {
    // Check if the list already exists in localStorage
    let myLists = JSON.parse(localStorage.getItem('myLists')) || {};
    if (myLists[list.list_code]) {
        // If the list exists, update its 'date_modified' property
        myLists[list.list_code].date_modified = getDateTimeShort();
    } else {
        // If the list doesn't exist, create it and set its 'date_modified' property
        myLists[list.list_code] = {
            code: list.list_code,
            date_modified: getDateTimeShort()
        };
    }
    // Save myLists back to localStorage
    localStorage.setItem('myLists', JSON.stringify(myLists));
};

// Export the functions
module.exports = {
    generateUniqueID,
    getListByCode,
    getListByCodeAndPassword,
    newList,
    displayList,
    createTask,
    addTask,
    getDateTimeShort,
    updateListInLocalStorage,
};