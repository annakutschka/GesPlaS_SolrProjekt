//Components
var query = $('#search-input');
var plz = $('#search-plz');
var doctors = $('#filter-doctor');
var pharmacy = $('#filter-pharmacy');
var hospital = $('#filter-hospital');
var redCross = $('#filter-red-cross');
var submit = $('#search-button');

var url = '/search?';
var parameters = [];


//Construct fetch call
submit.on('click', function() {
    //Check if query input
    if(query.val().length !== 0) {
        var q = query.val();
        parameters.push(`search=${q}`);
    }
    //Check if plz input
    if(plz.val().length !== 0) {
        var q = plz.val();
        parameters.push(`plz=${q}`);
    }
    //Check if filters chosen
    if(doctors.is(":checked")) parameters.push(`fdoctors=true`);
    if(pharmacy.is(":checked")) parameters.push(`fpharmacy=true`);
    if(hospital.is(":checked")) parameters.push(`fhospital=true`);
    if(redCross.is(":checked")) parameters.push(`fredCross=true`);

    url = url + parameters.join('&');
    console.log(url);
    
    fetch(url)
    .then(response => response.json())
    .then(response => {
        console.log(response);
    });

    url = '/search?';
})