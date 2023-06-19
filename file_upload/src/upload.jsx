import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadPaused, setUploadPaused] = useState(false);
  const [uploadCancelToken, setUploadCancelToken] = useState(null);
  const uploadedBytesRef = useRef(0); // Ref to store uploaded bytes

  useEffect(() => {
    if (uploadPaused) {
      setUploadStatus('Upload paused');
    }
  }, [uploadPaused]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      const source = axios.CancelToken.source();
      setUploadCancelToken(source);
  
      try {
        setUploadStatus('Uploading...');
  
        const response = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Content-Range': `bytes ${uploadedBytesRef.current}-${selectedFile.size - 1}/${selectedFile.size}`,
          },
          onUploadProgress: (progressEvent) => {
            const totalBytes = selectedFile.size;
            const uploadedBytes = Math.min(progressEvent.loaded + uploadedBytesRef.current, totalBytes);
            const progress = Math.round((uploadedBytes * 100) / totalBytes);
            setUploadProgress(progress);
            uploadedBytesRef.current = uploadedBytes; // Update the ref value
          },
          cancelToken: source.token,
        });
  
        setUploadStatus('Upload successful!');
        console.log(response.data); // Server response
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Upload cancelled');
          setUploadStatus('Upload cancelled');
        } else {
          console.error('Error during upload: ', error);
          setUploadStatus('Upload failed!');
        }
      }
    }
  };
  

  const handlePauseUpload = () => {
    if (uploadCancelToken) {
      uploadCancelToken.cancel('Upload paused');
      setUploadPaused(true);
    }
  };

  const handleResumeUpload = () => {
    setUploadPaused(false);
    handleFileUpload();
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={handleFileUpload} disabled={uploadPaused}>
        Upload
      </button>
      <button onClick={handlePauseUpload} disabled={uploadPaused}>
        Pause
      </button>
      <button onClick={handleResumeUpload} disabled={!uploadPaused}>
        Resume
      </button>
      <div>{uploadProgress}% uploaded</div>
      <div>{uploadStatus}</div>
    </div>
  );
};

export default FileUpload;
