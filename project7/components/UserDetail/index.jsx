import React, { useEffect, useState } from "react";
import { Typography, CircularProgress, Link, Divider, Card, CardContent, Button, Box } from "@mui/material";
import { withRouter } from "react-router-dom";

import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';

import "./styles.css";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,       // 存储用户数据
      loading: true,    // 加载状态
      error: null       // 错误信息
    };
  }

  componentDidMount() {
    // 组件挂载时获取用户数据
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    // 当userId变化时重新获取数据
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchUser();
    }
  }

    // 从服务器获取用户数据
  fetchUser = () => {
    const { userId } = this.props.match.params;
    
    // 重置状态
    this.setState({ loading: true, error: null });
    
    // // 使用fetchModel获取用户数据
    // fetchModel(`/user/${userId}`)
    //   .then(({ data }) => {
    //     this.setState({ user: data, loading: false });
    //   })
    //   .catch(error => {
    //     console.error('Failed to load user data: ', error);
    //     this.setState({ error, loading: false });
    //   });

    // 使用 axios.get 从服务器获取用户数据
    axios.get(`/user/${userId}`)
      .then((response) => {
        this.setState({ user: response.data, loading: false});
      })
      .catch(error => {
        // 处理错误响应，打印错误信息并更新状态
        console.error('Failed to load user data! ', error);
        this.setState({ error, loading: false});
      })

  };

  render() {
    // const { match } = this.props;
    // // 根据 userId 获取用户信息 user
    // const userId = match.params.userId;
    // const user = window.cs142models.userModel(userId);

    const { user, loading, error } = this.state;
    const { history } = this.props;

    // user初始值就为 null ,所以先加载信息判断 loading 状态
    // 加载状态显示
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" ml={2}>Loading user information...</Typography>
        </Box>
      );
    }

    // 错误状态显示
    if (error) {
      return (
        <Typography color="error" mt={4}>
          Failed to load user information: {error.statusText || 'Unknown error'}
        </Typography>
      );
    }

    if (!user) {
      return <Typography mt={4}>User not found!</Typography>
    }

    return (
      // <Typography variant="body1">
      //   This should be the UserDetail view of the PhotoShare app. Since it is
      //   invoked from React Router the params from the route will be in property
      //   match. So this should show details of user:
      //   {this.props.match.params.userId}. You can fetch the model for the user
      //   from window.cs142models.userModel(userId).
      // </Typography>

      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Location: </strong> {user.location}
            </Typography>
            
            <Typography variant="body1" mt={1}>
              <strong>Occupation: </strong> {user.occupation}
            </Typography>
            
            <Typography variant="body1" mt={1}>
              <strong>Description: </strong> {user.description}
            </Typography>
          </Box>
          
          {/* 查看照片按钮 */}
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => history.push(`/photos/${user._id}`)}
          >
            View Photos
          </Button>

          {/* 按钮添加高级功能提示 */}
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Enable "Advanced Features" in the top bar for a better photo viewing experience
          </Typography>

        </CardContent>
      </Card>

    );
  }
}

// const UserDetail = () => {
//   const { userId } = useParams();
//   const [user, setUsers] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async() => {
//       try {
//         const { data } = await fetchModel(`/user/${userId}`);
//         setUsers(data);
//       } catch (error) {
//         console.error('User list retrieval failed: ', error);
//         setError(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, [userId]);

//   if (loading) return <Typography>loading...</Typography>;
//   if (error) return <Typography color="error">Failed to load user data: {error.statusText}</Typography>;
//   if (!user) return <Typography>User not found!</Typography>

  // return (
  //   <div>
  //        <Typography variant="h5">{`${user.first_name} ${user.last_name}`}</Typography>
  //        <Divider />
  //        <Typography variant="body1">Location: {user.location}</Typography>
  //        <Divider />
  //        <Typography variant="body1">Occupation: {user.occupation}</Typography>
  //        <Divider />
  //        <Typography variant="body1">Description: {user.description}</Typography>
  //        <Divider />
  //        {/* 提供照片链接 */}
  //        <Link onClick={() => history.push(`/photos/${userId}`)}>View Photos</Link>
  //   </div>

//   <Card sx={{maxWidth:600, mx: "auto"}}>
//     <CardContent>
//       <Typography variant="h4" gutterBottom>
//         {`${user.first_name} ${user.last_name}`}
//       </Typography>
//       <Divider sx={{ my: 2 }} />
//       <Box sx={{mb: 2}}>
//         <Typography variant="body1">
//           <strong>Location: </strong> {user.location}
//         </Typography>
//         <Typography>
//           <strong>Occupation: </strong> {user.occupation}
//         </Typography>
//         <Typography>
//           <strong>Description: </strong> {user.description}
//         </Typography>
//       </Box>
//       <Button variant="contained" color="primary" component="a" href={`/photos/${userId}`}>
//         View photos
//       </Button>
//     </CardContent>
//   </Card>
  // )
// }

export default withRouter(UserDetail);
