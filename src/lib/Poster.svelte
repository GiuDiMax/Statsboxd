<script>
    import jQuery from 'jquery';

    let { src, alt, href, height = 165, width = 110, name = "" } = $props();

    function replaceSize(src, h, w) {
        try {
            if (src !== null && src !== undefined) {
                if (src.includes('a.ltrbxd')) {
                    try {
                        return src.split("-0-").slice(0, 2).join("-0-") + "-0-" + w + "-0-" + h + "-crop.jpg";
                    } catch (error) {
                        return src.includes('.jpg') ? src : src + ".jpg";
                    }
                }
                return '//a.ltrbxd.com/resized/' + src + "-0-" + w + "-0-" + h + "-crop.jpg";
            }
        } catch {}
        return "images/poster.jpg";
    }

    function handleImageLoad(e) {
        jQuery(e.target).parent().addClass("imgok");
    }

    function handleImageError(e) {
        jQuery(e.target).parent().removeClass("imgok").addClass('notok');
        e.target.src = 'images/poster.jpg';
    }

    function replaceDash(str) {
        try { return str.replace(/-/g, " "); }
        catch { return ""; }
    }

    const processedSrc = $derived(replaceSize(src, height, width));
    const processedName = $derived(name || replaceDash(alt));
    const lbdurl = "https://letterboxd.com/";
</script>

<a class="poster" href={href}>
    <div class="containertextimg"><span>{processedName}</span></div>
    <img 
        loading="lazy" 
        onload={handleImageLoad} 
        onerror={handleImageError} 
        class="lazy"
        src="images/poster.jpg"
        data-src={processedSrc}
        alt={alt}
    />
</a>

<style>
    /* Add any poster-specific styles here if needed, 
       otherwise they stay in main.css */
</style>
