/**
 * Tag filtering for blog posts
 */
document.addEventListener('DOMContentLoaded', function() {
  const tagButtons = document.querySelectorAll('.tag-filter');
  const postCards = document.querySelectorAll('.post-card');

  if (!tagButtons.length || !postCards.length) return;

  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      const selectedTag = this.getAttribute('data-tag');

      // Update active button state
      tagButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary-600', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
      });

      this.classList.add('active', 'bg-primary-600', 'text-white');
      this.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');

      // Filter posts
      postCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags');

        if (selectedTag === 'all') {
          // Show all posts
          card.style.display = '';
          // Add fade-in animation
          card.style.animation = 'fadeIn 0.3s ease-in';
        } else if (cardTags && cardTags.includes(selectedTag)) {
          // Show matching posts
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease-in';
        } else {
          // Hide non-matching posts
          card.style.display = 'none';
        }
      });

      // Update URL hash (optional, for shareable filtered views)
      if (selectedTag === 'all') {
        history.replaceState(null, null, window.location.pathname);
      } else {
        history.replaceState(null, null, '#tag-' + selectedTag);
      }
    });
  });

  // Check URL hash on load and apply filter
  const hash = window.location.hash;
  if (hash && hash.startsWith('#tag-')) {
    const tagFromUrl = hash.substring(5); // Remove '#tag-' prefix
    const matchingButton = document.querySelector(`[data-tag="${tagFromUrl}"]`);
    if (matchingButton) {
      matchingButton.click();
    }
  }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
