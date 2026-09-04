// ========================================
// JOBFINDER FRONTEND
// INTERNATIONAL REMOTE JOBS
// NIGERIANS CAN WORK FROM NIGERIA
// ========================================


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
// API REQUEST
// ========================================

async function fetchJobs() {

  const search =
    searchInput?.value.trim() || "";

  const location =
    locationInput?.value.trim() || "";


  const params =
    new URLSearchParams();


  // Search
  if (search) {

    params.set(
      "search",
      search
    );

  }


  // IMPORTANT:
  // Backend already returns fully remote
  // Nigeria-eligible international jobs.
  //
  // We only send the search term here.
  //
  // This prevents the frontend from accidentally
  // filtering out valid international jobs.


  const url =
    `${API_URL}/api/jobs/remote${
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`;


  console.log(
    "Loading jobs from:",
    url
  );


  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          "Accept":
            "application/json"
        },

        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Server returned ${response.status}`
    );

  }


  const data =
    await response.json();


  console.log(
    "Jobs API response:",
    data
  );


  if (!data.success) {

    throw new Error(
      data.message ||
      data.error ||
      "Job server returned an error."
    );

  }


  let jobs =
    Array.isArray(data.jobs)
      ? data.jobs
      : [];


  // ========================================
  // FRONTEND LOCATION SEARCH
  // ========================================

  if (location) {

    const locationSearch =
      location.toLowerCase();


    jobs =
      jobs.filter(job => {

        const jobLocation =
          String(
            job.location ||
            ""
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


        const description =
          String(
            job.description ||
            job.excerpt ||
            ""
          ).toLowerCase();


        const company =
          String(
            job.company ||
            ""
          ).toLowerCase();


        const title =
          String(
            job.title ||
            ""
          ).toLowerCase();


        return (

          jobLocation.includes(
            locationSearch
          ) ||

          restrictionText.includes(
            locationSearch
          ) ||

          description.includes(
            locationSearch
          ) ||

          company.includes(
            locationSearch
          ) ||

          title.includes(
            locationSearch
          )

        );

      });

  }


  // ========================================
  // JOB TYPE FILTER
  // ========================================

  if (
    currentFilter !== "all"
  ) {

    const filter =
      currentFilter.toLowerCase();


    jobs =
      jobs.filter(job => {

        const employmentType =
          String(
            job.employmentType ||
            job.contract_type ||
            job.contract_time ||
            ""
          ).toLowerCase();


        const title =
          String(
            job.title ||
            ""
          ).toLowerCase();


        const description =
          String(
            job.description ||
            ""
          ).toLowerCase();


        const combined =
          `${employmentType} ${title} ${description}`;


        if (
          filter === "full-time" ||
          filter === "fulltime"
        ) {

          return (
            combined.includes(
              "full time"
            ) ||

            combined.includes(
              "full-time"
            )

          );

        }


        if (
          filter === "part-time" ||
          filter === "parttime"
        ) {

          return (
            combined.includes(
              "part time"
            ) ||

            combined.includes(
              "part-time"
            )

          );

        }


        if (
          filter === "contract"
        ) {

          return combined.includes(
            "contract"
          );

        }


        if (
          filter === "internship" ||
          filter === "intern"
        ) {

          return (
            combined.includes(
              "intern"
            )

          );

        }


        return true;

      });

  }


  return {
    jobs,
    apiData: data
  };

}


// ========================================
// LOAD JOBS
// ========================================

async function loadJobs() {

  // Show loading
  if (loading) {

    loading.classList.remove(
      "hidden"
    );

  }


  // Hide empty state
  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }


  // Clear jobs
  if (jobsContainer) {

    jobsContainer.innerHTML = "";

  }


  // Loading text
  if (jobCount) {

    jobCount.textContent =
      "Loading jobs...";

  }


  try {

    const result =
      await fetchJobs();


    const jobs =
      result.jobs;


    console.log(
      "Jobs received:",
      jobs.length
    );


    // Display
    displayJobs(
      jobs
    );


  } catch (error) {

    console.error(
      "Job loading error:",
      error
    );


    showError(
      error
    );


  } finally {

    if (loading) {

      loading.classList.add(
        "hidden"
      );

    }

  }

}


// ========================================
// DISPLAY ERROR
// ========================================

function showError(
  error
) {

  if (jobCount) {

    jobCount.textContent =
      "0 jobs";

  }


  if (!jobsContainer) {

    return;

  }


  jobsContainer.innerHTML = `

    <div class="empty-state">

      <div
        style="
          font-size:40px;
          margin-bottom:10px;
        "
      >
        ⚠️
      </div>

      <h3>
        Unable to load jobs
      </h3>

      <p>
        We couldn't connect to the job server.
        Please try again.
      </p>

      <button
        class="apply-btn"
        id="retryJobsBtn"
        type="button"
        style="margin-top:15px;"
      >
        Try Again
      </button>

      <p
        style="
          margin-top:12px;
          font-size:12px;
          opacity:0.6;
        "
      >
        Server:
        ${escapeHTML(API_URL)}
      </p>

    </div>

  `;


  const retryButton =
    document.getElementById(
      "retryJobsBtn"
    );


  if (retryButton) {

    retryButton.addEventListener(
      "click",
      loadJobs
    );

  }

}


// ========================================
// DISPLAY JOBS
// ========================================

function displayJobs(
  jobList
) {

  if (!jobsContainer) {

    return;

  }


  jobsContainer.innerHTML = "";


  // ========================================
  // COUNT
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


    jobsContainer.innerHTML = `

      <div class="empty-state">

        <div
          style="
            font-size:40px;
            margin-bottom:10px;
          "
        >
          🔎
        </div>

        <h3>
          No jobs found
        </h3>

        <p>
          Try another search or location.
        </p>

      </div>

    `;


    return;

  }


  // Hide empty state
  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }


  // ========================================
  // CREATE JOB CARDS
  // ========================================

  jobList.forEach(
    job => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "job-card";


      // ========================================
      // JOB INFORMATION
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
        job.employmentType ||
        job.contract_type ||
        job.contract_time ||
        "Full Time";


      const salary =
        formatSalary(
          job
        );


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
      //
      // IMPORTANT:
      // Himalayas backend uses applicationUrl
      // ========================================

      const applicationURL =
        safeURL(
          job.applicationUrl ||
          job.applicationLink ||
          job.url
        );


      // ========================================
      // REMOTE LABEL
      // ========================================

      const remoteLabel =
        job.remoteLabel ||
        "100% Remote";


      // ========================================
      // ELIGIBILITY
      // ========================================

      const eligibility =
        job.eligibility ||
        "Nigerians can apply from Nigeria";


      // ========================================
      // SALARY DISPLAY
      // ========================================

      const salaryHTML =
        salary !==
        "Salary not specified"

          ? `
            <span class="tag">
              💰
              ${escapeHTML(salary)}
            </span>
          `

          : `

            <span class="tag">
              💰
              Salary not specified
            </span>

          `;


      // ========================================
      // JOB CARD HTML
      // ========================================

      card.innerHTML = `

        <div class="job-info">

          <div
            class="job-company"
          >
            ${escapeHTML(company)}
          </div>


          <h3
            class="job-title"
          >
            ${escapeHTML(title)}
          </h3>


          <div
            class="job-meta"
          >

            <span
              class="tag"
            >
              🏠
              ${escapeHTML(remoteLabel)}
            </span>


            <span
              class="tag"
            >
              📍
              ${escapeHTML(location)}
            </span>


            <span
              class="tag"
            >
              💼
              ${escapeHTML(type)}
            </span>


            ${salaryHTML}

          </div>


          <div
            style="
              margin-top:10px;
              font-size:13px;
              font-weight:600;
            "
          >
            🇳🇬
            ${escapeHTML(eligibility)}
          </div>


          <p
            class="job-description"
          >
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
            style="
              margin-top:8px;
              font-size:12px;
              opacity:0.7;
            "
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
      // INVALID APPLICATION URL
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
      // ADD CARD
      // ========================================

      jobsContainer.appendChild(
        card
      );

    }
  );

}


// ========================================
// FORMAT SALARY
// ========================================

function formatSalary(
  job
) {

  // Backend formatted salary
  if (
    job.salary &&
    String(
      job.salary
    ).trim()
  ) {

    return String(
      job.salary
    ).trim();

  }


  const min =
    job.salary_min ??
    job.salaryMin;


  const max =
    job.salary_max ??
    job.salaryMax;


  const currency =
    job.currency ||
    "";


  const period =
    job.salary_period ||
    job.salaryPeriod ||
    "";


  // No salary
  if (
    min === null ||
    min === undefined ||
    min === ""
  ) {

    return "Salary not specified";

  }


  const formattedMin =
    formatNumber(
      min
    );


  const formattedMax =
    formatNumber(
      max
    );


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


  if (period) {

    salaryText +=
      ` / ${period}`;

  }


  return salaryText.trim();

}


// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(
  value
) {

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
// SEARCH ENTER KEY
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
// LOCATION ENTER KEY
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
// QUICK FILTER BUTTONS
// ========================================

document
  .querySelectorAll(
    ".quick-btn"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          // Remove active
          document
            .querySelectorAll(
              ".quick-btn"
            )
            .forEach(
              btn => {

                btn.classList.remove(
                  "active"
                );

              }
            );


          // Activate selected
          button.classList.add(
            "active"
          );


          // Get filter
          currentFilter =
            button.dataset.type ||
            "all";


          // Reload
          loadJobs();

        }
      );

    }
  );


// ========================================
// CLEAN DESCRIPTION
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
// SAFE URL
// ========================================

function safeURL(
  url
) {

  if (!url) {

    return "#";

  }


  try {

    const parsed =
      new URL(
        String(url)
      );


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
// START
// ========================================

console.log(
  "JobFinder frontend started."
);

console.log(
  "Backend:",
  API_URL
);

console.log(
  "Endpoint:",
  `${API_URL}/api/jobs/remote`
);


loadJobs();
