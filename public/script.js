
if ('serviceWorker' in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log("Service worker registered with scope: ",registration.scope)
        })
        .catch((error) => {
            console.log("Service worker registration failed:",error)
        })
    })
}




class Toast{
    static show(message,type='info',duration = 5000){
        const container = document.getElementById("toast-container")
        const toast = document.createElement("div");
        toast.className = `toast ${type}`
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'i'
        }
        
        toast.innerHTML = `
        <span class = "toast-icon">${icons[type] || icons.info}</span>
        <span class = "toast-message">${message}</span>
        <button class = "toast-close">Close</button>
        `

        container.appendChild(toast)

        // auto - close
       setTimeout( () => {
        toast.classList.add("close")
        toast.remove()
       }, duration) 

        // close button
        const closeButton = document.querySelector(".toast-close")
        closeButton.addEventListener("click", () => {   
            toast.remove();
        })


    }
}

// functions for greeting message

function time(){
    const hour = new Date().getHours()
    if(hour >= 5 && hour <12){
        return "Good Morning"
    }
    if(hour >= 12 && hour < 17){
        return "Good Afternoon"
    }
    else{
        return "Good Evening"
    }

}

function greeting() {
    const greetingText = document.getElementById("greeting-text");
    const greetingUsername = document.querySelector(".greeting-username");
    const user = localStorage.getItem("user");
    if (!greetingText || !greetingUsername) {
        return;
    }
    if (user) {
        const greetingName = JSON.parse(user);
        greetingText.innerHTML = '';
        greetingText.append(document.createTextNode(`${time()}, `));
        greetingText.appendChild(greetingUsername);
        greetingUsername.textContent = `${greetingName.username}`;
    } else {
        greetingText.textContent = 'Guest';
    }
}
        
// login page

if(document.getElementById("login-form"))
    {  
        
        document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault()
        const usernameInput = document.getElementById("username").value
        const passwordInput = document.getElementById("password").value
        const rememberMe = document.getElementById("remember-checkbox").checked
        console.log(rememberMe)
        
    
        if(!usernameInput || !passwordInput){
            Toast.show("Fill in the credentials!","warning")
            return;
        }
    
        const response = await fetch("/auth/login",{
            method:'post',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                username:usernameInput,
                password:passwordInput,
                remember:rememberMe
            })
        })
    
        const data = await response.json()
        
        if(data.success){
            Toast.show("Login Successfull!", "success")
            
            localStorage.setItem("user", JSON.stringify({
                userID:data.user.id,
                username:data.user.username
            }))
           
            window.location.href = "/"
        }
        else{
            Toast.show("Invalid Username or Password","error")
        }
        
    }) 
} 
 

// register page

if(document.getElementById("register-form"))
    {
        document.getElementById("register-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("reg-username").value;
            const passwordInput = document.getElementById("reg-password").value
            const confirmInput = document.getElementById("reg-confirm").value
            const email = document.getElementById("reg-email").value
        
            const username = document.getElementById("reg-username")
            const password = document.getElementById("reg-password")
            const confirmPassword = document.getElementById("reg-confirm")
        
            if(passwordInput!==confirmInput){
                Toast.show("Passwords do not match", "info")
                confirmPassword.value = ''
                return;
            }

            if(passwordInput>8){
                Toast.show("Password should be less than 8 characters!","error")
                return
            }
        
            const response = await fetch("/auth/register", {
                method:"post",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    username:usernameInput,
                    password:passwordInput,
                    confirmPassword:confirmInput,
                    email:email
                })
            })

            if(!response.ok){
                Toast.show("Username taken!", "info")
                return
            }
            
            const data = await response.json()
            if(data.success){
                Toast.show("User registered!", "success")
                console.log("Hello!")
            }

            
        })
    } 

// habits 
document.addEventListener("DOMContentLoaded", function() {
    const habitForm = document.getElementById("habit-form")

    if(habitForm){
        const frequencyBtn = document.querySelectorAll(".frequency-btn");
    const frequency = document.getElementById("frequency")
    const cancelBtn = document.getElementById("cancel-btn")
    const habitName = document.getElementById("habitName")
    const defaultFreq = document.querySelector('.frequency-btn[data-frequency="daily"]')
    const defaultColor = document.querySelector('.color-btn[data-color="#ff0707"]')
    const colourBtn = document.querySelectorAll(".color-btn")
    const iconBtn = document.querySelectorAll(".icon-btn")
    const defaultIcon = document.querySelector('.icon-btn[data-icon = "video-game.png"]')
    const icon = document.getElementById("icon")
    const color = document.getElementById("color")
    const saveHabit = document.getElementById("saveHabit")


        frequencyBtn.forEach(button => {
        button.addEventListener("click", (e) => {

        frequencyBtn.forEach(btn => {
            btn.classList.remove('active')
        })
            e.currentTarget.classList.add('active')
            frequency.value = e.currentTarget.textContent.toLowerCase()
    })
})

    colourBtn.forEach(button => {
    button.addEventListener("click", (e) => {

        colourBtn.forEach(btn => {
            btn.classList.remove('active')
        })
            e.currentTarget.classList.add('active')
            color.value = e.currentTarget.getAttribute('data-color')
        
    })
})

    cancelBtn.addEventListener("click", (e) => {
    habitName.value = '';
    frequencyBtn.forEach(btn => {
        btn.classList.remove('active')
    })
    defaultFreq.classList.add('active')

    colourBtn.forEach(btn => {
        btn.classList.remove('active')
    })
    defaultColor.classList.add('active')

    iconBtn.forEach(btn => {
        btn.classList.remove('active')
    })
    defaultIcon.classList.add('active')
    
    })

    iconBtn.forEach(button => {
        button.addEventListener("click",(e) => {

            iconBtn.forEach(btn => {
                btn.classList.remove('active')
            })

            e.currentTarget.classList.add('active')
            icon.value = e.currentTarget.getAttribute('data-icon')
        })
    })

    }
    
})


if(document.getElementById("habit-form")){
    document.getElementById("habit-form").addEventListener("submit", async (e) => {
        e.preventDefault()
        const habitName = document.getElementById("habitName")
        const frequency = document.getElementById("frequency")
        const color = document.getElementById("color")
        const icon = document.getElementById("icon")

        const response = await fetch("/auth/habits", {
            method:"POST",
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                habitName: habitName.value,
                frequency:frequency.value,
                color:color.value,
                icon:icon.value
            })
        })
        const data = await response.json()
        if(data.success){
            Toast.show("Habit Added!","success")
            e.target.reset()
        }
        else{
            Toast.show("Failed to add habit","error")
        }
    })
}


// dashboard habits

document.addEventListener("DOMContentLoaded", async () => {
    const dashboardContainer = document.getElementById("dashboard-container");
    if (dashboardContainer) {
         greeting()
      loadDashboard();
    }
});

async function loadDashboard() {
    // Fetch habits and main streak in parallel
    const [habitsResponse, streakResponse] = await Promise.all([
        fetch("/auth/habits", { credentials: 'include' }),
        fetch("/auth/main-streak", { credentials: 'include' })
    ]);

    if (!habitsResponse.ok) {
        console.error("Error fetching habits");
        return;
    }

    const habitsData = await habitsResponse.json();
    const streakData = await streakResponse.json();
    const streakPerc = habitsData.percentage;

    const progressRing = document.querySelector(".progress-ring");
    progressRing.style.setProperty('--percent', streakPerc);

    const progressPercentage = document.querySelector(".progress-percentage"); 
    progressPercentage.textContent = `${Math.round(streakPerc)}%`; 

    // Update streak display
    updateStreakDisplay(streakData.streak);

    if (habitsData.success) {
        const habits = habitsData.habits;
      
        const habitCard = document.getElementById("habits-card")
        const noHabitsMessage = document.getElementById("no-habits-message");

        if(habits.length === 0 ){
            habitCard.style.display = 'none'
            noHabitsMessage.style.display = 'block'
            return
        }

        habitCard.style.display = 'block'
        noHabitsMessage.style.display = 'none'
  
        const habitContainer = document.querySelector(".habit-list");
        let habitHTML = "";


        habits.forEach(habit => {
            const isChecked = habit.isCompleted ? 'checked' : '';
            const completedClass = habit.isCompleted ? 'completed' : '';
            const completedTime = habit.isCompleted ? `` : `remove`;
            habitHTML += `
                <div class="habit-item" data-color="${habit.color}">
                    <label class="checkbox-container">
                        <input type="checkbox" class="habit-checkbox" data-id=${habit.habit_id} ${isChecked}>
                        <span class="custom-checkbox"></span>
                    </label>
                    <div class="habit-content">
                        <span class="habit-text ${completedClass}" data-id=${habit.habit_id}>
                            ${habit.name}
                            <span id="frequencyText"> (${habit.frequency})</span>
                            <img src = "/icons/${habit.icon}" alt = "icon" class = "habit-icon ${completedClass}">
                        </span>
                    </div>
                    <span class="habit-time ${completedTime}">${habit.completed_time || ''}</span>
                </div>
            `;
        });

        habitContainer.innerHTML = habitHTML;

        const habitCheckboxes = document.querySelectorAll(".habit-checkbox");
        habitCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", handleHabitCheck);
        });
    } else {
        console.error("No habits found");
    }
}

async function handleHabitCheck(event) {
    const checkbox = event.target;
    const habitId = checkbox.getAttribute('data-id');
    const habitText = document.querySelector(`.habit-text[data-id="${habitId}"]`);

    if (checkbox.checked) {
        // Logic for completing a habit
        const response = await fetch("/auth/track", {
            method: 'post',
            credentials: 'include',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ habitId: habitId, completed: true })
        });
        const data = await response.json();
        console.log("check data", data)

        if (data.success) {
            const habitItem = checkbox.closest('.habit-item')
            habitItem.classList.add('shake')
            habitText.classList.add("completed");

            setTimeout( () => {
                habitItem.classList.remove('shake')
            }, 500)

            Toast.show("Good going!", "info");
            console.log("streak count",data.streakCount.streak_count )
            updateStreakDisplay(data.streakCount.streak_count);
        } else {
            Toast.show(data.message || "Could not track habit.", "error");
            checkbox.checked = false; // Revert checkbox on failure
        }
    } else {
        // Logic for un-completing a habit
        const response = await fetch(`/auth/track/${habitId}`, {
            method: 'delete',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {

            habitText.classList.remove("completed");
            Toast.show("Tracking removed.", "warning");
            // After deleting, we need to refetch the main streak to see what it is now
            const streakResponse = await fetch("/auth/main-streak", { credentials: 'include' });
            const streakData = await streakResponse.json();
            updateStreakDisplay(streakData.streak);
        } else {
            Toast.show("Could not remove tracking.", "error");
            checkbox.checked = true; // Revert checkbox on failure
        }
    }
}

function updateStreakDisplay(streakCount) {
    const streakText = document.querySelector(".streak-text");
    const fireContainer = document.querySelector(".fire-container");
    if (!streakText || !fireContainer) return;

    if (streakCount > 0) {
        streakText.textContent = `${streakCount} - Day Streak!`;
        fireContainer.textContent = '🔥'
    } else {
        streakText.textContent = 'No Streaks Yet 😔';
        fireContainer.textContent = ``;
    }
}


document.addEventListener("DOMContentLoaded", async (e) => {
    const profileContainer = document.getElementById("profile-container")

    if(profileContainer){
      await  loadProfile()
    }
})

 async function loadProfile(){
    const username = document.getElementById("username")
    const joinDate = document.getElementById("join-date")

    const user = localStorage.getItem("user")
    const userParsed = JSON.parse(user)
    const userParsedUsername = userParsed.username

    if(!userParsedUsername){
        console.log("No username found in local storage")
        Toast.show("No username found in local storage", "error")
        return
    }

    username.textContent = userParsedUsername

    const habitsResponse = await fetch("/auth/habits", {
        credentials:'include'
    })
    const streakResponse = await fetch("/auth/main-streak", { 
        credentials: 'include' 
    });
    
    
    const streakData = await streakResponse.json();
    const habitsData = await habitsResponse.json()


    if(habitsData.success){
        const totalHabits = habitsData.habits.length
        const completedHabits = habitsData.completedHabits.length
        const completionRate = (completedHabits / totalHabits) * 100 || 0
    
        const progressRing = document.querySelector(".large-progress-ring")
        const progressValue = document.querySelector(".progress-value")
        const currentStreak = document.getElementById("current-streak")
        const longestStreak = document.getElementById("longest-streak")
        const totalCompleted = document.getElementById("total-completed")
        const total = document.getElementById("total-habits")

        

        let joined_date = habitsData.joined_date.created_at
        joined_date = joined_date.split('T')[0]

        joinDate.textContent = `${joined_date}`
        progressRing.style.setProperty("--percent",completionRate)
        progressValue.textContent = `${Math.round(completionRate)} %`
        currentStreak.textContent = `${streakData.streak}`
        longestStreak.textContent = `${streakData.longest}`
        console.log(streakData)
        totalCompleted.textContent = `${completedHabits}`
        total.textContent = `${totalHabits}`


        const logoutBtn = document.getElementById("logoutBtn")

        logoutBtn.addEventListener("click", async (e) => {
        const logoutResponse = await fetch("/auth/logout", {
        credentials:'include'
    })

        const logoutData =  await logoutResponse.json()
            if(logoutData.success){
                localStorage.removeItem("user")
                window.location.href = '/login'
         }   
            console.log("error")
        })    
    }

 }

 document.addEventListener("DOMContentLoaded", async (e) => {
    if(document.getElementById("history-container")){
        loadHistory()
    }
    }
 )

 async function loadHistory(){

    const historyResponse = await fetch("/auth/history", {
        credentials:'include'
    })

    const historyData = await historyResponse.json()

    if(historyData.success){
       const habits = historyData.habits
       const graphContainer = document.getElementById("habit-history-graph-container")

       if (habits.length === 0) {
           graphContainer.innerHTML = `<div class="no-habits-container"><h3>No habits yet!</h3><p>Start tracking your habits to see your history here.</p></div>`;
           return;
       }

       let habitHTML = ""
       
       const currentYear = new Date().getFullYear()

       habits.forEach(habit => {
                const firstDayOfYear = new Date(currentYear, 0, 1);
                // Adjust to make Monday the first day of the week (0=Mon, 1=Tue, ..., 6=Sun)
                const dayOfWeekOffset = (firstDayOfYear.getDay() + 6) % 7;

                let gridCells = ""

                // Add empty cells for the offset
                for (let i = 0; i < dayOfWeekOffset; i++) {
                    gridCells += `<div class="grid-cell empty"></div>`;
                }

                const daysInYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;

                for(let i=0; i < daysInYear; i++){
                    
                    const currentDate = new Date(currentYear, 0, 1)
                    currentDate.setDate(currentDate.getDate() + i)
                    const formattedDate = currentDate.toISOString().split('T')[0]

                    const isCompleted = habit.completedDates.includes(formattedDate)
                    const habitColor = habit.color
                    const completedClass = isCompleted ? 'completed-day' : ''
                    const colorAttribute = `style="--habit-color: ${habitColor}"`

                    gridCells += `<div class="grid-cell ${completedClass}" ${colorAttribute}></div>`
                }
            
            habitHTML += `
          <section class="habit-graph-section">
            
              <div class="habit-info">
                  <img src="/icons/${habit.icon}" alt="${habit.name}" class="habit-icon">
                  <h4 class="habit-name">${habit.name}</h4>
              </div>

              <div class="contribution-grid-container">
                  <div class="grid-labels-wrapper">
                      <div class="empty-corner"></div>
                      <div class="day-labels">
                          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>Su</span>
                      </div>
                  </div>

                  <div class="grid-content-wrapper">
                      <div class="month-labels">
                          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                      </div>

                      <div class = "contribution-grid">
                          ${gridCells}
                      </div>
                  </div>
              </div>
          </section>
            `

       })

       graphContainer.innerHTML = habitHTML
    }

 }
