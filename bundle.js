//
var G = document.getElementById('G');
var dropG = document.getElementById('dropG');
G.addEventListener('mouseover',function(){  
    dropG.style.display = 'block';
});
G.addEventListener('mouseout',function(){  
    dropG.style.display = 'none';
});

var T = document.getElementById('T');
var dropT = document.getElementById('dropT');
T.addEventListener('mouseover',function(){  
    dropT.style.display = 'block';
});
T.addEventListener('mouseout',function(){  
    dropT.style.display = 'none';
});

var M = document.getElementById('M');
var dropM = document.getElementById('dropM');
M.addEventListener('mouseover',function(){  
    dropM.style.display = 'block';
});
M.addEventListener('mouseout',function(){  
    dropM.style.display = 'none';
});

var E = document.getElementById('E');
var dropE = document.getElementById('dropE');
E.addEventListener('mouseover',function(){  
    dropE.style.display = 'block';
});
E.addEventListener('mouseout',function(){  
    dropE.style.display = 'none';
});

var N = document.getElementById('N');
var dropN = document.getElementById('dropN');
N.addEventListener('mouseover',function(){  
    dropN.style.display = 'block';
});
N.addEventListener('mouseout',function(){  
    dropN.style.display = 'none';
});







var svg = d3.select('#svg1')
    ;
var svg2 = d3.select('#svg2')
    ;

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    //.attr("fill", "#000000");
    .attr("fill", "#f6f7f9");
svg2.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#f6f7f9");
    //.attr("fill", "#f6f7f9");
var margin = ({top: 20, right: 30, bottom: 240, left: 80})

var height = +svg.attr('height');
var width = +svg.attr('width');
var height2 = +svg2.attr('height');
var width2 = +svg2.attr('width');

var filter = svg.append("defs")
    .append("filter")
    .attr("id", "blur")
    .append("feGaussianBlur")
    .attr("stdDeviation", 2);

d3.csv("2020r.csv").then(loadedData => {
    data = loadedData;
    //console.log(data);
    data = data.filter(function (d, i) {
        return d.url != undefined
    })
    data.forEach(d => {
        d.id = d.url.replace('https://archiveofourown.org/works/', '')
        //console.log(d.rating)

        d.rating = d.rating.replace('\'', '').replace('[', '').replace(']', '').replace('\'', '')
        d.characters = d.characters.replace(' - Character', '')
        d.fandom = d.fandom.replace(/\'/g, '').replace('[', '').replace(']', '')
        d.summary = d.summary.replace(/[\r\n]/g, "");
        d.publish_time = d.publish_time.substring(0, 4);
    })
    //

    var dataRateNestNotOrdered = d3.nest().key(function (d) {
        return d.rating
    })
        .entries(data);
    var dataRateNest = [];
    dataRateNest.push(dataRateNestNotOrdered[4]); dataRateNest.push(dataRateNestNotOrdered[3]); dataRateNest.push(dataRateNestNotOrdered[0]);
    dataRateNest.push(dataRateNestNotOrdered[1]); dataRateNest.push(dataRateNestNotOrdered[2]);

    var articleIdMap = d3.nest().key(function (d) {
        return d.id
    })
        .entries(data);

    articleIdKey = d3.map(articleIdMap, function (d) {
        return d.key
    })
        ;

    var maxHits = d3.max(data, function (d) { return +d.hits });
    var minHits = d3.min(data, function (d) { return +d.hits });
    var opacityScale = d3.scaleLinear()
        .domain([minHits, maxHits])
        .range([0.2, 1]);
    var rateColorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(['blue', 'yellow', '#ff00d8', 'red', '#e9e9e9']);
    var rateColorScale2 = d3.scaleOrdinal()
        .domain(['General Audiences', 'Teen And Up Audiences', 'Mature', 'Explicit', 'Not Rated'])
        .range(['blue', 'yellow', '#ff00d8', 'red', '#e9e9e9']);
    var rateDataObject = [];
    var offsets = [360, 450, 40, 380, 80];
    for (var key in dataRateNest) {
        //console.log(key);//0 1 2 3 4

        var yPos = key * 280 + 100;
        var yBaseline = yPos;
        var xPos = offsets[key];
        var xBaseline = xPos;
        var tencount = 0;
        for (article in dataRateNest[key].values) {
            //console.log(article);//0~596 / 0~239 ...
            var id = dataRateNest[key].values[article].url.replace('https://archiveofourown.org/works/', '');
            var hits = dataRateNest[key].values[article].hits;
            var title = dataRateNest[key].values[article].title;
            var author = dataRateNest[key].values[article].author;
            var relationship = dataRateNest[key].values[article].relationship;
            var summary = dataRateNest[key].values[article].summary;
            var firsthundred = dataRateNest[key].values[article].firsthundred;
            var category = dataRateNest[key].values[article].category;
            var kudos = dataRateNest[key].values[article].kudos;

            yPos = (article - tencount * 10) * 24 + yBaseline;

            if (article % 10 === 0 && article != 0) {
                yPos = yBaseline;
                xPos = xBaseline + (article / 10) * 24;
                tencount = tencount + 1;
            }
            rateDataObject.push({ x: xPos, y: yPos, id: id, author: author,relationship: relationship, summary: summary, firsthundred: firsthundred, category: category, hits: hits, kudos: kudos, title: title, key: key, articleData: articleIdKey.get(id).values[0] });
        }

    }

    let xAxis = g => g
          .attr("transform", `translate(0,${height2-margin.bottom})`)
          .call(d3.axisBottom(x))
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text") // Adding axis label
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("font-size", 13)
           .attr("text-anchor", "end")
           .text('hits'))
    
    let x = d3.scaleLinear()
    .domain([d3.min(data, d => d.hits),11*d3.max(data, d => d.hits)]) 
    .range([margin.left,width2-margin.right])
    
    let yAxis = g => g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").remove())
          .call(g => g.select(".tick:last-of-type text").clone() // Adding axis label 
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", 13)
            .text('kudos'))  

    let y = d3.scaleLinear()
          .domain([d3.min(data, d => d.kudos),1.5*d3.max(data, d => d.kudos)])
          .range([height2-margin.bottom,margin.top])

    svg2.append('g')
     .call(xAxis);
   
    svg2.append('g')
     .call(yAxis);

    const dot = svg2.append("g")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
    .selectAll("g")
    .data(data)
    .join("circle")
        .attr("transform", d => `translate(${x(d.hits)},${y(d.kudos)})`)
        .attr("r", d => 2)
        .on("mouseover", function (d) {
            d3.select(this)
                //.attr('fill','black')
                .attr('fill', d => rateColorScale2(d.rating))
                .attr("stroke", d => rateColorScale2(d.rating))
                console.log(d.rating);

            current_position = d3.mouse(this);
            var matrix = this.getScreenCTM()
            .translate(+this.getAttribute("cx"),
                        +this.getAttribute("cy"));

                        console.log(current_position);
                        console.log(matrix);
                        console.log(window.pageXOffset);
                        console.log(matrix.e);
             	
            if(matrix.e > 1100){
                tool_tip2
                    .style("left", 
                    (matrix.e - 400) + "px")
            }else{
                tool_tip2
                    .style("left", 
                    (window.pageXOffset + matrix.e) + "px")
            }
            tool_tip2
            .style("top",
            (window.pageYOffset + matrix.f + 15) + "px");
            tool_tip2.show();

            var article = d3.select("#tipDiv2")
                .append('div')
                .attr('class', 'article')
                .style('display','flex')
                .style('flex-direction','column')
                .style('width','400px')
                .style('border-bottom','0.5px black solid');
            var hitsAndKudos = d3.select("#tipDiv2").append('div')
                .attr('class', 'hitsAndKudos')
                .style('width', '400px');
            var hits = hitsAndKudos.append('p')
                .text('HITS '+d.hits)
                .attr('class', 'hits')
                .style('font-size','18px')
                .style('line-height','20px')
                .style('margin','20px 0px 0px 0px')
                ;
            var kudos = hitsAndKudos.append('p')
                .text('KUDOS '+d.kudos)
                .attr('class', 'kudos')
                .style('font-size','18px')
                .style('line-height','20px')
                .style('margin','0px 0px 10px 0px')
                ;
            var kudosVShits = hitsAndKudos.append('p')
                .text('KUDOS/HITS '+(100*(d.kudos/d.hits)).toFixed(2)+'%')
                .attr('class', 'kudosVShits')
                .style('font-size','18px')
                .style('line-height','20px')
                .style('margin','0px 0px 10px 0px')
                ;
            if(d.hits == 0 && d.kudos != 0){
                var explain = hitsAndKudos.append('p')
                    .text('Author chose to hide hits.')
                    .attr('class', 'kudosVShits')
                    .style('font-size','14px')
                    .style('line-height','20px')
                    .style('color','grey')
                    .style('margin','0px 0px 10px 0px')
            }
            var titie = article.append('p')
                .text(d.title)
                .style('font-size','20px')
                .style('line-height','25px')
                .style('margin','0px 0px 0px 0px')
                ;
            var author = article.append('p')
                .text('AUTHOR '+d.author)
                .style('font-size','16px')
                .style('line-height','28px')
                .style('color','grey')
                .style('margin','10px 0px 0px 0px')
                ;
            var relationship = article.append('p')
                .text('RELATIONSHIP '+d.relationship)
                .style('font-size','16px')
                .style('line-height','18px')
                .style('color','grey')
                .style('margin','0px 0px 20px 0px')
                ;
        })
    
   

    // define the tooltip 
    var tool_tip2 = d3.tip()
    .attr("class", "d3-tip")
    .style('z-index', '99999999')
    .style('position','absolute')
    .style('background-color','white')
    .style('border','1px solid black')
    //.style('padding','10px')
    .style('display','flex')
    .style('flex-direction','column')
    // if the mouse position is greater than 650 (~ Kentucky/Missouri), offset tooltip to the left instead of the right
    
    // input the title, and include the div
    .html(
        "<div id='tipDiv2'></div>"
    );
    svg2.call(tool_tip2);

     // define the tooltip 
    var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .style('z-index', '99999999')
    .style('position','absolute')
    .style('background-color','white')
    .style('border','1px solid black')
    //.style('padding','10px')
    .style('display','flex')
    .style('flex-direction','column')
    // if the mouse position is greater than 650 (~ Kentucky/Missouri), offset tooltip to the left instead of the right
    
    // input the title, and include the div
    .html(
        "<div id='tipDiv'></div>"
    );

    svg.call(tool_tip);
   
    var groups = svg.selectAll('g').data(rateDataObject, function (d) { return d.id })
        .enter().append('g');
    var circles = groups
        .append('circle')
        .attr('cx', function (d, i) {
            return d.x + 2
        })
        .attr('cy', function (d, i) {
            return d.y + 2
        })
        .attr('fill', '#a8b0bd')
        .attr('fill-opacity', d => opacityScale(d.hits))
        .attr('r', 10)
        .attr('filter', 'url(#blur)')

        ;

    groups
        .append('circle')
        .attr('cx', function (d, i) {
            return d.x - 2
        })
        .attr('cy', function (d, i) {
            return d.y - 2
        })
        .attr('fill', 'white')
        .attr('fill-opacity', d => opacityScale(d.hits))
        .attr('r', 10)
        .attr('filter', 'url(#blur)')
        ;

    groups//.selectAll('circle')
        .append('circle')
        .attr('cx', function (d, i) {
            return d.x
        })
        .attr('cy', function (d, i) {
            return d.y
        })
        .attr('fill', '#f8f9fa')
        //.attr('fill-opacity', d => opacityScale(d.hits))
        .attr('r', 8)
        .attr('stroke-width', 0.5)
        .attr('stroke', 'white')
        .on("mouseover", function (d) {
            d3.select(this)
                .attr('fill', d => rateColorScale(d.key))
                

            current_position = d3.mouse(this); 	
            
            // define current article
            current_article = d.id;

            var matrix = this.getScreenCTM()
            .translate(+this.getAttribute("cx"),
                     +this.getAttribute("cy"));
            

            if(current_position[0] > 1100){
                tool_tip
                    .style("left", 
                    (matrix.e - 400) + "px")
            }else{
                tool_tip
                    .style("left", 
                    (window.pageXOffset + matrix.e) + "px")
            }
            tool_tip
            .style("top",
            (window.pageYOffset + matrix.f + 15) + "px");
            tool_tip.show();

            var articleInfo = d3.select("#tipDiv")
                .append('div')
                .attr('class', 'articleInfoWrap')
                .style('display','flex')
                .style('flex-direction','column')
                .style('width','400px')
                .style('border-bottom','0.5px black solid');
            var articleContent = d3.select("#tipDiv").append('div')
                .attr('class', 'articleContentWrap')
                .style('width', '400px');
            var title = articleInfo.append('p')
                .text(d.title)
                .attr('class', 'title')
                .style('font-size','20px')
                .style('line-height','25px')
                .style('margin','0px 0px 10px 0px')
                ;
            var author = articleInfo.append('p')
                .text("AUTHOR   " + d.author)
                //.style('font-family','Arial, Helvetica, sans-serif')
                .attr('class','author')
                .style('font-size','16px')
                .style('color','grey')
                .style('line-height','18px')
                .style('margin','0px')
                ;
            var relationship = articleInfo.append('p')
                .text("RELATIONSHIP   " + d.relationship)
                .style('font-size','16px')
                .style('color','grey')
                .style('line-height','18px')
                .style('margin','0px')
                ;
            var category = articleInfo.append('p')
                .text("CATEGORY   " + d.category)
                .style('font-size','16px')
                .style('color','grey')
                .style('line-height','18px')
                .style('margin','0px')
                ;
            var summary = articleInfo.append('p')
                .text(d.summary)
                .style('font-size','14px')
                .style('line-height','16px')
                .style('margin','30px 0px 10px 0px')
                ;
            var firsthundred = articleContent.append('p')
                .text(d.firsthundred + "......")
                .style('font-size','14px')
                .style('line-height','16px')
                .style('margin','20px 0px 0px 0px')
                ;
            console.log(articleInfo);
            // var tipSVG = d3.select("#tipDiv")
            //     .append("svg")
            //     .style('background-color','white')
            //     .attr("width", 220)
            //     .attr("height", 55);

            // tipSVG.append("text")
            //     .text(current_article)
            //     .attr("x", 0)
            //     .attr("y", 15)
            //     .style("font-size", 18)
            //     .style("font-weight", 400);
            
            // console.log(tipSVG);
            console.log(d.key);
        })
        .on('mouseout', tool_tip.hide)
   
    
   



    

})