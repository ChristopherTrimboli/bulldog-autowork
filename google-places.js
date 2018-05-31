(function($) {

    $.googlePlaces = function(element, options) {

        let defaults = {
            placeId: "ChIJ6TAqRQUNj1QRmq8PdYMGVB0" // placeId provided by google api documentation
            , render: ["reviews"]
            , min_rating: 5
            , max_rows: 0
            , rotateTime: false
        };

        let plugin = this;

        plugin.settings = {};

        let $element = $(element);

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            $element.html("<div id='map-plug'></div>"); // create a plug for google to load data into
            initializePlace(function(place){
                plugin.place_data = place;
                // render specified sections
                if(plugin.settings.render.indexOf("reviews") > -1){
                    renderReviews(plugin.place_data.reviews);
                    if(plugin.settings.rotateTime) {
                        initRotation();
                    }
                }
            });
        };

        const initializePlace = function(c){
            let map = new google.maps.Map(document.getElementById("map-plug"));

            let request = {
                placeId: plugin.settings.placeId
            };

            let service = new google.maps.places.PlacesService(map);

            service.getDetails(request, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    c(place);
                }
            });
        };

        const sortByDate = function(ray) {
            ray.sort(function(a, b){
                let keyA = new Date(a.time);
                    keyB = new Date(b.time);
                // Compare the 2 dates
                if(keyA < keyB){
                    return -1;
                }
                if(keyA > keyB){
                    return 1;
                }
                return 0;
            });
            return ray;
        };

        const filterMinRating = function(reviews){
            for(let i = reviews.length -1; i >= 0; i--) {
                if(reviews[i].rating < plugin.settings.min_rating){
                    reviews.splice(i,1);
                }
            }
            return reviews;
        };

        const renderReviews = function(reviews){
            reviews = sortByDate(reviews);
            reviews = filterMinRating(reviews);
            let html = "";
            let row_count = (plugin.settings.max_rows > 0)? plugin.settings.max_rows - 1 : reviews.length - 1;
            // make sure the row_count is not greater than available records
            row_count = (row_count > reviews.length-1)? reviews.length -1 : row_count;
            for (let i = row_count; i >= 0; i--) {
                let stars = renderStars(reviews[i].rating);
                let date = convertTime(reviews[i].time);
                html = html+"<div class='review-item'><div class='review-meta'><span class='review-author'>" +
                    ""+reviews[i].author_name+"</span><span class='review-date'>"+date+"</span></div>"+stars+"" +
                    "<p class='review-text'>"+'"'+""+reviews[i].text+""+'"'+"</p></div>"
            }
            $element.append(html);
        };

        const initRotation = function() {
            let $reviewEls = $element.children(".review-item");
            let currentIdx = $reviewEls.length > 0 ? 0 : false;
            $reviewEls.hide();
            if(currentIdx !== false) {
                $($reviewEls[currentIdx]).show();
                setInterval(function(){
                    if(++currentIdx >= $reviewEls.length) {
                        currentIdx = 0;
                    }
                    $reviewEls.hide();
                    $($reviewEls[currentIdx]).fadeIn("slow");
                }, plugin.settings.rotateTime);
            }
        };

        const renderStars = function(rating){
            let stars = "<div class='review-stars'><ul>";

            // fill in gold stars
            for (let i = 0; i < rating; i++) {
                stars += "<li><i class='star'></i></li>";
            }

            // fill in empty stars
            if(rating < 5){
                for (let i = 0; i < (5 - rating); i++) {
                    stars += "<li><i class='star inactive'></i></li>";
                }
            }
            stars += "</ul></div>";
            return stars;
        };

        const convertTime = function(UNIX_timestamp){
            let a = new Date(UNIX_timestamp * 1000);
            let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            let time = months[a.getMonth()] + " " + a.getDate() + ", " + a.getFullYear();
            return time;
        };

        plugin.init();

    };

    $.fn.googlePlaces = function(options) {

        return this.each(function() {
            if (undefined === $(this).data("googlePlaces")) {
                let plugin = new $.googlePlaces(this, options);
                $(this).data("googlePlaces", plugin);
            }
        });

    }

})(jQuery);