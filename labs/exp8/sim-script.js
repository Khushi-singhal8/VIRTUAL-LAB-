document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E5 script loaded');
    const RESULT_IMAGE = "images/simulation/final_result.png";

    

    const style = document.createElement('style');
style.innerHTML = `
.apparatus-img-box {
    width: 100%;
    height: 190px;          /* ✅ increased */
    border: 1px solid #ccc;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #f8f9fa;
}

.apparatus-img-box img {
    max-width: 95%;
    max-height: 95%;
    object-fit: contain;
}
`;
document.head.appendChild(style);




    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;
    let step1Completed = false;
    let step1_5Completed = false;
    let step2Completed = false;
    let step3Completed = false;
    let step4Completed = false;
    let step4_5Completed = false;
    let step6Completed = false;

    // ---------- APPARATUS DATA ----------
const apparatusData = [
    {
    name: "File",
    img: "images/apparatus/d].png",
    desc: "Used to smoothen and clean the edges of the metal plates before welding to ensure proper joint formation."
},
{
    name: "Filler Rod",
    img: "images/apparatus/c].png",
    desc: "Used to supply additional molten metal to the joint during welding for proper fusion and strength."
},
{
    name: "Workpiece Clamp",
    img: "images/apparatus/e].png",
    desc: "Used to hold the workpieces firmly in position and maintain proper alignment during welding."
},
{
    name: "Ignitor",
    img: "images/apparatus/b].png",
    desc: "Used to safely ignite the welding flame without using an open flame or matchstick."
},
{
    name: "Setup",
    img: "images/apparatus/f].png",
    desc: "Represents the complete welding arrangement including cylinders, regulators, hoses, and torch."
}

];


    const steps = [
    { id: 'apparatus', title: 'Apparatus Identification', type: 'apparatus' },

    { id: 'step1', title: 'Clean plate edges with file', src: 'images/simulation/1.mp4', type: 'video' },
    { id: 'step1_5', title: 'Clean second plate', src: 'images/simulation/1.5.mp4', type: 'video' },
    { id: 'step2', title: 'Align plates and clamp them', src: 'images/simulation/2.mp4', type: 'video' },
    { id: 'step3_1', title: 'coated the flux', src: 'images/simulation/3.1.mp4', type: 'video' },
    { id: 'step3', title: 'Ignite flame', src: 'images/simulation/3.mp4', type: 'video' },
    { id: 'step4', title: 'Apply small tack welds at both ends of the plates', src: 'images/simulation/4.mp4', type: 'video' },
    { id: 'step4_5', title: 'Welding', src: 'images/simulation/7.mp4', type: 'video' },
    { id: 'result', title: 'Observation & Result', type: 'result' }

    
];

const stepGuidance = {
    apparatus: {
        now: "Identify the apparatus used in gas welding.",
        next: "Clean the plate edges using a file."
    },
    step1: {
        now: "Drag the file to the plate edge.",
        next: "Clean the second plate edge."
    },
    step1_5: {
        now: "Drag the file to clean the second plate.",
        next: "Align the plates and clamp them."
    },
    step2: {
        now: "Click the highlighted areas to align plates.",
        next: "coated the flux."
    },
    step3_1: {
        now: "flux is coated.",
        next: "Apply tack welds at both ends."
    },
    step4: {
        now: "Apply tack welds at both ends of the plates.",
        next: "Start the welding process."
    },
    step4_5: {
        now: "Perform continuous welding.",
        next: "Simulation complete."
    },
   
};


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
            item.setAttribute('aria-disabled', 'true');
            item.style.cursor = 'default';
            item.title = 'Use Previous/Next to navigate';
            stepsList.appendChild(item);
        });
    }

    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) { }
            cleanupCurrent = null;
        }
    }

    function isInteractiveStep(stepId) {
        return stepId === 'step1' || stepId === 'step1_5' || stepId === 'step2' || stepId === 'step3' || stepId === 'step4' || stepId === 'step6';
    }

    function isInteractiveCompleted(stepId) {
        if (stepId === 'step1') return step1Completed;
        if (stepId === 'step1_5') return step1_5Completed;
        if (stepId === 'step2') return step2Completed;
        if (stepId === 'step3') return step3Completed;
        if (stepId === 'step4') return step4Completed;
        if (stepId === 'step4_5') return step4_5Completed;
        if (stepId === 'step6') return step6Completed;
        return true;
    }

    function setInteractiveCompleted(stepId, done) {
        if (stepId === 'step1') step1Completed = done;
        if (stepId === 'step1_5') step1_5Completed = done;
        if (stepId === 'step2') step2Completed = done;
        if (stepId === 'step3') step3Completed = done;
        if (stepId === 'step4') step4Completed = done;
        if (stepId === 'step4_5') step4_5Completed = done;
        if (stepId === 'step6') step6Completed = done;
    }

    
    function renderApparatusStep() {
    let html = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">
                Step ${currentStepIndex + 1} of ${totalSteps}
            </div>

            <div style="
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    justify-items: center;
">

    `;

    apparatusData.forEach((item, index) => {
        html += `
            <div style="
                background:#f5f5f5;
                border-radius:12px;
                padding:15px;
                text-align:center;
            ">
                <!-- IMAGE BOX (controls size) -->
                <div class="apparatus-img-box">
                    <img src="${item.img}" alt="${item.name}">
                </div>

                <h4 style="margin-top:10px;">${index + 1}. ${item.name}</h4>
                <p style="font-size:14px;">${item.desc}</p>
            </div>
        `;
    });

    html += `
            </div>

            <!-- BLUE INSTRUCTION BOX -->
            <div class="drag-instructions" style="margin-top:20px;">
                <b>Now:</b> ${stepGuidance.apparatus.now}<br>
                <b>Next:</b> ${stepGuidance.apparatus.next}
            </div>
        </div>
    `;

    gifContainer.innerHTML = html;
}




   function showCurrentStep() {
    if (!gifContainer) return;

    const step = steps[currentStepIndex];
    const timestamp = Date.now();

    // APPARATUS STEP
    if (step.id === 'apparatus') {
        clearCleanup();
        renderApparatusStep();

        if (currentStepElement)
            currentStepElement.textContent = currentStepIndex + 1;

        if (prevButton) prevButton.disabled = true;
        if (nextButton) nextButton.disabled = false;

        return;
    }

    // ✅ RESULT STEP (FINAL PAGE)
    if (step.id === 'result') {
        clearCleanup();
        renderResultStep();

        if (currentStepElement)
            currentStepElement.textContent = currentStepIndex + 1;

        if (prevButton) prevButton.disabled = false;
        if (nextButton) nextButton.disabled = true;

        return;
    }

    // OTHER STEPS
    clearCleanup();

    if (step.id === 'step1') {
        renderStep1DragDrop(step, timestamp);
    } else if (step.id === 'step1_5') {
        renderStep1_5DragDrop(step, timestamp);
    } else if (step.id === 'step2' || step.id === 'step3') {
    renderInteractiveVideoStep(step, timestamp);
} else if (step.id === 'step3_1') {
    renderPlainVideoStep(step, timestamp);
}
else if (step.id === 'step4') {
        renderStep4DragDrop(step, timestamp);
    } else if (step.id === 'step4_5') {
        renderStep4_5Video(step, timestamp);
    }else {
        renderPlainVideoStep(step, timestamp);
    }

    if (currentStepElement)
        currentStepElement.textContent = currentStepIndex + 1;

    if (prevButton)
        prevButton.disabled = currentStepIndex === 0;

    if (nextButton)
        nextButton.disabled = (currentStepIndex === totalSteps - 1);

    if (stepsList) {
        const items = stepsList.querySelectorAll('.step-item');
        items.forEach((itm, idx) => {
            itm.classList.toggle('active', idx === currentStepIndex);
        });
    }
}



    function renderPlainVideoStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
            </div>
        `;

        const video = document.getElementById('step-video');
        const onMeta = () => {
            video.play().catch(() => { });
        };
        video.addEventListener('loadedmetadata', onMeta, { once: true });

        cleanupCurrent = function () {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.removeEventListener('loadedmetadata', onMeta);
            } catch (_) { }
        };
    }

    function renderStep4_5Video(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
                <div id="step4_5-instruction" class="drag-instructions">Start welding at 5mm/s</div>
            </div>
        `;

        const video = document.getElementById('step-video');
        const instructionElem = document.getElementById('step4_5-instruction');

        const onMeta = () => {
            video.play().catch(() => { });
        };

        video.addEventListener('loadedmetadata', onMeta, { once: true });

       video.addEventListener('ended', () => {
    instructionElem.innerHTML =
        "<b>Step complete.</b> Now next step is: " +
        stepGuidance.step4_5.next;

    if (nextButton) nextButton.disabled = false;
});


        cleanupCurrent = function () {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.removeEventListener('loadedmetadata', onMeta);
            } catch (_) { }
        };
    }

    function renderInteractiveVideoStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        let cfgSeq;
        if (step.id === 'step2') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.3433333333333333, y: 0.5251851851851852, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the first plate.' },
                { pauseAt: 1.95, hotspot: { x: 0.7144444444444444, y: 0.591604938271605, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the second plate.' }
            ];
        } else if (step.id === 'step3') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.40518, y: 0.24, w: 0.0623, h: 0.112 }, instruction: 'Set pressure for acetylene to 120kPa' },
                { pauseAt: 3.13, hotspot: { x: 0.5353154710458081, y: 0.328790715087982, w: 0.07554019014693172, h: 0.1052190190939723 }, instruction: 'Set pressure for oxygen to 250kPa.' },
                { pauseAt: 6.36, hotspot: { x: 0.41109766637856526, y: 0.33198053163609137, w: 0.045168539325842694, h: 0.07922875327592663 }, instruction: 'Open acetylene valve slightly.' },
                { pauseAt: 11.26, hotspot: { x: 0.23823681936041485, y: 0.1612579558217896, w: 0.053811581676750216, h: 0.19304380381879446 }, instruction: 'Ignite flame.' },
                { pauseAt: 19.33, hotspot: { x: 0.46641313742437335, y: 0.37990265818045676, w: 0.053811581676750216, h: 0.10618494945713217 }, instruction: 'Add oxygen to achieve neutral flame.' }
            ];
        } else if (step.id === 'step4') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.44, y: 0.717283950617284, w: 0.042222222222222223, h: 0.07506172839506173 }, instruction: 'Click here to apply tack weld at the first end.' },
                { pauseAt: 5.8, hotspot: { x: 0.4722222222222222, y: 0.6185185185185185, w: 0.042222222222222223, h: 0.07506172839506173 }, instruction: 'Click here to apply tack weld at the second end.' }
            ];
        }

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>
        `;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        let segmentIndex = 0;
        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedForSegment = false;

        function layoutHotspot() {
            const rect = stage.getBoundingClientRect();
            const cfg = cfgSeq[Math.min(segmentIndex, cfgSeq.length - 1)];
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
        }

        function showHotspot() {
            const cfg = cfgSeq[segmentIndex];
            instructionElem.textContent = `${cfg.instruction}`;
            layoutHotspot();
            hotspot.style.display = 'block';
            hotspot.classList.add('debug-highlight');
        }

        function maybePause() {
            if (segmentIndex >= cfgSeq.length || pausedForSegment) return;
            if (video.currentTime + EPS >= cfgSeq[segmentIndex].pauseAt) {
                pausedForSegment = true;
                video.pause();
                showHotspot();
            }
        }

        function frameCallback() {
            maybePause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        function onPlay() {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(maybePause, 16);
            }
        }

        function onPause() {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function onHotspotClick() {
            hotspot.style.display = 'none';
            pausedForSegment = false;
            segmentIndex++;
            video.play();
        }

        function onEnded() {
    setInteractiveCompleted(step.id, true);
    instructionElem.innerHTML =
        "<b>Step complete.</b> Now next step is: " +
        stepGuidance[step.id].next;

    if (nextButton) nextButton.disabled = false;
}


        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', onHotspotClick);

        window.addEventListener('resize', layoutHotspot);
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();
            video.play().catch(() => { });
        }, { once: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('resize', layoutHotspot);
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                hotspot.removeEventListener('click', onHotspotClick);
            } catch (_) { }
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
    }

    function renderStep1DragDrop(step, timestamp) {
        step1Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/1.mp4';
        const bgPath = 'images/simulation/1.png';
        const toolPath = 'images/simulation/1-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step1-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-file-1" class="draggable" alt="File tool" style="position: absolute; z-index: 20; cursor: grab; width: 35%; top: 10%; right: 10%;"/>
                    <div id="step1-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step1-instruction" class="drag-instructions">Drag the file to the plate edge.</div>
            </div>
        `;

        const dragStage = document.getElementById('step1-drag-stage');
        const fileTool = document.getElementById('draggable-file-1');
        const dropZone = document.getElementById('step1-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step1-play-stage');
        const video = document.getElementById('step1-video');
        const instructionElem = document.getElementById('step1-instruction');

        // Drop zone target (adjust x and y for the plate edge location)
        const targetRel = {x: 0.57, y: 0.5};
        const tolerancePx = 80;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.08;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;
            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) setDropZoneLayout();
        else dragBg.onload = setDropZoneLayout;
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            fileTool.classList.add('dragging');
            const rect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - fileRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - fileRect.height));

            fileTool.style.left = newLeft + 'px';
            fileTool.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            fileTool.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const fileCenter = {
                x: fileRect.left - stageRect.left + fileRect.width / 2,
                y: fileRect.top - stageRect.top + fileRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(fileCenter.x - targetX, fileCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                setTimeout(startVideoPhase, 500);
            }
        }

        fileTool.addEventListener('mousedown', onPointerDown);
        fileTool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            // Cleanup drag listeners
            window.removeEventListener('resize', setDropZoneLayout);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Cleaning plate edges...";

           video.onended = () => {
    instructionElem.innerHTML =
        "<b>Step complete.</b> Now next step is: " +
        stepGuidance.step1.next;

    step1Completed = true;
    if (nextButton) nextButton.disabled = false;
};

            video.play();
        }

        cleanupCurrent = () => {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
            } catch (_) { }
        };
    }

    function renderStep1_5DragDrop(step, timestamp) {
        step1_5Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/1.5.mp4';
        const bgPath = 'images/simulation/1.5.png';
        const toolPath = 'images/simulation/1.5-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step1_5-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-file-1_5" class="draggable" alt="Tool" style="position: absolute; z-index: 20; cursor: grab; width: 35%; top: 10%; right: 10%;"/>
                    <div id="step1_5-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1_5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1_5-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step1_5-instruction" class="drag-instructions">Drag the tool to the plate edge.</div>
            </div>
        `;

        const dragStage = document.getElementById('step1_5-drag-stage');
        const fileTool = document.getElementById('draggable-file-1_5');
        const dropZone = document.getElementById('step1_5-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step1_5-play-stage');
        const video = document.getElementById('step1_5-video');
        const instructionElem = document.getElementById('step1_5-instruction');

        // Drop zone target (adjust x and y for the plate edge location)
        const targetRel = {x: 0.43, y: 0.5};
        const tolerancePx = 80;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.08;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;
            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) setDropZoneLayout();
        else dragBg.onload = setDropZoneLayout;
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            fileTool.classList.add('dragging');
            const rect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - fileRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - fileRect.height));

            fileTool.style.left = newLeft + 'px';
            fileTool.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            fileTool.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const fileCenter = {
                x: fileRect.left - stageRect.left + fileRect.width / 2,
                y: fileRect.top - stageRect.top + fileRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(fileCenter.x - targetX, fileCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                setTimeout(startVideoPhase, 500);
            }
        }

        fileTool.addEventListener('mousedown', onPointerDown);
        fileTool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            // Cleanup drag listeners
            window.removeEventListener('resize', setDropZoneLayout);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Cleaning plate...";

            video.onended = () => {
    instructionElem.innerHTML =
        "<b>Step complete.</b> Now next step is: " +
        stepGuidance.step1_5.next;

    step1_5Completed = true;
    if (nextButton) nextButton.disabled = false;
};

            video.play();
        }

        cleanupCurrent = () => {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
            } catch (_) { }
        };
    }

    function renderStep4DragDrop(step, timestamp) {
        step4Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/4.mp4';
        const bgPath = 'images/simulation/4.png';
        const tool1Path = 'images/simulation/4-tool1.png';
        const tool2Path = 'images/simulation/4-tool2.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step4-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" alt="Plate for tack welding" style="width: 100%; height: auto; display: block;"/>
                    <img src="${tool1Path}?t=${timestamp}" id="draggable-tool1" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 10%; right: 10%;"/>
                   <img src="${tool2Path}?t=${timestamp}" id="draggable-tool2"class="draggable"style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 10%; right: 25%;"/>

                    <div id="step4-drop-zone1" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                    <div id="step4-drop-zone2"
     class="drop-zone"
     style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7);
            background: rgba(255, 255, 0, 0.2); border-radius: 50%;
            z-index: 5;">
</div>

                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step4-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step4-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step4-instruction" class="drag-instructions">
    Drag both welding tools to their respective ends of the plates.
</div>

            </div>
        `;

        const dragStage = document.getElementById('step4-drag-stage');
        const tool1 = document.getElementById('draggable-tool1');
        const tool2 = document.getElementById('draggable-tool2');
        const dropZone1 = document.getElementById('step4-drop-zone1');
        const dropZone2 = document.getElementById('step4-drop-zone2');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step4-play-stage');
        const video = document.getElementById('step4-video');
        const instructionElem = document.getElementById('step4-instruction');

        // Drop zone targets for both tack weld positions
        const target1Rel = {x: 0.5, y: 0.6};
        const target2Rel = {x: 0.36, y: 0.55};
        const tolerancePx = 80;

        let tool1Done = false;
        let tool2Done = false;
        let activeTool = null;


        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.05;
            const h = w;

            // Layout drop zone 1
            const tx1 = rect.width * target1Rel.x;
            const ty1 = rect.height * target1Rel.y;
            dropZone1.style.width = w + 'px';
            dropZone1.style.height = h + 'px';
            dropZone1.style.left = (tx1 - w / 2) + 'px';
            dropZone1.style.top = (ty1 - h / 2) + 'px';

            // Layout drop zone 2
            const tx2 = rect.width * target2Rel.x;
            const ty2 = rect.height * target2Rel.y;
            dropZone2.style.width = w + 'px';
            dropZone2.style.height = h + 'px';
            dropZone2.style.left = (tx2 - w / 2) + 'px';
            dropZone2.style.top = (ty2 - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) setDropZoneLayout();
        else dragBg.onload = setDropZoneLayout;
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
    if (e.target !== tool1 && e.target !== tool2) return;

    activeTool = e.target;
    dragging = true;
    activeTool.classList.add('dragging');

    const rect = activeTool.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;

    startX = clientX - rect.left;
    startY = clientY - rect.top;
    e.preventDefault();
}


        function onPointerMove(e) {
    if (!dragging || !activeTool) return;   // 🔒 lock movement to active tool only

    const stageRect = dragStage.getBoundingClientRect();
    const toolRect = activeTool.getBoundingClientRect();

    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;

    let newLeft = clientX - stageRect.left - startX;
    let newTop = clientY - stageRect.top - startY;

    newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
    newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

    activeTool.style.left = newLeft + 'px';
    activeTool.style.top = newTop + 'px';
}


        function onPointerUp() {
    if (!dragging || !activeTool) return;
    dragging = false;
    activeTool.classList.remove('dragging');

    const stageRect = dragStage.getBoundingClientRect();
    const toolRect = activeTool.getBoundingClientRect();

    const toolCenter = {
        x: toolRect.left - stageRect.left + toolRect.width / 2,
        y: toolRect.top - stageRect.top + toolRect.height / 2
    };

    // Decide correct drop zone based on tool
    const dropZone = (activeTool === tool1) ? dropZone1 : dropZone2;
    const dzRect = dropZone.getBoundingClientRect();

    const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
    const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

    const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

    if (dist < tolerancePx) {
        // Snap tool
        activeTool.style.left = (targetX - toolRect.width / 2) + 'px';
        activeTool.style.top = (targetY - toolRect.height / 2) + 'px';

        // Lock this tool
        activeTool.style.pointerEvents = 'none';
        activeTool.style.cursor = 'default';

        dropZone.classList.add('success');

        // Mark completion
        if (activeTool === tool1) tool1Placed = true;
        if (activeTool === tool2) tool2Placed = true;

        instructionElem.textContent = "Place the other welding tool.";

        // When BOTH are placed → play video
        if (tool1Placed && tool2Placed) {
            setTimeout(startVideoPhase, 500);
        }
    }

    activeTool = null;
}


        tool1.addEventListener('mousedown', onPointerDown);
        tool1.addEventListener('touchstart', onPointerDown);
        tool2.addEventListener('mousedown', onPointerDown);
        tool2.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            // Cleanup drag listeners
            window.removeEventListener('resize', setDropZoneLayout);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Applying tack welds...";

            video.onended = () => {
    instructionElem.innerHTML =
        "<b>Step complete.</b> Now next step is: " +
        stepGuidance.step4.next;

    step4Completed = true;
    if (nextButton) nextButton.disabled = false;
};

            video.play();
        }

        cleanupCurrent = () => {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
            } catch (_) { }
        };
    }
    
    function renderResultStep() {
    gifContainer.innerHTML = `
        <div class="gif-wrapper">
            <h3>Brazing of Two Metal Sheets – Observation & Result</h3>
            <div class="step-indicator">Final Step</div>

            <!-- RESULT IMAGE -->
            <div style="text-align:center; margin:20px 0;">
                <img src="images/simulation/print1.png" 
                     alt="Brazed Joint Result"
                     style="max-width:50%; border:1px solid #ccc; border-radius:8px;">
            </div>

            <!-- OBSERVATION TABLE -->
            <h4>Observation Table</h4>
            <table border="1" width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <th>Sheet Material</th>
                    <th>Filler Used</th>
                    <th>Flux</th>
                    <th>Joint Quality</th>
                    <th>Notes</th>
                </tr>
                <tr>
                    <td>Mild Steel</td>
                    <td>Brass Rod</td>
                    <td>Borax</td>
                    <td>Clean & Leak-proof</td>
                    <td>Smooth Finish</td>
                </tr>
            </table>

            <!-- RESULT -->
            <h4 style="margin-top:20px;">Result</h4>
            <p>
                The two metal sheets were successfully joined using the brazing process.
                The molten filler metal flowed uniformly into the joint by capillary action,
                resulting in a smooth, continuous, and leak-tight joint without melting
                the base metals.
            </p>

            <!-- TEMPERATURE DETAILS -->
            <h4>Neutral Flame Temperature</h4>
            <p>
                The neutral flame temperature used during brazing was approximately
                <b>3,200°C to 3,300°C</b>.
            </p>

            <h4>Heating Temperature</h4>
            <p>
                During brazing, the joint was heated to a temperature above
                <b>450°C</b> and below the melting point of the base metals.
                Controlled heating ensured proper melting of the filler metal
                while preventing deformation of the sheets.
            </p>

            <!-- CONCLUSION -->
            <h4>Conclusion</h4>
            <p>
                The experiment demonstrated that brazing is a reliable method for joining
                metal sheets, especially thin and dissimilar materials. Proper surface
                cleaning, correct flux application, and controlled heating using a neutral
                flame were essential for obtaining a strong and clean joint. The experiment
                provided a clear understanding of brazing principles, equipment handling,
                and industrial applications, thereby fulfilling the aim of the experiment.
            </p>

            <!-- PRINT BUTTON -->
            <div style="text-align:center; margin-top:30px;">
                <button onclick="window.print()"
                        style="padding:10px 25px; font-size:16px; cursor:pointer;">
                    🖨️ Print Page
                </button>
            </div>
        </div>
    `;

    if (nextButton) nextButton.disabled = true;
}

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                showCurrentStep();
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
    }
    if (resetButton) {
        resetButton.onclick = () => {
            location.reload();
        };
    }

    showCurrentStep();
}); 