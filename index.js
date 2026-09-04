const jobs = [
  {
    id: 1,
    title: "Customer Support Specialist",
    company: "Tech Company",
    location: "Lagos, Nigeria",
    type: "Full-time",
    category: "Customer Support",
    salary: "₦180,000/month",
    description: "Provide excellent customer support through email, chat and phone.",
    region: "nigeria",
    apply: "https://example.com"
  },

  {
    id: 2,
    title: "Remote Data Analyst",
    company: "Global Company",
    location: "Remote",
    type: "Full-time",
    category: "Data",
    salary: "$1,500/month",
    description: "Analyze business data and create reports for an international team.",
    region: "remote",
    apply: "https://example.com"
  },

  {
    id: 3,
    title: "Software Developer",
    company: "International Tech",
    location: "Remote - Worldwide",
    type: "Full-time",
    category: "Technology",
    salary: "$2,500/month",
    description: "Work with an international development team building web applications.",
    region: "international",
    apply: "https://example.com"
  }
];


const jobsContainer = document.getElementById("jobsContainer");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const jobCount = document.getElementById("jobCount");

const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");

let currentFilter = "all";


function displayJobs(jobList) {

  jobsContainer.innerHTML = "";

  loading.classList.add("hidden");

  jobCount.textContent =
    `${jobList.length} ${jobList.length === 1 ? "job" : "jobs"}`;


  if (jobList.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");


  jobList.forEach(job => {

    const card = document.createElement("div");

    card.className = "job-card";


    card.innerHTML = `
      <div class="job-info">

        <div class="job-company">
          ${job.company}
        </div>

        <h3 class="job-title">
          ${job.title}
        </h3>

        <div class="job-meta">

          <span class="tag">
            📍 ${job.location}
          </span>

          <span class="tag">
            💼 ${job.type}
          </span>

          <span class="tag">
            ${job.category}
          </span>

          <span class="tag">
            💰 ${job.salary}
          </span>

        </div>

        <p class="job-description">
          ${job.description}
        </p>

      </div>

      <a
        href="${job.apply}"
        target="_blank"
        rel="noopener noreferrer"
        class="apply-btn"
      >
        Apply Now →
      </a>
    `;


    jobsContainer.appendChild(card);

  });
}


function filterJobs() {

  const search =
    searchInput.value.toLowerCase().trim();

  const location =
    locationInput.value.toLowerCase().trim();


  let filtered = jobs.filter(job => {

    const searchableText = `
      ${job.title}
      ${job.company}
      ${job.category}
      ${job.description}
      ${job.location}
    `.toLowerCase();


    const matchesSearch =
      !search ||
      searchableText.includes(search);


    const matchesLocation =
      !location ||
      job.location.toLowerCase().includes(location);


    const matchesType =
      currentFilter === "all" ||
      job.region === currentFilter;


    return (
      matchesSearch &&
      matchesLocation &&
      matchesType
    );

  });


  displayJobs(filtered);
}


searchBtn.addEventListener("click", filterJobs);


searchInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    filterJobs();
  }

});


locationInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    filterJobs();
  }

});


document.querySelectorAll(".quick-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".quick-btn")
        .forEach(btn =>
          btn.classList.remove("active")
        );


      button.classList.add("active");

      currentFilter =
        button.dataset.type;

      filterJobs();

    });

  });


/* Load jobs when the website opens */

displayJobs(jobs);
