<script>
    import Highcharts from "highcharts";
    import "highcharts/modules/accessibility";

    let { data } = $props();

    let weekChartContainer;
    let dayChartContainer;

    $effect(() => {
        if (data && weekChartContainer) {
            renderWeekChart();
        }
        if (data && dayChartContainer) {
            renderDayChart();
        }
    });

    function renderWeekChart() {
        const weeksData = data.weeks || data.weekStats || data.weekly;

        if (!weeksData) {
            console.warn("WeekStats: No data found");
            return;
        }

        const seriesData = weeksData.map((item) => ({
            name: item._id,
            y: item.sum,
        }));

        Highcharts.chart(weekChartContainer, {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                margin: [0, 0, 0, 0],
                spacing: [0, 0, 0, 0],
            },
            title: { text: null },
            xAxis: {
                visible: false,
            },
            yAxis: {
                visible: false,
                title: { text: null },
            },
            legend: { enabled: false },
            tooltip: {
                formatter: function () {
                    return `<b>Week ${this.key}</b><br/>${this.y} films`;
                },
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    color: "#40bcf4",
                    pointPadding: 0,
                    groupPadding: 0.1,
                },
            },
            credits: { enabled: false },
            series: [
                {
                    data: seriesData,
                    name: "Films",
                },
            ],
        });
    }

    function renderDayChart() {
        // This function was originally here but DayOfWeekChart attempts to handle it.
        // If this component is supposed to handle both, I should clarify.
        // In page.svelte, I used <WeekStats> and <DayOfWeekChart>.
        // WeekStats only needs to handle the week chart.
        // But for debugging, I'll leave this empty or remove it to avoid confusion.
    }
</script>

<div class="chart-container weekChartcontainer">
    <div bind:this={weekChartContainer} class="weekChart"></div>
</div>

<div class="years" style="margin-top: 20px;">
    <span>Jan</span>
    <span>Dec</span>
</div>

<style>
    .weekChart {
        width: 100%;
        height: 100px;
    }
</style>
