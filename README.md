# 🎯 Habit Tracker

A modern Progressive Web App for tracking daily and weekly habits with streak counting and visual analytics.

![Habit Tracker Demo](screenshot.png)

## ✨ Features

- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🎨 **Modern Dark UI** - Sleek interface with custom colors and icons
- 🔥 **Streak Tracking** - Daily/weekly habit streaks with progress rings
- 📊 **Visual History** - GitHub-style contribution graphs
- 👤 **User Accounts** - Secure authentication and profiles

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MySQL, bcrypt, sessions  
**Frontend:** Vanilla JS, CSS3, Service Workers, Handlebars  
**Database:** MySQL with session store

## 🚀 Quick Start

1. **Clone & Install**
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
npm install
```

2. **Setup Environment**
```env
# .env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password  
DB_NAME=habit_tracker
SECRET=your_session_secret
PORT=3000
```

3. **Create Database**
```sql
CREATE DATABASE habit_tracker;
-- Run the SQL schema from database setup section below
```

4. **Start App**
```bash
npm start
```

Visit `http://localhost:3000`

## 📊 Database Schema

<details>
<summary>Click to expand SQL schema</summary>

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hashed VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit (
    habit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    frequency ENUM('daily', 'weekly') NOT NULL,
    icon VARCHAR(50) NOT NULL,
    completed_time VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tracking (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    habit_id INT NOT NULL,
    user_id INT NOT NULL,
    completed_date DATE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_time VARCHAR(20),
    streak_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habit(habit_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT
);
```
</details>

## 📱 Screenshots

| Dashboard | Create Habit | History |
|-----------|--------------|---------|
| ![Dashboard](screenshots/dashboard.png) | ![Habits](screenshots/habits.png) | ![History](screenshots/history.png) |

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
⭐ **Star this repo if you found it helpful!**
