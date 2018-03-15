$(document).ready(function () {
    
    // click listener for submit button
    $("#submit-button").on('click', function () {
        if ($("input").val()) {
            event.preventDefault()
            window.open("search.html", "_self")
        }
    })
    
    $("#submitBTN").on('click', function () {
        event.preventDefault()
        if ($("input").val()) {
            var query = $("input").val().trim()
            fetchTracks(query)
            fetchEvents(query)
        }
    })
    
    function defaultSearch() {
        var artistArray = ["logic", "pink floyd", "the national", "royal blood", "pepper", "tame impala", "thrice"]
        var randomArtist = artistArray[Math.floor((Math.random() * artistArray.length))]
        fetchTracks(randomArtist)
        fetchEvents(randomArtist)
        $("#search-input").attr("placeholder", randomArtist)
    }
    
    // call MusicXMatch API using track.search method to retrieve song titles to use as YouTube search queries
    function fetchTracks(query) {
        $.ajax({
            type: "GET",
            url: "https://api.musixmatch.com/ws/1.1/track.search",
            data: {
                apikey: "af8763b8168a8ce43b3f473c4832754e",
                q_artist: query,
                page_size: 4,
                format: "jsonp"
            },
            dataType: "jsonp",
            success: function (response) {
                // pull first 4 track names, artist name, and song ID (to search for lyrics using fetchLyrics)
                $('.results').empty()
                for (index in response.message.body.track_list) {
                    var artist = response.message.body.track_list[index].track.artist_name
                    var song = response.message.body.track_list[index].track.track_name
                    var songID = response.message.body.track_list[index].track.track_id
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
                videoSyndicated: true,
                videoEmbeddable: true,
                videoLicense: 'youtube',
                part: 'snippet'
            }, {
                maxResults: 1
            }),
            dataType: 'json',
            type: 'GET',
            timeout: 5000,
            url: 'https://www.googleapis.com/youtube/v3/search',
            success: function (response) {
                // pull video data and construct iframe player
                
                // create new div to act as trak container for video and lyrics
                var trackContainer = $("<tr>").addClass("track-container row").attr("id", "track-" + index)
                var vidContainer = $("<div>").addClass("vid-container col-md-6")
                
                // add title to video container, append to video container
                var vidTitle = response.items[0].snippet.title
                var newTitle = $("<h5>").addClass("vid-title")
                newTitle.text(vidTitle)
                vidContainer.append(newTitle)
                
                // create iframe for video search result, append to video container
                var newVid = $("<iframe>").attr("frameborder", "0") // .attr("height", 336).attr("width", 600)
                var vidID = response.items[0].id.videoId
                newVid.attr("src", "https://www.youtube.com/embed/" + vidID)
                vidContainer.append(newVid)
                
                // append video container to track container
                trackContainer.append(vidContainer)
                
                // append container to results div
                $(".results").append(trackContainer)
                
                // pass song id and position into fetchLyrics function
                fetchLyrics(songID, index)
            }
        })
    }
    
    // call MusixMatch API using track.lyrics.get method to retrieve lyrics for song title returned by YouTube search
    function fetchLyrics(songID, index) {
        $.ajax({
            type: "GET",
            url: "https://api.musixmatch.com/ws/1.1/track.lyrics.get",
            data: {
                apikey: "af8763b8168a8ce43b3f473c4832754e",
                track_id: songID,
                format: "jsonp"
            },
            dataType: "jsonp",
            success: function (response) {
                // create new div to act as lyrics container
                var lyricsContainer = $("<div>")
                lyricsContainer.addClass("lyrics-container col-md-6")
                lyricsContainer.attr("id", "lyrics-" + index)
                // pull lyrics, copyright, and link data (EDIT THIS SECTION TO INTEGRATE)
                
                var lyricsSample = $("<h5>").text("Lyrics Sample")
                lyricsContainer.append(lyricsSample)
                
                var lyrics = response.message.body.lyrics.lyrics_body
                var lyricsSnippet = $('<p class="flow-text">').text(lyrics.slice(0, 200) + "...")
                lyricsContainer.append(lyricsSnippet)
                
                var lyricsURL = $("<a>").attr("href", response.message.body.lyrics.backlink_url)
                lyricsURL.text("full lyrics")
                lyricsContainer.append(lyricsURL)
                
                var copyright = $("<p>").text(response.message.body.lyrics.lyrics_copyright)
                copyright.addClass("copyright")
                lyricsContainer.append(copyright)
                
                $("#lyrics-" + index).append(lyricsSnippet)
                $("#lyrics-" + index).append(lyricsURL)
                $("#lyrics-" + index).append(copyright)
                
                // append container to appropriate track container
                $("#track-" + index).append(lyricsContainer)
            }
        })
    }
    
    function fetchEvents(query) {
        $.ajax({
            type: "GET",
            url: "https://app.ticketmaster.com/discovery/v2/events.json?",
            data: {
                apikey: "o6J3jBABhcb5ppZPQggVw453G8JGuwPg",
                // countryCode: "US"
                async: true,
                keyword: query,
                format: "json"
            },
            dataType: "json",
            success: function (response) {
                $(".event").remove()
                if (response.page.totalPages == 0) {
                    var errorMessage = $("<p>No Upcoming Events :(</p>").addClass("event")
                    $("#event-table").append(errorMessage)
                    return
                }
                $(".event").remove()
                for (var i = 0; i < 4; i++) {
                    // grab and store all relevant concert data from json object
                    var date = response._embedded.events[i].dates.start.localDate
                    var venue = response._embedded.events[i]._embedded.venues[0].name
                    var city = response._embedded.events[i]._embedded.venues[0].city.name
                    var state
                    if (response._embedded.events[i]._embedded.venues[0].hasOwnProperty("state")) {
                        state = response._embedded.events[i]._embedded.venues[0].state.name
                    }
                    var country = response._embedded.events[i]._embedded.venues[0].country.countryCode
                    
                    
                    // create link to venue/ticket purchase
                    var url = $("<a>").text(venue).attr("href", response._embedded.events[i].url)
                    
                    var newDate = $("<td>").text(date)
                    
                    var text
                    if (state) {
                        text = city + ", " + state + ", " + country
                    } else {
                        text = city + ", " + country
                    }
                    
                    var newLoc = $("<td>").text(text)
                    
                    var link = $("<td>").append(url)
                    
                    var newLine = $("<tr>").addClass("event")
                    
                    newLine.append(newDate)
                    newLine.append(newLoc)
                    newLine.append(link)
                    
                    $("#event-table").append(newLine)
                }
            }
        })
    }
    
    defaultSearch()

    $("#nav-text-concerts").on("click", function () {
        $(document).scrollTop($("#ticketmaster-container").offset().top-80, 1000);
    })

    $("#nav-text-videos").on("click", function () {
        $(document).scrollTop($("#cardYt").offset().top-80, 1000)
    })
})