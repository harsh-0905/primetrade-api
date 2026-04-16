const Task = require("../models/Task.model");
const AppError = require("../utils/AppError");

/**
 * GET /api/v1/tasks
 * Returns all tasks owned by the logged-in user
 * Supports ?status=todo&priority=high&page=1&limit=10
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build filter object dynamically
    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tasks/:id
 * Returns a single task (must belong to the logged-in user)
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      return next(new AppError("Task not found.", 404));
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/tasks
 * Creates a new task for the logged-in user
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created",
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/tasks/:id
 * Updates a task (only the owner can update)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true } // return updated doc, run schema validators
    );

    if (!task) {
      return next(new AppError("Task not found or not authorized.", 404));
    }

    res.status(200).json({ success: true, message: "Task updated", data: { task } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Deletes a task (only the owner can delete)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      return next(new AppError("Task not found or not authorized.", 404));
    }

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
