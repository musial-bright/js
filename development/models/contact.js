"use strict";

import moment from "node_modules/moment/moment.js";
import ObjectHash from "object-hash";

class Contact {

  constructor(data, description) {
    this.data = data;
    this.description = description;
    this.queryChecksum = ObjectHash(this.data);
  }

  setDescription(description) {
    this.description = description;
  }

  getId() {
    if (!this.data) { return; }
    let id = this.data.id;
    if (id) { id = id.toString(); }
    return id;
  }

  getAttr(name) {
    if (!this.data || !this.data.attributes) { return; }
    return this.data.attributes[name];
  }

  setAttr(name, value) {
    this.data.attributes[name] = value;
  }

  setData(data) {
    this.data = data;
    this.updateChecksum();
  }

  getData() {
    return this.data;
  }

  getEditableAttrs() {
    return [
      "gender", "name_prefix", "first_name", "last_name",
      "phone", "mobile_phone", "fax", "job_title",
      "custom_street", "custom_street_number", "postalcode", "locality"
    ];
  }

  getVisibleAttributes() {
    let visible = this.getEditableAttrs();
    visible.unshift("email");
    return visible;
  }

  getName() {
    return `${this.getAttr("first_name")} ${this.getAttr("last_name")}`;
  }

  getDateAttr(attr) {
    let value = this.getAttr(attr);
    if (!$.isEmptyObject(value)) {
      return moment(value).format("DD.MM.YYYY HH:mm");
    }
  }

  isValid() {
    let self = this;
    let complete = true;
    // mandotory fields completed?
    $.each(this.data.attributes, function(attr, value) {
      if (self.isMandatory(attr) && $.isEmptyObject(self.getAttr(attr))) {
        complete = false;
      }
    });
    return complete;
  }

  isEdited() {
    return this.queryChecksum !== ObjectHash(this.data);
  }

  isMandatory(attr) {
    if (!this.description) { return; }
    let mandatory = false;
    if (this.description.attrs[attr]) {
      mandatory = this.description.attrs[attr].mandatory;
    }
    return mandatory;
  }

  updateChecksum() {
    this.queryChecksum = ObjectHash(this.data);
  }

}

module.exports = Contact;
