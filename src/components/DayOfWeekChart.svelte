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
        // Updated to use 'dayOfWeek' which is confirmed present
        const daysData =
            data.dayOfWeek || data.days || data.dayStats || data.daily;

        if (!daysData) {
            console.warn("DayOfWeekChart: No data found");
            return;
        }

        const daysMap = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const seriesData = [];
        for (let i = 1; i <= 7; i++) {
            const dayData = daysData.find((d) => d._id === i);
            seriesData.push({
                name: daysMap[i - 1],
                y: dayData ? dayData.sum : 0,
            });
        }

        Highcharts.chart(chartContainer, {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                margin: [0, 0, 40, 0], // Increased bottom margin for labels
                height: 150, // Approximate
            },
            title: { text: null },
            xAxis: {
                categories: daysMap,
                lineWidth: 0,
                tickWidth: 0,
                labels: {
                    style: {
                        color: "#99aabb",
                        fontSize: "10px",
                    },
                    y: 20, // Push labels down a bit
                },
            },
            yAxis: {
                visible: false,
            },
            legend: { enabled: false },
            tooltip: {
                formatter: function () {
                    return `<b>${this.key}</b>: ${this.y}`;
                },
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    color: "#00e054",
                    borderRadius: 2,
                },
            },
            credits: { enabled: false },
            series: [
                {
                    data: seriesData,
                },
            ],
        });
    }
</script>

<div bind:this={chartContainer} class="weekDayChart"></div>

<style>
    .weekDayChart {
        width: 100%;
        height: 150px;
    }
</style>
