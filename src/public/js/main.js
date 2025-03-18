document.addEventListener("DOMContentLoaded", () => {
  // Toggle dark mode based on system preference
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  function setTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-theme")
    } else {
      document.body.classList.remove("dark-theme")
    }
  }

  // Initial setting
  setTheme(prefersDarkScheme.matches)

  // Listen for changes
  prefersDarkScheme.addEventListener("change", (e) => {
    setTheme(e.matches)
  })

  // Settings button functionality
  const toggleDarkMode = document.getElementById("toggleDarkMode")
  if (toggleDarkMode) {
    toggleDarkMode.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme")
    })
  }

  // Job card actions
  document.querySelectorAll(".job-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Only navigate if the click is not on an action button
      if (!e.target.closest(".job-actions")) {
        const href = this.getAttribute("href")
        if (href) {
          window.location.href = href
        }
      }
    })
  })

  // Make candidate rows clickable
  document.querySelectorAll(".candidate-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      // Don't trigger if clicking on a button or link
      if (
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON" ||
        e.target.closest("a") ||
        e.target.closest("button")
      ) {
        return
      }

      const viewLink = row.querySelector('a[href^="/candidates/"]')
      if (viewLink) {
        window.location.href = viewLink.getAttribute("href")
      }
    })
  })
})

