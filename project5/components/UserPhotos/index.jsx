import React, { Component } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Link,
  Box,
  Divider 
} from "@mui/material";
import { withRouter } from "react-router-dom";

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
      loding: true,
      error: null
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
  }

  fetchPhotos = () => {
    const {userId} = this.props.match.params;

    // 重置状态
    this.setState({loading: true, error: null});

    // 从服务器获取照片数据
    fetchModel(`/photosOfUser/${userId}`)
      .then(({data}) => {
        this.setState({photos: data, loading: false});
      })
      .catch(error => {
        console.error('Image loading failed!', error)
        this.setState({error, loading: false});
      });
  };

  // 将日期字符串格式化为友好格式
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  render() {
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
                      {`${comment.user.first_name} ${comment.user.last_name}`}
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

            <Divider style={{ margin: '20px 0' }} />
          </div>
        ))}
      </div>
    );
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
