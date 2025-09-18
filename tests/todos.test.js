const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/auth');

describe('Todo API', () => {
  let createdTodoId;
  let authToken;

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });
    authToken = loginResponse.body.token;
  });

  beforeEach(() => {
    // Reset todos array before each test
    const todosModule = require('../src/routes/todos');
    todosModule.clearTodos();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Welcome to our GitHub Actions demo API');
    });
  });

  describe('Authorization', () => {
    it('should return 403 when no token is provided', async () => {
      await request(app)
        .get('/api/todos')
        .expect(403)
        .expect(res => {
          expect(res.body.error).toBe('No token provided');
        });
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect(res => {
          expect(res.body.error).toBe('Invalid token');
        });
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      const decoded = jwt.verify(res.body.token, JWT_SECRET);
      expect(decoded).toHaveProperty('id', 1);
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return user-specific todos', async () => {
      // Create a todo first
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test todo' })
        .expect(201);

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('title', 'Test todo');
      expect(res.body[0]).toHaveProperty('userId', 1);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test todo' })
        .expect(201);

      expect(res.body).toHaveProperty('title', 'Test todo');
      expect(res.body).toHaveProperty('completed', false);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId', 1);
      
      createdTodoId = res.body.id;
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Title is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      // Create a todo to update
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to update' });
      
      todoId = createRes.body.id;
    });

    it('should update a todo', async () => {
      const res = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(200);

      expect(res.body).toHaveProperty('completed', true);
    });

    it('should return 404 for non-existent todo', async () => {
      await request(app)
        .put('/api/todos/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      // Create a todo to delete
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to delete' });
      
      todoId = createRes.body.id;
    });

    it('should delete a todo', async () => {
      await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify todo was deleted
      await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent todo', async () => {
      await request(app)
        .delete('/api/todos/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});