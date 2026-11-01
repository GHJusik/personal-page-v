// ===== Переключение темы =====
const themeButton = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeButton.textContent = "Светлая тема";
}
themeButton.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        themeButton.textContent = "Тёмная тема";
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeButton.textContent = "Светлая тема";
        localStorage.setItem("theme", "dark");
    }
});

// ===== Закрытие карточек интересов =====
const interestCards = document.querySelectorAll(".interest-card");
interestCards.forEach(function (card) {
    card.addEventListener("click", function (event) {
        if (!card.open) return;
        const summary = card.querySelector("summary");
        if (summary.contains(event.target)) return;
        card.open = false;
    });
});

// ===== Прогресс-бар скролла =====
const scrollProgress = document.getElementById("scroll-progress");
window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = percent + "%";
});

// ===== Кнопка "Наверх" =====
const scrollTopBtn = document.getElementById("scroll-top");
window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add("visible");
    } else {
        scrollTopBtn.classList.remove("visible");
    }
});
scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Плавное появление секций при скролле =====
const fadeElements = document.querySelectorAll(".fade-in");
const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
});

// ===== База историй (для модального окна) =====
const storiesData = {
    "music-math": {
        category: "МУЗЫКА И МАТЕМАТИКА",
        title: "Как музыка познакомила меня с числом e",
        body: `<p>Однажды мне встретилось необычное изображение, состоящее из множества разноцветных квадратов. Позже я узнал, что это визуализация цифр числа e.</p> <p>Особенно интересно, что впервые я обратил на неё внимание благодаря музыке.</p>`
    },
    "first-penmod": {
        category: "ПЕНСПИННИНГ",
        title: "Мой первый пенмод",
        body: `<p>Первую специальную ручку для вращения мне подарили на день рождения. Это был простой мод, сделанный из двух обычных ручек и кусочка термоусадки.</p> <p>Тогда я ещё не знал, что это положит начало целой коллекции. Сейчас у меня уже 11 модов — каждый со своим характером и балансом.</p>`
    },
    "first-cube": {
        category: "СПИДКУБИНГ",
        title: "Как я начал собирать кубик",
        body: `<p>Первый кубик Рубика появился у меня в детстве. Долгое время я собирал его «на глаз», без каких-либо формул, и мой рекорд был около трёх минут.</p> <p>Всё изменилось, когда я случайно наткнулся на видео с соревнованиями. Тогда я узнал про метод Джессики Фридрих и понял, что хочу собирать быстрее. С тех пор прошло почти 9 лет.</p>`
    }
};

// ===== Всплывающее окно истории =====
const storyDialog = document.getElementById("story-dialog");
const dialogCategory = document.getElementById("dialog-category");
const dialogTitle = document.getElementById("dialog-title");
const dialogBody = document.getElementById("dialog-body");
const storyClose = document.querySelector(".story-close");

document.querySelectorAll(".story-button").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-story");
        const story = storiesData[key];
        if (!story) return;
        dialogCategory.textContent = story.category;
        dialogTitle.textContent = story.title;
        dialogBody.innerHTML = story.body;
        storyDialog.showModal();
    });
});

function closeStory() {
    if (!storyDialog.open || storyDialog.classList.contains("closing")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        storyDialog.close();
        return;
    }
    storyDialog.classList.add("closing");
}

storyClose.addEventListener("click", closeStory);
storyDialog.addEventListener("click", function (event) {
    if (event.target !== storyDialog) return;
    const rect = storyDialog.getBoundingClientRect();
    const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
    if (clickedOutside) closeStory();
});
storyDialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    closeStory();
});
storyDialog.addEventListener("animationend", function (event) {
    if (event.target === storyDialog && event.animationName === "dialog-disappear") {
        storyDialog.close();
    }
});
storyDialog.addEventListener("close", function () {
    storyDialog.classList.remove("closing");
});

// ===== Секундомер для спидкубинга (cstimer-style) =====
const timerDisplay = document.getElementById("timer-display");
const timerHint = document.getElementById("timer-hint");
const timerStartBtn = document.getElementById("timer-start");
const timerResetBtn = document.getElementById("timer-reset");
const timerClearBtn = document.getElementById("timer-clear");
const historyBody = document.getElementById("timer-history-body");

const statBest = document.getElementById("stat-best");
const statLast = document.getElementById("stat-last");
const statAO5 = document.getElementById("stat-ao5");
const statAO12 = document.getElementById("stat-ao12");

let timerState = "idle";
let timerStartTime = 0;
let timerInterval = null;
let holdTimeout = null;

const HOLD_DELAY = 500;

function loadTimes() {
    const raw = localStorage.getItem("cubing-times");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
}
function saveTimes(times) {
    localStorage.setItem("cubing-times", JSON.stringify(times));
}
function loadPB() {
    const raw = localStorage.getItem("cubing-pb");
    return raw ? Number(raw) : null;
}
function savePB(ms) {
    localStorage.setItem("cubing-pb", String(ms));
}

function formatTime(ms) {
    if (ms == null || isNaN(ms)) return "—";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(centiseconds).padStart(2, "0")
    );
}

function calcAO(times, n) {
    if (times.length < n) return null;
    const last = times.slice(-n);
    const sorted = [...last].sort(function (a, b) { return a - b; });
    const trimmed = sorted.slice(1, -1);
    const sum = trimmed.reduce(function (a, b) { return a + b; }, 0);
    return sum / trimmed.length;
}

function setTimerState(newState) {
    timerState = newState;
    timerDisplay.classList.remove("state-holding", "state-ready", "state-running");
    if (newState === "holding") {
        timerDisplay.classList.add("state-holding");
        timerHint.textContent = "Держите...";
    } else if (newState === "ready") {
        timerDisplay.classList.add("state-ready");
        timerHint.textContent = "Отпускайте — старт!";
    } else if (newState === "running") {
        timerDisplay.classList.add("state-running");
        timerHint.textContent = "Идёт сборка...";
    } else {
        timerHint.textContent = "Удерживайте пробел";
    }
}

function startTimer() {
    timerStartTime = Date.now();
    setTimerState("running");
    timerInterval = setInterval(function () {
        const elapsed = Date.now() - timerStartTime;
        timerDisplay.textContent = formatTime(elapsed);
    }, 31);
}

function stopTimer() {
    clearInterval(timerInterval);
    const elapsed = Date.now() - timerStartTime;
    timerDisplay.textContent = formatTime(elapsed);

    const times = loadTimes();
    const pb = loadPB();
    const isNewPB = pb === null || elapsed < pb;
    if (isNewPB) savePB(elapsed);

    times.push(elapsed);
    saveTimes(times);

    renderHistory();
    setTimerState("idle");
}

function cancelHold() {
    clearTimeout(holdTimeout);
    holdTimeout = null;
    timerDisplay.textContent = "00:00.00";
    setTimerState("idle");
}

// ===== Клавиатура (пробел) =====
window.addEventListener("keydown", function (event) {
    if (event.code !== "Space") return;
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
    event.preventDefault();

    if (timerState === "idle") {
        timerDisplay.textContent = "00:00.00";
        setTimerState("holding");
        holdTimeout = setTimeout(function () {
            setTimerState("ready");
        }, HOLD_DELAY);
    } else if (timerState === "running") {
        stopTimer();
    }
});

window.addEventListener("keyup", function (event) {
    if (event.code !== "Space") return;
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
    event.preventDefault();

    if (timerState === "holding") {
        cancelHold();
    } else if (timerState === "ready") {
        startTimer();
    }
});

// ===== Кнопки =====
timerStartBtn.addEventListener("click", function () {
    if (timerState === "idle") {
        startTimer();
    } else if (timerState === "running") {
        stopTimer();
    }
});

timerResetBtn.addEventListener("click", function () {
    clearInterval(timerInterval);
    clearTimeout(holdTimeout);
    timerDisplay.textContent = "00:00.00";
    setTimerState("idle");
});

timerClearBtn.addEventListener("click", function () {
    if (!confirm("Удалить всю историю сборок? Это действие нельзя отменить.")) return;
    localStorage.removeItem("cubing-times");
    localStorage.removeItem("cubing-pb");
    renderHistory();
    timerDisplay.textContent = "00:00.00";
    setTimerState("idle");
});

// ===== Рендер истории и статистики =====
function renderHistory() {
    const times = loadTimes();
    const pb = loadPB();

    if (times.length === 0) {
        statBest.textContent = "—";
        statLast.textContent = "—";
        statAO5.textContent = "—";
        statAO12.textContent = "—";
        historyBody.innerHTML =
            '<tr class="timer-empty-row">' +
            '<td colspan="5">Пока пусто — сделайте первую сборку!</td>' +
            '</tr>';
        return;
    }

    const best = Math.min.apply(null, times);
    const last = times[times.length - 1];
    const ao5 = calcAO(times, 5);
    const ao12 = calcAO(times, 12);

    statBest.textContent = formatTime(best);
    statLast.textContent = formatTime(last);
    statAO5.textContent = formatTime(ao5);
    statAO12.textContent = formatTime(ao12);

    const shown = times.slice(-20).reverse();
    historyBody.innerHTML = "";
    shown.forEach(function (ms, i) {
        const number = times.length - i;
        const isPB = ms === best;

        const timesUpTo = times.slice(0, number);
        const ao5Here = calcAO(timesUpTo, 5);
        const ao12Here = calcAO(timesUpTo, 12);

        const tr = document.createElement("tr");
        tr.innerHTML =
            '<td>' + number + '</td>' +
            '<td>' + formatTime(ms) + '</td>' +
            '<td>' + formatTime(ao5Here) + '</td>' +
            '<td>' + formatTime(ao12Here) + '</td>' +
            '<td>' + (isPB ? '<span class="pb-mark" title="Личный рекорд">★</span>' : '') + '</td>';
        historyBody.appendChild(tr);
    });
}

renderHistory();