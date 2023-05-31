const express = require('express');
const bodyParser = require('body-parser');
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

    // Get the list with the given code
    List.findOne({ list_code: code })
        .then(list => {
            // If the list is found, log it to the console
            if (list) {
                res.status(200).send(list);
            } else {
                res.status(400).send({ error: 'List not found.' });
            }
        })
        .catch(err => console.error(err));
});

app.post('/new-list.html', (req, res) => {
    // Get data from form in new-list.html
    const name = req.body.name;
    const password = req.body.password;

    // Get all lists from the database
    List.find()
        .then(lists => {
            // Generate a unique ID for the new list
            const id = listHandler.generateUniqueID(lists);

            // Generate a new list object
            const list = listHandler.newList(id, password);

            // Add the new list to the database
            List.replaceOne({ list_code: id }, list, { upsert: true })
                .then(() => {
                    // If all goes well, respond with the new list
                    const dateTime = listHandler.getDateTimeShort();
                    res.status(200).send({ id: id, name: name, dateTime: dateTime });
                })
                .catch(err => {
                    console.error(err)
                    res.status(400).send({ error: 'Error creating list.' });
                });
        })
        .catch(err => {
            console.error(err)
            res.status(400).send({ error: 'Error creating list.' });
        });
});

app.post('/existing-list-getusername.html', (req, res) => {
    // Get data from form
    const name = req.body.name;
    const code = req.body.code;
    const password = req.body.password;

    // Get the list with the given code and password
    List.findOne({ list_code: code, list_password: password })
        .then(list => {
            // If list is found, return a JSON object with list code and user's name
            if (list) {
                res.send({ id: code, name: name });
            } else {
                // If list is not found, return an error message
                res.status(400).send({ error: 'List not found.' });
            }
        })
});

app.post('/list-template.html', (req, res) => {
    const code = req.body.code;

    // Get the list with the given code
    List.findOne({ list_code: code })
        .then(list => {
            // If the list is found, respond with the list
            if (list) {
                res.status(200).send(list);
            } else {
                // If the list is not found, respond with an error message
                res.status(400).send({ error: 'List not found.' });
            }
        })
});

app.post('/add-task', (req, res) => {
    // Req includes list and the task to be added
    const list = req.body.list;
    const task = req.body.task;

    // Get the list with the given code
    List.findOne({ list_code: list.list_code })
        .then(listToUpdate => {
            // If the list is found, add the task to the list
            if (listToUpdate) {
                // Add the task to the list's list_tasks array
                listToUpdate.list_tasks.push(task);
                // Update the list in the database
                List.replaceOne({ list_code: list.list_code }, listToUpdate, { upsert: true })
                    .then(() => {
                        // If all goes well, respond with the updated list
                        res.status(200).send(listToUpdate);
                    })
                    .catch(err => {
                        console.error(err)
                        res.status(400).send({ error: 'Error adding task.' });
                    });
            } else {
                // If the list is not found, respond with an error message
                res.status(400).send({ error: 'List not found.' });
            }
        })
});

app.post('/remove-task', (req, res) => {
    // Req includes list and the task to be removed
    const list = req.body.list;
    const task = req.body.task;

    // Get the list with the given code
    List.findOne({ list_code: list.list_code })
        .then(listToUpdate => {
            // If the list is found, remove the task from the list
            if (listToUpdate) {
                // Remove the task from the list's list_tasks array
                listToUpdate.list_tasks = listToUpdate.list_tasks.filter((t) => {
                    // Remove the task if both the task's task_made_by and task_description match
                    return t.task_made_by !== task.task_made_by || t.task_description !== task.task_description;
                });
                // Update the list in the database
                List.replaceOne({ list_code: list.list_code }, listToUpdate, { upsert: true })
                    .then(() => {
                        // If all goes well, respond with the updated list
                        res.status(200).send(listToUpdate);
                    })
                    .catch(err => {
                        console.error(err)
                        res.status(400).send({ error: 'Error removing task.' });
                    });
            } else {
                // If the list is not found, respond with an error message
                res.status(400).send({ error: 'List not found.' });
            }
        })
});

app.post('/export-to-csv', (req, res) => {
    // Req includes list
    const list = req.body.list;

    // Get the list with the given code
    List.findOne({ list_code: list.list_code })
        .then(listToExport => {
            // If the list is found, parse the list's tasks JSON into CSV format
            if (listToExport) {
                // Get the list's tasks in plain JSON format
                const tasks = listToExport.list_tasks;
                // Go through each task and add it to the CSV string
                let csvData = 'task_made_by,task_description,task_completed,task_date_added\n';
                tasks.forEach((task) => {
                    csvData += `"${task.task_made_by}","${task.task_description}",${task.task_completed},"${task.task_date_added}"\n`;
                });

                res.attachment(`list-${listToExport.list_code}.csv`);
                res.status(200).send(csvData);
            } else {
                // If the list is not found, respond with an error message
                res.status(400).send({ error: 'List not found.' });
            }
        })
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});