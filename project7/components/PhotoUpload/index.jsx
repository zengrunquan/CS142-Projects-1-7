import React, { Component } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress
} from "@mui/material";
import { withRouter } from "react-router-dom";

class PhotoUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploading: false,
      error: null
    };
    this.fileInputRef = React.createRef();
  }

  handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      this.setState({
        selectedFile: e.target.files[0],
        error: null
      });
    }
  };

  handleUpload = () => {
    const { selectedFile } = this.state;
    const { userId, onClose } = this.props;

    if (!selectedFile) {
      this.setState({ error: "Please select a photo" });
      return;
    }

    this.setState({ uploading: true, error: null });

    const formData = new FormData();
    formData.append('uploadedphoto', selectedFile);

    fetch(`/photos/new`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(() => {
      this.setState({ uploading: false });
      onClose(true); // 通知父组件上传成功
    })
    .catch(error => {
      console.error('Upload error:', error);
      this.setState({
        uploading: false,
        error: error.message || 'Photo upload failed'
      });
    });
  };

  render() {
    const { open, onClose } = this.props;
    const { selectedFile, uploading, error } = this.state;

    return (
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            ref={this.fileInputRef}
            onChange={this.handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.fileInputRef.current.click()}
            sx={{ mb: 2 }}
          >
            {selectedFile ? selectedFile.name : "Select Photo"}
          </Button>
          
          {error && (
            <Box color="error.main" mb={2}>
              {error}
            </Box>
          )}
          
          {uploading && (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={this.handleUpload} 
            color="primary"
            disabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withRouter(PhotoUpload);