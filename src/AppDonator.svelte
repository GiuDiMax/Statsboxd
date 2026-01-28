<script>
    import {onMount} from 'svelte'
    import { baseUrl } from './config.js'
    export let username
    export let idx

    let loading = true
    let data = {}
    let tmpdata = {}
    let message = "Error"
    let selectedFile = undefined

    var limit = 500

    async function getStats(data){
        const resp = await fetch(baseUrl + 'stats',
            {
                method: "POST",
                //headers: {"Accept-Encoding": "br"},
                body: JSON.stringify(data)
            },
        )
        return await resp.json()
    }

    async function getDonator(idx, diary=false){
        let data = await fetch(baseUrl + 'donator?id=' + idx)
        return await data.json()
    }

    async function getData(session, diary=false, offset = 0){
        let url = baseUrl + 'donator' + '?session=' + session + '&offset=' + offset
        if (diary) {url += '&diary'}
        let response = await fetch(url);
        return await response.json()
    }

    onMount(async () => {

        const localStorageData = localStorage.getItem("latest")

        if (localStorageData !== null && localStorageData !== undefined &&
            localStorageData !== "undefined" && localStorageData.toLowerCase() === username.toLowerCase()){
            window.location.search = '?username=' + localStorageData.toLowerCase();
        }

        try{
            const data0 = await getDonator(idx)
            const uid = data0.id
            const diary = data0.diary
            const watches = data0.watches
            const session = data0.session
            let dataWatched = []
            let dataDiary = []

            //console.log(await getData(session, false, 0))
            //return

            const watchPromises = Array.from({ length: Math.ceil(watches / limit) }, (_, i) =>
                getData(session, false, i)
            )
            const diaryPromises = Array.from({ length: Math.ceil(diary / limit) }, (_, i) =>
                getData(session, true, i)
            )
            const [watchResults, diaryResults] = await Promise.all([
                Promise.all(watchPromises),
                Promise.all(diaryPromises)
            ])
            watchResults.forEach(tmpdata => {dataWatched = dataWatched.concat(tmpdata.watched || [])})
            diaryResults.forEach(tmpdata => {dataDiary = dataDiary.concat(tmpdata.diary || [])})

            //console.log(dataWatched)
            //console.log(dataDiary)

            tmpdata['watched'] = dataWatched.map(item => {
                const relatedDiary = dataDiary
                    .filter(d => d._id === item._id)
                    .map(d => ({
                        date: d.date,
                        rewatch: d.rewatch,
                        review: d.review
                    }));
                return {
                    _id: item._id,
                    r: item.r,
                    d: relatedDiary
                };
            });

            const filt = tmpdata['watched'].filter(d => 'r' in d);

            tmpdata['username'] = username.toLowerCase()
            //if (data0.name !== ''){tmpdata['name'] = data0.name}
            //else{tmpdata['name'] = username}
            tmpdata['name'] = username
            tmpdata['ru'] = filt.length>50
            tmpdata['update'] = new Date()
            tmpdata['update'] = tmpdata['update'].toString().split("T")[0]

            data = await getStats(tmpdata)
            data['username'] = username.toLowerCase()
            data['name'] = tmpdata['name']
            data['ru'] = tmpdata['ru']
            data['update'] = tmpdata['update']
            tmpdata['yearsStats'] = data['yearsStats']
            data['donator'] = true

            localStorage.setItem(username.toLowerCase(), JSON.stringify(tmpdata))
            localStorage.setItem(username.toLowerCase() + "_stats", JSON.stringify(data))
            localStorage.setItem("latest", username.toLowerCase())
            window.location.search = '?username=' + username.toLowerCase();

            message = ""
        }catch{
            message = "Error, make sure you are a supporter and contact the developer"
        }
        loading = false
    })

</script>


<main>
    {#if loading}
        <div class="loaderContainer2"><div class="loader2"></div></div>
    {/if}
    {#if message !== ''}<p class="errormsg message">{@html message}</p>{/if}
</main>
