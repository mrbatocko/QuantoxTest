
// User interface controller

var UIController = (function() {

  // Private results array
  var results, userPosition;
  var buildDOMFromResults = function() {
    var DOMString = '';
    var resultsWrapper = document.querySelector('.app-locations-wrapper');
    results.forEach(function(result) {
      var templateString = '<div class="app-location"><img class="app-location__image" src="%image%"><h3 class="app-location__bank-name">%name%</h3><p class="app-location__distance">&Tilde; %distance% km</p></div>'
      var p1 = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
      var p2 = new google.maps.LatLng(result.geometry.location.lat(), result.geometry.location.lng());
      templateString = templateString.replace('%distance%', (Math.round(google.maps.geometry.spherical.computeDistanceBetween(p1, p2))/1000).toFixed(2));
      templateString = templateString.replace('%name%', result.name);
      var staticMapImageUrl = 'https://maps.googleapis.com/maps/api/staticmap?center=%vicinity%&zoom=14&size=600x300&maptype=roadmap&markers=color:blue%7C%lat%,%lng%&key=AIzaSyAKx0Hrnc77Lkhu3y4zTLCr8cdnNuoQzI4';
      staticMapImageUrl = staticMapImageUrl.replace('%vicinity%', result.vicinity);
      staticMapImageUrl = staticMapImageUrl.replace('%lat%', result.geometry.location.lat());
      staticMapImageUrl = staticMapImageUrl.replace('%lng%', result.geometry.location.lng());
      templateString = templateString.replace('%image%', staticMapImageUrl);
      DOMString += templateString;
    });
    resultsWrapper.insertAdjacentHTML('beforeend', DOMString);
    document.querySelector('.app-header').classList.remove('app-header--visible');
  };
  return {
    displayResults: function(res, pos) {
      results = res;
      userPosition = pos;
      buildDOMFromResults();
    }
  };

})();

// Google maps controller
var MapController = (function() {


  // Private properties
  var userPosition;
  var nearbyATMs;



  // Public methods
  return {
    findNearbyATMs: function(locationObj) {

      userPosition = new google.maps.LatLng(locationObj.coords.latitude, locationObj.coords.longitude);

      // Create a map object and specify the DOM element for display.
      var map = new google.maps.Map(document.getElementById('map'), {
        center: userPosition,
        zoom: 15
      });
      var request = {
        location: userPosition,
        radius: '10000',
        types: ['atm']
      };
      var service = new google.maps.places.PlacesService(map);
      return new Promise(function(resolve, reject) {
        service.nearbySearch(request, function(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            resolve(results, userPosition);
          }
          else {
            reject(status);
          }
        });
      });
    }
  };

})();

var AppController = (function(uiCtr, mapCtrl) {

  // Public methods
  return {
    init: function() {
      document.querySelector('#app-init').addEventListener('click', function(event) {
        if('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(function(position) {
            mapCtrl.findNearbyATMs(position).then(function(results) {
              uiCtr.displayResults(results, position);
            });
          }, function(error) {
            if(error.code === error.PERMISSION_DENIED) {
              document.getElementsByClassName('app-header__init-error')[1].classList.add('app-header__init-error--error-thrown');
            }
          })
        }
        else {
          document.getElementsByClassName('app-header__init-error')[0].classList.add('app-header__init-error--error-thrown');
        }
      });
    }
  };
})(UIController, MapController);

AppController.init();
