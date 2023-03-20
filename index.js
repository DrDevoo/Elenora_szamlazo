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
    import express from "express";
    const app = express();
    import * as http from 'http';
    import * as https from 'https';
    import * as dotenv from 'dotenv'
    dotenv.config()
    import bodyParser from "body-parser";
    app.use(bodyParser.json());
app.post("/", async (req, res) => {
  const order = req.body
  console.log(order)

  console.log("!Számla kiállítása folyamatban!")
  const szamlazzClient = new Client({
    authToken: process.env.TOKEN,
    eInvoice: true, // create e-invoice. optional, default: false
    requestInvoiceDownload: true, // downloads the issued pdf invoice. optional, default: false
    downloadedInvoiceCount: 1, // optional, default: 1
    responseVersion: 1, // optional, default: 1
    timeout: 0 // optional, default: 0, request timeout in ms (0 = no timeout)
})
let seller = new Seller({ // everyting is optional
    bank: {
      name: 'OTP Bank',
      accountNumber: '11720049-21456035'
    },
    email: {
      replyToAddress: 'krichard@elenora.hu',
      subject: 'Új számla kiállítva',
      message: 'Az új számla:'
    },
    issuerName: ''
})
let buyer = new Buyer({
    name: order.u_firstname + " " + order.u_name,
    country: order.u_legio,
    zip: order.u_postnumber,
    city: order.u_city,
    address: order.u_postnumber +", "+order.u_city+" "+order.u_addresse,
    taxNumber: '0',
    postAddress: {
      name: order.u_firstname + " " + order.u_name,
      zip: order.u_postnumber,
      city: order.u_city,
      address: order.u_postnumber +", "+order.u_city+" "+order.u_addresse
    },
    issuerName: '',
    identifier: 1,
    phone: order.u_tel,
    comment: ''
})
let soldItem1 = new Item({
  label: 'Arany karkötő',
  quantity: 1,
  unit: 'db',
  vat: 0,
  grossUnitPrice: 4490 // calculates net and total values from per item gross
})
let soldItem2 = new Item({
    label: 'Jáde karkötő',
    quantity: 1,
    unit: 'db',
    vat: 0,
    grossUnitPrice: 2900 // calculates net and total values from per item gross
  })
let invoice = new Invoice({
    paymentMethod: PaymentMethods.Cash, // optional, default: BankTransfer
    currency: Currencies.Ft,
    language: Languages.Hungarian,
    seller: seller,
    buyer: buyer,
    items: [ soldItem1, soldItem2 ], // the sold items, required
    prepaymentInvoice: false // prepayment/deposit invoice should be issued, optional, default: false
  })
const result = await szamlazzClient.issueInvoice(invoice)
if (result.pdf) {
    res.status(200).json(result)
    console.log("!!A számla elküldve a gerinc szerver részére!!")
}
});

//Szerver certificates
const httpServer = http.createServer(app);
//Az app nyitott portjai
httpServer.listen(4000, () => {
  console.log('---Számlázó szerver elerhető a 4000 porton---');
});

const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/elenora.hu/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/elenora.hu/fullchain.pem'),
}, app);
httpsServer.listen(444, () => {
  console.log('---HTTPS szerver elerheto a 444 porton---');
});
