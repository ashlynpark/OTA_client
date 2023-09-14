import {React, useState, useEffect} from "react";
import { Scrollbars } from 'react-custom-scrollbars-2';
import '../App.css';

const styles={
    outputTextArea: {
        width: window.innerWidth <= 1200 ? window.innerWidth >= 600? '80vw' : '90vw' : '50vw',
        maxWidth: '900px',
        height: window.innerWidth <= 1200 ? '50vw' : '33vw',
        display: 'block',
        minHeight: window.innerWidth <= 1200 ? '600px' : '400px',
        margin: '1%',
        backgroundColor: 'rgb(221, 225, 230)',
        borderRadius: '10px',
        
    }
}

const Terminal = () => {
    const [commandStr, setCommandStr] = useState('');
    const [allData, setAllData] = useState([]);
    const [counter, setCounter] = useState(0);
    const [processingRequest, setProcessingRequest] = useState(false);
    useEffect(() => {
        // This function will be called when the component mounts
        sendInitialReq();
      }, []);

    const sendInitialReq = async () => {
        setProcessingRequest(true);
        // try {
        //     const response = await fetch('http://localhost:4000/info');
        
        //     if (response.ok) {
        //     let responseData = await response.text(); 
        //     console.log('initial request 1 success');
        //     } else {
        //     console.error('Request failed with status:', response.status);
        //     }
        // } catch (error) {
        //     console.error('An error occurred:', error);
        // }
        // try {
        //     const response = await fetch('http://localhost:4000/info/R');
        
        //     if (response.ok) {
        //     let responseData = await response.text(); 
        //     console.log(responseData);
        //     console.log('initial request 2 success');
        //     } else {
        //     console.error('Request failed with status:', response.status);
        //     }
        // } catch (error) {
        //     console.error('An error occurred:', error);
        // }
        setProcessingRequest(false);
    }
    
    const sendGetReq = async (e) => {
        e.preventDefault();

        let cmd = encodeURIComponent(commandStr);
        setCommandStr('Sending . . . ');
        try {
            setProcessingRequest(true);
            const response = await fetch('http://localhost:4000/info/' + cmd);
            if (response.ok) {
            let responseData = await response.data; 
            console.log(responseData);
            allData.push(responseData);
            } else {
            console.error('Request failed with status:', response.status);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
        setProcessingRequest(false);
        setCommandStr('');

    }

    return(
        <main>
            <div style={{'marginLeft': '10%'}}>
                <h1 className='pageTitle' id='title'>Terminal</h1>
                {/* <textarea readonly id='outputText' style={{'overflow':'auto', 'resize':'none'}} 
                    name = 'output' 
                    rows = '40' 
                    cols = '65' >
                </textarea> */}
                <Scrollbars  style={styles.outputTextArea}>
                    {allData.map(data => (
                        <p className="outputText"><span style={{whiteSpace: 'pre-line'}}>{data}</span></p>
                    ))}
                </Scrollbars>
                <form className="commandInput" method='get' onSubmit={sendGetReq}>
                    <input className='textInput' type='text' value={commandStr} name="input" onChange={e => setCommandStr(e.target.value)} style={{color: processingRequest ? 'gray' : 'black'}} disabled={processingRequest}/>
                    <button type = 'submit' disabled={processingRequest} style={{backgroundColor: processingRequest ? 'gray' : 'rgb(9, 61, 119)'}} >Send</button>
                </form>             
            </div>
           
        </main>

    )
}

export default Terminal;