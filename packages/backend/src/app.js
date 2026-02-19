const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('In-memory task database initialized');

const isValidTaskId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

const isValidDueDate = (dueDate) => {
  if (dueDate === null || dueDate === undefined || dueDate === '') {
    return true;
  }

  if (typeof dueDate !== 'string') {
    return false;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dueDate)) {
    return false;
  }

  const timestamp = Date.parse(`${dueDate}T00:00:00.000Z`);
  return !Number.isNaN(timestamp);
};

const toTaskDto = (task) => ({
  id: task.id,
  title: task.title,
  completed: Boolean(task.completed),
  dueDate: task.due_date,
  createdAt: task.created_at,
});

const selectTaskByIdStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
const insertTaskStmt = db.prepare('INSERT INTO tasks (title, due_date) VALUES (?, ?)');
const listTasksStmt = db.prepare(`
  SELECT * FROM tasks
  ORDER BY
    completed ASC,
    CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
    due_date ASC,
    created_at DESC
`);

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = listTasksStmt.all().map(toTaskDto);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be in YYYY-MM-DD format' });
    }

    const normalizedDueDate = dueDate && dueDate !== '' ? dueDate : null;
    const result = insertTaskStmt.run(title.trim(), normalizedDueDate);
    const id = result.lastInsertRowid;

    const newTask = selectTaskByIdStmt.get(id);
    res.status(201).json(toTaskDto(newTask));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, dueDate } = req.body;

    if (!isValidTaskId(id)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = selectTaskByIdStmt.get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    if (dueDate !== undefined && !isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be in YYYY-MM-DD format' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existingTask.completed;
    const updatedDueDate = dueDate !== undefined
      ? (dueDate === '' || dueDate === null ? null : dueDate)
      : existingTask.due_date;

    const updateStmt = db.prepare('UPDATE tasks SET title = ?, completed = ?, due_date = ? WHERE id = ?');
    updateStmt.run(updatedTitle, updatedCompleted, updatedDueDate, id);

    const updatedTask = selectTaskByIdStmt.get(id);
    res.json(toTaskDto(updatedTask));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = selectTaskByIdStmt.get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db };