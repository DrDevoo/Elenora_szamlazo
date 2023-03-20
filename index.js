import {
    Buyer,
    Client,
    Invoice,
    Item,
    Seller,
    Currencies,
    Currency,
    Language,
    Languages,
    PaymentMethod,
    PaymentMethods,
    TaxSubject,
    TaxSubjects} from 'szamlazz.js'
    import * as fs from 'fs';

const szamlazzClient = new Client({
    authToken: 'y8tx6fuss3cqxtqmvanbb6yh3pv7u3dddbfxq9wyg6',
    eInvoice: true, // create e-invoice. optional, default: false
    requestInvoiceDownload: true, // downloads the issued pdf invoice. optional, default: false
    downloadedInvoiceCount: 1, // optional, default: 1
    responseVersion: 1, // optional, default: 1
    timeout: 0 // optional, default: 0, request timeout in ms (0 = no timeout)
})
let seller = new Seller({ // everyting is optional
    bank: {
      name: 'Test Bank <name>',
      accountNumber: '11111111-11111111-11111111'
    },
    email: {
      replyToAddress: 'test@email.com',
      subject: 'Invoice email subject',
      message: 'This is an email message'
    },
    issuerName: ''
})
let buyer = new Buyer({
    name: 'Some Buyer Name ' + Math.random(),
    country: '',
    zip: '1234',
    city: 'City',
    address: 'Some street address',
    taxNumber: '12345678-1-42',
    postAddress: {
      name: 'Some Buyer Name',
      zip: '1234',
      city: 'City',
      address: 'Some street address'
    },
    issuerName: '',
    identifier: 1,
    phone: '',
    comment: ''
})
let soldItem1 = new Item({
    label: 'First item',
    quantity: 2,
    unit: 'qt',
    vat: 27, // can be a number or a special string
    netUnitPrice: 100.55, // calculates gross and net values from per item net
    comment: 'Ez egy árvíztűrő tükörfúrógép'
})
let soldItem2 = new Item({
    label: 'Second item',
    quantity: 5,
    unit: 'qt',
    vat: 27,
    grossUnitPrice: 1270 // calculates net and total values from per item gross
  })
let invoice = new Invoice({
    paymentMethod: PaymentMethods.BankTransfer, // optional, default: BankTransfer
    currency: Currencies.Ft, // optional, default: Ft
    language: Languages.Hungarian, // optional, default: Hungarian
    seller: seller, // the seller, required
    buyer: buyer, // the buyer, required
    items: [ soldItem1, soldItem2 ], // the sold items, required
    prepaymentInvoice: false // prepayment/deposit invoice should be issued, optional, default: false
  })
const result = await szamlazzClient.issueInvoice(invoice)
if (result.pdf) {
    var buffer = Buffer.from(result.pdf, 'base64')
    fs.writeFileSync('./szamlak/'+result.invoiceId, buffer)
}