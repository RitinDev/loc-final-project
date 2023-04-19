const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/new-list.html', (req, res) => {
    res.sendFile(__dirname + '/new-list.html');
});

app.post('/new-list.html', (req, res) => {
    const newList = req.body;
    fs.readFile('lists.json', (err, data) => {
        if (err) throw err;

        const lists = JSON.parse(data);
        lists.push(newList);

        fs.writeFile('lists.json', JSON.stringify(lists), (err) => {
            if (err) throw err;
            res.send('List added successfully.');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
