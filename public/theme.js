const themeKey = "safetrip-theme";

function applyTheme(theme) {
	document.body.classList.toggle("light-mode", theme === "light");
	document.documentElement.dataset.theme = theme;
	document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
		const lightMode = theme === "light";
		button.querySelector(".material-symbols-outlined").textContent = lightMode ? "dark_mode" : "light_mode";
		button.setAttribute("aria-label", lightMode ? "Switch to dark mode" : "Switch to light mode");
		button.title = lightMode ? "Switch to dark mode" : "Switch to light mode";
	});
}

export function addThemeToggle(container) {
	if (!container || container.querySelector("[data-theme-toggle]")) return;
	container.insertAdjacentHTML("afterbegin", '<button class="theme-toggle" type="button" data-theme-toggle><span class="material-symbols-outlined" aria-hidden="true">light_mode</span></button>');
	container.querySelector("[data-theme-toggle]").addEventListener("click", () => {
		const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
		localStorage.setItem(themeKey, nextTheme);
		applyTheme(nextTheme);
	});
	applyTheme(localStorage.getItem(themeKey) || "dark");
}

export function initializeTheme() {
	applyTheme(localStorage.getItem(themeKey) || "dark");
}
