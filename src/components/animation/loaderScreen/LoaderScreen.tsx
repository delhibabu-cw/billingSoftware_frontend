import "./LoaderPage.css"; // Import the CSS file

const LoaderScreen = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <span className="loaderPage"></span>
      </div>
    </div>
  );
};

export default LoaderScreen;
