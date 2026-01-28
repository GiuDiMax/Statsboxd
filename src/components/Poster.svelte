<script>
    import { useLazyImage as lazyImage } from "svelte-lazy-image";
    import { replaceSize, replaceDash, lbdurl } from "../helpers.js";

    let {
        uri = "",
        poster = "",
        width = 165,
        height = 110,
        alt = "",
        link = "", // Optional link override
        className = "",
    } = $props();

    let imgStatus = $state("loading"); // 'loading', 'ok', 'error'

    function handleLoad() {
        imgStatus = "ok";
    }

    function handleError(e) {
        imgStatus = "error";
        e.target.src = "images/poster.jpg";
    }

    let finalLink = $derived(link || `${lbdurl}film/${uri}`);
</script>

<a
    class="poster {className} {imgStatus === 'ok' ? 'imgok' : ''} {imgStatus ===
    'error'
        ? 'notok'
        : ''}"
    href={finalLink}
>
    <div class="containertextimg"><span>{replaceDash(uri)}</span></div>
    <img
        use:lazyImage
        onload={handleLoad}
        onerror={handleError}
        src="images/poster.jpg"
        data-src={replaceSize(poster, width, height)}
        {alt}
    />
</a>

<style>
    /* Add any local styles if necessary */
</style>
