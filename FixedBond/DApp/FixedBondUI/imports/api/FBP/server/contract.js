// All links-related publications

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
"createKYC": function(url){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.post )
  var result = asyncFunc(url);
  return result.data;
},

"createFPBContract": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.post );
  var input = JSON.stringify(params);
  var result = asyncFunc(url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    content: input
   });
  return result.data;
},

"getBondPrice": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

"purchaseBond": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.post );
  var input = JSON.stringify(params);

  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    content: input
   });
  return result.data;
},

"transferFunds": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.post );
  var input = JSON.stringify(params);

  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    content: input
   });
  return result.data;
},

"makePayment": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.post );
  var input = JSON.stringify(params);

  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    content: input
   });
  return result.data;
},

"getIssuerBonds": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

"getBuyers": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

"getMyHoldings": function(url,params){ 

  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

"getBalance": function(url,params){ 
  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

"checkPayments": function(url,params){ 
  this.unblock();
  var asyncFunc  = Meteor.wrapAsync( HTTP.get );
  var result = asyncFunc( url,
  {
    headers: {
        'Content-Type': 'application/json'
      },
    params: params
   });
  return result.data;
},

});
