enum Actions {
  approve = 'A',
  decline = 'D',
  delete  = 'X',
  review  = 'R',
}

enum AddressTypes {
  get_billing      = 'ba',
  get_shipping     = 'sa',
  decline_billing  = 'd_ba[]',
  decline_shipping = 'd_sa[]',
  delete_billing   = 'x_ba[]',
  delete_shipping  = 'x_sa[]',
  review_billing   = 'r_ba[]',
  review_shipping  = 'r_sa[]',
}

enum PaymentTypes {
  apple_pay                 = 'APAY',
  bpay                      = 'BPAY',
  carte_bleue               = 'CARTE_BLEUE',
  check                     = 'CHEK',
  elv                       = 'ELV',
  giropay                   = 'GIROPAY',
  interac                   = 'INTERAC',
  mercado_pago              = 'MERCADO_PAGO',
  neteller                  = 'NETELLER',
  poli                      = 'POLI',
  paypal                    = 'PYPL',
  single_euro_payments_area = 'SEPA',
  skrill_moneybookers       = 'SKRILL',
  sofort                    = 'SOFORT',
  token                     = 'TOKEN',
}

export {
  Actions,
  AddressTypes,
  PaymentTypes,
}