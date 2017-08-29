import './issuer_balance.html'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// when the template is rendered
Template['components_issuer_balance'].onRendered(function() {
    var template = this;
    TemplateVar.set(template,"validate",{error:false});
});


Template['components_issuer_balance'].helpers({
   
    'watchBalance': function(){   
        return Session.get("Balance");
    },
});

Template['components_issuer_balance'].events({

    "click #refresh": function(event, template){ 

    if(!Session.get('Issuer'))
    {
        if(template.find("#Issuer").value.length>0)
        {
            Session.set("Issuer",template.find("#Issuer").value);
        }
        else
        {
            return TemplateVar.set(template,"validate",{error:true});
        }
    }
    var data = {address:Session.get('Issuer')};
    Meteor.call('getBalance','http://localhost:7000/Admin/MyBalance',data,function(error, result)
    {
             Session.set("Balance",parseFloat(result).toFixed(4));
             Meteor._reload.reload();
    })
    }
});
