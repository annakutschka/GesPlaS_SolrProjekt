const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const request = require('sync-request')
const testFolder = 'JSON_Rohdaten';


fs.readdir(testFolder, (err, files) => { //preprocessing the files

  files.forEach(file => { // loops over every file in resources
    let plaintext = read.sync(`${testFolder}/${file}`, 'utf8'); //reads the input of the txt-file
    const outstream = new stream;

    const input = JSON.parse(plaintext);
    const outJson = {}

    outstream = createOutputFile(input, outJson);

  });

})


function createOutputFile(inputfile, outJson){

  const outfile = {}

  for(int i = 0; i < inputfile.length; i++){

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

  return outfile
}




//////////////////////////////////////////

let documents = []

// read file through fs readstream
const instream = fs.createReadStream('RotesKreuz.json') // simplewiki file has to be named 'simplewiki.json'
const outstream = new stream
const rl = readline.createInterface(instream, outstream)

// do this for every line in the stream
rl.on('line', function(line) {

    // extract only the relevant properties of the input JSON file
    const lineJson = JSON.parse(line);
    const outJson = {}

    // write relevant properties to output JSON file
    outJson["aux_txt_sort"] = lineJson.auxiliary_text
    outJson["title_txt_en"] = lineJson.title
    outJson["text_txt_en"] = lineJson.text
    outJson["heading_txt_sort"] = lineJson.heading
    outJson["link_txt_sort"] = lineJson.outgoing_link
    outJson["popu_f"] = lineJson.popularity_score
    // opening_text is optional
    if(lineJson.opening_text) outJson["opening_txt_en"] = lineJson.opening_text
    else outJson["opening_txt_en"] = ""
    // coordinates is optional
    if(lineJson.coordinates) outJson["location"] = lineJson.coordinates
    else outJson["location"] = []

    //accumulate JSON objects before they are sent
    accumData(outJson)
})

// send rest of Data when filestream is over
// otherwise the last <10k Objects are not sent
rl.on('close', function() {
    sendData(documents)
    documents = []
});

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
