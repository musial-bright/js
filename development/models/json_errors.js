"use strict";

/*
  Usage example:
  onChangePasswordFailed: function(err) {
    this.state.json_errors = new JsonErrors(err, "profile.security.attr");
    // ...
    NotificationActions.addGlobalError(this.state.json_errors.messages);
  }
*/
class JsonErrors {

  // json data example:
  //   [{ detail: "", source: { pointer: "/data/attributes/email" }}]
  constructor(data, localizer="") {
    this.data = data || [];
    this.localizer = localizer;

    this.errors = {};
    this.messages = [];
    this.parse();
    this.interpret();
  }

  parse() {
    if (!this.data.responseJSON) { return; }
    let errors = this.data.responseJSON.errors || [];
    errors.forEach(error => {
      let attr = error.source.pointer.split("/").pop();
      if (!this.errors[attr]) { this.errors[attr] = []; }
      let message = I18n.t(this.localizer + "." + attr) + " " + error.detail;
      this.errors[attr].push(message);
      this.messages.push(message);
    });
  }

  interpret() {
    switch (this.data.status) {
      case 0:
        this.messages.push(I18n.t("errors.service_not_available"));
        break;
      case 401:
        this.messages.push(I18n.t("errors.not_authorized"));
        break;
      case 404:
        this.messages.push(I18n.t("errors.not_found"));
        break;
    default:
    }
  }

  getErrors() {
    return this.errors;
  }

  getMessages() {
    return this.messages;
  }

}

module.exports = JsonErrors;
