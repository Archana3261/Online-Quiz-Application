let questions = [];
let currentQ = 0;
let score = 0;
let timer;
let timeLeft = 15;
let isAnswered = false;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const quizEl = document.getElementById("quiz");
const settingsEl = document.getElementById("settings");
const progressBar = document.getElementById("progress-bar");

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Fallback questions if API fails
const fallbackQuestions = [
    {
        question: "What is the capital of France?",
        options: ["Paris","London","Berlin","Madrid"],
        answer: "Paris"
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Shakespeare","Hemingway","Tolstoy","Dante"],
        answer: "Shakespeare"
    },
    {
        question: "What is 5 + 7?",
        options: ["12","10","11","13"],
        answer: "12"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars","Earth","Venus","Jupiter"],
        answer: "Mars"
    },
    {
        question: "What is the largest mammal?",
        options: ["Blue Whale","Elephant","Giraffe","Hippopotamus"],
        answer: "Blue Whale"
    },
    {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Carbon Dioxide","Oxygen","Nitrogen","Hydrogen"],
        answer: "Carbon Dioxide"
    },
    {
        question: "Which continent is Egypt part of?",
        options: ["Africa","Asia","Europe","South America"],
        answer: "Africa"
    },
    {
        question: "How many colors are there in a rainbow?",
        options: ["7","5","6","8"],
        answer: "7"
    },
    {
        question: "What is the chemical symbol for water?",
        options: ["H2O","O2","CO2","NaCl"],
        answer: "H2O"
    },
    {
        question: "Which sport uses a shuttlecock?",
        options: ["Badminton","Tennis","Cricket","Table Tennis"],
        answer: "Badminton"
    }
];

async function startQuizSetup() {
    const selectedCategory = document.getElementById("category").value;
    const selectedDifficulty = document.getElementById("difficulty").value;

    questionEl.textContent = "Loading questions...";
    optionsEl.innerHTML = "";

    try {
        const res = await fetch(`https://opentdb.com/api.php?amount=10&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`);
        const data = await res.json();
        if (!data.results || data.results.length === 0) throw "No questions";

        questions = data.results.map(q => {
            const allOptions = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
            return { question: decodeHTML(q.question), options: allOptions.map(opt => decodeHTML(opt)), answer: decodeHTML(q.correct_answer) };
        });
    } catch {
        questions = fallbackQuestions; // fallback if API fails
    }

    currentQ = 0;
    score = 0;
    settingsEl.style.display = "none";
    quizEl.style.display = "block";
    loadQuestion();
    updateProgress();
}

function loadQuestion() {
    clearInterval(timer);
    isAnswered = false;
    timeLeft = 15;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    timer = setInterval(updateTimer, 1000);

    const q = questions[currentQ];
    questionEl.textContent = `Question ${currentQ+1} of ${questions.length}: ${q.question}`;
    optionsEl.innerHTML = "";

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(btn, q.answer);
        optionsEl.appendChild(btn);
    });

    nextBtn.style.display = "none";
}

function checkAnswer(btn, correctAnswer) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timer);

    const buttons = optionsEl.querySelectorAll("button");
    buttons.forEach(b => {
        b.disabled = true;
        if (b.textContent === correctAnswer) b.classList.add("correct");
    });

    if (btn.textContent === correctAnswer) score++;
    else btn.classList.add("wrong");

    nextBtn.style.display = "block";
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
        clearInterval(timer);
        const buttons = optionsEl.querySelectorAll("button");
        buttons.forEach(b => {
            b.disabled = true;
            if (b.textContent === questions[currentQ].answer) b.classList.add("correct");
        });
        nextBtn.style.display = "block";
    }
}

nextBtn.onclick = () => {
    currentQ++;
    if (currentQ < questions.length) loadQuestion();
    else showResult();
    updateProgress();
}

function showResult() {
    quizEl.style.display = "none";
    resultEl.style.display = "block";
    scoreEl.textContent = `${score} / ${questions.length}`;
    updateProgress();
}

function restart() {
    settingsEl.style.display = "block";
    quizEl.style.display = "none";
    resultEl.style.display = "none";
    progressBar.style.width = "0%";
}

function updateProgress() {
    progressBar.style.width = ((currentQ) / questions.length) * 100 + "%";
}
