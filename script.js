$(document).ready(function() {

  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({ // 'q' is used in the OpenWearther Database as the name of the cities. 
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + 
      "&appid=f21c9b4a2a78cb448e7fc00025966c89",
      dataType: "json", 
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();
        $("#forecast").empty();

        // dt is the time of data calculation
        var second = data.dt;
				var forecastDate = new Date(second * 1000);
				// a new date instance 
				var datestr = forecastDate.toLocaleDateString();
        // create html content for current weather
        var forecastToday = $("<div>", { id: "today-container", 
        style: "max-width: 100vw",
        style: "line-height: 30px;"
        });
				var cityName = $("<h2>", { id: "name-div" });
				cityName.text(data.name + " (" + datestr + ") ");

        var cloudImg = $("<div>", { id: "img-div" });
        
        var iconImg = $("<img>");
				iconImg.attr(
          "src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
          );
				cloudImg.append(iconImg);

        var tempToday = $("<div>", { id: "temp-div" });
        // Default temp is in Kelvin which is just Celsius +273 degrees, 
        // then celsius is * 9/5 + 32 to get Farhrenheit
        tempF = (data.main.temp - 273.15) * 9/5 + 32;
				tempToday.text("Temperature: " + tempF.toFixed(2) + " °F");

				var humToday = $("<div>", { id: "humid-div" });
				humToday.text("Humidity: " + data.main.humidity + "%");

				var windSpeedToday = $("<div>", { id: "speed-div" });
				windSpeedToday.text("Wind Speed: " + data.wind.speed + " MPH");

				var UVindexToday = $("<div>", { id: "index-div" });

				forecastToday.append(
					cityName,
					cloudImg,
					tempToday,
					humToday,
					windSpeedToday,
					UVindexToday,
				);
        // merge and add to page
        $("#today").append(forecastToday);
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + 
      "&appid=f21c9b4a2a78cb448e7fc00025966c89",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").empty();

        var forecastTitle = $("<div>", {
					id: "forecast-title",
				});
				forecastTitle.text("5-Day Forecast:");

				// Forecast card container
				var forecastContent = $("<div>", {
					class: "card-container",
					id: "forecast-content",
				});
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var forecastCard = $("<div>", {
							class: "card text-white bg-primary mb-3",
              id: "forecast-card",
              style: "max-width: 5vw",
              style: "display: inline-flex"
						}); // squeezed some quick styling in here^
						// dt is the time of data calculation
						var forecastTime = data.list[i].dt;
						var d = new Date(forecastTime * 1000);
						var foreDatestr = d.toLocaleDateString();
						// Get current day
            var foreDaystr = d.getUTCDay();
            // Array of the days of the week
						var weekDays = new Array(7);
						weekDays[0] = "Sunday";
						weekDays[1] = "Monday";
						weekDays[2] = "Tuesday";
						weekDays[3] = "Wednesday";
						weekDays[4] = "Thursday";
						weekDays[5] = "Friday";
						weekDays[6] = "Saturday";
						var weekDaysStr = weekDays[foreDaystr];

						// Date
						var foreDay = $("<h4>", {
							class: "card-title",
							id: "forecast-day",
						});
						foreDay.text(weekDaysStr);

						var foreDate = $("<h5>", {
							class: "card-title",
							id: "forecast-date",
						});
						foreDate.text(foreDatestr);

						// IMG Icon
						var foreImg = $("<p>", {
							class: "card-body",
							id: "forecast-img",
						});
						// Render Icon
						var foreImgIcon = $("<img>");
						foreImgIcon.attr(
							"src",
							"https://openweathermap.org/img/w/" +
								data.list[i].weather[0].icon +
								".png",
              )
              .width('64px');
						foreImg.append(foreImgIcon);

						// Temp
						var foreTemp = $("<p>", {
							class: "card-body",
							id: "forecast-temp",
						});
						foreTempF = (data.list[i].main.temp - 273.15) * 9/5 + 32;
				    foreTemp.text("Temperature: " + foreTempF.toFixed(2) + " °F");

						//Humidity
						var foreHum = $("<p>", {
							class: "card-body",
							id: "forecast-hum",
						});
						foreHum.text("Humidity: " + data.list[i].main.humidity + "%");

						// append the new html elements to its own card
						forecastCard.append(
							foreDay,
							foreDate,
							foreImgIcon,
							foreTemp,
							foreHum,
						);

            // merge together and put on page

            $("#forecast .card-container").append(forecastCard);

						// render cards in container
						forecastContent.append(forecastCard);
          }
        }
        $("#forecast").append(forecastTitle, forecastContent);
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + 
      "&appid=f21c9b4a2a78cb448e7fc00025966c89",
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        var uv = data[0].value;
				// uv text ro replace placeholder
				var uvText = $("<p>").text("UV Index: ");
				// Make UV btn
				var btn = $("<span>").addClass("btn btn-sm").text(data[0].value);
				console.log("UV:", uv);
				// change color depending on uv value
				if (uv > 0 && uv <= 2.99) {
					btn.addClass("low-uv");
					btn.css("color", "white");
					btn.css("background-color", "lightblue");
				} else if (uv >= 3 && uv <= 5.99) {
					btn.addClass("moderate-uv");
					btn.css("color", "white");
					btn.css("background-color", "green");
				} else if (uv >= 6 && uv <= 7.99) {
					btn.addClass("high-uv");
					btn.css("color", "white");
					btn.css("background-color", "orange");
				} else if (uv >= 8 && uv <= 10.99) {
					btn.addClass("vhigh-uv");
					btn.css("color", "white");
					btn.css("background-color", "darkred");
				} else {
					btn.addClass("extreme-uv");
					btn.css("color", "white");
					btn.css("background-color", "red");
        }
        // append to only the today forecast 
        $("#today #index-div").append(uvText.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});