var rec = require("./recomend.js");
var fs = require('fs');

function loadMovieLens(){
    var movies={};

    var movie = fs.readFileSync("movies.csv").toString().split('\n')
    movie.shift();
    var p;
    for(var line in movie){
        p = movie[line].trim().split(',');
        var id = p[0],
            title = p[1];

        movies[id] = title;

    }
    
    var prefs = {
        setDefault:function(props){
            if(!this[props]){
                this[props] ={};
            }

            
        }
    }
    var Udata = fs.readFileSync("ratings.csv").toString().split("\n");

    Udata.shift();

    for(var line in Udata){
        var data = Udata[line].trim().split(',');
        var user = data[0],
            movieid = data[1],
            rating = data[2],
            timestamp = data[3];
        prefs.setDefault(user,{});
        prefs[user][movies[movieid]] =parseFloat(rating);
    }
    return prefs;
}

var data = loadMovieLens();

var itemsim = rec.calcSimilarItem(data,30,rec.pearson);
var f = rec.recommendItem(data,itemsim,'90');

for(var i =0;i<20;i++){
    console.log(f[i]);
}