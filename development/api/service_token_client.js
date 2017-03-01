"use strict";

/*
  Use it like $.ajax(...)

  Create one instance of the service token client. This is important,
  because the client deletes all "old" cookies initially.
  window.app.services.serviceTokenClient = new ServiceTokenClient();

  window.app.services.serviceTokenClient.authorizedRequest({
    url: "/api/awesome-api-with-token-auth",
    dataType: 'json'
  }).done(function(res) {
    // ...
  }}).fail(function(err) {
    // ..
  }).always(function() {
    // ..
  });
*/
class ServiceTokenClient {

  constructor(options={}) {
    this.cleanupStorage();
    this.config = {
      bimaLegacyLoginSupport: false
    };
    if (options.bimaLegacyLoginSupport) {
      this.config.bimaLegacyLoginSupport = true;
    }
  }

  authorizedRequest (settings={}) {
    let self = this;
    let token = self.getServiceToken();

    if (this.config.bimaLegacyLoginSupport) {
      settings.xhrFields = {
        withCredentials: true
      };
    }

    if (!token) {
      return self.requestServiceToken().then(function(response) {
        return self.request(settings, response.attributes.jwt);
      });
    } else {
      return self.request(settings, token.jwt);
    }
  }

  request(settings, jwt) {
    let settingsExtensions = {
      headers: {
        "Authorization": "Bearer " + jwt
      }
    };
    return $.ajax($.extend(settings, settingsExtensions));
  }

  requestServiceToken() {
    let session = window.app.settings.serviceDesk.session;
    return $.ajax({
        url: session.doorkeeper.service_token_url, //"/doorkeeper/service_token",
        type: "GET"
    }).done(function(response) {
      let data = JSON.stringify(response.attributes);
      window.sessionStorage.setItem("service_token", data);
    });
  }

  getServiceToken() {
    let token = null;
    token = JSON.parse(window.sessionStorage.getItem("service_token"));

    if (token && token.expires_at) {
      let now = new Date();
      let date = new Date(token.expires_at);
      if (date < now) {
        token = null;
        this.cleanupStorage();
      }
    }
    return token;
  }

  cleanupStorage() {
    window.sessionStorage.removeItem("service_token");
  }

}

module.exports = ServiceTokenClient;
