// Define SVG area and margins
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

// Set initial figure axis labels
let xAxis = "poverty";
let yAxis = "healthcare";

// External function that returns the linear scale for the X axis
function xScale(cdata, chosenXAxis) {
  // modify domain min based on data and appearance
  let xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(cdata, d => d[chosenXAxis])])
      .range([0, width])
      // cleaner axis end ticks
      .nice();

  return xLinearScale;
}

// External function that returns the linear scale for the Y axis
function yScale(cdata, chosenYAxis) {
  // modify domain min based on data and appearance
  let yLinearScale = d3.scaleLinear()
      .domain([2, d3.max(cdata, d => d[chosenYAxis])])
      .range([height, 0])
      // cleaner axis end ticks
      .nice();
  
  return yLinearScale;
}

// External function used for updating X axis const upon click on axis label
function renXAxis(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// External function used for updating Y axis const upon click on axis label
function renYAxis(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// External function to set tooltip behaviour and adapt to axis selection changes
function renToolTips (circlesGroup, chosenXAxis, chosenYAxis) {
  // Initialize the tool tip
  let toolTip = d3.tip()
  .attr("class", "d3-tip")
  // Set the default location
  .offset([20, 100])
  // Set the default text layout
  .html(d => `<strong>${d.state}<br />${chosenXAxis}: ${d[chosenXAxis]}(%)<br />${chosenYAxis}: ${d[chosenYAxis]}(%)`);

  // Create the tooltip in the established chartGroup.
  chartGroup.call(toolTip);

  // Create "mouseover" event listener to display the tooltip
  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
  // Create "mouseout" event listener to hide the tooltip
  .on("mouseout", function(d) {
    toolTip.hide(d);
  });
}

// Create an SVG wrapper
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append the SVG group that will hold the chart and shift it according to established margins
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create dual axes labels
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 20)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  // Value and ID attributes used for event listeners
  .attr("value", "healthcare")
  .attr("id", "healthcare")
  .text("Lacks Healthcare (%)")
  // Use styling to show which label is currently active
  .classed("active", true);

chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  // Value and ID attributes used for event listeners
  .attr("value", "smokes")
  .attr("id", "smokes")
  .text("Smokes (%)")
  // Use styling to show which label is currently active
  .classed("inactive", true);

chartGroup.append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  .attr("class", "axisText")
  // Value and ID attributes used for event listeners
  .attr("value", "poverty")
  .attr("id", "poverty")
  .text("In Poverty (%)")
  .classed("active", true);

chartGroup.append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
  .attr("class", "axisText")
  // Value and ID attributes used for event listeners
  .attr("value", "obesity")
  .attr("id", "obesity")
  .text("Obesity (%)")
  // Use styling to show which label is currently active
  .classed("inactive", true);


// With axis and functions defined, import the Census data
d3.csv("assets/data/data.csv").then(censusData => {

    // Cast data utilized in chart as numbers
    censusData.forEach(data => {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.income = +data.obesity;
    });

    // Create the X linear scale using the defined function
    let xLinearScale = xScale(censusData, xAxis);

    // Create the Y linear scale using the defined function
    let yLinearScale = yScale(censusData, yAxis);

    // Create the axis functions based on the scale
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append to the established chartGroup
    let xCG = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    let yCG = chartGroup.append("g")
      .call(leftAxis);

    // Place the object groups (circles and state abbr labels) based on the associated data
    let circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .join("g")
    .attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)
           
    circlesGroup.append("circle")
    // use established CSS styling
    .attr("class", "stateCircle")
    .attr("r", "15")
    
    circlesGroup.append("text")
    // use establied CSS styling
    .attr("class", "stateText")
    .text(d => d.abbr)

    // Activate the tooltip behaviour for the existing axis
    renToolTips(circlesGroup, xAxis, yAxis);
     
  // Establish logic for when different axis labels are selected after initial page load
  // Use "on click" event listener
  chartGroup.selectAll("text")
  .on("click", function() {
    // get value of label selection
    let value = d3.select(this).attr("value");
    //console.log(value)

      // If a "new" X label is clicked
      if(value === "poverty" || value === "obesity"){ 
        // Capture the "new" X label and set the axis
        xAxis = value;
        xLinearScale = xScale(censusData, xAxis);
        xCG = renXAxis(xLinearScale, xCG);
        
        // Change the highlights using the CSS styling
        if(value === "poverty"){
          let label = d3.select("#poverty");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#obesity")
            .classed("active", false)
            .classed("inactive", true);
        }
        
        else {
          let label = d3.select("#obesity");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#poverty")
            .classed("active", false)
            .classed("inactive", true);
        }
        
      }

      // If a "new" Y label is clicked
      if(value === "healthcare" || value === "smokes"){
        // Capture the "new" Y label and set the axis
        yAxis = value;
        yLinearScale = yScale(censusData, yAxis);
        yCG = renYAxis(yLinearScale, yCG);
        
        // Change the highlights using the CSS styling
        if(value === "healthcare"){
          let label = d3.select("#healthcare");
          label
            .classed("active", true)
            .classed("inactive", false);
          label = d3.select("#smokes")
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
      
      // Remove and re-draw the circle groups in the method of the original page load
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

      // Re-apply the tool tips using the external function based on the updated data
      renToolTips(circlesGroup, xAxis, yAxis);
    
    })
 
  // Catch and display any errors
  }).catch(error => console.log(error));
