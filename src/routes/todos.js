const express = require('express');
const router = express.Router();

// In-memory storage for todos
let todos = [];

// Get all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// Create a new todo
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = {
    id: todos.length + 1,
    title,
    completed: false
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));
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
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos = todos.filter(t => t.id !== parseInt(id));
  res.status(204).send();
});

module.exports = router;