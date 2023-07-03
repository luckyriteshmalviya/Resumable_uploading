import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./upload.css";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null); // Currently selected file for upload
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress percentage
  const [uploadStatus, setUploadStatus] = useState(""); // Current upload status like - "Upload paused" / "Uploading..." / "Upload successful!"
  const [uploadPaused, setUploadPaused] = useState(false); // Upload pause state it will be either true or false
  const [uploadCancelToken, setUploadCancelToken] = useState(null); // Cancel token for the upload request
  const uploadedBytesRef = useRef(0); // Ref to store uploaded bytes across render cycles
  const fileInputRef = useRef(null); // Ref for the file input element
  const [filesToBeUploaded, setFilesToBeUploaded] = useState([]); // Array of files to be uploaded from localstorage

  useEffect(() => {
    // Update upload status when upload is paused
    if (uploadPaused) {
      setUploadStatus("Upload paused");
    }
  }, [uploadPaused]);

  useEffect(() => {
    // Retrieve all remaining files from local storage when component mounts
    const file = JSON.parse(localStorage.getItem("currentFiles"));
    if (file) {
      setFilesToBeUploaded(file);
    }
  }, [uploadStatus]);

  useEffect(() => {
    // Attach and detach event listener to handle tab close behavior when upload status is not successful
    if (uploadStatus && uploadStatus !== "Upload successful!") {
      window.addEventListener("beforeunload", handleTabClose);
    }
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [uploadStatus]);

  useEffect(() => {
    // Update uploaded bytes reference from localstorage if it existed in it when a new file is selected
    handleRemainingFiles();
  }, [selectedFile]);

  const handleRemainingFiles = () => {
    let remainingFiles = JSON.parse(localStorage.getItem("currentFiles")) || [];
    if (remainingFiles.length > 0 && selectedFile) {
      for (let i = 0; i < remainingFiles.length; i++) {
        if (remainingFiles[i].name == selectedFile.name) {
          uploadedBytesRef.current = remainingFiles[i].uploaded;
          return;
        }
        uploadedBytesRef.current = 0;
      }
    }
  };

  // Handle tab close behavior and store current file details in local storage
  const handleTabClose = (event) => {
    event.preventDefault();
    event.returnValue = "";
    console.log("hi");
    if (uploadStatus && uploadStatus !== "Upload successful!") {
      let filesStoredInLocalStorage =
        JSON.parse(localStorage.getItem("currentFiles")) || [];

      console.log({ filesStoredInLocalStorage });
      let existedFiles = filesStoredInLocalStorage.findIndex(
        (file) =>{
          return(file.name === selectedFile.name &&
          file.lastModified === selectedFile.lastModified)}
      );

      console.log({ existedFiles });
      
      if (existedFiles >= 0) {
        console.log({ existedFiles }, "inside if");
        filesStoredInLocalStorage[existedFiles].uploaded =
          uploadedBytesRef.current;
      } else {
        console.log({ existedFiles }, "inside ifelse");
        const currentFileDetails = {
          name: selectedFile.name,
          totalSize: selectedFile.size,
          uploaded: uploadedBytesRef.current,
          lastModified: selectedFile.lastModified,
        };

        filesStoredInLocalStorage.push(currentFileDetails);
      }
      localStorage.setItem(
        "currentFiles",
        JSON.stringify(filesStoredInLocalStorage)
      );
    }
  };

  // Handle file selection for upload
  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadProgress(0);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const source = axios.CancelToken.source();
      setUploadCancelToken(source);

      try {
        setUploadStatus("Uploading...");

        const response = await axios.post(
          "http://localhost:3000/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Content-Range": `bytes ${uploadedBytesRef.current}-${selectedFile.size}/${selectedFile.size}`,
            },
            onUploadProgress: (progressEvent) => {
              const totalBytes = selectedFile.size;
              const uploadedBytes = Math.min(
                progressEvent.loaded + uploadedBytesRef.current,
                totalBytes
              );
              const progress = Math.round((uploadedBytes * 100) / totalBytes);
              setUploadProgress(progress);
              uploadedBytesRef.current = uploadedBytes;
            },
            cancelToken: source.token,
          }
        );

        setUploadProgress("");

        // Removing file from localStorage which is now uplaoded successfully.
        let remainingFiles =
          JSON.parse(localStorage.getItem("currentFiles")) || [];

        remainingFiles = remainingFiles.filter(
          (item) => item.name != selectedFile.name
        );

        localStorage.setItem("currentFiles", JSON.stringify(remainingFiles));
        setUploadStatus("Upload successful!");
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Upload cancelled");
          setUploadStatus("Upload cancelled");
        } else {
          console.error("Error during upload: ", error);
          setUploadStatus("Upload failed!");
        }
      }
    }
  };

  // Pause the upload
  const handlePauseUpload = () => {
    if (uploadCancelToken) {
      uploadCancelToken.cancel("Upload paused");
      setUploadPaused(true);
    }
  };

  // Resume the upload
  const handleResumeUpload = () => {
    setUploadPaused(false);
    handleFileUpload();
  };

  return (
    <div>
      <div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} />
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

      {/* List of Files that were stored in localstorage. Developer can change the UI according to the need */}
      {filesToBeUploaded.length > 0 ? (
        <div>
          List of Files that were not upoaded 100% :-
          {filesToBeUploaded.map((file) => {
            return (
              <li className="fileList" key={file.name}>
                File Name :- {file.name}
                <div>
                  Total File Size :-{file.totalSize} bytes
                  <br />
                  File Uploaded :- {file.uploaded} bytes
                </div>
              </li>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default FileUpload;
