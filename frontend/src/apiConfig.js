export const getApiUrl = (path) => {
  const hostname = window.location.hostname;
  // If hostname is localhost, it works for PC. 
  // If hostname is an IP, it works for mobile on same network.
  return `http://${hostname}:5000${path}`;
};
