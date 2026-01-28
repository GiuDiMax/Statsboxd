<script>
    import { onMount } from "svelte";
    import jsVectorMap from "jsvectormap/dist/jsvectormap.js";
    import "jsvectormap/dist/maps/world.js";
    import "jsvectormap/dist/jsvectormap.css";
    import { getUri, lbdurl } from "../helpers.js";

    let { data, year, yearnum } = $props();
    let mapContainer = $state();

    onMount(() => {
        if (!mapContainer) return;

        let worldData = {};
        data.mw_countries.forEach((item) => {
            worldData[item._id] = item.sum;
        });
        let worldDataUri = {};
        data.mw_countries.forEach((item) => {
            worldDataUri[item._id] = getUri(item.name);
        });
        let worldDataName = {};
        data.mw_countries.forEach((item) => {
            worldDataName[item._id] = item.name;
        });

        new jsVectorMap({
            selector: mapContainer,
            map: "world",
            visualizeData: { values: worldData, scale: ["#007834", "#00e054"] },
            regionStyle: {
                initial: { fill: "#303c44" },
                hover: { fill: "#40bcf4" },
            },
            showTooltip: true,
            onRegionTooltipShow: function (event, tooltip, code) {
                let value = 0;
                let country = tooltip.text();
                if (typeof worldData[code] !== "undefined") {
                    value = worldData[code];
                    country = worldDataName[code];
                }
                tooltip.text(
                    '<div class="box"><span class="ttTitle">' +
                        country +
                        "</span>" +
                        '<span class="ttSubtitle">Films watched: ' +
                        value +
                        "</span>" +
                        '</div><div class="ttPointer"></div>',
                    true,
                );
            },
            onRegionClick: function (e, code) {
                // Determine if mobile - simplified for now
                const isMobile = window.innerWidth <= 768;
                if (!isMobile) {
                    clickMap(code);
                }
            },
        });

        function clickMap(code) {
            if (typeof worldDataUri[code] !== "undefined") {
                if (year === "") {
                    window.open(
                        lbdurl +
                            data.username +
                            "/films/country/" +
                            worldDataUri[code] +
                            "/",
                        "_blank",
                    );
                } else {
                    window.open(
                        lbdurl +
                            data.username +
                            "/films/diary/for/" +
                            yearnum +
                            "/country/" +
                            worldDataUri[code] +
                            "/by/rating",
                        "_blank",
                    );
                }
            }
        }
    });
</script>

<div class="worldmap noselect" bind:this={mapContainer}></div>

<style>
    .worldmap {
        width: 100%;
        height: 400px;
    }
</style>
