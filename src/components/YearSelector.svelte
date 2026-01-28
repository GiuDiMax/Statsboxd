<script>
    let { data, year } = $props();
    let showYears = $state(false);
</script>

{#if data.hasOwnProperty("yearsStats")}
    <div
        class="popupYearContainer {year !== '' ? 'popupYear2Container' : ''} "
        onmouseleave={() => {
            showYears = false;
        }}
        role="presentation"
    >
        <button
            class="popupButton"
            data-show="popupYear"
            onclick={() => {
                showYears = !showYears;
            }}
            aria-label="Select Year"
        >
            <div class="arrow-down"></div>
        </button>
        <div id="popupYear" class="popupYear {showYears ? '' : 'hide'}">
            <div class="arrow-up"></div>
            <div class="listaAnni">
                <div>
                    <a href="?username={data.username}">All time</a>
                    {#each data["yearsStats"] as y}
                        <a href="?username={data.username}&year={y}"
                            >{y}{#if y === new Date().getUTCFullYear()}...{/if}</a
                        >
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Styles are assumed to be in main.css or similar, but adding some local ones if needed */
    .hide {
        display: none;
    }
    .popupButton {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
    }
</style>
