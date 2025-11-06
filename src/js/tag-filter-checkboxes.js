// Multi-tag filtering with checkboxes
document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = document.querySelectorAll('.tag-checkbox');
  const clearButton = document.getElementById('clear-filters');
  const postsGrid = document.getElementById('posts-grid');
  const filterStatus = document.getElementById('filter-status');

  if (!postsGrid) return;

  // Update the display based on selected tags
  function updatePosts() {
    const selectedTags = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.tag);

    const posts = postsGrid.querySelectorAll('.post-card');
    let visibleCount = 0;

    posts.forEach(post => {
      const postTags = post.dataset.tags ? post.dataset.tags.split(',') : [];

      // Show post if it has ANY of the selected tags (OR logic)
      // Or if no tags are selected, show all posts
      let shouldShow = selectedTags.length === 0;

      if (selectedTags.length > 0) {
        shouldShow = selectedTags.some(tag => postTags.includes(tag));
      }

      if (shouldShow) {
        post.style.display = '';
        post.classList.add('fadeIn');
        visibleCount++;
      } else {
        post.style.display = 'none';
        post.classList.remove('fadeIn');
      }
    });

    // Update filter status message
    if (selectedTags.length === 0) {
      filterStatus.textContent = `Showing all ${visibleCount} posts`;
    } else if (selectedTags.length === 1) {
      filterStatus.textContent = `Filtered by "${selectedTags[0]}" (${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'})`;
    } else {
      filterStatus.textContent = `Filtered by ${selectedTags.length} tags (${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'})`;
    }

    // Update URL hash with selected tags
    if (selectedTags.length > 0) {
      window.history.replaceState(null, '', '#tags=' + selectedTags.join(','));
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  // Add event listeners to all checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updatePosts);
  });

  // Clear all filters button
  if (clearButton) {
    clearButton.addEventListener('click', function() {
      checkboxes.forEach(cb => cb.checked = false);
      updatePosts();
    });
  }

  // Handle URL hash on load (restore filter state)
  function restoreFilterState() {
    const hash = window.location.hash;
    if (hash.startsWith('#tags=')) {
      const tags = hash.replace('#tags=', '').split(',');
      checkboxes.forEach(cb => {
        if (tags.includes(cb.dataset.tag)) {
          cb.checked = true;
        }
      });
      updatePosts();
    } else {
      // Show initial count
      const totalPosts = postsGrid.querySelectorAll('.post-card').length;
      filterStatus.textContent = `Showing all ${totalPosts} posts`;
    }
  }

  restoreFilterState();
});
