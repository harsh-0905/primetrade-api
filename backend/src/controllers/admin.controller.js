const User = require("../models/User.model");
const Task = require("../models/Task.model");

/**
 * GET /api/v1/admin/users
 * Returns all users (admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: { users, total: users.length } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/stats
 * Returns platform stats (admin only)
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, tasksByStatus] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalTasks, tasksByStatus },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete any user account (admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Also remove all their tasks
    await Task.deleteMany({ owner: req.params.id });
    res.status(200).json({ success: true, message: "User and their tasks deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getStats, deleteUser };
