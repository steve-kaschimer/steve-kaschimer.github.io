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

    // Create header bar
    const headerBar = document.createElement('div');
    headerBar.className = 'code-header';

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

    // Add language label and copy button to header
    headerBar.appendChild(languageLabel);
    headerBar.appendChild(copyButton);

    // Insert header at the top of wrapper
    wrapper.insertBefore(headerBar, pre);

    // Create content container for line numbers and code
    const contentContainer = document.createElement('div');
    contentContainer.className = 'code-content';

    // Move pre into content container
    wrapper.removeChild(pre);
    contentContainer.appendChild(pre);
    wrapper.appendChild(contentContainer);

    // Add line numbers
    const code = pre.querySelector('code');
    if (code) {
      const text = code.textContent;
      const lines = text.split('\n');

      // Don't remove trailing newline - count all lines including last empty one
      const lineCount = lines.length;

      // Create line numbers container
      const lineNumbers = document.createElement('div');
      lineNumbers.className = 'line-numbers';
      lineNumbers.setAttribute('aria-hidden', 'true');

      // Add line numbers
      for (let i = 1; i <= lineCount; i++) {
        const lineNumber = document.createElement('span');
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
      }

      // Insert line numbers before pre in content container
      contentContainer.insertBefore(lineNumbers, pre);
    }

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
