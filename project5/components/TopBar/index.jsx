import React, { useEffect, useState, Component } from "react";
import { AppBar, Toolbar, Typography, Box, Divider } from "@mui/material";
import { withRouter } from "react-router-dom";

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
      error: null
    };
  }

  componentDidMount() {
    // 获取版本信息
    this.fetchVersion();

    // 初始设置上下文
    this.updateContext(this.props.location.pathname);
  }

  componentDidUpdate(prevProps) {
    // 当路径变化时更新上下文
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.updateContext(this.props.location.pathname);
    }
  }

  // 从服务器获取版本信息
  fetchVersion = () => {
    fetchModel("/test/info")
    .then(({data}) => {
      this.setState({ version: data.load_date_time});
    })
    .catch(error => {
      console.error('Version info retrieval failed: ', error);
      this.setState({ version: 'Version unknown', error });
    });
  };

  updateContext = (path) => {
    let context = '照片分享应用';
    
    if (path.startsWith("/users/")) {
      const userId = path.split("/")[2];
      // 实际应用中应从服务器获取用户信息
      context = `User information`;
    } else if (path.startsWith("/photos/")) {
      const userId = path.split("/")[2];
      // 实际应用中应从服务器获取用户信息
      context = `User photos`;
    }
    
    this.setState({ context });
  };

  render() {
    const { version, context, error } = this.state;

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            Your name: 
          </Typography>

          <Box flexGrow={1}/>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle1">
              {context}

              <Divider orientation="vertical" flexItem />

              {error ? (
                <Typography variant="caption" color="error">
                  Version loading failed!
                </Typography>
              ) : (
                <Typography>
                  Version: {version}
                </Typography>
              )
              }
            </Typography>
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
