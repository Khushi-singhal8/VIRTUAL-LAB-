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
            title: '1. Measure sheet thickness using micrometer',
            src: 'images/simulation/1.mp4',
            type: 'video',
            substeps: [
                { time: 3.7, hotspot: {x: 0.63985125, y: 0.5428844444444445, w: 0.10389875, h: 0.1802057777777778}, instruction: 'Click here to rotate the thimble and open micrometer' },
                { time: 7.83, hotspot: {x: 0.5043387500000001, y: 0.03990222222222222, w: 0.21881162499999998, h: 0.39062933333333333}, instruction: 'Click here to place sheet between anvil and spindle' },
                { time: 10.6, hotspot: {x: 0.6684625, y: 0.5552011111111111, w: 0.11480063530159179, h: 0.1930408398567874}, instruction: 'Click here to rotate thimble until slip click' },
                { time: 11.7, hotspot: {x: 0.7797125, y: 0.5840888888888889, w: 0.077300625, h: 0.19304088888888887}, instruction: 'Click here to rotate ratchet for fine tuning' },
                { time: 13.5, hotspot: {x: 0.47308875, y: 0.5732355555555556, w: 0.053811625, h: 0.10618488888888888}, instruction: 'Click here to lock the spindle using the lock lever' }
            ]
        },
        {
            id: 'step2',
            title: '1. Measure sheet thickness using micrometer',
            src: 'images/simulation/measurement1.1.png',
            type: 'image',
            instruction: 'Take reading:\n    Sleeve reading = 2 mm \n' +
                'Thimble reading = 4 divisions → 4 × 0.02 = 0.08 mm'
        },
        {
            id: 'step3',
            title: '1. Measure sheet thickness using micrometer',
            src: 'images/simulation/measurement1.2.png',
            type: 'image',
            instruction: 'Take reading:\n    Sleeve reading = 2 mm \n' +
                'Thimble reading = 4 divisions → 4 × 0.02 = 0.08 mm\n' +
                'Vernier reading = 3 divisions → 3 × 0.002 = 0.006 mm \n' +
                'Final reading = 2 + 0.08 + 0.006 = 2.086 mm '
        },
        {
            id: 'step4',
            title: '2. Measure wire diameter using micrometer',
            src: 'images/simulation/2.mp4',
            type: 'video',
            substeps: [
                { time: 4.1, hotspot: {x: 0.69735125, y: 0.6095799721835883, w: 0.10389874704408286, h: 0.18020588627950723}, instruction: 'Click here to rotate the thimble and open micrometer' },
                { time: 8.2, hotspot: {x: 0.30433875, y: 0.1287911111111111, w: 0.05881125, h: 0.39062888888888886}, instruction: 'Click here to place wire between anvil and spindle' },
                { time: 11, hotspot: {x: 0.71860125, y: 0.6162559109874827, w: 0.10389874704408286, h: 0.18020588627950723}, instruction: 'Click here to rotate thimble until slip click' },
                { time: 12, hotspot: {x: 0.80485125, y: 0.6318331015299027, w: 0.06639875, h: 0.1802058414464534}, instruction: 'Click here to rotate ratchet for fine tuning' },
                { time: 13.83, hotspot: {x: 0.56433875, y: 0.646568888888889, w: 0.053811625, h: 0.10618488888888888}, instruction: 'Click here to lock the spindle using the lock lever' }
            ]
        },
        {
            id: 'step5',
            title: '2. Measure wire diameter using micrometer',
            src: 'images/simulation/measurement2.1.png',
            type: 'image',
            instruction: 'Take reading:\n    Sleeve reading = 0.75 mm \n' +
                'Thimble reading = 5 divisions → 5 × 0.02 = 0.1 mm'
        },
        {
            id: 'step6',
            title: '2. Measure wire diameter using micrometer',
            src: 'images/simulation/measurement2.2.png',
            type: 'image',
            instruction: 'Take reading:\n    Sleeve reading = 0.75 mm \n' +
                'Thimble reading = 5 divisions → 5 × 0.02 = 0.1 mm\n' +
                'Vernier reading = 7 divisions → 7 × 0.002 = 0.014 mm \n' +
                'Final reading = 0.75 + 0.1 + 0.014 = 0.864 mm '
        },
        {
    id: 'step7',
    title: '7. Final Result',
    type: 'final',
    instruction: 'Click the button below to print the results.',
    action: 'print',
    content: `
        <div style="padding:20px; font-family:Arial, sans-serif;">
            <h2 style="text-align:center; margin-bottom:20px;">Measurement Results</h2>
            <hr style="margin-bottom:30px;">

            <!-- Workpiece Section -->
            <div style="text-align:center; margin-bottom:20px;">
            <div class="row" style="display:flex; gap:20px; justify-content:center; align-items:stretch;">
                <img src="images/c.png" 
                     alt="Workpiece" 
                     style="height:190px; width:auto; border:1px solid #ccc; border-radius:6px; object-fit:contain;">
                     <img src="images/b.png" 
                     alt="Workpiece" 
                     style="height:190px; width:auto; border:1px solid #ccc; border-radius:6px; object-fit:contain;">
                     </div>
                <p style="font-size:14px; margin-top:6px;">Workpiece</p>
            </div>

            <!-- Workpiece Table -->
            <table style="border-collapse:collapse; width:100%; max-width:500px; margin:0 auto 40px auto; border:1px solid #000; font-size:14px;">
                <tbody>
                    <tr style="background:#f0f0f0; font-weight:bold;">
                        <td colspan="2" style="padding:10px; text-align:center;">Workpiece Measurements</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Thickness of sheet</td>
                        <td style="border:1px solid #000; padding:10px;">2.086 mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Diameter</td>
                        <td style="border:1px solid #000; padding:10px;">0.8517 mm</td>
                    </tr>
                </tbody>
            </table>

            <!-- Print Button -->
            <div style="text-align:center; margin-top:30px;">
                <button onclick="window.print()" 
                        style="padding:12px 24px; font-size:16px; cursor:pointer; background-color:#007bff; color:white; border:none; border-radius:6px;">
                    🖨 Print Results
                </button>
            </div>
        </div>
    `
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

    /* ✅ FINAL STEP (VERY IMPORTANT) */
    if (step.type === 'final') {
        gifContainer.innerHTML = step.content;   // render HTML table + images

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = false;
        if (nextButton) nextButton.disabled = false;

        return; // stop here (don't run video logic)
    }

    /* normal steps */
    if (step.type === 'image') {
        renderImage(step);
    } 
    else if (Array.isArray(step.substeps) && step.substeps.length) {
        renderSubstepVideo(step, timestamp);
    } 
    else {
        renderSimpleVideo(step, timestamp);
    }

    if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
    if (prevButton) prevButton.disabled = currentStepIndex === 0;

    if (nextButton) {
        const hasSubsteps = Array.isArray(step.substeps) && step.substeps.length > 0;
        // nextButton.disabled = hasSubsteps ? true : (currentStepIndex === totalSteps - 1);
    }

    if (stepsList) {
        const items = stepsList.querySelectorAll('.step-item');
        items.forEach((itm, idx) => {
            if (idx === currentStepIndex) itm.classList.add('active');
            else itm.classList.remove('active');
        });
    }
}


    function renderSubstepVideo(step, timestamp) {
        const substeps = step.substeps;
        let currentSubstep = 0;
        if (nextButton) nextButton.disabled = false;
        const hotspotDebug = true;
        let finalHandled = false;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
<!--                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>-->
                <div class="play-stage" id="play-stage">
                    <video id="substep-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                    <button id="substep-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="substep-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
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

    function renderImage(step) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="play-stage" id="play-stage">
                    <img id="step-image" src="${step.src}" style="width:100%;height:100%;object-fit:contain;" alt="${step.title}"/>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;">${step.instruction || ''}</div>
            </div>`;
        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        cleanupCurrent = () => {};
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