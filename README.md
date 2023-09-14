
# PilotTerm Online
Run diagnostic commands over WiFi to EVSE. Please contact Ell Park on Teams if you have any questions.




## Installation

### Before running
Make sure to have Node.js v.18^ and npm v.9^ installed into your machine. If not, please request IT to install it for you.


### Running the project for the first time (Installing dependencies)
This project requires node modules that are not included in the git repo. When first running this project, please do the following:

1. From the root directory, cd into client and run npm install:
```bash
  cd client
  npm install
```
2. cd back into the root directory and into server; run npm install:
```bash
cd ../server
npm install
```
## Run Locally
Once dependencies are installed, you're ready to run this project locally.
From your File Explorer, double click the `run_pt.bat` batch script.
This should open a Command Prompt, from which two other Command Prompts will quickly open, and then start the Express server on one of them, and the React client on another. The client should automatically open upon compiling.

The proxy server will run on localhost:4000 if free; the client should run on localhost:3000 if free.

Closing the Command Prompts will terminate the scripts that run the server and client.

