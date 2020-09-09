# Description
SDK used to interact with Kount's VIP API

# Installation
```
npm install --save kount-vip-sdk
```

# Usage
SDK require an API key which can be found in your Kount Dashboard

```javascript
const KountSdk = require('kount-vip-sdk');
const apiKey = 'XXX.YYY.ZZZ';
const kount = new KountSdk(apiKey);

kount.addEmail('test@email.com', 'action');
kount.sendEmail();
```

## API
All actions are done in bulk. You must first add the action then send the action

### Address
```javascript
addAddress(address, type, action);
```
- address - (object) Address object, must be of format:
```javascript
{
  line1,
  line2,
  city,
  state,
  zipCode,
  country //w ill default to 'US' if count is blank
}
```
- type - (string) Address type: `billing` or `shipping`
- action - (string) Action to take: `decline`, `delete` or `review`

To submit addresses, run:
```javascript
sendAddresses();
```

### Device
```javascript
addDevice(id, action);
```
- id - (string) Device ID
- action - (string) Action to `approve`, `review`, `decline`, or `delete`.

To submit devices, run:
```javascript
sendDevices();
```
### Email
```javascript
addEmail(address, action);
```
- email - (string) Email address to execute against
- action - (string) Action to `approve`, `review`, `decline`, or `delete`.

To submit emails, run:
```javascript
sendEmails();
```

### Payment
```javascript
addPayment(token, type, action);
```
- token - (string) Payment token to execute against
- type - (string) slugified payment type
  - Apple Pay = `apple_pay`
  - BPAY = `bpay`
  - Carte Bleue = `carte_bleue`
  - Check = `check`
  - ELV = `elv`
  - GiroPay = `giropay`
  - Interac = `interac`
  - Mercado Pago = `mercado_pago`
  - Neteller = `neteller`
  - POLi = `poli`
  - Paypal = `paypal`
  - Single Euro Payments Area = `single_euro_payments_area`
  - Skrill/Moneybookers = `skrill_moneybookers`
  - Sofort = `sofort`
  - Token = `token`
- action - (string) Action to `approve`, `review`, `decline`, or `delete`.

To submit payments, run:
```javascript
sendPayments();
```