<script>
    import Poster from "./Poster.svelte";

    let {
        uri = "",
        poster = "",
        link = "",
        suptitle = "",
        className = "",
        children,
    } = $props();
</script>

<div class="singleFilm {className}">
    {#if suptitle}
        <span class="suptitle">{suptitle}</span>
    {/if}
    <Poster {uri} {poster} {link} />
    {#if children}
        <div>
            {@render children()}
        </div>
    {/if}
</div>
