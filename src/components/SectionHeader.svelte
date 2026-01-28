<script>
    let { title, children = null } = $props();
</script>

<div class="sepline">
    <span>{title}</span>
    <div class="line"></div>
    {#if children}
        {@render children()}
    {/if}
</div>
