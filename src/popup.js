console.log("popup.js");

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get((storage) => {
    if (storage.startsAt) settingForm.startsAt.value = storage.startsAt;
    if (storage.endsAt)   settingForm.endsAt.value   = storage.endsAt;
    if (storage.restTime) settingForm.restTime.value = storage.restTime;
    /*
    if (storage.exclude == 1) {
      settingForm.exclude[0].checked = true;
    } else if (storage.exclude == 2) {
      settingForm.exclude[1].checked = true;
    }
    */
  });

  /*
   * 一括入力
   */
  document.getElementById('trigger-input').addEventListener('click', () => {
    chrome.tabs.getSelected(null, (tab) => {
      chrome.storage.sync.get((storage) => {
        const request = {
          startsAt: storage.startsAt || '',
          endsAt:   storage.endsAt   || '',
          restTime: storage.restTime || '',
          // exclude:  storage.exclude  || '',
        };
        chrome.tabs.sendRequest(tab.id, request, (response) => {
          if (response.code === 'success') {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: '../icons/icon128.png',
              title: 'JOBFUN',
              message: '一括入力しました🙋',
            });
          } else {
            console.log("trigger-input failed");
          }
        });
      });
    });
  });

  /*
   * 保存
   */
  document.getElementById('trigger-save').addEventListener('click', () => {
    /*
    let exclude = '';
    if (settingForm.exclude[0].checked) {
      exclude = settingForm.exclude[0].value;
    } else if (settingForm.exclude[1].checked) {
      exclude = settingForm.exclude[1].value;
    }
    */
    const setting = {
      startsAt: settingForm.startsAt.value || '',
      endsAt:   settingForm.endsAt.value   || '',
      restTime: settingForm.restTime.value || '',
      // exclude:  exclude,
    };

    chrome.storage.sync.set(setting, () => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon128.png',
        title: 'JOBFUN',
        message: '設定を保存しました🤘',
      });
    });
  }, false);

  /*
   * クリア
   */
  document.getElementById('trigger-clear').addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      settingForm.startsAt.value = '';
      settingForm.endsAt.value   = '';
      settingForm.restTime.value = '';
      settingForm.exclude.forEach((e) => { e.checked = false; });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon128.png',
        title: 'JOBFUN',
        message: '設定をクリアしました🗑',
      });
    });
  }, false);
}, false);

