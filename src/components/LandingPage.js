import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onExplore }) => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="brand-section">
            <div className="app-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="m16 8 2 2-4 4-2-2"></path>
                <path d="m21 15-3-3 3-3"></path>
              </svg>
            </div>
            <div className="brand-info">
              <h1 className="app-title">HealthyWallet</h1>
              <span className="app-subtitle">Financial Management</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="landing-container">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                Take Control of Your
                <span className="hero-highlight"> Financial Future</span>
              </h1>
              <p className="hero-description">
                HealthyWallet helps you track expenses, manage income, set financial goals, 
                and make smarter money decisions with AI-powered insights.
              </p>
              
              <div className="hero-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                  </div>
                  <span>Track Income & Expenses</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                  </div>
                  <span>Set & Achieve Goals</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
                      <path d="M12 6l-4 4 4 4 4-4-4-4z"></path>
                    </svg>
                  </div>
                  <span>AI-Powered Insights</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <span>Detailed Reports</span>
                </div>
              </div>

              <div className="hero-actions">
                <button className="explore-btn" onClick={onExplore}>
                  <span>Explore HealthyWallet</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="preview-title">HealthyWallet Dashboard</span>
                </div>
                <div className="preview-content">
                  <div className="preview-balance">
                    <span className="preview-label">Total Balance</span>
                    <span className="preview-amount">$2,179.50</span>
                  </div>
                  <div className="preview-cards">
                    <div className="preview-card income">
                      <div className="card-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      </div>
                      <div className="card-info">
                        <span className="card-label">Income</span>
                        <span className="card-value">$5,420</span>
                      </div>
                    </div>
                    <div className="preview-card expense">
                      <div className="card-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                          <polyline points="17 18 23 18 23 12"></polyline>
                        </svg>
                      </div>
                      <div className="card-info">
                        <span className="card-label">Expenses</span>
                        <span className="card-value">$3,240</span>
                      </div>
                    </div>
                  </div>
                  <div className="preview-ai">
                    <div className="ai-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
                      </svg>
                      <span>AI Insights</span>
                    </div>
                    <span className="ai-text">Your savings rate is excellent! Consider...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Video Section */}
          <section className="demo-video-section">
            <h2 className="section-title">See HealthyWallet in Action</h2>
            <p className="section-description">
              Watch how easy it is to manage your finances with our intuitive interface and powerful features.
            </p>
            <div className="video-container">
              <div className="video-placeholder">
                <div className="video-overlay">
                  <button className="play-button" onClick={() => alert('Demo video coming soon! Experience the live demo by clicking Explore below.')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
                    </svg>
                  </button>
                  <div className="video-info">
                    <span className="video-duration">2:30</span>
                    <span className="video-title">HealthyWallet Demo</span>
                  </div>
                </div>
                <div className="video-thumbnail">
                  <div className="thumbnail-content">
                    <div className="mock-interface">
                      <div className="mock-header">
                        <div className="mock-logo"></div>
                        <div className="mock-nav">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                      <div className="mock-dashboard">
                        <div className="mock-balance">$2,179.50</div>
                        <div className="mock-cards">
                          <div className="mock-card green"></div>
                          <div className="mock-card red"></div>
                        </div>
                        <div className="mock-chart"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Snippets Section */}
          <section className="platform-snippets-section">
            <h2 className="section-title">Powerful Features at Your Fingertips</h2>
            <div className="snippets-grid">
              <div className="snippet-card">
                <div className="snippet-header">
                  <div className="snippet-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
                      <path d="M12 6l-4 4 4 4 4-4-4-4z"></path>
                    </svg>
                  </div>
                  <h3 className="snippet-title">AI Smart Insights</h3>
                </div>
                <div className="snippet-preview">
                  <div className="ai-insight-demo">
                    <div className="ai-badge-demo">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
                      </svg>
                      <span>AI Insights</span>
                    </div>
                    <div className="insight-content-demo">
                      <h4>Excellent Savings Performance</h4>
                      <p>You're saving 32% of your income! Consider investing surplus funds...</p>
                      <button className="insight-action-demo">Explore Goals →</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="snippet-card">
                <div className="snippet-header">
                  <div className="snippet-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <h3 className="snippet-title">Visual Reports</h3>
                </div>
                <div className="snippet-preview">
                  <div className="chart-demo">
                    <div className="chart-bars">
                      <div className="bar" style={{height: '60%'}}></div>
                      <div className="bar" style={{height: '80%'}}></div>
                      <div className="bar" style={{height: '45%'}}></div>
                      <div className="bar" style={{height: '90%'}}></div>
                      <div className="bar" style={{height: '70%'}}></div>
                    </div>
                    <div className="chart-labels">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="snippet-card">
                <div className="snippet-header">
                  <div className="snippet-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                  </div>
                  <h3 className="snippet-title">Goal Tracking</h3>
                </div>
                <div className="snippet-preview">
                  <div className="goal-demo">
                    <div className="goal-header-demo">
                      <span className="goal-name-demo">Emergency Fund</span>
                      <span className="goal-progress-demo">65%</span>
                    </div>
                    <div className="progress-bar-demo">
                      <div className="progress-fill-demo" style={{width: '65%'}}></div>
                    </div>
                    <div className="goal-amounts-demo">
                      <span>$6,500</span>
                      <span>$10,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section className="reviews-section">
            <h2 className="section-title">Trusted by Thousands of Users</h2>
            <p className="section-description">
              Join our community of financially empowered users who have transformed their money management.
            </p>
            <div className="reviews-grid">
              <div className="review-card">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                  ))}
                </div>
                <blockquote className="review-text">
                  "HealthyWallet completely changed how I manage my finances. The AI insights helped me identify spending patterns I never noticed before. I've saved over $3,000 in just 6 months!"
                </blockquote>
                <div className="review-author">
                  <div className="author-avatar">
                    <span>SM</span>
                  </div>
                  <div className="author-info">
                    <span className="author-name">Sarah Mitchell</span>
                    <span className="author-title">Marketing Manager</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                  ))}
                </div>
                <blockquote className="review-text">
                  "As a freelancer, tracking multiple income sources was always chaotic. HealthyWallet's categorization and reporting features gave me the clarity I needed to grow my business."
                </blockquote>
                <div className="review-author">
                  <div className="author-avatar">
                    <span>DJ</span>
                  </div>
                  <div className="author-info">
                    <span className="author-name">David Johnson</span>
                    <span className="author-title">Freelance Developer</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                  ))}
                </div>
                <blockquote className="review-text">
                  "The goal tracking feature is phenomenal! I reached my vacation savings target 2 months early thanks to the smart recommendations and progress visualization."
                </blockquote>
                <div className="review-author">
                  <div className="author-avatar">
                    <span>EC</span>
                  </div>
                  <div className="author-info">
                    <span className="author-name">Emily Chen</span>
                    <span className="author-title">Teacher</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-stat">
                <span className="trust-number">15K+</span>
                <span className="trust-label">Active Users</span>
              </div>
              <div className="trust-stat">
                <span className="trust-number">4.9</span>
                <span className="trust-label">Average Rating</span>
              </div>
              <div className="trust-stat">
                <span className="trust-number">$2M+</span>
                <span className="trust-label">Money Saved</span>
              </div>
              <div className="trust-stat">
                <span className="trust-number">99.9%</span>
                <span className="trust-label">Uptime</span>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="benefits-section">
            <h2 className="section-title">Why Choose HealthyWallet?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1l3 6 6 .75-4.5 4.5L18 19l-6-3-6 3 1.5-6.75L3 7.75 9 7z"></path>
                  </svg>
                </div>
                <h3 className="benefit-title">Simple & Intuitive</h3>
                <p className="benefit-description">
                  Clean, professional interface designed for easy financial management without complexity.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="m9 16 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="benefit-title">Goal Tracking</h3>
                <p className="benefit-description">
                  Set financial goals and track your progress with visual indicators and milestone celebrations.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                </div>
                <h3 className="benefit-title">Secure & Private</h3>
                <p className="benefit-description">
                  Your financial data stays secure with local storage and privacy-focused design principles.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="app-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <path d="m16 8 2 2-4 4-2-2"></path>
                  <path d="m21 15-3-3 3-3"></path>
                </svg>
              </div>
              <span className="footer-text">© 2024 HealthyWallet. Manage your finances wisely.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;