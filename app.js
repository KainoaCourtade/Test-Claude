// Personal Development App

// Data Storage
class Storage {
    static get(key, defaultValue = []) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

// Motivational Quotes
const quotes = [
    "La seule façon de faire du bon travail est d'aimer ce que vous faites. - Steve Jobs",
    "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte. - Winston Churchill",
    "Croyez en vous-même et tout devient possible.",
    "Chaque jour est une nouvelle opportunité de devenir meilleur.",
    "La discipline est le pont entre les objectifs et l'accomplissement.",
    "Ne comptez pas les jours, faites que les jours comptent. - Muhammad Ali",
    "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.",
    "Vous n'avez pas à être parfait pour être incroyable.",
    "Le changement commence à la fin de votre zone de confort.",
    "Votre seule limite est vous-même.",
    "Les petites actions quotidiennes créent de grands résultats.",
    "La vie commence à la fin de votre zone de confort. - Neale Donald Walsch"
];

// App State
let currentTab = 'dashboard';
let goals = Storage.get('goals', []);
let habits = Storage.get('habits', []);
let journalEntries = Storage.get('journal', []);
let selectedMood = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initGoals();
    initHabits();
    initJournal();
    initDashboard();
    updateStats();
    displayRandomQuote();
});

// Tab Navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            currentTab = targetTab;

            if (targetTab === 'dashboard') {
                updateDashboard();
            }
        });
    });
}

// Dashboard
function initDashboard() {
    document.getElementById('new-quote-btn').addEventListener('click', displayRandomQuote);
}

function displayRandomQuote() {
    const quoteElement = document.getElementById('daily-quote');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.textContent = `"${randomQuote}"`;
}

function updateStats() {
    document.getElementById('goals-count').textContent = goals.filter(g => !g.completed).length;
    document.getElementById('habits-count').textContent = habits.length;

    // Calculate streak
    const streak = calculateStreak();
    document.getElementById('streak-count').textContent = streak;
}

function calculateStreak() {
    if (habits.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const allHabitsCompleted = habits.every(habit => {
            return habit.completedDates && habit.completedDates.includes(dateStr);
        });

        if (allHabitsCompleted && habits.length > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

function updateDashboard() {
    updateStats();
    displayWeeklyProgress();
}

function displayWeeklyProgress() {
    const container = document.getElementById('weekly-progress');
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();

    let html = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 15px;">';

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = days[date.getDay()];

        const completedHabits = habits.filter(habit =>
            habit.completedDates && habit.completedDates.includes(dateStr)
        ).length;

        const percentage = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

        html += `
            <div style="text-align: center;">
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">${dayName}</div>
                <div style="width: 100%; height: 100px; background: var(--border-color); border-radius: 8px; position: relative; overflow: hidden;">
                    <div style="position: absolute; bottom: 0; width: 100%; height: ${percentage}%; background: linear-gradient(180deg, var(--primary-color), var(--success-color)); border-radius: 8px;"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 5px;">${Math.round(percentage)}%</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Goals Management
function initGoals() {
    document.getElementById('add-goal-btn').addEventListener('click', () => {
        document.getElementById('goal-form').classList.remove('hidden');
    });

    document.getElementById('cancel-goal-btn').addEventListener('click', () => {
        closeGoalForm();
    });

    document.getElementById('save-goal-btn').addEventListener('click', saveGoal);

    displayGoals();
}

function saveGoal() {
    const title = document.getElementById('goal-title').value.trim();
    const description = document.getElementById('goal-description').value.trim();
    const category = document.getElementById('goal-category').value;

    if (!title) {
        alert('Veuillez entrer un titre pour l\'objectif');
        return;
    }

    const goal = {
        id: Date.now(),
        title,
        description,
        category,
        completed: false,
        createdAt: new Date().toISOString()
    };

    goals.push(goal);
    Storage.set('goals', goals);
    displayGoals();
    closeGoalForm();
    updateStats();
}

function closeGoalForm() {
    document.getElementById('goal-form').classList.add('hidden');
    document.getElementById('goal-title').value = '';
    document.getElementById('goal-description').value = '';
}

function displayGoals() {
    const container = document.getElementById('goals-list');

    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Aucun objectif pour le moment.</p>
                <p>Commencez par définir vos objectifs !</p>
            </div>
        `;
        return;
    }

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    let html = '';

    if (activeGoals.length > 0) {
        html += '<h3 style="margin-bottom: 15px; color: var(--text-primary);">Objectifs actifs</h3>';
        activeGoals.forEach(goal => {
            html += createGoalCard(goal);
        });
    }

    if (completedGoals.length > 0) {
        html += '<h3 style="margin: 30px 0 15px; color: var(--text-primary);">Objectifs complétés</h3>';
        completedGoals.forEach(goal => {
            html += createGoalCard(goal);
        });
    }

    container.innerHTML = html;

    // Add event listeners
    document.querySelectorAll('.complete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = parseInt(e.target.dataset.id);
            toggleGoalComplete(goalId);
        });
    });

    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = parseInt(e.target.dataset.id);
            deleteGoal(goalId);
        });
    });
}

function createGoalCard(goal) {
    const categoryColors = {
        sante: '#10b981',
        carriere: '#6366f1',
        relations: '#ec4899',
        finance: '#f59e0b',
        apprentissage: '#8b5cf6',
        autre: '#64748b'
    };

    const categoryLabels = {
        sante: 'Santé',
        carriere: 'Carrière',
        relations: 'Relations',
        finance: 'Finance',
        apprentissage: 'Apprentissage',
        autre: 'Autre'
    };

    return `
        <div class="item-card" style="${goal.completed ? 'opacity: 0.6;' : ''}">
            <div class="item-header">
                <div>
                    <h3 class="item-title" style="${goal.completed ? 'text-decoration: line-through;' : ''}">${goal.title}</h3>
                    <span class="category-badge" style="background: ${categoryColors[goal.category]};">${categoryLabels[goal.category]}</span>
                </div>
                <div class="item-actions">
                    <button class="icon-btn complete-goal" data-id="${goal.id}" title="${goal.completed ? 'Marquer comme non complété' : 'Marquer comme complété'}">
                        ${goal.completed ? '↶' : '✓'}
                    </button>
                    <button class="icon-btn delete-goal" data-id="${goal.id}" title="Supprimer">🗑️</button>
                </div>
            </div>
            ${goal.description ? `<p class="item-description">${goal.description}</p>` : ''}
        </div>
    `;
}

function toggleGoalComplete(id) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        Storage.set('goals', goals);
        displayGoals();
        updateStats();
    }
}

function deleteGoal(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
        goals = goals.filter(g => g.id !== id);
        Storage.set('goals', goals);
        displayGoals();
        updateStats();
    }
}

// Habits Management
function initHabits() {
    document.getElementById('add-habit-btn').addEventListener('click', () => {
        document.getElementById('habit-form').classList.remove('hidden');
    });

    document.getElementById('cancel-habit-btn').addEventListener('click', () => {
        closeHabitForm();
    });

    document.getElementById('save-habit-btn').addEventListener('click', saveHabit);

    displayHabits();
}

function saveHabit() {
    const name = document.getElementById('habit-name').value.trim();
    const frequency = document.getElementById('habit-frequency').value;

    if (!name) {
        alert('Veuillez entrer un nom pour l\'habitude');
        return;
    }

    const habit = {
        id: Date.now(),
        name,
        frequency,
        completedDates: [],
        createdAt: new Date().toISOString()
    };

    habits.push(habit);
    Storage.set('habits', habits);
    displayHabits();
    closeHabitForm();
    updateStats();
}

function closeHabitForm() {
    document.getElementById('habit-form').classList.add('hidden');
    document.getElementById('habit-name').value = '';
}

function displayHabits() {
    const container = document.getElementById('habits-list');

    if (habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Aucune habitude suivie pour le moment.</p>
                <p>Créez votre première habitude !</p>
            </div>
        `;
        return;
    }

    let html = '';
    habits.forEach(habit => {
        html += createHabitCard(habit);
    });

    container.innerHTML = html;

    // Add event listeners
    document.querySelectorAll('.delete-habit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const habitId = parseInt(e.target.dataset.id);
            deleteHabit(habitId);
        });
    });

    document.querySelectorAll('.day-check').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const habitId = parseInt(e.target.dataset.habitId);
            const date = e.target.dataset.date;
            toggleHabitDay(habitId, date);
        });
    });
}

function createHabitCard(habit) {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date);
    }

    let daysHtml = '';
    days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const isCompleted = habit.completedDates.includes(dateStr);
        const dayName = ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()];

        daysHtml += `
            <div class="day-check ${isCompleted ? 'completed' : ''}"
                 data-habit-id="${habit.id}"
                 data-date="${dateStr}"
                 title="${dayName} - ${date.toLocaleDateString('fr-FR')}">
                ${isCompleted ? '✓' : dayName}
            </div>
        `;
    });

    const completionRate = days.length > 0
        ? (days.filter(d => habit.completedDates.includes(d.toISOString().split('T')[0])).length / days.length) * 100
        : 0;

    return `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <h3 class="item-title">${habit.name}</h3>
                    <span class="category-badge">${habit.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}</span>
                </div>
                <div class="item-actions">
                    <button class="icon-btn delete-habit" data-id="${habit.id}" title="Supprimer">🗑️</button>
                </div>
            </div>
            <div class="habit-progress">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">7 derniers jours</span>
                    <span style="color: var(--primary-color); font-weight: 600;">${Math.round(completionRate)}%</span>
                </div>
                <div class="habit-days">
                    ${daysHtml}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%"></div>
                </div>
            </div>
        </div>
    `;
}

function toggleHabitDay(habitId, date) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        const index = habit.completedDates.indexOf(date);
        if (index > -1) {
            habit.completedDates.splice(index, 1);
        } else {
            habit.completedDates.push(date);
        }
        Storage.set('habits', habits);
        displayHabits();
        updateStats();
        if (currentTab === 'dashboard') {
            updateDashboard();
        }
    }
}

function deleteHabit(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) {
        habits = habits.filter(h => h.id !== id);
        Storage.set('habits', habits);
        displayHabits();
        updateStats();
    }
}

// Journal Management
function initJournal() {
    document.getElementById('add-entry-btn').addEventListener('click', () => {
        document.getElementById('entry-form').classList.remove('hidden');
    });

    document.getElementById('cancel-entry-btn').addEventListener('click', () => {
        closeEntryForm();
    });

    document.getElementById('save-entry-btn').addEventListener('click', saveEntry);

    // Mood selector
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedMood = e.target.dataset.mood;
        });
    });

    displayEntries();
}

function saveEntry() {
    const content = document.getElementById('entry-content').value.trim();

    if (!content) {
        alert('Veuillez écrire quelque chose dans votre journal');
        return;
    }

    const entry = {
        id: Date.now(),
        content,
        mood: selectedMood || 'neutral',
        createdAt: new Date().toISOString()
    };

    journalEntries.unshift(entry);
    Storage.set('journal', journalEntries);
    displayEntries();
    closeEntryForm();
}

function closeEntryForm() {
    document.getElementById('entry-form').classList.add('hidden');
    document.getElementById('entry-content').value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = null;
}

function displayEntries() {
    const container = document.getElementById('entries-list');

    if (journalEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Aucune entrée dans votre journal pour le moment.</p>
                <p>Commencez à écrire vos pensées !</p>
            </div>
        `;
        return;
    }

    let html = '';
    journalEntries.forEach(entry => {
        html += createEntryCard(entry);
    });

    container.innerHTML = html;

    // Add event listeners
    document.querySelectorAll('.delete-entry').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const entryId = parseInt(e.target.dataset.id);
            deleteEntry(entryId);
        });
    });
}

function createEntryCard(entry) {
    const moodEmojis = {
        excellent: '😄',
        good: '🙂',
        neutral: '😐',
        sad: '😔',
        stressed: '😰'
    };

    const date = new Date(entry.createdAt);
    const dateStr = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <h3 class="item-title" style="font-size: 1rem; text-transform: capitalize;">${dateStr}</h3>
                </div>
                <div class="item-actions">
                    <span class="entry-mood">${moodEmojis[entry.mood]}</span>
                    <button class="icon-btn delete-entry" data-id="${entry.id}" title="Supprimer">🗑️</button>
                </div>
            </div>
            <p class="item-description">${entry.content}</p>
            <div class="entry-meta">
                <span>${timeStr}</span>
            </div>
        </div>
    `;
}

function deleteEntry(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        journalEntries = journalEntries.filter(e => e.id !== id);
        Storage.set('journal', journalEntries);
        displayEntries();
    }
}
