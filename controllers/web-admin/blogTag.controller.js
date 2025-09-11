const BlogTag = require('../../models/web-admin/tag.model');

exports.getBLogTag = (req, res, next) => {
  BlogTag.find((err, docs) => {
    if (err) console.log(err);
    res.render('blog/tag', {
      title: 'Blog Tag',
      data: docs,
      pageName: 'blog-tag',
      csrfToken: req.csrfToken()
    });
  });
}

exports.postAddBlogTag = (req, res, next) => {
  let blogTag = new BlogTag({
    name: req.body.name.toLowerCase(),
    status: req.body.status
  });
  blogTag.save((err, result) => {
    if (err) console.log(err);
    else
      res.redirect('/admin/blog-tag');
  });
}

exports.getDeleteBlogTag = (req, res, next) => {
  const blogtagId = req.params.id;
  BlogTag.findByIdAndRemove(blogtagId, (err, blogtag) => {
    if (err) console.log(err);
    else
      res.redirect('/admin/blog-tag');
  });
}
