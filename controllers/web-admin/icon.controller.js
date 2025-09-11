exports.getIcoFont = (req, res) => {
  res.render('icon/icofont', {
    title: 'Icofont',
    pageName: 'icon',
    csrfToken: req.csrfToken()
  });
}
