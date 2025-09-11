const BlogCategory = require('../../models/web-admin/categoryPost.model');

exports.getBLogCategory = (req, res, next) => {
  BlogCategory.find((err, docs) => {
    if (err) console.log(err);
    res.render('blog/category', {
      title: 'Blog Category',
      data: docs,
      pageName: 'blog-category',
      csrfToken: req.csrfToken()
    });
  });
}

exports.postAddBlogCategory = (req, res, next) => {
  let blogCategory = new BlogCategory({
    name: req.body.name,
    status: req.body.status,
  });
  blogCategory.save((err, result) => {
    if (err) console.log(err);
    else
      res.redirect('/admin/blog-category');
  });
}

exports.postDeleteBlogCategory = (req, res, next) => {
  const blogcategoryId = req.params.id;
  BlogCategory.findByIdAndRemove(blogcategoryId, (err, blogcategory) => {
    if (err) console.log(err);
    else res.redirect('/admin/blog-category');
  });
}
exports.getEditBlogCategory = async (req, res) => {
  const categoryId = req.params.id;
  let blogCategory = await BlogCategory.findOne({ _id: categoryId });
  res.render('blog/edit-category', {
    title    : 'Edit Category',
    post     : blogCategory,
    pageName: 'edit-category',
    csrfToken: req.csrfToken()
  });
};

exports.postEditBlogCategory = function editCategory(req, res, next) {
  const categoryId = req.params.id;
  BlogCategory.findById(categoryId, (err, post) => {
    if (err) console.log(err);
    else {
      post.name         = req.body.name !== null ? req.body.name : post.name;
      post.status       = req.body.status !== null ? req.body.status : post.status;
      post.save((err, result) => {
        if (err) console.log(err);
        else
          res.redirect('/admin/blog-category');
      });
    }
  });
}
