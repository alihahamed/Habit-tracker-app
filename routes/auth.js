const express = require("express")
const router = express.Router()
const authController = require("../controllers/index")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/habits", authController.habits)
router.get("/habits", authController.getHabits)
router.post("/track",authController.trackHabits)
router.delete("/track/:habitId", authController.deleteHabitTracking)
router.get("/main-streak",authController.getMainStreak)
router.get("/logout",authController.logout)
router.get("/history",authController.history)

module.exports = router;