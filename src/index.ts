const axios = require('axios');
const qs = require('querystring');
const util = require('util');


const nl = '\n';

function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
  return propertyNames.map((n) => o[n]);
}

interface Axios {
  method: string,
  url: string,
  headers: object,
  data?: string
}


interface Address {
  line1: string,
  line2?: string,
  city: string,
  state: string,
  zipCode: string,
  country?: string,
  type?: string
}

interface Card {
  number: string,
  action: string
}

interface Device {
  id: string,
  action: string
}

interface Email {
  address: string,
  action?: string
}


enum Actions {
  approve = 'A',
  decline = 'D',
  delete  = 'X',
  review  = 'R'
}

enum AddressTypes {
  get_billing      = 'ba',
  get_shipping     = 'sa',
  decline_billing  = 'd_ba[]',
  decline_shipping = 'd_sa[]',
  delete_billing   = 'x_ba[]',
  delete_shipping  = 'x_sa[]',
  review_billing   = 'r_ba[]',
  review_shipping  = 'r_sa[]'
}

class KountVip {
  apiKey: string;
  baseUrl: string;

  addresses: Array<Address>;
  cards: Array<Card>;
  devices: Array<Device>;
  emails: Array<Email>;


  /**
   * @param {string} apiKey
   * @constructor
   */
  constructor(apiKey: string, test: boolean = false) {
    if (!apiKey) throw new Error('Kount API Key Missing.');
    this.baseUrl = (test === true) ? 'https://api.test.kount.net/rpc/v1/vip/' : 'https://api.kount.net/rpc/v1/vip/';

    // Grab info out of config
    this.apiKey = apiKey;
    this.addresses = [];
    this.cards = [];
    this.devices = [];
    this.emails = [];
  }

  async getShippingAddress(address: Address) {
    return await this._getAddress(address, AddressTypes.get_shipping);
  }

  async getBillingAddress(address: Address) {
    return await this._getAddress(address, AddressTypes.get_billing);
  }

  async _getAddress(address: Address, type: string) {
    const addressLine = address.line2 !== undefined ? `${address.line1}|${address.line2}` : address.line1;
    const country = address.country || 'US'
    const body = `${type}=${addressLine}|${address.city}|${address.state}|${address.zipCode}|${country}`

    return await this._request('get', 'address', body);
  }

  async reviewBillingAddress(address: Address) {

  }

  async reviewShippingAddress(address: Address) {

  }

  async declineBillingAddress(address: Address) {

  }

  async declineShippingAddress(address: Address) {

  }

  async deleteBillingAddress(address: Address) {

  }

  async deleteShippingAddress(address: Address) {

  }


  addAddress(address: Address, type: string, action: string): number {
    address.type = (<any>AddressTypes)[`${action}_${type}`];
    return this.addresses.push(address);
  }

  async submitAddresses() {
    if (this.addresses.length <= 0) return false;

    let data: {[k: string]:any} = {};
    this.addresses.forEach(address => {
      let addressLine = address.line2 !== undefined ? `${address.line1}|${address.line2}` : address.line1;
      const country = address.country || 'US'
      data[`${address.type}`] = `${addressLine}|${address.city}|${address.state}|${address.zipCode}|${country}`
    });

    try {
      let results = await this._request('post', 'address', qs.stringify(data));
      this.addresses = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');
      throw e;
    }
  }

  /**
   * Add an email address for bulk editing
   * @param {string} email - Email address to execute against
   * @param {string} action - Action to approve, review, decline, or delete.
   */
  addEmail(address: string, action: string): number {
    const emailAction = (<any>Actions)[action];
    if (emailAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    let email: Email = { address, action: emailAction };
    return this.emails.push(email);
  }

  /**
   * Submit emails for bulk actions.
   */
  async submitEmails() {
    if (this.emails.length <= 0) return false;

    let data: {[k: string]:any} = {};
    this.emails.forEach(e => data[`email[${e.address}]`] = e.action);
    try {
      let results = await this._request('post', 'email', qs.stringify(data));
      this.emails = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }

  addCard(number: string, action: string): number {
    const cardAction = (<any>Actions)[action];
    if (cardAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    let card: Card = { number, action: cardAction };
    return this.cards.push(card);
  }

  async submitCards() {
    if (this.cards.length <= 0) return false;

    let data: {[k: string]:any} = {};
    this.cards.forEach(c => data[`ptok[${c.number}]`] = c.action);
    try {
      let results = await this._request('post', 'card', qs.stringify(data));
      this.cards = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }


  adddevice(id: string, action: string): number {
    const deviceAction = (<any>Actions)[action];
    if (deviceAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    let device: Device = { id, action: deviceAction };
    return this.devices.push(device);
  }

  async submitDevices() {
    if (this.devices.length <= 0) return false;

    let data: {[k: string]:any} = {};
    this.devices.forEach(d => data[`device_id[${d.id}]`] = d.action);
    try {
      let results = await this._request('post', 'card', qs.stringify(data));
      this.devices = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }



  /**
   * Send request to Kount api
   * @param {String} method
   * @param {String} path
   * @param {string} [body]
   * @returns {Promise}
   */
  async _request(method: string, path: string, body: any) {
    // Build url
    let url = `${ this.baseUrl }${ path }.json`;

    if (method === 'get') url += `?${body}`;

    // Build default axios config
    const config: Axios = {
      method,
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-kount-api-key': this.apiKey
      }
    };

    if ((method === 'post' || method === 'put') && body) config.data = body;

    // Deliver request promise
    return (await axios(config)).data;
  }
}

module.exports = KountVip;


