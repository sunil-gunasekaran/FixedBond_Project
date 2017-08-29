import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/layouts/header/header.js';
import '../../ui/layouts/footer/footer.js';
import '../../ui/pages/views/Admin_view.js';
import '../../ui/pages/views/Issuer_view.js';
import '../../ui/pages/views/Buyer_view.js';
import '../../ui/pages/not-found/not-found.js';

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
	BlazeLayout.render('App_body', { top:'header', main: 'Admin_view', footer:'footer' });
  },
});

FlowRouter.route('/Admin', {
  name: 'App.Admin',
  action() {
    BlazeLayout.render('App_body', { top:'header', main: 'Admin_view', footer:'footer' });
  },
});

FlowRouter.route('/Issuer', {
  name: 'App.Issuer',
  action() {
    BlazeLayout.render('App_body', { top:'header', main: 'Issuer_view', footer:'footer' });
  },
});

FlowRouter.route('/Buyer', {
  name: 'App.Buyer',
  action() {
    BlazeLayout.render('App_body', { top:'header', main: 'Buyer_view', footer:'footer' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
