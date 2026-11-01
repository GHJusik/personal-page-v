const themeButton = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeButton.textContent = "Светлая тема";
}

themeButton.addEventListener("click", function() {
    const currentTheme =
        document.documentElement.getAttribute("data-theme");

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
        if (!card.open) {
            return;
        }

        const summary = card.querySelector("summary");

        if (summary.contains(event.target)) {
            return;
        }

        card.open = false;
    });
});

// ===== Всплывающее окно истории =====

const storyDialog = document.querySelector("#story-dialog");
const storyButton = document.querySelector(".story-button");
const storyClose = document.querySelector(".story-close");

// Открытие окна
storyButton.addEventListener("click", function () {
    storyDialog.showModal();
});

// Плавное закрытие окна
function closeStory() {
    if (!storyDialog.open || storyDialog.classList.contains("closing")) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        storyDialog.close();
        return;
    }

    storyDialog.classList.add("closing");
}

// Закрытие по кнопке
storyClose.addEventListener("click", closeStory);

// Закрытие по нажатию на затемнённый фон
storyDialog.addEventListener("click", function (event) {
    if (event.target !== storyDialog) {
        return;
    }

    const rect = storyDialog.getBoundingClientRect();

    const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

    if (clickedOutside) {
        closeStory();
    }
});

// Закрытие по клавише Escape
storyDialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    closeStory();
});

// Когда анимация закончилась, действительно закрываем окно
storyDialog.addEventListener("animationend", function (event) {
    if (
        event.target === storyDialog &&
        event.animationName === "dialog-disappear"
    ) {
        storyDialog.close();
    }
});

storyDialog.addEventListener("close", function () {
    storyDialog.classList.remove("closing");
});