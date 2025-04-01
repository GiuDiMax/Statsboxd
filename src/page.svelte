<script>
    export let data
    export let year
    export let yearnum
    let showYears = false
    import Highcharts from 'highcharts'
    import 'highcharts/modules/accessibility';
    import {onMount, createEventDispatcher } from "svelte"
    import jQuery from 'jquery'
    import { useLazyImage as lazyImage } from 'svelte-lazy-image'
    import {roles, tmdb_key, lbdurl} from './config.js'
    import jsVectorMap from 'jsvectormap/dist/jsvectormap.js'
    import 'jsvectormap/dist/maps/world.js'
    import 'jsvectormap/dist/jsvectormap.css'
    import { getISOWeek } from 'date-fns'

    let isMobile = false

    let current_month
    let current_week

    const currentYear = new Date().getFullYear()
    if (currentYear === yearnum){
        const today = new Date()
        current_week = getISOWeek(today)
        current_month = today.getUTCMonth() + 1
    }else{
        current_month = 12
        current_week = 52
    }

    function clickableFunction(){
        jQuery('.' + jQuery(event.target).attr('data-hide')).addClass('hide')
        jQuery('#' + jQuery(event.target).attr('data-show')).removeClass('hide')
        jQuery('.' + jQuery(event.target).attr('data-hide2')).addClass('hide')
        jQuery('.' + jQuery(event.target).attr('data-show2')).removeClass('hide')
        jQuery('.' + jQuery(event.target).attr('data-class-show')).removeClass('hide')
        jQuery(event.target).addClass('active')
        jQuery(event.target).siblings().removeClass('active')
    }

    async function handleImageLoad(){
        jQuery(event.target).parent().addClass("imgok")
    }

    async function handleImageError(){
        jQuery(event.target).parent().removeClass("imgok").addClass('notok')
        jQuery(event.target).attr('src', 'images/poster.jpg')
    }

    async function setTmdb(img){
        const element = jQuery(img);
        //const element = jQuery(event.target)
        if (element.data('tmdb') === undefined || element.data('isLoaded')){return}
        const response = await fetch('https://api.themoviedb.org/3/person/'+element.data('tmdb')+'?api_key='+tmdb_key)
        if (response.ok) {
            const data = await response.json();
            if (data.profile_path !== null) {
                element.attr('src', 'https://www.themoviedb.org/t/p/w235_and_h235_face/'+data.profile_path);
            }
        } else {
            console.error('Error fetching person data:', response.status, response.statusText);
        }
        element.data('isLoaded', true)
    }

    function elementAt(array, index){
        try{return array[parseInt(index)]}
        catch{return ""}
    }

    function replaceDash(str){
        try{return str.replace("-", " ")}
        catch{return ""}

    }

    function getUri(obj, obj2=null) {
        if (obj2 !== null && obj2.length > 0) {return obj2}
        //try {
        if(obj === undefined){return ""}
        if (obj.toLowerCase().includes('persian')) { return 'persianfarsi' }
        return obj.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/:/g, '').replace(/,/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/'/g, '-').replace(/\s+/g, '-');
        //} catch (error) {return ''}
    }

    function ifNoneThenZero(n){
        if (n === null){return 0}
        return parseFloat(n)
    }

    function numToStars(num){
        let result = ""
        if(num !== null && num !== undefined){
            result = "★".repeat(parseInt(num))
        }
        if (num > parseInt(num)){
            result = result + "½"
        }
        return result
    }

    function getValues(arr){
        try {return arr.values()}
        catch{}
        return []
    }

    function formatDate1(dateString) {
        // if (len(dateString)>10){
        //     dateString = dateString.substring(10)
        // }
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const date = new Date(dateString);
        const month = months[date.getUTCMonth()];
        const day = date.getUTCDate();
        return `${month} ${day}`;
    }

    function getSlice(arr, start, stop){
        try{
            if(arr.length >= stop) {
                return arr.slice(start, stop)
            }else {
                return arr.slice(start, arr.length)
            }}
        catch{}
        return arr
    }

    function ifThenElse(control, istrue, isfalse) {
        if(control){return istrue}
        else{return isfalse}
    }

    function replaceSize(src, height=165, width=110){
        try{
            if (src !== null) {
                if (src.includes('a.ltrbxd')) {
                    try {
                        return src.split("-0-").slice(0, 2).join("-0-") + "-0-" + width + "-0-" + height + "-crop.jpg";
                    } catch (error) {
                        if (src.includes('.jpg')) {
                            return src;
                        } else {
                            return src + ".jpg";
                        }
                    }
                }
                return '//a.ltrbxd.com/resized/' + src + "-0-" + width + "-0-" + height + "-crop.jpg";
            }
        }catch{}
        return ""
    }

    function getWeek(y, nweek) {
        nweek = nweek-1
        var startdate = new Date(Date.UTC(y, 0, 1))
        startdate.setDate(startdate.getUTCDate() + ((nweek - 1) * 7))
        var dayweek = startdate.getUTCDay()
        var giorniAggiuntivi = (dayweek === 0) ? 1 : (8 - dayweek)
        startdate.setDate(startdate.getUTCDate() + giorniAggiuntivi)
        var stopdate = new Date(startdate)
        stopdate.setDate(stopdate.getUTCDate() + 6)
        //if (parseInt(startdate.getUTCFullYear()) !== parseInt(year)) {
        //    startdate = new Date(year, 0, 1)
        //}
        if (stopdate.getTime() === startdate.getTime()){
            return startdate.toLocaleString('en', {month: 'short'}) + ' ' + startdate.getUTCDate()
        }
        if (stopdate.getUTCMonth() === startdate.getUTCMonth()){
            return startdate.toLocaleString('en', {month: 'short'}) + ' ' + startdate.getUTCDate() + ' — ' + stopdate.getUTCDate()
        }
        return startdate.toLocaleString('en', {month: 'short'}) + ' ' + startdate.getUTCDate() + ' — ' + stopdate.toLocaleString('en', {month: 'short'}) + ' ' + stopdate.getUTCDate()
    }

    function fillArray(array, min, max){
        const array2 = [];
        let z = 0;
        for (let i = min; i <= max; i++) {
            try {
                if (array[z]['_id'] === i) {
                    array2.push(array[z]);
                    z++;
                } else {
                    array2.push({ '_id': i, 'sum': 0 });
                }
            } catch {
                array2.push({ '_id': i, 'sum': 0 });
            }
        }
        return array2;
    }

    function getWeeksInYear(year) {
        const firstDayOfYear = new Date(year, 0, 1);
        const isLeapYear = new Date(year, 1, 29).getUTCMonth() === 1;
        return firstDayOfYear.getUTCDay() === 4 || (isLeapYear && firstDayOfYear.getUTCDay() === 3) ? 53 : 52;
    }

    async function setAllTimeCharts(offsetContainer){
        let dataChart = {}
        let generalChart = {
            chart: {type: 'column', backgroundColor: 'transparent', margin: 0, border: 0},
            xAxis: {labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
            yAxis: {min: -1, labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
            legend: {enabled: false},
            title: {text: null},
            plotOptions: {column: {pointPadding: 0.2, borderWidth: 0, borderRadius: 3, groupPadding: 0,}},
        }

        // RELEASE YEAR
        dataChart = data.years.map(element => {
            const newDict = { 'name': element['_id'], 'y': element['sum'] + 1}
            if (element['sum'] === 0) { newDict['color'] = "#445566" }
            return newDict;
        })
        generalChart['tooltip'] = {
            formatter: function () {
                return '<div class="ttYear"><span class="ttTitle">' + (parseInt(this.y) - 1).toString() + ' films</span>' +
                    '<span class="ttSubtitle">Year ' + this.points[0].key + '</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        generalChart['series'] = [{
            data: dataChart,
            label: {enabled: false},
            color: {
                linearGradient: [0, 0, offsetContainer, 0],
                stops: [[0.00, '#00e054'], [1.00, '#3fbcf2']]
            },
            point: {events: {click: function () {
                        location.href = lbdurl+data.username+'/films/year/' + this.options.name + "/"
                    }}}
        }]
        Highcharts.chart('releaseYear', generalChart)

        // RATING YEAR
        dataChart = data.years.map(element => {
            const newDict = { 'name': element['_id'], 'y': (ifNoneThenZero(element['avg']) + 0.1)}
            if (ifNoneThenZero(element['avg']) === 0) { newDict['color'] = "#445566" }
            return newDict;
        });
        generalChart['tooltip'] = {
            formatter: function () {
                return '<div class="ttYear"><span class="ttTitle">Average ' + parseFloat(this.y - 0.1).toFixed(2).toString() + '</span>' +
                    '<span class="ttSubtitle">Year ' + this.points[0].key + '</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        generalChart['series'] = [{
            data: dataChart,
            label: {enabled: false},
            color: {
                linearGradient: [0, 0, offsetContainer, 0],
                stops: [[0.00, '#ffb860'], [1.00, '#ffe870']]
            },
            point: {events: {click: function () {
                        location.href = lbdurl+data.username+'/films/year/' + this.options.name + "/"
                    }}}
        }]
        Highcharts.chart('ratingYear', generalChart)

        // DIARY YEAR
        dataChart = data.logsPerYear.map(element => {
            const newDict = { 'name': element['_id'], 'y': element['sum'] + 5}
            if (element['sum'] === 0) { newDict['color'] = "#445566" }
            return newDict;
        });
        //console.log(dataChart)
        generalChart['tooltip'] = {
            formatter: function () {
                return '<div class="ttYear"><span class="ttTitle">' + (parseInt(this.y) - 5).toString() + ' films</span>' +
                    '<span class="ttSubtitle">Year ' + this.points[0].key + '</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        generalChart['series'] = [{
            data: dataChart,
            label: {enabled: false},
            color: {
                linearGradient: [0, 0, offsetContainer, 0],
                stops: [[0.00, '#48FF84'], [1.00, '#06E358']]
            },
            point: {events: {click: function () {
                        location.href = lbdurl+data.username+'/films/year/' + this.options.name + "/"
                    }}}
        }]
        generalChart['plotOptions'] = {column: {pointPadding: 0.05, borderWidth: 0, borderRadius: 3, groupPadding: 0,}},
            Highcharts.chart('diaryYear', generalChart)
    }

    async function setYearCharts(offsetContainer){
        let dataChart = {}
        let generalChart = {
            chart: {type: 'column', backgroundColor: 'transparent', margin: 0, border: 0, animation: false},
            xAxis: {labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
            yAxis: {min: -1, labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
            legend: {enabled: false},
            title: {text: null},
        }

        //RATING SPREAD
        generalChart.chart.height = 150
        generalChart.plotOptions = {column: {pointPadding: 0, borderWidth: 0, borderRadius: 2, groupPadding: 0.1,}}
        generalChart['tooltip'] = {
            formatter: function () {
                var stringa = new String("");
                for (let i = 1; i < (this.x + 1) / 2; i++) {stringa += "★"}
                if ((this.x + 1) / 2 > parseInt((this.x + 1) / 2)) {stringa += "½";} else {stringa += "★";}
                return '<div class="ttYear"><span class="ttStars">' + stringa + '</span><span class="ttStarsSub">' + (parseInt(this.y)).toString() + ' films</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        dataChart = []
        fillArray(data.rating, 1, 10).forEach(function (item){
            dataChart.push({ name: item._id, y: item.sum + 0.1})
        })
        generalChart['series'] = [{
            data: dataChart,
            label: {enabled: false},
            states: {hover: {color: '#00e054',}},
            color: '#445566',
            point: {events: {click: function () {
                        location.href = lbdurl + data.username+'/films/diary/for/'+yearnum+'/rated/' + String(parseInt(this.options.name) / 2) + "/";
                    }}}
        }]
        Highcharts.chart('ratingSpread', generalChart)

        //WATCHED WEEK
        let dataChartWeek = []
        //let fs = false
        //const firstDay = new Date(parseInt(year), 0, 1)
        //if (firstDay.getUTCDay() === 1) {fs = true}
        fillArray(data.weeks, 0, getWeeksInYear(year)).forEach(function (item, index){
            //let w2 = item._id
            let w2 = item._id + 1
            let y2 = year
            let w3 = w2
            //if(w2 === 0 && !fs){w2 = getWeeksInYear(year-1); w3 = getWeeksInYear(year-1).toString() + ' (' + (year-1).toString() + ')'; y2 = y2-1}
            //if(fs){w3 = w3 + 1}
            w3 = w2
            if (item.sum > 0){dataChartWeek.push({ name: item._id, y: item.sum + 0.25, week: w2, year: y2, w3: w3})}
            else{dataChartWeek.push({ name: item._id, y: item.sum + 0.25, color: "#445566", week: w2, year: y2, w3: w3})}
        })
        //console.log(dataChartWeek)
        generalChart.chart.height = undefined
        generalChart.plotOptions = {column: {pointPadding: 0.08, borderWidth: 0, borderRadius: 1.8, groupPadding: 0,}}
        generalChart['tooltip'] = {
            formatter: function () {
                let p = dataChartWeek[this.points[0].key]
                return '<div class="ttYear"><span class="ttTitle">' + (parseInt(this.y)).toString() + ' films</span>' +
                    '<span class="ttSubtitle">Week ' + p.w3+ '<br/>' + getWeek(p.year, p.week) + '</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        generalChart['series'] = [{
            data: dataChartWeek,
            label: {enabled: false},
            color: {
                linearGradient: [0, 0, jQuery('#watchedWeek').width(), 0],
                stops: [[0.00, '#00e054'], [1.00, '#3fbcf2']]
            },
            point: {events: {click: function () {
                let p = dataChartWeek[this.options.name]
                //location.href = lbdurl + data.username+'/films/diary/for/'+p.year+'/week/' + p.week + "/";
                window.open(lbdurl + data.username + '/films/diary/for/' + p.year + '/week/' + p.week + "/", '_blank');
            }}}
        }]
        Highcharts.chart('watchedWeek', generalChart)

        //WATCHED DAY WEEK
        generalChart.chart.height = 120
        generalChart.plotOptions = {column: {pointPadding: 0.05, borderWidth: 0, borderRadius: 2, groupPadding: 0.05,}}
        generalChart.xAxis = {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            labels: {formatter: function () { return this.value.charAt(0)},
                enabled: true, x: 0, y: -10, style: {color: 'white', fontSize: '12px', fontFamily: 'Graphik-Regular-Web'},
            }, lineColor: 'transparent',
        }
        generalChart['tooltip'] = {
            formatter: function () {
                return '<div class="ttYear"><span class="ttTitle">' + (parseInt(this.y)).toString() + ' films</span><span class="ttSubtitle">' + this.name.toString() + '</span></div>'
            },
            shared: true, useHTML: true, shape: 'square', borderWidth: 0, shadow: false, backgroundColor: null,
        }
        dataChart = []
        const weekDayArray = fillArray(data.dayOfWeek, 1, 7)
        dataChart.push({ name: "Monday", y: weekDayArray[1].sum + 0.1})
        dataChart.push({ name: "Tuesday", y: weekDayArray[2].sum + 0.1})
        dataChart.push({ name: "Wednesday", y: weekDayArray[3].sum + 0.1})
        dataChart.push({ name: "Thursday", y: weekDayArray[4].sum + 0.1})
        dataChart.push({ name: "Friday", y: weekDayArray[5].sum + 0.1})
        dataChart.push({ name: "Saturday", y: weekDayArray[6].sum + 0.1})
        dataChart.push({ name: "Sunday", y: weekDayArray[0].sum + 0.1})
        // fillArray(data.dayOfWeek, 1, 7).forEach(function (item){
        //     dataChart.push({ name: item._id, x: "a" + item._id.toString(), y: item.sum + 0.1})
        // })
        generalChart['series'] = [{
            data: dataChart,
            states: {hover: {color: '#00e054'}},
            color: '#445566',
        }]
        Highcharts.chart('watchedDayWeek', generalChart)

        // PIES
        const pies = ['currentYear', 'rewatch', 'reviews']
        for (const type of pies) {
            if (type === 'rewatch'){
                data[type] = data.total - data[type]
            }
            dataChart = [
                {name: '', y: data[type]/data.total, color: '#00e054'},
                {name: '', y: (data.total - data[type])/data.total, color: '#456'}
            ]
            Highcharts.chart(type + 'pie', {
                chart: {type: 'pie', backgroundColor: 'transparent', margin: 0, border: 0},
                xAxis: {labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
                legend: {enabled: false},
                title: {text: null},
                yAxis: {labels: {enabled: false}, title: false, lineColor: 'transparent', visible: false},
                tooltip: {
                    formatter: function () {
                        return '<div class="ttYear"><span class="ttPie">' + (this.y * 100).toFixed(1).toString() + '% <span class="gray">(' + parseInt(this.y * data.total).toString() + ' of '+data.total+')</span></span></div>'
                    },
                    shared: true,
                    useHTML: true,
                    shape: 'square',
                    borderWidth: 0,
                    shadow: false,
                    backgroundColor: null,
                },
                label: {enabled: false},
                plotOptions: {pie: {size: 150, borderWidth: 0, dataLabels: {connectorWidth: 0}}},
                series: [{
                    data: dataChart,
                    states: {
                        hover: {halo: {size: 0}, animation: {duration: 0}},
                        inactive: {enabled: false, opacity: 1},
                    },
                }]
            })
        }
    }

    async function setVectorMap(){
        //WORLDMAP
        let worldData = {}
        //console.log(data.mw_countries)
        data.mw_countries.forEach(item => {worldData[item._id] = item.sum})
        let worldDataUri = {}
        data.mw_countries.forEach(item => {worldDataUri[item._id] = getUri(item.name)})
        let worldDataName = {}
        data.mw_countries.forEach(item => {worldDataName[item._id] = item.name})
        jsVectorMap({
            selector: '#world-map',
            map: 'world',
            //series: {regions: [{values: worldData}]},
            visualizeData: {values: worldData, scale: ['#007834', '#00e054']},
            regionStyle: {initial: {fill: '#303c44'}, hover: {fill: '#40bcf4'}},
            showTooltip: true,
            onRegionTooltipShow: function (event, tooltip, code) {
                let value = 0
                let country = tooltip.text()
                if (typeof worldData[code] !== 'undefined') {
                    value = worldData[code];
                    country = worldDataName[code]
                }
                tooltip.text(
                    '<div class="box"><span class="ttTitle">'+country+'</span>'+
                    '<span class="ttSubtitle">Films watched: '+value+'</span>' +
                    '</div><div class="ttPointer"></div>', true)
            },
            onRegionClick: function (e, el, code) {if (!isMobile) {clickMap(el)}},
            onMarkerClick: function (e, code) {alert(code)}
        })

        function clickMap(el) {
            if (typeof worldDataUri[el] !== 'undefined') {
                if(year === ''){
                    window.open(lbdurl+data.username+'/films/country/' + worldDataUri[el] + '/', '_blank');
                }else{
                    window.open(lbdurl+data.username+'/films/diary/for/'+yearnum+'/country/' + worldDataUri[el] + '/by/rating', '_blank');
                }
            }
        }
    }

    function setCharts(){
        let offsetContainer
        try{
            offsetContainer = document.getElementsByClassName('chart-container')[0].offsetWidth
        } catch{offsetContainer = 0}
        if (jQuery('#isMobile').is(':visible')) {isMobile = true}
        if(year === ''){
            setAllTimeCharts(offsetContainer)
        }else{
            setYearCharts(offsetContainer)
        }
        setVectorMap()
    }

    function setObserver(){
        const images = document.querySelectorAll(".holeperson");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTmdb(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );
        images.forEach((img) => observer.observe(img))
    }

    function init() {
        //console.log(data.milestones)
        setCharts()
        setObserver()
    }

    function last(inputArray){
        return inputArray[inputArray.length - 1]
    }

    function arrayLength(inputArray){
        if (inputArray !== undefined){
            return inputArray.length
        }
        return 0
    }

    function handleUpdate(){
        localStorage.clear()
        window.location.search = ''
    }

    onMount(async () => {
        init()
    })

</script>

<!--{JSON.stringify(data._id, null, 2)}-->
<div class="headerbar">
    <a href="/"><img src="/images/logo.webp" alt="statsboxdlogo" class="logoup"/></a>
    <div class="navbar">
        <a class="" href="//github.com/GiuDiMax/Statsboxd" target="_blank">Repo</a>
        <a href="//t.me/giudimax" target="_blank">Contact Me</a>
        <a class="" href="//buymeacoffee.com/giudimax" target="_blank">Support me</a>
    </div>
</div>
<div class="content" id="content" on:load={init()}>
    {#if data.hasOwnProperty('yearsStats') }
        <div class="popupYearContainer {year!=='' ? 'popupYear2Container' : ''} " on:mouseleave={()=>{showYears = false}}>
            <a href="#" class="popupButton" data-show="popupYear" on:click={()=>{showYears = !showYears}}>
                <div class="arrow-down"></div>
            </a>
            <div id="popupYear" class="popupYear {showYears ? '' : 'hide'}">
                <div class="arrow-up"></div>
                <div class="listaAnni">
                    <div>
                        <a href="?username={ data.username }">All time</a>
                        {#each data['yearsStats'] as y }
                            <a href="?username={ data.username }&year={ y }">{ y }{#if y === new Date().getUTCFullYear() }...{/if}</a>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <section class="mainTitlesec">
        <div class="constraint {year!=='' ? 'constraint_full' : 'constraint_year'}">
            <div class="mainT">
                {#if year === '' }
                    <h1 class="mainTitle">A Life in Film</h1>
                {:else}
                    <h1 class="mainTitle yearTitle">{ yearnum }</h1>
                {/if}
            </div>
            <svg class="pattern -left" height="390" role="presentation" viewBox="0 0 320 390" width="320"
                 xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(318 70)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="86"></rect>
                        <rect fill="#40BCF4" height="77" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="202"></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="238"></rect>
                    </g>
                    <g transform="translate(298 121)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="55"></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="22" rx="2" width="4" y="169"></rect>
                    </g>
                    <g transform="translate(278 111)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="66"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="52" rx="2" width="4" y="152"></rect>
                    </g>
                    <g transform="translate(258 84)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="78"></rect>
                        <rect fill="#FF8000" height="52" rx="2" width="4" y="201"></rect>
                        <rect fill="#40BCF4" height="60" rx="2" width="4"></rect>
                    </g>
                    <g transform="translate(238 80)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="96"></rect>
                        <rect fill="#00E054" height="20" rx="2" width="4" y="68"></rect>
                        <rect fill="#40BCF4" height="47" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="212"></rect>
                    </g>
                    <g transform="translate(218 96)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="48"></rect>
                        <rect fill="#40BCF4" height="18" rx="2" width="4" y="12"></rect>
                        <rect fill="#40BCF4" height="4" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="22" rx="2" width="4" y="144"></rect>
                    </g>
                    <g transform="translate(198 111)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="46"></rect>
                        <rect fill="#00E054" height="4" rx="2" width="4" y="114"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="42" rx="2" width="4" y="142"></rect>
                    </g>
                    <g transform="translate(178 40)">
                        <rect fill="#00E054" height="100" rx="2" width="4" y="102"></rect>
                        <rect fill="#FF8000" height="12" rx="2" width="4" y="210"></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"></rect>
                    </g>
                    <g transform="translate(158 86)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="132"></rect>
                    </g>
                    <g transform="translate(138 86)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="132"></rect>
                    </g>
                    <g transform="translate(118 111)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="132"></rect>
                    </g>
                    <g transform="translate(98 82)">
                        <rect fill="#00E054" height="100" rx="2" width="4" y="102"></rect>
                        <rect fill="#FF8000" height="12" rx="2" width="4" y="210"></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"></rect>
                    </g>
                    <g transform="translate(78 74)">
                        <rect fill="#00E054" height="170" rx="2" width="4" y="51"></rect>
                        <rect fill="#40BCF4" height="4" rx="2" width="4"></rect>
                        <rect fill="#40BCF4" height="20" rx="2" width="4" y="23"></rect>
                        <rect fill="#FF8000" height="34" rx="2" width="4" y="246"></rect>
                    </g>
                    <g transform="translate(58 127)">
                        <rect fill="#00E054" height="40" rx="2" width="4" y="64"></rect>
                        <rect fill="#FF8000" height="74" rx="2" width="4" y="144"></rect>
                        <rect fill="#40BCF4" height="20" rx="2" width="4"></rect>
                    </g>
                    <g transform="translate(38 77)">
                        <rect fill="#00E054" height="90" rx="2" width="4" y="104"></rect>
                        <rect fill="#FF8000" height="64" rx="2" width="4" y="204"></rect>
                        <rect fill="#40BCF4" height="24" rx="2" width="4"></rect>
                        <rect fill="#40BCF4" height="50" rx="2" width="4" y="32"></rect>
                    </g>
                    <g transform="translate(18 117)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="84"></rect>
                        <rect fill="#FF8000" height="44" rx="2" width="4" y="184"></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="232"></rect>
                        <rect fill="#40BCF4" height="30" rx="2" width="4"></rect>
                    </g>
                    <g transform="translate(-2 127)">
                        <rect fill="#00E054" height="76" rx="2" width="4" y="42"></rect>
                        <rect fill="#FF8000" height="44" rx="2" width="4" y="194"></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"></rect>
                    </g>
                </g>
            </svg>
            <svg class="pattern -right" height="390" role="presentation" viewBox="0 0 320 390" width="320"
                 xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(318 63)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="67"></rect>
                        <rect fill="#40BCF4" height="58" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="62" rx="2" width="4" y="172"></rect>
                    </g>
                    <g transform="translate(298 88)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="59"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="42" rx="2" width="4" y="162"></rect>
                    </g>
                    <g transform="translate(278 78)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="86"></rect>
                        <rect fill="#40BCF4" height="70" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="60" rx="2" width="4" y="174"></rect>
                    </g>
                    <g transform="translate(258 94)">
                        <rect fill="#00E054" height="99" rx="2" width="4" y="70"></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="30" rx="2" width="4" y="196"></rect>
                    </g>
                    <g transform="translate(238 83)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="104"></rect>
                        <rect fill="#40BCF4" height="58" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="192"></rect>
                    </g>
                    <g transform="translate(218 108)">
                        <rect fill="#00E054" height="40" rx="2" width="4" y="79"></rect>
                        <rect fill="#40BCF4" height="48" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="62" rx="2" width="4" y="152"></rect>
                        <rect fill="#FF8000" height="4" rx="2" width="4" y="222"></rect>
                    </g>
                    <g transform="translate(198 78)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="112"></rect>
                        <rect fill="#40BCF4" height="80" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="30" rx="2" width="4" y="184"></rect>
                        <rect fill="#FF8000" height="10" rx="2" width="4" y="222"></rect>
                    </g>
                    <g transform="translate(178 64)">
                        <rect fill="#00E054" height="119" rx="2" width="4" y="100"></rect>
                        <rect fill="#40BCF4" height="68" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="10" rx="2" width="4" y="226"></rect>
                    </g>
                    <g transform="translate(158 91)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="88"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="184"></rect>
                    </g>
                    <g opacity=".8" transform="translate(138 100)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="63"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="82" rx="2" width="4" y="138"></rect>
                    </g>
                    <g transform="translate(118 100)">
                        <rect fill="#00E054" height="50" rx="2" width="4" y="66"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="172"></rect>
                    </g>
                    <g transform="translate(98 110)">
                        <rect fill="#00E054" height="30" rx="2" width="4" y="66"></rect>
                        <rect fill="#40BCF4" height="38" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="42" rx="2" width="4" y="131"></rect>
                        <rect fill="#FF8000" height="12" rx="2" width="4" y="182"></rect>
                    </g>
                    <g transform="translate(78 107)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="46"></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="32" rx="2" width="4" y="149"></rect>
                    </g>
                    <g transform="translate(58 76)">
                        <rect fill="#00E054" height="60" rx="2" width="4" y="63"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4" y="18"></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="36" rx="2" width="4" y="185"></rect>
                    </g>
                    <g transform="translate(38 39)">
                        <rect fill="#00E054" height="74" rx="2" width="4" y="83"></rect>
                        <rect fill="#40BCF4" height="77" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="22" rx="2" width="4" y="214"></rect>
                    </g>
                    <g transform="translate(18 81)">
                        <rect fill="#00E054" height="70" rx="2" width="4" y="56"></rect>
                        <rect fill="#40BCF4" height="28" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="42" rx="2" width="4" y="172"></rect>
                    </g>
                    <g transform="translate(-2 101)">
                        <rect fill="#00E054" height="80" rx="2" width="4" y="36"></rect>
                        <rect fill="#40BCF4" height="10" rx="2" width="4"></rect>
                        <rect fill="#FF8000" height="72" rx="2" width="4" y="124"></rect>
                    </g>
                </g>
            </svg>
        </div>
        <div class="mainTitlesecBak"></div>
        <div class="mainTitlesecFade"></div>
        {#if year === '' }
            <h3 class="arrowcheck">
                <!--Your last update: { data.update }. <br />-->
                Do you like the project? The server and domain have management costs.<br />
                Consider <a target="_blank" href="//buymeacoffee.com/giudimax">supporting me</a>.
                <!--Have you already donated?: <a href='https://t.me/giudimax' target='_blank'>contact me on Telegram</a>.-->
            </h3>
        {/if}
        <div class="mainSubtitle">
            <!--<a href="{ lbdurl }{ data.username }">
                <img alt="{ data.username }" class="avatar lazy" data-src="{ data.img }" src="images/poster.jpg" />
            </a>-->
            <span><a target="_blank" class="clickable" href="{ lbdurl}{ data.username }">
                { data.name }</a>'s
                { year==='' ? 'all-time stats' : 'year in review' }
            </span>
        </div>
        {#if year === '' }
            <div class="buttonstart">
                <a id="updatebtn" on:click={handleUpdate} class="clickable seeallbutton updatebutton" href="{data.donator? '/?username=' + data.username + '&donator' : '/#'}">
                    <span class="material-symbols-rounded icon">sync</span>Update
                </a>
                <a class="clickable seeallbutton updatebutton collagebutton" href="/?username={ data.username }&collage&year={new Date().getFullYear()}&month={new Date().getMonth()}" target="_blank">
                    <span class="material-symbols-rounded icon">grid_on</span>Last month collage
                </a>
                <!--<a class="clickable seeallbutton updatebutton wrappedbutton" href="/?username={ data.username }&wrapped" target="_blank">
                    <span class="material-symbols-rounded icon">summarize</span>2024 Wrapped
                </a>-->
                <a class="clickable seeallbutton updatebutton recbutton" href="/?username={ data.username }&rec" target="_blank">
                    <span class="material-symbols-rounded icon">recommend</span>Film Recommendation
                </a>
            </div>
        {/if}
        <div class="numbersStats">
            {#if year === '' }
                <a href="//letterboxd.com/{ data.username }/films">
                    <span class="number">{ data.totalFilms }</span>
                    <span class="text">Films</span>
                </a>
                <div>
                    <span class="number">{ data.totalRuntime }</span>
                    <span class="text">Hours</span>
                </div>
                <div>
                    <span class="number">{ data.totalDirectors }</span>
                    <span class="text">Directors</span>
                </div>
                <div>
                    <span class="number">{ data.totalCountries }</span>
                    <span class="text">Countries</span>
                </div>
                {#if 'streak' in data }
                    <a href="//letterboxd.com/{ data.username }/films/diary/for/{ data['streak'].year }/{ data['streak'].month }/"
                       class="mostrap1">
                        <div class="pannello p1">
                            <div class="testo">At least one film per week,
                                starting { data['streak'].monthName } { data['streak'].year }</div>
                        </div>
                        <span class="number">{ data['streak'].max }w</span>
                        <span class="text">Longest Streak</span>
                    </a>
                {/if}
                {#if '2+filmDays' in data}
                    <div>
                        <span class="number">{ data['2+filmDays'] }</span>
                        <span class="text">2+ Film Days</span>
                    </div>
                {/if}
            {:else}
                <div>
                    <span class="number">{ data.total }</span>
                    <span class="text">Diary Entries</span>
                </div>
                <!--            <div>-->
                <!--                <span class="number">{ data.likes }</span>-->
                <!--                <span class="text">Films liked</span>-->
                <!--            </div>-->
                <div>
                    <span class="number">{ data.reviews }</span>
                    <span class="text">Reviews</span>
                </div>
                <div>
                    <span class="number">{ data.totalRuntime }</span>
                    <span class="text">Hours</span>
                </div>
            {/if}
        </div>
    </section>
    {#if year===''}
        <section class="sectionStats">
            <div class="sepline">
                <span>By release year</span>
                <div class="line"></div>
                <span class="clickable active" on:click={clickableFunction} data-hide="yearChart" data-hide2="years2" data-show="releaseYear" data-show2="years1">Films</span>
                {#if data.ru}
                    <span class="clickable" on:click={clickableFunction} data-show="ratingYear" data-show2="years1" data-hide="yearChart" data-hide2="years2">Ratings</span>
                {/if}
                {#if arrayLength(data['logsPerYear']) > 0}
                    <span class="clickable" on:click={clickableFunction} data-show="diaryYear" data-show2="years2" data-hide="yearChart" data-hide2="years1">Diary</span>
                {/if}
            </div>
            <div class="chart-container">
                <div class="yearChart" id="releaseYear"></div>
                <div class="yearChart hide" id="ratingYear"></div>
                <div class="yearChart hide" id="diaryYear"></div>
            </div>
            {#if 'years' in data }
                <div class="years">
                    <span class="years1">{ data.years[0]._id }</span>
                    <span class="years1">{ last(data.years)._id }</span>
                    {#if data.logsPerYear.length > 0 }
                        <span class="years2 hide">{ data.logsPerYear[0]._id }</span>
                        <span class="years2 hide">{ last(data.logsPerYear)._id }</span>
                    {/if}
                </div>
            {/if}
        </section>
        {#if data.ru}
            <section class="sectionStats">
                <div class="sepline">
                    <span>Highest rated decades</span>
                    <div class="line"></div>
                </div>
                {#each data.decades as element }
                    <div class="decade">
                        <div class="decadeLeft">
                            <a href="//letterboxd.com/{ data.username }/films/rated/.5-5/decade/{ element._id }s/by/entry-rating/"
                               class="decadeTitle">{ element._id }s</a>
                            <div><img src="images/greystar.webp" alt="greystar"/><span
                                    class="decadeAverage">Average { element.avg }</span></div>
                        </div>
                        <div class="decPosters">
                            {#each element.imgs as element2}
                                <a class="poster decPosterImg" href="{ lbdurl }film/{ element2.uri }">
                                    <div class="containertextimg"><span>{ replaceDash(element2.uri) }</span></div>
                                    <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} src="images/poster.jpg" data-src="{ replaceSize(element2.img, 105, 70) }" alt="{ element.uri }"/>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/each}
            </section>
        {/if}
    {:else}
        <!--DIARY SECTION -->
        {#if data.ru}
            <section class="sectionStats">
                <div class="sepline">
                    <span>Highest rated films</span>
                    <div class="line"></div>
                    <span class="clickable active" on:click={clickableFunction} data-show="currentYearHRF" data-hide="secHRF">{yearnum}</span>
                    <span class="clickable" on:click={clickableFunction} data-show="pastYearHRF" data-hide="secHRF">Older</span>
                </div>
                <div class="">
                    <div id="currentYearHRF" class="secHRF filmList">
                        {#each getValues(data.topRatedCurrentYear) as element}
                            <div class="singleFilm">
                                <a class="poster" href="{lbdurl}{data.username}/film/{element._id}">
                                    <div class="containertextimg"><span>{ replaceDash(element._id) }</span></div>
                                    <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                         data-src="{replaceSize(element.poster, 165, 110)}"
                                         alt="{element._id}"/>
                                </a>
                                <div>
                                    <span class="sottotitolo stellineBig">{numToStars(element.r)}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div id="pastYearHRF" class="secHRF filmList hide">
                        {#each getValues(data.topRatedOtherYears) as element}
                            <div class="singleFilm">
                                <a class="poster" href="{lbdurl}{data.username}/film/{element._id}">
                                    <div class="containertextimg"><span>{replaceDash(element._id)}</span></div>
                                    <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                         data-src="{replaceSize(element.poster, 165, 110)}"
                                         alt="{element._id}"/>
                                </a>
                                <div>
                                    <span class="sottotitolo stellineBig">{numToStars(element.r)}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </section>
        {/if}
        <section class="sectionStats">
            <div class="sepline">
                <span>By week</span>
                <div class="line"></div>
            </div>
            <div class="chart-container weekChartcontainer">
                <div id="watchedWeek" class="weekChart"></div>
            </div>
            <div class="years">
                <span>Jan</span>
                <span>Dec</span>
            </div>
            <div class="watchedDivided">
                <div class="wd1">
                    <div class="wd1x">
                        <span class="big">{data.total}</span>
                        <span class="small">Films watched</span>
                    </div>
                    <img src="images/arrow.jpg" alt="arrow"/>
                    <div class="wd1x">
                        <span class="big">{(data.total/current_month).toFixed(1)}</span>
                        <span class="small">Average per month</span>
                    </div>
                    <img src="images/arrow.jpg" alt="arrow"/>
                    <div class="wd1x">
                        <span class="big">{(data.total/current_week).toFixed(1)}</span>
                        <span class="small">Average per week</span>
                    </div>
                </div>
                <div class="wd2">
                    <div id="watchedDayWeek" class="weekDayChart"></div>
                </div>
            </div>
        </section>
        <section class="sectionStats">
            <div class="sepline">
                <span>Milestones</span>
                <div class="line"></div>
            </div>
            <div class="msy">
                <div class="msx msx1">
                    <span>First Film</span>
                    <div class="singleFilm">
                        <a class="poster" href="{lbdurl}{data.username}/film/{data.first._id}">
                            <div class="containertextimg"><span>{replaceDash(data.first._id)}</span></div>
                            <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                 data-src="{replaceSize(data.first.poster, 165, 110)}"
                                 alt="{data.first._id}"/>
                        </a>
                        <div>
                            <span class="sottotitolo bigsotto">{formatDate1(data.first.date)}</span>
                        </div>
                    </div>
                </div>
                {#if data.milestones.length > 0 }
                    <div class="msx msx2">
                        <span>Diary Milestones</span>
                        <div class="filmList mw2">
                            {#each getValues(getSlice(data.milestones, 0, 5)) as element, index}
                                <div class="singleFilm">
                                    <a class="poster"
                                       href="{lbdurl}{data.username}/film/{element._id}/activity">
                                        <div class="containertextimg"><span>{replaceDash(element._id)}</span></div>
                                        <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy"
                                             src="images/poster.jpg"
                                             data-src="{replaceSize(element.poster, 165, 110)}"
                                             alt="{element._id}"/>
                                    </a>
                                    <div>
                                <span class="sottotitolo bigsotto">{(index+1)*50}th
                                    <span class="sottotitolo_milestones hideMobile">· {formatDate1(element.date)}</span>
                                </span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
                <div class="msx msx1">
                    <span>Last Film</span>
                    <div class="singleFilm">
                        <a class="poster" href="{lbdurl}{data.username}/film/{data.last._id}">
                            <div class="containertextimg"><span>{replaceDash(data.last._id)}</span></div>
                            <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                 data-src="{replaceSize(data.last.poster, 165, 110)}"
                                 alt="{data.last._id}"/>
                        </a>
                        <div>
                            <span class="sottotitolo bigsotto">{formatDate1(data.last.date)}</span>
                        </div>
                    </div>
                </div>
            </div>
            {#if data.mostWatched.length > 0}
                <div class="msy">
                    <div class="msx msxfull">
                        <span>Most Watched</span>
                        <div class="filmList mw2">
                            {#each getValues(data.mostWatched) as element}
                                <div class="singleFilm">
                                    <a class="poster"
                                       href="{lbdurl}{data.username}/film/{element.uri}/activity">
                                        <div class="containertextimg"><span>{replaceDash(element.uri)}</span></div>
                                        <img class="lazy" use:lazyImage on:load={handleImageLoad}
                                             src="images/poster.jpg"
                                             data-src="{replaceSize(element.poster, 165, 110)}"
                                             alt="{element.uri}"/>
                                    </a>
                                    <div>
                                        <span class="sottotitolo bigsotto">{element.sum} times</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        </section>
    {/if}
    <section class="sectionStats">
        <div class="sepline">
            <span>Genres, Countries & Languages</span>
            <div class="line"></div>
            {#if data.ru}
                <span class="clickable active" on:click={clickableFunction} data-show="MWGCL" data-hide="secGCL">Most Watched</span>
                <span class="clickable" on:click={clickableFunction} data-show="HRGCL" data-hide="secGCL">Highest Rated</span>
            {/if}
        </div>
        <div id="MWGCL" class="attributes-chart threeColumns secGCL">
            {#each [['genres', 'genre', 'rgb(0, 224, 84)'], ['countries', 'country', 'rgb(64, 188, 244)'], ['originallanguage','language', 'rgb(255, 128, 0)']] as type}
                <div class="labels2">
                    <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                    {#each getValues(getSlice(data[('mw_'+type[0])], 0, 10)) as element}
                        <div>
                            <a class="clickable label1"
                               href="{ lbdurl }{ data.username }/films/{year!=='' ? 'diary/for/'+yearnum.toString() + '/': ''}{type[1]}/{getUri( element['name'] )}">
                                { element['name'] }
                            </a>
                            <div>
                                <div class="genresFilms"
                                     style="width: {element['sum'] *100/ data[('mw_'+type[0])][0]['sum'] }%;">
                                    <span>{ element['sum'] } films</span></div>
                                <div class="progressBarWithVal"
                                     style="width:{element['sum']*100/ data[('mw_'+type[0])][0]['sum'] }%; background-color:{ type[2] };"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
        {#if data.ru }
            <div id="HRGCL" class="attributes-chart threeColumns secGCL hide">
                {#each [['genres', 'genre', 'rgb(72, 255, 132)'], ['countries', 'country', 'rgb(116, 240, 255)'], ['originallanguage','language', 'rgb(255, 184, 96)']] as type}
                    <div class="labels2">
                        {#each getValues(getSlice(data[('tr_'+type[0])], 0, 10)) as element}
                            <div>
                                <a class="clickable label1"
                                   href="{ lbdurl }{ data.username }/films/{year!=='' ? 'diary/for/'+yearnum.toString() : ''}/rated/.5-5/{type[1]}/{getUri(element['name'])}">
                                    { element['name'] }
                                </a>
                                <div>
                                    <div class="genresFilms"
                                         style="width: {element['avg'] *100/ data[('tr_'+type[0])][0]['avg']  }%;">
                                        <span>Average: {element['avg'] }</span></div>
                                    <div class="progressBarWithVal"
                                         style="width:{element['avg']*100/ data[('tr_'+type[0])][0]['avg'] }%; background-color:{ type[2] };"></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
                <div class="infoavg">Themes and nanogenres with at least four rated films are included.</div>
            </div>
        {/if}
    </section>
    <section class="sectionStats">
        <div class="sepline">
            <span>Themes & Nanogenres®</span>
            <div class="line"></div>
            {#if data.ru }
                <span class="clickable active" on:click={clickableFunction} data-show="MWTN" data-hide="secTN">Most Watched</span>
                <span class="clickable" on:click={clickableFunction} data-show="HRTN" data-hide="secTN">Highest Rated</span>
            {/if}
        </div>
        <div id="MWTN" class="attributes-chart twocolumn secTN">
            {#each ['theme', 'nanogenre'] as type }
                <div class="labels">
                    <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                    {#each getValues(getSlice(data['mw_' + type + 's'], 0, 10)) as element}
                        <a class="clickable label2" href="{ lbdurl }{ data.username }/films/{year!=='' ? 'diary/for/'+yearnum.toString() : ''}/{ element['type'] }/{ getUri(element['name'], element['uri']) }">
                            <span class="leftText">{element['name'] }</span>
                            <span class="bold right">{ element['sum'] } films</span>
                            <div class="labcontainer"
                                 style="width:{ element['sum'] * 100 /elementAt(data['mw_' + type + 's'],0)['sum'] }%;">
                            </div>
                        </a>
                    {/each}
                </div>
            {/each}
        </div>
        {#if data.ru }
            <div id="HRTN" class="attributes-chart twocolumn secTN hide">
                {#each ['theme', 'nanogenre'] as type }
                    <div class="labels">
                        <!--{#each Array.from({ length: 10 }, (_, i) => i) as i }-->
                        {#each getValues(getSlice(data['tr_' + type + 's'], 0, 10)) as element}
                            <a class="clickable label2" href="{ lbdurl }{ data.username }/films/{year!=='' ? 'diary/for/'+yearnum.toString() : ''}/rated/.5-5/{ element['type'] }/{ getUri(element['name'], element['uri']) }">
                                <span class="leftText">{ element['name'] }</span>
                                <span class="bold right">Average: { element['avg'] }</span>
                                <div class="labcontainer"
                                     style="width:{ element['avg'] * 100 /elementAt(data['tr_' + type + 's'],0)['avg'] }%;">
                                </div>
                            </a>
                        {/each}
                    </div>
                {/each}
                <div class="infoavg">Themes and nanogenres with at least three rated films are included.</div>
            </div>
        {/if}
    </section>

    <!-- ALL TIME SECTION -->
    {#if year===''}
        <section class="sectionStats">
            <div class="sepline">
                <span>List progress</span>
                <div class="line"></div>
            </div>
            <div class="pielists">
                {#each Array.from({ length: arrayLength(data['lists']) }, (_, i) => i) as i }
                    <div class="donut"
                         style="background:conic-gradient(#40bcf4 0deg { 3.6* elementAt(data['lists'],i).perc }deg,#303c44 { 3.6* elementAt(data['lists'],i).perc }deg 360deg);">
                        <a class="hole" href="{ lbdurl }{ elementAt(data['lists'],i)._id }">
                            <span class="listtitle">{ elementAt(data['lists'],i).name }</span>
                            <span class="listperc">{ parseInt(elementAt(data['lists'],i).perc) }%</span>
                            <span class="listnum">{ elementAt(data['lists'],i).num } of { elementAt(data['lists'],i).tot }</span>
                        </a>
                    </div>
                {/each}
            </div>
        </section>
        <section class="sectionStats">
            <div class="sepline">
                <span>Collections</span>
                <div class="line"></div>
                <span class="clickable active" on:click={clickableFunction} data-show="completeCollection" data-hide="collectionsx">Complete</span>
                <span class="clickable" on:click={clickableFunction} data-show="almostCollection" data-hide="collectionsx">Almost Complete</span>
            </div>
            <div class="collections">
                {#each Array.from({ length: arrayLength(data['collections']) }, (_, i) => i) as i }
                    <div id="{ elementAt(data['collections'],i)['_id'] }Collection"
                         class="collectionsx {elementAt(data['collections'],i)._id !== 'complete' ? 'hide' : ''}">
                        {#each elementAt(data['collections'],i).collections as element}
                            <div class="singleCollection">
                                <a class="threeposters"
                                   href="{ lbdurl }films/in/{ element['uri'] }/by/release-earliest/size/large/">
                                    {#each element.posters as poster }
                                        <img use:lazyImage class="lazy" src="images/poster_70.jpg" data-src="{ replaceSize(poster, 105, 70) }" alt=""/>
                                    {/each}
                                </a>
                                <span>
                            <a class="name" href="{lbdurl}films/in/{element['uri']}/by/release-earliest/size/large/">
                                {element['name']}
                            </a>
                                    {element['num']} watched
                        </span>
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </section>
        {#if arrayLength(data['mostWatched'])>0 }
            <section class="sectionStats">
                <div class="sepline">
                    <span>Most Watched</span>
                    <div class="line"></div>
                </div>
                <div class="filmList hideLast2">
                    {#each Array.from({ length: arrayLength(data['mostWatched']) }, (_, i) => i) as i }
                        <div class="singleFilm">
                            <a class="poster" href="{ lbdurl }film/{  elementAt(data['mostWatched'],i)._id }">
                                <div class="containertextimg"><span>{ replaceDash(elementAt(data['mostWatched'],i)._id) }</span></div>
                                <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                     data-src="{ replaceSize(elementAt(data['mostWatched'],i).img, 165, 110) }"
                                     alt="{ elementAt(data['mostWatched'],i)._id }"/>
                            </a>
                            <div>
                                <span class="sottotitolo bigsotto">{ elementAt(data['mostWatched'],i).watches } times</span>
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="noflex">
                    <a class="clickable seeallbutton" href="{ lbdurl }{ data.username }/films/diary/by/diary-count/">see in diary</a>
                </div>
            </section>
        {/if}
        {#if data.ru}
            <section class="sectionStats">
                <div class="sepline">
                    <span>Rated higher then average</span>
                    <div class="line"></div>
                </div>
                <div class="filmList hideLast">
                    {#each Array.from({ length: arrayLength(data['highers']) }, (_, i) => i) as i }
                        <div class="singleFilm">
                            <a class="poster" href="{ lbdurl }film/{ elementAt(data['highers'],i)._id }">
                                <div class="containertextimg"><span>{ replaceDash(elementAt(data['highers'],i)._id) }</span></div>
                                <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                     data-src="{ replaceSize(elementAt(data['highers'],i).img, 165, 110) }" alt="{ elementAt(data['highers'],i)._id }"/>
                            </a>
                            <div>
                                <span class="sottotitolo stelline">{ numToStars(elementAt(data['highers'],i).r) }</span>
                                <span class="sottotitolo">vs { elementAt(data['highers'],i).avg }</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
            <section class="sectionStats">
                <div class="sepline">
                    <span>Rated lower then average</span>
                    <div class="line"></div>
                </div>
                <div class="filmList hideLast">
                    {#each getValues(data['lowers']) as element}
                        <div class="singleFilm">
                            <a class="poster" href="{ lbdurl }film/{ element._id }">
                                <div class="containertextimg"><span>{ replaceDash(element._id) }</span></div>
                                <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                     data-src="{ replaceSize(element.img, 165, 110) }" alt="{ element._id }"/>
                            </a>
                            <div>
                                <span class="sottotitolo stelline">{ numToStars(element.r) }</span>
                                <span class="sottotitolo">vs { element.avg }</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- DIARY SECTION -->
    {:else}

        <section class="sectionStats">
            <div class="sepline">
                <span>Breakdown</span>
                <div class="line"></div>
            </div>
            <div class="breakdown">
                <div class="piecharts">
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">{yearnum} Releases</span>
                            <span class="">Older</span>
                        </div>
                        <div id="currentYearpie" class="piech2"></div>
                    </div>
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">Watches</span>
                            <span class="">Re-watches</span>
                        </div>
                        <div id="rewatchpie" class="piech2"></div>
                    </div>
                    <div class="piechart">
                        <div class="legend">
                            <span class="green">Reviewed</span>
                            <span class="">Not Reviewed</span>
                        </div>
                        <div id="reviewspie" class="piech2"></div>
                    </div>
                </div>
                {#if data.ru}
                    <div class="ratingSpreadsection">
                        <img src="images/1stars.png" alt="1star"/>
                        <div id="ratingSpread" class="ratingSpread"></div>
                        <img src="images/5stars.png" alt="5stars"/>
                    </div>
                    <span class="linetitle">Rating Spread</span>
                {/if}
            </div>
        </section>
    {/if}

    {#each [['actor', 'Stars', 'a', 'actor'], ['director', 'Directors', 'd', 'director']] as role}
        <section class="sectionStats">
            <div class="sepline">
                <span>{ role[1] }</span>
                <div class="line"></div>
                <span class="clickable active" on:click={clickableFunction} data-show="{ role[0] }sWatch" data-hide="{ role[0] }sbis">Most Watched</span>
                {#if data.ru }<span class="clickable" on:click={clickableFunction} data-show="{ role[0] }sRat" data-hide="{ role[0] }sbis">Highest Rated</span>{/if}
            </div>
            <div class="{ role[0] }s2">
                {#each [['Watch', 'mw_', 'w', ''], ['Rat', 'tr_', 'r', 'hide']] as type}
                    <section id="{ role[0] }s{ type[0] }" class="{ role[0] }sbis { type[3] }">
                        {#each [['1', ''], ['2', 'hide']] as num}
                            <div id="{role[0]}s{type[0]}{num[0]}" class="{role[0]}s people {num[1]}">
                                {#each getValues(getSlice(data[type[1]+role[3]], ifThenElse(num[0] === '1',0,10), ifThenElse(num[0] === '1',10,20))) as element }
                                    {#if element.hasOwnProperty('name')}
                                        <div class="container_people">
                                            <a href="{ lbdurl }{ data.username }/films{year!=='' ? '/diary/for/'+yearnum.toString() : ''}/with/{ role[0] }/{ element.uri }">
<!--                                                <img class="holeperson" on:load={setTmdb} src="images/{role[0]}.jpg" data-tmdb="{ element.tmdb }" alt="{ element.uri }"/>-->

                                                <img class="holeperson" src="images/{role[0]}.jpg" data-tmdb="{element.tmdb}" alt="{element.uri}"/>

                                            </a>
                                            <a class="clickable" href="{ lbdurl }{ data.username }/films{year!=='' ? '/diary/for/'+yearnum.toString() : ''}/with/{role[0]}/{element.uri}">
                                                {#if element.hasOwnProperty('name')}{ element.name }{:else}{ element._id }{/if}
                                            </a>
                                            {#if type[2]==='w' }
                                                <a class="sottotitolo" href="{ lbdurl }{ data.username }/films{year!=='' ? '/diary/for/'+yearnum.toString() : ''}/with/{ role[0] }/{ element.uri }">
                                                    { element.sum } films</a>
                                            {:else}
                                                <span class="sottotitolo">★ { element.avg }</span>
                                            {/if}
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        {/each}
                        <div class="noflex">
                            <a class="clickable { role[2] }{ type[2] }2 seeallbutton" on:click={clickableFunction} data-show="{ role[0] }s{ type[0] }2" data-hide="{ role[2] }{ type[2] }2">see more</a>
                        </div>
                    </section>
                {/each}
            </div>
        </section>
    {/each}

    <section class="sectionStats">
        <div class="sepline">
            <span>Crew & Studios</span>
            <div class="line"></div>
            <span class="clickable active" on:click={clickableFunction} data-show="crewmw" data-hide="crewbis">Most Watched</span>
            {#if data.ru }<span class="clickable" on:click={clickableFunction} data-show="crewtr" data-hide="crewbis">Highest Rated</span>{/if}
        </div>
        {#each ['mw', 'tr'] as type}
            <section id="crew{type}" class="crewbis {type === 'tr' ? 'hide' : ''}">
                {#each getValues(roles) as role}
                    <div class="role">
                        <span class="titlerole">{role[1]}</span>
                        {#each getValues(getSlice(data[type+'_'+role[0]],0,20)) as element,i }
                            {#if element.hasOwnProperty('name') }
                                <div class="{ type }limit {i > 5 ? 'hide' : ''}">
                                    <a class="clickable"
                                       href="{ lbdurl }{ data.username }/films{year!=='' ? '/diary/for/'+yearnum.toString() : ''}/with/{ role[2] }/{ element.uri }"
                                    >
                                        {#if element.hasOwnProperty('name') }{element.name}{:else}{element.uri}{/if}
                                    </a>
                                    <span class="sottotitolo">
                        {#if type === 'mw' }{element.sum}{:else}{element.avg}{/if}
                    </span>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/each}
                <div class="noflex">
                    <a class="clickable {type}btn seeallbutton" on:click={clickableFunction} data-class-show="{type}limit" data-hide="{type}btn">see more</a>
                </div>
            </section>
        {/each}
    </section>
    {#if year !== ''}
        <section class="sectionStats">
            <div class="sepline">
                <span>Highs and Lows</span>
                <div class="line"></div>
            </div>
            <div class="highLow">
                {#each [['best', 'Highest Average'],['worst', 'Lowest Average'],
                    ['popular', 'Most Popular'],['obscure', 'Most Obscure']] as type }
                    <div class="singleFilm">
                        <span class="suptitle">{type[1]}</span>
                        <a class="poster" href="{lbdurl}film/{data[type[0]]._id}">
                            {#if data[type[0]].hasOwnProperty('poster')}
                                <div class="containertextimg"><span>{replaceDash(data[type[0]]._id)}</span></div>
                                <img class="lazy" src="images/poster.jpg" use:lazyImage on:load={handleImageLoad}
                                     data-src="{replaceSize(data[type[0]].poster, 165, 110)}"
                                     alt="{data[type[0]]._id}"/>
                            {:else}
                                <div class="containertextimg"><span>{replaceDash(data[type[0]]._id)}</span></div>
                                <img class="lazy" src="images/poster.jpg" use:lazyImage on:load={handleImageLoad}
                                     alt="{data[type[0]]._id}"/>
                            {/if}
                        </a>
                        <div class="sottofilm">
                            {#if data[type[0]].hasOwnProperty('avg')}
                                <img src="images/orangestar.jpg"/>
                                <span class="sottotitolo stellamedia">{data[type[0]].avg.toFixed(1)}</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </section>

        <section class="sectionStats">
            <div class="sepline">
                <span>Rated higher then average</span>
                <div class="line"></div>
            </div>
            <div class="filmList hideLast">
                {#each Array.from({ length: arrayLength(data['highers']) }, (_, i) => i) as i }
                    <div class="singleFilm">
                        <a class="poster" href="{ lbdurl }film/{ elementAt(data['highers'],i)._id }">
                            <div class="containertextimg"><span>{ replaceDash(elementAt(data['highers'],i)._id) }</span></div>
                            <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                 data-src="{ replaceSize(elementAt(data['highers'],i).img, 165, 110) }" alt="{ elementAt(data['highers'],i)._id }"/>
                        </a>
                        <div>
                            <span class="sottotitolo stelline">{ numToStars(elementAt(data['highers'],i).r) }</span>
                            <span class="sottotitolo">vs { elementAt(data['highers'],i).avg }</span>
                        </div>
                    </div>
                {/each}
            </div>
        </section>
        <section class="sectionStats">
            <div class="sepline">
                <span>Rated lower then average</span>
                <div class="line"></div>
            </div>
            <div class="filmList hideLast">
                {#each getValues(data['lowers']) as element}
                    <div class="singleFilm">
                        <a class="poster" href="{ lbdurl }film/{ element._id }">
                            <div class="containertextimg"><span>{ replaceDash(element._id) }</span></div>
                            <img use:lazyImage on:load={handleImageLoad} on:error={handleImageError} class="lazy" src="images/poster.jpg"
                                 data-src="{ replaceSize(element.img, 165, 110) }" alt="{ element._id }"/>
                        </a>
                        <div>
                            <span class="sottotitolo stelline">{ numToStars(element.r) }</span>
                            <span class="sottotitolo">vs { element.avg }</span>
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    {/if}
    <section class="wMap noselect">
        <span class="wmTitle">World Map</span>
        <div class="worldmap noselect" id="world-map"></div>
    </section>
</div>
