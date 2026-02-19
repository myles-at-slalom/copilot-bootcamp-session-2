import React, { useState, useEffect } from 'react';
import './App.css';

const FILTERS = {
  all: 'all',
  active: 'active',
  completed: 'completed',
};

const sortTasks = (tasks) => {
  return [...tasks].sort((taskA, taskB) => {
    if (taskA.completed !== taskB.completed) {
      return taskA.completed ? 1 : -1;
    }

    if (taskA.dueDate && !taskB.dueDate) {
      return -1;
    }

    if (!taskA.dueDate && taskB.dueDate) {
      return 1;
    }

    if (taskA.dueDate && taskB.dueDate) {
      return taskA.dueDate.localeCompare(taskB.dueDate);
    }

    return String(taskB.createdAt).localeCompare(String(taskA.createdAt));
  });
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS.all);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(sortTasks(result));
      setError(null);
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      setValidationError('Task title is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          dueDate: newDueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to create task');
      }

      const result = await response.json();
      setTasks(sortTasks([...tasks, result]));
      setNewTitle('');
      setNewDueDate('');
      setValidationError('');
      setError(null);
    } catch (err) {
      setError(`Error creating task: ${err.message}`);
    }
  };

  const updateTask = async (taskId, changes) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(sortTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task))));
      setError(null);
      return true;
    } catch (err) {
      setError(`Error updating task: ${err.message}`);
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to delete task');
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(`Error deleting task: ${err.message}`);
    }
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate || '');
    setEditValidationError('');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDueDate('');
    setEditValidationError('');
  };

  const saveTaskChanges = async (taskId) => {
    if (!editTitle.trim()) {
      setEditValidationError('Task title is required');
      return;
    }

    const saved = await updateTask(taskId, {
      title: editTitle.trim(),
      dueDate: editDueDate || null,
    });

    if (saved) {
      cancelEditingTask();
    }
  };

  const toggleTaskCompletion = async (task) => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const filteredTasks = sortTasks(tasks).filter((task) => {
    if (activeFilter === FILTERS.active) {
      return !task.completed;
    }

    if (activeFilter === FILTERS.completed) {
      return task.completed;
    }

    return true;
  });

  const isOverdue = (task) => {
    if (task.completed || !task.dueDate) {
      return false;
    }

    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    return task.dueDate < todayString;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO App</h1>
        <p>Plan, prioritize, and complete your tasks</p>
      </header>

      <main className="App-main">
        <section className="panel">
          <h2>Add Task</h2>
          <form onSubmit={createTask} className="task-form">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (validationError) {
                  setValidationError('');
                }
              }}
              placeholder="Task title"
              aria-label="Task title"
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              aria-label="Task due date"
            />
            <button type="submit" className="button-primary">Add Task</button>
          </form>
          {validationError && <p className="error" role="alert">{validationError}</p>}
        </section>

        <section className="panel">
          <div className="tasks-header">
            <h2>Tasks</h2>
            <div className="filter-group" role="group" aria-label="Task filters">
              <button
                type="button"
                className={activeFilter === FILTERS.all ? 'button-secondary active' : 'button-secondary'}
                onClick={() => setActiveFilter(FILTERS.all)}
              >
                All
              </button>
              <button
                type="button"
                className={activeFilter === FILTERS.active ? 'button-secondary active' : 'button-secondary'}
                onClick={() => setActiveFilter(FILTERS.active)}
              >
                Active
              </button>
              <button
                type="button"
                className={activeFilter === FILTERS.completed ? 'button-secondary active' : 'button-secondary'}
                onClick={() => setActiveFilter(FILTERS.completed)}
              >
                Completed
              </button>
            </div>
          </div>

          {loading && <p>Loading tasks...</p>}
          {error && <p className="error" role="alert">{error}</p>}
          {!loading && !error && (
            <ul className="task-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <li key={task.id} className={`task-row ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}`}>
                    {editingTaskId === task.id ? (
                      <div className="task-edit">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => {
                            setEditTitle(e.target.value);
                            if (editValidationError) {
                              setEditValidationError('');
                            }
                          }}
                          aria-label={`Edit title for ${task.title}`}
                        />
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          aria-label={`Edit due date for ${task.title}`}
                        />
                        <div className="task-actions">
                          <button type="button" className="button-primary" onClick={() => saveTaskChanges(task.id)}>
                            Save
                          </button>
                          <button type="button" className="button-secondary" onClick={cancelEditingTask}>
                            Cancel
                          </button>
                        </div>
                        {editValidationError && <p className="error" role="alert">{editValidationError}</p>}
                      </div>
                    ) : (
                      <>
                        <label className="task-main">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(task)}
                            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                          />
                          <span className="task-title">{task.title}</span>
                          {task.dueDate && (
                            <span className="task-due-date">Due: {task.dueDate}</span>
                          )}
                        </label>
                        <div className="task-actions">
                          <button type="button" className="button-secondary" onClick={() => startEditingTask(task)}>
                            Edit
                          </button>
                          <button type="button" className="button-danger" onClick={() => deleteTask(task.id)}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <p>No tasks found for this filter.</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;