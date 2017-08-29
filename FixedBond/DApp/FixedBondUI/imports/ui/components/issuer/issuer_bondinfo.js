import './issuer_bondinfo.html'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

var buyers = new ReactiveArray(); 

Template["components_issuer_bondinfo"].onCreated(function(){
	var template = this;
	TemplateVar.set(template,'IssuerBonds',null);
	TemplateVar.set(template,'showBuyers',{show:false});
	//Session.set("Issuer","0x7e6f0f885d0c7060bf4e78ec4d02aec49affeac8");

});

Template["components_issuer_bondinfo"].onRendered(function(){

	var template = this;
	TemplateVar.set(template,'IssuerBonds',null);
	var data = {address:Session.get('Issuer')};
	Meteor.call('getIssuerBonds','http://localhost:7000/Issuer/GetBondInfo',data,function(error, result){
		TemplateVar.set(template,'IssuerBonds',result);
	})
});

Template['components_issuer_bondinfo'].helpers({

	"getBuyersList": function()
	{
		return buyers.list();
	}
});

Template['components_issuer_bondinfo'].events({

	"click #btnBuyersList": function(event, template){ 
	if(Session.get('Issuer'))
	{
		TemplateVar.set(template,'showBuyers',{show:true});
		var data = {address:Session.get('Issuer')};
		buyers.clear();
		Meteor.call('getBuyers','http://localhost:7000/Issuer/GetMyBuyers',data,function(error, result){
		if (result) 
		{
			for(var i=0;i<result.length;i++)
			{
				buyers.push(result[i]);
			}
		}
		})
	}
},

"click #makePayment": function(event, template){ 

	TemplateVar.set(template,'state', {inProcess:true});
	var issueraddress = Session.get('Issuer');
	
	var data = {address:issueraddress};
			
	Meteor.call('makePayment','http://localhost:7000/Issuer/MakePayment',data,function(error, result){
	if (result) 
	{
		if(result.FundValue > 0)
		{
			return TemplateVar.set(template,'state',{isSuccess: true, FundValue:result.FundValue,PaidDate:result.PaidDate});
		}
	}
})
},
});

