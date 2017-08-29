import './buyer.html'
import { Meteor } from 'meteor/meteor';

Template['components_buyer'].onRendered(function(){
	var template = this;
    TemplateVar.set('state', {isInactive: true});
    TemplateVar.set(template,'calcAmount',null);
});

Template['components_buyer'].helpers({

	
	"getIssuers" : function(){
		var issuers = Meteor.settings.public.issuers;
		return issuers;
	},

	"calcAmount": function(){
		var template  = this;
		//var price = TemplateVar.get('IssuerBonds').IssuePrice;
		return TemplateVar.get('calcAmount');
	},


});

Template['components_buyer'].events({

	"click #getBondsBtn": function(event, template){ 

	var issuerAddress = template.find("#Issuerlist").value;
	var data = {address:issuerAddress};
	TemplateVar.set(template,'IssuerBonds',null);
	
	Meteor.call('getIssuerBonds','http://localhost:7000/Issuer/GetBondInfo',data,function(error, result){
		TemplateVar.set(template,'IssuerBonds',result);
	})
	},

	"input #BondsToBuy": function(event, template){ 

	var count = template.find("#BondsToBuy").value;
	TemplateVar.set(template,'calcAmount',0);
	var price = TemplateVar.get('IssuerBonds').IssuePrice;
		TemplateVar.set(template,'calcAmount',count * price);
	},

	"click #buyBond": function(event, template){ 

	TemplateVar.set(template,'state', {inProcess: true});
	var noOfBonds = parseInt(template.find("#BondsToBuy").value);
	var amount = TemplateVar.get('calcAmount');
	var buyerAddress = Session.get('Buyer');
	
	var data = {address: buyerAddress,NumOfBonds:noOfBonds,Amount:amount};
	
			
	Meteor.call('purchaseBond','http://localhost:7000/Buyer/PurchaseBond',data,function(error, result){
	if (result) 
	{
		if(result.NumOfBonds > 0 && result.PurchaseValue >0)
		return TemplateVar.set(template,'state',{isSuccess: true, bondscount: result.NumOfBonds, bondValue:result.PurchaseValue});
	}
	})
}
});


