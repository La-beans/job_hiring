document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const candidateSidebar = document.getElementById("candidateSidebar")
    const sidebarOverlay = document.getElementById("sidebarOverlay")
    const closeSidebarBtn = document.getElementById("closeSidebar")
  
    // Candidate data elements
    const candidateAvatar = document.getElementById("candidateAvatar")
    const candidateName = document.getElementById("candidateName")
    const candidatePosition = document.getElementById("candidatePosition")
    const candidateEmail = document.getElementById("candidateEmail")
    const candidatePhone = document.getElementById("candidatePhone")
    const applicationStages = document.getElementById("applicationStages")
    const candidateDocuments = document.getElementById("candidateDocuments")
    const candidateExperience = document.getElementById("candidateExperience")
  
    // Close sidebar function - make it global so it can be called from HTML
    window.closeSidebar = () => {
      candidateSidebar.classList.remove("active")
      sidebarOverlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  
    // Event listeners
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", closeSidebar)
    }
  
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", closeSidebar)
    }
  
    // Escape key to close sidebar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && candidateSidebar.classList.contains("active")) {
        closeSidebar()
      }
    })
  
    // Add click event to candidate rows
    const candidateRows = document.querySelectorAll(".candidate-row")
    candidateRows.forEach((row) => {
      row.addEventListener("click", function (e) {
        // Don't open sidebar if clicking on a button or link
        if (
          e.target.tagName === "A" ||
          e.target.tagName === "BUTTON" ||
          e.target.closest("a") ||
          e.target.closest("button")
        ) {
          return
        }
  
        const candidateId = this.getAttribute("data-id")
        if (candidateId) {
          fetchCandidateDetails(candidateId)
        }
      })
    })
  
    // Fetch candidate details - make it global so it can be called from HTML
    window.fetchCandidateDetails = (candidateId) => {
      // Show loading state
      candidateSidebar.classList.add("active")
      sidebarOverlay.classList.add("active")
      document.body.style.overflow = "hidden" // Prevent scrolling
  
      // Reset content
      candidateName.textContent = "Loading..."
      candidatePosition.textContent = ""
      candidateEmail.textContent = ""
      candidatePhone.textContent = ""
      applicationStages.innerHTML = '<div class="loading-spinner"></div>'
      candidateDocuments.innerHTML = '<div class="loading-spinner"></div>'
      candidateExperience.innerHTML = '<div class="loading-spinner"></div>'
  
      console.log(`Fetching details for candidate ID: ${candidateId}`)
  
      // Fetch data from server
      fetch(`/candidates/${candidateId}/details`)
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.message || `Server returned ${response.status}: ${response.statusText}`)
            })
          }
          return response.json()
        })
        .then((data) => {
          console.log("Received candidate data:", data)
          if (!data || Object.keys(data).length === 0) {
            throw new Error("Received empty data from server")
          }
          populateCandidateDetails(data)
        })
        .catch((error) => {
          console.error("Error fetching candidate details:", error)
          candidateName.textContent = "Error loading candidate"
          candidatePosition.textContent = ""
          candidateEmail.textContent = ""
          candidatePhone.textContent = ""
          applicationStages.innerHTML = `
           <div class="error-message">
             <p>Error loading candidate details</p>
             <p class="error-details">${error.message || "Unknown error"}</p>
             <button class="btn btn-sm btn-outline-primary mt-3" onclick="closeSidebar()">
               Close
             </button>
           </div>`
          candidateDocuments.innerHTML = ""
          candidateExperience.innerHTML = ""
        })
    }
  
    // Populate candidate details in the sidebar
    function populateCandidateDetails(data) {
      // Basic info
      candidateAvatar.src = data.avatar || "/images/avatar.png"
      candidateAvatar.alt = data.name
      candidateName.textContent = data.name
      candidatePosition.textContent = data.jobTitle
      candidateEmail.textContent = data.email
      candidatePhone.textContent = data.phone
  
      // Application stages
      const stages = [
        { name: "Screening", status: "completed", date: data.screeningDate },
        {
          name: "Design Challenge",
          status: data.stage === "Design Challenge" ? "current" : data.stage === "Screening" ? "" : "completed",
          date: data.designChallengeDate,
        },
        {
          name: "Interview",
          status:
            data.stage === "Interview"
              ? "current"
              : data.stage === "Design Challenge" || data.stage === "Screening"
                ? ""
                : "completed",
          date: data.interviewDate,
        },
        {
          name: "HR Round",
          status:
            data.stage === "HR Round"
              ? "current"
              : data.stage === "Interview" || data.stage === "Design Challenge" || data.stage === "Screening"
                ? ""
                : "completed",
          date: data.hrRoundDate,
        },
        { name: "Hired", status: data.stage === "Hired" ? "current" : "", date: data.hiredDate },
      ]
  
      applicationStages.innerHTML = ""
      stages.forEach((stage, index) => {
        const stageEl = document.createElement("div")
        stageEl.className = "stage-item"
  
        const stageNumberClass = stage.status === "completed" ? "completed" : stage.status === "current" ? "current" : ""
  
        stageEl.innerHTML = `
          <div class="stage-number ${stageNumberClass}">${index + 1}</div>
          <div class="stage-content">
            <div class="stage-name">${stage.name}</div>
            ${stage.date ? `<div class="stage-date">${formatDate(stage.date)}</div>` : ""}
          </div>
          ${stage.status === "current" ? '<div class="stage-status">Under Review</div>' : ""}
        `
  
        applicationStages.appendChild(stageEl)
      })
  
      // Documents
      candidateDocuments.innerHTML = ""
      if (data.documents && data.documents.length > 0) {
        data.documents.forEach((doc) => {
          const docEl = document.createElement("div")
          docEl.className = "document-item"
  
          docEl.innerHTML = `
            <div class="document-icon">
              <i class="fas fa-file-pdf"></i>
            </div>
            <div class="document-info">
              <div class="document-name">${doc.name}</div>
              <div class="document-meta">Uploaded on ${formatDate(doc.uploadDate)}</div>
            </div>
            <div class="document-actions">
              <a href="/documents/${doc.id}/preview" target="_blank" class="document-action-btn" title="Preview">
                <i class="fas fa-eye"></i>
              </a>
              <a href="/documents/${doc.id}/download" class="document-action-btn" title="Download">
                <i class="fas fa-download"></i>
              </a>
            </div>
          `
  
          candidateDocuments.appendChild(docEl)
        })
      } else {
        candidateDocuments.innerHTML = '<div class="no-documents">No documents available</div>'
      }
  
      // Experience
      candidateExperience.innerHTML = ""
      if (data.experience && data.experience.length > 0) {
        data.experience.forEach((exp) => {
          const expEl = document.createElement("div")
          expEl.className = "experience-item"
  
          expEl.innerHTML = `
            <div class="experience-logo">
              ${exp.logo ? `<img src="${exp.logo}" alt="${exp.company}">` : `<i class="fas fa-building"></i>`}
            </div>
            <div class="experience-content">
              <div class="experience-title">${exp.title}</div>
              <div class="experience-company">${exp.company}</div>
              <div class="experience-period">${exp.startDate} - ${exp.endDate || "Present"}</div>
            </div>
          `
  
          candidateExperience.appendChild(expEl)
        })
      } else {
        candidateExperience.innerHTML = '<div class="no-experience">No experience information available</div>'
      }
    }
  
    // Helper function to format dates
    function formatDate(dateString) {
      if (!dateString) return ""
  
      const date = new Date(dateString)
      const options = { year: "numeric", month: "short", day: "numeric" }
      return date.toLocaleDateString("en-US", options)
    }
  
    // Add error message styles if not already present
    const style = document.createElement("style")
    style.textContent = `
    .error-message {
      padding: 20px;
      text-align: center;
      color: #e74c3c;
    }
    .error-details {
      font-size: 12px;
      color: #777;
      margin-top: 8px;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      height: 100px;
    }
    .loading-spinner:after {
      content: "";
      width: 30px;
      height: 30px;
      border: 2px solid var(--border-color);
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
    document.head.appendChild(style)
  })
  
  