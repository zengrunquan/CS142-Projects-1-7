import React, { Component } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid
} from "@mui/material";
import { withRouter } from "react-router-dom";

class LoginRegister extends Component {
  constructor(props) {
    super(props);
    this.abortControllers = []; // 管理所有未完成的请求
    this._isMounted = false; // 添加组件挂载状态标志
    this.state = {
      // 登录状态
      loginName: "",
      password: "",
      loginError: null,

      // 注册状态
      regLoginName: "",
      regPassword: "",
      regPasswordConfirm: "",
      regFirstName: "",
      regLastName: "",
      regLocation: "",
      regDescription: "",
      regOccupation: "",
      regError: null,
      regSuccess: false,
      
      // 当前标签页（0:登录，1:注册）
      tabValue: 0
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  };

  componentWillUnmount() {
    this._isMounted = false;
    // 组件卸载时，取消所有未完成的请求
    this.abortControllers.forEach(controller => controller.abort());
    // this.abortControllers = [];
  }


    handleLogin = () => {
      const { loginName, password } = this.state;
      const controller = new AbortController();
      this.abortControllers.push(controller);

      fetch("/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login_name: loginName, password }),
          signal: controller.signal,
      })
      .then(response => {
          // 处理响应
          // 请求完成后从数组中移除
          const index = this.abortControllers.indexOf(controller);
          if (index !== -1) {
            this.abortControllers.splice(index, 1);
          };

          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || "Login failed");
            });
          }
          return response.json();
      })
      .then(user => {
        // 检查组件是否已卸载或请求已取消
        if (controller.signal.aborted || !this._isMounted) return;
        
        // 保存到 localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        this.props.onLogin(user);
        this.props.history.push("/");
      })
      .then(data => {
        if (!this._isMounted) return; // 跳过卸载组件的更新
        // 处理数据
      })
      .catch(error => {
        // 检查组件是否已卸载或请求已取消
        if (controller.signal.aborted || !this._isMounted) return;

        if (error.name === "AbortError") return;  // 请求被取消，无需处理
        this.setState({ loginError: error.message });
      });
    };


  handleRegister = () => {
    const { 
      regLoginName, 
      regPassword, 
      regPasswordConfirm,
      regFirstName,
      regLastName,
      regLocation,
      regDescription,
      regOccupation
    } = this.state;

    // 验证必填字段
    if (!regLoginName || !regPassword || !regFirstName || !regLastName) {
      this.setState({ regError: "Please fill in all required fields." });
      return;
    }

    // 验证密码一致
    if (regPassword !== regPasswordConfirm) {
      this.setState({ regError: "Passwords do not match." });
      return;
    }

    // 创建 AbortController
    const controller = new AbortController();
    this.abortControllers.push(controller); // 加入管理数组

    // 发送注册请求（异步操作，需要isMounted检查）
    fetch("/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login_name: regLoginName,
        password: regPassword,
        first_name: regFirstName,
        last_name: regLastName,
        location: regLocation,
        description: regDescription,
        occupation: regOccupation
      }),
      signal: controller.signal,  // 关联取消信号
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text().then(text => {
          throw new Error(text || "Registration failed");
        });
      }
    })
    .then(data => {
        // 检查请求是否已取消（避免更新卸载后的组件）
        if (controller.signal.aborted || !this._isMounted) return;

        console.log("Registration successful:", data);

        // 清空表单并显示成功消息
          this.setState({
              regSuccess: true,
              regError: null,
              // 清空表单
              regLoginName: "",
              regPassword: "",
              regPasswordConfirm: "",
              regFirstName: "",
              regLastName: "",
              regLocation: "",
              regDescription: "",
              regOccupation: ""
          });
          // 2秒后自动切换到登录标签页
          setTimeout(() => {
            if (this._isMounted) {
              this.setState({ tabValue: 0 });
            }
          }, 2000);
    })
    .catch(error => {
        // 检查组件是否已卸载或请求已取消
        if (controller.signal.aborted || !this._isMounted) return;

        // 处理取消错误（AbortError）
        if (error.name === "AbortError") {
          console.log("Registration request aborted (component unmounted).");
          return;
        }
        console.error("Registration error:", error);
        this.setState({ regError: error.message });
    })
    .finally(() => {
        // 从数组中移除已完成的控制器
        const index = this.abortControllers.indexOf(controller);
        if (index !== -1) {
        this.abortControllers.splice(index, 1);
        }
    });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { loginError, regError, regSuccess, tabValue } = this.state;

    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
            <Tabs 
              value={tabValue} 
              onChange={this.handleTabChange} 
              centered indicatorColor="primary" 
              textColor="primary"
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Login to PhotoShare
                </Typography>
                
                {loginError && (
                  <Typography color="error" mb={2}>
                    {loginError}
                  </Typography>
                )}
                
                <TextField
                  label="Login Name"
                  variant="outlined"
                  fullWidth
                  name="loginName"
                  value={this.state.loginName}
                  onChange={this.handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={this.handleLogin}
                >
                  Login
                </Button>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Register for PhotoShare
                </Typography>
                
                {regError && (
                  <Typography color="error" mb={2}>
                    {regError}
                  </Typography>
                )}
                {regSuccess && (
                  <Typography color="primary" mb={2}>
                    Registration successful! Please log in.
                  </Typography>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Login Name*"
                      variant="outlined"
                      fullWidth
                      name="regLoginName"
                      value={this.state.regLoginName}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="First Name*"
                      variant="outlined"
                      fullWidth
                      name="regFirstName"
                      value={this.state.regFirstName}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Last Name*"
                      variant="outlined"
                      fullWidth
                      name="regLastName"
                      value={this.state.regLastName}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Password*"
                      variant="outlined"
                      fullWidth
                      type="password"
                      name="regPassword"
                      value={this.state.regPassword}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Confirm Password*"
                      variant="outlined"
                      fullWidth
                      type="password"
                      name="regPasswordConfirm"
                      value={this.state.regPasswordConfirm}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Location"
                      variant="outlined"
                      fullWidth
                      name="regLocation"
                      value={this.state.regLocation}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Occupation"
                      variant="outlined"
                      fullWidth
                      name="regOccupation"
                      value={this.state.regOccupation}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={2}
                      name="regDescription"
                      value={this.state.regDescription}
                      onChange={this.handleChange}
                    />
                  </Grid>
                </Grid>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={this.handleRegister}
                  sx={{ mt: 2 }}
                  disabled={regSuccess} // 注册成功后禁用按钮
                >
                  {regSuccess ? "Registration Complete" : "Register Me"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }
}

export default withRouter(LoginRegister);