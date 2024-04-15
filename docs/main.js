const height = 500;
const width = 700;

const svg = d3.select("#chart");

const svgChartEl = document.getElementById("chart");
const resultsBtn = document.getElementById("results-button");

const codeToState = {
  48: "TX",
  53: "WA",
  36: "NY",
};

d3.json("https://d3js.org/us-10m.v2.json").then(async function (usData) {
  const lgrCoefs = await d3.csv("coef_lgr_agg3.csv");

  function drawState(selectedStateId, coefs) {
    svgChartEl.innerHTML = "";

    const stateData = topojson
      .feature(usData, usData.objects.states)
      .features.filter((d) => d.id === selectedStateId);

    const countiesData = topojson
      .feature(usData, usData.objects.counties)
      .features.filter((d) => d.id.indexOf(selectedStateId) === 0);

    coefs.counties = countiesData.map((x) => ({
      id: x.id,
      name: x.properties.name,
      value: getFeatureCoef(codeToState[selectedStateId], "county_code_", x.id),
    }));

    const countyPredictions = coefs.counties.map((x) => {
      const odds = Math.exp(
        coefs.intercept + // intercept
          x.value + // county
          coefs.genderCoef + // gender
          coefs.raceCoef + // race/ethnicity
          coefs.ageCoef + // age
          coefs.oTypeCoef + // occupancy type
          Math.log(coefs.income / 1000) * coefs.incomeLogCoef + // income
          Math.log(coefs.loanAmount / 1000) * coefs.loanAmountLogCoef + // loan amount
          //coefs.interestRate * coefs.interestRateCoef + // interest rate
          //coefs.loanTerm * coefs.loanTermCoef + // loan term
          Math.log(coefs.propertyValue / 1000) * coefs.propertyValueCoef // property value
      );
      return {
        prediction: odds / (1 + odds),
        ...x,
      };
    });
    updateTable(countyPredictions);

    const colors = ["#F4EBED", "#D3B1B7", "#B27682", "#913C4C"];

    const colorScale = d3
      .scaleQuantile()
      .domain(countyPredictions.map((d) => d.prediction))
      .range(colors);

    const projection = d3.geoIdentity().fitSize([width, height], stateData[0]);

    const path = d3.geoPath().projection(projection);

    svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(countiesData)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (d) {
        return "county" + d.id;
      })
      .attr("fill", function (d) {
        const countyData = countyPredictions.find((x) => x.id === d.id);
        const color = colorScale(countyData.prediction);
        return color;
      })

      .on("mousemove", function handleMouseOver(d) {
        const [x, y] = d3.mouse(this);
        const countyData = countyPredictions.find((x) => x.id === d.id);
        const tooltip = document.getElementById("tooltip");
        tooltip.innerHTML = `<div>
        <strong>County: </strong>${countyData.name}<br />
        <strong>${countyData.prediction.toFixed(6)}
        </div>`;
        tooltip.style.top = `${y + 400}px`;
        tooltip.style.left = `${x + 100}px`;
        tooltip.style.display = "block";
      })

      .on("mouseout", function (d) {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
        tooltip.innerHTML = "";
      });

    svg
      .append("path")
      .attr("class", "county-borders")
      .attr(
        "d",
        path(
          topojson.mesh(usData, usData.objects.counties, function (a, b) {
            return a !== b;
          })
        )
      );

    const legendBody = document.querySelector("#legend > tbody");
    legendBody.innerHTML = "";

    colors.reverse().forEach((x, idx) => {
      const row = document.createElement("tr");

      const colorCol = document.createElement("td");
      colorCol.style.width = "24px";
      colorCol.style.backgroundColor = x;
      colorCol.innerHTML = "&nbsp;";
      row.appendChild(colorCol);

      const probCol = document.createElement("td");
      probCol.innerHTML = colorScale
        .invertExtent(x)
        .map((x) => x.toFixed(6))
        .join("-");
      row.appendChild(probCol);

      legendBody.appendChild(row);
    });
  }

  function getFeatureCoef(state, prefix, value) {
    const key = `${prefix}${value}`;
    const coef = lgrCoefs
      .filter((x) => x.state === state)
      .find((x) => x.Feature === key);
    return coef ? parseFloat(coef.Coefficient) : 0;
  }

  function updateTable(countyPredictions) {
    const sorted = countyPredictions.sort(
      (a, b) => b.prediction - a.prediction
    );
    const limited = sorted.slice(0, 10);
    const tableBody = document.querySelector("#top-10 > tbody");
    tableBody.innerHTML = "";
    limited.forEach((x, idx) => {
      const row = document.createElement("tr");

      const rankCol = document.createElement("td");
      rankCol.innerHTML = idx + 1;
      row.appendChild(rankCol);

      const nameCol = document.createElement("td");
      nameCol.innerHTML = x.name;
      row.appendChild(nameCol);

      const probCol = document.createElement("td");
      probCol.innerHTML = x.prediction.toFixed(6);
      row.appendChild(probCol);

      tableBody.appendChild(row);
    });
  }

  function renderData() {
    const state = document.getElementById("state-select").value;
    const stateAbrev = codeToState[state];

    const gender = document.getElementById("gender-select").value;
    const genderCoef = getFeatureCoef(stateAbrev, "derived_sex_", gender);

    const age = document.getElementById("age-select").value;
    const ageCoef = getFeatureCoef(stateAbrev, "applicant_age_", age);

    const race = document.getElementById("race-select").value;
    const raceCoef = getFeatureCoef(stateAbrev, "race_ethnicity_", race);

    const oType = document.getElementById("occupancy_type-select").value;
    const oTypeCoef = getFeatureCoef(stateAbrev, "occupancy_type_", oType);

    const income = parseFloat(document.getElementById("income-entry").value);
    const incomeLogCoef = getFeatureCoef(stateAbrev, "income_log", "");

    const loanAmount = 305000; // median loan amount
    const loanAmountLogCoef = getFeatureCoef(stateAbrev, "loan_amount_log", "");

    const interestRate = 3.875; // median interest rate
    const interestRateCoef = getFeatureCoef(stateAbrev, "interest_rate", "");

    const loanTerm = 360; // // median loan term in months
    const loanTermCoef = getFeatureCoef(stateAbrev, "loan_term", "");

    const propertyValue = 375000; // median property value
    const propertyValueCoef = getFeatureCoef(
      stateAbrev,
      "property_value_log",
      ""
    );

    const intercept = getFeatureCoef(stateAbrev, "Intercept", "");

    coefs = {
      ageCoef,
      raceCoef,
      genderCoef,
      oTypeCoef,
      income,
      incomeLogCoef,
      loanAmount,
      loanAmountLogCoef,
      //interestRate,
      //interestRateCoef,
      //loanTerm,
      //loanTermCoef,
      propertyValue,
      propertyValueCoef,
      intercept,
    };

    drawState(state, coefs);
  }

  resultsBtn.addEventListener("click", (evt) => {
    renderData();
  });

  renderData();
});
