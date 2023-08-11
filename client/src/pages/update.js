import {React, useState} from 'react';

const Update = () => {
    const [selectedFile, setSelectedFile] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };


    const handleSubmit = async () => {


        // var MAX_FILE_SIZE = 200*1024;
        // var MAX_FILE_SIZE_STR = "200KB";
    
        // if (fileInput.length == 0) {
        //     alert("No file selected!");
        // } else if (fileInput[0].size > 200*1024) {
        //     alert("File size must be less than 200KB!");
        // } else {
        //     // document.getElementById("newfile").disabled = true;
        //     // document.getElementById("filepath").disabled = true;
        //     // document.getElementById("upload").disabled = true;
        // }


        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                body: formData,
            });

            // Handle response from the server
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    return(
        <main>
            <div style={{'marginLeft': '10%'}}>
                <h1 className='pageTitle'>Update EVSE</h1>
                <div className='uploadRegion'>
                    <h2>Select a .avb or .bin file to upload</h2>
                    <input type="file" accept=".avb, .bin" onChange={handleFileChange}/>
                </div>
                <button onClick={handleSubmit}>Upload</button>
            </div>

        </main>
    )
}


export default Update;