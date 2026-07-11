// Multi-tag filtering with checkboxes + progressive ("load more") rendering
document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = document.querySelectorAll('.tag-checkbox');
  const clearButton = document.getElementById('clear-filters');
  const postsGrid = document.getElementById('posts-grid');
  const filterStatus = document.getElementById('filter-status');
  const loadMoreButton = document.getElementById('posts-load-more');

  if (!postsGrid) return;

  const PAGE_SIZE = 10;
  const allPosts = Array.from(postsGrid.querySelectorAll('.post-card'));
  let visibleLimit = PAGE_SIZE;

  function getSelectedTags() {
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.tag);
  }

  function matchesTags(post, selectedTags) {
    if (selectedTags.length === 0) return true;
    const postTags = post.dataset.tags ? post.dataset.tags.split(',') : [];
    return selectedTags.some(tag => postTags.includes(tag));
  }

  // Show/hide posts based on the active tag filter and how many pages have
  // been revealed so far. Does not reset visibleLimit - call updatePosts()
  // for that (e.g. when the filter selection changes).
  function render() {
    const selectedTags = getSelectedTags();
    const matching = allPosts.filter(post => matchesTags(post, selectedTags));
    const matchingIndex = new Map(matching.map((post, i) => [post, i]));

    let shownCount = 0;
    allPosts.forEach(post => {
      const index = matchingIndex.get(post);
      const isWithinLimit = index !== undefined && index < visibleLimit;

      if (isWithinLimit) {
        post.style.display = '';
        post.classList.add('fadeIn');
        shownCount++;
      } else {
        post.style.display = 'none';
        post.classList.remove('fadeIn');
      }
    });

    const totalMatching = matching.length;

    if (selectedTags.length === 0) {
      filterStatus.textContent = `Showing ${shownCount} of ${totalMatching} posts`;
    } else if (selectedTags.length === 1) {
      filterStatus.textContent = `Filtered by "${selectedTags[0]}" - showing ${shownCount} of ${totalMatching}`;
    } else {
      filterStatus.textContent = `Filtered by ${selectedTags.length} tags - showing ${shownCount} of ${totalMatching}`;
    }

    if (selectedTags.length > 0) {
      window.history.replaceState(null, '', '#tags=' + selectedTags.join(','));
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (loadMoreButton) {
      const remaining = totalMatching - shownCount;
      if (remaining > 0) {
        loadMoreButton.textContent = `Load more posts (${remaining} remaining)`;
        loadMoreButton.classList.remove('hidden');
      } else {
        loadMoreButton.classList.add('hidden');
      }
    }
  }

  // Recompute from the first page - used when the filter selection changes.
  function updatePosts() {
    visibleLimit = PAGE_SIZE;
    render();
  }

  function loadMore() {
    visibleLimit += PAGE_SIZE;
    render();
  }

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updatePosts);
  });

  if (clearButton) {
    clearButton.addEventListener('click', function() {
      checkboxes.forEach(cb => cb.checked = false);
      updatePosts();
    });
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', loadMore);

    // Auto-load as the button scrolls into view, so posts load
    // progressively while scrolling rather than requiring a click.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loadMoreButton.classList.contains('hidden')) {
            loadMore();
          }
        });
      }, { rootMargin: '300px' });
      observer.observe(loadMoreButton);
    }
  }

  // Restore filter state from the URL hash on load, then render.
  function restoreFilterState() {
    const hash = window.location.hash;
    if (hash.startsWith('#tags=')) {
      const tags = hash.replace('#tags=', '').split(',');
      checkboxes.forEach(cb => {
        if (tags.includes(cb.dataset.tag)) {
          cb.checked = true;
        }
      });
    }
    render();
  }

  restoreFilterState();
});
