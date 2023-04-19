const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000; // Port to run the server on

const listHandler = require('./list-handler');

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(__dirname)); // Serve static files from the current directory

app.get('/new-list.html', (req, res) => {
    res.sendFile(__dirname + '/new-list.html');
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
            res.send('List added successfully.');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});