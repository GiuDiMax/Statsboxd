<script>
    import SharedPage from "./page.svelte";
    import { baseUrl } from "./config.js";
    import { onMount } from "svelte";
    import { addMissingData } from "./utils.js";
    let { username, year } = $props();

    let loading = $state(true);
    let data = $state({});
    let tmpdata = $state({});
    let message = $state("Error");

    //console.log(donator)

    async function getYearStats(data) {
        //console.log(data)
        const resp = await fetch(baseUrl + "yearstats", {
            method: "POST",
            //headers: {"Accept-Encoding": "br"},
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(data),
        });
        return await resp.json();
    }

    onMount(async () => {
        try {
            let localStorageData = localStorage.getItem(
                username.toLowerCase() + "_" + year.toString() + "_stats",
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
                            //const aYear = new Date(d.date).getFullYear()
                            const date = new Date(d.date);
                            const aYear = date.getUTCFullYear();
                            return aYear === year;
                        });
                        if (filteredDates.length > 0) {
                            return { ...item, d: filteredDates };
                        }
                    })
                    .filter(Boolean);

                // TEST MST TZ
                // const yearData = tmpdata['watched'].map(item => {
                //     const filteredDates = item.d.filter(d => {
                //         const options = { timeZone: 'America/Denver' }; // MST time zone
                //         const date = new Date(d.date);
                //         const formatter = new Intl.DateTimeFormat('en-US', {
                //             year: 'numeric',
                //             ...options
                //         });
                //         const aYear = parseInt(formatter.format(date), 10);
                //         return aYear === year;
                //     });
                //     if (filteredDates.length > 0) {
                //         return { ...item, d: filteredDates };
                //     }
                // }).filter(Boolean);

                data = await getYearStats({ year: year, watched: yearData });
                data["username"] = tmpdata["username"];
                data["name"] = tmpdata["name"];
                data["ru"] = tmpdata["ru"];
                data["update"] = tmpdata["update"];
                data["yearsStats"] = tmpdata["yearsStats"];
                localStorage.setItem(
                    username.toLowerCase() + "_" + year.toString() + "_stats",
                    JSON.stringify(data),
                );
                addMissingData(data, username, year);
                message = undefined;
            }
        } catch (error) {
            console.log(error);
            message =
                "There is an error, please contact me on <a href='https://t.me/giudimax' target='_blank'>telegram" +
                " and send me your zip file</a><br/>";
        }
        loading = false;
    });
</script>

<main>
    {#if loading}
        <div class="loaderContainer2"><div class="loader2"></div></div>
    {/if}
    {#if message !== undefined}
        <p>{message}</p>
    {:else}
        <SharedPage {data} year={year.toString()} yearnum={year} />
    {/if}
</main>
