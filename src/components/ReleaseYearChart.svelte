<script>
    import Highcharts from "highcharts";
    import "highcharts/modules/accessibility";
    import { onMount } from "svelte";
    import { lbdurl } from "../helpers.js";

    let { data, type = "releaseYear" } = $props();
    let chartContainer = $state();
    let containerWidth = $state(0);

    $effect(() => {
        if (chartContainer && containerWidth > 0) {
            renderChart(type);
        }
    });

    function renderChart(activeType) {
        let statsData = [];
        let colorStops = [
            [0, "#00e054"],
            [1, "#3fbcf2"],
        ];
        let tooltipFormatter = function () {};

        if (activeType === "releaseYear") {
            statsData = data.years.map((element) => ({
                name: element["_id"],
                y: element["sum"] + 1,
                color: element["sum"] === 0 ? "#445566" : undefined,
            }));
            tooltipFormatter = function () {
                return `<div class="ttYear"><span class="ttTitle">${this.y - 1} films</span><span class="ttSubtitle">Year ${this.points[0].key}</span></div>`;
            };
        } else if (activeType === "ratingYear") {
            statsData = data.ru.map((element) => ({
                name: element["_id"],
                y: element["avg"] + 1,
            }));
            tooltipFormatter = function () {
                return `<div class="ttYear"><span class="ttTitle">Rating ${this.y - 1}</span><span class="ttSubtitle">Year ${this.points[0].key}</span></div>`;
            };
        } else if (activeType === "diaryYear") {
            statsData = data.logsPerYear.map((element) => ({
                name: element["_id"],
                y: element["sum"] + 1,
            }));
            tooltipFormatter = function () {
                return `<div class="ttYear"><span class="ttTitle">${this.y - 1} films</span><span class="ttSubtitle">Year ${this.points[0].key}</span></div>`;
            };
        }

        const config = {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                margin: 0,
                border: 0,
            },
            xAxis: {
                labels: { enabled: false },
                title: false,
                lineColor: "transparent",
                visible: false,
            },
            yAxis: {
                min: -1,
                labels: { enabled: false },
                title: false,
                lineColor: "transparent",
                visible: false,
            },
            legend: { enabled: false },
            title: { text: null },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    borderRadius: 3,
                    groupPadding: 0,
                },
            },
            tooltip: {
                formatter: tooltipFormatter,
                shared: true,
                useHTML: true,
                shape: "square",
                borderWidth: 0,
                shadow: false,
                backgroundColor: null,
            },
            series: [
                {
                    data: statsData,
                    label: { enabled: false },
                    color: {
                        linearGradient: [0, 0, containerWidth, 0],
                        stops: colorStops,
                    },
                    point: {
                        events: {
                            click: function () {
                                let path =
                                    "/films/year/" + this.options.name + "/";
                                if (activeType === "ratingYear")
                                    path += "by/entry-rating/";
                                if (activeType === "diaryYear")
                                    path =
                                        "/films/diary/for/" +
                                        this.options.name +
                                        "/";
                                location.href =
                                    "https://letterboxd.com/" +
                                    data.username +
                                    path;
                            },
                        },
                    },
                },
            ],
        };

        Highcharts.chart(chartContainer, config);
    }
</script>

<div
    class="yearChart"
    bind:this={chartContainer}
    bind:clientWidth={containerWidth}
></div>

<style>
    .yearChart {
        width: 100%;
        height: 200px;
    }
</style>
