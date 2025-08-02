const express = require("express")
const { raw } = require("mysql2")
const router = express.Router()

router.get("/", (req,res) => {
    const rawDate = new Date().toLocaleDateString("en-GB", {
        weekday:"short", day:"numeric",month:"short"
    })
    const todayDate = "•     "+ rawDate
    res.render("dashboard", {todayDate})
})


router.get("/habits", (req,res) => {
    res.render("habits")
})

router.get("/login", (req,res) => {
    res.render("login")
})

router.get("/register", (req,res) => {
    res.render("register")
})

router.get("/profile", (req,res) => {
    res.render("profile")
})

router.get("/history", (req,res) => {
    res.render("history")
})

module.exports = router