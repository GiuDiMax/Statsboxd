<script>
    import Highcharts from "highcharts";
    import "highcharts/modules/accessibility";

    let { data } = $props();
    let chartContainer;

    $effect(() => {
        if (data && chartContainer) {
            renderChart();
        }
    });

    function renderChart() {
        // Updated to use 'rating'.
        // Assuming 'data.rating' is the array.
        const statsData =
            data.rating ||
            data.ratingSpread ||
            data.ratings ||
            data.ratingStats;

        if (!statsData) {
            console.warn("RatingSpreadChart: No data found");
            return;
        }

        const chartData = statsData.map((item) => ({
            name: item._id, // e.g. 0.5, 1.0
            y: item.sum,
        }));

        Highcharts.chart(chartContainer, {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                height: 150, // Matches CSS or visual
                margin: [0, 0, 20, 0],
            },
            title: { text: null },
            xAxis: {
                title: { text: null },
                categories: chartData.map((d) => d.name), // 0.5 to 5
                labels: { enabled: false }, // Likely hidden based on design
                lineWidth: 0,
                tickWidth: 0,
            },
            yAxis: {
                visible: false,
                title: { text: null },
            },
            legend: { enabled: false },
            tooltip: {
                headerFormat:
                    '<span style="font-size: 10px">{point.key} Stars</span><br/>',
                pointFormat: "<b>{point.y}</b> films",
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    color: "#40bcf4",
                    pointPadding: 0.1,
                    groupPadding: 0,
                },
            },
            credits: { enabled: false },
            series: [
                {
                    data: chartData,
                },
            ],
        });
    }
</script>

<div bind:this={chartContainer} class="ratingSpread"></div>

<style>
    .ratingSpread {
        width: 100%;
        height: 150px;
    }
</style>
