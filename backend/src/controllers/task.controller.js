const Task = require("../models/Task.model");
const AppError = require("../utils/AppError");

/**
 * GET /api/v1/tasks
 * Supports ?status=&priority=&search=&page=&limit=
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/tasks/stats
 * Returns aggregated task stats for the logged-in user
 */
const getTaskStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [byStatus, byPriority, recentActivity] = await Promise.all([
      Task.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { owner: ownerId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            created: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { byStatus, byPriority, recentActivity },
    });
  } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return next(new AppError("Task not found.", 404));
    res.status(200).json({ success: true, data: { task } });
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate, tags, owner: req.user._id });
    res.status(201).json({ success: true, message: "Task created", data: { task } });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return next(new AppError("Task not found or not authorized.", 404));
    res.status(200).json({ success: true, message: "Task updated", data: { task } });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return next(new AppError("Task not found or not authorized.", 404));
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTaskStats, getTask, createTask, updateTask, deleteTask };