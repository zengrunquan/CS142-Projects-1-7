import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch, withRouter } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserCommentsView from "./components/UserCommentsView";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    // 添加高级功能状态
    this.state = {
      advancedFeatures: false
    };
    
    // 绑定切换方法
    this.toggleAdvancedFeatures = this.toggleAdvancedFeatures.bind(this);
  }

  // 切换高级功能状态
  toggleAdvancedFeatures() {
    this.setState(prevState => ({
      advancedFeatures: !prevState.advancedFeatures
    }));
  }

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
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                <UserList advancedFeatures={this.state.advancedFeatures} history={this.props.history} />
              </Paper>
            </Grid>
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

                  {/* 添加单张照片路由 */}
                  <Route 
                    path="/photos/:userId/photo/:photoId"
                    render={(props) => (
                      <UserPhotos 
                        {...props}
                        advancedFeatures={this.state.advancedFeatures}
                      />
                    )}
                  />

                  {/* 添加新路由 */}
                  <Route 
                    path="/users/:userId/comments"
                    render={(props) => (
                      <UserCommentsView
                        {...props}
                        advancedFeatures={this.state.advancedFeatures}
                      />
                    )}
                  />

                  <Route
                    path="/users/:userId"
                    render={(props) => (
                      <UserDetail 
                        {...props} 
                        advancedFeatures={this.state.advancedFeatures} 
                      />
                    )}
                  />

                  <Route
                    path="/photos/:userId"
                    render={(props) => (
                      <UserPhotos 
                        {...props}
                        advancedFeatures={this.state.advancedFeatures}
                      />
                    )}
                  />

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
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

export default withRouter(PhotoShare);

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
