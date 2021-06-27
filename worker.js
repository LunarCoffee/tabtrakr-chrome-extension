class TabInfo {
    constructor(url, title, active) {
        this.url = url;
        this.title = title;
        this.active = active;
    }
}

async function getTabs() {
    try {
        return await chrome.tabs.query({ currentWindow: true });
    } catch (e) {
        return await new Promise(resolve => setTimeout(async () => resolve(await getTabs()), 50));
    }
}

function getActiveTab(tabs) {
    return tabs.filter(t => t.active)[0];
}

class TabInfoFrame {
    constructor(timeStart) {
        this.timeStart = timeStart;
        this.category = "unset";
    }

    async initTabs() {
        this.tabs = (await getTabs()).map(t => new TabInfo(t.url, t.title, t.active));
        this.activeTab = getActiveTab(this.tabs);
    }
}

class Timeline {
    async startNew() {
        let frame = new TabInfoFrame(new Date());
        await frame.initTabs();
        frame.timeEnd = frame.timeStart;
        this.frames = [frame];
    }

    updateCategory(cat) {
        this.frames[this.frames.length - 1].category = cat;
    }

    async addFrame() {
        let time = new Date();
        this.frames[this.frames.length - 1].timeEnd = time;

        let newFrame = new TabInfoFrame(time);
        await newFrame.initTabs();

        for (let i = this.frames.length - 2; i >= 0; i--) {
            if (this.frames[i].activeTab.url == newFrame.activeTab.url) {
                newFrame.category = this.frames[i].category;
                break;
            }
        }
        newFrame.timeEnd = time;
        this.frames.push(newFrame);
    }
}

function withTimelineDatesAsJSON(func) {
    for (let frame of timeline.frames) {
        frame.timeStart = frame.timeStart.toJSON();
        frame.timeEnd = frame.timeEnd.toJSON();
    }
    let ret = func();
    for (let frame of timeline.frames) {
        frame.timeStart = new Date(frame.timeStart);
        frame.timeEnd = new Date(frame.timeEnd);
    }
    return ret;
}

function loadTimeline() {
    chrome.storage.local.get(["tl"], async res => {
        if (res.tl !== undefined) {
            for (let frame of res.tl.frames) {
                frame.timeStart = new Date(frame.timeStart);
                frame.timeEnd = new Date(frame.timeEnd);
            }
            timeline = Object.assign(timeline, res.tl);
            console.log("loaded timeline from local storage");
        } else {
            await timeline.startNew();
            console.log("no saved timeline; creating new");
        }
    });
}

function storeTimeline() {
    withTimelineDatesAsJSON(() => chrome.storage.local.set({ tl: timeline }));
}

let timeline = new Timeline();
let loaded = false;
loadTimeline();
loaded = true;

chrome.tabs.onActivated.addListener(async _ => {
    await timeline.addFrame();
    storeTimeline();
    console.log("timeline saved");
    console.log(timeline);
});

chrome.runtime.onMessage.addListener(async (req, sender, respond) => {
    if (req.log != undefined) {
        console.log(req.log);
    } else if (req.getCategory != undefined) {
        while (!loaded) {
            setTimeout(() => { }, 10);
        }
        respond(timeline.frames[timeline.frames.length - 1].category);
    } else if (req.reset != undefined) {
        timeline = new Timeline();
        await timeline.startNew();
        storeTimeline();
    } else {
        timeline.updateCategory(req.cat);
        storeTimeline();
    }
});
