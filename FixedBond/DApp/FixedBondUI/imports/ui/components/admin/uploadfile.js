import './uploadfile.html'
import { Meteor } from 'meteor/meteor';

Template['components_uploadfile'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_uploadfile'].events({

	"click #buyBond": function(event, template){ 

	TemplateVar.set(template,'state', {inProcess: true});
	var file = template.find("#uploadfile").value;

	var reader = new FileReader();
	reader.onload = function(event){          
    var filedata = new Uint8Array(reader.result);
    Meteor.call('uploadFile',filedata);
    }
	reader.readAsArrayBuffer(template.find("#uploadfile").files[0]);
}});


