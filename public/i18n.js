const languages = [
	{ code: "en", label: "English", nativeLabel: "English" },
	{ code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
	{ code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
	{ code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
	{ code: "mr", label: "Marathi", nativeLabel: "मराठी" },
	{ code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
	{ code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
	{ code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
	{ code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
	{ code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
	{ code: "ur", label: "Urdu", nativeLabel: "اردو" },
	{ code: "es", label: "Spanish", nativeLabel: "Español" },
	{ code: "fr", label: "French", nativeLabel: "Français" },
	{ code: "de", label: "German", nativeLabel: "Deutsch" },
	{ code: "ar", label: "Arabic", nativeLabel: "العربية" },
	{ code: "pt", label: "Portuguese", nativeLabel: "Português" },
	{ code: "zh-CN", label: "Chinese", nativeLabel: "中文" },
	{ code: "ja", label: "Japanese", nativeLabel: "日本語" }
];

const cacheKey = "safetrip-translations";
const cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
let activeLanguage = localStorage.getItem("safetrip-language") || "en";
const originalText = new WeakMap();

function saveCache() {
	localStorage.setItem(cacheKey, JSON.stringify(cache));
}

function textNodes(root) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			const parent = node.parentElement;
			if (!parent || !node.nodeValue.trim() || parent.closest("[data-i18n-skip], script, style, option, .icon, .material-symbols-outlined, .mission-flag")) {
				return NodeFilter.FILTER_REJECT;
			}
			if (!originalText.has(node)) originalText.set(node, node.nodeValue);
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	return nodes;
}

function sourceText(node) {
	return originalText.get(node)?.trim() || node.nodeValue.trim();
}

async function translateText(text, language) {
	if (language === "en" || !text) return text;
	const key = `${language}:${text}`;
	if (cache[key]) return cache[key];
	const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(language)}`);
	if (!response.ok) throw new Error(`Translation service returned ${response.status}`);
	const data = await response.json();
	const translated = data.responseData?.translatedText;
	if (!translated) throw new Error("Translation service returned no translation");
	cache[key] = translated;
	saveCache();
	return translated;
}

async function translatePage(root = document.body) {
	document.documentElement.lang = activeLanguage;
	if (activeLanguage === "en") {
		textNodes(root).forEach((node) => {
			const source = originalText.get(node);
			if (source) node.nodeValue = source;
		});
		return;
	}

	const nodes = textNodes(root);
	const unique = [...new Set(nodes.map(sourceText))];
	await Promise.all(unique.map(async (text) => {
		try {
			const translated = await translateText(text, activeLanguage);
			nodes.filter((node) => sourceText(node) === text).forEach((node) => {
				node.nodeValue = translated;
			});
		} catch {
			// English remains visible when the free service is unavailable.
		}
	}));

	root.querySelectorAll("[data-i18n-placeholder]").forEach(async (element) => {
		const source = element.dataset.i18nPlaceholder;
		try {
			element.placeholder = await translateText(source, activeLanguage);
		} catch {
			element.placeholder = source;
		}
	});

	await Promise.all([...root.querySelectorAll("[aria-label][data-i18n-source-attribute]")].map(async (element) => {
		const source = element.dataset.i18nSourceAttribute;
		try {
			element.setAttribute("aria-label", await translateText(source, activeLanguage));
		} catch {
			element.setAttribute("aria-label", source);
		}
	}));
}

function selectorMarkup() {
	return `<label class="language-picker" title="Translate SafeTrip"><span class="material-symbols-outlined" aria-hidden="true">translate</span><span class="language-picker-label">Language</span><select id="language-select" aria-label="Select language">${languages.map((language) => `<option value="${language.code}" ${language.code === activeLanguage ? "selected" : ""}>${language.nativeLabel}</option>`).join("")}</select></label>`;
}

export function addLanguageSelector(container) {
	if (!container || container.querySelector("#language-select")) return;
	container.insertAdjacentHTML("afterbegin", selectorMarkup());
	container.querySelector("#language-select").addEventListener("change", async (event) => {
		activeLanguage = event.target.value;
		localStorage.setItem("safetrip-language", activeLanguage);
		document.body.classList.add("is-translating");
		await translatePage();
		document.body.classList.remove("is-translating");
	});
}

export function initializeTranslations() {
	addLanguageSelector(document.querySelector(".topbar, .authority-header, .auth-page"));
	translatePage();
}

document.addEventListener("safetrip-content-updated", () => translatePage());

export { languages, translatePage };
