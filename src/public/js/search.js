document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-input")
    const searchForm = document.querySelector(".search-form")
  
    if (!searchInput || !searchForm) return
  
    // Create dropdown for quick search results if it doesn't exist
    let quickSearchDropdown = document.querySelector(".quick-search-dropdown")
    if (!quickSearchDropdown) {
      quickSearchDropdown = document.createElement("div")
      quickSearchDropdown.className = "quick-search-dropdown"
      searchForm.parentNode.appendChild(quickSearchDropdown)
    }
  
    let debounceTimer
  
    searchInput.addEventListener("input", function () {
      const query = this.value.trim()
  
      // Clear previous timer
      clearTimeout(debounceTimer)
  
      // Hide dropdown if query is empty
      if (!query) {
        quickSearchDropdown.innerHTML = ""
        quickSearchDropdown.style.display = "none"
        return
      }
  
      // Set a debounce timer to avoid too many requests
      debounceTimer = setTimeout(() => {
        // Show loading indicator
        quickSearchDropdown.innerHTML = '<div class="quick-search-loading">Searching...</div>'
        quickSearchDropdown.style.display = "block"
  
        // Fetch quick search results
        fetch(`/search?q=${encodeURIComponent(query)}&format=json`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok")
            }
            return response.json()
          })
          .then((data) => {
            // Clear previous results
            quickSearchDropdown.innerHTML = ""
  
            // If no results, show no results message
            if (data.jobs.length === 0 && (!data.candidates || data.candidates.length === 0)) {
              quickSearchDropdown.innerHTML = '<div class="quick-search-no-results">No results found</div>'
              return
            }
  
            // Show dropdown
            quickSearchDropdown.style.display = "block"
  
            // Add jobs section if there are jobs
            if (data.jobs.length > 0) {
              const jobsSection = document.createElement("div")
              jobsSection.className = "quick-search-section"
  
              const jobsTitle = document.createElement("div")
              jobsTitle.className = "quick-search-title"
              jobsTitle.textContent = "Jobs"
              jobsSection.appendChild(jobsTitle)
  
              const jobsList = document.createElement("ul")
              jobsList.className = "quick-search-list"
  
              data.jobs.slice(0, 5).forEach((job) => {
                const jobItem = document.createElement("li")
                jobItem.className = "quick-search-item"
  
                const jobLink = document.createElement("a")
                jobLink.href = `/jobs/${job.id}`
                jobLink.innerHTML = `
                  <span class="quick-search-icon">${job.icon}</span>
                  <div class="quick-search-content">
                    <div class="quick-search-title">${job.title}</div>
                    <div class="quick-search-subtitle">${job.location} • ${job.experience}</div>
                  </div>
                `
  
                jobItem.appendChild(jobLink)
                jobsList.appendChild(jobItem)
              })
  
              jobsSection.appendChild(jobsList)
              quickSearchDropdown.appendChild(jobsSection)
            }
  
            // Add candidates section if there are candidates
            if (data.candidates && data.candidates.length > 0) {
              const candidatesSection = document.createElement("div")
              candidatesSection.className = "quick-search-section"
  
              const candidatesTitle = document.createElement("div")
              candidatesTitle.className = "quick-search-title"
              candidatesTitle.textContent = "Candidates"
              candidatesSection.appendChild(candidatesTitle)
  
              const candidatesList = document.createElement("ul")
              candidatesList.className = "quick-search-list"
  
              data.candidates.slice(0, 5).forEach((candidate) => {
                const candidateItem = document.createElement("li")
                candidateItem.className = "quick-search-item"
  
                const candidateLink = document.createElement("a")
                candidateLink.href = `/candidates/${candidate.applicationId}`
                candidateLink.innerHTML = `
                  <div class="avatar small">
                    <img src="${candidate.avatar}" alt="${candidate.name}">
                  </div>
                  <div class="quick-search-content">
                    <div class="quick-search-title">${candidate.name}</div>
                    <div class="quick-search-subtitle">${candidate.jobTitle} • ${candidate.stage}</div>
                  </div>
                `
  
                candidateItem.appendChild(candidateLink)
                candidatesList.appendChild(candidateItem)
              })
  
              candidatesSection.appendChild(candidatesList)
              quickSearchDropdown.appendChild(candidatesSection)
            }
  
            // Add "View all results" link
            const viewAllLink = document.createElement("a")
            viewAllLink.href = `/search?q=${encodeURIComponent(query)}`
            viewAllLink.className = "quick-search-view-all"
            viewAllLink.textContent = "View all results"
            quickSearchDropdown.appendChild(viewAllLink)
          })
          .catch((error) => {
            console.error("Error fetching search results:", error)
            quickSearchDropdown.innerHTML = '<div class="quick-search-error">Error fetching results</div>'
          })
      }, 300) // 300ms debounce
    })
  
    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchForm.contains(e.target) && !quickSearchDropdown.contains(e.target)) {
        quickSearchDropdown.style.display = "none"
      }
    })
  
    // Prevent dropdown from closing when clicking inside it
    quickSearchDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
    })
  
    // Add some additional styles for loading and error states
    const style = document.createElement("style")
    style.textContent = `
      .quick-search-loading, .quick-search-no-results, .quick-search-error {
        padding: 16px;
        text-align: center;
        color: var(--text-muted);
      }
      .quick-search-error {
        color: #e73b3b;
      }
    `
    document.head.appendChild(style)
  })
  
  