/**
 * SVG Sprite Loader
 * Loads external SVG sprite and injects it into the DOM for cross-browser compatibility
 */

class SVGSpriteLoader {
  constructor(spriteUrl = '/icons.svg') {
    this.spriteUrl = spriteUrl;
    this.loaded = false;
    this.loading = false;
    this.callbacks = [];
  }

  /**
   * Load the SVG sprite and inject it into the DOM
   * @returns {Promise} Promise that resolves when sprite is loaded
   */
  load() {
    if (this.loaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return new Promise(resolve => this.callbacks.push(resolve));
    }

    this.loading = true;

    return fetch(this.spriteUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load SVG sprite: ${response.status}`);
        }
        return response.text();
      })
      .then(svgContent => {
        this.injectSprite(svgContent);
        this.loaded = true;
        this.loading = false;
        
        // Resolve all pending callbacks
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
      })
      .catch(error => {
        console.error('SVG Sprite Loader Error:', error);
        this.loading = false;
        throw error;
      });
  }

  /**
   * Inject SVG sprite into the DOM
   * @param {string} svgContent The SVG content to inject
   */
  injectSprite(svgContent) {
    // Check if sprite is already injected
    if (document.querySelector('#svg-sprite-container')) {
      return;
    }

    // Create container div
    const container = document.createElement('div');
    container.id = 'svg-sprite-container';
    container.style.display = 'none';
    container.innerHTML = svgContent;

    // Insert at the beginning of body
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    } else {
      // If body isn't ready, wait for DOM to load
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(container, document.body.firstChild);
      });
    }
  }

  /**
   * Create an SVG icon element
   * @param {string} iconId The icon ID (without #)
   * @param {string} className Optional CSS class
   * @returns {SVGElement} The SVG element
   */
  createIcon(iconId, className = 'icon') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    svg.setAttribute('class', className);
    use.setAttribute('href', `#${iconId}`);
    
    svg.appendChild(use);
    return svg;
  }
}

// Create global instance
const svgSprite = new SVGSpriteLoader();

// Auto-load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => svgSprite.load());
} else {
  svgSprite.load();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SVGSpriteLoader;
}

// Global access
window.svgSprite = svgSprite;