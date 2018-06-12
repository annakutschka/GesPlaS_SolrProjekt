const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const request = require('sync-request')
const testFolder = 'JSON_Rohdaten';
const read = require('read-file');


fs.readdir(testFolder, (err, files) => { //preprocessing the files

  files.forEach(file => { // loops over every file in resources
    let plaintext = read.sync(`${testFolder}/${file}`, 'utf8'); //reads the input of the txt-file
    //const outstream = new stream;

    const input = JSON.parse(plaintext);
    const outJson = {}

    createOutputFile(input, outJson);

  });

})

let documents = []

// read file through fs readstream
/*const instream = fs.createReadStream('JSON_Rohdaten/Ambukrankpotheken.json') // simplewiki file has to be named 'simplewiki.json'
const outstream = new stream
let outJson = {}
const rl = readline.createInterface(instream, outstream)
*/
function createOutputFile(inputfile, outJson) {
  //console.log(inputfile["features"][0]["attributes"])
  for(let i = 0; i < inputfile["features"].length; i++){
    outJson = {}

    const field_value = inputfile["features"][i]["attributes"];
    //console.log(field_value)
    outJson["ka_i"] = field_value.KA_NUMMER == undefined ? null : field_value.KA_NUMMER
    outJson["bezeichn_text_de"] = field_value.BEZEICHN
    //TODO: if bei Typ statt Art

    if(field_value.ART){
      outJson["art_text_de"] = field_value.ART
    }else if(field_value.TYP){
      outJson["art_text_de"] = field_value.TYP
    }else{
      outJson["art_text_de"] = "Apotheke"
    }

    outJson["ort_text_de"] = field_value.ORT

    let hnr;
    let strasse;
    if(field_value.HAUSNUMMER){
      strasse = [field_value.STRASSE, field_value.HAUSNUMMER]
    }
    else if(field_value.HAUSNR){
      strasse = [field_value.STRASSE, field_value.HAUSNR]
    }


    outJson["str_txt_sort"] = strasse

    accumData(outJson)
  }
}

// send rest of Data when filestream is over
// otherwise the last <10k Objects are not sent
/*rl.on('close', function() {
    sendData(documents)
    documents = []
});*/

function accumData(postData) {
    documents.push(postData)
    if(documents.length == 10){
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
