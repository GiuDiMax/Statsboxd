//export let baseUrl = "https://worker.statsboxd.top/"
export let baseUrl = "https://statsboxd-worker.vercel.app/"
if(import.meta.env.VITE_TEST>0){baseUrl = 'http://localhost:3001/'}

export const tmdb_key = '03209f50e8253cf416b595048aced2ff'
export const lbdurl = "https://letterboxd.com/"

export const roles = [['codirector', 'Co-Directors', 'co-director'],
    ['assistantdirector', 'Asst. Directors', 'assistant-director'],
    ['additionaldirecting', 'Add. Directing', 'additional-directing'],
    ['producer', 'Producers', 'producer'],
    ['executiveproducer', 'Exec. Producers', 'executive-producer'],
    ['writer', 'Writers', 'writer'],
    ['originalwriter', 'Original Writers', 'original-writer'],
    ['casting', 'Casting', 'casting'],
    ['editor', 'Editors', 'editor'],
    ['cinematography', 'Cinematography', 'cinematography'],
    ['cameraoperator', 'Camera Operators', 'camera-operator'],
    ['lighting', 'Lighting', 'lighting'],
    ['additionalphotography', 'Add. Photography', 'additional-photography'],
    ['productiondesign', 'Production Design', 'production-design'],
    ['artdirection', 'Art Direction', 'art-direction'],
    ['setdecoration', 'Set Decoration', 'set-decoration'],
    ['specialeffects', 'Special Effects', 'special-effects'],
    ['visualeffects', 'Visual Effects', 'visual-effects'],
    ['titledesign', 'Title Design', 'title-design'],
    ['stunts', 'Stunts', 'stunts'],
    ['choreography', 'Choreography', 'choreography'],
    ['composer', 'Composers', 'composer'],
    ['songs', 'Songs', 'songs'],
    ['sound', 'Sounds', 'sound'],
    ['costumes', 'Costume Design', 'costume-design'],
    ['makeup', 'MakeUp', 'makeup'],
    ['hairstyling', 'Hairstyling', 'hairstyling'],
    ['studio', 'Studios', 'studio']]