import './buyer_purchase.html'
import { Meteor } from 'meteor/meteor';

Template['components_buyer_purchase'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_buyer_purchase'].events({

	"click #buyBond": function(event, template){ 

	TemplateVar.set(template,'state', {inProcess: true});
	var noOfBonds = parseInt(template.find("#BondsToBuy").value);
	var amount = parseInt(template.find("#amount").value);
	var buyerAddress = Session.get('Buyer');
	
	var data = {address: buyerAddress,NumOfBonds:noOfBonds,Amount:amount};
	
			
	Meteor.call('purchaseBond','http://localhost:7000/Buyer/PurchaseBond',data,function(error, result){
	if (result) 
	{
		if(result.NumOfBonds > 0 && result.PurchaseValue >0)
		return TemplateVar.set(template,'state',{isSuccess: true, bondscount: result.NumOfBonds, bondValue:result.PurchaseValue});
	}
});
}});


