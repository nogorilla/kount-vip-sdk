const axios = require('axios');

const baseUrl = 'https://api.kount.net/rpc/v1/vip/';
const nl = '\n';

function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
  return propertyNames.map((n) => o[n]);
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

interface Axios {
  method: string,
  url: string,
  responseType: string,
  headers: object,
  data?: string
}

interface Email {
  address: string,
  action?: string
}

enum EmailActions {
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


// Expose NaraSDK
class NaraSDK {

  apiKey: string;
  addresses: Array<Address>;
  emails: Array<Email>;

  /**
   * @param {string} apiKey
   * @constructor
   */
  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Kount API Key Missing.');

    // Grab info out of config
    this.apiKey = apiKey;
    this.addresses = [];
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

  }

  addEmail(email: Email, action: string): number {
    email.action = (<any>EmailActions)[action];
    return this.emails.push(email);
  }

  async submitEmails() {
    let data = new FormData();
    this.emails.forEach(e => data.append(`email[${e.address}]`, `${e.action}`));
    return this._request('post', 'email', data);
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
    let url = `${ baseUrl }${ path }.json`;

    if (method === 'get') url += `?${body}`;

    // Build default axios config
    const config: Axios = {
      method,
      url,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'x-kount-api-key': this.apiKey
      }
    };

    if ((method === 'post' || method === 'put') && body) config.data = body;

    // Deliver request promise
    return (await axios(config)).data;
  }
}

module.exports = NaraSDK;


