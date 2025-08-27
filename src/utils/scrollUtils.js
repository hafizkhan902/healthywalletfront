// 🎯 Smooth Scroll Utilities for Better UX

/**
 * Smoothly scroll to an element with enhanced options
 * @param {string|HTMLElement} target - CSS selector or DOM element
 * @param {Object} options - Scroll options
 */
export const smoothScrollTo = (target, options = {}) => {
  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0,
    delay = 100
  } = options;

  // Add a small delay to ensure DOM is ready
  setTimeout(() => {
    let element;
    
    if (typeof target === 'string') {
      element = document.querySelector(target);
    } else {
      element = target;
    }

    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition + offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: behavior
      });

      // Alternative method for better browser support
      if (!window.scrollTo || behavior === 'smooth') {
        element.scrollIntoView({
          behavior: behavior,
          block: block,
          inline: inline
        });
      }

      // Focus on first input if it's a form
      const firstInput = element.querySelector('input, select, textarea');
      if (firstInput && !firstInput.disabled) {
        setTimeout(() => {
          firstInput.focus();
        }, 300); // Wait for scroll animation to complete
      }
    } else {
      console.warn('ScrollUtils: Element not found:', target);
    }
  }, delay);
};

/**
 * Scroll to form section with form-specific optimizations
 * @param {string} formSelector - CSS selector for the form container
 * @param {Object} options - Additional options
 */
export const scrollToForm = (formSelector, options = {}) => {
  const defaultOptions = {
    behavior: 'smooth',
    block: 'center', // Center the form in viewport for better visibility
    offset: -20, // Small offset from top
    delay: 150 // Slightly longer delay for form rendering
  };

  smoothScrollTo(formSelector, { ...defaultOptions, ...options });
};

/**
 * Scroll to top of page
 */
export const scrollToTop = (options = {}) => {
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start'
  };

  window.scrollTo({
    top: 0,
    ...defaultOptions,
    ...options
  });
};

/**
 * Scroll to bottom of page
 */
export const scrollToBottom = (options = {}) => {
  const defaultOptions = {
    behavior: 'smooth'
  };

  window.scrollTo({
    top: document.body.scrollHeight,
    ...defaultOptions,
    ...options
  });
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
export const isInViewport = (element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll with animation fallback for older browsers
 * @param {number} targetY - Target Y position
 * @param {number} duration - Animation duration in ms
 */
export const animatedScrollTo = (targetY, duration = 500) => {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = Date.now();

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const scroll = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);
    
    window.scrollTo(0, startY + (distance * ease));
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  };

  // Use native smooth scroll if available, otherwise use custom animation
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  } else {
    requestAnimationFrame(scroll);
  }
};

export default {
  smoothScrollTo,
  scrollToForm,
  scrollToTop,
  scrollToBottom,
  isInViewport,
  animatedScrollTo
};
