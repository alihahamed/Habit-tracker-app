const express = require("express")
const mysql = require("mysql2")
const bcrypt = require("bcrypt");
const { join } = require("path");
const saltRounds = 10;
const path = require("path")
const fs = require("fs")

const db = require('../database')

// register page

exports.register = async (req,res) => {
    const {username,password,confirmPassword,email} = req.body;

    if(password!==confirmPassword){
        return res.status(400).json({error:"passwords dont match!"})
    }
    if(password.length>8){
        return res.json({error:"password's length must be less than 8 characters!"})
    }


    const [users] = await db.query(
        "SELECT user_id FROM users WHERE username = ?", [username]
    )


    if(users.length > 0) {
        return res.status(400).json({success:false, error:"username taken!"})
    }


    const hashedPassword = await bcrypt.hash(password,saltRounds)
    await db.query(
        "INSERT INTO users (username,password_hashed,email) VALUES (?,?,?)", [username,hashedPassword,email || null]
    )
    return res.json({success:true, message:"User registered!"})
}

// login page

exports.login = async (req,res) => {
    const {username,password,remember} = req.body;

   const [users] = await db.query(
        "SELECT user_id,username,password_hashed FROM users WHERE username = ?", [username]
    )
    if(users.length === 0) {
        return res.status(400).json({error:"Invalid username or password"})
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hashed)

    if(!isMatch){
        return res.status(400).json({error:"Invalid password"})
    }

    req.session.userId = user.user_id

    
    if(remember) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
    }

        req.session.save((err) => {
            if (err) {
                // If saving fails, log the error and tell the client
                console.error("Session save error:", err);
                return res.status(500).json({ success: false, error: "Failed to save session" });
            }

            // NOW the session is saved. It is safe to send the success response.
            return res.json({
                success: true,
                user: {
                    id: req.session.userId,
                    username: user.username,
                }
            });
        });
 
}

// posting habits

exports.habits = async (req,res) => {
    const {habitName, frequency, color, icon} = req.body;
    const user_id = req.session.userId

    if(!habitName.trim()){
        return res.status(400).json({success:false,message:"Habit name is required"})
    }
    if(!frequency){
        return res.status(400).json({success:false,message:"Frequency is required"})
    }
    if(!color){
        return res.status(400).json({success:false, message:"Color is required"})
    }

    if(!icon){
        return res.status(400).json({success:false,message:"Icon is required"})
    }

    if(!["daily","weekly"].includes(frequency)){
        return res.status(400).json({success:false,message:"Invalid Frequency selection"})
    }

    function isValid(color){
        const hexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return hexColor.test(color)
    }

    if(!isValid(color)){
        return res.status(400).json({success:false,message:"Invalid Color"})
    }

    await db.query(
        "INSERT INTO habit (user_id, name, color, frequency, icon) VALUES (?,?,?,?,?)", [user_id,habitName.trim(),color,frequency,icon]
    )
    console.log(icon)
    return res.json({success:true,message:"Habit added"})
    
}

// get habits

exports.getHabits = async (req, res) => {
    try {
        const userId = req.session.userId;
        const daily = 'daily'
        const weekly = 'weekly'
        
        // today's date
        const todayDate = new Date()
        const todayDateString = todayDate.toISOString().split('T')[0]

        // week's date
        const weekDate = new Date()
        const dayOfWeek = weekDate.getDay()
        weekDate.setDate(weekDate.getDate() - dayOfWeek)
        const dayOfWeekString = weekDate.toISOString().split('T')[0]

        const [[joined_date]] = await db.query(
        "SELECT created_at FROM users WHERE user_id = ?", [userId]
    )
       
        

        // 1. Get all of the user's habits
        const [habits] = await db.query(
            "SELECT * FROM habit WHERE user_id = ?",
            [userId]
        );
        
        // 2. Get the IDs of habits completed today
        const [todaysCompletions] = await db.query(
            "SELECT t.habit_id FROM habit AS h INNER JOIN tracking AS t ON h.habit_id = t.habit_id WHERE h.user_id = ? AND h.frequency = ? AND t.completed_date = ?",[userId,daily,todayDateString]
        );
        

        const [weekCompletions] = await db.query(
            "SELECT t.habit_id FROM habit AS h INNER JOIN tracking AS t ON h.habit_id = t.habit_id WHERE h.user_id = ? AND h.frequency = ? AND t.completed_date >= ? AND t.completed_date <= ?",[userId,weekly,dayOfWeekString,todayDateString]
        )

        // 3. Create a fast way to check which IDs are completed
        const allCompletedHabitIds = new Set([...todaysCompletions.map(item => item.habit_id), ...weekCompletions.map(item => item.habit_id)]); // `[ { habit_id: 10 }, { habit_id: 12 } ]` into a simple, clean list of numbers: `[ 10, 12 ]`

        // 4. Add the `isCompleted` property to each habit
        const habitsWithCompletion = habits.map(habit => ({
            ...habit,
            isCompleted: allCompletedHabitIds.has(habit.habit_id)
        }));

        const completedCount = habitsWithCompletion.filter(habit => habit.isCompleted === true) 
        const completedCountSize = completedCount.length;
        console.log(completedCountSize)
        const habitsWithCompletionSize = habitsWithCompletion.length
        let percentageCount = "0"
        
        if(habitsWithCompletionSize > 0){
            percentageCount = (completedCountSize/ habitsWithCompletionSize * 100 )
        }

         
        console.log("percentage count", percentageCount)
        return res.json({ success: true, habits: habitsWithCompletion, percentage: percentageCount, joined_date, completedHabits:completedCount });

    } catch (error) {
        console.error("Error fetching habits:", error);
        return res.status(400).json({ success: false, message: "Error fetching habits", error: error });
    }
}

// track habits

exports.trackHabits = async (req,res) => {
    try {
        const {habitId, completed} = req.body;
        console.log(req.body)
        const today = new Date().toISOString().split('T')[0]
        console.log(today)
        const user_id = req.session.userId
        console.log(req.session)
        const [trackingDate] = await db.query("SELECT completed_date, streak_count FROM tracking WHERE habit_id = ? AND user_id = ? ORDER BY completed_date DESC LIMIT 1", [habitId, user_id]);
        let newStreakCount;

        // Helper function to get a UTC date string for comparison
        function getUtcDateString(date) {
            return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }

        const todayUtc = getUtcDateString(new Date());

        if (trackingDate.length === 0) {    // if the habit is newly created and its the first completion
            newStreakCount = 1;
        } else 
            {
            const lastTrackingEntry = trackingDate[0];
            const lastCompletedDateUtc = getUtcDateString(lastTrackingEntry.completed_date);
            const lastStreakCount = lastTrackingEntry.streak_count;

            // Calculate yesterday's date in UTC for comparison
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayUtc = getUtcDateString(yesterday);

            if (lastCompletedDateUtc === todayUtc) {
                return res.json({ success: false, message: "Habit already completed today" });
            } else if (lastCompletedDateUtc === yesterdayUtc) {
                newStreakCount = lastStreakCount + 1;
            } else {
                newStreakCount = 1;
            }
        }

        function convertTime(convertedTime){
            let hour = convertedTime % 12 || 12;

            return hour;
        }

        let convertedTime = new Date().getHours()
        let ampm = convertedTime < 12 || convertedTime === 24 ? "AM" : "PM"
        let minutes = new Date().getMinutes()
         minutes = minutes.toString().padStart(2,"0")
        const completed_time = `${convertTime(convertedTime)}:${minutes} ${ampm} `
        console.log(completed_time)
        
       const [result] =  await db.query(
            "INSERT INTO tracking (habit_id, completed_date, completed, user_id, completed_time, streak_count ) VALUES (?,?,?,?,?,?)",[habitId,today,completed,user_id,completed_time, newStreakCount]
        )
        await db.query("UPDATE habit SET completed_time= ? WHERE habit_id = ?", [completed_time, habitId])
        const [[streakCount]] = await db.query("SELECT streak_count FROM tracking WHERE habit_id = ? ORDER BY streak_count DESC LIMIT 1", [habitId]) 
        return res.json({success:true, message:"Tracked habits!", user_id, completed, streakCount, completed_time})  
    } 
    catch (error) 
    {
        console.error(error)
        return res.status(400).json({success:false, message:"uhhh"})
    }
}

exports.deleteHabitTracking = async(req,res) => {
    try {
        const { habitId } = req.params;
        const userId = req.session.userId;
        const today = new Date().toISOString().split('T')[0];

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        await db.query(
            "DELETE FROM tracking WHERE habit_id = ? AND user_id = ? AND completed_date = ?",
            [habitId, userId, today]
        );

        return res.json({ success: true, message: "Tracked habit removed!" });

    } catch (error) {
        console.error("Error deleting tracking:", error);
        return res.status(400).json({ success: false, message: "Could not delete tracked habit" });
    }
}

exports.getMainStreak = async (req, res) => {
    try {
        const userId = req.session.userId;
        const today = new Date().toISOString().split('T')[0];

        if (!userId) {
            return res.json({ success: true, streak: 0 }); // Return 0 if not logged in
        }

        let [[longestStreak]] = await db.query(
            "SELECT MAX(streak_count) as max_streak FROM tracking WHERE user_id = ?", [userId]
        )

        const [[result]] = await db.query(
            "SELECT MAX(streak_count) as max_streak FROM tracking WHERE user_id = ? AND completed_date = ?",
            [userId, today]
        );

        const maxStreak = result.max_streak || 0;
        const longest = longestStreak.max_streak || 0
        console.log("max", longest)
        console.log("streak", maxStreak)
        return res.json({ success: true, streak: maxStreak, longest:longest });
        

    } catch (error) {
        console.error("Error fetching main streak:", error);
        return res.status(400).json({ success: false, message: "Could not fetch streak" });
    }
}

// logout 

exports.logout = async (req,res) => {
    if(req.session.userId){
        req.session.destroy()
        return res.json({success:true, message:"Session destroyed!"})
    }

    return res.status(400).json({success:false,message:"error finding session"})
}


exports.history = async (req,res) => {
    const user_id = req.session.userId

    const [historicalCompleted] = await db.query(
        "SELECT completed_date, habit_id FROM tracking WHERE user_id = ?",[user_id]
    ) 
    
    const [totalHabits] = await db.query(
        "SELECT * FROM habit WHERE user_id = ?", [user_id]
    )

   const habitsWithHistory = totalHabits.map(habit => ({
    ...habit, // Copy all existing habit properties
    completedDates: [] // Add an empty array for completed dates
}));

    historicalCompleted.forEach(entry => {
    const habitId = entry.habit_id;
    const completedDate = entry.completed_date; // This will be a Date object from MySQL

    // Find the habit object in your prepared array
    const targetHabit = habitsWithHistory.find(habit => habit.habit_id === habitId);

    if (targetHabit) {
        // Add the formatted date string to the habit's completedDates array
        targetHabit.completedDates.push(completedDate.toISOString().split('T')[0]);
    }
});
    console.log(habitsWithHistory)
    return res.json({ success: true, habits: habitsWithHistory });
}