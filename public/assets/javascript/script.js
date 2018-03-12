$(document).ready(function () {
    // click listener for submit button
    $("#submitBTN").on('click', function () {
        if ($("input").val()) {
            event.preventDefault()
            fetchTracks()
            fetchEvents()
        }
    })

    // call MusicXMatch API using track.search method to retrieve song titles to use as YouTube search queries
    function fetchTracks() {
        $.ajax({
            type: "GET",
            url: "http://api.musixmatch.com/ws/1.1/track.search",
            data: {
                apikey: "af8763b8168a8ce43b3f473c4832754e",
                q_artist: $("input").val(),
                page_size: 4,
                format: "jsonp"
            },
            dataType: "jsonp",
            success: function (response) {
                // pull first 4 track names, artist name, and song ID (to search for lyrics using fetchLyrics)
                console.log(response)
                $('.results').empty()
                for (index in response.message.body.track_list) {
                    var artist = response.message.body.track_list[index].track.artist_name
                    var song = response.message.body.track_list[index].track.track_name
                    var songID = response.message.body.track_list[index].track.track_id
                    console.log("artist: " + artist, "song: " + song)
                    youtubeApiCall(artist, song, songID, index)
                }
            }
        })
    }

    // call YouTube
    function youtubeApiCall(artist, song, songID, index) {
        $.ajax({
            cache: false,
            data: $.extend({
                key: 'AIzaSyBELBleJ5s5uOzjgVXJx1nlfI_d6ZsK5Aw',
                q: artist + '' + song,
                type: 'video',
                part: 'snippet'
            }, { maxResults: 1 }),
            dataType: 'json',
            type: 'GET',
            timeout: 5000,
            url: 'https://www.googleapis.com/youtube/v3/search',
            success: function (response) {
                // pull video data and construct iframe player (EDIT THIS SECTION TO INTEGRATE)

                // create new div to act as video container
                var vidContainer = $("<div>")
                vidContainer.addClass("vid-container col-lg-4")
                vidContainer.attr("id", "vid-" + index)
                
                // create iframe for video search result, append to video container
                var newVid = $("<iframe>")
                newVid.attr("frameborder", "0")
                var vidID = response.items[0].id.videoId
                newVid.attr("src", "http://www.youtube.com/embed/" + vidID)
                vidContainer.append(newVid)
                
                // add title to video container, append to video container
                var vidTitle = response.items[0].snippet.title
                var newTitle = $("<p>")
                newTitle.text(vidTitle)
                vidContainer.append(newTitle)
                
                // append container to results div
                $(".results").append(vidContainer)
                
                // pass song id and position into fetchLyrics function
                fetchLyrics(songID, index)
            }
        })
    }


    // call MusicXMatch API using track.lyrics.get method to retrieve lyrics for song title returned by YouTube search
    function fetchLyrics(songID, index) {
        $.ajax({
            type: "GET",
            url: "http://api.musixmatch.com/ws/1.1/track.lyrics.get",
            data: {
                apikey: "af8763b8168a8ce43b3f473c4832754e",
                track_id: songID,
                format: "jsonp"
            },
            dataType: "jsonp",
            success: function (response) {
                // pull lyrics, copyright, and link data (EDIT THIS SECTION TO INTEGRATE)
                var copyright = $("<p>").text(response.message.body.lyrics.lyrics_copyright)
                copyright.addClass("copyright")
                var lyricsURL = $("<a>").attr("href", response.message.body.lyrics.backlink_url)
                lyricsURL.text("full lyrics")
                var lyrics = response.message.body.lyrics.lyrics_body
                var lyricsSnippet = $("<p>").text(lyrics.slice(0, 200) + "...")

                $("#vid-" + index).append($("<h5>").text("Lyrics Sample"))
                $("#vid-" + index).append(lyricsSnippet)
                $("#vid-" + index).append(lyricsURL)
                $("#vid-" + index).append(copyright)
            }
        })
    }
    function fetchEvents() {
        $.ajax({
            type: "GET",
            url: "https://app.ticketmaster.com/discovery/v2/events.json?",
            data: {
                apikey: "o6J3jBABhcb5ppZPQggVw453G8JGuwPg",
                // countryCode: "US"
                async: true,
                keyword: $("input").val().trim(),
                format: "json"
            },
            dataType: "json",
            success: function (response) {
                console.log(response.page.totalPages)
                $(".event").remove()
                if (response.page.totalPages == 0) {
                    console.log("hi")
                    var errorMessage = $("<p>No Upcoming Events :(</p>").addClass("event")
                    console.log(errorMessage)
                    $(".container").append(errorMessage)
                    return
                }
                $(".event").remove()
                for (var i = 0; i < 5; i++) {
                    console.log(response)
                    var date = response._embedded.events[i].dates.start.localDate
                    var venue = response._embedded.events[i]._embedded.venues[0].name
                    var city = response._embedded.events[i]._embedded.venues[0].city.name
                    var state
                    if (response._embedded.events[i]._embedded.venues[0].hasOwnProperty("state")) {
                        state = response._embedded.events[i]._embedded.venues[0].state.name
                    }
                    var country = response._embedded.events[i]._embedded.venues[0].country.countryCode

                    var url = $("<a>").text("Venue").attr("href", response._embedded.events[i].url)

                    var newDate = $("<p>").text(date).addClass("col-md-4")

                    var text
                    if (state) {
                        text = city + ", " + state + ", " + country
                    } else {
                        text = city + ", " + country
                    }
                    var newLoc = $("<p>").text(text).addClass("col-md-4")

                    var link = url.addClass("col-md-4")

                    var newLine = $("<div>").addClass("row event")
                    newLine.append(newDate)
                    newLine.append(newLoc)
                    newLine.append(link)

                    $(".ticketmaster-container").append(newLine)
                }
            }
        })
    }



})