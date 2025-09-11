const BlogPost = require('../../../models/web-admin/post.model');
const Tag = require('../../../models/web-admin/tag.model');
const Category = require('../../../models/web-admin/categoryPost.model');

exports.getBLogPost = (req, res) => {
  BlogPost.find({ status: true }).sort([['createTime',-1]]).exec((err, post) => {
    // console.log(post);
    if (err) console.log(err);
    else {
      Tag.find({ status: true }, (err, tag) => {
        if (err) console.log(err);
        else {
          Category.find({ status: true },
            (err, category) => {
              if (err) console.log(err);
              else {
                res.json({
                  message: 'Success',
                  blog: post,
                  tag: tag,
                  category: category
                });
              }
            });
        }
      });
    }
  });
}
exports.getSearchPost = (req, res) => {
  let query = req.query;
  BlogPost.find({'title' : new RegExp(query.title, 'i')} , (err, category) =>{
    res.json({
      message: 'Success',
      category: category
    });
  });
}
