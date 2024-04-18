// utils.js
function timeElapsed(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();
    const elapsed = now - date;
  
    if (elapsed < 60000) {
      return `${Math.floor(elapsed / 1000)} seconds ago`;
    } else if (elapsed < 3600000) {
      return `${Math.floor(elapsed / 60000)} minutes ago`;
    } else if (elapsed < 86400000) {
      return `${Math.floor(elapsed / 3600000)} hours ago`;
    } else if (elapsed < 604800000) {
      return `${Math.floor(elapsed / 86400000)} days ago`;
    } else if (elapsed < 2419200000) {
      return `${Math.floor(elapsed / 604800000)} weeks ago`;
    } else {
      return `${Math.floor(elapsed / 2419200000)} months ago`;
    }
  }
  
  module.exports = {
    timeElapsed
  };
  