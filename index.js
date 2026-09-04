// ========================================
// BACKEND CONNECTION
// ========================================
const API_URL =
  "https://job-seeker-backend-atym.onrender.com";
// ========================================
// DOM ELEMENTS
// ========================================
const jobsContainer =
  document.getElementById("jobsContainer");
const loading =
  document.getElementById("loading");
const emptyState =
  document.getElementById("emptyState");
const jobCount =
  document.getElementById("jobCount");
const searchInput =
  document.getElementById("searchInput");
const locationInput =
  document.getElementById("locationInput");
const searchBtn =
  document.getElementById("searchBtn");
let currentFilter = "all";
// ========================================
// LOAD JOBS FROM RENDER BACKEND
// ========================================
async function loadJobs() {
  loading.classList.remove("hidden");
  emptyState.classList.add("hidden");
  jobsContainer.innerHTML = "";
  const search =
    searchInput.value.trim() || "jobs";
  const location =
    locationInput.value.trim();
  try {
    const params =
      new URLSearchParams();
    params.append(
      "search",
      search
    );
    if (location) {
      params.append(
        "location",
        location
      );
    }
    if (currentFilter !== "all") {
      params.append(
        "type",
        currentFilter
      );
    }
    // CONNECT TO RENDER BACKEND
    const response =
      await fetch(
        `${API_URL}/api/jobs?${params.toString()}`
      );
    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status}`
      );
    }
    const data =
      await response.json();
    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to load jobs"
      );
    }
    displayJobs(
      data.jobs || []
    );
  } catch (error) {
    console.error(
      "Job loading error:",
      error
    );
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div>⚠️</div>
        <h3>
          Unable to load jobs
        </h3>
        <p>
          Unable to connect to the job server.
          Please try again later.
        </p>
      </div>
    `;
    jobCount.textContent =
      "0 jobs";
  } finally {
    loading.classList.add(
      "hidden"
    );
  }
}
// ========================================
// DISPLAY JOBS
// ========================================
function displayJobs(jobList) {
  jobsContainer.innerHTML = "";
  jobCount.textContent =
    `${jobList.length} ${
      jobList.length === 1
        ? "job"
        : "jobs"
    }`;
  if (!jobList.length) {
    emptyState.classList.remove(
      "hidden"
    );
    return;
  }
  emptyState.classList.add(
    "hidden"
  );
  jobList.forEach(job => {
    const card =
      document.createElement("div");
    card.className =
      "job-card";
    card.innerHTML = `
      <div class="job-info">
        <div class="job-company">
          ${escapeHTML(
            job.company ||
            "Company"
          )}
        </div>
        <h3 class="job-title">
          ${escapeHTML(
            job.title ||
            "Job Opportunity"
          )}
        </h3>
        <div class="job-meta">
          <span class="tag">
            📍
            ${escapeHTML(
              job.location ||
              "Location not specified"
            )}
          </span>
          <span class="tag">
            💼
            ${escapeHTML(
              job.type ||
              "Full-time"
            )}
          </span>
          <span class="tag">
            💰
            ${escapeHTML(
              job.salary ||
              "Salary not specified"
            )}
          </span>
        </div>
        <p class="job-description">
          ${escapeHTML(
            cleanDescription(
              job.description
            ).substring(0, 350)
          )}
        </p>
      </div>
      <a
        href="${safeURL(job.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="apply-btn"
      >
        Apply Now →
      </a>
    `;
    jobsContainer.appendChild(
      card
    );
  });
}
// ========================================
// SEARCH BUTTON
// ========================================
searchBtn.addEventListener(
  "click",
  loadJobs
);
// ========================================
// ENTER KEY SEARCH
// ========================================
searchInput.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      loadJobs();
    }
  }
);
locationInput.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      loadJobs();
    }
  }
);
// ========================================
// FILTER BUTTONS
// ========================================
document
  .querySelectorAll(".quick-btn")
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".quick-btn"
          )
          .forEach(btn => {
            btn.classList.remove(
              "active"
            );
          });
        button.classList.add(
          "active"
        );
        currentFilter =
          button.dataset.type ||
          "all";
        loadJobs();
      }
    );
  });
// ========================================
// CLEAN JOB DESCRIPTION
// ========================================
function cleanDescription(
  description
) {
  if (!description) {
    return "";
  }
  const div =
    document.createElement(
      "div"
    );
  div.innerHTML =
    description;
  return (
    div.textContent ||
    div.innerText ||
    ""
  );
}
// ========================================
// ESCAPE HTML
// ========================================
function escapeHTML(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }
  const div =
    document.createElement(
      "div"
    );
  div.textContent =
    String(value);
  return div.innerHTML;
}
// ========================================
// SAFE APPLICATION URL
// ========================================
function safeURL(url) {
  if (!url) {
    return "#";
  }
  try {
    const parsed =
      new URL(url);
    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {
      return parsed.href;
    }
    return "#";
  } catch {
    return "#";
  }
}
// ========================================
// LOAD JOBS WHEN WEBSITE OPENS
// ========================================
loadJobs();
