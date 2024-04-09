const height = 500;
const width = 700;

const svg = d3.select("#chart");

const svgChartEl = document.getElementById("chart");
const resultsBtn = document.getElementById("results-button");

const lgrCoefs = d3.csv("lgrcoef.csv");

d3.json("https://d3js.org/us-10m.v2.json").then(function (usData) {
  function drawState(selectedStateId) {
    svgChartEl.innerHTML = "";

    const stateData = topojson
      .feature(usData, usData.objects.states)
      .features.filter((d) => d.id === selectedStateId);

    const countiesData = topojson
      .feature(usData, usData.objects.counties)
      .features.filter((d) => d.id.indexOf(selectedStateId) === 0);

    console.log(usData.objects.states);

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

  function renderData() {
    const state = document.getElementById("state-select").value;
    drawState(state);
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
