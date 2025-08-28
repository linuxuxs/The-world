let timer = document.getElementById("countdown");
const pause = document.getElementById("pause");
const start = document.getElementById("start");
const stop = document.getElementById("stop");
const settings = document.getElementById("choose")

const settingsPanel = document.getElementById("settingsPanel")
const setButn = document.getElementById("set");
const input = document.getElementById("input");
const span = document.getElementById("x");
let settingsState = false;

const toggle = document.getElementById("toggle");
const timerPanel = document.getElementById("timer");
const musicBtn = document.getElementById("muteBtn")
//in seconds.
let initial = 10;
let remain = initial;
let interval = null;
let state = "stopped";

function convert(){
    //HH:MM:SS
    let hour = Math.floor(remain / 3600);
    let minutes = Math.floor((remain % 3600) / 60 );
    let seconds = remain % 60;

    hour = hour.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    return `${hour}:${minutes}:${seconds}`;
}

timer.innerHTML = convert();

start.addEventListener("click", () => {
    if(state === "stopped" || state === "paused") {
        if(state === "stopped") remain = initial; // restart
        state = "running";
        start.innerHTML = "Start";
        pause.innerHTML = "Pause";

        interval = setInterval(() => {
            if(remain <= 0){
                clearInterval(interval);
                interval = null;
                state = "stopped";
                timer.innerHTML = "Time's up!";
                stop.innerHTML = "Restart";
            } else{
                timer.innerHTML = convert();
                remain--;
            }
        }, 1000);

        // update immediately to avoid delay
        timer.innerHTML = convert();
    }
});

pause.addEventListener("click", () => {
    if(state === "running") {
        clearInterval(interval);
        interval = null;
        state = "paused";
        pause.innerHTML = "Paused";
        start.innerHTML = "Resume";
    }
});

stop.addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
    state = "stopped";
    remain = initial;
    timer.innerHTML = convert();
    start.innerHTML = "Start";
    pause.innerHTML = "Pause";
    stop.innerHTML = "Stop";
});


settings.addEventListener("click", () => {
    settingsState = !settingsState;

    if(settingsState == true){
        settingsPanel.style.display = "flex";
    } else {
        settingsPanel.style.display = "none";
    }
});

set.addEventListener("click", () => {
    let val = input.value;
    if(isNaN(val) || val.trim() === ""){
        input.value = "";
        span.innerHTML = "Not A Number";
    } else {
        let convertSec = val * 60;
        initial = convertSec;
        remain = initial;
        input.value = "";
        timer.innerHTML = convert();
        span.innerHTML = "Set minutes:";
    }
   
});


/* GUI SETTINGS */

toggle.addEventListener("change", () => {

    if(toggle.checked){
        timerPanel.style.display = "flex";
        musicBtn.style.display = "block";
    } else {
        timerPanel.style.display = "none";
        musicBtn.style.display = "none";
        settingsPanel.style.display = "none";

    }
});