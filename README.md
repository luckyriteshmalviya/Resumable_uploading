# Resumable_uploading

This demo module allows users to select and upload files. It provides features like displaying upload progress, pausing and resuming uploads, and handling tab close behavior to store, retrieve file upload details, send remaining file after closing the browser and it won't send the specific portion of the file that has already been uploaded. It can be implemented in any project with ease. 

In this demo module there are two main folders :-   
For Frontend work - *file_upload*  
For Backend work - *file_upload_express*

Tech stack used is :-  
**For Frontend work -** ReactJs (Vite), Axios for Post request, local storage for saving the details of remaining files that were not uploaded 100%.  
**For Backend work -** ExpressJs, Multer (for file handling).

Here the key component is FileUpload which is in the upload.jsx file inside file_upload folder.



## How to run this file

Step 1: Make a clone in your local repository by this command :- git clone https://gitlab.com/riteshm/resume_uploading.git     
Step 2: Go to the repository by using the following command :- cd RESUME_UPLOADING  
Step 3: Go to the file_upload_express (BACKEND) folder by using the following command :- cd file_upload_express     
Step 4: Install node dependencies by using - npm install       
Step 5: Run the backend on terminal by using the following command :- npm start    
Step 6: Open another terminal and open file_upload folder (FRONTEND).      
Step 7: Install node dependencies by using - npm install    
Step 8: Run the frontend on the terminal by using the following command :- **npm run dev**.    
Step 9: Now it will run in your browser generally it opens in the http://localhost:5173/.    


### Flow of the system :-

1. User selects a file for upload.
2. The selected file is stored in the `selectedFile` state.
3. The `uploadProgress` state is reset to 0.
4. User clicks the "Upload" button.
5. The `handleFileUpload` method is called.
6. The file is sent to the server using Axios.
7. If the upload is successful:
   - The `uploadProgress` is cleared.
   - The file is removed from local storage (if it was previously stored).
   - The `uploadStatus` is set to "Upload successful!".
   - The file will be saved inside the uploads folder in file_upload_express folder.
8. If the upload is canceled:
   - The `uploadStatus` is set to "Upload cancelled".
9. If there's an error during the upload:
   - If the error is due to cancellation:
     - The `uploadStatus` is set to "Upload cancelled".
   - If the error is not due to cancellation:
     - The `uploadStatus` is set to "Upload failed!".
10. User clicks the "Pause" button.
11. The `handlePauseUpload` method is called.
12. The upload request is canceled using the `uploadCancelToken`.
13. The `uploadPaused` state is set to `true`.
14. User clicks the "Resume" button.
15. The `handleResumeUpload` method is called.
16. The `uploadPaused` state is set to `false`.
17. The `handleFileUpload` method is called to resume the upload process.
18. The `uploadProgress` and `uploadStatus` are updated as the upload progresses.
19. User closes the tab or refreshes the page.
20. The `handleTabClose` event handler is called.
21. The file details are stored in local storage (if upload status is not "Upload successful!").
22. End



### The FileUpload component manages the following states:

**selectedFile** (useState): Stores the currently selected file for upload.  

**uploadProgress** (useState): Stores the upload progress percentage.  

**uploadStatus** (useState): Stores the current upload status (e.g., "Upload paused", "Uploading...", "Upload successful!"). 

**uploadPaused** (useState): Stores the upload pause state (true or false).  

**uploadCancelToken** (useState): Stores the cancel token for the upload request.  

**filesToBeUploaded** (useState): Stores an array of files to be uploaded from local storage.  


### The FileUpload component defines several methods and event handlers to handle file selection, file upload, pausing and resuming uploads, and tab close behavior.

**handleFileSelect:** Event handler for file selection. It updates the selectedFile state and resets the uploadProgress.

**handleFileUpload:** Method for handling the file upload process. It sends the selected file to the server using the Axios library. It also handles upload progress, cancellation, and error scenarios. The uploadProgress and uploadStatus states are updated accordingly.

**handlePauseUpload:** Method for pausing the upload. It cancels the upload request by calling the cancel method on the uploadCancelToken. It sets the uploadPaused state to true.

**handleResumeUpload:** Method for resuming the upload. It sets the uploadPaused state to false and calls the handleFileUpload method to resume the upload process.

**handleTabClose:** Event handler for tab close behavior. It stores the current file details in the local storage before the tab is closed. It listens for the beforeunload event and cancels the default behavior. The file details are stored in the local storage using the key "currentFiles".

**handleRemainingFiles:** Method for updating the uploaded bytes reference from local storage. It retrieves the remaining files from the local storage and checks if the selected file exists in the remaining files. If found, it updates the uploadedBytesRef.current with the uploaded bytes. Otherwise, it sets uploadedBytesRef.current to 0.


### Lifecycle Methods
The FileUpload component uses React's useEffect hook to handle certain lifecycle events.

**useEffect with an empty dependency array ([]):** It is used to retrieve all remaining files from local storage when the component mounts. It updates the filesToBeUploaded state with the retrieved files. The effect runs only once when the component is mounted.

**useEffect with the uploadPaused state as a dependency:** It updates the uploadStatus when the upload is paused. The effect is triggered whenever the uploadPaused state changes.

**useEffect with the uploadStatus state as a dependency:** It attaches and detaches an event listener to handle tab close behavior when the upload status is not "Upload successful!". The effect runs whenever the uploadStatus state changes. When the upload status is not successful, it adds an event listener to the beforeunload event and calls the handleTabClose event handler. When the upload status changes or the component is unmounted, it removes the event listener.




## Axios :-

In the given code, the Axios library is used to handle HTTP requests for file upload. Here formData object, which contains the selected file, is passed as the second argument.
Additional request configuration options are provided as an object.  
The **headers** object contains the necessary headers for a multipart form data request. It specifies the content type and **content range** for resuming file uploads.
The **onUploadProgress callback function** is used to track the upload progress. It is called periodically as the file is being uploaded, providing progress information in the progressEvent object.
The **cancelToken property** is set to the source.token to enable cancellation of the upload request.

### Axios usecases in the code :-

*Handling upload progress:*

The onUploadProgress callback function is called during the upload process to track the progress of the file upload.
The progressEvent object contains information about the progress, including the number of bytes loaded (progressEvent.loaded).

The uploadedBytesRef.current stores the total number of bytes already uploaded before the current upload.
The progress percentage is calculated and stored in the uploadProgress state.
The uploadedBytesRef.current is updated with the total number of bytes uploaded so far.  

*Handling cancellation:*

Axios provides a CancelToken that can be used to cancel an ongoing HTTP request.
A new cancel token source is created using axios.CancelToken.source().
The cancel token (source.token) is passed as the cancelToken property in the request configuration.
When the upload is paused, the cancel token's cancel method is called with a cancellation message ("Upload paused").
  
*Handling cancellation error:*

The catch block is used to handle errors that may occur during the upload process.
The axios.isCancel function is used to check if the error is due to cancellation.
If the error is due to cancellation, the uploadStatus state is set to "Upload cancelled".
If the error is not due to cancellation, an error message is logged and the uploadStatus state is set to "Upload failed!".




### Local Storage
The FileUpload component uses local storage to store and retrieve file upload details. The details of files that are not uploaded 100% are stored in local storage under the key "currentFiles". The stored file details include the file name, total file size, uploaded bytes, and last modified timestamp.   
The purpose of why the **last modified timestamp** is stored is because if a user uploads a file, stops uploading, updates something in the file, and then tries to upload the file from the previous upload status, some information may be lost inside the backend file. We are therefore simply verifying that the file has the same value for the last modified timestamp key.

## Feedback

 - Any suggestions or feedback to improve it, is most welcomed.
If you have any feedback & queries, please reach out to us at luckyriteshmalviya@gmail.com
