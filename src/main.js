//import App from './App.svelte'
//import createApp from 'svelte';
import AppStats from './AppStats.svelte'
import AppYearStats from './AppYearStats.svelte'
import AppFile from './AppFile.svelte'
import AppCollage from './AppCollage.svelte'
import AppWrapped from './AppWrapped.svelte'
import AppDonator from './AppDonator.svelte'
import AppRec from './AppRec.svelte'
import './assets/css/font.css'
import './assets/css/main.css'
import './assets/css/mobile.css'
import './assets/css/other.css'

//const appBaseUrl = ''
//const pathSplit = window.location.href.split(import.meta.env.BASE_URL)[1].split("/")
const urlParams = new URLSearchParams(window.location.search);
let username = urlParams.get('username')
let year = parseInt(urlParams.get('year'))
let month = parseInt(urlParams.get('month'))
let collage = urlParams.get('collage')
let wrapped = urlParams.get('wrapped')
let donator = urlParams.get('donator')
let rec = urlParams.get('rec')
//if (pathSplit.length > 0 && pathSplit[0] !== ''){username = pathSplit[0]}
//if (pathSplit.length > 1 && pathSplit[1] !== ''){year = parseInt(pathSplit[1])}
let app;
if(username !== null && rec !== null) {
  app = new AppRec({target: document.getElementById('app'), props: {username: username}})
}else if(username !== null && donator !== null) {
  app = new AppDonator({target: document.getElementById('app'), props: {username: username}})
}else if(username !== null && collage !== null) {
  app = new AppCollage({target: document.getElementById('app'), props: {username: username, year: year, month: month}})
}else if(username !== null && !isNaN(year)) {
  app = new AppYearStats({target: document.getElementById('app'), props: {username: username, year: year}})
}else if(username !== null && wrapped !== null) {
  app = new AppWrapped({target: document.getElementById('app'), props: {username: username}})
}else if(username !== null) {
  app = new AppStats({target: document.getElementById('app'), props: {username: username}})
} else{
  app = new AppFile({target: document.getElementById('app')})
}
export default app;