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
  const [filesToBeUploaded, setFilesToBeUploaded] = useState([])


  useEffect(() => {
    if (uploadPaused) {
      setUploadStatus('Upload paused');
    }
  }, [uploadPaused]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const resumeFileUpload = (e)=>{
    console.log(e);
    setSelectedFile()
  }
  
  useEffect(() => {
    const handleTabClose = (event) => {
      console.log("hi");
      event.preventDefault();
      event.returnValue = "";
      
      console.log("selectedFile", selectedFile);
      console.log({uploadStatus});

    if(uploadStatus && uploadStatus !== 'Upload successful!'){
      console.log("InsideIfCondition");

      let filesToBeUploaded = JSON.parse(localStorage.getItem('currentFiles')) || [];

      // localStorage.removeItem('currentFile');

      console.log({filesToBeUploaded});

      for(let i = 0; i < filesToBeUploaded.length; i++) {
        console.log(filesToBeUploaded[i].name);
      if(filesToBeUploaded[i].name === selectedFile.name){
        filesToBeUploaded[i].uploaded = uploadedBytesRef.current
      }}

//       const reader = new FileReader();
//     reader.onload = function() {
//   const dataURL = reader.result;
//   console.log(dataURL, "------------------"); // Check if dataURL is assigned a value
// };
// reader.readAsDataURL(selectedFile);


      const currentFileDetails = {
        name: selectedFile.name,
        file: dataURL,
        size: selectedFile.size,
        uploaded: uploadedBytesRef.current
      };

     let newFilesToBeUploaded = [currentFileDetails, ...filesToBeUploaded]
     console.log({newFilesToBeUploaded});
    
     localStorage.setItem('currentFiles', JSON.stringify(newFilesToBeUploaded));
    };
  }

  if(uploadStatus && uploadStatus !== 'Upload successful!'){
    window.addEventListener('beforeunload', handleTabClose);}

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, [uploadStatus]);

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      const source = axios.CancelToken.source();
      setUploadCancelToken(source);
      console.log("sourceToken:- ",source.token);
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
        console.log("responseData", response.data); 
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

  useEffect(() => {
    const file = JSON.parse(localStorage.getItem("currentFiles"))
    if (file) {
      setFilesToBeUploaded(file)
      // fileInputRef.current.files[0] = file;
    }
  }, []);

  return (
    <div style={{display: "flex", gap: "20rem"}}>
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
    {filesToBeUploaded && <div>
{filesToBeUploaded.map((file) =>{return(<li style={{margin:"2px", border: "1px solid black"}} key={file.name}>
{file.name}
<div >Total File Size :-{file.size}
<br />
       File Uploaded :- {file.uploaded} 
       
       <button onClick={(()=>{})} disabled={uploadPaused}>
        Resume Uploading
      </button></div>
      
</li>)})}

    </div>}
    </div>
  );
};

export default FileUpload;
