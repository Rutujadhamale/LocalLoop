// LocalLoop: shared JavaScript for navigation, theme, search and form validation.

document.addEventListener("DOMContentLoaded", function () {
  setupThemeToggle();
  setupMobileNavigation();
  setupListingSearch();
  setupSignupValidation();
  setupScrollReveals();
  setupAnimatedCounters();
  setupMarquee();
  setupHeaderScroll();
  setupBackToTop();
});

// Change between light and dark themes when the button is clicked.
function setupThemeToggle() {
  const themeButton = document.getElementById("themeToggle");
  if (!themeButton) return;

  const savedTheme = localStorage.getItem("localloop-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀ Light mode";
  }

  themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeButton.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
    localStorage.setItem("localloop-theme", isDark ? "dark" : "light");
  });
}

// Show or hide the mobile navigation menu.
function setupMobileNavigation() {
  const menuButton = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (!menuButton || !navLinks) return;

  menuButton.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// Filter directory cards using the search box and category dropdown.
function setupListingSearch() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const listingCards = document.querySelectorAll(".listing-card");
  const resultCount = document.getElementById("resultCount");
  const emptyMessage = document.getElementById("emptyMessage");
  if (!searchInput || !categoryFilter) return;

  function filterListings() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    let visibleCount = 0;

    listingCards.forEach(function (card) {
      const cardText = card.textContent.toLowerCase();
      const matchesText = cardText.includes(searchText);
      const matchesCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
      const shouldShow = matchesText && matchesCategory;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCount++;
    });

    resultCount.textContent = "Showing " + visibleCount + " of " + listingCards.length + " local listings";
    emptyMessage.hidden = visibleCount !== 0;
  }

  // Category pills mirror the dropdown filter.
  const pills = document.querySelectorAll("#categoryPills .pill");

  function setActivePill(value) {
    pills.forEach(function (pill) {
      pill.classList.toggle("active", pill.dataset.category === value);
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      categoryFilter.value = pill.dataset.category;
      setActivePill(pill.dataset.category);
      filterListings();
    });
  });

  // input event updates the results while the user types.
  searchInput.addEventListener("input", filterListings);
  categoryFilter.addEventListener("change", function () {
    setActivePill(categoryFilter.value);
    filterListings();
  });
}

// Validate the join form and show errors on the page instead of using alerts.
function setupSignupValidation() {
  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return;

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const interest = document.getElementById("interest");
  const successMessage = document.getElementById("formSuccess");

  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    clearErrors();
    let isValid = true;

    if (fullName.value.trim() === "") {
      showError("nameError", fullName, "Please enter your full name.");
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
      showError("emailError", email, "Please enter your email address.");
      isValid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      showError("emailError", email, "Please enter a valid email address.");
      isValid = false;
    }

    if (password.value === "") {
      showError("passwordError", password, "Please enter a password.");
      isValid = false;
    } else if (password.value.length < 6) {
      showError("passwordError", password, "Password must contain at least 6 characters.");
      isValid = false;
    }

    if (interest.value === "") {
      document.getElementById("interestError").textContent = "Please choose an interest.";
      interest.classList.add("invalid");
      isValid = false;
    }

    if (isValid) {
      successMessage.textContent = "Welcome to LocalLoop, " + fullName.value.trim() + "! Your demo profile is ready.";
      signupForm.reset();
    } else {
      successMessage.textContent = "";
    }
  });

  // Clear a field's error as the user edits it.
  [fullName, email, password, interest].forEach(function (field) {
    field.addEventListener("input", function () {
      field.classList.remove("invalid");
      const errorId = field.id === "fullName" ? "nameError" :
        field.id === "email" ? "emailError" :
        field.id === "password" ? "passwordError" : "interestError";
      document.getElementById(errorId).textContent = "";
    });
    field.addEventListener("change", function () {
      field.classList.remove("invalid");
      if (field.id === "interest") document.getElementById("interestError").textContent = "";
    });
  });

  function showError(errorId, field, message) {
    document.getElementById(errorId).textContent = message;
    field.classList.add("invalid");
  }

  function clearErrors() {
    ["nameError", "emailError", "passwordError", "interestError"].forEach(function (id) {
      document.getElementById(id).textContent = "";
    });
    [fullName, email, password, interest].forEach(function (field) {
      field.classList.remove("invalid");
    });
  }
}

// Fade and slide elements into view as the user scrolls.
function setupScrollReveals() {
  const targets = document.querySelectorAll(
    ".section-heading, .category-pills, .explore-tools, .feature-card, .listing-card, .value-card, .callout, .about-layout, .join-layout, .table-section, .signup-form, .join-message"
  );
  if (targets.length === 0) return;

  targets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 0.08 + "s";
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("revealed"); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
}

// Count hero stats up from zero when they scroll into view.
function setupAnimatedCounters() {
  const stats = document.querySelectorAll(".hero-stats strong");
  if (stats.length === 0) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      const match = el.textContent.match(/(\d+)/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = el.textContent.replace(match[0], "");
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  stats.forEach(function (el) { observer.observe(el); });
}

// Duplicate marquee items so the scrolling loop is seamless.
function setupMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  const items = Array.from(track.children);
  items.forEach(function (item) {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
}

// Add a subtle shadow to the header once the page is scrolled.
function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Show a floating button that scrolls back to the top.
function setupBackToTop() {
  const button = document.createElement("button");
  button.className = "to-top";
  button.type = "button";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  document.body.appendChild(button);

  window.addEventListener("scroll", function () {
    button.classList.toggle("show", window.scrollY > 500);
  }, { passive: true });

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
