import {React, useState, useEffect} from "react";
import '../App.css';

const styles={
}

const Settings = () => {
    const [commandStr, setCommandStr] = useState('');
    const [processingRequest, setProcessingRequest] = useState(false);
    const [currentIP, setCurrentIP] = useState('');
    const [isIP, setIsIP] = useState(false);
    
    const sendPutReq = async (e) => {
        e.preventDefault();

        let newIP = encodeURIComponent(commandStr);
        console.log(newIP)
        setCommandStr('Setting as IP . . . ');
        try {
            const response = await fetch('http://localhost:4000/setip', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ newIP })
            });

            if (response.ok) {
                let responseData = await response.text();
                console.log(responseData);
                setCurrentIP(newIP);
            }
            else{
                throw new Error('Failed to update root value');
            }
        } catch (error) {
            console.error(error);
            setCurrentIP('');
        }
        setProcessingRequest(false);
        setCommandStr('');
    }

    return(
        <main>
            <div style={{'marginLeft': '10%'}}>
                <h1 className='pageTitle' id='title'>Settings</h1>
                {/* <textarea readonly id='outputText' style={{'overflow':'auto', 'resize':'none'}} 
                    name = 'output' 
                    rows = '40' 
                    cols = '65' >
                </textarea> */}
                <h2 className="infoText">Current IP Address of ESP32: {currentIP}</h2>
                <form className="commandInput" method='put' onSubmit={sendPutReq}>
                    <input className='textInput' type='text' value={commandStr} name="input" onChange={e => setCommandStr(e.target.value)} style={{color: processingRequest ? 'gray' : 'black'}} disabled={processingRequest}/>
                    <button type = 'submit' disabled={processingRequest} style={{backgroundColor: processingRequest ? 'gray' : 'rgb(9, 61, 119)'}} >Set IP</button>
                </form>             
            </div>
           
        </main>

    )
}

export default Settings;