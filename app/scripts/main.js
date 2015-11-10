'use strict';
angular.module('app', ['ngRoute', 'infinite-scroll'])

.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'start.html',
        controller: 'StartCtrl'
    })
    .when('/media/:jsonLink', {
        templateUrl: 'media.html',
        controller: 'MediaCtrl',
    })
    .when('/media/', {
        templateUrl: 'demo.html',

    });

  // $locationProvider.html5Mode(true);
})

/*
Factories & Services
************/
.factory('webtest', function($q, $timeout, $http) {
    var Webtest = {
        fetch: function(jsonLink) {

            var deferred = $q.defer();
            // console.log('callback: ',callback);
            $timeout(function() {
                $http.get(jsonLink).success(function(data) {
                    deferred.resolve(data);
                });
            }, 30);
            return deferred.promise;
        }
    };

    return Webtest;
})

/*
CONTROLLERS
************/
.controller('MainCtrl', ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
    $scope.search = function() {
        var imdbid = $scope.searched_imdbid;
        if (imdbid == undefined) {
            alert("Please input a movie imdb id!");
            return;
        }
        var trimed_input = imdbid.trim();
        
        $location.path('/media/' + trimed_input)
    }
}])

.controller('StartCtrl', ['$scope', '$routeParams', '$location', 'webtest', function ($scope, $routeParams, $location, webtest) {
    webtest.fetch('data/startpage.json').then(function(data) {
        $scope.allMovieId = data.AllMovieId;
        $scope.showMovieId = data.AllMovieId.slice(0, 64);
        // console.log($scope.showMovieId);
        $scope.loadMore = function() {
            var lastIndex = $scope.showMovieId.length - 1;
            for(var i = 1; i <= 64; i++) {
                $scope.showMovieId.push($scope.allMovieId[lastIndex + i]);
            }
        };
    });

}])

.controller('MediaCtrl', ['$scope', '$http', 'webtest', '$routeParams', '$location', function ($scope, $http, webtest, $routeParams, $location) {
	document.body.scrollTop = document.documentElement.scrollTop = 0;
    $scope.search = function() {
        var imdbid = $scope.searched_imdbid.trim();
        if (imdbid == undefined) {
            alert("Please input a movie imdb id!");
            return;
        }
        $location.path('/media/' + imdbid)
    }

    // console.log('$routeParams: ',$routeParams.jsonLink);
	$scope.mainHeight = 30;

    var previousColor;
    $scope.updateBox = function(item, event){

        $scope.frameInfo = item;
        $scope.frameImage = item.Imgurl;
        $scope.movieImdbid = $routeParams.jsonLink;

        if ($scope.frameImage == "") {
            return;
        }


        var target = event.target;
        // console.log(target.id);
        if (target.id == "speed_div") {
            $("#speed_h").css("color", "red");
            $("#color_h").css("color", "red");
            $("#dominatingcolor_h").css("color", "black");
            $("#brightness_h").css("color", "black");
            $("#conversation_h").css("color", "black");
        } else if (target.id == "conversation_div") {
            $("#speed_h").css("color", "black");
            $("#color_h").css("color", "black");
            $("#dominatingcolor_h").css("color", "black");
            $("#brightness_h").css("color", "black");
            $("#conversation_h").css("color", "red");
        } else if (target.id == "brightness_div") {
            $("#speed_h").css("color", "black");
            $("#color_h").css("color", "black");
            $("#dominatingcolor_h").css("color", "black");
            $("#brightness_h").css("color", "red");
            $("#conversation_h").css("color", "black");
        } else if (target.id == "dominatingcolor_div") {
            $("#speed_h").css("color", "black");
            $("#color_h").css("color", "black");
            $("#dominatingcolor_h").css("color", "red");
            $("#brightness_h").css("color", "black");
            $("#conversation_h").css("color", "black");
        } 

        previousColor = target.style.backgroundColor;
        target.style.backgroundColor = "white";

    };
    $scope.leaveBox = function(event) {
        event.target.style.backgroundColor = previousColor;
    };
    $scope.leaveFrame = function() {
        $("#speed_h").css("color", "black");
        $("#color_h").css("color", "black");
        $("#dominatingcolor_h").css("color", "black");
        $("#brightness_h").css("color", "black");
        $("#conversation_h").css("color", "black");
    };


	webtest.fetch('data/profile_json/'+ $routeParams.jsonLink +'.json').then(function(data) {
        $scope.mediaData = data;
        // console.log('$scope.mediaData: ', $scope.mediaData.Imdbid);


        $scope.tags = data.BisicInfo.Genre.split(",");
        $scope.startNodes(data.KeywordsBubble);
        
        if (data.RGB == undefined) {
            return;
        }

        var RGBData = [
        {"value":data.RGB.R}, 
        {"value":data.RGB.G}, 
        {"value":data.RGB.B},
        {"value":data.RGB.Rest}
        ];
        var BrightnessData = [
        {"value":data.Brightness.Bright}, 
        {"value":data.Brightness.Dark}, 
        {"value":data.Brightness.Medium}
        ];
        var conversatioinData = [
        {"value": data.Conversation * 100},
        {"value": 100 - data.Conversation * 100}
        ];
        
        // console.log('RGBData: ',RGBData);
        // console.log(conversatioinData)
        
        $scope.startPies(RGBData, ["#FF3056", "#4AD663", "#59C7FC", 'transparent']);
        $scope.startPies(BrightnessData, ["#eeeeee", "#222222", "#666666"]);
        if (conversatioinData[0].value == 0) {
            return;
        }
        $scope.startPies(conversatioinData, ["green", "transparent"]);
    });

    $scope.startNodes = function(jsonObj){
        var width = 1400,
        height = 900;

        var color = d3.scale.category20();

        var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

        var svg = d3.select(".media-section_nodes").append("svg")
        .attr("width", width)
        .attr("height", height)

        force
        .nodes(jsonObj.nodes)
        .links(jsonObj.links)
        .start();

        var link = svg.selectAll(".link")
        .data(jsonObj.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
        .data(jsonObj.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

        // node.on("click", function(d){
        //     // console.log('d: ',d);
        //     // console.log(d.VionelId);
        //     if (d.group != 0) {
        //         window.open("http://vionel.com/movie/" + d.VionelId);
        //     }
        //     // $( "#nodeInfo" ).css('display', 'inline-block');
        //     // $( "#index" ).html( "<span>Index:</span> " + d.index );
        //     // $( "#wiki" ).html( "<span>WikiId:</span> " + d.wikiid );
        //     // $( "#title" ).html( "<span>Title:</span> " + d.title );

        // }) 

        var poster = d3.select("body").append("div").attr("class", "node-poster")
        node.on("mouseover", function(d) {
            var imdbid = d.imdbid
            if (imdbid == "") {
                return;
            }
            var group = d.group
            if (group != 0) {
                poster.html("<img src='posters/" + imdbid + ".jpg' onerror='profile_json/no-poster.png'>")
                  .style("display", "block")
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px"); 
            } else if (group == 0) {
                // poster.html("<div>" + d.title + "</div>")
                // .style("background-color", "black")
                // .style("color", "white");
                $( "#nodeInfo" ).css('display', 'inline-block');
                $( "#nodeInfo" ).css("left", (d3.event.pageX) + "px");
                $( "#nodeInfo" ).css("top", (d3.event.pageY) + "px");
                $( "#title" ).html(d.title);
            }
        });
        node.on("mouseout", function(d) {
            poster.style("display", "none");
            $( "#nodeInfo" ).css('display', 'none');
        });



        // node.append("title")
        // .text(function(d) { return d.title; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        });
    }

    

    $scope.startPies = function (data, colorList) {
        var w = 80;                        //width
        var h = 80;                            //height
        var r = 40;                            //radius
        // color = d3.scale.category20c();     //builtin range of colors
        var color = d3.scale.ordinal()
        .range(colorList);

        var vis = d3.select(".pies")
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([data])                   //associate our data with the document
        .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
        .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
        .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius

        var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);

        var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

        var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
        .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
        .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
        .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
        .attr("transform", function(d) {                    //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.innerRadius = 0;
            d.outerRadius = r;
            return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle")                          //center the text on it's origin
        .text(function(d, i) { return data[i].label; });        //get the label from our original data array

    }

}])

;