const request = require('supertest');
const app = require('../src/server');

describe('Todo API', () => {
  let createdTodoId;

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Welcome to our GitHub Actions demo API. Hooray!!!');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Test todo' })
        .expect(201);

      expect(res.body).toHaveProperty('title', 'Test todo');
      expect(res.body).toHaveProperty('completed', false);
      expect(res.body).toHaveProperty('id');
      
      createdTodoId = res.body.id;
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Title is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const res = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ completed: true })
        .expect(200);

      expect(res.body).toHaveProperty('completed', true);
    });

    it('should return 404 for non-existent todo', async () => {
      await request(app)
        .put('/api/todos/999')
        .send({ completed: true })
        .expect(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .expect(204);
    });

    it('should return 404 for non-existent todo', async () => {
      await request(app)
        .delete('/api/todos/999')
        .expect(404);
    });
  });
});