import React, { useEffect, useState, Component } from "react";
import { AppBar, Toolbar, Typography, Box, Divider, FormControlLabel, Switch, toggleButtonClasses, Button } from "@mui/material";
import { withRouter } from "react-router-dom";
import axios from 'axios'

import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

/**
 * Define TopBar, a React component of CS142 Project 5.
 * 顶部栏，左侧用户名，右侧显示应用程序上下文
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: 'loading...',
      context: 'Photo Sharing',
      error: null,
      advancedFeatures: false,
    };
    this.handleAddPhotoClick = this.handleAddPhotoClick.bind(this);
  }

  componentDidMount() {
    // 获取版本信息
    this.fetchVersion();

    // 初始设置上下文
    this.updateContext(this.props.location.pathname);

    // // 检查会话状态
    // this.checkSession();
  }

  // checkSession = () => {
  //   // 检查当前登录状态
  //   fetch("/test/info")
  //     .then(response => {
  //       if (response.ok) return response.json();
  //       throw new Error("Session check failed");
  //     })
  //     .then(data => {
  //       // 如果会话有效，设置用户状态
  //       if (this.props.loggedInUser) {
  //         this.setState({ user: this.props.loggedInUser });
  //       }
  //     })
  //     .catch(error => console.error("Session check error:", error));
  // };

  handleLogout = () => {
    fetch("/admin/logout", { method: "POST" })
      .then(response => {
        // 清除localStorage中的用户信息
        localStorage.removeItem('loggedInUser');
        if (response.ok) {
          this.props.onLogout();  // 调用父组件的登出处理函数
        } else {
          console.error("Logout failed:", response.statusText);
        }
      })
      .catch(error => {
        console.error("Logout error:", error);
        this.setState({ error: "Logout failed. Please try again." });
      });
  };

  handleAddPhotoClick() {
    if (this.props.onAddPhotoClick) {
      this.props.onAddPhotoClick();
    };
  };

  componentDidUpdate(prevProps) {
    // 当路径变化时更新上下文
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.updateContext(this.props.location.pathname);
    };
  };

  fetchVersion = () => {

    // // 从服务器获取版本信息
    // fetchModel("/test/info")
    // .then(({data}) => {
    //   this.setState({ version: data.load_date_time});
    // })
    // .catch(error => {
    //   console.error('Version info retrieval failed: ', error);
    //   this.setState({ version: 'Version unknown', error });
    // });

    axios.get(`/test/info`)
      .then((response) => {
        // 验证响应数据格式
        if (response.data && response.data.load_date_time) {
          this.setState({ version: response.data.load_date_time});
        }
      })
      .catch(error => {
        console.error('Version info retrieval failed! ', error);
        this.setState({version: 'Version unknown', error: "Failed to load version info"});
      });
  };

  updateContext = (path) => {
    let context = 'Photoshare APP';
    
    if (path.startsWith("/users/")) {
      // 实际应用中应从服务器获取用户信息
      context = `User information`;
    } else if (path.startsWith("/photos/")) {
      // 实际应用中应从服务器获取用户信息
      context = `User photos`;
    }
    
    this.setState({ context });
  };

  render() {
    const { version, context, error } = this.state;
    const { advancedFeatures, toggleAdvancedFeatures, loggedInUser } = this.props;

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          {loggedInUser ? (
            <div className="navbar">
              <Typography variant="h5" color="inherit">
                Hi {loggedInUser.first_name}
              </Typography>
            </div>
          ) : (
            <Typography variant="h5" color="inherit">
              Please Login
            </Typography>
          )}

          <Box flexGrow={1}/>

          {loggedInUser && (
            <>
              <Button 
                variant="contained"
                color="primary"
                onClick={this.handleAddPhotoClick} // 添加点击事件处理
                sx={{ mr: 2 }}
              >
                Add Photo
              </Button>
              
              <Button 
                color="inherit"
                onClick={this.handleLogout}
                sx={{ mr: 2 }}
              >
                Logout
              </Button>
            </>
          )}

          {/* 添加高级功能开关 */}
          <FormControlLabel 
            control={
              <Switch
                checked={advancedFeatures}
                onChange={toggleAdvancedFeatures}
                color="secondary"
              />
            }
            label="Enable Advanced Features"
            labelPlacement="start"
            sx={{ mr: 2 }}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle1">
              {context}
            </Typography>

              <Divider orientation="vertical" flexItem />

              {error ? (
                <Typography variant="caption" color="error">
                  {error}  {/* 显示实际错误消息 */}
                </Typography>
              ) : (
                <Typography>
                  Version: {version}
                </Typography>
              )}
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
}

// const TopBar = () => {
//   const [version, setVersion] = useState('loading...');
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchVersion = async () => {
//       try {
//         const { data } = await fetchModel("http://localhost:3000/test/info");
//         setVersion(data.load_date_time);
//       } catch (error) {
//         setError(error)
//         setVersion("Version unknown");
//         console.error('Failed to get version infomation: ', error);
//       }
//     };

//     fetchVersion();
//   }, []);

//   return (
//       <AppBar className="cs142-topbar-appBar" position="absolute">
//         <Toolbar>
//           {/* <Typography variant="h5" color="inherit">
//             Your name: 
//           </Typography>
//           <Box flexGrow={1}/>
//           <Typography variant="h6" color="inherit">
//             {appContext}
//           </Typography> */}
//           <Box display="flex" alignItems="center">
//             {error ? (
//               <Typography variant="body2" color="error">
//                 Failed to load version!
//               </Typography>
//             ) : (
//               <Typography variant="body2">
//                 Version: {version}
//               </Typography>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>
//   )
// }

export default withRouter(TopBar);
