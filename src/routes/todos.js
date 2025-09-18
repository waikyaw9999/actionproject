const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// In-memory storage for todos
let todos = [];

// Get all todos
router.get('/', verifyToken, (req, res) => {
  const userTodos = todos.filter(todo => todo.userId === req.user.id);
  res.json(userTodos);
});

// Create a new todo
router.post('/', verifyToken, (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = {
    id: todos.length + 1,
    title,
    completed: false,
    userId: req.user.id
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  const todoIndex = todos.findIndex(t => t.id === parseInt(id) && t.userId === req.user.id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title || todos[todoIndex].title,
    completed: completed !== undefined ? completed : todos[todoIndex].completed
  };

  res.json(todos[todoIndex]);
});

// Delete a todo
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(t => t.id === parseInt(id) && t.userId === req.user.id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos = todos.filter(t => !(t.id === parseInt(id) && t.userId === req.user.id));
  res.status(204).send();
});

// For testing purposes
const clearTodos = () => {
  todos = [];
};

module.exports = router;
module.exports.clearTodos = clearTodos;