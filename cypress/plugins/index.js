const { GoogleSocialLogin } = require('cypress-social-logins').plugins;

module.exports = (on, config) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin,
  });
};
