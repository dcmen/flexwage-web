const Pricing = require('../../models/web-admin/pricing.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');

exports.getPricing = async (req, res) => {
  let prices = await Pricing.find();
  let header = await Header.findOne({ code: 'header-pricing' });
  res.render('pricing/table-pricing', {
    title: 'Pricing management',
    data: prices,
    header: header,
    pageName: 'pricing-management',
    csrfToken: req.csrfToken()
  });
};

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-pricing');
  res.redirect('/admin/pricing-management');
}

exports.getAddPricing = (req, res) => {
  res.render('pricing/add-pricing', {
    title: 'Add Pricing',
    pageName: 'pricing-management',
    csrfToken: req.csrfToken()
  });
};

exports.postAddPricing = (req, res) => {
  let pricing = new Pricing({
    name: req.body.name,
    price: req.body.price,
    diskSpace: req.body.diskSpace,
    subdomains: req.body.subdomains ,
    emailAccounts: req.body.emailAccounts ,
    webmailSupport: req.body.webmailSupport ,
    offers: req.body.offers ,
    status: req.body.status
  });

  pricing.save()
  .then(() => res.redirect('/admin/pricing-management'));
};

exports.getEditPricing = (req, res) => {
  const pricingId = req.params.id;
  Pricing.findOne({ _id: pricingId })
  .then(pricing => {
    res.render('pricing/edit-pricing', {
      title: 'Edit Pricing',
      pricing: pricing,
      pageName: 'pricing-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
};

exports.postEditPricing = (req, res) => {
  const pricingId = req.params.id;
  Pricing.findOne({ _id: pricingId })
  .then(pricing => {
    pricing.name = req.body.name !== null ? req.body.name : pricing.name;
    pricing.price = req.body.price !== null ? req.body.price : pricing.price;
    pricing.diskSpace = req.body.diskSpace !== null ? req.body.diskSpace : pricing.diskSpace;
    pricing.subdomains = req.body.subdomains !== null ? req.body.subdomains : pricing.subdomains;
    pricing.emailAccounts = req.body.emailAccounts !== null ? req.body.emailAccounts : pricing.emailAccounts;
    pricing.webmailSupport = req.body.webmailSupport !== null ? req.body.webmailSupport : pricing.webmailSupport;
    pricing.offers = req.body.offers !== null ? req.body.offers : pricing.offers;
    pricing.status = req.body.status !== null ? req.body.status : pricing.status;
    pricing.save()
  })
  .then(() => res.redirect('/admin/pricing-management'))
  .catch(err => console.log(err));
};

exports.getDeletePricing = (req, res) => {
  const pricingId = req.params.id;
  Pricing.findByIdAndRemove({ _id: pricingId })
    .then(() => res.redirect('/admin/pricing-management'))
    .catch(err => console.log(err));
};
