'use strict';

let enableds = [];

function isEnabled(tabId) {
    return enableds.indexOf(tabId) >= 0;
}

function enable(tabId) {
    enableds.push(tabId);
    if (enableds.length == 1) {
        listen();
    }
    console.log('enableds', enableds);
}

function disable(tabId) {
    const i = enableds.indexOf(tabId);
    if (i >= 0) {
        enableds.splice(i, 1);
        if (enableds.length == 0) {
            unlisten();
        }
        console.log('enableds', enableds);
    }
}

function onUpdate(tabId, changeInfo, tab) {
    if (isEnabled(tabId)) {
        if (changeInfo.status == 'complete' && tab.url.startsWith('http')) {
            console.log('inject!', tabId, changeInfo, tab);
            chrome.tabs.insertCSS(tabId, { file: 'content.css', allFrames: true }, function () {
                if (chrome.runtime.lastError) {
                    console.log('Not allowed to inject CSS into special page.', chrome.runtime.lastError);
                }
                else {
                    console.log('Injected style!');
                }
            });
        }
    }
};

function listen() {
    console.log('listen');
    chrome.tabs.onUpdated.addListener(onUpdate);
}

function unlisten() {
    console.log('unlisten');
    chrome.tabs.onUpdated.removeListener(onUpdate);
}

function updateIcon(tabId) {
    const enabled = isEnabled(tabId);
    const icon = enabled ? 'icon1.png' : 'icon2.png';
    chrome.browserAction.setIcon({ path: icon });
    chrome.browserAction.setTitle({ title: 'Lestanianizer\n' + (enabled ? 'クリックしてレスタニア文字化を解除' : 'クリックしてレスタニア文字化を実行') });
};

function toggleIcon(tabId) {
    if (isEnabled(tabId)) {
        disable(tabId);
    } else {
        enable(tabId);
    }
    updateIcon(tabId);
    chrome.tabs.reload();
}

chrome.browserAction.onClicked.addListener(function (tab) {
    toggleIcon(tab.id);
});

chrome.tabs.onActivated.addListener(function (info) {
    updateIcon(info.tabId);
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    disable(tabId);
});

chrome.tabs.getCurrent(function (tab) {
    updateIcon(tab == null ? -1 : tab.id);
});
