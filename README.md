# Mortgage Analysis Project
Mortgage Analysis Project created for GaTech CSE 6242

### DESCRIPTION - Describe the package in a few paragraphs
#### What is the purpose of this analysis project?

To help mortgage applicants determine their potential to be approved or denied based on several factors such as income, gender, occupancy type, and ethnicity for three popular mortgage application states with the success rate for each state's respective counties. The three states that are included for this project are Texas, Washington, and New York. 

#### What is the model and what value does it bring?

This project showcases the power of a finely tuned logistic regression model alongside intuitive, interactive visualizations to examine the most recent mortgage application data extracted from the HMDA. Through prioritizing interpretability and user-centered design, we built a framework and visualization tool tailored to provide mortgage applicants with precise forecasts tailored to their unique circumstances. 

### INSTALLATION - How to install and setup your code
Installation for this project requires that you download the "docs" folder (which you've done) and navigate to docs using your command line.

#### Install Node.js and npm
If you haven't already done so, visit the [official Node.js website](https://nodejs.org/) to download and install Node.js. npm is included with Node.js.

#### Instantiate a web server and load the app
To run the server for this JavaScript app, you will need to instantiate a local server. Here's one way to do that:

1. Use `http-server` which generates an HTTP server from the command-line.
   1. Install it globally using `npm install --global http-server` if you haven't already installed one.
2. Navigate to the `docs` directory using `cd docs`.
3. Start the server using `http-server`. By default, this will start the server on `http://localhost:8080`.
4. Open your web browser and navigate to `http://localhost:8080` to view and interact with the app.

Please note that the port number may vary depending on your configuration. The `http-server` command will display the exact URL you should use.

### EXECUTION - How to run a demo on your code
We've designed the visualization to be straight-forward, but in brief you will select the characteristics you are interested in testing from the list of selectable values, then click "Generate Results"

#### Customizable Variables
1. State (NY, WA, TX)
2. Gender (Male, Female, Other, Prefer not to say)
3. Age (<25, 25-34, 35-44, etc...)
4. Race/Ethnicity (White, Asian, Black, etc...)
5. Occupancy Type (Principal, Secondary, Investment)
6. Gross Income in USD (An integer)

After you click "Generate Results" the cloropleth map will update with a color scale of your likelihood for application success, you'll be provided with a key and then you'll see the top 10 counties where you're most likely to succeed with your application.