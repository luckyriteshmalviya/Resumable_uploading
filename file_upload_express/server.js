const express = require('express');
const multer = require('multer');
const cors = require('cors');


// Set up the multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination folder for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null,  '-' + file.originalname); // Generate a unique filename for the uploaded file
  }
});


// Set up the multer upload configuration
const upload = multer({ storage });

// Create the Express app
const app = express();

// Enable CORS
app.use(cors());

// Define a route for handling the file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // File upload successful, send a response
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Start the server
const port = 3000; // You can change the port number if needed
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
