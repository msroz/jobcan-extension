console.log("content");

// hh:mm (String)を分(Number)に換算
function toMinutes(string) {
  const times = string.split(':');
  return Number(times[0]) * 60 + Number(times[1]);
}

// 勤務時間(分) = 退勤時刻 - 出勤時刻 - 休憩時間
function workHoursMinutes(start, end, reset) {
  return toMinutes(end) - toMinutes(start) - toMinutes(reset);
}

function highlightRow(row, message) {
  const element = document.createElement('td');
  element.innerText = message;
  element.classList.add("jbf-message-alert");
  element.style.fontSize = "8px";
  element.style.color = "red";

  const nodes = row.querySelectorAll('td');
  // 備考を差し替え
  row.removeChild(nodes[nodes.length- 1]);
  row.appendChild(element);
  row.style.background = "#FFC0CB";
}

// See: http://www.mhlw.go.jp/bunya/roudoukijun/roudoujouken02/jikan.html
function isTooBusy(workMinutes, resetMinutes) {
  if (workMinutes >= 6*60 && resetMinutes < 45) {
    return true;
  } else if (workMinutes >= 8*60 && resetMinutes < 60) {
    return true;
  } else if (workMinutes >= 12*60 && resetMinutes < 90) {
    return true;
  }
  return false;
}

function isTooEfficient(workMinutes) {
  if (workMinutes < 4*60) {
    return true;
  }
  return false;
}

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  console.log("debug");

  //const regex = request.exclude == 2 ? new RegExp(/火|水/) : new RegExp(/土|日/);
  const regex = new RegExp(/公休|法休/);

  const rows = document.querySelector('table.note').querySelectorAll('tr[id^="tr_line_of_"]');
  rows.forEach((row) => {
    const dayoffElement = row.querySelectorAll('td')[1]; // 休日区分
    let startElement = row.querySelector('input[id^="start_"]');
    let endElement = row.querySelector('input[id^="end_"]');
    let restElement = row.querySelector('input[id^="rest_"]');

    //if (row.firstElementChild.innerText.match(regex)) {
    if (dayoffElement.innerText.match(regex)) {
      if (startElement.value !== '' || endElement.value !== '' || restElement.value !== '') {
        highlightRow(row, '休日申請漏れ?');
      }
    } else {
      // 出勤時刻埋める
      if (startElement.value === '') {
        startElement.value = request.startsAt;
      }

      // 退勤時刻埋める
      if (endElement.value === '') {
        endElement.value = request.endsAt;
      }

      // 休憩時間埋める
      if (restElement.value === '') {
        restElement.value = request.restTime;
      }

      // 勤務時間がN時間以下かどうか(あまりに短いと打刻ズレの可能性ある)
      const workMinutes = workHoursMinutes(startElement.value, endElement.value, restElement.value);
      if (isTooEfficient(workMinutes)) {
        highlightRow(row, '勤務時間短い?');
      }

      // 勤務時間におうじた休憩時間が適切か
      const resetMinutes = toMinutes(request.restTime);
      if (isTooBusy(workMinutes, resetMinutes)) {
        highlightRow(row, '休憩時間不適切?');
      }
    }
  });

  sendResponse({ code: 'success' });
});