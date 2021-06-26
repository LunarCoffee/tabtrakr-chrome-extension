class TabInfo {
    constructor(url, title, active) {
        this.url = url;
        this.title = title;
        this.active = active;
    }
}

class TabInfoFrame {
    constructor(timeStart) {
        this.timeStart = timeStart;
    }

    async initTabs() {
        let t = await getTabs();
        console.error(t);

        this.tabs = (t).map(t => new TabInfo(t.url, t.title, t.active));
        this.activeTab = getActiveTab(this.tabs);
    }
}

class Timeline {
    async startNew() {
        let frame = new TabInfoFrame(new Date());
        await frame.initTabs();
        frame.timeEnd = new Date();
        this.frames = [frame];
    }

    async addFrame() {
        let time = new Date();
        this.frames[this.frames.length - 1].timeEnd = time;

        let newFrame = new TabInfoFrame(time);
        await newFrame.initTabs();
        newFrame.timeEnd = new Date();
        this.frames.push(newFrame);
    }
}

function getActiveTab(tabs) {
    return tabs.filter(t => t.active)[0];
}

async function getTabs() {
    try {
        return await chrome.tabs.query({ currentWindow: true });
    } catch (e) {
        return await new Promise(resolve => setTimeout(async () => resolve(await getTabs()), 50));
    }
}

const reset = 'f'; // TODO:

function loadTimeline() {
    chrome.storage.local.get(["tl"], async res => {
        if (res.tl !== undefined && !(reset == 't')) { // TODO:
            for (let frame of res.tl.frames) {
                frame.timeStart = new Date(frame.timeStart);
                frame.timeEnd = new Date(frame.timeEnd);
            }
            timeline = Object.assign(timeline, res.tl);
            console.log("loaded from local storage");
        } else {
            await timeline.startNew();
            console.log("no saved data, making new");
        }
    });
}

function storeTimeline() {
    for (let frame of timeline.frames) {
        frame.timeStart = frame.timeStart.toJSON();
        frame.timeEnd = frame.timeEnd.toJSON();
    }
    chrome.storage.local.set({ tl: timeline });
    for (let frame of timeline.frames) {
        frame.timeStart = new Date(frame.timeStart);
        frame.timeEnd = new Date(frame.timeEnd);
    }
}

let timeline = new Timeline();

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Installed!");
    loadTimeline();
});

chrome.tabs.onActivated.addListener(async _ => {
    await timeline.addFrame();
    storeTimeline();
});
