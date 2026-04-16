const router = require("express").Router();
const { getAllUsers, getStats, deleteUser } = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// All admin routes: must be logged in AND have role=admin
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform statistics (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Stats data
 *       403:
 *         description: Forbidden
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user and their data (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/users/:id", deleteUser);

module.exports = router;
