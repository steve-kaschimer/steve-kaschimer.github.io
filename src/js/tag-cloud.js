// Tag Cloud using d3-cloud (loaded via CDN)
document.addEventListener('DOMContentLoaded', function() {
  const tagCloudContainer = document.getElementById('tag-cloud');
  if (!tagCloudContainer || typeof d3 === 'undefined' || typeof d3.layout === 'undefined') return;

  // Get tag data from data attributes
  const tagData = JSON.parse(tagCloudContainer.dataset.tags || '[]');
  
  if (tagData.length === 0) return;

  // Set up dimensions
  const width = tagCloudContainer.offsetWidth || 300;
  const height = 350;

  // Adjust sizing based on available width
  // If narrow (sidebar), use smaller sizes; if wide (bottom), use larger sizes
  const isNarrow = width < 500; // Threshold for sidebar vs full-width
  const baseSize = isNarrow ? 12 : 20;
  const countMultiplier = isNarrow ? 4 : 8;

  // Create word cloud layout
  const layout = d3.layout.cloud()
    .size([width, height])
    .words(tagData.map(d => ({
      text: `${d.tag} (${d.count})`,
      tag: d.tag, // Keep original tag for filtering
      count: d.count,
      size: baseSize + (d.count * countMultiplier) // Dynamic sizing based on width
    })))
    .padding(5)
    .rotate(() => 0) // No rotation for cleaner look
    .fontSize(d => d.size)
    .on('end', draw);

  layout.start();

  function draw(words) {
    // Clear any existing SVG
    d3.select('#tag-cloud').selectAll('*').remove();

    const svg = d3.select('#tag-cloud')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'tag-cloud-svg');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const tags = g.selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('font-family', 'inherit')
      .style('font-weight', '500')
      .style('cursor', 'pointer')
      .attr('class', 'tag-cloud-item tag-filter')
      .attr('data-tag', d => d.tag) // Use original tag for filtering
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .text(d => d.text); // Display with count

    // Add event listeners
    tags.on('click', function(event, d) {
      const tag = d.tag; // Use original tag for filtering
      
      // Update active state
      document.querySelectorAll('.tag-filter').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // Filter posts
      const postsGrid = document.getElementById('posts-grid');
      const posts = postsGrid.querySelectorAll('.post-card');

      posts.forEach(post => {
        const postTags = post.dataset.tags ? post.dataset.tags.split(',') : [];
        if (tag === 'all' || postTags.includes(tag)) {
          post.style.display = '';
          post.classList.add('fadeIn');
        } else {
          post.style.display = 'none';
          post.classList.remove('fadeIn');
        }
      });

      // Update URL hash
      window.location.hash = tag === 'all' ? '' : `tag-${tag}`;
    });

    // Add hover effect
    tags.on('mouseover', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .style('opacity', 0.7)
        .attr('transform', function(d) {
          return `translate(${d.x},${d.y}) scale(1.2)`;
        });
    });

    tags.on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .style('opacity', 1)
        .attr('transform', function(d) {
          return `translate(${d.x},${d.y}) scale(1)`;
        });
    });

    // Set colors based on theme
    updateTagColors();
  }

  // Update colors based on dark/light mode
  function updateTagColors() {
    const isDark = document.documentElement.classList.contains('dark');
    const tags = document.querySelectorAll('.tag-cloud-item');
    
    // Define color palette from theme
    const lightColors = [
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#06b6d4', // cyan-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#ec4899', // pink-500
    ];
    
    const darkColors = [
      '#60a5fa', // blue-400
      '#a78bfa', // violet-400
      '#22d3ee', // cyan-400
      '#34d399', // emerald-400
      '#fbbf24', // amber-400
      '#f87171', // red-400
      '#f472b6', // pink-400
    ];
    
    const colors = isDark ? darkColors : lightColors;
    
    tags.forEach((tag, index) => {
      const isActive = tag.classList.contains('active');
      if (isActive) {
        tag.style.fill = isDark ? '#60a5fa' : '#3b82f6'; // primary blue
        tag.style.fontWeight = '700';
      } else {
        // Cycle through colors
        tag.style.fill = colors[index % colors.length];
        tag.style.fontWeight = '500';
      }
    });
  }

  // Listen for theme changes
  const observer = new MutationObserver(updateTagColors);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Handle URL hash on load
  if (window.location.hash.startsWith('#tag-')) {
    const tag = window.location.hash.replace('#tag-', '');
    const tagElement = document.querySelector(`[data-tag="${tag}"]`);
    if (tagElement) {
      tagElement.click();
    }
  }

  // "All Posts" button handler
  const allButton = document.querySelector('[data-tag="all"]:not(.tag-cloud-item)');
  if (allButton) {
    allButton.addEventListener('click', function() {
      // Remove active from cloud tags
      document.querySelectorAll('.tag-cloud-item').forEach(t => t.classList.remove('active'));
      
      // Show all posts
      const posts = document.querySelectorAll('.post-card');
      posts.forEach(post => {
        post.style.display = '';
        post.classList.add('fadeIn');
      });
      
      window.location.hash = '';
    });
  }
});
