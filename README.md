# D3-Challenge
Using D3 and an SVG to create a scatter plot figure from US Census data

This project is enabled for **GitHub Pages** and the results can be reviewed at the following link:

https://pulliam-chris.github.io/D3-Challenge/

Primary files:
* static\js\app.js - Script that creates an initial SVG area on a homepage. Then based on the data read from a static file creates translated axes, circular data points, and tool tips that are activated when the user hovers their mouse over those data points.  After the initial page load the user is then able to toggle the X-Y axis labels using a click function to view different elements of the same data set to investigate relative trends.  

* data\data.csv - Static CSV file with the following headers: ```id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh ```

  * About the Data
  The data set included with the assignment is based on 2014 ACS 1-year estimates from the US Census Bureau. The current data set includes data on rates of income, obesity, poverty, etc. by state. MOE stands for "margin of error."

* index.html - Provided homepage programmed using Bootstrap containing the scatterplot figure and brief discussions of the observed trends.
