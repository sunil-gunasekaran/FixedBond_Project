import './buyer_viewinfo.html'
import { Meteor } from 'meteor/meteor';

var bonds = new ReactiveArray(); 

Template["components_buyer_viewinfo"].onCreated(function(){
	var template = this;
	TemplateVar.set(template,'state', {list: false});
});

Template["components_buyer_viewinfo"].onRendered(function(){

	var template = this;
	var data = {address:Session.get('Buyer')};

	Meteor.call('getMyHoldings','http://localhost:7000/Buyer/MyHoldings',data,function(error, result){
	if(result)
	{
		if(result.Bonds>0)
			return TemplateVar.set(template,'state', {list: true, Issuer:result.Issuer, BondName: result.BondName,Bonds:result.Bonds,PurchasePrice:result.PurchasePrice,MaturityAmt:result.MaturityAmt });
	}
	})

});

Template['components_buyer_viewinfo'].helpers({

	"getBondsList": function()
	{
		return bonds.list();
	}
});



