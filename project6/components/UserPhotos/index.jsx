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
  Divider 
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
      photos: [],
      loading: true,
      error: null,
      currentPhotoIndex: 0  // 初始化当前照片索引
    };
  }

  componentDidMount() {
    // 组件挂载时获取照片数据
    this.fetchPhotos();
  }

  componentDidUpdate(prevProps) {
    // 当userId变化时重新获取数据
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchPhotos();
    }

    // 当 URL 中的 photoId 变化时更新当前照片索引
    if (this.props.match.params.photoId !== prevProps.match.params.photoId) {
      const { photoId } = this.props.match.params;
      if (photoId) {
        const index = this.state.photos.findIndex(p => p._id === photoId);
        if (index !== -1) {
          this.setState({ currentPhotoIndex: index });
        }
      }
    }
  }

  fetchPhotos = () => {
    const {userId} = this.props.match.params;

    // 重置状态
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
        // 处理成功响应，将数据存入状态
        this.setState({
          photos: response.data, loading: false,
          // 如果有 photoId 参数，设置对应的索引
          currentPhotoIndex: this.getInitialPhotoIndex(response.data)
        });
      })
      .catch((error) => {
        // 处理错误响应，打印错误信息并更新状态
        console.error('Image loading failed! ',error)
        this.setState({error, loading: false});
      })
  };

  // 根据 URL 中的 photoId 参数确定初始照片索引
  getInitialPhotoIndex(photos) {
    const { photoId } = this.props.match.params;
    if (photoId) {
      const index = photos.findIndex(p => p._id === photoId);
      return index !== -1 ? index : 0;
    }
    return 0;
  }

  // 将日期字符串格式化为友好格式
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // 处理上一张照片
  handlePrevious = () => {
    this.setState(prevState => ({
      currentPhotoIndex: Math.max(prevState.currentPhotoIndex - 1, 0)
    }), this.updateUrl);
  };

  // 处理下一张照片
  handleNext = () =>{
    this.setState(prevState => ({
      currentPhotoIndex: Math.min(
        prevState.photos.length - 1,
        prevState.currentPhotoIndex + 1
      )
    }), this.updateUrl);
  };

  // 更新 URL 以反映当前照片
  updateUrl = () => {
    const { userId } = this.props.match.params;
    const { photos, currentPhotoIndex } = this.state;
    const photoId = photos[currentPhotoIndex]?._id;

    if (photoId) {
      // 更新 URL 但不触发页面刷新
      this.props.history.replace(`/photos/${userId}/photo/${photoId}`);
    }
  }

  // 渲染步进器视图（高级功能）
  renderStepperView() {
    const { photos, currentPhotoIndex, loading, error } = this.state;

    if (loading) return <Typography>Loading photo...</Typography>;
    if (error) return <Typography>Photo failed to load!: {error.statusText || 'Unknown error!'}</Typography>;
    if (!photos.length) return <Typography>This user has no photos...</Typography>;

    const photo = photos[currentPhotoIndex];
    const isFirst = currentPhotoIndex === 0;  // 第一页索引为 0
    const isLast = currentPhotoIndex === photos.length - 1;

    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={this.handlePrevious}
            disabled={isFirst}
            color="primary"
            size="large"
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <Card sx={{ flex: 1, maxWidth: 600 }}>
            <CardMedia 
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`Photo ${currentPhotoIndex + 1}`}
              onError={(e) => {
                e.target.src = "https://picsum.photos/600/400";
                e.target.alt = "Photo placeholder";
              }}
              sx={{ maxHeight: "70vh", objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Photo {currentPhotoIndex + 1} of {photos.length}
              </Typography>
              <Typography>
                Taken on: {this.formatDate(photo.date_time)}
              </Typography>
            </CardContent>
          </Card>

          <IconButton
            onClick={this.handleNext}
            disabled={isLast}
            color="primary"
            size="large"
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Comments
          </Typography>

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
                <Typography variant="body2" color="text.secondary">
                  {this.formatDate(comment.date_time)}
                </Typography>

                <Typography variant="body1" sx={{ mt: 1 }}>
                  <Link 
                    component="button"
                    onClick={() => this.props.history.push(`/users/${comment.user._id}`)}
                    sx={{ cursor: "pointer", fontWeight: "bold" }}
                  >
                    {`${comment.user.first_name} ${comment.user.last_name}`}
                  </Link>
                </Typography>

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

    // 加载状态显示
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
        {photos.map((photo) => (
          <div key={photo._id} style={{marginBottom: '20px'}}>
            <img src={`images/${photo.file_name}`} 
            alt={photo._id}
            style={{maxWidth: '100%', marginBottom: '10px'}}
            onError={(e) => {
              e.target.src = "https://picsum.photos/200/300"; // 图片加载失败时显示默认图
              e.target.alt = "Photo placeholder";
            }}

            onClick={() => {
              // 只有当高级功能开启时，才触发跳转
              if (this.props.advancedFeatures) {
                this.props.history.push(`/photos/${this.props.match.params.userId}/photo/${photo._id}`);
              }
            }}
          />
            <Typography variant="body1">Date: {this.formatDate(photo.date_time)}</Typography>
            <Typography variant="h6">Comments: </Typography>
            {/* 评论及评论创建者信息 */}
            {photo.comments?.length ? (
              photo.comments.map((comment) => (
                <div 
                  key={comment._id} 
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

  render() {
    const { advancedFeatures } = this.props;
    const { photos } = this.state;

    // 如果有特定的 photoId 参数，强制使用高级视图
    const hasPhotoId = this.props.match.params.photoId;


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

// const UserPhotos = () => {
//   const { userId } = useParams();
//   const [photos, setPhotos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchPhotos = async () => {
//       try {
//         const { data } = await fetchModel(`http://localhost:3000/photosOfUser/${userId}`);
//         setPhotos(data);
//       } catch (error) {
//         setError(error);
//         console.error('Error loading user photo: ', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPhotos();
//   }, [userId]);

//   if (loading) return <Typography>loading...</Typography>;
//   if (error) return <Typography color="error">Failed to load the photo: {error.statusText}</Typography>
//   if (!photos.length) return <Typography>No image available</Typography>;

//   return (
//     <Box p={3}>
//       <Grid container spacing={3}>
//         {photos.map((photo) => (
//           <Grid item key={photo._id} xs={12} sm={6} md={4}>
//             <Card sx={{height: "100%"}}>
//               <CardMedia
//                 component="img"
//                 height="200"
//                 image={`/images/${photo.file_name}`}
//                 alt={`Photo by ${userId}`}
//                 onError={(e) => {
//                   e.target.src = "https://picsum.photos/200/300";
//                   e.target.alt = "Failed to load...";
//                 }}
//               />
//               <CardContent>
//                 <Typography variant="body2" color="text.secondary">
//                   {new Date(photo.date_time).toLocaleDateString()}
//                 </Typography>
//                 <Divider sx={{my: 2}}/>
//                 <Typography variant="h6" mb={2}>Comment</Typography>
//                 {photo.comments?.length ? (
//                   photo.comments.map((comment) => (
//                     <Box key={comment._id} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
//                       <Typography variant="body2" color="text.secondary">
//                         {new Date(comment.date_time).toLocaleString()}
//                       </Typography>
//                       <Typography variant="body1">
//                         <Link href={`/users/${comment.user._id}`} underline="hover">
//                           {`${comment.user.first_name} ${comment.user.last_name}`}
//                         </Link>
//                       </Typography>
//                       <Typography variant="body2">{comment.comment}</Typography>
//                     </Box>
//                   ))
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">
//                       No comments yet...
//                     </Typography>
//                   )
//                 }
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   )
// }

export default withRouter(UserPhotos);
