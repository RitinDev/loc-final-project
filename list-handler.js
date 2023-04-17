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
        if (data[i].id === id) {
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

// newList();