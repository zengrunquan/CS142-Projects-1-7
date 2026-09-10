import React, { Component } from "react";
import {
  Box, Typography, Card, CardContent, CardMedia, 
  List, ListItem, ListItemText, Divider, CircularProgress,
  ListItemButton
} from "@mui/material"
import { withRouter } from "react-router-dom";
import axios from 'axios';

class UserCommentsView extends Component {
    constructor(props) {
        super(props);
        this.state={
            comments: [],
            loading: true,
            error: null,
            user: null
        };
    }

    componentDidMount() {
        const { userId } = this.props.match.params;

        // // 添加参数验证
        // if (!mongoose.Types.ObjectId.isValid(userId)) {
        //     this.setState({ error: "Invalid user ID", loading: false });
        //     return;
        // }

        // 并发获取用户信息和评论
        Promise.all([
            axios.get(`/user/${userId}`),
            axios.get(`/commentsOfUser/${userId}`)
        ])
        .then(([userResponse, commentsResponse]) => {
            this.setState({
                user: userResponse.data,
                comments: commentsResponse.data,
                loading: false
            });
        })
        .catch(error => {
            console.error("Error loading comments: ", error);
            this.setState({ error, loading: false });
        });
    }

    // 处理点击评论跳转到照片详情
    handleCommentClick =(photoOwnerId, photoId) => {
        this.props.history.push(`/photos/${photoOwnerId}/photo/${photoId}`);
    };

    render() {
        const { comments, loading, error, user } = this.state;
        const { advancedFeatures } = this.props;

        // 检查高级功能是否开启
        if (!advancedFeatures) {
            return (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6">
                        Please enable advanced features to view comments!
                    </Typography>
                </Box>
            );
        }

        // 加载状态
        if (loading) {
            return <CircularProgress/>
        }

        // 错误状态
        if (error) {
            return <Typography color="error">Comments failed to load!</Typography>
        }

        // 无评论状态
        if (comments.length === 0) {
            return (
                <Typography variant="body1" mt={4}>
                    {user.first_name} {user.last_name} hasn't posted any comments yet!
                </Typography>
            );
        }

        return (
            <Card sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {user.first_name} {user.last_name}'s comment
                    </Typography>
                    <Divider sx={{ my: 2 }}/>

                    <List>
                        {comments.map((comment) => (
                            <ListItemButton
                                key={comment._id}
                                onClick={() => this.handleCommentClick(
                                    comment.photo_owner._id,
                                    comment.photo_id
                                )}
                                sx={{ padding: 2 }}  // 添加适当的填充
                            >

                                <Box display="flex" width="100%">
                                    {/* 照片缩略图 */}
                                    <CardMedia 
                                        component="img"
                                        image={`/images/${comment.file_name}`}
                                        alt="Comment on photos"
                                        sx={{ width: 80, height: 80, mr: 2 }}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/80";
                                        }}
                                    />

                                    {/* 评论内容 */}
                                    <Box flexGrow={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {comment.comment}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(comment.date_time).toLocaleString()}
                                        </Typography>

                                        <Typography variant="body2">
                                            on {comment.photo_owner.first_name} {comment.photo_owner.last_name}'s photo.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItemButton>
                        ))}
                    </List>

                </CardContent>
            </Card>
        )
    }
}

export default withRouter(UserCommentsView)