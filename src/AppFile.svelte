<script>
    import {onMount} from 'svelte'
    import jszip from "jszip"
    import PapaParse from "papaparse"
    import { baseUrl } from './config.js'
    import Dropzone from "svelte-file-dropzone";

    let loading = true
    let data = {}
    let tmpdata = {}
    let message = ""
    let selectedFile = undefined

    function handleFilesSelect(e) {
        selectedFile = e.detail.acceptedFiles[0]
    }

    async function getStats(data){
        const resp = await fetch(baseUrl + 'stats',
            {
                method: "POST",
                //headers: {"Accept-Encoding": "br"},
                headers: {"Content-Type": "application/json;charset=UTF-8"},
                body: JSON.stringify(data)
                //body: data
            },
        )
        return await resp.json()
    }

    async function parseCsv(zip, filename) {
        const csvFile = await zip.file(filename)
        const csvData = await csvFile.async('text')
        return await PapaParse.parse(csvData, {header: true, skipEmptyLines: true}).data
    }

    async function setFile(){
        loading = true
        let zip
        try{
            zip = await jszip.loadAsync(selectedFile)
        }catch{
            selectedFile = undefined
            message = "The file you uploaded appears to be corrupt or incorrect. Make sure you downloaded it from a browser like Chrome or Firefox and not from other apps' internal browsers." +
                "Try opening it, and then try uploading again. <br/>" +
                "If the problem continues contact me on <a href='https://t.me/giudimax' target='_blank'>telegram" +
                " and send me your zip file</a><br/>"
            loading = false
            return
        }
        try {
            const [watchedData, ratingsData, diaryData, reviewsData, profileData] = await Promise.all([
                parseCsv(zip, 'watched.csv'),
                parseCsv(zip, 'ratings.csv'),
                parseCsv(zip, 'diary.csv'),
                parseCsv(zip, 'reviews.csv'),
                parseCsv(zip, 'profile.csv'),
            ]);

            console.log("ok read files")

            const username = profileData[0]['Username']
            const name = profileData[0]['Given Name'] + profileData[0]['Family Name']

            const ratingDict = ratingsData.reduce((acc, curr) => {
                acc[curr['Letterboxd URI']] = curr['Rating'];
                return acc;
            }, {});

            const reviewArray = reviewsData.map(review => review['Letterboxd URI']);

            const diaryDict = diaryData.reduce((acc, curr) => {
                const { 'Name': name, 'Year': year, 'Rewatch': rewatch } = curr;
                const key = `${name}_${year}`;
                acc[key] = acc[key] || [];
                acc[key].push({
                    date: curr['Watched Date'],
                    rewatch: rewatch === 'Yes',
                    review: reviewArray.includes(curr['Letterboxd URI']),
                })
                return acc;
            }, {});

            tmpdata['watched'] = watchedData.map(item => {
                const key = `${item['Name']}_${item['Year']}`
                return {
                    _id: item['Letterboxd URI'].split('/').pop(),
                    r: parseFloat(ratingDict[item['Letterboxd URI']]) || null,
                    d: diaryDict[key] || []
                };
            });

            const filt = tmpdata['watched'].filter(d => 'r' in d);

            tmpdata['username'] = username.toLowerCase()
            if (name !== ''){tmpdata['name'] = name}
            else{tmpdata['name'] = username}
            tmpdata['ru'] = filt.length>50
            tmpdata['update'] = new Date()
            tmpdata['update'] = tmpdata['update'].toString().split("T")[0]
            localStorage.setItem(username.toLowerCase(), JSON.stringify(tmpdata))

            data = await getStats(tmpdata)
            data['username'] = tmpdata['username']
            data['name'] = tmpdata['name']
            data['ru'] = tmpdata['ru']
            data['update'] = tmpdata['update']
            data['donator'] = false
            tmpdata['yearsStats'] = data['yearsStats']
            message = ""
            localStorage.setItem(username.toLowerCase(), JSON.stringify(tmpdata))
            localStorage.setItem(username.toLowerCase() + "_stats", JSON.stringify(data))
            localStorage.setItem("latest", username.toLowerCase())
            window.location.search = '?username=' + username.toLowerCase();

        } catch (error) {
            console.log(error)
            selectedFile = undefined
            message = "There was a problem with the server. Try again in a few minutes. <br/>" +
                "If the problem continues contact me on <a href='https://t.me/giudimax' target='_blank'>telegram" +
                " and send me your zip file</a><br/>"
       }loading = false
    }

    onMount(async () => {
        const localStorageData = localStorage.getItem("latest")
        if(localStorageData !== null && localStorageData !== "undefined") {
            window.location.search = '?username=' + localStorageData.toLowerCase();
        }else{loading = false}
    })

</script>


<main>
    {#if loading}
        <div class="loaderContainer2"><div class="loader2"></div></div>
    {/if}
    <div class="fileUploadContainer">
    <img class="logo" src="images/logo.webp" alt="statsboxd logo">
    {#if selectedFile !== undefined }
        <div class="confirmationBox">
            <p>Selected File:</p>
            <p class="high">{selectedFile.name}</p>
            <a type="button" class="btn" on:click={setFile} href="#">Click here to confirm</a>
        </div>
    {:else}

        {#if message !== ''}
            <p class="errormsg message">{@html message}</p>
        {:else}
            <p>
                Welcome to Statsboxd, to get your stats please export your data from Letterboxd
                (<a href="https://letterboxd.com/data/export/?fromApp=false" target="_top">or click here</a>) and upload the zip file.<br />
            </p>
            <Dropzone on:drop={handleFilesSelect} containerClasses="fileUpload"/>
            <p style="color: yellow !important; display:none;">
                In the last few days there has been a large load of users and Cloudflare Workers have imposed more stringent limits for free users.
                If anyone would like to give me a hand for a possible solution  <a href="//t.me/giudimax" target="_blank">contact me</a>.
                <br />
            </p>
            <p>
                If you like the project consider to <a target="_blank" href="//ko-fi.com/giudimax">supporting me</a> or
                <a target="_blank" href="//github.com/GiuDiMax/Statsboxd">collaborating on Github</a>
                <br />
            </p>
            <br/>
            <strong style="">Supporters features:</strong>
            <ul style="line-height: 1.5em">
                <li>Stats without zip file using statsboxd.top?username=your_letterboxd_username&id=your_letterboxd_ide&donator;</li>
                <li>Share your stats;</li>
                <li>Technical support;</li>
                <li>After you donate, contact me and write me your letterboxd username.</li>
            </ul>
        {/if}
    {/if}
    </div>
</main>
