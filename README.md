# Cebelca.biz and InvoiceFox.com API JS Library
Realy needs some more testing! This library can also be used with "modern" browsers using porter.js http://github.com/hij1nx/Porter


    var cebelcaAPI = require('./lib/cebelcabiz-api.js')

Run tests with:

    npm test

Make docs with:

    npm start

# JS API

## Function: [instance].invoice.create

### Resource: POST https://www.cebelca.biz/API?_r=invoice-sent&_m=insert-into

### Required payload:
  'title' : '2011-0001',
  'date_sent' : '2011-01-02',
  'date_to_pay' : '2011-04-12',
  'id_partner' : 1

### Description:
Add invoice head and get the id

### Example: 
    [instance].invoice.create(
      {},
      {"title":"2011-0001","date_sent":"2011-01-02","date_to_pay":"2011-04-12","id_partner":1},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].invoice.add

### Resource: POST https://www.cebelca.biz/API?_r=invoice-sent&_m=insert-into

### Required payload:
  'title' : 'programming service',
  'qty' : 10,
  'mu' : 'piece',
  'price' : 120,
  'vat' : 20,
  'discount' : 0,
  'id_invoice_sent' : 1

### Description:
Add invoice body line and get the id - invoice can have multiple body lines

### Example: 
    [instance].invoice.add(
      {},
      {"title":"programming service","qty":10,"mu":"piece","price":120,"vat":20,"discount":0,"id_invoice_sent":1},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].invoice.assignPartner

### Resource: POST https://www.cebelca.biz/API?_r=partner&_m=assure

### Required payload:
  'name' : 'My Company',
  'street' : 'Downing street',
  'postal' : 'E1w201',
  'city' : 'London'

### Description:
Assure partner (add if it doesn't exits and get the id, otherwise just get the id)

### Example: 
    [instance].invoice.assignPartner(
      {},
      {"name":"My Company","street":"Downing street","postal":"E1w201","city":"London"},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].invoice.delete

### Resource: POST https://www.cebelca.biz/API?_r=invoice-sent&_m=delete

### Required payload:
  'id_partner' : 10

### Description:
Delete partner based on partner_id

### Example: 
    [instance].invoice.delete(
      {},
      {"id_partner":10},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].generate.pdf

### Resource: GET https://www.cebelca.biz/API-pdf?id=:invoice_id&res=invoice-sent

### Description:
Export PDF based on invoice_id

### Example: 
    [instance].generate.pdf(
      {"invoice_id":10},
      {},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].generate.doc

### Resource: GET https://www.cebelca.biz/API-doc?id=:invoice_id&res=invoice-sent

### Description:
Export Word doc based on invoice_id

### Example: 
    [instance].generate.doc(
      {"invoice_id":10},
      {},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].generate.otf

### Resource: GET https://www.cebelca.biz/API-otf?id=:invoice_id&res=invoice-sent

### Description:
Export OO otf based on invoice_id

### Example: 
    [instance].generate.otf(
      {"invoice_id":10},
      {},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].partner.list

### Resource: POST https://www.cebelca.biz/API?_r=partner&_m=select-all

### Description:
List all partners

### Example: 
    [instance].partner.list(
      {},
      {},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].partner.get_add

### Resource: POST https://www.cebelca.biz/API?_r=partner&_m=assure

### Required payload:
  'name' : 'My Company',
  'street' : 'Downing street',
  'postal' : 'E1w201',
  'city' : 'London'

### Description:
Assure partner (add if it doesn't exits and get the id, otherwise just get the id)

### Example: 
    [instance].partner.get_add(
      {},
      {"name":"My Company","street":"Downing street","postal":"E1w201","city":"London"},
      function(error, response) {
        // do something...
      }
    );


## Function: [instance].partner.delete

### Resource: POST https://www.cebelca.biz/API?_r=partner&_m=delete

### Required payload:
  'id_partner' : 10

### Description:
Delete partner based on id_partner

### Example: 
    [instance].partner.delete(
      {},
      {"id_partner":10},
      function(error, response) {
        // do something...
      }
    );


