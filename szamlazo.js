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
app.get("/", async (req, res) => {
  res.status(200).send("ELENORA SZAMLAZO API 1.0.0 🙌 ");
})

app.post("/", async (req, res) => {
  console.log("!Számla kiállítása folyamatban!")

  const order = req.body.order
  const cart = req.body.list

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
if(order.szamlazasimod == "same"){
var buyer = new Buyer({
    name: order.u_firstname + " " + order.u_name,
    country: order.u_legio,
    zip: order.u_postnumber,
    city: order.u_city,
    address: order.u_postnumber +", "+order.u_city+" "+order.u_addresse,
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
}else{
  var buyer = new Buyer({
    name: order.szamlazasVezteknev + " " + order.szamlazasUtonev,
    country: order.szamlazasOrszag,
    zip: order.szamlazasUtonev,
    city: order.szamlazasTelepules,
    address: order.szamlazasUtonev +", "+order.szamlazasTelepules+" "+order.szamlazasCim,
    postAddress: {
      name: order.szamlazasVezteknev + " " + order.szamlazasUtonev,
      zip: order.szamlazasUtonev,
      city: order.szamlazasTelepules,
      address: order.szamlazasUtonev +", "+order.szamlazasTelepules+" "+order.szamlazasCim
    },
    issuerName: '',
    identifier: 1,
    phone: order.szamlazasTel,
    comment: ''
})
}
let newcart = []
cart.forEach(element => {
  newcart.push(
    new Item({
      label: element.label,
      quantity: element.quantity,
      unit: 'db',
      vat: "AAM",
      grossUnitPrice: element.grossUnitPrice // calculates net and total values from per item gross
    })
  )
});
if(order.shipping=='delivery-cash'){
  var invoice = new Invoice({
    paymentMethod: PaymentMethods.Cash, // optional, default: BankTransfer
    currency: Currencies.Ft,
    language: Languages.Hungarian,
    seller: seller,
    buyer: buyer,
    items: newcart, // the sold items, required
    prepaymentInvoice: false // prepayment/deposit invoice should be issued, optional, default: false
  })
}else{
  var invoice = new Invoice({
    paymentMethod: PaymentMethods.CreditCard, // optional, default: BankTransfer
    currency: Currencies.Ft,
    language: Languages.Hungarian,
    seller: seller,
    buyer: buyer,
    items: newcart, // the sold items, required
    prepaymentInvoice: false // prepayment/deposit invoice should be issued, optional, default: false
  })
}

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
httpsServer.listen(4040, () => {
  console.log('---Számlázó szerver https elerhető a 4040 porton---');
});
