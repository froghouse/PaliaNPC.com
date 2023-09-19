// Extend the Date object with a method to get the ISO week number
Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 -
        3 + (week1.getDay() + 6) % 7) / 7);
}

// Load the file static.json and use as a global variable using fetch
let tasks = null;

const loadNpcList = (async function () {
    fetch("/js/static.json")
        .then(response => response.json())
        .then(data => {
            tasks = data;
            console.log(data);
        })
        .catch(err => console.log(err));
})();

// Save JSON object to cookie
function setCookie(cname, cvalue) {
    const d = new Date();
    
    // Expire cookie at the start of next ISO week at 4am UTC (Monday 4am UTC)
    const currentWeek = d.getWeek();
    const nextWeek = currentWeek + 1;
    const nextWeekDate = new Date(d.getFullYear(), 0, 1 + (nextWeek - 1) * 7);
    const nextWeekStart = new Date(nextWeekDate.getFullYear(), nextWeekDate.getMonth(), nextWeekDate.getDate(), 4, 0, 0, 0);
    const expires = "expires=" + nextWeekStart.toUTCString();

    cvalue = JSON.stringify(cvalue);

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Get JSON object from cookie
function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return "";
}

// Update JSON object with gifted want in the current week
function updateGiftedWant(name, giftedItem) {
    const npcListRaw = getCookie("npcList");
    let npcList = "";

    // Check if we got an npcList cookie otherwise create a new object
    if (npcListRaw === "") {
        npcList = tasks;
    }
    else {
        npcList = JSON.parse(npcListRaw);
    }

    for(let wants of npcList[name].wants) {
        if(wants.item === giftedItem) {
            wants.gifted = true;
        }
    }

    setCookie("npcList", npcList);
}

// Render the NPC list as HTML
function renderNpcList(npcList) {
    const npcListContainer = document.getElementById("npc-list");
    let npcHtml = "";

    for (let npcKey in npcList) {
        const npc = npcList[npcKey];

        const row = document.createElement("div");
        row.classList.add("row");

        const npcProfile = document.createElement("div");
        npcProfile.classList.add("col-lg-2", "themed-grid-col", "npc");

        const npcLabel = document.createElement("label");
        npcLabel.htmlFor = npcKey;
        npcLabel.classList.add("custom-control-label");

        const npcImage = document.createElement("img");
        npcImage.src = `https://www.palianpc.com/images/${npc.imageURL}`;

        npcLabel.appendChild(npcImage);

        const npcDailyGift = document.createElement("input");
        npcDailyGift.classList.add("custom-control-input", "dailyCheck");
        npcDailyGift.type = "checkbox";
        npcDailyGift.id = npcKey;
        npcDailyGift.style.marginRight = "0.5em";

        const npcNameContainer = document.createElement("div");
        npcNameContainer.classList.add("npc", "d-flex", "px-3", "align-items-center");

        const npcName = document.createElement("strong");
        npcName.innerHTML = npcKey;

        npcNameContainer.appendChild(npcName);

        npcProfile.appendChild(npcDailyGift);
        npcProfile.appendChild(npcLabel);
        npcProfile.appendChild(npcNameContainer);

        row.appendChild(npcProfile);

        const npcWants0 = document.createElement("div");
        npcWants0.classList.add("col-lg-4", "themed-grid-col", "weekly-wants");

        const npcWants2 = document.createElement("div");
        npcWants2.classList.add("col", "themed-grid-col", "weekly-wants");

        npc.wants.forEach((wants, index) => {
            const npcWantsItem = document.createElement("input");
            npcWantsItem.type = "checkbox";
            npcWantsItem.id = npcKey + "-" + wants.item;
            npcWantsItem.addEventListener("change", function() {
                updateGiftedWant(npcKey, wants.item);
            });

            const npcWantsLabel = document.createElement("label");
            npcWantsLabel.htmlFor = npcKey + "-" + wants.item;
            npcWantsLabel.innerHTML = wants.item;

            // add data-bs-toggle="tooltip" title="[How to Obtain]" to the label
            npcWantsLabel.setAttribute("data-bs-toggle", "tooltip");
            npcWantsLabel.setAttribute("title", "[How to Obtain]");

            if (index < 2) {
                npcWants0.appendChild(npcWantsItem);
                npcWants0.appendChild(npcWantsLabel);

                // Add a line break after the first item
                if (index === 0) {
                    const br = document.createElement("br");
                    npcWants0.appendChild(br);
                }
            }
            else {
                npcWants2.appendChild(npcWantsItem);
                npcWants2.appendChild(npcWantsLabel);

                // Add a line break after the first item
                if (index === 2) {
                    const br = document.createElement("br");
                    npcWants2.appendChild(br);
                }
            }
        });

        row.appendChild(npcWants0);
        row.appendChild(npcWants2);

        npcListContainer.appendChild(row);
    }
}

// Initialize the page
function init() {
    const npcListRaw = getCookie("npcList");
    let npcList = "";

    // Check if we got an npcList cookie otherwise create a new object
    if (npcListRaw === "") {
        fetch("/js/static.json")
            .then(response => response.json())
            .then(data => {
                renderNpcList(data);
            })
            .catch(err => console.log(err));
    }
    else {
        npcList = JSON.parse(npcListRaw);
    }
}

// Call the function to initialize the checkbox statuses from cookies
init();
