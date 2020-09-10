interface Axios {
  method: string;
  url: string;
  headers: object;
  data?: string;
}

interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  type?: string;
}

interface Device {
  id: string;
  action: string;
}

interface Email {
  address: string;
  action?: string;
}

interface Payment {
  token: string;
  action: string;
  type: string;
}

export {
  Axios,
  Address,
  Device,
  Email,
  Payment,
};