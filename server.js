const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const Papa = require('papaparse');
const mongoose = require('mongoose');
const List = require('./models/list');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000; // Port to run the server on

const listHandler = require('./list-handler');

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(__dirname)); // Serve static files from the current directory

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'to-do-together' // specify the name of the database here
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// // find the first list in the database
// console.log('Finding the first list in the database...');
// List.findOne()
//     .then(list => console.log(list))
//     .catch(err => console.error(err));

app.post('/', (req, res) => {
    // Get code from form in index.html
    const code = req.body.code;

    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code
        const list = listHandler.getListByCode(lists, code);

        // If the list is found, respond with the list
        if (list) {
            res.send(list);
        } else {
            // If the list is not found, respond with an error message
            res.status(400).send({ error: 'List not found.' });
        }
    });
});

app.post('/new-list.html', (req, res) => {
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get data from form in new-list.html
        const name = req.body.name;
        const password = req.body.password;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Generate a unique ID for the new list
        const id = listHandler.generateUniqueID(lists);

        // Generate a new list object
        const list = listHandler.newList(id, password);

        // Add the new list to the data
        lists.push(list);

        fs.writeFile('lists.json', JSON.stringify(lists), (err) => {
            if (err) throw err;
            // If all goes well, respond with the new list's ID and the name of the user
            res.send({ id: id, name: name });
        });
    });
});

app.post('/existing-list-getusername.html', (req, res) => {
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get data from form in new-list.html
        const name = req.body.name;
        const code = req.body.code;
        const password = req.body.password;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code and password
        const list = listHandler.getListByCodeAndPassword(lists, code, password);

        // If list is found, return a JSON object with list code and user's name
        if (list) {
            res.send({ id: code, name: name });
        } else {
            // If list is not found, return an error message
            res.status(400).send({ error: 'List not found.' });
        }
    });
});

app.post('/list-template.html', (req, res) => {
    const code = req.body.code;

    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code
        const list = listHandler.getListByCode(lists, code);

        // If the list is found, respond with the list
        if (list) {
            res.send(list);
        } else {
            // If the list is not found, respond with an error message
            res.send({ error: 'List not found.' });
        }
    });
});

app.post('/add-task', (req, res) => {
    // Req includes list and the task to be added
    const list = req.body.list;
    const task = req.body.task;

    // Open the lists.json file for reading and writing
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code
        const listToUpdate = listHandler.getListByCode(lists, list.list_code);

        // If the list is found, add the task to the list
        if (listToUpdate) {
            listToUpdate.list_tasks.push(task);
            // Update the list in the lists.json file
            fs.writeFile('lists.json', JSON.stringify(lists), (err) => {
                if (err) throw err;

                // If all goes well, respond with the updated list
                res.send(listToUpdate);
            });
        } else {
            // If the list is not found, respond with an error message
            res.status(400).send({ error: 'List not found.' });
        }
    });
});

app.post('/remove-task', (req, res) => {
    // Req includes list and the task to be removed
    const list = req.body.list;
    const task = req.body.task;

    // Open the lists.json file for reading and writing
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code
        const listToUpdate = listHandler.getListByCode(lists, list.list_code);

        // If the list is found, remove the task from the list
        if (listToUpdate) {
            listToUpdate.list_tasks = listToUpdate.list_tasks.filter((t) => {
                // Remove the task if both the task's task_made_by and task_description match
                return t.task_made_by !== task.task_made_by || t.task_description !== task.task_description;
            });
            // Update the list in the lists.json file
            fs.writeFile('lists.json', JSON.stringify(lists), (err) => {
                if (err) throw err;

                // If all goes well, respond with the updated list
                res.send(listToUpdate);
            });
        } else {
            // If the list is not found, respond with an error message
            res.status(400).send({ error: 'List not found.' });
        }
    });
});

app.post('/export-to-csv', (req, res) => {
    // Req includes list
    const list = req.body.list;

    // Open the lists.json file for reading and writing
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        // Get the data from lists.json
        const lists = JSON.parse(data);

        // Get the list with the given code
        const listToExport = listHandler.getListByCode(lists, list.list_code);

        if (listToExport) {
            // Parse the list's tasks JSON into CSV format
            const csvData = Papa.unparse(listToExport.list_tasks);

            res.attachment(`list-${listToExport.list_code}.csv`);
            res.status(200).send(csvData);
        } else {
            // If the list is not found, respond with an error message
            res.status(400).send({ error: 'List not found.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});