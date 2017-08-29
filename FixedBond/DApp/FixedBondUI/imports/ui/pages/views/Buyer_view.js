
import './Buyer_view.html';
import '../../components/buyer/buyer.js';
import '../../components/buyer/buyer_purchase.js';
import '../../components/buyer/buyer_viewinfo.js';
import '../../components/buyer/buyer_balance.js';

Template['Buyer_view'].helpers({
    
});

// When the template is created
Template['Buyer_view'].onCreated(function(){
	//Meta.setSuffix(TAPi18n.__("dapp.view1.title"));
});
