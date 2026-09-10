import React, { useEffect, useState, Component } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Chip
} from "@mui/material";
import { Link, withRouter } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';

import "./styles.css";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],        // 存储用户列表
      loading: true,    // 加载状态
      error: null       // 错误信息
    };
  }

  componentDidMount() {
    // 组件挂载时获取用户列表
    this.fetchUsers();
  }
  
  componentDidUpdate(prevProps) {
    // 当高级功能状态改变时重新获取数据
    if (prevProps.advancedFeatures !== this.props.advancedFeatures) {
      this.fetchUsers();
    }
  }

  fetchUsers = () => {
    // 重置状态
    this.setState({loading: true, error: null});

    // // 使用 fetchModel 从服务器获取用户列表
    // fetchModel("/user/list")
    //   .then(({ data }) => {
    //     this.setState({ users: data, loading: false });
    //   })
    //   .catch(error => {
    //     console.error('Failed to load user list: ', error);
    //     this.setState({ error, loading: false });
    //   });

    const apiUrl = this.props.advancedFeatures ?
      `/user/listWithCounts` :
      `/user/list`;

    console.log("Fetching users from:", apiUrl);

    // 使用 axios.get 从服务器获取用户列表
    axios.get(apiUrl)
      .then((response) => {
        console.log("Users data received: ", response.data);

        // 确保数据有必要的字段
        const users = response.data.map(user => ({
          ...user,
          // 添加默认值以防服务器未返回
          photo_count: user.photo_count || 0,
          comment_count: user.comment_count || 0
        }));

        this.setState({users: response.data, loading: false});
      })
      .catch(error => {
        // 处理错误响应，打印错误信息并更新状态
        console.error('Failed to load user list! ', error.response ? error.response.data: error);
        this.setState({ error, loading: false});
      });
  };

  // 处理红色气泡点击跳转（核心修复）
  handleCommentChipClick = (e, userId) => {
    e.stopPropagation(); // 阻止事件冒泡到父级Link
    e.preventDefault();  // 阻止默认行为

    const targetPath = `/users/${userId}/comments`;
    const currentPath = this.props.history.location.pathname;

    // 解决重复路径警告：仅在路径不同时跳转
    if (currentPath !== targetPath) {
      this.props.history.push(targetPath);
    }
  };

  render() {
    // // 实现用户详细信息显示，首先获取所有用户列表 --> /modelData/photoApp.js
    // const users = window.cs142models.userListModel();
    const { users, loading, error } = this.state;
    const { advancedFeatures } = this.props;

    // 调试：检查第一个用户的数据结构
    if (users.length > 0) {
      console.log("First user in list:", users[0]);
      console.log(`Photo count: ${users[0].photo_count}, Comment count: ${users[0].comment_count}`);
    }

    // 加载状态显示
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" ml={2}>Loading user list...</Typography>
        </Box>
      );
    }
    
    // 错误状态显示
    if (error) {
      return (
        <Typography color="error" mt={4}>
          Failed to load user list: {error.message || 'Unknown error'}
        </Typography>
      );
    }
    
    // 用户列表为空状态显示
    if (users.length === 0) {
      return <Typography mt={4}>No users available</Typography>;
    }

    return (
      <div className="userList-container">
        {/* <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window. You might
          choose to use <a href=" ">Lists</a >{"https://mui.com/components/lists/"}
          and <a href="https://mui.com/components/dividers/">Dividers</a > to
          display your users like so:
        </Typography>
          <List component="nav">
            <ListItem>
              <ListItemText primary="Item #1" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Item #2" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Item #3" />
            </ListItem>
            <Divider />
          </List>
        <Typography variant="body1">
          The model comes in from window.cs142models.userListModel()
        </Typography> */}

        <nav>
          <List>
            {users.map((user, index) => (
              <React.Fragment key={user._id}>
                {/* 在 UserList 组件的 render 方法中 */}
                <ListItem disablePadding>
                  <Box display="flex" alignItems="center" width="100%">
                    {/* 用户名字部分 - 点击跳转到用户详情 */}
                    <ListItemButton 
                      component={Link} 
                      to={`/users/${user._id}`}
                      sx={{ flexGrow: 1, py: 1.5 }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="h6">
                            {`${user.first_name} ${user.last_name}`}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    
                    {/* 气泡计数部分 - 独立于用户名字 */}
                    {advancedFeatures && (
                      <Box display="flex" gap={1} sx={{ pr: 2 }}>
                        {/* 照片计数气泡 */}
                        <Chip 
                          label={user.photo_count}
                          size="small"
                          color="success"
                          sx={{ 
                            backgroundColor: 'green', 
                            color: 'white', 
                            fontWeight: 'bold', 
                            minWidth: 30,
                            height: 24
                          }}
                        />
                        
                        {/* 评论计数气泡（可点击） */}
                        <Chip
                          label={user.comment_count}
                          size="small"
                          color="error"
                          sx={{ 
                            backgroundColor: 'red', 
                            color: 'white', 
                            fontWeight: 'bold',
                            minWidth: 30,
                            height: 24,
                            cursor: 'pointer' 
                          }}
                          onClick={(e) => this.handleCommentChipClick(e, user._id)}
                        />
                      </Box>
                    )}
                  </Box>
                </ListItem>
                {index < users.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </nav>
      </div>
    );
  }
}

// const UserList = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const { data } = await fetchModel("/user/list");
//         setUsers(data);  // 服务器返回的用户数组
//       } catch (error) {
//         console.error('User list retrieval failed: ', error);
//         setError(error);  // 捕获错误（404，500）
//       } finally {
//         setLoading(false);  // 无论成功与否，结束load
//       }
//     };

//     fetchUsers();
//   }, []);

//   if (loading) return <Typography> Loading... </Typography>;
//   if (error) return <Typography color="error">User list retrieval failed: {error.statusText}</Typography>;
//   if (users.length === 0) return <Typography>No users...</Typography>

//   return (
//   <div>
//     <nav>
//       <List>
//         {users.map((user, index) => (
//           <React.Fragment key={user._id}>
//             <ListItem disablePadding>
//               <ListItemButton component={Link} to={`/users/${user._id}`}>
//                 <ListItemText primary={`${user.first_name} ${user.last_name}`} />
//               </ListItemButton>
//             </ListItem>
//           {index < users.length - 1 && <Divider />}
//           </React.Fragment>
//         ))}
//       </List>
//     </nav>
//   </div>
//   );
// };

export default withRouter(UserList);
