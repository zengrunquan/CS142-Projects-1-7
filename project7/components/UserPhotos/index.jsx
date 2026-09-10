import React, { Component } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Link,
  Box,
  Divider,
  TextField,
} from "@mui/material";
import { withRouter } from "react-router-dom";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';

import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    
    // 初始化状态
    this.state = {
      photos: [],            // 存储照片数据
      loading: true,         // 加载状态标志
      error: null,           // 错误信息
      currentPhotoIndex: 0,  // 初始化当前照片索引

      // 评论相关状态
      newComment: "",        // 新评论内容
      commentError: null     // 评论错误信息
    };
  }

  // 组件挂载后调用
  componentDidMount() {
    // 组件挂载时获取照片数据
    this.fetchPhotos();
  }

  // 组件更新后调用
  componentDidUpdate(prevProps) {
    // 当userId变化时重新获取数据
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchPhotos();
    }

    // 当 URL 中的 photoId 变化时更新当前照片索引
    if (this.props.match.params.photoId !== prevProps.match.params.photoId) {
      const { photoId } = this.props.match.params;
      if (photoId) {
        // 在照片数组中查找匹配的照片索引
        const index = this.state.photos.findIndex(p => p._id === photoId);
        if (index !== -1) {
          this.setState({ currentPhotoIndex: index });
        }
      }
    }
  }

  // 获取用户照片数据
  fetchPhotos = () => {
    const {userId} = this.props.match.params;

    // 重置状态为加载中
    this.setState({loading: true, error: null});

    // // 从服务器获取照片数据
    // fetchModel(`/photosOfUser/${userId}`)
    //   .then(({data}) => {
    //     this.setState({photos: data, loading: false});
    //   })
    //   .catch(error => {
    //     console.error('Image loading failed!', error)
    //     this.setState({error, loading: false});
    //   });

    // 使用 axios.get 从服务器获取照片数据
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        console.log("Photos data:", response.data); // 调试：打印数据
        // 处理成功响应，将数据存入状态
        this.setState({
          photos: response.data, loading: false,
          // 根据URL中的photoId设置初始照片索引
          currentPhotoIndex: this.getInitialPhotoIndex(response.data)
        });
      })
      .catch((error) => {
        // 处理错误响应，打印错误信息并更新状态
        console.error('Image loading failed! ',error);
        
        // 如果是401错误（未授权），重定向到登录页面
        if (error.response && error.response.status === 401) {
          this.props.history.push('/login-register');
        } else {
          this.setState({error, loading: false});
        }
      })
  };

  // 根据 URL 中的 photoId 参数确定初始照片索引
  getInitialPhotoIndex(photos) {
    const { photoId } = this.props.match.params;
    if (photoId) {
      const index = photos.findIndex(p => p._id === photoId);
      return index !== -1 ? index : 0;  // 找到返回索引，否则返回0
    }
    return 0;  // 默认显示第一张
  }

  // 将日期字符串格式化为友好格式
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();  // 转换为本地时间格式
  }

  // 处理上一张照片
  handlePrevious = () => {
    this.setState(prevState => ({
      // 确保不小于0
      currentPhotoIndex: Math.max(prevState.currentPhotoIndex - 1, 0)
    }), this.updateUrl);  // 更新后同步URL
  };

  // 处理下一张照片
  handleNext = () =>{
    this.setState(prevState => ({
      currentPhotoIndex: Math.min(
        prevState.photos.length - 1,  // 最大索引
        prevState.currentPhotoIndex + 1  // 当前索引+1
      )
    }), this.updateUrl);  // 更新后同步URL
  };

  // 更新 URL 以反映当前照片
  updateUrl = () => {
    const { userId } = this.props.match.params;
    const { photos, currentPhotoIndex } = this.state;
    const photoId = photos[currentPhotoIndex]?._id;

    if (photoId) {
      // 使用history替换当前URL（不添加新历史记录）
      this.props.history.replace(`/photos/${userId}/photo/${photoId}`);
    }
  }

  // 处理评论输入变化
  handleCommentChange = (e) => {
    this.setState({ newComment: e.target.value, commentError: null });
  };

  // 提交评论处理
  handleCommentSubmit = (e) => {
    e.preventDefault();
    const { newComment } = this.state;
    // const { photoId } = this.props.match.params;
    const { loggedInUser } = this.props;  // 从props获取登录用户

    // 验证用户是否登录
    if (!loggedInUser) {
      this.setState({ commentError: "Please log in to comment" });
      return;
    }

    // 验证评论内容
    if (!newComment.trim()) {
      this.setState({ commentError: "Comment cannot be empty" });
      return;
    }

    const { photos, currentPhotoIndex } = this.state;
    const photoId = photos[currentPhotoIndex]._id; // 使用当前照片的ID

    // 发送POST请求添加评论
    fetch(`/commentsOfPhoto/${photoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ comment: newComment })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || "Failed to add comment");
          });
        }
        return response.json();
      })
      .then(comment => {
        // 提交成功后，更新当前照片的评论列表
        this.setState(prevState => {
          // 复制photos数组
          const updatedPhotos = [...prevState.photos];
          // 找到当前照片的索引
          const photoIndex = updatedPhotos.findIndex(p => p._id === photoId);
          if (photoIndex !== -1) {
            // 给新评论补充用户信息
            const commentWithUser = {
              ...comment,
              user: {
                _id: loggedInUser._id,
                first_name: loggedInUser.first_name,
                last_name: loggedInUser.last_name
              }
            };
            // 更新当前照片的评论列表
            updatedPhotos[photoIndex] = {
              ...updatedPhotos[photoIndex],
              comments: [...(updatedPhotos[photoIndex].comments || []), commentWithUser]
            };
          }
          // 返回更新后的状态
          return {
            photos: updatedPhotos,
            newComment: "",  // 清空评论输入框
            commentError: null
          };
        });
      })
      .catch(error => {
        console.error("Error adding comment:", error);
        this.setState({ commentError: error.message });
      });
  };

  // 渲染步进器视图（高级功能）
  renderStepperView() {
    const { photos, currentPhotoIndex, loading, error, newComment, commentError } = this.state;
    const { loggedInUser } = this.props;  // 获取当前登录用户信息

    // 处理不同状态
    if (loading) return <Typography>Loading photo...</Typography>;
    if (error) return <Typography>Photo failed to load!: {error.statusText || 'Unknown error!'}</Typography>;
    if (!photos.length) return <Typography>This user has no photos...</Typography>;

    const photo = photos[currentPhotoIndex];  // 获取当前照片
    const isFirst = currentPhotoIndex === 0;  // 是否第一张（第一页索引为 0）
    const isLast = currentPhotoIndex === photos.length - 1;  // 是否最后一张

    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        {/* 照片显示区域（保持不变） */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}>
          {/* 上一张按钮 */}
          <IconButton
            onClick={this.handlePrevious}
            disabled={isFirst}
            color="primary"
            size="large"
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          {/* 照片卡片 */}
          <Card sx={{ flex: 1, maxWidth: 600 }}>
            <CardMedia 
              component="img"
              image={`/images/${photo.file_name}`}  // 照片路径
              alt={`Photo ${currentPhotoIndex + 1}`}
              onError={(e) => {  // 图片加载失败处理
                e.target.src = "https://picsum.photos/600/400";
                e.target.alt = "Photo placeholder";
              }}
              sx={{ maxHeight: "70vh", objectFit: "contain" }}  // 样式控制
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {/* 样式控制 */}
                Photo {currentPhotoIndex + 1} of {photos.length}
              </Typography>
              <Typography>
                {/* 拍摄时间 */}
                Taken on: {this.formatDate(photo.date_time)}
              </Typography>
            </CardContent>
          </Card>

          {/* 下一张按钮 */}
          <IconButton
            onClick={this.handleNext}
            disabled={isLast}
            color="primary"
            size="large"
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* 评论区域 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Comments
          </Typography>

          {/* 评论输入区域 */}
          <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a Comment
            </Typography>
            {/* 错误信息显示 */}
            {commentError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {commentError}
              </Typography>
            )}
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Write your comment..."
              value={newComment}
              onChange={this.handleCommentChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleCommentSubmit}
              disabled={!loggedInUser}  // 未登录时禁用提交按钮
            >
              Post Comment
            </Button>
          </Box>

          {/* 现有评论列表 */}
          {photo.comments?.length ? (
            photo.comments.map((comment) => (
              <Box 
                key={comment._id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                {/* 评论时间 */}
                <Typography variant="body2" color="text.secondary">
                  {this.formatDate(comment.date_time)}
                </Typography>

                {/* 评论者信息（带链接） */}
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <Link 
                    component="button"
                    onClick={() => this.props.history.push(`/users/${comment.user._id}`)}
                    sx={{ cursor: "pointer", fontWeight: "bold" }}
                  >
                    {`${comment.user.first_name} ${comment.user.last_name}`}
                  </Link>
                </Typography>

                {/* 评论内容 */}
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {comment.comment}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              No comments yet!
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  // 渲染基本视图（所有照片）
  renderBasicView() {
    // // 从 props.match 中获取路由参数
    // const { match } = this.props; 
    // const userId = match.params.userId;
    // const photos = window.cs142models.photoOfUserModel(userId);

    const { photos, loading, error } = this.state;
    // 从 props 获取 history
    const { history } = this.props;

    // 处理不同状态
    if (loading) return <Typography>Loading photo...</Typography>;
    if (error) return <Typography>Photo failed to load!: {error.statusText || 'Unknown error!'}</Typography>;
    if (!photos.length) return <Typography>This user has no photos...</Typography>;

    return (
      // <Typography variant="body1">
      //   This should be the UserPhotos view of the PhotoShare app. Since it is
      //   invoked from React Router the params from the route will be in property
      //   match. So this should show details of user:
      //   {this.props.match.params.userId}. You can fetch the model for the user
      //   from window.cs142models.photoOfUserModel(userId):
      //   <Typography variant="caption">
      //     {JSON.stringify(
      //       window.cs142models.photoOfUserModel(this.props.match.params.userId)
      //     )}
      //   </Typography>
      // </Typography>

      <div>
        {/* 遍历所有照片 */}
        {photos.map((photo) => (
          <div key={photo._id} style={{marginBottom: '20px'}}>
            {/* 照片显示 */}
            <img src={`images/${photo.file_name}`} 
            alt={photo._id}
            style={{maxWidth: '100%', marginBottom: '10px'}}
            onError={(e) => {  // 图片加载失败处理
              e.target.src = "https://picsum.photos/200/300"; // 图片加载失败时显示默认图
              e.target.alt = "Photo placeholder";
            }}

            onClick={() => {
              // 只有当高级功能开启时，才触发跳转(点击照片跳转到单图视图)
              if (this.props.advancedFeatures) {
                this.props.history.push(`/photos/${this.props.match.params.userId}/photo/${photo._id}`);
              }
            }}
          />
            {/* 照片信息 */}
            <Typography variant="body1">Date: {this.formatDate(photo.date_time)}</Typography>
            <Typography variant="h6">Comments: </Typography>

            {/* 评论及评论创建者信息 */}
            {photo.comments?.length ? (
              photo.comments.map((comment) => (
                <div 
                  key={comment._id} // 为每个评论项设置唯一 key（comment._id）
                  style={{ 
                    margin: '10px 0', 
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}
                >
                  <Typography variant="body2">
                    Comment time: {this.formatDate(comment.date_time)}
                  </Typography>
                  
                  {/* 评论者链接 */}
                  <Typography variant="body1">
                    Commenter:{" "}
                    <Link 
                      component="button"
                      onClick={() => history.push(`/users/${comment.user._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {`${comment.user?.first_name} ${comment.user?.last_name}`}
                    </Link>
                  </Typography>
                  
                  {/* 评论内容 */}
                  <Typography variant="body1">
                    Comment content: {comment.comment}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography variant="body2" style={{ fontStyle: 'italic' }}>
                No comments yet!
              </Typography>
            )}

            {/* 显示额外评论数量 */}
            {photo.comments?.length > 2 && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                + {photo.comments.length - 2} more comments
              </Typography>
            )}

            <Divider style={{ margin: '20px 0' }} />
          </div>
        ))}
      </div>
    );
  }

  // 主渲染
  render() {
    const { advancedFeatures } = this.props;
    const { photos } = this.state;

    // 如果有特定的 photoId 参数，强制使用高级视图
    const hasPhotoId = this.props.match.params.photoId;


    // 渲染逻辑：
    // 1. 如果URL中有photoId，强制使用步进器视图
    // 2. 如果开启了高级功能且有照片，使用步进器视图
    // 3. 否则使用基本视图

    // 优先处理有 photoId 的情况
    if (hasPhotoId) {
      return this.renderStepperView();
    }
    
    // 高级功能开启且没有指定 photoId 时
    if (advancedFeatures && photos.length > 0) {
      return this.renderStepperView();
    }
    
      return this.renderBasicView();
  }
}

export default withRouter(UserPhotos);
