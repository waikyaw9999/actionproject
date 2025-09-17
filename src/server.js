const express = require('express');
const todoRoutes = require('./routes/todos');

const app = express();
app.use(express.json());

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our GitHub Actions demo API. Hooray!!!' });
});

// Todo routes
app.use('/api/todos', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;