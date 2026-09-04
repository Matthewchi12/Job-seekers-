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


// ========================================
// CURRENT FILTER
// ========================================

let currentFilter = "all";


// ========================================
// LOAD JOBS
// ========================================

async function loadJobs() {

  // Show loading
  if (loading) {
    loading.classList.remove("hidden");
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  if (jobsContainer) {
    jobsContainer.innerHTML = "";
  }


  // ========================================
  // SEARCH VALUE
  // ========================================

  const search =
    searchInput?.value.trim() || "";


  const location =
    locationInput?.value.trim() || "";


  try {

    // ========================================
    // BUILD API REQUEST
    // ========================================

    const params =
      new URLSearchParams();


    // Search is optional
    if (search) {

      params.append(
        "search",
        search
      );

    }


    // Job type filter
    if (
      currentFilter !== "all"
    ) {

      params.append(
        "type",
        currentFilter
      );

    }


    // ========================================
    // CONNECT TO BACKEND
    // ========================================

    const response =
      await fetch(
        `${API_URL}/api/jobs?${params.toString()}`,
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    // ========================================
    // CHECK SERVER RESPONSE
    // ========================================

    if (!response.ok) {

      throw new Error(
        `Server error: ${response.status}`
      );

    }


    const data =
      await response.json();


    // ========================================
    // CHECK API RESPONSE
    // ========================================

    if (!data.success) {

      throw new Error(
        data.message ||
        data.error ||
        "Unable to load jobs."
      );

    }


    // ========================================
    // GET JOBS
    // ========================================

    let jobs =
      Array.isArray(data.jobs)
        ? data.jobs
        : [];


    // ========================================
    // FRONTEND LOCATION FILTER
    // ========================================
    // This makes the location search work
    // with the Himalayas response.
    //
    // Nigeria-friendly jobs are already filtered
    // by the backend.
    //
    // This additional filter allows the user
    // to search locations such as:
    // Nigeria
    // Worldwide
    // Africa
    // United States
    // United Kingdom
    // etc.
    // ========================================

    if (location) {

      const locationSearch =
        location.toLowerCase();


      jobs =
        jobs.filter(job => {

          const jobLocation =
            String(
              job.location || ""
            ).toLowerCase();


          const restrictions =
            Array.isArray(
              job.locationRestrictions
            )
              ? job.locationRestrictions
              : [];


          const restrictionText =
            restrictions
              .map(item => {

                return [
                  item?.name,
                  item?.alpha2,
                  item?.slug
                ]
                  .filter(Boolean)
                  .join(" ");

              })
              .join(" ")
              .toLowerCase();


          const company =
            String(
              job.company || ""
            ).toLowerCase();


          const description =
            String(
              job.description || ""
            ).toLowerCase();


          return (
            jobLocation.includes(
              locationSearch
            ) ||

            restrictionText.includes(
              locationSearch
            ) ||

            company.includes(
              locationSearch
            ) ||

            description.includes(
              locationSearch
            )
          );

        });

    }


    // ========================================
    // DISPLAY JOBS
    // ========================================

    displayJobs(jobs);


  } catch (error) {

    console.error(
      "Job loading error:",
      error
    );


    // ========================================
    // SHOW ERROR
    // ========================================

    if (jobsContainer) {

      jobsContainer.innerHTML = `

        <div class="empty-state">

          <div>⚠️</div>

          <h3>
            Unable to load jobs
          </h3>

          <p>
            We couldn't connect to the job server.
            Please try again.
          </p>

          <button
            class="apply-btn"
            onclick="loadJobs()"
            style="margin-top:15px;"
          >
            Try Again
          </button>

        </div>

      `;

    }


    if (jobCount) {

      jobCount.textContent =
        "0 jobs";

    }


  } finally {

    // ========================================
    // HIDE LOADING
    // ========================================

    if (loading) {

      loading.classList.add(
        "hidden"
      );

    }

  }

}


// ========================================
// DISPLAY JOBS
// ========================================

function displayJobs(jobList) {

  if (!jobsContainer) {
    return;
  }


  jobsContainer.innerHTML = "";


  // ========================================
  // JOB COUNT
  // ========================================

  if (jobCount) {

    jobCount.textContent =
      `${jobList.length} ${
        jobList.length === 1
          ? "job"
          : "jobs"
      }`;

  }


  // ========================================
  // NO JOBS
  // ========================================

  if (!jobList.length) {

    if (emptyState) {

      emptyState.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }


  // ========================================
  // CREATE JOB CARDS
  // ========================================

  jobList.forEach(job => {

    const card =
      document.createElement(
        "div"
      );


    card.className =
      "job-card";


    // ========================================
    // JOB DATA
    // ========================================

    const title =
      job.title ||
      "Job Opportunity";


    const company =
      job.company ||
      "Company";


    const location =
      job.location ||
      "Worldwide";


    const type =
      job.contract_type ||
      job.contract_time ||
      job.employmentType ||
      "Full-time";


    // ========================================
    // SALARY
    // ========================================

    const salary =
      formatSalary(job);


    // ========================================
    // DESCRIPTION
    // ========================================

    const description =
      cleanDescription(
        job.description ||
        job.excerpt ||
        ""
      );


    // ========================================
    // APPLICATION URL
    // ========================================

    const applicationURL =
      safeURL(
        job.url ||
        job.applicationLink
      );


    // ========================================
    // JOB CARD
    // ========================================

    card.innerHTML = `

      <div class="job-info">

        <div class="job-company">

          ${escapeHTML(company)}

        </div>


        <h3 class="job-title">

          ${escapeHTML(title)}

        </h3>


        <div class="job-meta">

          <span class="tag">

            📍

            ${escapeHTML(location)}

          </span>


          <span class="tag">

            💼

            ${escapeHTML(type)}

          </span>


          <span class="tag">

            💰

            ${escapeHTML(salary)}

          </span>

        </div>


        <p class="job-description">

          ${escapeHTML(
            description.substring(
              0,
              350
            )
          )}

          ${
            description.length > 350
              ? "..."
              : ""
          }

        </p>


        <div
          class="job-source"
          style="margin-top:8px;font-size:12px;opacity:0.7;"
        >

          Source:
          ${escapeHTML(
            job.source ||
            "Himalayas"
          )}

        </div>

      </div>


      <a
        href="${applicationURL}"
        target="_blank"
        rel="noopener noreferrer"
        class="apply-btn"
        ${
          applicationURL === "#"
            ? 'aria-disabled="true"'
            : ""
        }
      >

        Apply Now →

      </a>

    `;


    // ========================================
    // DISABLE INVALID APPLICATION LINK
    // ========================================

    if (
      applicationURL === "#"
    ) {

      const applyButton =
        card.querySelector(
          ".apply-btn"
        );


      if (applyButton) {

        applyButton.addEventListener(
          "click",
          event => {

            event.preventDefault();


            alert(
              "Application link is not available for this job."
            );

          }
        );

      }

    }


    // ========================================
    // ADD CARD TO PAGE
    // ========================================

    jobsContainer.appendChild(
      card
    );

  });

}


// ========================================
// FORMAT SALARY
// ========================================

function formatSalary(job) {

  // If backend already provides
  // a formatted salary
  if (job.salary) {

    return String(
      job.salary
    );

  }


  const min =
    job.salary_min;


  const max =
    job.salary_max;


  const currency =
    job.currency ||
    "";


  const period =
    job.salary_period ||
    "";


  // No salary information
  if (
    min === null ||
    min === undefined
  ) {

    return "Salary not specified";

  }


  // ========================================
  // FORMAT NUMBERS
  // ========================================

  const formattedMin =
    formatNumber(min);


  const formattedMax =
    formatNumber(max);


  let salaryText =
    "";


  if (
    max !== null &&
    max !== undefined &&
    max !== ""
  ) {

    salaryText =
      `${currency} ${formattedMin} - ${formattedMax}`;

  } else {

    salaryText =
      `${currency} ${formattedMin}`;

  }


  // ========================================
  // ADD SALARY PERIOD
  // ========================================

  if (period) {

    salaryText +=
      ` / ${period}`;

  }


  return salaryText.trim();

}


// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(value) {

  const number =
    Number(value);


  if (
    Number.isNaN(number)
  ) {

    return String(value);

  }


  return number.toLocaleString();

}


// ========================================
// SEARCH BUTTON
// ========================================

if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    () => {

      loadJobs();

    }
  );

}


// ========================================
// SEARCH INPUT - ENTER KEY
// ========================================

if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        loadJobs();

      }

    }
  );

}


// ========================================
// LOCATION INPUT - ENTER KEY
// ========================================

if (locationInput) {

  locationInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        loadJobs();

      }

    }
  );

}


// ========================================
// FILTER BUTTONS
// ========================================

document
  .querySelectorAll(
    ".quick-btn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        // ========================================
        // REMOVE ACTIVE FROM OTHER BUTTONS
        // ========================================

        document
          .querySelectorAll(
            ".quick-btn"
          )
          .forEach(btn => {

            btn.classList.remove(
              "active"
            );

          });


        // ========================================
        // ACTIVATE CLICKED BUTTON
        // ========================================

        button.classList.add(
          "active"
        );


        // ========================================
        // GET FILTER
        // ========================================

        currentFilter =
          button.dataset.type ||
          "all";


        // ========================================
        // LOAD FILTERED JOBS
        // ========================================

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
    String(description);


  return (
    div.textContent ||
    div.innerText ||
    ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
  value
) {

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

function safeURL(
  url
) {

  if (!url) {

    return "#";

  }


  try {

    const parsed =
      new URL(url);


    if (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
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
