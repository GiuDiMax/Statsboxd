<script>
    import { onMount } from "svelte";
    import jQuery from "jquery";
    import { baseUrl, tmdb_key } from "./config.js";
    import * as htmlToImage from "html-to-image";
    let { username } = $props();
    let loading = $state(true);
    let data = $state({});
    let message = $state("Error");
    let tmpdata = $state({});
    const year = 2025;
    var index = 0;
    const CORS = "https://worker.statsboxd.top/" + "cors?url=";

    async function getWrapped(yearData) {
        const resp = await fetch(baseUrl + "wrapped", {
            method: "POST",
            //headers: {"Accept-Encoding": "br"},
            body: JSON.stringify({ year: year, watched: yearData }),
        });
        return await resp.json();
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
            //console.log(data)
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
        //const element = jQuery(event.target)
        const element2 = jQuery(element.target);
        if (element2.data("tmdb") === undefined || element2.data("isLoaded")) {
            return;
        }
        const response = await fetch(
            "https://api.themoviedb.org/3/movie/" +
                element2.data("tmdb") +
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
            } else {
                if (lang !== "") {
                    await setTmdb2(element2);
                }
            }
        } else {
            jQuery(".tohide").addClass("hide");
        }
        element2.data("isLoaded", true);
    }

    function setFav2(obj) {
        let image =
            "https://a.ltrbxd.com/resized/" +
            obj["backdrop"]
                .replace(
                    "-480-480-270-270-crop-000000",
                    "-960-960-540-540-crop-000000",
                )
                .replace(
                    "-1920-1920-1080-1080-crop-000000",
                    "-960-960-540-540-crop-000000",
                )
                .replace(
                    "-1200-1200-675-657-crop-000000",
                    "-960-960-540-540-crop-000000",
                ) +
            ".jpg";
        //image = `${image}?cache_buster=${Date.now()}`;
        jQuery("#backdropimg").attr("src", image);
        jQuery("#favMovie").text(obj["name"]);
    }

    const fetchProfileImage = (i, tmdbId) => {
        jQuery.ajax({
            dataType: "json",
            type: "get",
            url: `https://api.themoviedb.org/3/person/${tmdbId}?api_key=${tmdb_key}`,
            success: function (data) {
                if (data.profile_path) {
                    const imgUrl = `https://www.themoviedb.org/t/p/w235_and_h235_face${data.profile_path}`;
                    jQuery(`#top${i}`).attr("src", imgUrl);
                }
            },
            error: function (err) {
                console.error("Error fetching profile image:", err);
            },
        });
    };

    function CORSimage(id) {
        let image = jQuery("#" + id).attr("src");
        if (image.includes(CORS)) {
            return;
        }
        image = CORS + image;
        jQuery("#" + id).attr("src", image);
    }

    function init(data) {
        setFav2(data["fav"][index]);
        const links = document.querySelectorAll(
            'link[href*="Material+Symbols+Outlined"], link[href*="Material+Symbols+Rounded"]',
        );
        links.forEach((link) => link.remove());
        var scale = document.documentElement.clientHeight / 1280;
        const scale2 = document.documentElement.clientWidth / 720;
        if (scale2 < scale) {
            scale = scale2;
        }
        jQuery("#wpcontainer").css("transform", "scale(" + scale + ")");
        jQuery("#wpcontainer").css("-moz-transform", "scale(" + scale + ")");
        jQuery("#wpcontainer").css("-webkit-transform", "scale(" + scale + ")");

        ["Actor", "Director"].forEach((i) => {
            const tmdbId = data[i][0].tmdb;
            fetchProfileImage(i, tmdbId);
        });

        jQuery("#hideChangeBtn").click(function () {
            jQuery(".tohide").addClass("hide");
        });
        jQuery("#btndownload").click(async function () {
            jQuery(".tohide").addClass("hide");
            jQuery("#loader").show();

            const node = document.getElementById("wrapped");
            const options = {
                quality: 0.9,
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
            };

            try {
                ["backdropimg", "topActor", "topDirector"].forEach((i) => {
                    CORSimage(i);
                });
                // First attempt with default settings (includes font embedding)
                const dataUrl = await htmlToImage.toJpeg(node, options);
                downloadImage(dataUrl);
            } catch (error) {
                console.error(
                    "First download attempt failed, retrying without font embedding...",
                    error,
                );
                try {
                    // Second attempt without font embedding (bypasses problematic CSS scanning)
                    const dataUrl = await htmlToImage.toJpeg(node, {
                        ...options,
                        fontEmbedCSS: "",
                    });
                    downloadImage(dataUrl);
                } catch (err) {
                    console.error("Second download attempt failed:", err);
                    jQuery(".tohide").removeClass("hide");
                    jQuery("#loader").hide();
                    alert("Error! Please do a screenshot");
                }
            }
        });

        function downloadImage(dataUrl) {
            var link = document.createElement("a");
            link.download = "collage.jpg";
            link.href = dataUrl;
            link.click();
            jQuery(".tohide").removeClass("hide");
            jQuery("#loader").hide();
        }

        jQuery("#changeFilm").on("click", function () {
            index = index + 1;
            if (index >= data["fav"].length) {
                index = 0;
            }
            setFav2(data["fav"][index]);
        });

        jQuery("#loader").hide();

        jQuery(window).on("load", function () {
            //jQuery('#loader').hide()
        });
    }

    async function preInit() {
        try {
            let localStorageData = localStorage.getItem(
                username.toLowerCase() + "_" + year.toString() + "_wrapped",
            );
            if (localStorageData !== null && localStorageData !== "undefined") {
                console.log("Read Storage Stats Data");
                data = await JSON.parse(localStorageData);
                message = undefined;
                loading = false;
                return;
            }
            localStorageData = localStorage.getItem(username.toLowerCase());
            if (localStorageData !== null && localStorageData !== "undefined") {
                console.log("Read Storage User Data");
                tmpdata = JSON.parse(localStorageData);
                const yearData = tmpdata["watched"]
                    .map((item) => {
                        const filteredDates = item.d.filter((d) => {
                            const aYear = new Date(d.date).getFullYear();
                            return aYear === year;
                        });
                        if (filteredDates.length > 0) {
                            return { ...item, d: filteredDates };
                        }
                    })
                    .filter(Boolean);
                data = await getWrapped(yearData);
                data = data[0];
                localStorage.setItem(
                    username.toLowerCase() + "_" + year.toString() + "_wrapped",
                    JSON.stringify(data),
                );
                message = undefined;
            }
        } catch (error) {
            console.log(error);
            message =
                "There is an error, please contact me on <a href='https://t.me/giudimax' target='_blank'>telegram" +
                " and send me your zip file</a><br/>";
        }
    }

    onMount(async () => {
        await preInit();
        console.log(data);
        data.runtime = data.tot[0].runtime;
        data.films = data.tot[0].films;
        data.countries = data.countries[0].value;
        data.theme = data.theme[0].name.replace("  ", " ");
        init(data);
        loading = false;
    });
</script>

<main>
    <div class="loaderContainer2" id="loader"><div class="loader2"></div></div>
    <section class="bgblackwrapped" id="bodymain">
        <section id="wpcontainer" class="wrappedContainer">
            <div class="loaderContainer2" id="loader">
                <div class="loaderContainer"><span class="loader"></span></div>
            </div>
            <div id="wrapped" class="wrapped collage">
                <div class="">
                    <div class="changeCloseContainer tohide wrappedContainer">
                        <div class="changeclose">
                            <span
                                role="button"
                                tabindex="0"
                                class="changebtn plantext"
                                id="changeFilm">Change fav film</span
                            >
                            <span
                                role="button"
                                tabindex="0"
                                class="changebtn plantext"
                                id="hideChangeBtn">Hide this box</span
                            >
                            <span
                                role="button"
                                tabindex="0"
                                style="color:white;"
                                class="changebtn plantext"
                                id="btndownload">HQ Download</span
                            >
                        </div>
                    </div>
                    <div class="bottomContainer">
                        <div class="bottom">
                            <img src="images/logo.webp" alt="logo" />
                            <div class="firma">
                                <div class="bold">Wrapped {year}</div>
                                <div class="link">
                                    letterboxd.com/{username}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="backdrop">
                        <img
                            id="backdropimg"
                            src="images/mask.webp"
                            alt="backdrop"
                        />
                    </div>
                    <div class="shadow" style="display:none;"></div>
                    <div class="container">
                        <div class="row row1">
                            <div class="plantext">FAVORITE {year} FILM:</div>
                        </div>
                        <div id="favMovie" class="favMovie"></div>

                        <div class="columns" style="margin-top: 2.7rem;">
                            {#each ["Actor", "Director"] as i}
                                <div class="column">
                                    <div class="plantext">
                                        Most Watched {#if i === "Actor"}Star{:else}{i}{/if}s
                                    </div>
                                    <img
                                        id="top{i}"
                                        src={`/images/${i.toLowerCase()}.jpg`}
                                        alt={`top${i}`}
                                    />
                                    {#each data[i] as x}
                                        <div class="namebox">
                                            <span class="name">{x.name}</span>
                                            <span class="num">{x.sum} logs</span
                                            >
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>

                        <div class="columns" style="margin-top: 3.5rem;">
                            <div class="column" style="gap:1.4rem;">
                                <div class="namebox namebox2">
                                    <span class="name">{data.films}</span>
                                    <span class="num">FILMS</span>
                                </div>
                                <div class="namebox namebox2">
                                    <span class="name">{data.runtime}</span>
                                    <span class="num">MINUTES</span>
                                </div>
                                <div class="namebox namebox2">
                                    <span class="name">{data.countries}</span>
                                    <span class="num">COUNTRIES</span>
                                </div>
                            </div>
                            <div class="column">
                                <div class="namebox namebox3">
                                    <span class="num">MOST WATCHED THEME</span>
                                    <span class="name">{data.theme}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
</main>
