// const axios = require('axios'); // TODO - change to es6 axios
import axios, { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';

import { Address, Device, Email, Payment } from './interfaces';
import { Actions, AddressTypes, PaymentTypes } from './enums';

class KountVip {
  apiKey: string;
  baseUrl: string;

  addresses: Array<Address>;
  payments: Array<Payment>;
  devices: Array<Device>;
  emails: Array<Email>;

  /**
   * @param apiKey
   * @constructor
   */
  constructor(apiKey: string, test: boolean = false) {
    if (!apiKey) throw new Error('Kount API Key Missing.');
    this.baseUrl = (test) ? 'https://api.test.kount.net/rpc/v1/vip/' : 'https://api.kount.net/rpc/v1/vip/';

    // Grab info out of config
    this.apiKey = apiKey;
    this.addresses = [];
    this.payments = [];
    this.devices = [];
    this.emails = [];
  }

  /**
   * Add an address for bulk submittal
   * @param address - address object to submit
   * @param type - address type: billing or shipping
   * @param action - action to perfrom on device: approve, review, decline, or delete
   *
   * @retuns length of payment array
   */
  addAddress(address: Address, type: string, action: string): number {
    address.type = (<any>AddressTypes)[`${action}_${type}`];
    return this.addresses.push(address);
  }

  async submitAddresses(): Promise<any> {
    if (this.addresses.length <= 0) return false;

    let data: string = '';
    this.addresses.forEach((address) => {
      const addressLine = address.line2 !== undefined ? `${address.line1}\n${address.line2}` : address.line1;
      const country = address.country || 'US';
      const formated = encodeURIComponent(`${addressLine}\n${address.city}\n${address.state}\n${address.zipCode}\n${country}`);
      data += `${address.type}=${formated}`;
    });

    try {
      const results = await this.request('post', 'address', data);
      this.addresses = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');
      throw e;
    }
  }

  /**
   * Add an email address for bulk editing
   * @param email - Email address to execute against
   * @param action - Action to approve, review, decline, or delete.
   */
  addEmail(address: string, action: string): number {
    const emailAction = (<any>Actions)[action];
    if (emailAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    const email: Email = { address, action: emailAction };
    return this.emails.push(email);
  }

  /**
   * Submit emails for bulk actions.
   */
  async submitEmails(): Promise<any> {
    if (this.emails.length <= 0) return false;

    const data: {[k: string]:any} = {};
    this.emails.forEach(e => data[`email[${e.address}]`] = e.action);
    try {
      const results = await this.request('post', 'email', querystring.stringify(data));
      this.emails = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }

  /**
   * Add a payment for bulk submittal
   * @param token - payment token to submit
   * @param type - payment type
   * @param action - action to perfrom on device: approve, review, decline, or delete
   *
   * @retuns length of payment array
   */
  addPayment(token: string, type: string, action: string): number {
    const paymentAction = (<any>Actions)[action];
    const paymentType = (<any>PaymentTypes)[type];
    if (paymentAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    if (paymentType === undefined) throw new Error('Invalid payment type.');
    const payment: Payment = { token, type: paymentType, action: paymentAction };
    return this.payments.push(payment);
  }

  async submitPayments(): Promise<any> {
    if (this.payments.length <= 0) return false;

    const data: {[k: string]:any} = {};
    this.payments.forEach(p => data[`${p.action.toLowerCase()}_payment[${p.type}][]`] = p.token);
    try {
      const results = await this.request('post', 'payment', querystring.stringify(data));
      this.payments = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }

  /**
   * Add a device for bulk submittal
   * @param id - Device ID to add
   * @param action - action to perfrom on device: approve, review, decline, or delete
   *
   * @retuns length of device array
   */
  addDevice(id: string, action: string): number {
    if (id.length !== 32) throw new Error('Invalid Device ID.');
    const deviceAction = (<any>Actions)[action];
    if (deviceAction === undefined) throw new Error("Invalid action: only 'approve', 'review', 'decline', or 'delete' allowed.");
    const device: Device = { id, action: deviceAction };
    return this.devices.push(device);
  }

  /**
   * Sumbits Devices
   *
   * @returns The result from the API endpoint
   */
  async submitDevices(): Promise<any> {
    if (this.devices.length <= 0) return false;

    const data: {[k: string]:any} = {};
    this.devices.forEach(d => data[`device_id[${d.id}]`] = d.action);
    try {
      const results = await this.request('post', 'device', querystring.stringify(data));
      this.devices = [];
      return results;
    } catch (e) {
      if (e.response.status === 401) throw new Error('API Key is unauthorized');

      throw e;
    }
  }

  /**
   * Send request to Kount api
   * @param method - HTTP method to use
   * @param path - API URL path to call
   * @param body - database to send on POST or PATCH
   * @returns Promise
   */
  private async request(method: string, path: string, body: any) {
    // Build url
    let url = `${ this.baseUrl }${ path }.json`;

    if (method === 'get') url += `?${body}`;

    // Build default axios config
    const config: AxiosRequestConfig = {
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-kount-api-key': this.apiKey,
      },
    };

    if ((method === 'post' || method === 'put') && body) config.data = body;

    config.method = (method === 'post') ? 'post' : 'get';

    // Deliver request promise
    return (await axios(config)).data;
  }
}

module.exports = KountVip;