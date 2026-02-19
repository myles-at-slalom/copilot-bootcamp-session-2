const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async (title = 'Temp Task to Delete', dueDate = null) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task) => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('completed');
        expect(task).toHaveProperty('dueDate');
        expect(task).toHaveProperty('createdAt');
      });
    });

    it('should return tasks ordered by completion and due date rules', async () => {
      const noDueActive = await createTask('Order - Active No Due');
      const dueActive = await createTask('Order - Active Due', '2099-01-01');
      const completedTask = await createTask('Order - Completed', '2099-01-02');

      const completeResponse = await request(app)
        .patch(`/api/tasks/${completedTask.id}`)
        .send({ completed: true })
        .set('Accept', 'application/json');
      expect(completeResponse.status).toBe(200);

      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);

      const ids = response.body.map((task) => task.id);
      const dueActiveIndex = ids.indexOf(dueActive.id);
      const noDueActiveIndex = ids.indexOf(noDueActive.id);
      const completedTaskIndex = ids.indexOf(completedTask.id);

      expect(dueActiveIndex).toBeGreaterThanOrEqual(0);
      expect(noDueActiveIndex).toBeGreaterThanOrEqual(0);
      expect(completedTaskIndex).toBeGreaterThanOrEqual(0);
      expect(dueActiveIndex).toBeLessThan(noDueActiveIndex);
      expect(noDueActiveIndex).toBeLessThan(completedTaskIndex);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task', dueDate: '2026-03-01' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.completed).toBe(false);
      expect(response.body.dueDate).toBe(newTask.dueDate);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 for invalid due date', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', dueDate: '03-01-2026' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Due date must be in YYYY-MM-DD format');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update title, completion, and due date', async () => {
      const task = await createTask('Needs Update');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ title: 'Updated Task', completed: true, dueDate: '2026-04-01' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Task');
      expect(response.body.completed).toBe(true);
      expect(response.body.dueDate).toBe('2026-04-01');
    });

    it('should clear due date when set to null', async () => {
      const task = await createTask('Has Due Date', '2026-02-28');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ dueDate: null })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.dueDate).toBeNull();
    });

    it('should return 400 for invalid completion payload', async () => {
      const task = await createTask('Invalid Completion');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ completed: 'yes' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Completed must be a boolean value');
    });

    it('should return 400 for empty title update', async () => {
      const task = await createTask('Title Update Check');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ title: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Task title is required');
    });

    it('should return 400 for invalid due date update', async () => {
      const task = await createTask('Due Date Validation');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ dueDate: '2026/04/01' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Due date must be in YYYY-MM-DD format');
    });

    it('should return 404 when task does not exist', async () => {
      const before = await request(app).get('/api/tasks');
      expect(before.status).toBe(200);

      const response = await request(app)
        .patch('/api/tasks/999999')
        .send({ title: 'No-op update' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');

      const after = await request(app).get('/api/tasks');
      expect(after.status).toBe(200);
      expect(after.body.length).toBe(before.body.length);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });
});