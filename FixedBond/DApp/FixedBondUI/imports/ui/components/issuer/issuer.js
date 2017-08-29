import './issuer.html'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

Template['components_issuer'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_issuer'].events({

	"click #issueFPBondContract": function(event, template){ 

	TemplateVar.set(template,'state', {isMining: true});
	var bondName =template.find("#bondName").value;
	var noOfBonds = parseInt(template.find("#BondsToIssue").value);
	var unitPrice = parseInt(template.find("#UnitPrice").value);
	var interestRate = parseInt(template.find("#InterestRate").value);
	var maturityAmount = parseInt(template.find("#UnitPrice").value);
	var payDate1 = template.find("#PaymentDate1").value;
	var payDate2 = template.find("#PaymentDate2").value;
	var payDate3 = template.find("#PaymentDate3").value;
	var issuer = Session.get("Issuer");

	var data = {BondName:bondName,
		BondsToIssue:noOfBonds,UnitPrice:unitPrice,InterestRate:interestRate,MaturityAmount:maturityAmount,
					PaymentDate1:payDate1,PaymentDate2:payDate2,PaymentDate3:payDate3,address:issuer
			};
	
			
	Meteor.call('createFPBContract','http://localhost:7000/Issuer/Bond',data,function(error, result){
	if (result) 
	{
		//console.log(result);
		return TemplateVar.set(template,'state',{isMined: true, address: result.BondContract});
	}
});

}});


