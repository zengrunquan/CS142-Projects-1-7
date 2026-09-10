/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.setHeader('Content-Type', 'application/json'); // 添加响应头
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.setHeader('Content-Type', 'application/json'); // 添加响应头
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.setHeader('Content-Type', 'application/json'); // 添加响应头
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.setHeader('Content-Type', 'application/json'); // 添加响应头
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.setHeader('Content-Type', 'application/json'); // 添加响应头
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.setHeader('Content-Type', 'application/json'); // 添加响应头
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  // response.status(200).send(cs142models.userListModel());

  // 使用 User 模型的 find 方法查询所有用户，并使用 select 方法仅选择所需的字段
  User.find({}, 'first_name last_name _id')
    .exec()
    .then(users => {
      // 将查询结果作为响应返回，状态码 200
      response.status(200).send(users);
    })
    .catch(err => {
      // 如果查询过程中出现错误，打印错误信息并返回 500 状态码和错误信息
      console.error("Error fetching user list: ", err);
      response.status(500).send(JSON.stringify(err));
    });
});

// 添加新的 API ：返回带照片和评论技术的用户列表
app.get("/user/listWithCounts", function(request, response){
  User.aggregate([
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "user_id",
        as: "photos"
      }
    },
    {
      $lookup: {
        from: "photos",
        let: { userId: "$_id" },
        pipeline: [
          { $unwind: "$comments" },
          { $match: {$expr: { $eq: ["$comments.user_id", {$toObjectId: "$$userId"}] } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: "commentCount"
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        photo_count: { $size: "$photos" },
        comment_count: { $ifNull: [{ $arrayElemAt: ["$commentCount.count", 0] }, 0] }
      }
    }
  ])
  .exec()
  .then(users => {
    response.status(200).send(users);
  })
  .catch(err => {
    console.error("Error fetching user list with counts: ", err);
    response.status(500).send(JSON.stringify({
      message: err.message,
      stack: err.stack
  }));
  });
});

// 添加新API: 返回用户的所有评论
app.get("/commentsOfUser/:id", function(request, response) {
  const userId = request.params.id;

  Photo.aggregate([
    { $unwind: "$comments" },
    { $match: { "comments.user_id": mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",  // 照片所有者
        foreignField: "_id",
        as: "photoOwner"
      }
    },
    {
      $project: {
        _id: "$comments._id",
        comment: "$comments.comment",
        date_time: "$comments.date_time",
        photo_id: "$_id",
        file_name: "$file_name",
        photo_owner: {
          $arrayElemAt: [
            {
              $map: {
                input: "$photoOwner",
                as: "owner",
                in: {
                  _id: "$$owner._id",
                  first_name: "$$owner.first_name",
                  last_name: "$$owner.last_name"
                }
              }
            },
            0
          ]
        }
      }
    }
  ])
  .exec()
  .then(comments => response.status(200).send(comments))
  .catch(err => {
    console.error("Error fetching user comments: ", err);
    response.status(500).send(JSON.stringify(err));
  })
})

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  // 从请求参数中获取用户的 _id
  const id = request.params.id;
  // const user = cs142models.userModel(id);
  User.findById(id, 'first_name last_name _id location description occupation')
    .exec()
    .then(user => {
      if (user === null) {
        // 如果未找到用户，打印信息并返回 400 状态码和提示信息
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      } else {
        // 如果找到用户，将用户信息作为响应返回，状态码为 200
        response.status(200).send(user);
      }
    })
    .catch(err => {
      // 如果查询过程中出现错误，打印错误信息并返回 500 状态码和错误信息
      console.error("Error fetching user detail: ", err);
      response.status(500).send(JSON.stringify(err));
    })
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  // 从请求参数中获取用户的 _id
  const id = request.params.id;
  // 使用 Photo 模型的 find 方法，根据 user_id 查询照片，并使用 populate 方法填充评论中用户信息
  // const photos = cs142models.photoOfUserModel(id);

  // 验证ID格式
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }

  Photo.find({user_id: id})
    .populate({
      path: 'comments.user_id',
      select: 'first_name last_name _id'
    })
    .exec()
    .then(photos => {
      if (photos.length === 0 || !photos) {
        // 如果未找到照片，打印信息并返回 400 状态码和提示信息
        console.log("Photos for user with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      } else {
        // 对照片数据进行处理，将评论中的用户信息提取出来
        const processedPhotos = photos.map(photo => {
          // 照片所有者就是当前用户（因为查询的就是该用户）
          const photoOwner = {
            _id: id,
            first_name: photo.comments.length > 0 ?
              photo.comments[0].user_id?.first_name : "Unknown",
            last_name: photo.comments.length > 0 ? 
              photo.comments[0].user_id?.last_name : "User"
          };

          // 处理评论
          const processedComments = photo.comments.map( comment => {
            return {
              comment: comment.comment,
              date_time: comment.date_time,
              _id: comment._id,
              user: {
                _id: comment.user_id._id,
                first_name: comment.user_id.first_name,
                last_name: comment.user_id.last_name
              }
            }
          });
          return {
            _id: photo._id,
            user_id: photo.user_id,
            photo_owner: photoOwner, // 添加所有者信息
            comments: processedComments,
            file_name: photo.file_name,
            date_time: photo.date_time
          };
        });
        // 将处理后的照片数据作为响应返回，状态码为 200
        response.status(200).send(processedPhotos);
      }
    })
    .catch(err => {
      // 如果查询过程中出现错误，打印错误信息并返回 500 状态码和错误信息
      console.error("Error fetching photos of user: ", err);
      response.status(500).send(JSON.stringify(err));
    });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
