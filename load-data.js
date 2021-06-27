let timeline;

chrome.runtime.sendMessage({ getTimeline: 1 }, (tl) => {
    timeline = tl;
});

setTimeout(() => {
    timeline = JSON.parse(timeline);
    for (let frame of timeline.frames) {
        frame.timeStart = new Date(frame.timeStart);
        frame.timeEnd = new Date(frame.timeEnd);
    }
    
    console.log("received timeline from ext");
    setTimeout(() => document.getElementsByTagName("iframe")[0].contentWindow.setTimeline(timeline), 500);
}, 150);

// the number of race conditions in this project is enough for me to call it the grand prix
