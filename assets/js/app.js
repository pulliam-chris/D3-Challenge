const svgWidth = 800;
const svgHeight = 600;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

let xAxis = "poverty";
let yAxis = "healthcare";

function xScale(cdata, chosenXAxis) {
  // create scales
  let xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(cdata, d => d[chosenXAxis])])
      .range([0, width]);

  return xLinearScale;
}

function yScale(cdata, chosenYAxis) {
  // create scales
  let yLinearScale = d3.scaleLinear()
      .domain([2, d3.max(cdata, d => d[chosenYAxis])])
      .range([height, 0]);
  
  return yLinearScale;
}

// function used for updating xAxis const upon click on axis label
function renXAxis(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis const upon click on axis label
function renYAxis(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  //circlesGroup = chartGroup.selectAll("circles");
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
    //.attr("transform", d => `translate(${newXScale(d[chosenXAxis])}, ${newYScale(d[chosenYAxis])})`)

  return circlesGroup;
}

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create dual axes labels
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 20)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  .attr("value", "healthcare")
  .attr("id", "healthcare")
  .text("Lacks Healthcare (%)")
  .classed("active", true);

chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  .attr("value", "smokes")
  .attr("id", "smokes")
  .text("Smokes (%)")
  .classed("inactive", true);

chartGroup.append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  .attr("class", "axisText")
  .attr("value", "poverty")
  .attr("id", "poverty")
  .text("In Poverty (%)")
  .classed("active", true);

chartGroup.append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
  .attr("class", "axisText")
  .attr("value", "income")
  .attr("id", "income")
  .text("Income ($)")
  .classed("inactive", true);

     //if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      //chosenXAxis = value;}
  

// Import Data
d3.csv("assets/data/data.csv").then(censusData => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(data => {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.income = +data.income;
    });

    //console.log(censusData)

    
    //let xlabel = "poverty"
    //let ylabel = "healthcare"

    //setXScale

    // Step 2: Create scale functions
    // ==============================
    //const xLinearScale = d3.scaleLinear()
    //  .domain([8, d3.max(censusData, d => d.poverty)])
    //  .range([0, width]);
    let xLinearScale = xScale(censusData, xAxis);

    //const yLinearScale = d3.scaleLinear()
    //  .domain([2, d3.max(censusData, d => d.healthcare)])
    //  .range([height, 0]);
    let yLinearScale = yScale(censusData, yAxis);

    // Step 3: Create axis functions
    // ==============================
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    let xCG = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    let yCG = chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    let circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .join("g")
    .attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)
           
    circlesGroup.append("circle")
    .attr("class", "stateCircle")
    .attr("r", "15")
    
    circlesGroup.append("text")
    .attr("class", "stateText")
    .text(d => d.abbr)
     
    // Step 1: Initialize Tooltip for circles
    let toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([20, 100])
    .html(d => `<strong>${d.state}<br /> Lacks Healthcare: ${d.healthcare}(%)<br />In Poverty: ${d.poverty}(%)`);

    // Step 2: Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    // Step 3: Create "mouseover" event listener to display tooltip
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    // Step 4: Create "mouseout" event listener to hide tooltip
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  //Initial on-click behaviour for labels
  chartGroup.selectAll("text")
  .on("click", function() {
  // get value of label selection
    let value = d3.select(this).attr("value");
    console.log(value)

      if(value === "poverty" || value === "income"){ 
        xAxis = value;
        xLinearScale = xScale(censusData, xAxis);
        // updates x axis with transition
        xCG = renXAxis(xLinearScale, xCG);
        //circlesGroup = xCG.selectAll("circle")
        //circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, xAxis, yAxis);
        if(value === "poverty"){
          let label = d3.select("#poverty");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#income")
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          let label = d3.select("#income");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#poverty")
            .classed("active", false)
            .classed("inactive", true);
        }
        
      }

      if(value === "healthcare" || value === "smokes"){
        yAxis = value;
        yLinearScale = yScale(censusData, yAxis);
        yCG = renYAxis(yLinearScale, yCG);
        //circlesGroup = yCG.selectAll("circle")

        if(value === "healthcare"){
          let label = d3.select("#healthcare");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#income")
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          let label = d3.select("#smokes");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#healthcare")
            .classed("active", false)
            .classed("inactive", true);
        }
      }
      
      circlesGroup = chartGroup.selectAll("circle")
      circlesGroup.remove()

      circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .join("g")
      .attr("transform", d => `translate(${xLinearScale(d[xAxis])}, ${yLinearScale(d[yAxis])})`)
             
      circlesGroup.append("circle")
      .attr("class", "stateCircle")
      .attr("r", "15")
      
      circlesGroup.append("text")
      .attr("class", "stateText")
      .text(d => d.abbr)
       
      // Step 1: Initialize Tooltip for circles
      let toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([20, 100])
      .html(d => `<strong>${d.state}<br />${xAxis}: ${d[xAxis]}<br />${yAxis}: ${d[yAxis]}`);
  
      // Step 2: Create the tooltip in chartGroup.
      chartGroup.call(toolTip);
  
      // Step 3: Create "mouseover" event listener to display tooltip
      circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
      })
      // Step 4: Create "mouseout" event listener to hide tooltip
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });


    //circlesGroup = chartGroup.selectAll("circle");
    //.attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)
    //circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, xAxis, yAxis);
    //circlesGroup = circlesGroup.attr("transform", d => `translate(${xLinearScale(d[xAxis])}, ${yLinearScale(d[yAxis])})`);

    //.attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)
    //console.log(xAxis);
    //console.log(yAxis);
    
    })

  

  }).catch(error => console.log(error));
