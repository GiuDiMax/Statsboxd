<script>
    import Highcharts from "highcharts";
    import "highcharts/modules/accessibility";

    let { data, year } = $props();

    let currentYearContainer;
    let rewatchContainer;
    let reviewsContainer;

    $effect(() => {
        if (data) {
            renderCurrentYearPie();
            renderRewatchPie();
            renderReviewsPie();
        }
    });

    // Determine data structure
    function getPieData(type) {
        // Flat structure mapping
        if (data[type] && Array.isArray(data[type])) return data[type];

        // type: 'currentYear', 'rewatch', 'reviews'
        if (data.pie && data.pie[type]) return data.pie[type];
        if (data[type + "Pie"]) return data[type + "Pie"];
        return null;
    }

    const commonOptions = {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            margin: [0, 0, 0, 0],
            spacing: [0, 0, 0, 0],
            height: 150, // Increased from 100
            width: 150, // Increased from 100
        },
        title: { text: null },
        credits: { enabled: false },
        tooltip: { pointFormat: "<b>{point.name}</b>: {point.y}" },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                dataLabels: { enabled: false },
                innerSize: "50%", // Donut style looks better usually, but sticking to Full pie if requested. User image showed full pie.
                borderWidth: 0,
            },
        },
    };

    function renderCurrentYearPie() {
        if (!currentYearContainer) return;

        let seriesData = [];
        // Handle array or scalar
        if (Array.isArray(data.currentYear)) {
            seriesData = data.currentYear;
        } else if (
            typeof data.currentYear === "number" &&
            typeof data.total === "number"
        ) {
            seriesData = [
                { name: "Releases", y: data.currentYear },
                { name: "Older", y: data.total - data.currentYear },
            ];
        } else {
            // Fallback to getPieData logic if needed, but scalar seems most likely given user feedback
            let tmp = getPieData("currentYear");
            if (tmp) seriesData = tmp;
            else return;
        }

        Highcharts.chart(currentYearContainer, {
            ...commonOptions,
            series: [
                {
                    name: "Releases",
                    colorByPoint: true,
                    data: seriesData,
                    colors: ["#00e054", "#445566"],
                },
            ],
        });
    }

    function renderRewatchPie() {
        if (!rewatchContainer) return;

        let seriesData = [];
        if (Array.isArray(data.rewatch)) {
            seriesData = data.rewatch;
        } else if (
            typeof data.rewatch === "number" &&
            typeof data.total === "number"
        ) {
            // Rewatch is usually subset.
            // Logic: Watches (New) = Total - Rewatch. Re-watches = Rewatch.
            seriesData = [
                { name: "Watches", y: data.total - data.rewatch },
                { name: "Re-watches", y: data.rewatch },
            ];
        } else {
            let tmp = getPieData("rewatch");
            if (tmp) seriesData = tmp;
            else {
                console.log("No rewatch data for pie");
                return;
            }
        }

        Highcharts.chart(rewatchContainer, {
            ...commonOptions,
            series: [
                {
                    name: "Rewatch",
                    colorByPoint: true,
                    data: seriesData,
                    colors: ["#00e054", "#445566"], // Matches legend: Green=Watches, Gray=Rewatch ?
                    // Legend says: Green=Watches, Gray=Rewatch
                    // So index 0 (Watches) should be green #00e054. Index 1 (Re-watches) should be #445566.
                    // My data order: Watches, Rewatch.
                    // Color array order: Green, Gray.
                    // Correct.
                },
            ],
        });
    }

    function renderReviewsPie() {
        if (!reviewsContainer) return;

        let seriesData = [];
        if (Array.isArray(data.reviews)) {
            seriesData = data.reviews;
        } else if (
            typeof data.reviews === "number" &&
            typeof data.total === "number"
        ) {
            seriesData = [
                { name: "Reviewed", y: data.reviews },
                { name: "Not Reviewed", y: data.total - data.reviews },
            ];
        } else {
            let tmp = getPieData("reviews");
            if (tmp) seriesData = tmp;
            else return;
        }

        Highcharts.chart(reviewsContainer, {
            ...commonOptions,
            series: [
                {
                    name: "Reviews",
                    colorByPoint: true,
                    data: seriesData,
                    colors: ["#00e054", "#445566"],
                    // Legend: Green=Reviewed, Gray=Not Reviewed
                },
            ],
        });
    }
</script>

<div class="piecharts">
    <div class="piechart">
        <div class="legend">
            <span class="green">{year} Releases</span>
            <span class="">Older</span>
        </div>
        <div bind:this={currentYearContainer} class="piech2"></div>
    </div>
    <div class="piechart">
        <div class="legend">
            <span class="green">Watches</span>
            <span class="">Re-watches</span>
        </div>
        <div bind:this={rewatchContainer} class="piech2"></div>
    </div>
    <div class="piechart">
        <div class="legend">
            <span class="green">Reviewed</span>
            <span class="">Not Reviewed</span>
        </div>
        <div bind:this={reviewsContainer} class="piech2"></div>
    </div>
</div>
