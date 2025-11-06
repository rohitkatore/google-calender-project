let tokenClient, accessToken;
let gapiInited = false,
  gisInited = false;
const API_BASE_URL = "http://localhost:8000/api";

async function getAuthData() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`);
    return response.ok
      ? await response.json()
      : {
          access_token: null,
          token_expiry: null,
          user_data: null,
          is_connected: false,
        };
  } catch (error) {
    showError(
      "Cannot connect to server. Make sure server is running on port 8000"
    );
    return {
      access_token: null,
      token_expiry: null,
      user_data: null,
      is_connected: false,
    };
  }
}

async function saveAuthData(data) {
  try {
    await fetch(`${API_BASE_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    showError("Failed to save authentication data");
  }
}

async function clearAuthData() {
  try {
    await fetch(`${API_BASE_URL}/auth`, { method: "DELETE" });
  } catch (error) {}
}

function isTokenValid(expiryTime) {
  return expiryTime && Date.now() < expiryTime - 5 * 60 * 1000;
}

function gapiLoaded() {
  gapi.load("client", async () => {
    try {
      await gapi.client.init({ discoveryDocs: CONFIG.DISCOVERY_DOCS });
      gapiInited = true;
      maybeEnableButtons();
    } catch (error) {
      showError("Failed to initialize Google API: " + error.message);
    }
  });
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: "",
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("connectBtn").disabled = false;
    document.getElementById("connectBtn").textContent =
      "Connect to Google Calendar";
    checkStoredAuth();
  }
}

async function checkStoredAuth() {
  const authData = await getAuthData();
  if (
    authData.is_connected &&
    authData.access_token &&
    isTokenValid(authData.token_expiry)
  ) {
    gapi.client.setToken(authData.access_token);
    showConnectedState(authData.user_data);
    await listUpcomingEvents();
  } else {
    await clearAuthData();
  }
}

function showConnectedState(userData) {
  document.getElementById("connectBtn").style.display = "none";
  document.getElementById("disconnectBtn").style.display = "inline-block";
  document.getElementById("addEventSection").style.display = "block";
  if (userData) displayUserData(userData);
}

document.getElementById("connectBtn").addEventListener("click", () => {
  tokenClient.callback = async (resp) => {
    if (resp.error) return showError(resp.error);

    accessToken = gapi.client.getToken();
    const userData = await fetchUserData();

    await saveAuthData({
      access_token: accessToken,
      token_expiry: Date.now() + accessToken.expires_in * 1000,
      user_data: userData,
      is_connected: true,
    });

    showConnectedState(userData);
    await listUpcomingEvents();
  };
  tokenClient.requestAccessToken({
    prompt: gapi.client.getToken() ? "" : "consent",
  });
});

async function fetchUserData() {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        },
      }
    );
    const userData = await response.json();
    displayUserData(userData);
    return userData;
  } catch (error) {
    showError("Failed to fetch user data");
    return null;
  }
}

function displayUserData(data) {
  const token = gapi.client.getToken();
  document.getElementById("userData").innerHTML = `
    <h3>User Information</h3>
    <div class="data-item"><strong>Name:</strong> ${data.name || "N/A"}</div>
    <div class="data-item"><strong>Email:</strong> ${data.email || "N/A"}</div>
    <div class="data-item"><strong>Profile:</strong> ${
      data.picture
        ? `<img src="${data.picture}" alt="Profile" style="width:50px;border-radius:50%;vertical-align:middle;">`
        : "N/A"
    }</div>
    <h3 style="margin-top:20px;">Token Info</h3>
    <div class="data-item"><strong>Expires In:</strong> ${
      token?.expires_in || "N/A"
    } seconds</div>
    <div class="data-item"><strong>Scope:</strong> ${
      token?.scope || "N/A"
    }</div>
  `;
  document.getElementById("userDataSection").style.display = "block";
}

async function listUpcomingEvents() {
  const eventsList = document.getElementById("eventsList");
  document.getElementById("eventsSection").style.display = "block";
  eventsList.innerHTML = '<p class="loading">Loading events...</p>';

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    });
    displayEvents(response.result.items);
  } catch (error) {
    eventsList.innerHTML = '<p class="no-events">Failed to load events</p>';
    showError("Failed to fetch events: " + error.message);
  }
}

function displayEvents(events) {
  const eventsList = document.getElementById("eventsList");
  if (!events?.length) {
    eventsList.innerHTML = '<p class="no-events">No upcoming events found</p>';
    return;
  }

  eventsList.innerHTML = events
    .map((event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      const isAllDay = !event.start.dateTime;

      return `
      <div class="event-card">
        <div class="event-title">${event.summary || "No Title"}</div>
        <div class="event-time">📅 ${start.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</div>
        ${
          !isAllDay
            ? `<div class="event-time">🕐 ${start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${end.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}</div>`
            : '<div class="event-time">All day</div>'
        }
        ${
          event.description
            ? `<div class="event-description">📝 ${event.description}</div>`
            : ""
        }
        ${
          event.location
            ? `<div class="event-location">📍 ${event.location}</div>`
            : ""
        }
        ${
          event.attendees?.length
            ? `<div class="event-attendees">👥 ${event.attendees.length} attendee(s)</div>`
            : ""
        }
        ${
          event.htmlLink
            ? `<div class="event-link"><a href="${event.htmlLink}" target="_blank">View in Google Calendar →</a></div>`
            : ""
        }
      </div>
    `;
    })
    .join("");
}

document.getElementById("disconnectBtn").addEventListener("click", async () => {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    await clearAuthData();
    [
      "userDataSection",
      "addEventSection",
      "eventsSection",
      "errorSection",
    ].forEach((id) => (document.getElementById(id).style.display = "none"));
    document.getElementById("connectBtn").style.display = "inline-block";
    document.getElementById("disconnectBtn").style.display = "none";
    document.getElementById("eventForm").reset();
  }
});

document
  .getElementById("refreshBtn")
  .addEventListener("click", listUpcomingEvents);

function showError(message) {
  const errorSection = document.getElementById("errorSection");
  document.getElementById("errorMessage").textContent = message;
  errorSection.style.display = "block";
  setTimeout(() => (errorSection.style.display = "none"), 5000);
}

function loadGoogleScripts() {
  const loadScript = (src, onload) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = onload;
    script.onerror = () => showError("Failed to load Google scripts");
    document.head.appendChild(script);
  };
  loadScript("https://apis.google.com/js/api.js", gapiLoaded);
  loadScript("https://accounts.google.com/gsi/client", gisLoaded);
}

document.getElementById("toggleFormBtn").addEventListener("click", () => {
  const form = document.getElementById("eventForm");
  if (form.style.display === "none") {
    form.style.display = "block";
    document.getElementById("successMessage").style.display = "none";
    setDefaultDateTime();
  } else {
    form.style.display = "none";
  }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("eventForm").style.display = "none";
  document.getElementById("eventForm").reset();
});

document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await createEvent();
});

function setDefaultDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (d) => d.toISOString().split("T")[0];

  document.getElementById("eventStartDate").value = formatDate(tomorrow);
  document.getElementById("eventStartTime").value = "10:00";
  document.getElementById("eventEndDate").value = formatDate(tomorrow);
  document.getElementById("eventEndTime").value = "11:00";
}

async function createEvent() {
  const getValue = (id) => document.getElementById(id).value;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const event = {
    summary: getValue("eventTitle"),
    start: {
      dateTime: `${getValue("eventStartDate")}T${getValue(
        "eventStartTime"
      )}:00`,
      timeZone,
    },
    end: {
      dateTime: `${getValue("eventEndDate")}T${getValue("eventEndTime")}:00`,
      timeZone,
    },
  };

  const description = getValue("eventDescription");
  const location = getValue("eventLocation");
  const attendees = getValue("eventAttendees");

  if (description) event.description = description;
  if (location) event.location = location;
  if (attendees)
    event.attendees = attendees
      .split(",")
      .map((email) => ({ email: email.trim() }));

  try {
    await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
    });

    document.getElementById("eventForm").style.display = "none";
    document.getElementById("successMessage").style.display = "block";
    document.getElementById("eventForm").reset();
    setTimeout(
      () => (document.getElementById("successMessage").style.display = "none"),
      5000
    );
    await listUpcomingEvents();
  } catch (error) {
    showError(
      "Failed to create event: " +
        (error.result?.error?.message || error.message)
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").disabled = true;
  document.getElementById("connectBtn").textContent = "Loading...";
  loadGoogleScripts();
});
