import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadPaused, setUploadPaused] = useState(false);
  const [uploadCancelToken, setUploadCancelToken] = useState(null);
  const uploadedBytesRef = useRef(0); 
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (uploadPaused) {
      setUploadStatus('Upload paused');
    }
  }, [uploadPaused]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  
// console.log(selectedFile.name)
  useEffect(() => {
    const handleTabClose = (event) => {
      console.log("hi");
      event.preventDefault();
      event.returnValue = "";
      
      console.log(selectedFile, "selected file");
      console.log({uploadStatus});

    if(uploadStatus && uploadStatus !== 'Upload successful!'){
      console.log("Hi");

        // Create an object with necessary file details
        const fileDetails = {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          // content: fileContent,
        };
    
        // Store the file details object in localStorage using a specific key
        localStorage.setItem('currentFile', JSON.stringify(fileDetails));
   
    };
  }

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

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
            'Content-Range': `bytes ${uploadedBytesRef.current}-${selectedFile.size}/${selectedFile.size}`,
          },
          onUploadProgress: (progressEvent) => {
            const totalBytes = selectedFile.size;
            const uploadedBytes = Math.min(progressEvent.loaded + uploadedBytesRef.current, totalBytes);
            const progress = Math.round((uploadedBytes * 100) / totalBytes);
            setUploadProgress(progress);
            uploadedBytesRef.current = uploadedBytes; 
          },
          cancelToken: source.token,
        });
  
        setUploadStatus('Upload successful!');
        console.log(response.data); 
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Upload cancelled', uploadedBytes, progress);
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

  useEffect(() => {
    const file = localStorage.getItem("fileName")
    if (file) {
      console.log(file);
      // fileInputRef.current.files[0] = file;
    }
  }, []);

  return (
    <div>
      <input type="file" ref={fileInputRef}  onChange={handleFileSelect} />
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
