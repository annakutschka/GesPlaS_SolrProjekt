const express = require('express');
const solr = require('solr-client');
const app = express();
app.use(express.static('public'));

//Create the solr client and a query
const client = solr.createClient({
    host: 'localhost',
    port: 8983,
    core: 'techproducts',
    path: '/solr'
});
const query = client.createQuery();

app.get('/search', (req, res) => {
    query.q({ 'text' : req.query.search });
    client.search(query, function(err, obj){
        if(err) console.log(err);
        else res.send(obj.response.docs);
    });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));