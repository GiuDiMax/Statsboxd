<script>
    import { onMount } from "svelte";
    import jQuery from "jquery";
    import { baseUrl, tmdb_key } from "./config.js";
    import * as htmlToImage from "html-to-image";
    let { username, year, month } = $props();
    let loading = $state(true);
    let data = $state({});

    function getMonthName(monthNumber) {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        if (monthNumber >= 1 && monthNumber <= 12) {
            return months[monthNumber - 1];
        } else {
            return "";
        }
    }

    function getValues(arr) {
        try {
            return arr.values();
        } catch {}
        return [];
    }

    async function getCollage(username, year, month) {
        if (!(year > 0)) {
            year = "";
        }
        if (!(month > 0)) {
            month = "";
        }

        try {
            const localStorageData = localStorage.getItem(
                username.toLowerCase(),
            );
            if (localStorageData !== null && localStorageData !== "undefined") {
                const tmpdata = JSON.parse(localStorageData);
                const targetYear = parseInt(year);
                const targetMonth = parseInt(month);
                const filteredWatched = tmpdata["watched"]
                    .map((item) => {
                        const filteredDates = item.d.filter((d) => {
                            const dateObj = new Date(d.date);
                            return (
                                dateObj.getFullYear() === targetYear &&
                                dateObj.getMonth() + 1 === targetMonth
                            );
                        });
                        if (filteredDates.length > 0) {
                            return { ...item, d: filteredDates };
                        }
                    })
                    .filter(Boolean);

                const resp = await fetch(
                    baseUrl +
                        "collage/" +
                        username +
                        "?year=" +
                        year +
                        "&month=" +
                        month,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            year: targetYear,
                            month: targetMonth,
                            watched: filteredWatched,
                        }),
                    },
                );
                let result = await resp.json();
                if (Array.isArray(result)) {
                    result = result[0];
                }
                return result;
            }
        } catch (e) {
            // console.error("Error in POST collage", e);
        }

        const resp = await fetch(
            baseUrl +
                "collage/" +
                username +
                "?year=" +
                year +
                "&month=" +
                month,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            },
        );
        return resp.json();
    }

    async function setTmdb2(element2) {
        //const element = jQuery(event.target)
        if (element2.data("tmdb") === undefined || element2.data("isLoaded")) {
            return;
        }
        const response = await fetch(
            "https://api.themoviedb.org/3/movie/" +
                element2.data("tmdb") +
                "?api_key=" +
                tmdb_key,
        );
        if (response.ok) {
            const data = await response.json();
            if (data.hasOwnProperty("poster_path")) {
                element2.attr(
                    "src",
                    "https://image.tmdb.org/t/p/w185/" + data["poster_path"],
                );
                element2.parent().addClass("imgok");
                //element2.css('height', '278px')
            } else {
                element2.css("height", "278px");
            }
        }
    }

    async function handleImageError() {
        jQuery(event.target).parent().removeClass("imgok").addClass("notok");
        jQuery(event.target).attr("src", "images/poster.jpg");
    }

    async function setTmdb(element, event, lang = "&language=en") {
        const element2 = jQuery(element.target);
        let m_t = "";
        let code = "";
        if (element2.data("isLoaded")) {
            return;
        }
        if (element2.data("tmdb") !== undefined) {
            m_t = "movie";
            code = element2.data("tmdb");
        } else if (element2.data("tmdb_tv") !== undefined) {
            m_t = "tv";
            code = element2.data("tmdb_tv");
        } else {
            return;
        }
        const response = await fetch(
            "https://api.themoviedb.org/3/" +
                m_t +
                "/" +
                code +
                "/images?api_key=" +
                tmdb_key +
                lang,
        );
        if (response.ok) {
            const data = await response.json();
            if (data["posters"].length > 0) {
                element2.attr(
                    "src",
                    "https://image.tmdb.org/t/p/w185/" +
                        data["posters"][0]["file_path"],
                );
                element2.parent().addClass("imgok");
            } else if (lang !== "") {
                await setTmdb2(element2);
            }
        } else {
            element2.removeAttr("crossorigin");
            element2.attr("src", element2.data("lbd"));
            element2.parent().addClass("imgok");
            jQuery(".tohide").addClass("hide");
        }
        element2.data("isLoaded", true);
    }

    function init(data) {
        const wpcontainer = jQuery("#wpcontainer");
        const loader = jQuery("#loader");
        const tohide = jQuery(".tohide");

        var scale = document.documentElement.clientHeight / 1280;
        const scale2 = document.documentElement.clientWidth / 720;
        if (scale2 < scale) {
            scale = scale2;
        }
        wpcontainer.css({
            transform: "scale(" + scale + ")",
            "-moz-transform": "scale(" + scale + ")",
            "-webkit-transform": "scale(" + scale + ")",
        });
        const n = data.ids.length;
        var d = Math.sqrt(n);
        d = Math.ceil(d);
        if (d < 3) {
            d = 3;
        }
        jQuery(".posters").css(
            "grid-template-columns",
            "repeat(" + d + ", 1fr)",
        );
        loader.hide();

        jQuery("#hideChangeBtn").click(function () {
            tohide.addClass("hide");
        });

        jQuery("#btndownload").click(async function () {
            tohide.addClass("hide");
            loader.show();

            // Remove problematic Google Fonts links that cause html-to-image to crash
            const links = document.querySelectorAll(
                'link[href*="Material+Symbols+Outlined"], link[href*="Material+Symbols+Rounded"]',
            );
            links.forEach((link) => link.remove());

            const node = document.getElementById("wrapped");
            const options = {
                quality: 0.9,
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
            };

            try {
                // First attempt with default settings (includes font embedding)
                const dataUrl = await htmlToImage.toJpeg(node, options);
                downloadImage(dataUrl);
            } catch (error) {
                // console.error(
                //     "First download attempt failed, retrying without font embedding...",
                //     error,
                // );
                try {
                    // Second attempt without font embedding (bypasses problematic CSS scanning)
                    jQuery(
                        "#wrapped .title, #wrapped .containertextimg span",
                    ).css("font-weight", "bold");
                    const dataUrl = await htmlToImage.toJpeg(node, {
                        ...options,
                        fontEmbedCSS: "",
                    });
                    downloadImage(dataUrl);
                } catch (err) {
                    console.error("Second download attempt failed:", err);
                    tohide.removeClass("hide");
                    loader.hide();
                    alert("Error! Please do a screenshot");
                } finally {
                    jQuery(
                        "#wrapped .title, #wrapped .containertextimg span",
                    ).css("font-weight", "");
                }
            }
        });

        function downloadImage(dataUrl) {
            console.log("OK!");
            var link = document.createElement("a");
            link.download = "collage.jpg";
            link.href = dataUrl;
            link.click();
            tohide.removeClass("hide");
            loader.hide();
        }
    }

    onMount(async () => {
        data = await getCollage(username, year, month);
        init(data);
        loading = false;
    });
</script>

<main>
    {#if loading}<div class="loaderContainer2">
            <div class="loader2"></div>
        </div>{/if}
    <section class="bgblackwrapped" id="bodymain">
        <section id="wpcontainer" class="wrappedContainer">
            <div class="loaderContainer2" id="loader">
                <div class="loaderContainer"><span class="loader"></span></div>
            </div>
            <div id="wrapped" class="wrapped collage">
                <div class="contentcollage">
                    <div class="changeCloseContainer tohide collageContainer">
                        <div class="changeclose">
                            <span
                                role="button"
                                tabindex="0"
                                class="changebtn plantext"
                                id="hideChangeBtn">Hide this box</span
                            >
                            <span
                                role="button"
                                tabindex="0"
                                style="margin-left:1rem; color:white;"
                                class="changebtn plantext"
                                id="btndownload">HQ Download</span
                            >
                        </div>
                    </div>
                    <div class="title">
                        {getMonthName(data.c_month)}
                        {data.c_year}
                    </div>
                    <div class="posters">
                        {#each getValues(data.ids) as item}
                            <div class="poster2">
                                <div class="imgContainer">
                                    <div class="containertextimg">
                                        <span>{item.name}</span>
                                    </div>
                                    <img
                                        class="image tmdbimg"
                                        onload={setTmdb}
                                        onerror={handleImageError}
                                        src="images/posterbig.webp"
                                        data-tmdb={item.tmdb}
                                        data-tmdb_tv={item.tmdb_tv}
                                        data-lbd={item.poster}
                                        alt={item.name}
                                        crossorigin="anonymous"
                                    />
                                </div>
                                <span class="stars">
                                    {#if item.hasOwnProperty("r")}
                                        {#each Array.from({ length: parseInt(item.r) }, (_, i) => i) as i}
                                            <img
                                                class="star icon"
                                                src="images/star.svg"
                                                alt="star"
                                            />
                                        {/each}
                                        {#if item.r > parseInt(item.r)}
                                            <img
                                                class="star icon"
                                                src="images/half.svg"
                                                alt="half star"
                                            />
                                        {/if}
                                    {/if}
                                    {#if item.hasOwnProperty("like")}{#if item.like}
                                            <img
                                                class="star icon"
                                                style="position: relative;top: 0.05em;"
                                                src="images/like.svg"
                                                alt="like"
                                            />
                                        {/if}{/if}
                                    {#if item.hasOwnProperty("rewatch")}{#if item.rewatch}
                                            <img
                                                class="star icon"
                                                src="images/rewatch.svg"
                                                alt="rewatch"
                                            />
                                        {/if}{/if}
                                </span>
                            </div>
                        {/each}
                    </div>
                    <div class="logocontainer">
                        <img src="images/logo.webp" alt="statsboxd" />
                    </div>
                </div>
            </div>
        </section>
    </section>
</main>
