const params = new URLSearchParams(location.search);
let signup = params.get("mode") === "signup" || location.pathname === "/signup";
const form = document.querySelector("#auth-form");
const nameField = document.querySelector("#name-field");
const title = document.querySelector("#auth-title");
const description = document.querySelector("#auth-description");
const submit = document.querySelector("#auth-submit");
const switchButton = document.querySelector("#auth-switch");
const guestButton = document.querySelector("#guest-access");
const error = document.querySelector("#auth-error");

function render() {
  nameField.hidden = !signup;
  nameField.querySelector("input").required = signup;
  title.textContent = signup ? "Create a tourist account" : "Sign in to SafeTrip";
  description.textContent = signup ? "Create an account to access verified crisis records." : "Access database-backed crisis information for your journey.";
  submit.textContent = signup ? "Create account" : "Sign in";
  switchButton.textContent = signup ? "Already have an account? Sign in" : "Create a tourist account";
}
switchButton.addEventListener("click", () => { signup = !signup; render(); });
guestButton.addEventListener("click", () => {
  window.location.assign("/guest");
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  const values = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch(signup ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Authentication failed.");
    location.href = params.get("next") || "/";
  } catch (err) {
    error.textContent = err.message;
  }
});
render();
