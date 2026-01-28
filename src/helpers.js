import { tmdb_key, lbdurl } from './config.js'

export function elementAt(array, index) {
    try { return array[parseInt(index)] }
    catch { return "" }
}

export function replaceDash(str) {
    try { return str.replace("-", " ") }
    catch { return "" }
}

export function getUri(obj, obj2 = null) {
    if (obj2 !== null && obj2.length > 0) { return obj2 }
    if (obj === undefined || obj === null) { return "" }
    if (obj.toLowerCase().includes('persian')) { return 'persianfarsi' }
    return obj.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/:/g, '').replace(/,/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/'/g, '-').replace(/\s+/g, '-');
}

export function ifNoneThenZero(n) {
    if (n === null || n === undefined) { return 0 }
    return parseFloat(n)
}

export function numToStars(num) {
    let result = ""
    if (num !== null && num !== undefined) {
        result = "★".repeat(parseInt(num))
    }
    if (num > parseInt(num)) {
        result = result + "½"
    }
    return result
}

export function getValues(arr) {
    if (!arr) return []
    if (typeof arr.values === 'function') {
        return Array.from(arr.values())
    }
    return arr
}

export function formatDate1(dateString) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(dateString);
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    return `${month} ${day}`;
}

export function getSlice(arr, start, stop) {
    try {
        if (!arr) return []
        if (arr.length >= stop) {
            return arr.slice(start, stop)
        } else {
            return arr.slice(start, arr.length)
        }
    }
    catch { return arr || [] }
}

export function ifThenElse(control, istrue, isfalse) {
    if (control) { return istrue }
    else { return isfalse }
}

export function replaceSize(src, height = 165, width = 110) {
    try {
        if (src !== null && src !== undefined) {
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
    } catch { }
    return ""
}

export function getWeek(y, nweek) {
    nweek = nweek - 1
    var startdate = new Date(Date.UTC(y, 0, 1))
    startdate.setDate(startdate.getUTCDate() + ((nweek - 1) * 7))
    var dayweek = startdate.getUTCDay()
    var giorniAggiuntivi = (dayweek === 0) ? 1 : (8 - dayweek)
    startdate.setDate(startdate.getUTCDate() + giorniAggiuntivi)
    var stopdate = new Date(startdate)
    stopdate.setDate(stopdate.getUTCDate() + 6)
    if (stopdate.getTime() === startdate.getTime()) {
        return startdate.toLocaleString('en', { month: 'short' }) + ' ' + startdate.getUTCDate()
    }
    if (stopdate.getUTCMonth() === startdate.getUTCMonth()) {
        return startdate.toLocaleString('en', { month: 'short' }) + ' ' + startdate.getUTCDate() + ' — ' + stopdate.getUTCDate()
    }
    return startdate.toLocaleString('en', { month: 'short' }) + ' ' + startdate.getUTCDate() + ' — ' + stopdate.toLocaleString('en', { month: 'short' }) + ' ' + stopdate.getUTCDate()
}

export function fillArray(array, min, max) {
    const array2 = [];
    let z = 0;
    for (let i = min; i <= max; i++) {
        try {
            if (array[z] && array[z]['_id'] === i) {
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

export function getWeeksInYear(year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const isLeapYear = new Date(year, 1, 29).getUTCMonth() === 1;
    return firstDayOfYear.getUTCDay() === 4 || (isLeapYear && firstDayOfYear.getUTCDay() === 3) ? 53 : 52;
}

export function last(inputArray) {
    if (!inputArray || inputArray.length === 0) return null
    return inputArray[inputArray.length - 1]
}

export function arrayLength(inputArray) {
    if (inputArray !== undefined && inputArray !== null) {
        return inputArray.length
    }
    return 0
}

export { tmdb_key, lbdurl };
