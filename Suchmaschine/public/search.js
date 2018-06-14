//Components
var query = $('#search-input');
var pharmacy = $('#filter-pharmacy');
var hospital = $('#filter-hospital');
var submit = $('#search-button');

var searchError = $('.search-error');

var results;
var snippets;

//Construct fetch call
submit.on('click', function() {
    //Stop if no query input
    searchError.empty();
    if(query.val() === "") {
        searchError.append("Bitte gib mindestens einen Suchbegriff ein.");
        return;
    }

    var url = '/search?';
    var parameters = [];

    //Check if query input
    var q = query.val();
    parameters.push(`search=${q}`);

    //Check if filters chosen
    if(pharmacy.is(":checked")) parameters.push(`fpharmacy=true`);
    if(hospital.is(":checked")) parameters.push(`fhospital=true`);

    //Create fetch URL
    url = url + parameters.join('&');

    //Fetch requested documents
    fetchResults(url);
})

function handleClickSuggestions(e) {
    var url = '/search?';
    var parameters = [];

    console.log(e.target);
    parameters.push(`search=${q}`);

    //Check if filters chosen
    if(pharmacy.is(":checked")) parameters.push(`fpharmacy=true`);
    if(hospital.is(":checked")) parameters.push(`fhospital=true`);

    //Create fetch URL
    url = url + parameters.join('&');

    //Fetch requested documents
    fetchResults(url);
}

function fetchResults(url) {
    fetch(url)
    .then(response => response.json())
    .then(response => {
        results = response.response.docs;
        snippets = response.highlighting;

        if(response.response.numFound === 0) {
            var suggestions = response.spellcheck.suggestions[1].suggestion;
            var suggestionWords = [];

            for(var i = 0; i < suggestions.length; i++) {
                suggestionWords.push(`<span class="suggestion">"${suggestions[i].word}"</span>`);
            }
        }
        displayResults(results, snippets, suggestionWords);
    });
}

function displayResults(results, snippets, suggestions = []) {
    var wrapper = $(".wrapper-result");
    wrapper.empty();

    if(results.length === 0) {
        wrapper.append(`<p class="search-no-results">Kein Ergebnisse für \"${query.val()}\" gefunden.</p>
        <p class="search-suggestions">Meintest du ${suggestions.join(" oder ")}? </p>`);
    } else {
        wrapper.append(`<p class="search-info">Suchergebnisse für: ${query.val()}</p>`);
        for(var i = 0; i < results.length; i++) { 
            //Get the highlighting for this particular result/ID
            var snippet = snippets[results[i].id];
            //Chain all snippets
            var snippetString = Object.values(snippet).join(", ");

            //Show all results with Bezeichnung/Adresse/Snippets
            wrapper.append(`<div class="search-result">
            <p class="result-header">${results[i].bezeichn_text_de}<p>
            <p class="result-address">${results[i].str_txt_sort.join(" ")}, ${results[i].ort_text_de}</p>
            <p class="result-snippets">${snippetString}</p>
            </div>`);
        };
    }
}