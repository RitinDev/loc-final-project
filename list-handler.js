const fs = require('fs');

// Read the lists data
const jsonData = fs.readFileSync('./lists.json');
// Parse the JSON data
const data = JSON.parse(jsonData);
// Print the data
console.log(data);

// Function to generate a unique ID for a new list
const generateUniqueID = () => {
    // Generate a string comprising 5 random characters
    const id = Math.random().toString(36).slice(-5);
    // Go through the data and check if the ID already exists
    for (let i = 0; i < data.length; i++) {
        if (data[i].list_code === id) {
            // If the ID exists, generate a new one
            return generateUniqueID();
        }
    }
    // If the ID doesn't exist, return it
    return id;
}

// Function to create a password for a list
const generatePassword = () => {
    // Generate a string comprising 6 random characters
    const password = Math.random().toString(36).slice(-6);
    // Return the password
    return password;
}

// Function to create a new list and add it to the data
const newList = () => {
    // Create  a new list object
    const list = {
        list_code: generateUniqueID(),
        list_password: generatePassword(),
        list_tasks: []
    };
    // Add the new list to the data
    data.push(list);
    // Write the new data to the JSON file
    fs.writeFileSync('./lists.json', JSON.stringify(data));
    // Return the new list
    return list;
}

// Function to get a list by its code and password
const getListByCodeAndPassword = (code, password) => {
    // Go through the data and find the list with the given code and password
    for (let i = 0; i < data.length; i++) {
        if (data[i].list_code === code && data[i].list_password === password) {
            // Return the list if found
            return data[i];
        }
    }
    // Return null if the list is not found
    return null;
}

const bootstrapBadgeTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

// Function to get a random bootstrap badge type
const getRandomBootstrapBadgeType = () => {
    // Get a random index
    const index = Math.floor(Math.random() * bootstrapBadgeTypes.length);
    // Return the badge type at the random index
    return bootstrapBadgeTypes[index];
}

const BeginDOMTable = () => {
    
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
        const td3 = document.createElement('td');
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
        button.setAttribute('type', 'button');
        button.textContent = 'Mark as Done';
        td3.appendChild(button);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    // Append the table to the main element
    document.querySelector('main').appendChild(table);
}