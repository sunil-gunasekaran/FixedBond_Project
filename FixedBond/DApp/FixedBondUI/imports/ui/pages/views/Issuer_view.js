/**
Template Controllers

@module Templates
*/

/**
The view1 template

@class [template] views_view1
@constructor
*/
import './Issuer_view.html';
import '../../components/issuer/issuer.js';
import '../../components/issuer/issuer_transfer.js';
//import '../../components/issuer/issuer_payment.js';
import '../../components/issuer/issuer_bondinfo.js';
import '../../components/issuer/issuer_balance.js';

Template['Issuer_view'].helpers({
    /**
    Get the name

    @method (name)
    */

  /*  'name': function(){
        return this.name || TAPi18n.__('dapp.view1.defaultName');
    }*/
});

// When the template is created
Template['Issuer_view'].onCreated(function(){
	//Meta.setSuffix(TAPi18n.__("dapp.view1.title"));
});
