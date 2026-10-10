import { addLanguageSelector, translatePage } from "./i18n.js";
import { addThemeToggle } from "./theme.js";

const state = { active: location.pathname === "/assistance" ? "assistance" : "hub", accountOpen: false, data: null, error: null, loading: true, user: null, userLocation: null };
let crisisMap;
const vandalurLocation = [12.8395, 80.1349];
const navItems = [
	["hub", "Crisis hub", "◈"],
	["shelters", "Shelters", "⌂"],
	["embassies", "Embassies", "◎"],
	["assistance", "Local assistance", "✚"]
];
const countryFlags = {
	Australia: "🇦🇺",
	France: "🇫🇷",
	Germany: "🇩🇪",
	Japan: "🇯🇵",
	"United Kingdom": "🇬🇧",
	"United States": "🇺🇸"
};

const escapeHtml = (value) =>
	String(value ?? "").replace(
		/[&<>"']/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#039;"
			})[character]
	);
const display = (value) => escapeHtml(String(value ?? "").replace(/_/g, " "));
const mapUrl = (latitude, longitude) =>
	latitude != null && longitude != null
		? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`
		: null;
const date = (value) => (value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded");
const icon = (name) => `<span class="icon">${name}</span>`;
const activeAlert = () => state.data?.alerts?.[0];

function appShell() {
	const alert = activeAlert();
	document.querySelector("#app").innerHTML = `
    <aside class="sidebar">
      <div class="brand" data-i18n-skip><span class="material-symbols-outlined brand-mark" aria-hidden="true">shield</span><span>Safe<span class="brand-accent">Trip</span></span></div>
      <div class="sidebar-context"><span class="status-dot"></span><div><strong>DATABASE DATA</strong><small>${state.loading ? "Loading records" : "Database synchronised"}</small></div></div>
      <nav>${navItems.map(([id, label, glyph]) => `<button class="nav-item ${state.active === id ? "active" : ""}" data-nav="${id}">${icon(glyph)}<span>${label}</span>${id === "hub" && state.data ? `<b class="nav-count">${state.data.alerts.length}</b>` : ""}</button>`).join("")}</nav>
      <div class="sidebar-bottom">
        <div class="offline-card"><span class="sync-icon">↻</span><div><strong>${state.data ? "DATABASE SYNC COMPLETE" : "DATABASE UNAVAILABLE"}</strong><small>${state.data ? date(state.data.retrievedAt) : "No cached records shown"}</small></div></div>
        <button class="header-sos" data-nav="assistance"><span></span>SOS Emergency Beacon</button>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="mobile-menu" id="menu-button">☰</button><div class="breadcrumb"><span data-i18n-skip>SafeTrip</span><b>/</b><strong>${navItems.find((item) => item[0] === state.active)?.[1]}</strong></div><div class="topbar-actions"><div class="header-language"></div><div class="top-auth-actions"><div class="theme-control"></div>${state.user?.role === "AUTHORITY" ? '<a class="button button-outline button-small" href="/authority">Authority view</a>' : ""}${state.user ? '<button class="button button-danger button-small" id="top-logout" type="button">Log out</button>' : '<a class="button button-outline button-small" href="/login">Log in</a><a class="button button-primary button-small" href="/signup">Sign up</a>'}</div></div></header>
      ${alert ? `<div class="advisory"><span class="advisory-pulse"></span><strong>⚠ ${display(alert.category)}</strong><span>${display(alert.title)} — ${display(alert.area)}</span><time>ISSUED: ${date(alert.issued_at)} · ${display(alert.verification_status)}</time></div>` : ""}
      <section class="content">${state.loading ? loadingView() : state.error ? errorView() : renderContent()}</section>
      <footer class="site-footer">SafeTrip</footer>
    </main>`;
	bindEvents();
	addLanguageSelector(document.querySelector(".header-language"));
	addThemeToggle(document.querySelector(".theme-control"));
	translatePage();
	if (!state.loading && !state.error && state.active === "hub") initializeCrisisMap();
}

function loadingView() {
	return `<div class="page-heading"><div><p class="eyebrow">DATABASE</p><h1>Loading crisis records</h1><p class="lede">Connecting to the SafeTrip database.</p></div></div>`;
}

function errorView() {
	return `<div class="page-heading"><div><p class="eyebrow red-text">DATA UNAVAILABLE</p><h1>Live records could not be loaded</h1><p class="lede">${escapeHtml(state.error)}</p><p class="lede">No placeholder or simulated records are displayed.</p></div><button class="button button-primary" id="retry">Retry</button></div>`;
}

function renderContent() {
	if (state.active === "shelters") return sheltersView();
	if (state.active === "embassies") return embassiesView();
	if (state.active === "assistance") return assistanceView();
	return hubView();
}

function emptyState(label) {
	return `<div class="empty-state"><p class="eyebrow">NO DATABASE RECORDS</p><h2>${escapeHtml(label)}</h2><p class="lede">An authorised data source has not supplied this information.</p></div>`;
}

function hubView() {
	const alert = activeAlert();
	const alerts = state.data.alerts || [];
	const hazards = state.data.hazards;
	if (!alert && !hazards.length) return emptyState("No active crisis records");
	return `<div class="page-heading"><div><p class="eyebrow">DATABASE-BACKED CRISIS HUB</p><h1>Active disasters and advisories</h1><p class="lede">${alerts.length ? `${alerts.length} verified records requiring attention` : "No alert is currently active."}</p></div></div>
    <section class="hero-grid">
      <div class="alerts-feed" aria-label="Active disasters and advisories" data-i18n-source-attribute="Active disasters and advisories">${alerts.length ? alerts.map(alertCard).join("") : emptyState("No active alert")}</div>
      <div class="map-card"><div class="map-toolbar"><span class="map-label">LIVE INCIDENT MAP</span><span class="map-live"><i></i>${hazards.length + state.data.shelters.length + state.data.missions.length} database locations</span></div><div id="crisis-map" class="crisis-map" aria-label="Map of disasters, shelters, embassies, and your location" data-i18n-source-attribute="Map of disasters, shelters, embassies, and your location"></div><div class="map-legend"><span><i class="legend-dot danger"></i> Disaster</span><span><i class="legend-dot safe"></i> Shelter</span><span><i class="legend-dot embassy"></i> Embassy</span><span><i class="legend-dot you"></i> Your location</span><span class="map-location-status">Your location: Melakottaiyur</span></div></div>
    </section>
    <section class="section-title"><div><p class="eyebrow">ACTIVE RECORDS</p><h3>Hazards and closures</h3></div></section>
    <div class="mission-grid">${hazards.length ? hazards.map(hazardCard).join("") : emptyState("No hazard records")}</div>`;
}

function alertCard(alert) {
	return `<article class="alert-hero"><div class="hero-top"><span class="badge ${alert.severity === "CRITICAL" || alert.severity === "SEVERE" ? "badge-severe" : "badge-warning"}">${display(alert.severity)}</span><span class="mono">${display(alert.verification_status)}</span></div><h2>${display(alert.title)}</h2><p class="hero-area">${display(alert.area)}</p><p class="hero-copy">${display(alert.original_instructions)}</p><div class="source-line"><span class="source-check">✓</span><strong>${display(alert.source_name)}</strong><span class="source-divider"></span><span>Issued ${date(alert.issued_at)}</span>${alert.source_url ? `<a href="${escapeHtml(alert.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`;
}

function mapIcon(color, symbol) {
	return L.divIcon({ className: "database-map-marker", html: `<span style="--marker-color:${color}">${symbol}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] });
}

function addMapMarker(map, latitude, longitude, icon, title, details) {
	if (latitude == null || longitude == null) return;
	L.marker([Number(latitude), Number(longitude)], { icon })
		.addTo(map)
		.bindPopup(`<strong>${escapeHtml(title)}</strong><br>${escapeHtml(details)}`);
}

function initializeCrisisMap() {
	const element = document.querySelector("#crisis-map");
	if (!element || typeof L === "undefined") return;
	if (crisisMap) crisisMap.remove();
	crisisMap = L.map(element, { scrollWheelZoom: false }).setView([13.0827, 80.2707], 12);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; OpenStreetMap contributors"
	}).addTo(crisisMap);

	const bounds = [];
	const addRecord = (record, icon, label, details) => {
		if (record.latitude == null || record.longitude == null) return;
		const point = [Number(record.latitude), Number(record.longitude)];
		bounds.push(point);
		addMapMarker(crisisMap, record.latitude, record.longitude, icon, label, details);
	};
	state.data.hazards.forEach((hazard) => addRecord(hazard, mapIcon("#ef635d", "⚠"), hazard.name, `${hazard.area} · ${hazard.status}`));
	state.data.shelters.forEach((shelter) => addRecord(shelter, mapIcon("#4fd49a", "＋"), shelter.name, `${shelter.area} · ${shelter.available_spaces} spaces available`));
	state.data.missions.forEach((mission) => addRecord(mission, mapIcon("#eeb15c", "★"), `${mission.country} embassy`, `${mission.region} · ${mission.emergency_phone}`));

	state.userLocation = vandalurLocation;
	L.marker(vandalurLocation, { icon: mapIcon("#72d8dc", "●") })
		.addTo(crisisMap)
		.bindPopup("<strong>Your current location</strong><br>Melakottaiyur");
	L.circle(vandalurLocation, { radius: 850, color: "#72d8dc", fillColor: "#72d8dc", fillOpacity: 0.12 }).addTo(crisisMap);
	bounds.push(vandalurLocation);
	crisisMap.fitBounds(bounds, { padding: [30, 30] });
	document.querySelector(".map-location-status")?.replaceChildren(document.createTextNode("Your location: Melakottaiyur"));
}

function hazardCard(hazard) {
	return `<article class="mission-card"><div class="mission-head"><div><h3>${display(hazard.name)}</h3><small>${display(hazard.hazard_type)} · ${display(hazard.area)}</small></div><span class="badge badge-warning small">${display(hazard.status)}</span></div><p class="muted">${display(hazard.verification_status)} · Updated ${date(hazard.updated_at)}</p><div class="source-line"><span>${display(hazard.source_name)}</span>${hazard.source_url ? `<a href="${escapeHtml(hazard.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`;
}

function sheltersView() {
	const shelters = state.data.shelters;
	return `<div class="page-heading"><div><p class="eyebrow">DATABASE-VERIFIED SAFE ZONES</p><h1>Shelters & relief hubs</h1><p class="lede">Capacity and facilities are shown only when supplied by a database record.</p></div></div>
    <div class="shelter-layout"><div class="shelter-list">${shelters.length ? shelters.map((shelter, index) => { const locationUrl = mapUrl(shelter.latitude, shelter.longitude); return `<article class="shelter-card"><div class="shelter-card-top"><span class="shelter-number">${String(index + 1).padStart(2, "0")}</span><span class="badge ${shelter.capacity_status === "SPACE AVAILABLE" ? "badge-safe" : "badge-warning"}">${display(shelter.capacity_status)}</span></div><h3>${display(shelter.name)}</h3><p class="muted">◉ ${display(shelter.area)} · ${shelter.distance_km ?? "Distance not recorded"}${shelter.distance_km ? " km" : ""}</p><div class="amenities">${(shelter.amenities || []).map((amenity) => `<span>✓ ${display(amenity)}</span>`).join("")}</div><div class="shelter-footer"><strong>${display(shelter.available_spaces)} spaces available</strong><small>Verified ${date(shelter.last_verified_at)}</small></div><div class="shelter-actions">${locationUrl ? `<a class="button button-outline button-small" href="${escapeHtml(locationUrl)}" target="_blank" rel="noreferrer">View on map ↗</a>` : ""}<div class="shelter-source"><span>${display(shelter.source_name)}</span>${shelter.source_url ? `<a href="${escapeHtml(shelter.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></div></article>`; }).join("") : emptyState("No open shelters")}</div></div>`;
}

function embassiesView() {
	const missions = state.data.missions;
	return `<div class="page-heading"><div><p class="eyebrow">DATABASE DIPLOMATIC SUPPORT</p><h1>Embassies & consulates</h1><p class="lede">Emergency desks and contact numbers from the diplomatic directory.</p></div></div><div class="mission-grid">${missions.length ? missions.map((mission) => `<article class="mission-card"><div class="mission-flag" role="img" aria-label="${display(mission.country)} flag" data-i18n-skip>${countryFlags[mission.country] || "🏳️"}</div><div class="mission-head"><div><h3>${display(mission.country)}</h3><small>${display(mission.region)}</small></div><span class="badge badge-safe small">${display(mission.availability_status)}</span></div><div class="phone">${display(mission.emergency_phone)}</div><div class="desk-row"><span>Desk</span><strong>${display(mission.desk_label || "Not recorded")}</strong></div><div class="mission-actions"><a class="button button-primary button-small" href="tel:${escapeHtml(mission.emergency_phone.replace(/[^\d+]/g, ""))}">Dial duty desk</a>${mission.source_url ? `<a class="button button-quiet button-small" href="${escapeHtml(mission.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`).join("") : emptyState("No diplomatic missions")}</div>`;
}

function assistanceView() {
	const contacts = state.data.contacts;
	return `<div class="page-heading"><div><p class="eyebrow">LOCAL CIVIL DEFENCE</p><h1>Request urgent assistance</h1><p class="lede">For immediate danger, contact a database-listed emergency service first.</p></div>${contacts[0] ? `<a href="tel:${escapeHtml(contacts[0].phone)}" class="button button-danger">☎ ${escapeHtml(contacts[0].label)}</a>` : ""}</div><div class="assistance-layout"><form class="assistance-form" id="assistance-form"><label>Full name<input name="fullName" required /></label><label>Nationality<input name="nationality" required /></label><label>Party size<input name="groupSize" type="number" min="1" required /></label><fieldset><legend>Urgent assistance needed</legend>${["Emergency medical care", "Evacuation escort", "Critical food or water", "Mobility assistance"].map((need) => `<label class="check-row"><input type="checkbox" name="needs" value="${need}" />${need}</label>`).join("")}</fieldset><button class="button button-danger full-width" type="submit">Transmit to local civil defence</button></form><div class="dispatch-card"><p class="eyebrow">DATABASE CONTACTS</p>${contacts.length ? contacts.map((contact) => `<div class="source-line"><strong>${escapeHtml(contact.label)}</strong><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a><small>${escapeHtml(contact.service)} · ${escapeHtml(contact.source_name)}</small></div>`).join("") : emptyState("No emergency contacts")}</div></div>`;
}

function bindEvents() {
	document.querySelectorAll("[data-nav]").forEach((element) =>
		element.addEventListener("click", () => {
			if (element.dataset.nav === "assistance" && !state.user) {
				location.href = "/login?next=%2Fassistance";
				return;
			}
			state.active = element.dataset.nav;
			appShell();
		})
	);
	document.querySelector("#retry")?.addEventListener("click", loadDashboard);
	document.querySelector("#top-logout")?.addEventListener("click", async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		location.href = "/login";
	});
	document.querySelector("#menu-button")?.addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("mobile-open"));
	document.querySelector("#assistance-form")?.addEventListener("submit", submitAssistance);
}

async function loadDashboard() {
	state.loading = true;
	state.error = null;
	appShell();
	try {
		const sessionResponse = await fetch("/api/auth/me");
		if (sessionResponse.ok) {
			state.user = (await sessionResponse.json()).user;
		} else {
			state.user = null;
		}
		const response = await fetch("/api/dashboard");
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Database request failed");
		state.data = data;
	} catch (error) {
		state.error = error.message;
	} finally {
		state.loading = false;
		appShell();
	}
}

async function submitAssistance(event) {
	event.preventDefault();
	if (!state.user) {
		location.href = "/login?next=%2Fassistance";
		return;
	}
	const form = new FormData(event.currentTarget);
	const button = event.currentTarget.querySelector("button[type=submit]");
	button.disabled = true;
	try {
		const response = await fetch("/api/assistance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.get("fullName"), nationality: form.get("nationality"), groupSize: form.get("groupSize"), needs: form.getAll("needs") }) });
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Request failed");
		event.currentTarget.innerHTML = `<div class="success-state"><span class="success-mark">✓</span><p class="eyebrow">REQUEST TRANSMITTED</p><h2>Request recorded</h2><p>Reference <strong>${escapeHtml(data.referenceCode)}</strong></p></div>`;
	} catch (error) {
		button.disabled = false;
		window.alert(error.message);
	}
}

loadDashboard();
