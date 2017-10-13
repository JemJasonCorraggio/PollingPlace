/*global $*/
var SEARCH_URL = "https://www.googleapis.com/civicinfo/v2/voterinfo";
var ELECTIONS_URL = "https://www.googleapis.com/civicinfo/v2/elections";
//make html for the polling place
var RESULT_HTML_TEMPLATE = (
    '<div>' +
    '<p class="pollingLocation"></p>'+
    '<p class="addressLine1"></p>'+
    '<p class="addressLine2"></p>'+
    '<p class="hours"></p>'+
    '</div>'
);
//make html for the supported elections
var ELECTION_HTML_TEMPLATE = (
    '<div>'+
    '<p class="electionName"></p>'+
    '<p class="electionDay"></p>'+
    '</div>'
);
//get polling place from API
function getDataFromApi(searchTerm, callback) {
    var query = {
        key: "AIzaSyCzXl1JxA1MSDhfE4ibgdqpjalTI7GYb1A",
        address: searchTerm,
    };
    //check if data exists for address
    try {$.parseJSON($.getJSON(SEARCH_URL, query, callback));}
    catch(e){
        $(".js-search-results").html("<p>There is no data for this address. The address may have been entered incorrectly or there may not be a supported election in your area. Please check that the address is in the correct format (ex. 123 Place St. New Orleans, LA 12345) and the list of supported elections and try again.</p>");
    }
    //retrieve data for working address
    $.getJSON(SEARCH_URL, query, callback);
}
//get list of supported elections
function getElectionData(callback) {
    var query = {
      key: "AIzaSyCzXl1JxA1MSDhfE4ibgdqpjalTI7GYb1A",
    };
    $.getJSON(ELECTIONS_URL, query, callback);
}
//render polling place html and add content
function renderResult(result) {
    var template = $(RESULT_HTML_TEMPLATE);
    template.find(".pollingLocation").text(result.pollingLocations[0].address.locationName);
    template.find(".addressLine1").text(result.pollingLocations[0].address.line1);
    template.find(".addressLine2").text(result.pollingLocations[0].address.city + ", "+result.pollingLocations[0].address.state + " "+result.pollingLocations[0].address.zip);
    template.find(".hours").text("Polling hours: " +result.pollingLocations[0].pollingHours);
    return template;
}
//render supported elections html and add content
function renderElections (result){
    var template = $(ELECTION_HTML_TEMPLATE);
    template.find(".electionName").text("Name: "+result.name);
    template.find(".electionDay").text("Election Day: "+result.electionDay);
    return template;
}
//display polling place html on page
function displaySearchData(data) {
    var results;
    results = renderResult(data);
    $(".js-search-results").html(results);
}
//display supported elections on page
function displayElections(data) {
    var results = data.elections.map(function(item, index) {
        return renderElections(item);
    });
    $(".elections").html(results);
}
//event listeners for see/hide supported elections and submit buttons
function watchSubmit() {
    //see hide supported elections
    var electionsSearched = false;
    $(".js-elections").on("click", function(){
        //check if election data has been pulled
        if (electionsSearched){
            $(".elections").toggleClass("hidden");
        }
        // pull election data
        else{
            electionsSearched=true;
            getElectionData(displayElections);
            $(".elections").toggleClass("hidden");
        }
    });
    //submit
    $(".js-search-form").submit(function(event) {
        event.preventDefault();
        var queryTarget = $(event.currentTarget).find(".js-query");
        var query = queryTarget.val();
        // clear out the input
        queryTarget.val("");
        //find polling place
        getDataFromApi(query, displaySearchData);
    });
}
$(watchSubmit);
