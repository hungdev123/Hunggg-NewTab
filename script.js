const USER_NAME_KEY = "hunggg_user_name_v1";
let userName = (localStorage.getItem(USER_NAME_KEY) || "").trim();

/* Clock */
function updateTime(){
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
}

function updateGreeting(){
  const hour = new Date().getHours();
  let text = "Hello";

  if(Number.isFinite(hour)){
    if(hour >= 5 && hour < 12){
      text = "Good morning";
    }else if(hour >= 12 && hour < 18){
      text = "Good afternoon";
    }else if((hour >= 18 && hour <= 23) || (hour >= 0 && hour < 5)){
      text = "Good evening";
    }
  }

  if(userName){
    text = `${text}, ${userName}`;
  }

  document.getElementById("greeting").textContent = text;
}

setInterval(updateTime,1000);
updateTime();
updateGreeting();
setInterval(updateGreeting,60000);

/* Name widget */
const nameInput = document.getElementById("nameInput");
const nameSave = document.getElementById("nameSave");

function saveUserName(){
  userName = (nameInput.value || "").trim().slice(0, 32);
  localStorage.setItem(USER_NAME_KEY, userName);
  nameInput.value = userName;
  updateGreeting();
}

nameInput.value = userName;
nameSave.addEventListener("click", saveUserName);
nameInput.addEventListener("keydown", (event)=>{
  if(event.key === "Enter"){
    event.preventDefault();
    saveUserName();
  }
});
nameInput.addEventListener("blur", saveUserName);

/* Date widget */
const dateMain = document.getElementById("dateMain");
const dateSub = document.getElementById("dateSub");

function updateDateWidget(){
  const now = new Date();
  dateMain.textContent = now.toLocaleDateString("en-US", { weekday: "long" });
  dateSub.textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

updateDateWidget();
setInterval(updateDateWidget,60000);

/* Pomodoro widget */
const pomodoroTime = document.getElementById("pomodoroTime");
const pomodoroStart = document.getElementById("pomodoroStart");
const pomodoroPause = document.getElementById("pomodoroPause");
const pomodoroReset = document.getElementById("pomodoroReset");
const POMODORO_DEFAULT_SECONDS = 25 * 60;
let pomodoroRemaining = POMODORO_DEFAULT_SECONDS;
let pomodoroTimerId = null;

function renderPomodoro(){
  const mm = String(Math.floor(pomodoroRemaining / 60)).padStart(2, "0");
  const ss = String(pomodoroRemaining % 60).padStart(2, "0");
  pomodoroTime.textContent = `${mm}:${ss}`;
}

function stopPomodoro(){
  if(!pomodoroTimerId) return;
  clearInterval(pomodoroTimerId);
  pomodoroTimerId = null;
}

function startPomodoro(){
  if(pomodoroTimerId) return;
  pomodoroTimerId = setInterval(()=>{
    if(pomodoroRemaining <= 0){
      stopPomodoro();
      return;
    }
    pomodoroRemaining -= 1;
    renderPomodoro();
    if(pomodoroRemaining <= 0){
      stopPomodoro();
      pomodoroTime.textContent = "Done!";
    }
  }, 1000);
}

pomodoroStart.addEventListener("click", startPomodoro);
pomodoroPause.addEventListener("click", stopPomodoro);
pomodoroReset.addEventListener("click", ()=>{
  stopPomodoro();
  pomodoroRemaining = POMODORO_DEFAULT_SECONDS;
  renderPomodoro();
});
renderPomodoro();

/* Quick notes widget */
const notesInput = document.getElementById("notesInput");
const NOTES_KEY = "hunggg_quick_notes_v1";

notesInput.value = localStorage.getItem(NOTES_KEY) || "";
notesInput.addEventListener("input", ()=>{
  localStorage.setItem(NOTES_KEY, notesInput.value);
});

/* Intro */
const introScreen = document.getElementById("introScreen");
let introActive = !!introScreen;

function closeIntro(){
  if(!introScreen || !introActive) return;
  introActive = false;
  introScreen.classList.add("exit");
  setTimeout(()=>{
    document.body.classList.remove("intro-active");
    introScreen.remove();
    const search = document.getElementById("searchInput");
    if(search) search.focus();
  }, 650);
}

document.addEventListener("keydown", (event)=>{
  if(!introActive) return;
  if(event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  closeIntro();
}, true);

/* Search */
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keydown", (event)=>{
  if(introActive){
    event.preventDefault();
    return;
  }
  if(event.key === "Enter"){
    window.location = "https://www.google.com/search?q=" + encodeURIComponent(searchInput.value);
  }
});

/* Fun text random */
const texts = [
  "Stay focused 🚀",
  "Build something cool ✨",
  "Less scroll, more code 💻",
  "Deep work mode 🔥"
];
document.getElementById("funText").textContent =
  texts[Math.floor(Math.random()*texts.length)];

/* Weather */
const weatherBox = document.getElementById("weather");
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try{
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      );
      const data = await res.json();
      weatherBox.innerHTML = `
        <div>📍 Local</div>
        <div class="weather-temp">${Math.round(data.current_weather.temperature)}°C</div>
        <div>🌬 ${data.current_weather.windspeed} km/h</div>
      `;
    }catch{
      weatherBox.innerHTML="Weather error 🌥";
    }
  }, ()=> weatherBox.innerHTML="Location denied 🚫");
}

/* Music */
const music = document.getElementById("bgMusic");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const wallpaperVideo = document.querySelector("video");
const gpuBtn = document.getElementById("gpuBtn");
const GPU_BOOST_KEY = "hunggg_gpu_boost_v1";

music.volume = 0.5;
let playing = false;

playBtn.addEventListener("click", async ()=>{
  if(!playing){
    await music.play();
    playBtn.textContent="⏸";
    playing=true;
  }else{
    music.pause();
    playBtn.textContent="▶";
    playing=false;
  }
});

muteBtn.addEventListener("click", ()=>{
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? "🔇" : "🔊";
});

volumeSlider.addEventListener("input", ()=>{
  music.volume = volumeSlider.value;
});

/* GPU boost */
function setGpuBoost(enabled){
  document.body.classList.toggle("gpu-boost", enabled);
  gpuBtn.classList.toggle("active", enabled);
  gpuBtn.textContent = `GPU Boost: ${enabled ? "On" : "Off"}`;

  if(wallpaperVideo){
    if(enabled){
      wallpaperVideo.pause();
    }else{
      wallpaperVideo.play().catch(()=>{});
    }
  }

  localStorage.setItem(GPU_BOOST_KEY, enabled ? "1" : "0");
}

const savedGpuBoost = localStorage.getItem(GPU_BOOST_KEY) === "1";
setGpuBoost(savedGpuBoost);
gpuBtn.addEventListener("click", ()=>{
  setGpuBoost(!document.body.classList.contains("gpu-boost"));
});

/* Credit toggle */
const panel = document.getElementById("creditPanel");
function toggleCredit(){
  panel.classList.toggle("active");
}
document.getElementById("creditBtn").addEventListener("click", toggleCredit);
document.getElementById("closeCreditBtn").addEventListener("click", toggleCredit);

/* Quick links */
const quickLinksContainer = document.getElementById("quickLinks");
const QUICK_LINKS_KEY = "hunggg_custom_links_v1";
const DEFAULT_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23999'/%3E%3Ccircle cx='16' cy='16' r='7' fill='white'/%3E%3C/svg%3E";

const baseLinks = [
  { name: "Facebook", url: "https://www.facebook.com", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/facebook.svg" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/youtube.svg" },
  { name: "TikTok", url: "https://www.tiktok.com", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/tiktok.svg" },
  { name: "Reddit", url: "https://www.reddit.com", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/reddit.svg" }
];

function loadCustomLinks(){
  try{
    const raw = localStorage.getItem(QUICK_LINKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  }catch{
    return [];
  }
}

function saveCustomLinks(links){
  localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(links));
}

function safeUrl(input){
  const value = input.trim();
  if(!value) return null;
  if(value.startsWith("http://") || value.startsWith("https://")) return value;
  return "https://" + value;
}

function getHostname(link){
  try{
    return new URL(link).hostname;
  }catch{
    return "";
  }
}

function getFallbackIcon(link){
  const host = getHostname(link);
  if(!host) return DEFAULT_ICON;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

function renderQuickLinks(){
  const customLinks = loadCustomLinks();
  quickLinksContainer.innerHTML = "";

  [...baseLinks, ...customLinks].forEach((link)=>{
    const a = document.createElement("a");
    a.className = "quick-link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const img = document.createElement("img");
    const fallbackIcon = getFallbackIcon(link.url);
    img.src = link.icon || fallbackIcon;
    img.alt = `${link.name} icon`;
    img.onerror = ()=>{
      if(img.src !== fallbackIcon){
        img.src = fallbackIcon;
        return;
      }
      img.src = DEFAULT_ICON;
    };

    const label = document.createElement("span");
    label.textContent = link.name;

    a.appendChild(img);
    a.appendChild(label);
    quickLinksContainer.appendChild(a);
  });

  const addBtn = document.createElement("button");
  addBtn.className = "quick-link add-link";
  addBtn.type = "button";
  addBtn.title = "Add link";
  addBtn.textContent = "+";
  addBtn.addEventListener("click", ()=>{
    const name = prompt("Tên widget:");
    if(!name || !name.trim()) return;
    const urlInput = prompt("Link URL:");
    const url = urlInput ? safeUrl(urlInput) : null;
    if(!url) return;
    const iconInput = prompt("Icon URL (optional):");
    const icon = iconInput ? safeUrl(iconInput) : "";
    const links = loadCustomLinks();
    links.push({ name: name.trim().slice(0, 20), url, icon });
    saveCustomLinks(links);
    renderQuickLinks();
  });
  quickLinksContainer.appendChild(addBtn);
}

renderQuickLinks();
