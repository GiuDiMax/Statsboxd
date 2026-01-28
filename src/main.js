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
import { mount } from 'svelte'

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username')
const idx = urlParams.get('id')
const year = parseInt(urlParams.get('year'))
const month = parseInt(urlParams.get('month'))
const collage = urlParams.get('collage')
const wrapped = urlParams.get('wrapped')
const donator = urlParams.get('donator')
const rec = urlParams.get('rec')

const target = document.getElementById('app');
let app;

if (username !== null && rec !== null) {
  app = mount(AppRec, { target, props: { username } })
} else if (idx !== null && donator !== null) {
  app = mount(AppDonator, { target, props: { username, idx } })
} else if (username !== null && collage !== null) {
  app = mount(AppCollage, { target, props: { username, year, month } })
} else if (username !== null && !isNaN(year)) {
  app = mount(AppYearStats, { target, props: { username, year } })
} else if (username !== null && wrapped !== null) {
  app = mount(AppWrapped, { target, props: { username } })
} else if (username !== null) {
  app = mount(AppStats, { target, props: { username } })
} else {
  app = mount(AppFile, { target })
}

export default app;