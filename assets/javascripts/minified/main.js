// UI controller
var UIController = (function() {

  // Private
  var results, userPosition;
  var buildDOMFromResults = function() {
    var DOMString = '';
    var resultsWrapper = document.querySelector('.app-locations-wrapper');
    results.forEach(function(result) {
      var templateString = '<div class="app-location"><div class="app-location__info"><h3 class="app-location__bank-name">%name%</h3><p class="app-location__distance">%distance% km</p></div><img class="app-location__image" src="%image%"></div>'
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
  };





  // Public methods
  return {
    displayResults: function(res, pos) {
      results = res;
      userPosition = pos;
      buildDOMFromResults();
    },
    resultsAvailableChange: function() {
      document.querySelector('.loader').classList.remove('loader--loading');
      document.querySelector('.app-header__content').classList.add('app-header__content--hidden');
      document.querySelector('.app-locations').classList.add('app-locations--visible');
    },
    awaitingResults: function() {
      document.querySelector('.loader').classList.add('loader--loading');
    },
    sortByDistance: function() {
      var nodeContainer = document.querySelector('.app-locations-wrapper');
      var nodeList = document.querySelectorAll('.app-location');
      Array.prototype.map.call(nodeList, function(node) {
        return {
          nodeToSort: node,
          distance: node.getElementsByClassName('app-location__distance')[0].innerHTML.replace(' km', '')
        }
      }).sort(function(a, b) {
        return a.distance == b.distance? 0 : (a.distance > b.distance? 1: -1);
      }).forEach(function(element) {
        nodeContainer.appendChild(element.nodeToSort);
      });
    },
    showMultiCurrencyOnly: function() {
      var nodeContainer = document.querySelector('.app-locations-wrapper');
      var nodeList = document.querySelectorAll('.app-location');
      var regex = new RegExp('telenor', 'i');
      Array.prototype.filter.call(nodeList, function(node) {
        return !regex.test(node.getElementsByClassName('app-location__bank-name')[0].innerHTML);
      }).forEach(function(node) {
        nodeContainer.removeChild(node);
      });
      if(nodeContainer.querySelectorAll('.app-location').length === 0) {
        document.querySelector('.app-locations__no-multi-currency').classList.add('app-locations__no-multi-currency--visible');
      }
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
        radius: '2000',
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

var AppController = (function(uiCtrl, mapCtrl) {

  function initialization(event) {
    var content = document.querySelector('.app-header__content');
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        uiCtrl.awaitingResults();
        mapCtrl.findNearbyATMs(position).then(function(results) {
          uiCtrl.resultsAvailableChange();
          uiCtrl.displayResults(results, position);
        });
      }, function(error) {
        if(error.code === error.PERMISSION_DENIED) {
          event.target.removeEventListener('click', initialization);
          var errorPara = '<p class="app-header__init-error">You must allow geolocation. Refresh and try again.</p>';
          content.insertAdjacentHTML('beforeend', errorPara);
        }
      })
    }
    else {
      event.target.removeEventListener('click', initialization);
      var errorPara = '<p class="app-header__init-error">Your browser does not support geolocation. Please try another one.</p>';
      content.insertAdjacentHTML('beforeend', errorPara);
    }
  };


  // Public methods
  return {
    init: function() {
      var initButton = document.querySelector('#app-init');
      var sortButton = document.querySelector('#app-sort-results');
      var multiButton = document.querySelector('#app-multi-currency-only');
      initButton.addEventListener('click', initialization);
      sortButton.addEventListener('click', function(event) {
        uiCtrl.sortByDistance();
      });
      multiButton.addEventListener('click', function(event) {
        uiCtrl.showMultiCurrencyOnly();
      });
    }
  };
})(UIController, MapController);

AppController.init();
