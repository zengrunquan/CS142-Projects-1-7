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
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

// 指向 “当前脚本所在目录下的 images 文件夹” 的完整路径
const imagesDir = path.join(__dirname, 'images');
// 创建images目录（如果不存在）
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const processFormBody = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB限制
}).single('uploadedphoto');

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
// 先注册会话中间件
app.use(session({ 
  secret: "secretKey", 
  resave: false, 
  saveUninitialized: false,
  cookie: { secure: false } // 开发环境使用
}));

// 会话验证接口
app.get('/test/session-validate', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).send('Session invalid');
  }
});

// 注册 bodyParser 用于解析 JSON
app.use(bodyParser.json());
// 静态文件服务
app.use(express.static(__dirname));

// 添加会话检查中间件
app.use((req, res, next) => {
  // 允许无需登录的端点
  const openEndpoints = [
    '/admin/login', 
    '/admin/logout', 
    '/', 
    '/user', // 注册端点
    '/test/session-validate', // 添加会话验证端点
    '/test',  // 允许所有/test路径
  ];

  // 修改为检查路径前缀
  const isOpenEndpoint = openEndpoints.some(endpoint => 
    req.path.startsWith(endpoint)
  );
  
  if (isOpenEndpoint) {
    return next();
  }
  
  // 检查会话
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
});

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

// 添加用户注册API
app.post("/user", function (req, res) {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // 验证必填字段
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("Missing required fields");
  }

  // 检查login_name是否已存在
  User.findOne({ login_name: login_name }, function (err, existingUser) {
    if (err) {
      console.error("Error checking login_name uniqueness:", err);
      return res.status(500).send("Internal server error");
    }
    if (existingUser) {
      return res.status(400).send("Login name already exists");
    }

    // 创建新用户
    const newUser = new User({
      login_name,
      password, // 注意：这里存储的是明文密码
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    newUser.save(function (err) {
      if (err) {
        console.error("Error saving new user:", err);
        return res.status(500).send("Internal server error");
      }
      // 返回成功响应
      res.status(200).send({ 
        login_name: newUser.login_name,
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      });
    });
  });
});

// 修改登录API以支持密码验证
app.post("/admin/login", function (req, res) {
  const loginName = req.body.login_name;
  const password = req.body.password;
  
  if (!loginName || !password) {
    return res.status(400).json({ error: "Missing login name or password" });
  }
  
  User.findOne({ login_name: loginName }, function (err, user) {
    if (err) {
      console.error("Error in /admin/login:", err);
      return res.status(500).send(JSON.stringify(err));
    }
    
    if (!user) {
      return res.status(400).json({ error: "Invalid login name" });
    }
    
    // 检查密码（明文比较）
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }
    
    // 设置会话
    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    // 返回客户端需要的数据
    res.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    });
  });
});

/**
 * URL /commentsOfPhoto/:photo_id - 添加评论到指定照片
 */
app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  // 检查用户是否登录
  if (!request.session.user) {
    return response.status(401).send("Unauthorized: User not logged in");
  }

  const photoId = request.params.photo_id;
  const commentText = request.body.comment;

  // 验证评论内容
  if (!commentText || commentText.trim() === "") {
    return response.status(400).send("Comment cannot be empty");
  }

  // 创建新评论对象
  const newComment = {
    _id: new mongoose.Types.ObjectId(),
    comment: commentText.trim(),
    date_time: new Date().toISOString(),
    user_id: request.session.user._id,
  };

  // 更新照片的评论数组
  Photo.findByIdAndUpdate(
    photoId,
    { $push: { comments: newComment } },
    { new: true, runValidators: true }
  )
    .then(photo => {
      if (!photo) {
        return response.status(404).send("Photo not found");
      }
      // 填充用户信息后返回
      return Photo.populate(photo, { 
        path: 'comments.user_id',
        select: 'first_name last_name _id'
      });
    })
    .then(updatedPhoto => {
      // 找到刚添加的评论并返回
      const addedComment = updatedPhoto.comments[updatedPhoto.comments.length - 1];
      response.status(200).send(addedComment);
    })
    .catch(err => {
      console.error("Error adding comment:", err);
      response.status(500).send("Error adding comment to photo");
    });
});

// 照片上传路由
app.post('/photos/new', (req, res) => {
  // 检查用户登录状态
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  processFormBody(req, res, (err) => {
    if (err) {
      return res.status(400).send('Error processing file');
    }

    if (!req.file) {
      return res.status(400).send('No photo uploaded');
    }

    // 验证文件类型
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).send('File is not an image');
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = path.extname(req.file.originalname);
    const filename = `U${timestamp}${extension}`;
    const filePath = path.join(imagesDir, filename);

    // 保存文件
    fs.writeFile(filePath, req.file.buffer, (err) => {
      if (err) {
        console.error('Error saving photo:', err);
        return res.status(500).send('Error saving photo');
      }

      // 创建新照片记录
      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: req.session.user._id
      });

      newPhoto.save((err, savedPhoto) => {
        if (err) {
          console.error('Error saving photo to database:', err);
          return res.status(500).send('Error saving photo to database');
        }
        res.status(200).json(savedPhoto);
      });
    });
  });
});

// 登出端点
app.post("/admin/logout", function (req, res) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.status(200).json({ message: "Logged out" });
  });
});

// app.use(requireLogin);  // 保护所有API端点（除了登录/登出）

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
