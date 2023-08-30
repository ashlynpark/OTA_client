const root = 'http://192.168.10.113';

const express = require("express");
const morgan = require("morgan");
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const { spawn} = require('child_process'); // Import the exec function
const exec = util.promisify(require('child_process').exec);


const app = express();
app.use(morgan('dev'));
app.use(cors());
const PORT = process.env.PORT || 4000; //process.env.PORT is going to check your environment variables to see if you already have a PORT defined there if not it will use PORT 4000
const HOST = 'localhost';
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server running, app listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get('/', (req, res)=>{
    axios.get(root)
    .then(response => {
        res.status(200).send('Express server ready to go');
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred.');
    });
});

app.get('/hewwo', (req, res, next) => {
  // Execute the Python script
   res.status(200).send("HEWWO?????");
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

let currFileName = '';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Uploads will be stored in the 'uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, 'uploaded-file' + path.extname(file.originalname));
      currFileName = 'uploaded-file' + path.extname(file.originalname);
    },
  });


const upload = multer({ storage });

  // Handle the file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // parsing file using python script
    let all_packets = [];
    let receivedData = '';
    const pythonProcess = spawn('python3', ['./fileparserAVB.py', './uploads/'+currFileName]);
    pythonProcess.stdout.on('data', (data) => {
      receivedData += data.toString();
      const lines = receivedData.split('\n');
      receivedData = lines.pop(); // Keep the last incomplete line for the next chunk
  
      let packets = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
              console.error('Error parsing JSON:', e);
              return null;
          }
      });
      all_packets = all_packets.concat(packets);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error executing Python script: ${data}`);
    });

    // await Promise.all([
    //     new Promise(resolve => pythonProcess.on('close', resolve)),
    //     axios.post(root + '/post', np, { headers }),
    //     ...all_packets.map(async packet => await axios.post(root + '/post', packet.toString()))
    // ]);
    pythonProcess.on('close', async(code) => {
        if (code === 0) {
            console.log('Python script executed successfully');
            console.log(`Number of packets parsed from Python script: ${all_packets.length}`)
            // packets = lines.map(line => JSON.parse(line));
            // console.log(packets.toString());
            // Rest of your code for sending ESP32 commands and other tasks
            try {
                const headers = {
                    'Content-Type': 'text/plain'
                };
                const np = "numPackets="+all_packets.length.toString();
                console.log(np);
                // Send the 'numPackets' post request
                await axios.post(root + '/post', np, { headers });

                // Send individual packets in a loop
                for (let i = 0; i < all_packets.length; i++) {
                    // console.log(all_packets[i][i.toString()]);
                    let s = all_packets[i][i.toString()];
                    if(i == all_packets.length - 1) console.log(all_packets[i]);
                    await axios.post(root + '/post', s);
                }
                // Continue with the rest of your code
                console.log('All packets sent successfully');
                // Rest of your code for sending ESP32 commands and other tasks
            } catch (error) {
                console.error('An error occurred:', error);
                res.status(500).json({ error: 'An error occurred while sending packets' });
            }

        } else {
            console.error(`Python script exited with code ${code}`);
            res.status(500).json({ error: 'Error executing Python script' });
        }
    });

    // // start sending all packets
    // console.log(np);
    // axios.post(root + '/post', np, { headers }
    // ).then(async (response)=> {
    //     console.log(response);
    //     for(let i = 0; i < all_packets.length; i++){
    //         // const requestBody = {
    //         //     [i.toString()]: all_packets[i] // Use dynamic key-value pair
    //         // };
    //         // console.log(requestBody)
    //         // await axios.post(root + '/post', requestBody);
    //         await axios.post(root + '/post', all_packets[i].toString());
    //     }
    // }).catch(error => {
    //     console.error(error);
    //     res.status(500).json({ error: 'An error from the ESP32 server occurred' });
    // })

    res.status(200).json({ message: 'File uploaded successfully'});
    // 2. send command to esp32 to start the EVSE update process
    //          the esp should wait to receive some packets first before sending reboot 
    //          command to LPC
    // 3. start sending the packets over
  
});
