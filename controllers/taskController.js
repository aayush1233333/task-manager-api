const Task = require('../models/Task');

// POST /api/tasks
async function createTask(req, res) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// GET /api/tasks?status=&cursor=&limit=
// Cursor-based pagination on _id (ObjectIds are roughly time-ordered),
// so results stay stable even if new tasks are inserted mid-pagination —
// same motivation as the keyset pagination used in the Product Catalog
// project, adapted to Mongo's ObjectId ordering instead of a SQL composite index.
async function getTasks(req, res) {
  try {
    const { status, cursor, limit = 20 } = req.query;
    const pageSize = Math.min(parseInt(limit, 10) || 20, 100);

    const filter = {};
    if (status) filter.status = status;
    if (cursor) filter._id = { $lt: cursor };

    const tasks = await Task.find(filter)
      .sort({ _id: -1 })
      .limit(pageSize + 1); // fetch one extra to know if there's a next page

    const hasNextPage = tasks.length > pageSize;
    const results = hasNextPage ? tasks.slice(0, pageSize) : tasks;
    const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

    res.json({
      tasks: results,
      next_cursor: nextCursor,
      has_next_page: hasNextPage,
      page_size: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// GET /api/tasks/:id
async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
