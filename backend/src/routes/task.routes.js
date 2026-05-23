const router = require("express").Router();
const { getTasks, getTaskStats, getTask, createTask, updateTask, deleteTask } = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate, createTaskSchema, updateTaskSchema } = require("../validators/schemas");

router.use(protect);

router.route("/").get(getTasks).post(validate(createTaskSchema), createTask);
router.get("/stats", getTaskStats);
router.route("/:id").get(getTask).patch(validate(updateTaskSchema), updateTask).delete(deleteTask);

module.exports = router;