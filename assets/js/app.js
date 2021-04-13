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

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(censusData => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(data => {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    //console.log(censusData)
    });

    // Step 2: Create scale functions
    // ==============================
    const xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(censusData, d => d.poverty)])
      .range([0, width]);

    const yLinearScale = d3.scaleLinear()
      .domain([2, d3.max(censusData, d => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    const circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .join("g")
    .attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)
    //.attr("cx", d => xLinearScale(d.smokes))
    //.attr("cy", d => yLinearScale(d.obesity))
       
    circlesGroup.append("circle")
    .attr("class", "stateCircle")
    .attr("r", "15")
    
    circlesGroup.append("text")
    .attr("class", "stateText")
    .text(d => d.abbr)
    
    // Create dual axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");
    
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Smokes (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
      .attr("class", "axisText")
      .text("Income");

    // Step 1: Initialize Tooltip
    const toolTip = d3.tip()
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

  }).catch(error => console.log(error));
