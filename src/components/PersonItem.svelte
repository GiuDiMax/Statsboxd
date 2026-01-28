<script>
    import { lbdurl } from "../config.js";
    import { tmdb_key } from "../config.js";

    let { roleId, element, year, yearnum, username, typeCode, setTmdb } =
        $props();

    let link = $derived(
        `${lbdurl}${username}/films${year !== "" ? "/diary/for/" + yearnum.toString() : ""}/with/${roleId}/${element.uri}`,
    );
</script>

<div class="container_people">
    <a href={link}>
        <img
            class="holeperson"
            src="images/{roleId}.jpg"
            data-tmdb={element.tmdb}
            alt={element.uri}
            onload={(e) => setTmdb(e.target)}
        />
    </a>
    <a class="clickable" href={link}>
        {element.name || element._id}
    </a>
    {#if typeCode === "w"}
        <a class="sottotitolo" href={link}>
            {element.sum} films
        </a>
    {:else}
        <span class="sottotitolo">★ {element.avg}</span>
    {/if}
</div>
