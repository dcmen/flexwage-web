const BlogPost = require('../../../models/web-admin/post.model');
const Tag = require('../../../models/web-admin/tag.model');
const Category = require('../../../models/web-admin/categoryPost.model');

exports.getBLogPost = (req, res, next) => {
  BlogPost.find({ status: true }).sort([['createTime',-1]]).exec((err, post) => {
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

app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;
    if (queryParams.hasOwnProperty('search') && queryParams.search.length > 0) {
      filteredTodos = _.filter(filteredTodos, function(item) {
        return item.description.indexOf(queryParams.search) > -1
      });
    }
  
    res.json(filteredTodos);
  });