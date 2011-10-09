(function () {
  "use strict";

  var Porter = require('./node-porter').Porter;
  var toBase64 = function(str) {
    return  (new Buffer(str || "", "ascii")).toString("base64");
  };

  var CebelcaAPI = {

    invoice: {
      create: ['post', '?_r=invoice-sent&_m=insert-into', 
        { 
          arguments: {
              title : "2011-0001"
            , date_sent : "2011-01-02"
            , date_to_pay : "2011-04-12" 
            , id_partner :1
          }, 
          describe: "Add invoice head and get the id"
        }
      ],
      add: ['post', '?_r=invoice-sent&_m=insert-into', 
        { 
          arguments: {
              title : "programming service"
            , qty : 10
            , mu  : "piece"
            , price : 120
            , vat : 20
            , discount :0 
            , id_invoice_sent : 1
          }, 
          describe: "Add invoice body line and get the id - invoice can have multiple body lines"
        }
      ],
      assignPartner: ['post', '?_r=partner&_m=assure', 
        { 
          arguments: {
              name : "My Company"
            , street : "Downing street"
            , postal : "E1w201"
            , city : "London"
          }, 
          describe: "Assure partner (add if it doesn't exits and get the id, otherwise just get the id)"
        }
      ],
      delete: ['post', '?_r=invoice-sent&_m=delete', 
        { 
          arguments: {
            id_partner :10
          }, 
          describe: "Delete partner based on partner_id"
        }
      ],
    },

    partner: {
      list: ['post', '?_r=partner&_m=select-all', 
        { 
          describe: "List all partners"
        }
      ],
      get_add: ['post', '?_r=partner&_m=assure', 
        { 
          arguments: {
              name : "My Company"
            , street : "Downing street"
            , postal : "E1w201"
            , city : "London"
          }, 
          describe: "Assure partner (add if it doesn't exits and get the id, otherwise just get the id)"
        }
      ],
      delete: ['post', '?_r=partner&_m=delete', 
        { 
          arguments: {
            id_partner :10
          }, 
          describe: "Delete partner based on id_partner"
        }
      ],
    },

    generate: {
      pdf: ['get', '-pdf?id=:invoice_id&res=invoice-sent', 
        { 
          describe: "Export PDF based on invoice_id"
        }
      ],
      doc: ['get', '-doc?id=:invoice_id&res=invoice-sent', 
        { 
          describe: "Export Word doc based on invoice_id"
        }
      ],
      otf: ['get', '-otf?id=:invoice_id&res=invoice-sent', 
        { 
          describe: "Export OO otf based on invoice_id"
        }
      ]
    },


  };

  function apiExport(api_key, username, password) {
    return new Porter(CebelcaAPI).use({
      headers:  {
          'Authorization' : 'Basic ' + toBase64(username+':'+password)
        , 'User-Agent': 'Node('+process.version+') Porter library '+this.version
        , 'Accept': 'application/json'
        , 'Content-Type': 'application/json'
      },
      endpoint: "/API"
    });
  }
  module.exports = apiExport;

}());
