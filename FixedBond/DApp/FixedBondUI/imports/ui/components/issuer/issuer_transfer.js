import './issuer_transfer.html'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

Template['components_issuer_transfer'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_issuer_transfer'].events({

	"click #transferFunds": function(event, template){ 

	TemplateVar.set(template,'state', {inProcess: true});
	var amount = parseInt(template.find("#amount").value);
	var issuerAddress = Session.get("Issuer");//template.find("#issuerAddress").value;
	
	var data = {address:issuerAddress,payment:amount};
	Meteor.call('transferFunds','http://localhost:7000/Issuer/TransferFunds',data,function(error, result){
	if (result) 
	{
		if(result.FundValue > 0)
		return TemplateVar.set(template,'state',{isSuccess: true, FundValue:result.FundValue});
	}
})
}});


