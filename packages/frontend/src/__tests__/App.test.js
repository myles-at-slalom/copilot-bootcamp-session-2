import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const makeInitialTasks = () => ([
  { id: 1, title: 'Write docs', completed: false, dueDate: '2099-01-10', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, title: 'Refactor code', completed: true, dueDate: null, createdAt: '2026-01-02T00:00:00.000Z' },
]);

let tasks = makeInitialTasks();

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(tasks));
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    const { title, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const createdTask = {
      id: Math.max(...tasks.map((task) => task.id), 0) + 1,
      title,
      completed: false,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    };

    tasks = [...tasks, createdTask];
    return res(ctx.status(201), ctx.json(createdTask));
  }),

  rest.patch('/api/tasks/:id', (req, res, ctx) => {
    const taskId = Number(req.params.id);
    const task = tasks.find((candidate) => candidate.id === taskId);

    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    const updatedTask = {
      ...task,
      ...req.body,
    };

    tasks = tasks.map((candidate) => (candidate.id === taskId ? updatedTask : candidate));
    return res(ctx.status(200), ctx.json(updatedTask));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const taskId = Number(req.params.id);
    tasks = tasks.filter((candidate) => candidate.id !== taskId);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: taskId }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  tasks = makeInitialTasks();
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header and existing tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('TODO App')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeInTheDocument();
      expect(screen.getByText('Refactor code')).toBeInTheDocument();
    });
  });

  test('creates a new task with due date', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByLabelText('Task title');
    const dueDateInput = screen.getByLabelText('Task due date');
    await act(async () => {
      await user.type(input, 'Ship feature');
      await user.type(dueDateInput, '2099-01-20');
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Ship feature')).toBeInTheDocument();
      expect(screen.getByText('Due: 2099-01-20')).toBeInTheDocument();
    });
  });

  test('shows validation when creating empty task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
    });
  });

  test('filters completed tasks', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      await user.click(screen.getByText('Completed'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Write docs')).not.toBeInTheDocument();
      expect(screen.getByText('Refactor code')).toBeInTheDocument();
    });
  });

  test('edits and deletes a task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const editButtons = await screen.findAllByText('Edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });

    const editInput = screen.getByLabelText('Edit title for Write docs');
    await act(async () => {
      await user.clear(editInput);
      await user.type(editInput, 'Write better docs');
      await user.click(screen.getByText('Save'));
    });

    await waitFor(() => {
      expect(screen.getByText('Write better docs')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Write better docs')).not.toBeInTheDocument();
    });
  });

  test('toggles task completion and updates completed filter', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const writeDocsCheckbox = await screen.findByLabelText('Mark Write docs as complete');
    await act(async () => {
      await user.click(writeDocsCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Mark Write docs as incomplete')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByText('Completed'));
    });

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeInTheDocument();
      expect(screen.getByText('Refactor code')).toBeInTheDocument();
    });
  });

  test('shows API error when loading tasks fails', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('shows validation when saving an edit with empty title', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const editButtons = await screen.findAllByText('Edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });

    const editInput = screen.getByLabelText('Edit title for Write docs');
    await act(async () => {
      await user.clear(editInput);
      await user.click(screen.getByText('Save'));
    });

    await waitFor(() => {
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
    });
  });
});