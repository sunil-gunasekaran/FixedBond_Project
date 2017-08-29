import './buyer_balance.html'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// when the template is rendered
Template['components_buyer_balance'].onRendered(function() {
    var template = this;
    TemplateVar.set(template,"state",{Payments:false});
    TemplateVar.set(template,"validate",{error:false});
    var data = {buyerAddress:Session.get('Buyer')};

   template.checkPayments = Meteor.setInterval(function() {
        Meteor.call('checkPayments','http://localhost:7000/Buyer/CheckPayments',data,function(error, result){
        if(result)   
        {
            console.log(result);
            TemplateVar.set(template,'state', {Payments: true, Buyer:result.buyer,Bonds:result.BondsCount,FundValue:result.PurchaseValue});
        }
        });
    }, 10000);
});

Template['components_buyer_balance'].onDestroyed(function() {
    Meteor.clearInterval(this.checkPayments);
});

Template['components_buyer_balance'].helpers({
   
    'watchBalance': function(){   
        return Session.get("BuyerBalance");
    },
});

Template['components_buyer_balance'].events({

    "click #refresh": function(event, template){ 

    if(!Session.get('Buyer'))
    {
        if(template.find("#Buyer").value.length>0)
        {
            Session.set("Buyer",template.find("#Buyer").value);
        }
        else
        {
            return TemplateVar.set(template,"validate",{error:true});
        }
    }
    var data = {address:Session.get('Buyer')};
    Meteor.call('getBalance','http://localhost:7000/Admin/MyBalance',data,function(error, result)
    {
             //Session.set("BuyerBalance",result);
             Session.set("BuyerBalance",parseFloat(result).toFixed(4))
             Meteor._reload.reload();
    })
    }
});
