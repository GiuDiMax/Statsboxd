<script>
    import Highcharts from "highcharts";
    import "highcharts/modules/accessibility";

    let { data } = $props();
    let chartContainer = $state();

    let chartInstance;
    $effect(() => {
        if (chartContainer && data && data.years) {
            renderChart();
        }
        return () => chartInstance?.destroy();
    });

    function getDecadeData() {
        const buckets = {};
        (data.years || []).forEach((y) => {
            const decade = Math.floor(y._id / 10) * 10;
            buckets[decade] = (buckets[decade] || 0) + (y.sum || 0);
        });
        return Object.keys(buckets)
            .sort((a, b) => Number(a) - Number(b))
            .map((d) => ({ name: d + "s", y: buckets[d] }));
    }

    function renderChart() {
        const seriesData = getDecadeData();

        chartInstance?.destroy();
        chartInstance = Highcharts.chart(chartContainer, {
            chart: {
                type: "pie",
                backgroundColor: "transparent",
            },
            title: { text: null },
            credits: { enabled: false },
            tooltip: {
                pointFormat:
                    "<b>{point.name}</b>: {point.y} films ({point.percentage:.1f}%)",
            },
            plotOptions: {
                pie: {
                    cursor: "pointer",
                    innerSize: "45%",
                    borderWidth: 1,
                    borderColor: "#14181c",
                    point: {
                        events: {
                            click: function () {
                                const decade = this.name.replace(/s$/, "");
                                window.open("https://letterboxd.com/" + data.username + "/films/decade/" + decade + "s/","_blank");
                            },
                        },
                    },
                    dataLabels: {
                        enabled: true,
                        format: "<b>{point.name}</b><br>{point.percentage:.0f}%",
                        style: {
                            color: "#def",
                            fontFamily: "Graphik-Light-Web, sans-serif",
                            fontWeight: "400",
                            textOutline: "none",
                            fontSize: "12px",
                        },
                        connectorColor: "#556",
                        distance: 20,
                    },
                },
            },
            series: [
                {
                    name: "Films",
                    colorByPoint: true,
                    data: seriesData,
                    colors: [
                        "#00e054",
                        "#12d669",
                        "#24cc7e",
                        "#36c293",
                        "#48b8a8",
                        "#5aaebd",
                        "#6ca4d2",
                        "#3fbcf2",
                        "#5ca9e8",
                        "#7996de",
                        "#9683d4",
                        "#b370ca",
                        "#d05dc0",
                    ],
                },
            ],
        });
    }
</script>

<div class="decadePieChart" bind:this={chartContainer}></div>

<style>
    .decadePieChart {
        width: 100%;
        height: 320px;
    }
</style>
