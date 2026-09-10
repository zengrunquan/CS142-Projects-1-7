import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch, withRouter, Redirect  } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserCommentsView from "./components/UserCommentsView";
import LoginRegister from "./components/LoginRegister";
import PhotoUpload from "./components/PhotoUpload";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    // // 从 localStorage 恢复登录状态
    // const savedUser = localStorage.getItem('loggedInUser');

    // 添加高级功能状态
    this.state = {
      advancedFeatures: false,  // 控制高级功能的开关
      loggedInUser: null,  // 添加登录用户状态
      showPhotoUpload: false, // 控制上传对话框显示
    };
    
    // 绑定切换方法
    this.toggleAdvancedFeatures = this.toggleAdvancedFeatures.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogin = (userData) => {
    // 保存到 localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(userData));

    this.setState({ loggedInUser: userData });
    // 登录后重定向到用户详情页
    this.props.history.push(`/users/${userData._id}`);
  };

  handleLogout = () => {
    // 清除 localStorage
    localStorage.removeItem('loggedInUser');
    this.setState({ loggedInUser: null });
    this.props.history.push("/"); // 登出后回到首页
  };

  validateSession = () => {
    if (!this.state.loggedInUser) return;
    
    fetch('/test/session-validate', {
      credentials: 'include'
    })
    .then(response => {
      if (response.status === 401) {
        // 服务器会话无效，清除本地状态
        localStorage.removeItem('loggedInUser');
        this.setState({ loggedInUser: null });
      }
    })
    .catch(error => {
      console.error('Session validation error:', error);
    });
  };

  componentDidMount() {
    // 挂载时验证会话
    this.validateSession();
  }

  handleAddPhotoClick = () => {
    this.setState({ showPhotoUpload: true });
  };


  handlePhotoUploadClose = (success) => {
    this.setState({ showPhotoUpload: false });
    if (success && this.state.loggedInUser) {
      // 刷新照片列表
      this.refreshPhotos();
    }
  };

  // 切换高级功能状态
  toggleAdvancedFeatures() {
    this.setState(prevState => ({
      advancedFeatures: !prevState.advancedFeatures
    }));
  };

  refreshPhotos = () => {
    if (this.userPhotosRef) {
      this.userPhotosRef.fetchPhotos();
    }
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* 传递高级功能状态和切换方法 */}
              <TopBar 
                advancedFeatures={this.state.advancedFeatures}
                toggleAdvancedFeatures={this.toggleAdvancedFeatures}
                loggedInUser={this.state.loggedInUser}
                onLogout={this.handleLogout}
                onAddPhotoClick={this.handleAddPhotoClick}
              />
            </Grid>

            <div className="cs142-main-topbar-buffer" />

            {this.state.loggedInUser ? (
              <>
                <Grid item sm={3}>
                  <Paper className="cs142-main-grid-item">
                    <UserList advancedFeatures={this.state.advancedFeatures} history={this.props.history} />
                  </Paper>
                </Grid>

                <PhotoUpload 
                  open={this.state.showPhotoUpload}
                  onClose={this.handlePhotoUploadClose}
                  userId={this.state.loggedInUser._id}
                />

                <Grid item sm={9}>
                  <Paper className="cs142-main-grid-item">
                    <Switch>
                      {/* <Route
                        exact
                        path="/"
                        render={() => (
                          <Typography variant="body1">
                            Welcome to your photosharing app! This{" "}
                            <a href="https://mui.com/components/paper/">Paper</a>{" "}
                            component displays the main content of the application.
                            The {"sm={9}"} prop in the{" "}
                            <a href="https://mui.com/components/grid/">Grid</a> item
                            component makes it responsively display 9/12 of the
                            window. The Switch component enables us to conditionally
                            render different components to this part of the screen.
                            You don&apos;t need to display anything here on the
                            homepage, so you should delete this Route component once
                            you get started.
                          </Typography>
                        )}
                      /> */}

                      {/* 根路径重定向到当前用户的详情页 */}
                      <Redirect exact from="/" to={`/users/${this.state.loggedInUser._id}`} />

                      {/* 单张照片路由 - 匹配格式: /photos/:userId/photo/:photoId */}
                      <Route 
                        path="/photos/:userId/photo/:photoId"
                        render={(props) => (
                          <UserPhotos 
                            key={props.match.params.photoId} // 添加key强制刷新
                            {...props}  // 传递路由参数
                            advancedFeatures={this.state.advancedFeatures}
                            loggedInUser={this.state.loggedInUser}  // 用户登录信息传递
                            ref={ref => this.userPhotosRef = ref}
                          />
                        )}
                      />

                      {/* 用户评论视图路由 - 匹配格式: /users/:userId/comments */}
                      <Route 
                        path="/users/:userId/comments"
                        render={(props) => (
                          <UserCommentsView
                            {...props}
                            advancedFeatures={this.state.advancedFeatures}
                            loggedInUser={this.state.loggedInUser}  // 用户登录信息传递
                          />
                        )}
                      />

                      {/* 用户详情路由 - 匹配格式: /users/:userId */}
                      <Route
                        path="/users/:userId"
                        render={(props) => (
                          <UserDetail 
                            {...props} 
                            advancedFeatures={this.state.advancedFeatures} 
                          />
                        )}
                      />

                      {/* 用户照片路由 - 匹配格式: /photos/:userId */}
                      <Route
                        path="/photos/:userId"
                        render={(props) => (
                          <UserPhotos 
                            {...props}
                            advancedFeatures={this.state.advancedFeatures}
                          />
                        )}
                      />

                      {/* 用户列表路由 - 匹配格式: /users */}
                      <Route
                        path="/users"
                        render={(props) => (
                          <UserList 
                            {...props} 
                            advancedFeatures={this.state.advancedFeatures} 
                          />
                        )}
                      />

                    </Switch>
                  </Paper>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <LoginRegister onLogin={this.handleLogin} />
              </Grid>
            )}
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

export default withRouter(PhotoShare);

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
