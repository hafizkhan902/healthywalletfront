// 🧪 Scroll Functionality Demo & Testing Utility

import { scrollToForm, smoothScrollTo } from './scrollUtils';

/**
 * Demo function to test scroll functionality
 * Call this from browser console: window.testScrollDemo()
 */
export const testScrollDemo = () => {
  // console.log('🧪 Testing Scroll Functionality...');
  
  // Test 1: Scroll to form sections
  // console.log('📍 Test 1: Scrolling to form sections');
  
  const formSelectors = [
    '.quick-add-section',
    '.modal-overlay',
    '.goal-form',
    '.expense-form',
    '.income-form'
  ];
  
  formSelectors.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      // console.log(`✅ Found ${selector}`);
      
      // Test scroll after delay
      setTimeout(() => {
        scrollToForm(selector, {
          block: 'center',
          offset: -50
        });
        // console.log(`📍 Scrolled to ${selector}`);
      }, index * 2000);
    } else {
      // console.log(`❌ Not found: ${selector}`);
    }
  });
};

/**
 * Test smooth scroll to different positions
 */
export const testScrollPositions = () => {
  // console.log('🧪 Testing Scroll Positions...');
  
  const tests = [
    { name: 'Top of page', target: 'body', offset: 0 },
    { name: 'Middle of page', target: 'main', offset: -100 },
    { name: 'Bottom of page', target: 'footer', offset: 0 }
  ];
  
  tests.forEach((test, index) => {
    setTimeout(() => {
      const element = document.querySelector(test.target);
      if (element) {
        smoothScrollTo(element, {
          block: 'start',
          offset: test.offset
        });
        // console.log(`📍 Scrolled to ${test.name}`);
      }
    }, index * 3000);
  });
};

/**
 * Add scroll demo to window for easy testing
 */
export const addScrollDemoToWindow = () => {
  if (typeof window !== 'undefined') {
    window.testScrollDemo = testScrollDemo;
    window.testScrollPositions = testScrollPositions;
    
    // console.log('🧪 Scroll demo functions added to window:');
    // console.log('   - window.testScrollDemo()');
    // console.log('   - window.testScrollPositions()');
  }
};

// Auto-add to window in development
if (process.env.NODE_ENV === 'development') {
  addScrollDemoToWindow();
}

const scrollDemo = {
  testScrollDemo,
  testScrollPositions,
  addScrollDemoToWindow
};

export default scrollDemo;
