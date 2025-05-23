(function() {
  // In production replace the hard-coded ID with a value injected securely
  var googleTagID = "G-ZVG3WZK5H9";
  
  // Create the script element asynchronously
  var script = document.createElement('script');
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + googleTagID;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', googleTagID);
})();
