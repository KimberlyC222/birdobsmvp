let apiKey = "dlulfn5710pf";
let apiKeyTwo = "84cc7e71c31648c5b097b31e514c7a82";
const bingImageSearchURL = "https://api.cognitive.microsoft.com/bing/v7.0/images/search";
const soundURL = 'https://cors-anywhere.herokuapp.com/https://www.xeno-canto.org/api/2/recordings';

const STORE = {
  birdQuery : "",
  numberOfResults: 0,
  currentPage: 0,
  resultData: null,
  loadingResultData: false,
  resultsPerPage: 5,
  isSearchEnabled: false
};

const RENDERSTATE = {
  appNeedsRender: true,
  formNeedsRender: true,
  headerNeedsRender: true,
  loadingNeedsRender: false,
  resultsNeedRender: false,
};

function getDataFromApi(searchTerm, callback, state) {
    let recentObs_URL;
    if(state !== "")
         recentObs_URL = 'https://ebird.org/ws2.0/data/obs/US-' + state + '/recent?key=dlulfn5710pf';
    else
        recentObs_URL = 'https://ebird.org/ws2.0/data/obs/US/recent?key=dlulfn5710pf';
    const query = {
      key: apiKey,
      q: `${searchTerm}`,
    };
    $.getJSON(recentObs_URL, query, callback).done((result)=>{
    });
}

function getImageFromAPI(item) {
  let image;
  $.ajax({
    url: bingImageSearchURL,
    type: 'get',
    data: {q: item.sciName},
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Ocp-Apim-Subscription-Key', apiKeyTwo);},
    success : function(data){
      image = getImageURL(data);
      item.image = image;
      RENDERSTATE.resultsNeedRender = true;
      render();
    }, 
    error: function(e){
      let imagefail = "http://www.stickpng.com/assets/images/584ab294e583a46e8c837a30.png";
      item.image = imagefail;
      RENDERSTATE.resultsNeedRender = true;
      render();
    }
  });
}

function getImageURL(data){
  const firstResult = data.value[0];
  const imageURL = firstResult.contentUrl;
  return imageURL;
}

function renderResult(image, result) {
  return `
    <div class="obsInfo">
      <p>
      <strong>${result.comName}</strong>
      <img src="${image}" alt="${result.comName}"/>
      <br /><strong>Scientific Name</strong>: ${result.sciName}
      <br /><strong>Observation Date</strong>: ${result.obsDt}
      <br /><strong>Location</strong>: ${result.locName}
      <br /><strong>Count</strong>: ${result.howMany}
      <br /><button class="playSoundButton" data-bird="${result.comName}">Play Call/Song</button>
      </p>
    </div>
    <br />`;
}

function setSearchData(data) {
  STORE.numberOfResults = data.length;
  STORE.resultsData = data;
  STORE.loadingResultData = false;
  RENDERSTATE.resultsNeedRender = true;
  RENDERSTATE.loadingNeedsRender = true;
  render();
}

function playSoundFromAPI(query) {
  $.ajax({
    url: soundURL,
    type: 'get',
    data: {query: query},
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Origin', null);},
    success : function(data){
      const firstResult = data.recordings[0];
      if (firstResult) {
        const firstResultURL = firstResult.file;
        var a = new Audio(firstResultURL);
        a.play();
        setTimeout(function () {
          a.pause();
          a.currentTime = 0;
        }, 10000);
      }
      else {
        console.log("No Recordings Found");
      }
    }, 
    error: function(e){
         console.log(e);
    }
  });
}

function incrementPage() {
  STORE.currentPage++;
  RENDERSTATE.resultsNeedRender = true;
  //console.log(STORE.currentPage);
  render();
}

function decrementPage() {
  STORE.currentPage--;
  RENDERSTATE.resultsNeedRender = true;
  render();
}

function render() {
  let results = "" ;
  if (STORE.resultsData) {
    results = STORE.resultsData.slice(STORE.currentPage*STORE.resultsPerPage, STORE.resultsPerPage+STORE.currentPage*STORE.resultsPerPage)
          .map((item, index) => {
              if (!item.image) {
                getImageFromAPI(item);
              }
              return renderResult(item.image, item);
          }).join("");
        console.log( 
          Math.round(STORE.numberOfResults / STORE.resultsPerPage));
  }
  let appHTML = `
    <header id="appHeader"></header>
    <div id="birdForm"></div>
    <div id="loadingDiv"></div>
    <div id="results"></div>
  `;
  if (RENDERSTATE.appNeedsRender) {
    $('main#app').html(appHTML);
    RENDERSTATE.appNeedsRender = false;
  }
  if (RENDERSTATE.headerNeedsRender) {
    $('header#appHeader').html(`<h1>Recent US Bird Sightings</h1>`);
    RENDERSTATE.headerNeedsRender = false;
  }
  if (RENDERSTATE.formNeedsRender) {
      let searchFormHTML = `<form action="#" class="js-search-form">
      <label for="query"></label>
      <select id ="stateSelect">
        <option value="">Select a State</option>
	      <option value="AL">Alabama</option>
	      <option value="AK">Alaska</option>
      	<option value="AZ">Arizona</option>
	      <option value="AR">Arkansas</option>
	      <option value="CA">California</option>
	      <option value="CO">Colorado</option>
	      <option value="CT">Connecticut</option>
	      <option value="DE">Delaware</option>
	      <option value="DC">District Of Columb
	          </option>
	      <option value="FL">Florida</option>
	      <option value="GA">Georgia</option>
	      <option value="HI">Hawaii</option>
	      <option value="ID">Idaho</option>
	      <option value="IL">Illinois</option>
	      <option value="IN">Indiana</option>
	      <option value="IA">Iowa</option>
	      <option value="KS">Kansas</option>
	      <option value="KY">Kentucky</option>
	      <option value="LA">Louisiana</option>
	      <option value="ME">Maine</option>
      	<option value="MD">Maryland</option>
      	<option value="MA">Massachusetts</option>
      	<option value="MI">Michigan</option>
      	<option value="MN">Minnesota</option>
      	<option value="MS">Mississippi</option>
      	<option value="MO">Missouri</option>
      	<option value="MT">Montana</option>
      	<option value="NE">Nebraska</option>
      	<option value="NV">Nevada</option>
      	<option value="NH">New Hampshire</option>
      	<option value="NJ">New Jersey</option>
      	<option value="NM">New Mexico</option>
      	<option value="NY">New York</option>
      	<option value="NC">North Carolina</option>
      	<option value="ND">North Dakota</option>
      	<option value="OH">Ohio</option>
      	<option value="OK">Oklahoma</option>
      	<option value="OR">Oregon</option>
      	<option value="PA">Pennsylvania</option>
	      <option value="RI">Rhode Island</option>
	      <option value="SC">South Carolina</option>
      	<option value="SD">South Dakota</option>
      	<option value="TN">Tennessee</option>
      	<option value="TX">Texas</option>
      	<option value="UT">Utah</option>
      	<option value="VT">Vermont</option>
	      <option value="VA">Virginia</option>
      	<option value="WA">Washington</option>
      	<option value="WV">West Virginia</option>
      	<option value="WI">Wisconsin</option>
      	<option value="WY">Wyoming</option>
    </select>
      <button type="submit" ${(STORE.isSearchEnabled)? "" : 'disabled="disabled"'}>Search</button>
    </form>`;   
    $('div#birdForm').html(searchFormHTML);
    $('#stateSelect').val(STORE.selectedState);
    handleStateDropDownChange();
    watchSubmit();
    RENDERSTATE.formNeedsRender = false;
  }
  if (RENDERSTATE.loadingNeedsRender) {
    const loadingHTML = ` ${(STORE.loadingResultData)?'loading' : ''}`;
    $('div#loadingDiv').html(loadingHTML);
    RENDERSTATE.loadingNeedsRender = false;
  }
  if (RENDERSTATE.resultsNeedRender) {
    //console.log(`results are ${results}`)
      const resultsHTML = `
    <div class="js-search-results" aria-live="assertive" ${(results.length > 0) ? '' : 'hidden'}>
      <div class="pageButtons">
        <button id='previous' ${(STORE.currentPage === 0) ? 'hidden' : ''}>&#8592;Prev</button>
        <button id='next' ${(STORE.currentPage < 
          Math.floor(STORE.numberOfResults / STORE.resultsPerPage))? 
                  '' : 'hidden'}>Next&#8594;</button>
     </div>
     ${results} 
    </div>
    <div class="pageButtons">
      <button id='previousBottom' ${(STORE.currentPage === 0) ? 'hidden' : ''}>&#8592;Prev</button>
      <button id='nextBottom' ${(STORE.currentPage < 
          Math.floor(STORE.numberOfResults / STORE.resultsPerPage))? 
                  '' : 'hidden'}>Next&#8594;</button>
    </div>`;
    $('div#results').html(resultsHTML);
    bindNextButton();
    bindPreviousButton();
    watchPlaySoundButtonClick();
    RENDERSTATE.resultsNeedRender = false;
  }
}

function handleStateDropDownChange() {
  $('#stateSelect').change(function(changeEvent) {
    const newVal = $('#stateSelect').find(":selected").val();
    console.log(newVal);
    if (newVal === "") {
      STORE.isSearchEnabled = false;
    }
    else {
      STORE.isSearchEnabled = true;
    }
    STORE.selectedState = newVal;
    RENDERSTATE.formNeedsRender = true;
    render();
  });
}

function watchPlaySoundButtonClick () {
  $(".playSoundButton").on('click', function(clickEvent) {
    const bird = $(clickEvent.target).data('bird');
    playSoundFromAPI(bird);  
  })
}
  

function bindNextButton(){
  $("#next").on("click", () => incrementPage());
  $("#nextBottom").on("click", () => incrementPage());
}

function bindPreviousButton(){
  $("#previous").on("click", () => decrementPage());
  $("#previousBottom").on("click", () => decrementPage());
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    STORE.currentPage = 0;
    STORE.loadingResultData = true;
    RENDERSTATE.loadingNeedsRender = true;
    let state = $('#stateSelect').val();
    render();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    getDataFromApi(query, setSearchData, state);
  });
}

$(render);
$(playSoundFromAPI);