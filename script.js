// --- Game Data ---
const questions = {
    "Free Fire": {
        "Very Easy": [
            { q: "Which character has the 'Drop the Beat' ability?", a: ["Alok", "Kelly", "Hayato", "Moco"], correct: 0, hint: "He is a famous DJ." },
            { q: "What is the maximum number of players in a classic BR match?", a: ["40", "50", "60", "100"], correct: 1, hint: "Half of a hundred." }
        ],
        "Hard": [
            { q: "Which map was the first to be introduced in Free Fire?", a: ["Purgatory", "Kalahari", "Bermuda", "Alpine"], correct: 2, hint: "Starts with B." }
        ]
    },
    "Clash of Clans": {
        "Very Easy": [
            { q: "Which troop is unlocked first in the barracks?", a: ["Archer", "Barbarian", "Goblin", "Giant"], correct: 1, hint: "He has a yellow mustache." }
        ]
    }
};

// --- Game State ---
let coins = localStorage.getItem('coins') ? parseInt(localStorage.getItem('coins')) : 100;
let currentCategory = "";
let currentDifficulty = "";
let currentQuestionIndex = 0;
let score = 0;

// --- DOM Elements ---
const coinDisplay = document.getElementById('coin-count');

function updateCoinDisplay() {
    coinDisplay.innerText = coins;
    localStorage.setItem('coins', coins);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// --- Logic ---
function selectGame(game) {
    currentCategory = game;
    document.getElementById('selected-game-title').innerText = game;
    showScreen('difficulty-screen');
}

function startQuiz(diff) {
    currentDifficulty = diff;
    currentQuestionIndex = 0;
    score = 0;
    
    // Check if we have questions for this selection
    if (!questions[currentCategory] || !questions[currentCategory][currentDifficulty]) {
        alert("Questions coming soon for this level!");
        return;
    }
    
    showScreen('quiz-screen');
    renderQuestion();
    updateCoinDisplay();
}

function renderQuestion() {
    const qData = questions[currentCategory][currentDifficulty][currentQuestionIndex];
    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('q-progress').innerText = `Question ${currentQuestionIndex + 1}`;
    
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    
    qData.a.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(index, btn);
        container.appendChild(btn);
    });

    // Reset Lifeline Buttons
    document.getElementById('ll-5050').disabled = coins < 50;
    document.getElementById('ll-hint').disabled = coins < 30;
    document.getElementById('ll-skip').disabled = coins < 100;
}

function handleAnswer(selectedIndex, btn) {
    const qData = questions[currentCategory][currentDifficulty][currentQuestionIndex];
    const allBtns = document.querySelectorAll('#options-container button');
    
    allBtns.forEach(b => b.disabled = true); // Prevent multiple clicks

    if (selectedIndex === qData.correct) {
        btn.classList.add('correct');
        score++;
        let reward = currentDifficulty === "Difficult" ? 50 : 10;
        coins += reward;
    } else {
        btn.classList.add('wrong');
        allBtns[qData.correct].classList.add('correct');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions[currentCategory][currentDifficulty].length) {
            renderQuestion();
        } else {
            endGame();
        }
        updateCoinDisplay();
    }, 1500);
}

// --- Lifelines ---
function use5050() {
    if (coins < 50) return;
    coins -= 50;
    updateCoinDisplay();
    
    const qData = questions[currentCategory][currentDifficulty][currentQuestionIndex];
    const btns = document.querySelectorAll('#options-container button');
    let removed = 0;
    
    btns.forEach((btn, idx) => {
        if (idx !== qData.correct && removed < 2) {
            btn.style.visibility = "hidden";
            removed++;
        }
    });
    document.getElementById('ll-5050').disabled = true;
}

function useHint() {
    if (coins < 30) return;
    const qData = questions[currentCategory][currentDifficulty][currentQuestionIndex];
    alert("Hint: " + qData.hint);
    coins -= 30;
    updateCoinDisplay();
    document.getElementById('ll-hint').disabled = true;
}

function useSkip() {
    if (coins < 100) return;
    coins -= 100;
    updateCoinDisplay();
    currentQuestionIndex++;
    if (currentQuestionIndex < questions[currentCategory][currentDifficulty].length) {
        renderQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    showScreen('result-screen');
    document.getElementById('final-score').innerText = score;
    document.getElementById('earned-coins').innerText = score * 10; 
}

// Initialize
updateCoinDisplay();
