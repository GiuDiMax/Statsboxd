<script>
    import { onMount } from "svelte";
    import { useLazyImage as lazyImage } from "svelte-lazy-image";
    import { roles, tmdb_key, lbdurl } from "./config.js";
    import {
        elementAt,
        replaceDash,
        getUri,
        ifNoneThenZero,
        numToStars,
        getValues,
        formatDate1,
        getSlice,
        ifThenElse,
        replaceSize,
        getWeek,
        fillArray,
        getWeeksInYear,
        last,
        arrayLength,
    } from "./helpers.js";

    // Components
    import Header from "./components/Header.svelte";
    import YearSelector from "./components/YearSelector.svelte";
    import SectionHeader from "./components/SectionHeader.svelte";
    import Poster from "./components/Poster.svelte";
    import FilmItem from "./components/FilmItem.svelte";
    import PersonItem from "./components/PersonItem.svelte";
    import ReleaseYearChart from "./components/ReleaseYearChart.svelte";
    import WorldMap from "./components/WorldMap.svelte";

    let { data, year, yearnum } = $props();

    let showYears = $state(false);
    let isMobile = $state(false);
    let current_month = $state();
    let current_week = $state();

    // Section visibility states
    let activeReleaseYearTab = $state("releaseYear"); // 'releaseYear', 'ratingYear', 'diaryYear'
    let activeHRFTab = $state("currentYearHRF"); // 'currentYearHRF', 'pastYearHRF'
    let activeGCLTab = $state("MWGCL"); // 'MWGCL', 'HRGCL'
    let activeTNTab = $state("MWTN"); // 'MWTN', 'HRTN'
    let activeCollectionTab = $state("complete"); // 'complete', 'almost'

    // People and Crew tabs
    let activeActorTab = $state("Watch"); // 'Watch', 'Rat'
    let activeDirectorTab = $state("Watch"); // 'Watch', 'Rat'
    let activeCrewTab = $state("mw"); // 'mw', 'tr'

    // See more states
    let actorSeeMore = $state(false);
    let directorSeeMore = $state(false);
    let crewSeeMore = $state(false);

    const currentYear = new Date().getFullYear();
    const todayx = new Date();
    const previousMonth = new Date(
        todayx.getFullYear(),
        todayx.getMonth() - 1,
        1,
    );

    $effect(() => {
        if (currentYear === yearnum) {
            const today = new Date();
            current_week = getISOWeek(today);
            current_month = today.getUTCMonth() + 1;
        } else {
            current_month = 12;
            current_week = 52;
        }
    });

    // Replace the generic jQuery clickableFunction
    function setActiveTab(section, value) {
        if (section === "releaseYear") activeReleaseYearTab = value;
        if (section === "hrf") activeHRFTab = value;
        if (section === "gcl") activeGCLTab = value;
        if (section === "tn") activeTNTab = value;
        if (section === "collections") activeCollectionTab = value;
        if (section === "actor") activeActorTab = value;
        if (section === "director") activeDirectorTab = value;
        if (section === "crew") activeCrewTab = value;
    }

    async function setTmdb(imgElement) {
        if (!imgElement) return;
        const tmdbId = imgElement.dataset.tmdb;
        const isLoaded = imgElement.dataset.isLoaded;
        if (!tmdbId || isLoaded) return;

        try {
            const response = await fetch(
                "https://api.themoviedb.org/3/person/" +
                    tmdbId +
                    "?api_key=" +
                    tmdb_key,
            );
            if (response.ok) {
                const data = await response.json();
                if (data.profile_path !== null) {
                    imgElement.src =
                        "https://www.themoviedb.org/t/p/w235_and_h235_face/" +
                        data.profile_path;
                }
            }
            imgElement.dataset.isLoaded = "true";
        } catch (error) {
            console.error("Error fetching person data:", error);
        }
    }

    function setObserver() {
        const images = document.querySelectorAll(".holeperson");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTmdb(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0.1 },
        );
        images.forEach((img) => observer.observe(img));
    }

    function handleUpdate() {
        localStorage.clear();
        window.location.search = "";
    }

    onMount(() => {
        isMobile = window.innerWidth <= 768;
        setObserver();
    });

    // Utility for date-fns which wasn't fully imported in my helpers
    import { getISOWeek } from "date-fns";
</script>

{#snippet filmListSnippet(films, linkPrefix = "")}
    <div
        class="filmList {films === data['mostWatched']
            ? 'hideLast2'
            : 'hideLast'}"
    >
        {#each getValues(films) as element}
            {@const posterUri = element._id || element.uri}
            <FilmItem
                uri={posterUri}
                poster={element.img || element.poster}
                link={linkPrefix
                    ? `${linkPrefix}${posterUri}${linkPrefix.endsWith("activity") ? "" : ""}`
                    : `${lbdurl}film/${posterUri}`}
            >
                {#if films === data["mostWatched"]}
                    <span class="sottotitolo bigsotto"
                        >{element.sum || element.watches} times</span
                    >
                {:else if element.r !== undefined}
                    <span class="sottotitolo stelline"
                        >{numToStars(element.r)}</span
                    >
                    <span class="sottotitolo">vs {element.avg}</span>
                {/if}
            </FilmItem>
        {/each}
    </div>
{/snippet}

<!--{JSON.stringify(data._id, null, 2)}-->
<Header {data} />
<div class="content" id="content">
    <YearSelector {data} {year} />

    <section class="mainTitlesec">
        <div
            class="constraint {year !== ''
                ? 'constraint_full'
                : 'constraint_year'}"
        >
            <div class="mainT">
                {#if year === ""}
                    <h1 class="mainTitle">A Life in Film</h1>
                {:else}
                    <h1 class="mainTitle yearTitle">{yearnum}</h1>
                {/if}
            </div>
            <svg
                class="pattern -left"
                height="390"
                role="presentation"
                viewBox="0 0 320 390"
                width="320"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(318 70)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="86"
                        ></rect>
                        <rect fill="#40BCF4" height="77" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="202"
                        ></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="238"
                        ></rect>
                    </g>
                    <g transform="translate(298 121)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="55"
                        ></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="22"
                            rx="2"
                            width="4"
                            y="169"
                        ></rect>
                    </g>
                    <g transform="translate(278 111)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="66"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="52"
                            rx="2"
                            width="4"
                            y="152"
                        ></rect>
                    </g>
                    <g transform="translate(258 84)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="78"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="52"
                            rx="2"
                            width="4"
                            y="201"
                        ></rect>
                        <rect fill="#40BCF4" height="60" rx="2" width="4"
                        ></rect>
                    </g>
                    <g transform="translate(238 80)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="96"
                        ></rect>
                        <rect fill="#00E054" height="20" rx="2" width="4" y="68"
                        ></rect>
                        <rect fill="#40BCF4" height="47" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="212"
                        ></rect>
                    </g>
                    <g transform="translate(218 96)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="48"
                        ></rect>
                        <rect fill="#40BCF4" height="18" rx="2" width="4" y="12"
                        ></rect>
                        <rect fill="#40BCF4" height="4" rx="2" width="4"></rect>
                        <rect
                            fill="#FF8000"
                            height="22"
                            rx="2"
                            width="4"
                            y="144"
                        ></rect>
                    </g>
                    <g transform="translate(198 111)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="46"
                        ></rect>
                        <rect fill="#00E054" height="4" rx="2" width="4" y="114"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="42"
                            rx="2"
                            width="4"
                            y="142"
                        ></rect>
                    </g>
                    <g transform="translate(178 40)">
                        <rect
                            fill="#00E054"
                            height="100"
                            rx="2"
                            width="4"
                            y="102"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="12"
                            rx="2"
                            width="4"
                            y="210"
                        ></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"
                        ></rect>
                    </g>
                    <g transform="translate(158 86)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="132"
                        ></rect>
                    </g>
                    <g transform="translate(138 86)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="132"
                        ></rect>
                    </g>
                    <g transform="translate(118 111)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="132"
                        ></rect>
                    </g>
                    <g transform="translate(98 82)">
                        <rect
                            fill="#00E054"
                            height="100"
                            rx="2"
                            width="4"
                            y="102"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="12"
                            rx="2"
                            width="4"
                            y="210"
                        ></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"
                        ></rect>
                    </g>
                    <g transform="translate(78 74)">
                        <rect
                            fill="#00E054"
                            height="170"
                            rx="2"
                            width="4"
                            y="51"
                        ></rect>
                        <rect fill="#40BCF4" height="4" rx="2" width="4"></rect>
                        <rect fill="#40BCF4" height="20" rx="2" width="4" y="23"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="34"
                            rx="2"
                            width="4"
                            y="246"
                        ></rect>
                    </g>
                    <g transform="translate(58 127)">
                        <rect fill="#00E054" height="40" rx="2" width="4" y="64"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="74"
                            rx="2"
                            width="4"
                            y="144"
                        ></rect>
                        <rect fill="#40BCF4" height="20" rx="2" width="4"
                        ></rect>
                    </g>
                    <g transform="translate(38 77)">
                        <rect
                            fill="#00E054"
                            height="90"
                            rx="2"
                            width="4"
                            y="104"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="64"
                            rx="2"
                            width="4"
                            y="204"
                        ></rect>
                        <rect fill="#40BCF4" height="24" rx="2" width="4"
                        ></rect>
                        <rect fill="#40BCF4" height="50" rx="2" width="4" y="32"
                        ></rect>
                    </g>
                    <g transform="translate(18 117)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="84"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="44"
                            rx="2"
                            width="4"
                            y="184"
                        ></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="232"
                        ></rect>
                        <rect fill="#40BCF4" height="30" rx="2" width="4"
                        ></rect>
                    </g>
                    <g transform="translate(-2 127)">
                        <rect fill="#00E054" height="76" rx="2" width="4" y="42"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="44"
                            rx="2"
                            width="4"
                            y="194"
                        ></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"
                        ></rect>
                    </g>
                </g>
            </svg>
            <svg
                class="pattern -right"
                height="390"
                role="presentation"
                viewBox="0 0 320 390"
                width="320"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(318 63)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="67"
                        ></rect>
                        <rect fill="#40BCF4" height="58" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="62"
                            rx="2"
                            width="4"
                            y="172"
                        ></rect>
                    </g>
                    <g transform="translate(298 88)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="59"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="42"
                            rx="2"
                            width="4"
                            y="162"
                        ></rect>
                    </g>
                    <g transform="translate(278 78)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="86"
                        ></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="60"
                            rx="2"
                            width="4"
                            y="174"
                        ></rect>
                    </g>
                    <g transform="translate(258 94)">
                        <rect fill="#00E054" height="99" rx="2" width="4" y="70"
                        ></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="30"
                            rx="2"
                            width="4"
                            y="196"
                        ></rect>
                    </g>
                    <g transform="translate(238 83)">
                        <rect
                            fill="#00E054"
                            height="80"
                            rx="2"
                            width="4"
                            y="104"
                        ></rect>
                        <rect fill="#40BCF4" height="58" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="192"
                        ></rect>
                    </g>
                    <g transform="translate(218 108)">
                        <rect fill="#00E054" height="40" rx="2" width="4" y="79"
                        ></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="62"
                            rx="2"
                            width="4"
                            y="152"
                        ></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="222"
                        ></rect>
                    </g>
                    <g transform="translate(198 78)">
                        <rect
                            fill="#00E054"
                            height="60"
                            rx="2"
                            width="4"
                            y="112"
                        ></rect>
                        <rect fill="#40BCF4" height="80" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="30"
                            rx="2"
                            width="4"
                            y="184"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="10"
                            rx="2"
                            width="4"
                            y="222"
                        ></rect>
                    </g>
                    <g transform="translate(178 64)">
                        <rect
                            fill="#00E054"
                            height="119"
                            rx="2"
                            width="4"
                            y="100"
                        ></rect>
                        <rect fill="#40BCF4" height="68" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="10"
                            rx="2"
                            width="4"
                            y="226"
                        ></rect>
                    </g>
                    <g transform="translate(158 91)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="88"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="184"
                        ></rect>
                    </g>
                    <g opacity=".8" transform="translate(138 100)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="63"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="82"
                            rx="2"
                            width="4"
                            y="138"
                        ></rect>
                    </g>
                    <g transform="translate(118 100)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="66"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="172"
                        ></rect>
                    </g>
                    <g transform="translate(98 110)">
                        <rect fill="#00E054" height="30" rx="2" width="4" y="66"
                        ></rect>
                        <rect fill="#40BCF4" height="38" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="42"
                            rx="2"
                            width="4"
                            y="131"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="12"
                            rx="2"
                            width="4"
                            y="182"
                        ></rect>
                    </g>
                    <g transform="translate(78 107)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="46"
                        ></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="32"
                            rx="2"
                            width="4"
                            y="149"
                        ></rect>
                    </g>
                    <g transform="translate(58 76)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="63"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4" y="18"
                        ></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="36"
                            rx="2"
                            width="4"
                            y="185"
                        ></rect>
                    </g>
                    <g transform="translate(38 39)">
                        <rect fill="#00E054" height="74" rx="2" width="4" y="83"
                        ></rect>
                        <rect fill="#40BCF4" height="77" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="22"
                            rx="2"
                            width="4"
                            y="214"
                        ></rect>
                    </g>
                    <g transform="translate(18 81)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="56"
                        ></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="42"
                            rx="2"
                            width="4"
                            y="172"
                        ></rect>
                    </g>
                    <g transform="translate(-2 101)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"
                        ></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"
                        ></rect>
                        <rect
                            fill="#FF8000"
                            height="72"
                            rx="2"
                            width="4"
                            y="124"
                        ></rect>
                    </g>
                </g>
            </svg>
        </div>
        <div class="mainTitlesecBak"></div>
        <div class="mainTitlesecFade"></div>
        {#if year === ""}
            <h3 class="arrowcheck">
                <!--Your last update: { data.update }. <br />-->
                Do you like the project? The server and domain have management costs.<br
                />
                Consider
                <a target="_blank" href="//ko-fi.com/giudimax">supporting me</a
                >.
                <!--Have you already donated?: <a href='https://t.me/giudimax' target='_blank'>contact me on Telegram</a>.-->
            </h3>
        {/if}
        <div class="mainSubtitle">
            <!--<a href="{ lbdurl }{ data.username }">
                <img alt="{ data.username }" class="avatar lazy" data-src="{ data.img }" src="images/poster.jpg" />
            </a>-->
            <span
                ><a
                    target="_blank"
                    class="clickable"
                    href="{lbdurl}{data.username}"
                >
                    {data.name}</a
                >'s
                {year === "" ? "all-time stats" : "year in review"}
            </span>
        </div>
        {#if year === ""}
            <div class="buttonstart">
                <span
                    role="button"
                    tabindex="0"
                    id="updatebtn"
                    onclick={handleUpdate}
                    onkeydown={(e) => e.key === "Enter" && handleUpdate()}
                    class="clickable seeallbutton updatebutton"
                >
                    <span class="material-symbols-rounded icon">sync</span
                    >Update
                </span>
                <!--<a
                    class="clickable seeallbutton updatebutton collagebutton"
                    href="/?username={data.username}&collage&year={previousMonth.getFullYear()}&month={previousMonth.getMonth() +
                        1}"
                    target="_blank"
                >
                    <span class="material-symbols-rounded icon">grid_on</span
                    >Last month collage
                </a>-->
                <!--<a
                    class="clickable seeallbutton updatebutton wrappedbutton"
                    href="/?username={data.username}&wrapped"
                    target="_blank"
                >
                    <span class="material-symbols-rounded icon">summarize</span
                    >2025 Wrapped
                </a>-->
                <a
                    class="clickable seeallbutton updatebutton recbutton"
                    href="/?username={data.username}&rec"
                    target="_blank"
                >
                    <span class="material-symbols-rounded icon">recommend</span
                    >Film Recommendation
                </a>
            </div>
        {/if}
        <div class="numbersStats">
            {#if year === ""}
                <a href="//letterboxd.com/{data.username}/films">
                    <span class="number">{data.totalFilms}</span>
                    <span class="text">Films</span>
                </a>
                <div>
                    <span class="number">{data.totalRuntime}</span>
                    <span class="text">Hours</span>
                </div>
                <div>
                    <span class="number">{data.totalDirectors}</span>
                    <span class="text">Directors</span>
                </div>
                <div>
                    <span class="number">{data.totalCountries}</span>
                    <span class="text">Countries</span>
                </div>
                {#if "streak" in data}
                    <a
                        href="//letterboxd.com/{data.username}/films/diary/for/{data[
                            'streak'
                        ].year}/{data['streak'].month}/"
                        class="mostrap1"
                    >
                        <div class="pannello p1">
                            <div class="testo">
                                At least one film per week, starting {data[
                                    "streak"
                                ].monthName}
                                {data["streak"].year}
                            </div>
                        </div>
                        <span class="number">{data["streak"].max}w</span>
                        <span class="text">Longest Streak</span>
                    </a>
                {/if}
                {#if "2+filmDays" in data}
                    <div>
                        <span class="number">{data["2+filmDays"]}</span>
                        <span class="text">2+ Film Days</span>
                    </div>
                {/if}
            {:else}
                <div>
                    <span class="number">{data.total}</span>
                    <span class="text">Diary Entries</span>
                </div>
                <!--            <div>-->
                <!--                <span class="number">{ data.likes }</span>-->
                <!--                <span class="text">Films liked</span>-->
                <!--            </div>-->
                <div>
                    <span class="number">{data.reviews}</span>
                    <span class="text">Reviews</span>
                </div>
                <div>
                    <span class="number">{data.totalRuntime}</span>
                    <span class="text">Hours</span>
                </div>
            {/if}
        </div>
    </section>
    {#if year === ""}
        <section class="sectionStats">
            <div class="sepline">
                <span>By release year</span>
                <div class="line"></div>
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeReleaseYearTab === 'releaseYear'
                        ? 'active'
                        : ''}"
                    onclick={() => setActiveTab("releaseYear", "releaseYear")}
                    onkeydown={(e) =>
                        e.key === "Enter" &&
                        setActiveTab("releaseYear", "releaseYear")}>Films</span
                >
                {#if data.ru}
                    <span
                        role="button"
                        tabindex="0"
                        class="clickable {activeReleaseYearTab === 'ratingYear'
                            ? 'active'
                            : ''}"
                        onclick={() =>
                            setActiveTab("releaseYear", "ratingYear")}
                        onkeydown={(e) =>
                            e.key === "Enter" &&
                            setActiveTab("releaseYear", "ratingYear")}
                        >Ratings</span
                    >
                {/if}
                {#if arrayLength(data["logsPerYear"]) > 0}
                    <span
                        role="button"
                        tabindex="0"
                        class="clickable {activeReleaseYearTab === 'diaryYear'
                            ? 'active'
                            : ''}"
                        onclick={() => setActiveTab("releaseYear", "diaryYear")}
                        onkeydown={(e) =>
                            e.key === "Enter" &&
                            setActiveTab("releaseYear", "diaryYear")}
                        >Diary</span
                    >
                {/if}
            </div>
            <div class="chart-container">
                <ReleaseYearChart {data} type={activeReleaseYearTab} />
            </div>
            {#if "years" in data}
                <div class="years">
                    {#if activeReleaseYearTab !== "diaryYear"}
                        <span class="years1">{data.years[0]._id}</span>
                        <span class="years1">{last(data.years)._id}</span>
                    {:else if data.logsPerYear.length > 0}
                        <span class="years2">{data.logsPerYear[0]._id}</span>
                        <span class="years2">{last(data.logsPerYear)._id}</span>
                    {/if}
                </div>
            {/if}
        </section>
        {#if data.ru}
            <section class="sectionStats">
                <div class="sepline">
                    <span>Highest rated decades</span>
                    <div class="line"></div>
                </div>
                {#each data.decades as element}
                    <div class="decade">
                        <div class="decadeLeft">
                            <a
                                href="//letterboxd.com/{data.username}/films/rated/.5-5/decade/{element._id}s/by/entry-rating/"
                                class="decadeTitle">{element._id}s</a
                            >
                            <div>
                                <img
                                    src="images/greystar.webp"
                                    alt="greystar"
                                /><span class="decadeAverage"
                                    >Average {element.avg}</span
                                >
                            </div>
                        </div>
                        <div class="decPosters">
                            {#each element.imgs as element2}
                                <Poster
                                    uri={element2.uri}
                                    poster={element2.img}
                                    width={105}
                                    height={70}
                                    className="decPosterImg"
                                />
                            {/each}
                        </div>
                    </div>
                {/each}
            </section>
        {/if}
    {:else}
        <!--DIARY SECTION -->
        {#if data.ru}
            <section class="sectionStats">
                <div class="sepline">
                    <span>Highest rated films</span>
                    <div class="line"></div>
                    <span
                        role="button"
                        tabindex="0"
                        class="clickable {activeHRFTab === 'currentYearHRF'
                            ? 'active'
                            : ''}"
                        onclick={() => setActiveTab("hrf", "currentYearHRF")}
                        onkeydown={(e) =>
                            e.key === "Enter" &&
                            setActiveTab("hrf", "currentYearHRF")}
                        >{yearnum}</span
                    >
                    <span
                        role="button"
                        tabindex="0"
                        class="clickable {activeHRFTab === 'pastYearHRF'
                            ? 'active'
                            : ''}"
                        onclick={() => setActiveTab("hrf", "pastYearHRF")}
                        onkeydown={(e) =>
                            e.key === "Enter" &&
                            setActiveTab("hrf", "pastYearHRF")}>Older</span
                    >
                </div>
                <div class="">
                    <div
                        class="secHRF filmList {activeHRFTab ===
                        'currentYearHRF'
                            ? ''
                            : 'hide'}"
                    >
                        {#each getValues(data.topRatedCurrentYear) as element}
                            <div class="singleFilm">
                                <Poster
                                    uri={element._id}
                                    poster={element.poster}
                                />
                                <div>
                                    <span class="sottotitolo stellineBig"
                                        >{numToStars(element.r)}</span
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div
                        class="secHRF filmList {activeHRFTab === 'pastYearHRF'
                            ? ''
                            : 'hide'}"
                    >
                        {#each getValues(data.topRatedOtherYears) as element}
                            <div class="singleFilm">
                                <Poster
                                    uri={element._id}
                                    poster={element.poster}
                                />
                                <div>
                                    <span class="sottotitolo stellineBig"
                                        >{numToStars(element.r)}</span
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </section>
        {/if}
        <section class="sectionStats">
            <SectionHeader title="By week" />
            <div class="chart-container weekChartcontainer">
                <div id="watchedWeek" class="weekChart"></div>
            </div>
            <div class="years">
                <span>Jan</span>
                <span>Dec</span>
            </div>
            <div class="watchedDivided">
                <div class="wd1">
                    <div class="wd1x">
                        <span class="big">{data.total}</span>
                        <span class="small">Films watched</span>
                    </div>
                    <img src="images/arrow.jpg" alt="arrow" />
                    <div class="wd1x">
                        <span class="big"
                            >{(data.total / current_month).toFixed(1)}</span
                        >
                        <span class="small">Average per month</span>
                    </div>
                    <img src="images/arrow.jpg" alt="arrow" />
                    <div class="wd1x">
                        <span class="big"
                            >{(data.total / current_week).toFixed(1)}</span
                        >
                        <span class="small">Average per week</span>
                    </div>
                </div>
                <div class="wd2">
                    <div id="watchedDayWeek" class="weekDayChart"></div>
                </div>
            </div>
        </section>
        <section class="sectionStats">
            <SectionHeader title="Milestones" />
            <div class="msy">
                <div class="msx msx1">
                    <span>First Film</span>
                    <FilmItem uri={data.first._id} poster={data.first.poster}>
                        <span class="sottotitolo bigsotto"
                            >{formatDate1(data.first.date)}</span
                        >
                    </FilmItem>
                </div>
                {#if data.milestones.length > 0}
                    <div class="msx msx2">
                        <span>Diary Milestones</span>
                        <div class="filmList mw2">
                            {#each getValues(getSlice(data.milestones, 0, 5)) as element, index}
                                <FilmItem
                                    uri={element._id}
                                    poster={element.poster}
                                    link="{lbdurl}{data.username}/film/{element._id}/activity"
                                >
                                    <span class="sottotitolo bigsotto"
                                        >{(index + 1) * 50}th
                                        <span
                                            class="sottotitolo_milestones hideMobile"
                                            >· {formatDate1(element.date)}</span
                                        >
                                    </span>
                                </FilmItem>
                            {/each}
                        </div>
                    </div>
                {/if}
                <div class="msx msx1">
                    <span>Last Film</span>
                    <FilmItem uri={data.last._id} poster={data.last.poster}>
                        <span class="sottotitolo bigsotto"
                            >{formatDate1(data.last.date)}</span
                        >
                    </FilmItem>
                </div>
            </div>
            {#if data.mostWatched.length > 0}
                <div class="msy">
                    <div class="msx msxfull">
                        <span>Most Watched</span>
                        <div class="filmList mw2">
                            {#each getValues(data.mostWatched) as element}
                                <FilmItem
                                    uri={element.uri}
                                    poster={element.poster}
                                    link="{lbdurl}{data.username}/film/{element.uri}/activity"
                                >
                                    <span class="sottotitolo bigsotto"
                                        >{element.sum} times</span
                                    >
                                </FilmItem>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        </section>
    {/if}
    <section class="sectionStats">
        <SectionHeader title="Genres, Countries & Languages">
            {#if data.ru}
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeGCLTab === 'MWGCL' ? 'active' : ''}"
                    onclick={() => setActiveTab("gcl", "MWGCL")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab("gcl", "MWGCL")}
                    >Most Watched</span
                >
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeGCLTab === 'HRGCL' ? 'active' : ''}"
                    onclick={() => setActiveTab("gcl", "HRGCL")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab("gcl", "HRGCL")}
                    >Highest Rated</span
                >
            {/if}
        </SectionHeader>
        <div
            class="attributes-chart threeColumns secGCL {activeGCLTab ===
            'MWGCL'
                ? ''
                : 'hide'}"
        >
            {#each [["genres", "genre", "rgb(0, 224, 84)"], ["countries", "country", "rgb(64, 188, 244)"], ["originallanguage", "language", "rgb(255, 128, 0)"]] as type}
                <div class="labels2">
                    <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                    {#each getValues(getSlice(data["mw_" + type[0]], 0, 10)) as element}
                        <div>
                            <a
                                class="clickable label1"
                                href="{lbdurl}{data.username}/films/{year !== ''
                                    ? 'diary/for/' + yearnum.toString() + '/'
                                    : ''}{type[1]}/{getUri(element['name'])}"
                            >
                                {element["name"]}
                            </a>
                            <div>
                                <div
                                    class="genresFilms"
                                    style="width: {(element['sum'] * 100) /
                                        data['mw_' + type[0]][0]['sum']}%;"
                                >
                                    <span>{element["sum"]} films</span>
                                </div>
                                <div
                                    class="progressBarWithVal"
                                    style="width:{(element['sum'] * 100) /
                                        data['mw_' + type[0]][0][
                                            'sum'
                                        ]}%; background-color:{type[2]};"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
        {#if data.ru}
            <div
                class="attributes-chart threeColumns secGCL {activeGCLTab ===
                'HRGCL'
                    ? ''
                    : 'hide'}"
            >
                {#each [["genres", "genre", "rgb(72, 255, 132)"], ["countries", "country", "rgb(116, 240, 255)"], ["originallanguage", "language", "rgb(255, 184, 96)"]] as type}
                    <div class="labels2">
                        {#each getValues(getSlice(data["tr_" + type[0]], 0, 10)) as element}
                            <div>
                                <a
                                    class="clickable label1"
                                    href="{lbdurl}{data.username}/films/{year !==
                                    ''
                                        ? 'diary/for/' + yearnum.toString()
                                        : ''}/rated/.5-5/{type[1]}/{getUri(
                                        element['name'],
                                    )}"
                                >
                                    {element["name"]}
                                </a>
                                <div>
                                    <div
                                        class="genresFilms"
                                        style="width: {(element['avg'] * 100) /
                                            data['tr_' + type[0]][0]['avg']}%;"
                                    >
                                        <span>Average: {element["avg"]}</span>
                                    </div>
                                    <div
                                        class="progressBarWithVal"
                                        style="width:{(element['avg'] * 100) /
                                            data['tr_' + type[0]][0][
                                                'avg'
                                            ]}%; background-color:{type[2]};"
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
                <div class="infoavg">
                    Themes and nanogenres with at least four rated films are
                    included.
                </div>
            </div>
        {/if}
    </section>
    <section class="sectionStats">
        <SectionHeader title="Themes & Nanogenres®">
            {#if data.ru}
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeTNTab === 'MWTN' ? 'active' : ''}"
                    onclick={() => setActiveTab("tn", "MWTN")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab("tn", "MWTN")}
                    >Most Watched</span
                >
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeTNTab === 'HRTN' ? 'active' : ''}"
                    onclick={() => setActiveTab("tn", "HRTN")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab("tn", "HRTN")}
                    >Highest Rated</span
                >
            {/if}
        </SectionHeader>
        <div
            class="attributes-chart twocolumn secTN {activeTNTab === 'MWTN'
                ? ''
                : 'hide'}"
        >
            {#each ["theme", "nanogenre"] as type}
                <div class="labels">
                    <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                    {#each getValues(getSlice(data["mw_" + type + "s"], 0, 10)) as element}
                        <a
                            class="clickable label2"
                            href="{lbdurl}{data.username}/films/{year !== ''
                                ? 'diary/for/' + yearnum.toString()
                                : ''}/{element['type']}/{getUri(
                                element['name'],
                                element['uri'],
                            )}"
                        >
                            <span class="leftText">{element["name"]}</span>
                            <span class="bold right"
                                >{element["sum"]} films</span
                            >
                            <div
                                class="labcontainer"
                                style="width:{(element['sum'] * 100) /
                                    elementAt(data['mw_' + type + 's'], 0)[
                                        'sum'
                                    ]}%;"
                            ></div>
                        </a>
                    {/each}
                </div>
            {/each}
        </div>
        {#if data.ru}
            <div
                class="attributes-chart twocolumn secTN {activeTNTab === 'HRTN'
                    ? ''
                    : 'hide'}"
            >
                {#each ["theme", "nanogenre"] as type}
                    <div class="labels">
                        <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                        {#each getValues(getSlice(data["tr_" + type + "s"], 0, 10)) as element}
                            <a
                                class="clickable label2"
                                href="{lbdurl}{data.username}/films/{year !== ''
                                    ? 'diary/for/' + yearnum.toString()
                                    : ''}/rated/.5-5/{element['type']}/{getUri(
                                    element['name'],
                                    element['uri'],
                                )}"
                            >
                                <span class="leftText">{element["name"]}</span>
                                <span class="bold right"
                                    >Average: {element["avg"]}</span
                                >
                                <div
                                    class="labcontainer"
                                    style="width:{(element['avg'] * 100) /
                                        elementAt(data['tr_' + type + 's'], 0)[
                                            'avg'
                                        ]}%;"
                                ></div>
                            </a>
                        {/each}
                    </div>
                {/each}
                <div class="infoavg">
                    Themes and nanogenres with at least three rated films are
                    included.
                </div>
            </div>
        {/if}
    </section>

    <!-- ALL TIME SECTION -->
    {#if year === ""}
        <section class="sectionStats">
            <SectionHeader title="List progress" />
            <div class="pielists">
                {#each Array.from({ length: arrayLength(data["lists"]) }, (_, i) => i) as i}
                    <div
                        class="donut"
                        style="background:conic-gradient(#40bcf4 0deg {3.6 *
                            elementAt(data['lists'], i).perc}deg,#303c44 {3.6 *
                            elementAt(data['lists'], i).perc}deg 360deg);"
                    >
                        <a
                            class="hole"
                            href="{lbdurl}{elementAt(data['lists'], i)._id}"
                        >
                            <span class="listtitle"
                                >{elementAt(data["lists"], i).name}</span
                            >
                            <span class="listperc"
                                >{parseInt(
                                    elementAt(data["lists"], i).perc,
                                )}%</span
                            >
                            <span class="listnum"
                                >{elementAt(data["lists"], i).num} of {elementAt(
                                    data["lists"],
                                    i,
                                ).tot}</span
                            >
                        </a>
                    </div>
                {/each}
            </div>
        </section>
        <section class="sectionStats">
            <SectionHeader title="Collections">
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeCollectionTab === 'complete'
                        ? 'active'
                        : ''}"
                    onclick={() => setActiveTab("collections", "complete")}
                    onkeydown={(e) =>
                        e.key === "Enter" &&
                        setActiveTab("collections", "complete")}>Complete</span
                >
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeCollectionTab === 'almost'
                        ? 'active'
                        : ''}"
                    onclick={() => setActiveTab("collections", "almost")}
                    onkeydown={(e) =>
                        e.key === "Enter" &&
                        setActiveTab("collections", "almost")}
                    >Almost Complete</span
                >
            </SectionHeader>
            <div class="collections">
                {#each getValues(data["collections"]) as col}
                    <div
                        class="collectionsx {activeCollectionTab === col._id
                            ? ''
                            : 'hide'}"
                    >
                        {#each col.collections as element}
                            <div class="singleCollection">
                                <a
                                    class="threeposters"
                                    href="{lbdurl}films/in/{element[
                                        'uri'
                                    ]}/by/release-earliest/size/large/"
                                >
                                    {#each element.posters as poster}
                                        <img
                                            use:lazyImage
                                            class="lazy"
                                            src="images/poster_70.jpg"
                                            data-src={replaceSize(
                                                poster,
                                                105,
                                                70,
                                            )}
                                            alt=""
                                        />
                                    {/each}
                                </a>
                                <span>
                                    <a
                                        class="name"
                                        href="{lbdurl}films/in/{element[
                                            'uri'
                                        ]}/by/release-earliest/size/large/"
                                    >
                                        {element["name"]}
                                    </a>
                                    {element["num"]} watched
                                </span>
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </section>
        {#if arrayLength(data["mostWatched"]) > 0}
            <section class="sectionStats">
                <SectionHeader title="Most Watched" />
                {@render filmListSnippet(data["mostWatched"])}
                <div class="noflex">
                    <a
                        class="clickable seeallbutton"
                        href="{lbdurl}{data.username}/films/diary/by/diary-count/"
                        >see in diary</a
                    >
                </div>
            </section>
        {/if}
        {#if data.ru}
            <section class="sectionStats">
                <SectionHeader title="Rated higher than average" />
                {@render filmListSnippet(data["highers"])}
            </section>
            <section class="sectionStats">
                <SectionHeader title="Rated lower than average" />
                {@render filmListSnippet(data["lowers"])}
            </section>
        {/if}

        <!-- DIARY SECTION -->
    {:else}
        <section class="sectionStats">
            <SectionHeader title="Breakdown" />
            <div class="breakdown">
                <div class="piecharts">
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">{yearnum} Releases</span>
                            <span class="">Older</span>
                        </div>
                        <div id="currentYearpie" class="piech2"></div>
                    </div>
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">Watches</span>
                            <span class="">Re-watches</span>
                        </div>
                        <div id="rewatchpie" class="piech2"></div>
                    </div>
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">Reviewed</span>
                            <span class="">Not Reviewed</span>
                        </div>
                        <div id="reviewspie" class="piech2"></div>
                    </div>
                </div>
                {#if data.ru}
                    <div class="ratingSpreadsection">
                        <img src="images/1stars.png" alt="1star" />
                        <div id="ratingSpread" class="ratingSpread"></div>
                        <img src="images/5stars.png" alt="5stars" />
                    </div>
                    <span class="linetitle">Rating Spread</span>
                {/if}
            </div>
        </section>
    {/if}

    {#each [["actor", "Stars", "Watch"], ["director", "Directors", "Watch"]] as [roleId, roleLabel, initialTab]}
        {@const activeTab =
            roleId === "actor" ? activeActorTab : activeDirectorTab}
        <section class="sectionStats">
            <SectionHeader title={roleLabel}>
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeTab === 'Watch' ? 'active' : ''}"
                    onclick={() => setActiveTab(roleId, "Watch")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab(roleId, "Watch")}
                    >Most Watched</span
                >
                {#if data.ru}
                    <span
                        role="button"
                        tabindex="0"
                        class="clickable {activeTab === 'Rat' ? 'active' : ''}"
                        onclick={() => setActiveTab(roleId, "Rat")}
                        onkeydown={(e) =>
                            e.key === "Enter" && setActiveTab(roleId, "Rat")}
                        >Highest Rated</span
                    >
                {/if}
            </SectionHeader>
            <div class="{roleId}s2">
                {#each [["Watch", "mw_", "w"], ["Rat", "tr_", "r"]] as [tabId, dataPrefix, typeCode]}
                    {#if activeTab === tabId}
                        {@const seeMore =
                            roleId === "actor" ? actorSeeMore : directorSeeMore}
                        <section class="{roleId}sbis">
                            <div class="{roleId}s people">
                                {#each getValues(getSlice(data[dataPrefix + (roleId === "actor" ? "actor" : "director")], 0, seeMore ? 20 : 10)) as element}
                                    {#if element.hasOwnProperty("name")}
                                        <PersonItem
                                            {roleId}
                                            {element}
                                            {year}
                                            {yearnum}
                                            username={data.username}
                                            {typeCode}
                                            {setTmdb}
                                        />
                                    {/if}
                                {/each}
                            </div>
                            {#if !seeMore && arrayLength(data[dataPrefix + (roleId === "actor" ? "actor" : "director")]) > 10}
                                <div class="noflex">
                                    <span
                                        role="button"
                                        tabindex="0"
                                        class="clickable seeallbutton"
                                        onclick={() => {
                                            if (roleId === "actor")
                                                actorSeeMore = true;
                                            else directorSeeMore = true;
                                        }}
                                        onkeydown={(e) => {
                                            if (e.key === "Enter") {
                                                if (roleId === "actor")
                                                    actorSeeMore = true;
                                                else directorSeeMore = true;
                                            }
                                        }}>see more</span
                                    >
                                </div>
                            {/if}
                        </section>
                    {/if}
                {/each}
            </div>
        </section>
    {/each}

    <section class="sectionStats">
        <SectionHeader title="Crew & Studios">
            <span
                role="button"
                tabindex="0"
                class="clickable {activeCrewTab === 'mw' ? 'active' : ''}"
                onclick={() => setActiveTab("crew", "mw")}
                onkeydown={(e) =>
                    e.key === "Enter" && setActiveTab("crew", "mw")}
                >Most Watched</span
            >
            {#if data.ru}
                <span
                    role="button"
                    tabindex="0"
                    class="clickable {activeCrewTab === 'tr' ? 'active' : ''}"
                    onclick={() => setActiveTab("crew", "tr")}
                    onkeydown={(e) =>
                        e.key === "Enter" && setActiveTab("crew", "tr")}
                    >Highest Rated</span
                >
            {/if}
        </SectionHeader>
        {#each ["mw", "tr"] as activeType}
            {#if activeCrewTab === activeType}
                <section class="crewbis">
                    {#each getValues(roles) as role}
                        <div class="role">
                            <span class="titlerole">{role[1]}</span>
                            {#each getValues(getSlice(data[activeType + "_" + role[0]], 0, 20)) as element, i}
                                {#if element.hasOwnProperty("name")}
                                    {#if i <= 5 || crewSeeMore}
                                        <div class="crew-item">
                                            <a
                                                class="clickable"
                                                href="{lbdurl}{data.username}/films{year !==
                                                ''
                                                    ? '/diary/for/' +
                                                      yearnum.toString()
                                                    : ''}/with/{role[2]}/{element.uri}"
                                            >
                                                {element.name || element.uri}
                                            </a>
                                            <span class="sottotitolo">
                                                {activeType === "mw"
                                                    ? element.sum
                                                    : element.avg}
                                            </span>
                                        </div>
                                    {/if}
                                {/if}
                            {/each}
                        </div>
                    {/each}
                    {#if !crewSeeMore}
                        <div class="noflex">
                            <span
                                role="button"
                                tabindex="0"
                                class="clickable seeallbutton"
                                onclick={() => (crewSeeMore = true)}
                                onkeydown={(e) =>
                                    e.key === "Enter" && (crewSeeMore = true)}
                                >see more</span
                            >
                        </div>
                    {/if}
                </section>
            {/if}
        {/each}
    </section>
    {#if year !== ""}
        <section class="sectionStats">
            <SectionHeader title="Highs and Lows" />
            <div class="highLow">
                {#each [["best", "Highest Average"], ["worst", "Lowest Average"], ["popular", "Most Popular"], ["obscure", "Most Obscure"]] as type}
                    <FilmItem
                        uri={data[type[0]]._id}
                        poster={data[type[0]].poster || ""}
                        suptitle={type[1]}
                    >
                        <div class="sottofilm">
                            {#if data[type[0]].hasOwnProperty("avg")}
                                <img src="images/orangestar.jpg" alt="star" />
                                <span class="sottotitolo stellamedia"
                                    >{data[type[0]].avg.toFixed(1)}</span
                                >
                            {/if}
                        </div>
                    </FilmItem>
                {/each}
            </div>
        </section>

        <section class="sectionStats">
            <SectionHeader title="Rated higher than average" />
            {@render filmListSnippet(data["highers"])}
        </section>
        <section class="sectionStats">
            <SectionHeader title="Rated lower than average" />
            {@render filmListSnippet(data["lowers"])}
        </section>
    {/if}
    <section class="wMap noselect">
        <span class="wmTitle">World Map</span>
        <WorldMap {data} {year} />
    </section>
</div>
