// Extend the Date object with a method to get the ISO week number
Date.prototype.getWeek = function() {
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

// Function to set a cookie
function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days expiry
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Function to set a cookie which expires at the start of next ISO week 
// at 4am UTC (Monday 4am UTC)
// It stores the current ISO week number as it's content
function setCookieForNextWeek(cname) {
  var d = new Date();
  var currentWeek = d.getWeek();
  var nextWeek = currentWeek + 1;
  var nextWeekDate = new Date(d.getTime() + (7 * 24 * 60 * 60 * 1000));
  nextWeekDate.setHours(4, 0, 0, 0);
  var expires = "expires=" + nextWeekDate.toUTCString();
  document.cookie = cname + "=" + nextWeek + ";" + expires + ";path=/";
}

// Function to get a cookie by name
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Function to update checkbox and cookie status
function updateStatus(taskId) {
  var taskElement = document.getElementById(taskId);
  var isChecked = taskElement.checked ? "true" : "false";
  setCookie(taskId, isChecked);
}

// Function to initialize the checkbox statuses from cookies
function initializeStatus() {
  for (var i = 93; i <= 184; i++) {
    var taskId = "task" + i;
    var cookieValue = getCookie(taskId);
    if (cookieValue === "true") {
      document.getElementById(taskId).checked = true;
    }
    document.getElementById(taskId).addEventListener("change", function() {
      updateStatus(this.id);
    });
  }
}

function uncheckAll() {
  document.querySelectorAll('input[type="checkbox"]')
    .forEach(el => el.checked = false);

  for (var i = 93; i <= 184; i++) {
    document.getElementById('task' + i).checked = false;
    // Update or clear the cookie
    document.cookie = 'task' + i + '=false; path=/';
  }
}

document.querySelector('button').addEventListener('click', uncheckAll)

// Call the initialize function when the page loads
initializeStatus();
