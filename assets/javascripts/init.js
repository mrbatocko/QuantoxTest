document.querySelector('#app-init').addEventListener('click', function(event) {
  if('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
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
