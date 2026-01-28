<script>
    let { data, year } = $props();
    let showYears = $state(false);

    $effect(() => {
        const handleOutsideClick = (event) => {
            if (showYears && !event.target.closest(".popupYearContainer")) {
                showYears = false;
            }
        };

        if (showYears) {
            window.addEventListener("click", handleOutsideClick);
        }

        return () => {
            window.removeEventListener("click", handleOutsideClick);
        };
    });
</script>

{#if data.hasOwnProperty("yearsStats")}
    <div
        class="popupYearContainer {year !== '' ? 'popupYear2Container' : ''} "
        role="presentation"
    >
        <button
            class="popupButton"
            data-show="popupYear"
            onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showYears = !showYears;
            }}
            aria-label="Select Year"
        >
            <span class="arrow-down"></span>
        </button>
        <div id="popupYear" class="popupYear" class:hide={!showYears}>
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
