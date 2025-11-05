// Theme toggle functionality
(function() {
  const storageKey = 'theme-preference';

  const getColorPreference = () => {
    if (localStorage.getItem(storageKey)) {
      return localStorage.getItem(storageKey);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setPreference = (theme) => {
    localStorage.setItem(storageKey, theme);
    reflectPreference(theme);
  };

  const reflectPreference = (theme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme);
    }
  };

  // Set initial theme
  const theme = getColorPreference();
  reflectPreference(theme);

  // Setup toggle functionality when DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem(storageKey) || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setPreference(newTheme);
      });
    }
  });

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === storageKey) {
      reflectPreference(e.newValue);
    }
  });
})();
