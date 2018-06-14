const express = require('express');
const solr = require('solr-client');
const app = express();
app.use(express.static('public'));

//Create the solr client and a query
const client = solr.createClient({
    host: 'localhost',
    port: 8983,
    core: 'gettingstarted',
    path: '/solr'
});

//Craft query with request params, send query, return result
app.get('/search', (req, res) => {
    const query = client.createQuery();

    //Apply different weights to different fields
    query
    .dismax()
    .q({"*" : req.query.search })
	.qf({bezeichn_text_de : 4 , art_text_de : 3, ort_text_de: 3, str_txt_sort: 2})

    //If both filters are chosen, nothing will be filtered
    if(req.query.fpharmacy && req.query.fhospital);
    //Filtered for pharmacies
    else if(req.query.fpharmacy) query.matchFilter("art_text_de", "Apotheke");
    //When filtered for hospitals, everything but "Apotheke" in art_text_de is requested
    else if(req.query.fhospital) query.matchFilter("-art_text_de", "Apotheke");

    //Returning Snippets
    query.hl({
        on: true,
        fl: ["bezeichn_text_de", "art_text_de", "ort_text_de", "str_txt_sort"] 
    });

    client.spell(query, function(err, obj){
        if(err) console.log(err);
        else res.send(obj);
    });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));