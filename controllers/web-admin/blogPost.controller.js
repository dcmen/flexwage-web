const BlogPost = require('../../models/web-admin/post.model');
const Category = require('../../models/web-admin/categoryPost.model');
const Tag      = require('../../models/web-admin/tag.model');
const fs       = require("fs");
const Header   = require('../../models/web-admin/heading.model');
const Helper   = require('../../helpers/helper');

exports.getBlogPost = (req, res, next) => {
  let blogPost = BlogPost.find((err, docs) => {
    if (err) console.log(err);
    Header.find({ code: 'header-blog' }, (err, header) => {
      if (err) console.log(err);
      res.render('blog/table-blog-post', {
        title: 'Blog management',
        data: docs,
        header: header,
        pageName: 'blog-post-management',
        csrfToken: req.csrfToken()
      });
    });
  });
};

exports.postUpdateHeader = (req, res, next) => {
  Helper.updateHeader(req, 'header-blog');
  res.redirect('/admin/blog-post-management');
}

exports.getAddBlogPost = (req, res) => {
  let messages = req.flash('errors');
  let category = Category.find( { status: true }, (err, docs) => {
    if(err) console.log(err);
    res.render('blog/add-blog-post', {
      title: 'Add New Post',
      data: docs,
      messages: messages,
      pageName: 'blog-post-management',
      csrfToken: req.csrfToken()
    });
  })
};

exports.postAddBlogPost = async function addPost(req, res) {
  let currentdate = new Date();
  let datetime    = currentdate.getDate() + "/"
                  + (currentdate.getMonth() + 1)  + "/"
                  + currentdate.getFullYear();

  const tagStr  = req.body.tagID.toLowerCase();
  const tagArrs = tagStr.split(",");

  let newTagArrs = [];
  let tags = await Tag.find({ status: true });
  let test = tagArrs.map(async (tag, newIdTag) => {
    newIdTag = [];
    let check = tags.find(oldTag => oldTag.name === tag);
    if (check === undefined) {
      newTagArrs.push(tag);

      let tagNew = new Tag({
        name: tag,
        status: true
      });

      let tagId = await tagNew.save();
      newIdTag.push(tagId._id);
    }
    else {
      newIdTag.push(check._id);
    }
    return newIdTag;
  });
  newIdTag = await Promise.all(test).then(result => {
    return result.map(data => data);
  });

  let idTag = [];

  for (let idArr of newIdTag){
    idTag.push(idArr[0]);
  }

  let post = new BlogPost({
    createTime   : datetime,
    author       : req.session.user.name,
    imagePath    : '/uploads/' + req.file.filename,
    title        : req.body.title,
    shortContent : req.body.shortContent,
    content      : req.body.content,
    tagID        : idTag,
    categoryID   : req.body.categoryID,
    status       : req.body.status
  });

  post.save((err, result) => {
    if (err) console.log(err);
    else
      res.redirect('/admin/blog-post-management');
  });
};

exports.getEditBlogPost = async (req, res) => {
  const postId = req.params.id;
  let messages = req.flash('errors');
  let blogPost = await BlogPost.findOne({ _id: postId });
  let category = await Category.find();
  let listTagName = [];
  for (let tagId of blogPost.tagID) {
    let tagPost = await Tag.find({ _id: tagId });
    for (let tagName of tagPost) {
      listTagName.push(tagName.name);
    }
  }
  res.render('blog/edit-blog-post', {
    title    : 'Edit Post',
    post     : blogPost,
    category : category,
    messages: messages,
    tag      : listTagName,
    pageName : 'blog-post-management',
    csrfToken: req.csrfToken()
  });
};

exports.postEditBlogPost = async function editPost(req, res, next) {
  const postId = req.params.id;

  const tagStr  = req.body.tagID.toLowerCase();
  const tagArrs = tagStr.split(",");

  let newTagArrs = [];
  let tags = await Tag.find({ status: true });
  let test = tagArrs.map(async (tag, newIdTag) => {
    newIdTag = [];
    let check = tags.find(oldTag => oldTag.name === tag);
    if (check === undefined) {
      newTagArrs.push(tag);

      let tagNew = new Tag({
        name: tag,
        status: true
      });

      let tagId = await tagNew.save();
      newIdTag.push(tagId._id);
    }
    else {
      newIdTag.push(check._id);
    }
    return newIdTag;
  });
  newIdTag = await Promise.all(test).then(result => {
    return result.map(data => data);
  });

  let idTag = [];

  for (let idArr of newIdTag){
    idTag.push(idArr[0]);
  }

  BlogPost.findById(postId, (err, post) => {
    if (err) console.log(err);
    else {
      if (req.file === undefined)
        post.imagePath = post.imagePath;
      else {
        let filePath = './public/uploads/' + post.imagePath;
        fs.unlinkSync(filePath, (err) => {
          if (err) console.log("Couldn't delete" + post.imagePath + "image");
        });

        post.imagePath ='/uploads/' + req.file.filename;
      }
      post.createTime   = post.createTime;
      post.author       = post.author;
      post.title        = req.body.title !== null ? req.body.title : post.title;
      post.shortContent = req.body.shortContent !== null ? req.body.shortContent : post.shortContent;
      post.content      = req.body.content !== null ? req.body.content : post.content;
      post.tagID        = idTag;
      post.categoryID   = req.body.categoryID !== null ? req.body.categoryID : post.categoryID;
      post.status       = req.body.status !== null ? req.body.status : post.status;

      post.save((err, result) => {
        if (err) console.log(err);
        else
          res.redirect('/admin/blog-post-management');
      });
    }
  });
}

exports.getDeleteBlogPost = (req, res, next) => {
  const postId = req.params.id;
  BlogPost.findByIdAndRemove(postId, (err, blogtag) => {
    if (err) console.log(err);
    else
      res.redirect('/admin/blog-post-management');
  });
}
