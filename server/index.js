const root = 'http://192.168.10.113';


const express = require("express");
const morgan = require("morgan");
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { exec } = require('child_process'); // Import the exec function


const app = express();
app.use(morgan('dev'));
app.use(cors());
const PORT = process.env.PORT || 4000; //process.env.PORT is going to check your environment variables to see if you already have a PORT defined there if not it will use PORT 4000
const HOST = 'localhost';
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get('/', (req, res)=>{
    axios.get(root)
    .then(response => {
        res.status(200).send('Express server ready to go'); // Send the data as the response
    })
    .catch(error => {
        // Handle errors appropriately
        console.error(error);
        res.status(500).send('An error occurred.');
    });
    // res.status(200).send('Express server ready to go');
});

app.get('/hewwo', (req, res, next) => {
    const csharpFilePath = path.join(__dirname, 'fileparser.cs');
  
    // Build and execute the C# script
    exec(`dotnet build ${csharpFilePath} && dotnet ${path.basename(csharpFilePath, '.cs')}.dll`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing C# script: ${error}`);
        return res.status(500).send('Internal Server Error');
      }
  
      const csharpResponse = stdout.trim();
      res.send(csharpResponse);
    });
 });




app.get('/info', (req, res) => {
    axios.get(root)
        .then(response => {
            res.status(200).send(response.data); // Send the data as the response
        })
        .catch(error => {
            // Handle errors appropriately
            console.error(error);
            res.status(500).send('An error occurred.');
        });
});

app.get('/info/:command', (req, res) => {
    var command = req.params.command;
    console.log(command);
    axios.get(root + '/get?Input=' + command)
        .then(response => {
            res.status(200).send(response.data); // Send the data as the response
        })
        .catch(error => {
            // Handle errors appropriately
            console.error(error);
            res.status(500).send('An error occurred.');
        });

    // res.status(200).send(`DUMMY DATA SENT BACK FROM COMMAND INPUT '${command}'`);
});


//#####################################################################
// POST handler to receive a file from the client


// Set up storage configuration for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Uploads will be stored in the 'uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, 'uploaded-file' + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });
  

  // Handle the file upload
  app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Move the newly uploaded file to the desired location
    const uploadedFilePath = path.join(__dirname, 'uploads', 'uploaded-file' + path.extname(req.file.originalname));
    await fs.rename(req.file.path, uploadedFilePath);
  
    // 1. call the python script to parse the file
    // 2. send command to esp32 to start the EVSE update process
    //          the esp should wait to receive some packets first before sending reboot 
    //          command to LPC
    // 3. start sending the packets over

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  
    res.status(200).json({ message: 'File uploaded successfully', fileInfo });
  });