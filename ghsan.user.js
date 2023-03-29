// ==UserScript==
// @name         GitHubSanitizer
// @namespace    https://whentojump.xyz/
// @version      0.1
// @description  Add "mark as read" buttons to your GitHub homepage news feed, and prevent ever-read items from being displayed again.
// @author       wtj
// @match        https://github.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// Wait till the actual feed contents are loaded
// Ref: https://github.com/Tampermonkey/tampermonkey/issues/1279#issuecomment-875386821

let numAttempts = 0;
let readySelector = '.news .body'; // UNRELIABLE

function tryOnce() {
    let elem = document.querySelector(readySelector);

    if (elem) {
        main();
    } else {
        numAttempts++;
        if (numAttempts >= 34) {
            console.warn("No actual feed contents are detected.");
        } else {
            setTimeout(tryOnce, 250 * Math.pow(1.1, numAttempts));
        }
    }
}

tryOnce();

function main() {
    let panel1 = document.querySelector('#panel-1'); // UNRELIABLE
    let blockContainer = panel1.querySelector(':scope > div'); // UNRELIABLE

    handleBlocksInOnePage(blockContainer);

    // Observe for newly loaded pages by pressing the bottom "More" button
    const observer = new MutationObserver(() => {
        blockContainer = blockContainer.lastElementChild; // UNRELIABLE
        handleBlocksInOnePage(blockContainer);
        observer.observe(blockContainer, { childList: true }); // UNRELIABLE
    });
    observer.observe(blockContainer, { childList: true }); // UNRELIABLE
}

function handleBlocksInOnePage(blockContainer) {
    let blocks = blockContainer.querySelectorAll(':scope > div'); // UNRELIABLE

    blocks.forEach((block) => {
        switch(block.classList[0]) {
        //                      \
        //                       \__ UNRELIABLE
        // All constant expressions below are UNRELIABLE
        case 'watch_started': // star
        case 'fork':
        case 'public':
            handleBlockType1(block);
            break;
        case 'body': // something to expand, e.g. someone starred multiple repos
            handleBlockType2(block);
            break;
        case 'push':
        case 'follow':
        case 'release':
        case 'repo': // create a new repo
            break;
        }
    });
}

function doNotDisplay(elem) {
    // TODO remove or hide or what?
    // elem.remove();
    elem.style.display = 'none';
}

function handleBlockType1(block) {
    let box = block.querySelector('.Box'); // UNRELIABLE
    handleBox(box);
}

function handleBlockType2(block) {
    //
    // Plural users starred single repo
    //

    // TODO

    //
    // Single user starred plural repos
    //

    // Hide expand buttons
    let expandDetailsButton = block.querySelector('button'); // UNRELIABLE
    if (expandDetailsButton)
        doNotDisplay(expandDetailsButton);

    // Expand all
    let detailsDiv = block.querySelector('div.Details'); // UNRELIABLE
    detailsDiv.classList.add('open', 'Details--on'); // UNRELIABLE

    // Handle repo boxes
    let boxes = block.querySelectorAll('.watch_started .Box'); // UNRELIABLE
    boxes.forEach(handleBox);
}

function handleBox(box) {
    let repoName = box.querySelector('a').innerHTML; // UNRELIABLE
    let description = "TODO"; // UNRELIABLE

    if (GM_getValue(repoName)) {
        doNotDisplay(box);
    } else {
        let button = document.createElement('button');
        button.textContent = 'Mark as Read';
        button.style.marginTop = '20px'; // UNRELIABLE
        button.classList.add('btn', 'Box'); // UNRELIABLE
        button.addEventListener('click', () => {
            doNotDisplay(box);
            doNotDisplay(button);
            GM_setValue(repoName, true);
        });
        box.parentNode.insertBefore(button, box); // UNRELIABLE
    }
}
