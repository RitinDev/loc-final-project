// models/list.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task_made_by: String,
  task_description: String,
  task_completed: Boolean,
  task_date_added: String
});

const listSchema = new mongoose.Schema({
  list_code: String,
  list_password: String,
  list_tasks: [taskSchema]
});

module.exports = mongoose.model('List', listSchema);