const createNotFoundView = () => {
  return `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" class="back-home">Back to Home</a>
    </div>
  `;
};

export default createNotFoundView;