import './admin.html'
import { Meteor } from 'meteor/meteor';

Template['components_admin'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_admin'].events({

	"click #createKYCRegbtn": function(event, template){ 

	TemplateVar.set(template,'state', {isMining: true});
	Meteor.call('createKYC',"http://localhost:7000/Admin/KYC",function(error, result){
	if (result) 
	{
		return TemplateVar.set(template,'state',{isMined: true, address: result.KYRegistry});
	}
});

}});

