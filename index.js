const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const request = require('sync-request')
const testFolder = 'JSON_Rohdaten';

//for adding all data in one Object
let documents = []

fs.readdir(testFolder, (err, files) => { //preprocessing the files
  files.forEach(file => { // loops over every file in resources
    let plaintext = read.sync(`${testFolder}/${file}`, 'utf8'); //reads the input of the txt-file
    const outstream = new stream;

    const input = JSON.parse(plaintext);
    const outJson = {}

    outstream = createOutputFile(input, outJson);
  });
})

//write all important data in one file
function createOutputFile(inputfile, outJson){

  const outfile = {}

  for(var i = 0; i < inputfile.length; i++){

    const field_value = inputfile["features"][i]["attributes"];
    outJson["diensstelle_text_de"] = field_value.DienstSt
    outJson["art_text_de"] = field_value.Art
    outJson["ort_text_de"] = field_value.Ort
    outJson["str"] = field_value.Strasse
    outJson["link_txt_sort"] = field_value.Hnr
    outJson["popu_f"] = field_value.Bezirk
    outJson["popu_f"] = field_value.Typ

    outfile += outJson;
  }

  //return outfile
  //accumulate JSON objects in one Object before they are sent to solr
  accumData(outfile);
}

// accumulates JSON objects in array until 10k before they are sent
function accumData(postData) {
    documents.push(postData)
    if(documents.length == 10000){
        // send array of JSON objects to solr server
        console.log('sending')
        sendData(documents)
        documents = []
    }
}

// sends data to solr server
function sendData(postData){
    var clientServerOptions = {
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    // on response from server, log response
    let response = request('POST', 'http://localhost:8983/solr/gettingstarted/update/json/docs?commit=true&overwrite=true', clientServerOptions);
    if (response.statusCode !== 200) {
      throw(response.body)
    } else {
      console.log('sent')
    }
}

// send rest of Data when filestream is over
// otherwise the last <10k Objects are not sent
rl.on('close', function() {
    sendData(documents)
    documents = []
});