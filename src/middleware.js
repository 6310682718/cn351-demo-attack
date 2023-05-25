// Middleware function example
const middleware = (req, res, next) => {
  // Perform middleware tasks
  console.log("Middleware function executed");
  res.session = req.session;
  // Call the next function to move to the next middleware or route handler
  next();
};

function isAuthenticated(req, res, next) {
  // Check if the user is authenticated
  console.log("-- check is authenticated --");
  if (req.session.authenticated) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  }
  console.log("-- try to redirect --");

  // User is not authenticated, redirect or send an error response
  res.redirect("/login"); // Example: Redirect to login page
}

export default {
  middleware,
  isAuthenticated,
};
