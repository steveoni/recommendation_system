/**
 * @author steveoni
 * @refrence colaborative learning by:Toby segarun
 */


//get the length of an object
var len  = function(obj){
    var len=0;
    for(var i in obj){
        len++
    }
    return len;
}

//calculate the euclidean distance btw two item
var euclidean_score  = function(dataset,p1,p2){
    
    var existp1p2 = {};//store item existing in both item

    //if dataset is in p1 and p2 
    //store it in as one
    for(var key in dataset[p1]){
        if(key in dataset[p2]){
            existp1p2[key] = 1
        }


        if(len(existp1p2) ==0) return 0;//check if it has a data

        var sum_of_euclidean_dist = [];//store the  euclidean distance
        
        //calculate the euclidean distance
        for(item in dataset[p1]){
            if(item in dataset[p2]){
                sum_of_euclidean_dist.push(Math.pow(dataset[p1][item]-dataset[p2][item],2));
            }

        }
        var sum=0;
        for(var i=0;i<sum_of_euclidean_dist.length;i++){
            sum +=sum_of_euclidean_dist[i]; //calculate the sum of the euclidean
        }

        //since the sum will be large 
        //we make it exist btwn 0 and 1
        var sum_sqrt = 1/(1 +Math.sqrt(sum));

        return sum_sqrt;
    }
    
}

//to get the distance perfectly

var pearson_correlation = function(dataset,p1,p2){

        var existp1p2 = {};

        for(item in dataset[p1]){
            if(item in dataset[p2]){
                existp1p2[item] = 1
            }
        }
        var num_existence = len(existp1p2);

        if(num_existence ==0) return 0;

        //store the sum and the square sum of both p1 and p2
        //store the product of both
        var p1_sum=0,
            p2_sum=0,
            p1_sq_sum=0,
            p2_sq_sum=0,
            prod_p1p2 = 0;
        //calculate the sum and square sum of each data point
        //and also the product of both point
        for(var item in existp1p2){
            p1_sum += dataset[p1][item];
            p2_sum += dataset[p2][item];

            p1_sq_sum += Math.pow(dataset[p1][item],2);
            p2_sq_sum += Math.pow(dataset[p2][item],2);

            prod_p1p2 += dataset[p1][item]*dataset[p2][item];
        }
        var numerator =prod_p1p2 - (p1_sum*p2_sum/num_existence);

        var st1 = p1_sq_sum - Math.pow(p1_sum,2)/num_existence;
        var st2 = p2_sq_sum -Math.pow(p2_sum,2)/num_existence;

        var denominator = Math.sqrt(st1*st2);

        if(denominator ==0) return 0;
        else {
            var val = numerator / denominator;
            return val;
        }
        
}

var similar_user = function(dataset,person,num_user,distance){

    var scores=[];

    for(var others in dataset){
        if(others != person && typeof(dataset[others])!="function"){
            var val = distance(dataset,person,others)
            var p = others
            scores.push({val:val,p:p});
        }
    }
    scores.sort(function(a,b){
        return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
    });
    var score=[];
    for(var i =0;i<num_user;i++){
        score.push(scores[i]);
    }

    return score;
    
}

var recommendation_eng = function(dataset,person,distance){

    var totals = {
        
        setDefault:function(props,value){
            if(!this[props]){
                this[props] =0;
            }

            this[props] += value;
        }
    },
        simsum = {
            setDefault:function(props,value){
                if(!this[props]){
                    this[props] =0;
                }
    
                this[props] += value;
            }
        },
        rank_lst =[];

    for(var other in dataset){

        if(other ===person) continue;

        var similar = distance(dataset,person,other);
        
        if(similar <=0) continue;

        //console.log(similar);
        for(var item in dataset[other]){
                if(!(item in dataset[person]) ||(dataset[person][item]==0)){
                    totals.setDefault(item,dataset[other][item]*similar);
                    simsum.setDefault(item,similar);
                    
                    
                }
            
        }
    
        
    }
    
   for(var item in totals){
        if(typeof totals[item] !="function"){
           
            var val = totals[item] / simsum[item];
            rank_lst.push({val:val,items:item});
       }
    }
    rank_lst.sort(function(a,b){
        return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
    });
    var recommend = [];

    for(var i in rank_lst){
        recommend.push(rank_lst[i].items);
    }

    return [rank_lst,recommend];
}

//transform the database into item based

var transformdb = function(dataset){
    var rslt = {

        setDefault:function(props,p,value){
            if(!this[props]){
                this[props] ={};
            }

            this[props][p] = value;
        }
    };

    for(var prop in dataset){
        for(var item in dataset[prop]){
                rslt.setDefault(item,prop,dataset[prop][item]);
        }
    }
    return rslt;
}

function calculateSimilarItems(dataset,n=5,distance){

    var result = {};

    var itemPrefs = transformdb(dataset);
    var c = 0;
    for(var item in itemPrefs){
        if(typeof(itemPrefs[item])!='function'){
            c+=1;
            if(c%100==0) {
                console.log("%d /%d",c,len(itemPrefs)-1);
            }

            var scores = similar_user(itemPrefs,item,n=n,distance);
            result[item]=scores;
        }
    }
    return result;
}

var recommendedItem = function(dataset,itemMatch,user){
        var userRating = dataset[user];
        var totalsim = {
            
            setDefault:function(props,value){
                if(!this[props]){
                    this[props] =0;
                }
    
                this[props] += value;
            }
        },
        scores= {
                setDefault:function(props,value){
                    if(!this[props]){
                        this[props] =0;
                    }
        
                    this[props] += value;
                }
            },
            rankings =[];

        for(var item in userRating){
            var rating = userRating[item];
            for(var i in itemMatch[item]){
                var similarity = itemMatch[item][i].val;
                var item2 = itemMatch[item][i].p;
                
                if(item2 in userRating) continue;

                scores.setDefault(item2,0);
                scores[item2]+=similarity*rating;

                totalsim.setDefault(item2,0);
                totalsim[item2]+=similarity;
            }
           
        }
        for(var item in scores){
            if(typeof(scores[item])!="function"){
                var val = scores[item] / totalsim[item];
                rankings.push({val:val,item:item});
            }
        }
    
        rankings.sort(function(a,b){
            return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
        });
        return rankings;   
    }


//console.log(similar_user(transformdb(dataset),'Superman Returns',5));
//var v = loadMovieLens();
//var itemsim =calculateSimilarItems(v,n=50,pearson_correlation);


module.exports={
    euclidean:euclidean_score,
    pearson:pearson_correlation,
    similarUser:similar_user,
    recommendation_eng:recommendation_eng,
    transformdb:transformdb,
    calcSimilarItem:calculateSimilarItems,
    recommendItem: recommendedItem

}
