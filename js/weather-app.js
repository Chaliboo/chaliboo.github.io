var weatherApp = {};

// Mock data for testing purpuses
// init app with 'dev' param to use
var mockData = {"observations":{"location":[{"observation":[{"daylight":"D","description":"Overcast. Chilly.","skyInfo":"18","skyDescription":"Overcast","temperature":"3.72","temperatureDesc":"Chilly","comfort":"0.89","highTemperature":"3.90","lowTemperature":"-0.20","humidity":"83","dewPoint":"1.11","precipitation1H":"*","precipitation3H":"0.00","precipitation6H":"0.00","precipitation12H":"*","precipitation24H":"*","precipitationDesc":"","airInfo":"*","airDescription":"","windSpeed":"11.12","windDirection":"290","windDesc":"West","windDescShort":"W","barometerPressure":"1024.80","barometerTrend":"Falling","visibility":"18.02","snowCover":"*","icon":"7","iconName":"cloudy","iconLink":"https://weather.cit.api.here.com/static/weather/icon/17.png","ageMinutes":"67","activeAlerts":"0","country":"France","state":"Île-de-France","city":"Paris","latitude":48.8534,"longitude":2.3486,"distance":13.89,"elevation":0.00,"utcTime":"2017-01-15T13:00:00.000+01:00"}],"country":"France","state":"Île-de-France","city":"Paris","latitude":48.85339,"longitude":2.34864,"distance":0.00,"timezone":1}]},"feedCreation":"2017-01-15T13:07:36.435Z","metric":true};

/*
 *  MODEL
 *
 */
weatherApp.model = {
  weather: {},
  units: 'c',
  isFirstRun: true,
  setUnits: function(unit){
    this.units = unit;    
  },
  location: {
    lat: 0,
    lon: 0
  },
  // find current location
  findLocation: function(){
      var success = function(position) {
        weatherApp.model.location.lat = position.coords.latitude;
        weatherApp.model.location.lon = position.coords.longitude;
        $( document ).trigger( "geolocation:resolved" );
       };
      var error = function() {
        $( document ).trigger( "geolocation:rejected" );
      };
    //check geolocation is enabled
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(success, error);
    }else{
      $( document ).trigger( "geolocation:rejected" );
    }
  },
  // connect to weather api and get data
  getWeather: function(options){
    var units = (weatherApp.model.units === 'c') ? 'true' : 'false',
        saerchData = {
            product: 'observation',
            oneobservation: 'true',
            metric: units,
            app_id: 'DemoAppId01082013GAL',
            app_code: 'AJKnXv84fjrb0KIHawS0Tg'
          };
         if('city' in options){
           saerchData.name = options.city;
         }else{
            saerchData.latitude = weatherApp.model.location.lat;
            saerchData.longitude = weatherApp.model.location.lon;
         }
        $.ajax({
          url: 'https://weather.cit.api.here.com/weather/1.0/report.json',
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'jsonpcallback',
          data: saerchData,
          success: function (data) {
            if('observations' in data){
              weatherApp.model.weather = data.observations.location[0].observation[0];
              $( document ).trigger( "getWeather:resolved" );
            }else{
              var message = "Unable to Find City Please Try Again";
              weatherApp.controller.disaplyError(message);
            }
          }
        });

  },
  init: function(env){
    $(document).on("geolocation:resolved", function(){
      if(env === 'dev'){
         weatherApp.model.weather = mockData;
         $( document ).trigger( "getWeather:resolved" );
      }else{
        var options = {geo: true}
        weatherApp.model.getWeather(options);
      }
    })
    $(document).on("geolocation:rejected", function(){
      var message = "Unable to retrieve your location Try Searching";
      weatherApp.controller.disaplyError(message);
    })
    $( document ).on("getWeather:resolved", function(){
      weatherApp.controller.initView();
    })
    weatherApp.model.findLocation();
  }
};

/*
 *  VIEW
 *
 */
weatherApp.view = {
  disaplyError: function(message){
    $('.message').html(message).css('bottom', '0');
  },
  hideError: function(){
    $('.message').html("").css('bottom', '-50px');
  },
  setUnits: function(newUnits, oldUnits){
    $('.units').removeClass(oldUnits).addClass(newUnits);
  },
  displayTemp: function(curr, target){
    var elem = $('#temp');
    (function loop(){
       elem.html(curr + 'º');

       if (curr !== target){
        elem.attr('data-before', curr -1 + 'º')
        setTimeout(function(){
          target > 0 ? curr++ : curr--;
          requestAnimationFrame(loop);
        }, 32)
      }else{
        elem.attr('data-before', '')
        $('#weather-app').addClass('loaded');
      } 
      
    })();
  },
  toggleSearch: function(context){
      $('.input-city').toggleClass('hidden');
      $('.submit').toggleClass('hidden');
      $('[for="input-city"]').toggleClass('search-active');
      $(context).toggleClass('glyphicon-search').toggleClass('glyphicon-remove');
      weatherApp.controller.hideError();
  },
  displayPredictions: function(predictions){
    var predictionList = $('.predictions'),
        cities = predictions.map(function(prediction){
             return {
                'city': prediction.terms[0].value,
                'country': prediction.terms[1].value
                };
              });
    predictionList.html('');
    cities.forEach(function(city){
     $('<li/>',{
       'class': 'prediction',
       'text': city.city + ', ' + city.country,
       'data-city': city.city
      }).appendTo(predictionList);
    });
  },
  repaint: function(){
    var weather = weatherApp.controller.getWeather(),
        dayTime;
    // check if night or day
    dayTime = (weather.daylight === 'D') ? 'day' : 'night';
    $('#city').html(weather.state);
    $('#desc').html(weather.skyDescription);
    $('.loader').addClass('hidden');
    $('#city, #desc, #temp').removeClass('hidden');
    $('#weather-app').removeClass('day night loaded').addClass(weather.skyDescription.toLowerCase() + ' ' + dayTime);

    // animate deg apeareance
    weatherApp.view.displayTemp(0, Math.round(weather.temperature));
  },
  init: function(){
    // repainting screen
    weatherApp.view.repaint();
    
    // action binding on first run only
    if(weatherApp.controller.isFirstRun()){
      //switch between ºf anc ºc   
      $('.units').click(function(){
        weatherApp.controller.switchUnits();
      });

      // display and hide search box
      $('.search').on('click', function(){
        weatherApp.view.toggleSearch(this);
      });

      // display predictions on search input change
      // added set timeout to make ajax calls only when typing stops 
      var typingTimer,
          input;
      $('.submit').on('click', function(){
        var input =  $('.input-city').val();
        if(input === ''){
          var message = "Please Fill in A City or Country Name";
          weatherApp.controller.disaplyError(message);
        }else{
          var options = {city: input}
          $('.loader').removeClass('hidden');
          $('#city, #desc, #temp').addClass('hidden');
          $('#weather-app').removeClass(weatherApp.controller.getWeather().skyDescription.toLowerCase());
          weatherApp.model.getWeather(options);
          weatherApp.view.toggleSearch($('.search'));
          weatherApp.controller.hideError();
        }
      });
      // $('.input-city').on('input', function(){
      //   clearTimeout(typingTimer);
      //   input = this.value;
      //   typingTimer = setTimeout(function(){
      //     weatherApp.controller.autocompleteCity(input);
      //   },400)
      // });
      //display temp of city
      // $('.predictions').on('click', '.prediction', function(){
      //   var options = {city: $(this).attr('data-city')}
      //   $('.loader').removeClass('invisible');
      //   $('#city, #desc, #temp').addClass('invisible');
      //   $('#weather-app').removeClass(weatherApp.controller.getWeather().weather.skyDescription);
      //   weatherApp.model.getWeather(options);
      //   weatherApp.view.toggleSearch($('.search'));
      // })
      //flag first run
      weatherApp.controller.isFirstRun(true);
    }
  }
};

/*
 *  CONTROLLER
 *
 */    
weatherApp.controller = {
  disaplyError: function(message){
    weatherApp.view.disaplyError(message);
  },
  hideError: function(){
    weatherApp.view.hideError();
  },
  getWeather: function(){
    return weatherApp.model.weather;
  },
  switchUnits: function(){
    var oldUnits = this.getUnits(),
        temp = weatherApp.model.weather.temperature,
        newUnits;

    if(oldUnits === 'c'){
       newUnits = 'f';
       temp = temp * 1.8 + 32;
    }else{
       newUnits = 'c';
       temp = (temp - 32) / 1.8;
    }

    weatherApp.view.setUnits(newUnits, oldUnits);
    weatherApp.model.setUnits(newUnits);
    weatherApp.model.weather.temperature = temp;
    weatherApp.view.displayTemp(0, Math.round(temp));
  }, 
  autocompleteCity: function(input){
    var url = 'https://crossorigin.me/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input +'&types=(cities)&key=AIzaSyD4gBqAS_TpPLrcSW_7u0-66h2aiLdgP44',
        loader = $('.loader');
    loader.removeClass('hidden');
    $.getJSON(url, function(data){
      weatherApp.view.displayPredictions(data.predictions);
      loader.addClass('hidden');
     });
  },
  getUnits: function(){
    return weatherApp.model.units;
  },
  isFirstRun: function(options){
    if(options){
       weatherApp.model.isFirstRun = false;
    }else{
      return weatherApp.model.isFirstRun;
    }
  },
  initModel: function(env){
    weatherApp.model.init(env);
  },
  initView: function(){
    weatherApp.view.init();
  }
};

// init App
weatherApp.controller.initModel('prod');