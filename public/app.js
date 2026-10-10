const state = { active: location.pathname === "/assistance" ? "assistance" : "hub", accountOpen: false, data: null, error: null, loading: true, user: null };
const navItems = [
  ["hub", "Crisis hub", "◈"],
  ["shelters", "Shelters", "⌂"],
  ["embassies", "Embassies", "◎"],
  ["assistance", "Local assistance", "✚"]
];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));
const date = (value) => value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
const icon = (name) => `<span class="icon">${name}</span>`;
const activeAlert = () => state.data?.alerts?.[0];

function appShell() {
  const alert = activeAlert();
  document.querySelector("#app").innerHTML = `
    <aside class="sidebar">
      <div class="brand"><span class="material-symbols-outlined brand-mark" aria-hidden="true">shield</span><span>Safe<span class="brand-accent">Trip</span></span></div>
      <div class="sidebar-context"><span class="status-dot"></span><div><strong>DATABASE DATA</strong><small>${state.loading ? "Loading records" : "Database synchronised"}</small></div></div>
      <nav>${navItems.map(([id, label, glyph]) => `<button class="nav-item ${state.active === id ? "active" : ""}" data-nav="${id}">${icon(glyph)}<span>${label}</span>${id === "hub" && state.data ? `<b class="nav-count">${state.data.alerts.length}</b>` : ""}</button>`).join("")}</nav>
      <div class="sidebar-bottom">
        <div class="offline-card"><span class="sync-icon">↻</span><div><strong>${state.data ? "DATABASE SYNC COMPLETE" : "DATABASE UNAVAILABLE"}</strong><small>${state.data ? date(state.data.retrievedAt) : "No cached records shown"}</small></div></div>
        <button class="header-sos" data-nav="assistance"><span></span>SOS Emergency Beacon</button>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="mobile-menu" id="menu-button">☰</button><div class="breadcrumb"><span>SafeTrip</span><b>/</b><strong>${navItems.find((item) => item[0] === state.active)?.[1]}</strong></div><div class="top-auth-actions">${state.user?.role === "AUTHORITY" ? '<a class="button button-outline button-small" href="/authority">Authority view</a>' : ""}${state.user ? '<button class="button button-danger button-small" id="top-logout" type="button">Log out</button>' : '<a class="button button-outline button-small" href="/login">Log in</a><a class="button button-primary button-small" href="/signup">Sign up</a>'}</div></header>
      ${alert ? `<div class="advisory"><span class="advisory-pulse"></span><strong>⚠ ${escapeHtml(alert.category)}</strong><span>${escapeHtml(alert.title)} — ${escapeHtml(alert.area)}</span><time>ISSUED: ${date(alert.issued_at)} · ${escapeHtml(alert.verification_status)}</time></div>` : ""}
      <section class="content">${state.loading ? loadingView() : state.error ? errorView() : renderContent()}</section>
      <footer class="site-footer">SafeTrip</footer>
    </main>`;
  bindEvents();
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
  const hazards = state.data.hazards;
  const shelters = state.data.shelters;
  if (!alert && !hazards.length) return emptyState("No active crisis records");
  return `<div class="page-heading"><div><p class="eyebrow">DATABASE-BACKED CRISIS HUB</p><h1>${alert ? escapeHtml(alert.title) : "Active incident records"}</h1><p class="lede">${alert ? `${escapeHtml(alert.area)} · Issued ${date(alert.issued_at)}` : "No alert is currently active."}</p></div></div>
    <section class="hero-grid">
      ${alert ? `<article class="alert-hero"><div class="hero-top"><span class="badge badge-severe">${escapeHtml(alert.severity)}</span><span class="mono">${escapeHtml(alert.verification_status)}</span></div><h2>${escapeHtml(alert.title)}</h2><p class="hero-area">${escapeHtml(alert.area)}</p><p class="hero-copy">${escapeHtml(alert.original_instructions)}</p><div class="source-line"><span class="source-check">✓</span><strong>${escapeHtml(alert.source_name)}</strong><span class="source-divider"></span><span>Issued ${date(alert.issued_at)}</span>${alert.source_url ? `<a href="${escapeHtml(alert.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>` : emptyState("No active alert")}
      <div class="map-card"><div class="map-toolbar"><span class="map-label">DATABASE HAZARD RECORDS</span><span class="map-live"><i></i>${hazards.length} records</span></div><div class="map-visual">${hazards.map((hazard) => `<span class="map-zone"></span><span class="map-pin pin-you">●<b>${escapeHtml(hazard.name)}<br/><em>${escapeHtml(hazard.area)}</em></b></span>`).join("")}</div><div class="map-legend"><span><i class="legend-dot danger"></i> Hazard record</span><span>Coordinates are supplied by the database</span></div></div>
    </section>
    <section class="section-title"><div><p class="eyebrow">ACTIVE RECORDS</p><h3>Hazards and closures</h3></div></section>
    <div class="mission-grid">${hazards.length ? hazards.map(hazardCard).join("") : emptyState("No hazard records")}</div>`;
}

function hazardCard(hazard) {
  return `<article class="mission-card"><div class="mission-head"><div><h3>${escapeHtml(hazard.name)}</h3><small>${escapeHtml(hazard.hazard_type)} · ${escapeHtml(hazard.area)}</small></div><span class="badge badge-warning small">${escapeHtml(hazard.status)}</span></div><p class="muted">${escapeHtml(hazard.verification_status)} · Updated ${date(hazard.updated_at)}</p><div class="source-line"><span>${escapeHtml(hazard.source_name)}</span>${hazard.source_url ? `<a href="${escapeHtml(hazard.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`;
}

function sheltersView() {
  const shelters = state.data.shelters;
  return `<div class="page-heading"><div><p class="eyebrow">DATABASE-VERIFIED SAFE ZONES</p><h1>Shelters & relief hubs</h1><p class="lede">Capacity and facilities are shown only when supplied by a database record.</p></div></div>
    <div class="shelter-layout"><div class="shelter-list">${shelters.length ? shelters.map((shelter, index) => `<article class="shelter-card"><div class="shelter-card-top"><span class="shelter-number">${String(index + 1).padStart(2, "0")}</span><span class="badge ${shelter.capacity_status === "SPACE AVAILABLE" ? "badge-safe" : "badge-warning"}">${escapeHtml(shelter.capacity_status)}</span></div><h3>${escapeHtml(shelter.name)}</h3><p class="muted">◉ ${escapeHtml(shelter.area)} · ${shelter.distance_km ?? "Distance not recorded"}${shelter.distance_km ? " km" : ""}</p><div class="amenities">${(shelter.amenities || []).map((amenity) => `<span>✓ ${escapeHtml(amenity)}</span>`).join("")}</div><div class="shelter-footer"><strong>${escapeHtml(shelter.available_spaces)} spaces available</strong><small>Verified ${date(shelter.last_verified_at)}</small></div><div class="source-line"><span>${escapeHtml(shelter.source_name)}</span>${shelter.source_url ? `<a href="${escapeHtml(shelter.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`).join("") : emptyState("No open shelters")}</div></div>`;
}

function embassiesView() {
  const missions = state.data.missions;
  return `<div class="page-heading"><div><p class="eyebrow">DATABASE DIPLOMATIC SUPPORT</p><h1>Embassies & consulates</h1><p class="lede">Emergency desks and contact numbers from the diplomatic directory.</p></div></div><div class="mission-grid">${missions.length ? missions.map((mission) => `<article class="mission-card"><div class="mission-flag">${escapeHtml(mission.country.slice(0, 2).toUpperCase())}</div><div class="mission-head"><div><h3>${escapeHtml(mission.country)}</h3><small>${escapeHtml(mission.region)}</small></div><span class="badge badge-safe small">${escapeHtml(mission.availability_status)}</span></div><div class="phone">${escapeHtml(mission.emergency_phone)}</div><div class="desk-row"><span>Desk</span><strong>${escapeHtml(mission.desk_label || "Not recorded")}</strong></div><div class="mission-actions"><a class="button button-primary button-small" href="tel:${escapeHtml(mission.emergency_phone.replace(/[^\d+]/g, ""))}">Dial duty desk</a>${mission.source_url ? `<a class="button button-quiet button-small" href="${escapeHtml(mission.source_url)}" target="_blank" rel="noreferrer">Source ↗</a>` : ""}</div></article>`).join("") : emptyState("No diplomatic missions")}</div>`;
}

function assistanceView() {
  const contacts = state.data.contacts;
  return `<div class="page-heading"><div><p class="eyebrow">LOCAL CIVIL DEFENCE</p><h1>Request urgent assistance</h1><p class="lede">For immediate danger, contact a database-listed emergency service first.</p></div>${contacts[0] ? `<a href="tel:${escapeHtml(contacts[0].phone)}" class="button button-danger">☎ ${escapeHtml(contacts[0].label)}</a>` : ""}</div><div class="assistance-layout"><form class="assistance-form" id="assistance-form"><label>Full name<input name="fullName" required /></label><label>Nationality<input name="nationality" required /></label><label>Party size<input name="groupSize" type="number" min="1" required /></label><fieldset><legend>Urgent assistance needed</legend>${["Emergency medical care", "Evacuation escort", "Critical food or water", "Mobility assistance"].map((need) => `<label class="check-row"><input type="checkbox" name="needs" value="${need}" />${need}</label>`).join("")}</fieldset><button class="button button-danger full-width" type="submit">Transmit to local civil defence</button></form><div class="dispatch-card"><p class="eyebrow">DATABASE CONTACTS</p>${contacts.length ? contacts.map((contact) => `<div class="source-line"><strong>${escapeHtml(contact.label)}</strong><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a><small>${escapeHtml(contact.service)} · ${escapeHtml(contact.source_name)}</small></div>`).join("") : emptyState("No emergency contacts")}</div></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((element) => element.addEventListener("click", () => {
    if (element.dataset.nav === "assistance" && !state.user) {
      location.href = "/login?next=%2Fassistance";
      return;
    }
    state.active = element.dataset.nav;
    appShell();
  }));
  document.querySelector("#retry")?.addEventListener("click", loadDashboard);
  document.querySelector("#top-logout")?.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  });
  document.querySelector("#menu-button")?.addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("mobile-open"));
  document.querySelector("#assistance-form")?.addEventListener("submit", submitAssistance);
}

async function loadDashboard() {
  state.loading = true; state.error = null; appShell();
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
    state.loading = false; appShell();
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
