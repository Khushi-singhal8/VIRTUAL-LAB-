document.addEventListener("DOMContentLoaded", function() {
    console.log('Simulation E10 script (multi-substeps) loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const steps = [
        {
            id: 'step1',
            title: 'Perform measurement',
            src: 'images/simulation/1.mp4',
            type: 'video',
            substeps: [
                { time: 7.83, hotspot: {x: 0.5398516217837857, y: 0.48732976515565263, w: 0.10389874704408286, h: 0.18020588627950723}, instruction: 'Rotate the thimble and open Micrometer, then place object between anvil and spindle.' },
                { time: 11.83, hotspot: {x: 0.5647127519147284, y: 0.4967008192244675, w: 0.11480063530159179, h: 0.1930408398567874}, instruction: 'Rotate thimble until slip click.' },
                { time: 13, hotspot: {x: 0.31808901281191543, y: 0.37990265818045676, w: 0.053811581676750216, h: 0.10618494945713217}, instruction: 'Lock the spindle using the lock lever.' },
                { time: 15, instruction:'Take measurement.' }
            ]
        }
    ];

    let currentStepIndex = 0;
    const totalSteps = steps.length;

    if (stepsList) {
        stepsList.innerHTML = '';
        steps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'step-item';
            item.dataset.step = index + 1;
            const titleDiv = document.createElement('div');
            titleDiv.className = 'step-item-title';
            titleDiv.innerHTML = `<h4 style="margin:0">${index + 1}. ${step.title}</h4>`;
            item.appendChild(titleDiv);
            item.setAttribute('aria-disabled','true');
            item.style.cursor = 'default';
            item.title = 'Use Previous/Next to navigate';
            stepsList.appendChild(item);
        });
    }

    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) {}
            cleanupCurrent = null;
        }
    }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (Array.isArray(step.substeps) && step.substeps.length) {
            renderSubstepVideo(step, timestamp);
        } else {
            renderSimpleVideo(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) {
            const hasSubsteps = Array.isArray(step.substeps) && step.substeps.length > 0;
            nextButton.disabled = hasSubsteps ? true : (currentStepIndex === totalSteps - 1);
        }

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderSubstepVideo(step, timestamp) {
        const substeps = step.substeps;
        let currentSubstep = 0;
        if (nextButton) nextButton.disabled = true;
        const hotspotDebug = true;
        let finalHandled = false;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="substep-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                    <button id="substep-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="substep-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('substep-video');
        const hotspot = document.getElementById('substep-hotspot');
        const instructionElem = document.getElementById('substep-instruction');
        const stage = document.getElementById('play-stage');
        if (hotspotDebug) hotspot.classList.add('debug-highlight');

        function layoutHotspot(rel) {
            if (!rel) return;
            const rect = stage.getBoundingClientRect();
            hotspot.style.left = (rect.width * rel.x) + 'px';
            hotspot.style.top = (rect.height * rel.y) + 'px';
            hotspot.style.width = (rect.width * rel.w) + 'px';
            hotspot.style.height = (rect.height * rel.h) + 'px';
        }

        function setupSubstep() {
            if (currentSubstep >= substeps.length) return;
            const s = substeps[currentSubstep];
            instructionElem.textContent = s.instruction || '';
            if (s.hotspot) {
                layoutHotspot(s.hotspot);
                hotspot.style.display = 'block';
                hotspot.onclick = () => {
                    hotspot.style.display = 'none';
                    video.play();
                };
            } else {
                    const isLast = currentSubstep === substeps.length - 1;
                    if (isLast) {
                        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                    try { video.play(); } catch(_) {}
                    } else {
                        try { video.play(); } catch(_) {}
                    }
            }
        }

        let rafId = null; let intervalId = null; const EPS = 0.01;
        function checkAndPause() {
            if (currentSubstep >= substeps.length) return;
            const target = substeps[currentSubstep].time;
            const t = video.currentTime;
            if (t + EPS >= target) {
                const s = substeps[currentSubstep];
                const isLast = currentSubstep === substeps.length - 1;
                if (isLast && !s.hotspot) {
                    if (!finalHandled) {
                        instructionElem.textContent = s.instruction || 'Step complete!';
                        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                        finalHandled = true;
                    }
                    currentSubstep = substeps.length;
                    return;
                }
                video.pause();
                if (currentSubstep < substeps.length - 1) {
                    currentSubstep++;
                    setupSubstep();
                } else {
                    instructionElem.textContent = s.instruction || 'Step complete!';
                    if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                }
            }
        }

        function frameCallback() {
            checkAndPause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        video.addEventListener('loadedmetadata', () => {
            video.pause();
            setupSubstep();
        }, { once: true });

        function onPlay() {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(checkAndPause, 33);
            }
        }
        function onPause() {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') { video.cancelVideoFrameCallback(rafId); rafId=null; }
            if (intervalId) { clearInterval(intervalId); intervalId=null; }
        }
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        window.addEventListener('resize', () => { if (substeps[currentSubstep] && substeps[currentSubstep].hotspot) layoutHotspot(substeps[currentSubstep].hotspot); });

        cleanupCurrent = () => {
            try {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
            } catch(_) {}
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId); rafId=null;
            }
            if (intervalId) { clearInterval(intervalId); intervalId=null; }
        };
    }

    function renderSimpleVideo(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="simple-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;
        const video = document.getElementById('simple-video');
        video.addEventListener('loadedmetadata', () => { video.play().catch(()=>{}); }, { once:true });
        video.addEventListener('ended', () => { if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1); }, { once:true });
        cleanupCurrent = () => { try { video.pause(); video.removeAttribute('src'); video.load(); } catch(_){} };
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentStepIndex > 0) { currentStepIndex--; showCurrentStep(); }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentStepIndex < totalSteps - 1) { currentStepIndex++; showCurrentStep(); }
        });
    }

    showCurrentStep();
});