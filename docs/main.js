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
  const lgrCoefs = await d3.csv("lgrcoef.csv");

  function drawState(selectedStateId, coefs) {
    svgChartEl.innerHTML = "";

    const stateData = topojson
      .feature(usData, usData.objects.states)
      .features.filter((d) => d.id === selectedStateId);

    const countiesData = topojson
      .feature(usData, usData.objects.counties)
      .features.filter((d) => d.id.indexOf(selectedStateId) === 0);

    // console.log(countiesData);
    coefs.counties = countiesData.map((x) => ({
      id: x.id,
      name: x.properties.name,
      value: getFeatureCoef("county_code_", x.id),
    }));

    // console.log(coefs);
    const countyPredictions = coefs.counties.map((x) => {
      return {
        prediction:
          (coefs.intercept + // intercept
            x.value + // county coef
            Math.log(coefs.income) * coefs.incomeLog + // income
            coefs.ageCoef + // age
            coefs.oTypeCoef) / // occupancy type
          10, // TODO this is fake, just to make the numbers look good for now
        ...x,
      };
    });
    updateTable(countyPredictions);

    // console.log(usData.objects.states);

    const projection = d3.geoIdentity().fitSize([width, height], stateData[0]);

    const path = d3.geoPath().projection(projection);

    svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      // .data(topojson.feature(us, us.objects.counties).features)
      .data(countiesData)
      .enter()
      .append("path")
      .attr("d", path)
      // .attr('fill', noDataColor)
      .attr("id", function (d) {
        return "county" + d.id;
      })
      .on("mouseover", function (d) {
        console.log(d);
      })
      .on("mouseout", function (d) {});

    /*
    countiesData.forEach(function (d) {
      d3.select("#county" + parseInt(d[countyId]))
        .style("fill", mapColor(parseFloat(d[observation])))
        .on("mouseover", function () {
          return addTooltip(d[countyName], parseFloat(d[observation]));
        })
        .on("mouseout", function (d) {
          tooltip.transition().duration(200).style("opacity", 0);
        });
    });*/

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
  }

  function getFeatureCoef(prefix, value) {
    const key = `${prefix}${value}`;
    const coef = lgrCoefs.find((x) => x.Feature === key);
    return parseFloat(coef.Coefficient);
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
      probCol.innerHTML = x.prediction.toFixed(4);
      row.appendChild(probCol);

      tableBody.appendChild(row);
    });
  }

  function renderData() {
    // console.log(lgrCoefs);

    const state = document.getElementById("state-select").value;
    const stateCoef = getFeatureCoef("state_code_", codeToState[state]);
    console.log(`coef for ${codeToState[state]}:`, stateCoef);

    // TODO need applicant_sex instead of derived gender
    // const gender = document.getElementById("gender-select").value;
    // const genderCoef = getFeatureCoef("applicant_sex", gender);
    // console.log(`coef for ${gender}:`, genderCoef);

    const age = document.getElementById("age-select").value;
    const ageCoef = getFeatureCoef("applicant_age_", age);
    console.log(`coef for ${age}:`, ageCoef);

    // TODO way too many options need to consolidate
    // const race = document.getElementById("race-select").value;
    // const raceCoef = getFeatureCoef("race_ethnicity", race);
    // console.log(`coef for ${race}:`, raceCoef);

    const oType = document.getElementById("occupancy_type-select").value;
    const oTypeCoef = getFeatureCoef("occupancy_type_", oType);
    console.log(`coef for ${oType}:`, oTypeCoef);

    const income = document.getElementById("income-entry").value;
    const intercept = getFeatureCoef("Intercept", "");
    const incomeLog = getFeatureCoef("income_log", "");

    coefs = { stateCoef, ageCoef, oTypeCoef, income, incomeLog, intercept };

    drawState(state, coefs);
  }

  resultsBtn.addEventListener("click", (evt) => {
    renderData();
  });

  renderData();
  /*
  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path);

  svg
    .append("path")
    .attr("class", "county-borders")
    .attr(
      "d",
      path(
        topojson.mesh(us, us.objects.counties, function (a, b) {
          return a !== b;
        })
      )
    );
    */
});
