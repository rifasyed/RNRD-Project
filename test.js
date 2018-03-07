// https://www.googleapis.com/youtube/v3/channels?part=contentDetails

// var url = "https://www.googleapis.com/youtube/v3/channels?part=" + query + "&maxResults=" +

$(document).ready(function () {

    $("#submitBTN").on('click', function() {
        console.log("hi")
        youtubeApiCall()
    })

    function youtubeApiCall() {
        $.ajax({
            cache: false,
            data: $.extend({
            key: 'AIzaSyBELBleJ5s5uOzjgVXJx1nlfI_d6ZsK5Aw',
            q: $("input").val(),
            part: 'snippet'
        }, {maxResults: 4 }),
            dataType: 'json',
            type: 'GET',
            timeout: 5000,
            url: 'https://www.googleapis.com/youtube/v3/search'
        })
        .done(function (data) {
            console.log(data)
            console.log(data.items[0].snippet.title)
            $(".results").append(data.items[0].snippet.title)
        });
    }
})

// function init() {
//     gapi.client.setApiKey("AIzaSyBELBleJ5s5uOzjgVXJx1nlfI_d6ZsK5Aw")
//     gapi.client.load("youtube", "v3", function() {
//     })

