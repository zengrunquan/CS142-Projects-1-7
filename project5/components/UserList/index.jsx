import React, { useEffect, useState, Component } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box
} from "@mui/material";
import {Link} from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";  // 封装的API请求工具

import "./styles.css";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    // 初始化组件的初始状态
    this.state = {
      users: [],        // 存储用户列表数据
      loading: true,    // 加载状态
      error: null       // 错误信息
    };
  }

  // 组件挂载完成后执行
  componentDidMount() {
    // 组件挂载时获取用户列表 （发起用户数据请求）
    this.fetchUsers();
  }

  // 从服务器获取用户列表数据
  fetchUsers = () => {
    // 使用fetchModel获取用户列表（调用封装的fetchModel工具请求API）
    fetchModel("/user/list")
      .then(({ data }) => {  // 请求成功
        this.setState({ 
          users: data,     //更新用户数据
          loading: false   // 关闭加载状态
        });
      })
      .catch(error => {  // 请求失败
        console.error('Failed to load user list: ', error);
        this.setState({ 
          error,   // 同样存储错误信息
          loading: false  // 同样关闭加载状态
        });
      });
  };

  render() {
    // // 实现用户详细信息显示，首先获取所有用户列表 --> /modelData/photoApp.js
    // const users = window.cs142models.userListModel();
    const { users, loading, error } = this.state;

    // 加载状态显示
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress /> {/* 环形进度条 */}
          <Typography variant="body1" ml={2}>Loading user list...</Typography>
        </Box>
      );
    }
    
    // 错误状态显示
    if (error) {
      return (
        <Typography color="error" mt={4}>
          Failed to load user list: {error.statusText || 'Unknown error'}
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
            {/* 遍历用户数组生成列表项 */}
            {users.map((user, index) => (
              <React.Fragment key={user._id}>
                <ListItem disablePadding>
                  {/* 可点击的列表项，链接用户信息页 */}
                  <ListItemButton component={Link} to={`/users/${user._id}`}>
                    <ListItemText 
                      primary={`${user.first_name} ${user.last_name}`} 
                      primaryTypographyProps={{ variant: "h6" }}
                    />
                  </ListItemButton>
                </ListItem>
                {/* 除最后一项外添加分隔线 */}
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

export default UserList;
