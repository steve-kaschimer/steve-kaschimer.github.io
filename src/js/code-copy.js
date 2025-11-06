// Add copy button to code blocks
document.addEventListener('DOMContentLoaded', function() {
  // Find all pre elements in prose content
  const codeBlocks = document.querySelectorAll('.prose pre');
  
  codeBlocks.forEach(function(pre) {
    // Create wrapper div for positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    
    // Wrap the pre element
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    
    // Get language from code element class (e.g., "language-yaml")
    const codeElement = pre.querySelector('code');
    let language = 'code';
    if (codeElement && codeElement.className) {
      const match = codeElement.className.match(/language-(\w+)/);
      if (match) {
        language = match[1].toUpperCase();
      }
    }
    
    // Create language label
    const languageLabel = document.createElement('span');
    languageLabel.className = 'code-language-label';
    languageLabel.textContent = language;
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.innerHTML = `
      <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-text">Copy</span>
    `;
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    
    // Insert language label and button before pre element
    wrapper.insertBefore(languageLabel, pre);
    wrapper.insertBefore(copyButton, pre);
    
    // Add click handler
    copyButton.addEventListener('click', async function() {
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;
      
      try {
        await navigator.clipboard.writeText(text);
        
        // Update button to show success
        copyButton.innerHTML = `
          <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="copy-text">Copied!</span>
        `;
        copyButton.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(function() {
          copyButton.innerHTML = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="copy-text">Copy</span>
          `;
          copyButton.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        copyButton.innerHTML = `
          <span class="copy-text">Failed</span>
        `;
        setTimeout(function() {
          copyButton.innerHTML = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="copy-text">Copy</span>
          `;
        }, 2000);
      }
    });
  });
});
