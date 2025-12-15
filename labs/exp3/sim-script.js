document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation script loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');

    let step2Completed = false;
    let cleanupStep2 = null;
    let step3Completed = false;
    let cleanupStep3 = null;
    let step5Completed = false;
    let cleanupStep5 = null;
    let cleanupStep6 = null;
    let step7Completed = false;
    let cleanupStep7 = null;
    let selectedWood = null;

    // Wood selection data
    const woodTypes = [
        { name: 'Teak', id: 'teak', hotspot: { x: 0.0025, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } },
        { name: 'Pine wood', id: 'pine', hotspot: { x: 0.415, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } },
        { name: 'Mahogany', id: 'mahogany', hotspot: { x: 0.83, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } }
    ];

    // Base steps
    const baseSteps = [
        {
            id: 'step1',
            title: 'These are the different types of wood used in pattern making',
            src: 'images/simulation/1.png',
            isWoodSelection: true
        },
        {
            id: 'step1.5',
            title: 'Marking',
            src: 'images/simulation/1.5.mp4'
        },
        {
            id: 'step2',
            title: 'Put the workpiece in the chuck',
            src: 'images/simulation/2.gif'
        },
        {
            id: 'step3',
            title: 'Prepare Machine: Move tool post and tail stock',
            src: 'images/simulation/3.mp4'
        },

        {
            id: 'step5',
            title: 'Move the tool to the tool post (drag and drop).',
            src: 'images/simulation/5.png'
        },
        {
            id: 'step6',
            title: 'Press green button to start operation.',
            src: 'images/simulation/6.mp4'
        },
        {
            id: 'step7',
            title: 'Finishing process with the sand paper.',
            src: 'images/simulation/7.mp4'
        },
        {
            id: 'step8',
            title: 'Vernier calliper is used to check the diameter.',
            src: 'images/simulation/8.mp4'
        },
        {
            id: 'step9',
            title: 'Observation & Result (Print)',
            isPrintStep: true
        }

    ];

    let steps = baseSteps;

    let currentStepIndex = 0;

    function updateButtons() {
    if (prevButton) {
        prevButton.disabled = currentStepIndex === 0;
    }

    if (nextButton) {
        const step = steps[currentStepIndex];
        nextButton.disabled = step.isPrintStep === true;
    }
}
    const totalSteps = steps.length;
    const stepsList = document.getElementById('steps-list');
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
            stepsList.appendChild(item);
        });
    }

    if (totalStepsElement) {
        totalStepsElement.textContent = totalSteps;
    }

    function getSimulationPath(src) {
        if (!selectedWood) return src;
        return src.replace('images/simulation/', `images/simulation/${selectedWood}/`);
    }

    function showCurrentStep() {
    if (!gifContainer) return;

    const step = steps[currentStepIndex];

    // PRINT STEP
    if (step.isPrintStep) {
        renderPrintStep();
        updateButtons();
        return;
    }

    const timestamp = new Date().getTime();
    const currentSrc = getSimulationPath(step.src);

    // Cleanup
    if (cleanupStep2) { try { cleanupStep2(); } catch {} cleanupStep2 = null; }
    if (cleanupStep3) { try { cleanupStep3(); } catch {} cleanupStep3 = null; }
    if (cleanupStep5) { try { cleanupStep5(); } catch {} cleanupStep5 = null; }
    if (cleanupStep6) { try { cleanupStep6(); } catch {} cleanupStep6 = null; }
    if (cleanupStep7) { try { cleanupStep7(); } catch {} cleanupStep7 = null; }

    // Step routing
    if (step.isWoodSelection) {
        renderWoodSelection(timestamp);
    } else if (step.id === 'step2') {
        renderStep2(timestamp);
    } else if (step.id === 'step3') {
        renderStep3(timestamp);
    } else if (step.id === 'step5') {
        renderStep5(timestamp);
    } else if (step.id === 'step6') {
        renderStep6(timestamp);
    } else if (step.id === 'step7') {
        renderStep7(timestamp);
    } else {
        const isVideo = currentSrc.endsWith('.mp4');

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">
                    Step ${currentStepIndex + 1} of ${totalSteps}
                </div>
                <div style="height:400px;display:flex;align-items:center;justify-content:center;">
                    ${
                        isVideo
                        ? `<video src="${currentSrc}?t=${timestamp}" autoplay muted playsinline style="width:100%;height:100%;object-fit:contain;"></video>`
                        : `<img src="${currentSrc}?t=${timestamp}" class="step-gif">`
                    }
                </div>
            </div>
        `;
    }

    updateButtons();
}

function renderPrintStep() {
    gifContainer.innerHTML = `
        <div class="gif-wrapper print-area">
            <h2 style="text-align:center;">EXPERIMENT OBSERVATION SHEET</h2>
            <hr>

            <p><strong>Experiment:</strong> Pattern Making – Turning Operation</p>
            <p><strong>Material Used:</strong> ${selectedWood || 'N/A'}</p>

            <!-- MATERIAL IMAGE (ADD HERE) -->
            ${
                selectedWood
                ? `<div style="text-align:center; margin: 15px 0;">
                       <img 
                           src="images/simulation/${selectedWood}/${selectedWood}.png"
                           alt="${selectedWood}"
                           style="max-width:300px; border:1px solid #000;"
                       >
                   </div>`
                : ''
            }
<h3>Measurements</h3>
<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Parameter</th>
        <th>Value</th>
    </tr>

    <tr>
        <td>Diameter – Part 1</td>
        <td>50 mm</td>
    </tr>
    <tr>
        <td>Diameter – Part 2</td>
        <td>75 mm</td>
    </tr>
    <tr>
        <td>Diameter – Part 3</td>
        <td>100 mm</td>
    </tr>

    <tr>
        <td>Length – Part 1</td>
        <td>125 mm</td>
    </tr>
    <tr>
        <td>Length – Part 2</td>
        <td>125 mm</td>
    </tr>
    <tr>
        <td>Length – Part 3</td>
        <td>125 mm</td>
    </tr>

    <tr>
        <td><strong>Total Length</strong></td>
        <td><strong>375 mm</strong></td>
    </tr>
</table>


            <h3 style="margin-top:20px;">Result</h3>
            <p>
                The turning operation was successfully completed and the diameter
                was measured using a Vernier Caliper.
            </p>

            <div class="no-print" style="text-align:center; margin-top:30px;">
                <button onclick="window.print()">🖨 Print Observation Sheet</button>
            </div>
        </div>
    `;

    if (nextButton) nextButton.disabled = true;
}

function renderWoodSelection(timestamp) {
    const imgSrc = 'images/simulation/1.png';

    gifContainer.innerHTML = `
        <div class="gif-wrapper" style="width: 100%; height: 100%;">
            <h3>These are the different types of wood used in pattern making</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
            <div class="play-stage" id="play-stage">
                <img id="wood-selection-img" src="${imgSrc}?t=${timestamp}" alt="Wood types" style="width:100%;height:100%;object-fit:contain;"/>
            </div>
            <div class="drag-instructions">Click on a wood type to select it</div>
        </div>
    `;

    const stage = document.getElementById('play-stage');
    const img = document.getElementById('wood-selection-img');

   
    function createWoodHotspots() {
        woodTypes.forEach(wood => {
            const hotspot = document.createElement('button');
            hotspot.className = 'play-hotspot wood-hotspot';
            hotspot.dataset.wood = wood.id;
            hotspot.setAttribute('aria-label', `Select ${wood.name}`);
            hotspot.title = wood.name;
            stage.appendChild(hotspot);

            hotspot.addEventListener('click', () => {
                selectWood(wood.id, wood.name);
            });
        });
        layoutWoodHotspots();
    }


        function layoutWoodHotspots() {
            const rect = stage.getBoundingClientRect();
            woodTypes.forEach(wood => {
                const hotspot = stage.querySelector(`[data-wood="${wood.id}"]`);
                if (!hotspot) return;
                const hs = wood.hotspot;
                hotspot.style.left = (rect.width * hs.x) + 'px';
                hotspot.style.top = (rect.height * hs.y) + 'px';
                hotspot.style.width = (rect.width * hs.w) + 'px';
                hotspot.style.height = (rect.height * hs.h) + 'px';
            });
        }

        if (img.complete && img.naturalWidth) {
            createWoodHotspots();
        } else {
            img.addEventListener('load', () => {
                createWoodHotspots();
            }, { once: true });
        }

        window.addEventListener('resize', layoutWoodHotspots);
    }

    function selectWood(woodId, woodName) {
        selectedWood = woodId;
        console.log('Selected wood:', woodName);
        if (nextButton) nextButton.disabled = false;

        // Visual feedback
        const hotspots = gifContainer.querySelectorAll('.wood-hotspot');
        hotspots.forEach(hs => {
            if (hs.dataset.wood === woodId) {
                hs.style.backgroundColor = 'rgba(76, 175, 80, 0.6)';
                hs.style.borderColor = '#4CAF50';
            } else {
                hs.style.opacity = '0.4';
            }
        });

        // Show confirmation message
        const instructions = gifContainer.querySelector('.drag-instructions');
        if (instructions) {
            instructions.textContent = `You selected: ${woodName}`;
        }
    }

    function renderStep7(timestamp) {
        step7Completed = false;

        const videoSrc = getSimulationPath('images/simulation/7.mp4');
        const bgPath = getSimulationPath('images/simulation/7.png');
        const toolPath = getSimulationPath('images/simulation/sand.png');

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${steps[currentStepIndex].title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step7-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-sand" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 8%; top: 10%; right: 10%;"/>
                    <div id="step7-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step7-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step7-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step7-instruction" class="drag-instructions">Drag the sandpaper to the workpiece.</div>
            </div>
        `;

        const dragStage = document.getElementById('step7-drag-stage');
        const sand = document.getElementById('draggable-sand');
        const dropZone = document.getElementById('step7-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step7-play-stage');
        const video = document.getElementById('step7-video');
        const instructionElem = document.getElementById('step7-instruction');

        // Layout
        // To change the target location, adjust x and y values below (0.0 to 1.0)
        // x=0.5, y=0.5 is the center of the image.
        const targetRel = { x: 0.25, y: 0.3 };
        const tolerancePx = 60;

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
            sand.classList.add('dragging');
            const rect = sand.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const sandRect = sand.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - sandRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - sandRect.height));

            sand.style.left = newLeft + 'px';
            sand.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            sand.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const sandRect = sand.getBoundingClientRect();
            const sandCenter = {
                x: sandRect.left - stageRect.left + sandRect.width / 2,
                y: sandRect.top - stageRect.top + sandRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(sandCenter.x - targetX, sandCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                // No snap, just proceed
                setTimeout(startVideoPhase, 500);
            }
        }

        sand.addEventListener('mousedown', onPointerDown);
        sand.addEventListener('touchstart', onPointerDown);
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
            instructionElem.textContent = "Finishing process...";

            video.onended = () => {
                instructionElem.textContent = "Step complete!";
                step7Completed = true; // Assumed global or need to declare
                if (nextButton) nextButton.disabled = false;
            };
            video.play();
        }

        cleanupStep7 = () => {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
            } catch (_) { }
        };
    }
    function renderStep6(timestamp) {
        if (cleanupStep6) {
            try { cleanupStep6(); } catch (e) { }
            cleanupStep6 = null;
        }

        const gifPath = getSimulationPath('images/simulation/6.mp4');
        const posterPath = getSimulationPath('images/simulation/6.png');

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>Press green button to start operation.</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img id="step6-poster" alt="Operation" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                    <video id="step6-video" class="stage-bg" style="display:none; width: 100%; height: auto;" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" aria-label="Start"></button>
                </div>
                <div class="drag-instructions">Click the green button to start.</div>
            </div>
        `;

        const stage = document.getElementById('play-stage');
        const poster = document.getElementById('step6-poster');
        const video = document.getElementById('step6-video');
        const hotspot = document.getElementById('play-hotspot');

        const HOTSPOT_MODE = 'rel';
        const hotspotRel = { x: 0.8864, y: 0.5598, w: 0.0306, h: 0.0809 };
        const hotspotPx = { x: 556, y: 142, w: 22, h: 25 };

        function layoutHotspot() {
            const rect = stage.getBoundingClientRect();
            let x, y, w, h;
            if (HOTSPOT_MODE === 'px') {
                ({ x, y, w, h } = hotspotPx);
            } else {
                x = rect.width * hotspotRel.x;
                y = rect.height * hotspotRel.y;
                w = rect.width * hotspotRel.w;
                h = rect.height * hotspotRel.h;
            }
            hotspot.style.left = x + 'px';
            hotspot.style.top = y + 'px';
            hotspot.style.width = w + 'px';
            hotspot.style.height = h + 'px';
        }

        function startVideo() {
            poster.style.display = 'none';
            hotspot.style.display = 'none';
            video.src = `${gifPath}?t=${timestamp}`;
            video.style.display = 'block';
            video.play();

            video.addEventListener('ended', () => {
                // Optional: what to do when video ends? 
                // Maybe show "Next" button? 
                // Currently Step 6 completion logic was implicit/missing in original code other than just showing the gif.
                // Let's assume enabling next button.
                if (nextButton) nextButton.disabled = false;
            });
        }

        poster.src = `${posterPath}?t=${timestamp}`;
        // Layout hotspot based on poster size initially
        poster.onload = layoutHotspot;
        window.addEventListener('resize', layoutHotspot);

        hotspot.addEventListener('click', startVideo, { once: true });

        cleanupStep6 = function () {
            try {
                window.removeEventListener('resize', layoutHotspot);
            } catch (e) { }
        };
    }

    function renderStep3(timestamp) {
        step3Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = getSimulationPath('images/simulation/3.mp4');
        const substeps = [
            // Placeholder substeps - Adjust time and hotspots as needed
            { time: 0.97, hotspot: { x: 0.61625, y: 0.5266666666666666, w: 0.045, h: 0.15333333333333332 }, instruction: 'Unlock the tool rest lock' },
            { time: 3.97, hotspot: { x: 0.50625, y: 0.31777777777777777, w: 0.2475, h: 0.36444444444444446 }, instruction: 'Move tool post to its position' },
            { time: 7, hotspot: { x: 0.71625, y: 0.31777777777777777, w: 0.23375, h: 0.3 }, instruction: 'Move tail stock to its position' },
            { time: 7.97, hotspot: { x: 0.53625, y: 0.32222222222222224, w: 0.0875, h: 0.16 }, instruction: 'Lock the tail stock' },
            { time: 8.95, hotspot: { x: 0.29875, y: 0.49333333333333335, w: 0.0875, h: 0.16 }, instruction: 'Engage the tool rest lock' },
            { time: 9, instruction: 'Step complete!' }
        ];
        let currentSubstep = 0;

        const hotspotDebug = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${steps[currentStepIndex].title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step3-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                    <button id="substep-hotspot-3" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="substep-instruction-3" class="drag-instructions"></div>
            </div>
        `;

        const video = document.getElementById('step3-video');
        const hotspot = document.getElementById('substep-hotspot-3');
        if (hotspotDebug) {
            hotspot.classList.add('debug-highlight');
        }
        const instructionElem = document.getElementById('substep-instruction-3');
        const stage = document.getElementById('play-stage');

        function setupSubstep() {
            const substep = substeps[currentSubstep];
            instructionElem.textContent = substep.instruction;

            if (substep.hotspot) {
                const hotspotRel = substep.hotspot;
                const rect = stage.getBoundingClientRect();
                hotspot.style.left = (rect.width * hotspotRel.x) + 'px';
                hotspot.style.top = (rect.height * hotspotRel.y) + 'px';
                hotspot.style.width = (rect.width * hotspotRel.w) + 'px';
                hotspot.style.height = (rect.height * hotspotRel.h) + 'px';
                hotspot.style.display = 'block';

                hotspot.onclick = () => {
                    hotspot.style.display = 'none';
                    video.play();
                };
            } else {
                step3Completed = true;
                if (nextButton) nextButton.disabled = false;
            }
        }

        let rafId = null;
        let intervalId = null;
        const EPS = 0.05; // Slightly larger tolerance

        function checkAndPause() {
            if (currentSubstep >= substeps.length) return;
            const target = substeps[currentSubstep].time;
            const t = video.currentTime;
            if (t >= target && t < target + 0.5) { // Check if within range
                video.pause();
                // Ensure we don't process the same substep multiple times if it pauses slightly off
                if (currentSubstep < substeps.length - 1) {
                    // Only advance if we are strictly paused? 
                    // Or just advance state.
                    if (!video.paused) video.pause(); // Force pause
                    currentSubstep++;
                    setupSubstep();
                } else {
                    instructionElem.textContent = 'Step complete!';
                    step3Completed = true;
                    if (nextButton) nextButton.disabled = false;
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
            setupSubstep();
        });

        const onPlay = () => {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(checkAndPause, 16);
            }
        };

        const onPause = () => {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        cleanupStep3 = () => {
            try {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
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

    function renderStep5(timestamp) {
        step5Completed = false;

        const backgroundPng = getSimulationPath('images/simulation/5.png');
        const toolPng = getSimulationPath('images/simulation/tool.png');

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>Move the tool to the tool post (drag and drop).</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="drag-stage" id="drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${backgroundPng}?t=${timestamp}" alt="Background" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                    <img src="${toolPng}?t=${timestamp}" alt="Tool" id="draggable-tool" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 15%;"/>
                    <div id="drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>
                <div class="drag-instructions">Drag the tool onto the tool post location highlighted on the machine.</div>
            </div>
        `;

        const stage = document.getElementById('drag-stage');
        const tool = document.getElementById('draggable-tool');
        const dropZone = document.getElementById('drop-zone');
        const stageBg = stage.querySelector('.stage-bg');

        const TOOL_INIT_MODE = 'rel';
        const toolInitRel = { x: 0.90, y: 0.42 };
        const toolInitPx = { left: 750, top: 200 };
        let toolInitialPlaced = false;
        let toolMovedByUser = false;

        function placeToolAtInit() {
            const rect = stage.getBoundingClientRect();
            let left, top;
            if (TOOL_INIT_MODE === 'rel') {
                left = rect.width * toolInitRel.x;
                top = rect.height * toolInitRel.y;
            } else {
                left = toolInitPx.left;
                top = toolInitPx.top;
            }
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
            toolInitialPlaced = true;
        }

        const TARGET_MODE = 'rel';
        const targetRel = { x: 0.3159, y: 0.4734 };
        const targetPx = { x: 227, y: 115 };
        const tolerancePx = 48;

        function getTargetPoint(rect) {
            if (TARGET_MODE === 'px') {
                return { x: targetPx.x, y: targetPx.y };
            }
            return { x: rect.width * targetRel.x, y: rect.height * targetRel.y };
        }

        function layoutDropZone() {
            const rect = stage.getBoundingClientRect();
            const dzSize = Math.max(70, Math.min(rect.width, rect.height) * 0.12);
            const target = getTargetPoint(rect);
            const targetX = target.x;
            const targetY = target.y;
            dropZone.style.width = dzSize + 'px';
            dropZone.style.height = dzSize + 'px';
            dropZone.style.left = (targetX - dzSize / 2) + 'px';
            dropZone.style.top = (targetY - dzSize / 2) + 'px';
        }

        function resizeStageToImage() {
            const naturalW = stageBg.naturalWidth;
            const naturalH = stageBg.naturalHeight;
            if (!naturalW || !naturalH) return;
            const stageW = stage.clientWidth;
            const newH = Math.round(stageW * (naturalH / naturalW));
            stage.style.height = newH + 'px';
            layoutDropZone();
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const currentLeft = parseFloat(tool.style.left || '0');
            const currentTop = parseFloat(tool.style.top || '0');
            const clampedLeft = Math.max(0, Math.min(currentLeft, rect.width - toolRect.width));
            const clampedTop = Math.max(0, Math.min(currentTop, rect.height - toolRect.height));
            if (clampedLeft !== currentLeft || clampedTop !== currentTop) {
                tool.style.left = clampedLeft + 'px';
                tool.style.top = clampedTop + 'px';
            }
            if (!toolMovedByUser && !toolInitialPlaced && TOOL_INIT_MODE === 'rel') {
                placeToolAtInit();
            }
        }

        if (stageBg.complete && stageBg.naturalWidth) {
            resizeStageToImage();
            if (!toolMovedByUser && TOOL_INIT_MODE === 'rel') placeToolAtInit();
        } else {
            stageBg.addEventListener('load', () => {
                resizeStageToImage();
                if (!toolMovedByUser && TOOL_INIT_MODE === 'rel') placeToolAtInit();
            }, { once: true });
        }

        layoutDropZone();
        window.addEventListener('resize', resizeStageToImage, { passive: true });

        let dragging = false;
        let offsetX = 0, offsetY = 0;

        function onPointerDown(e) {
            if (step5Completed) return;
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            dragging = true;
            toolMovedByUser = true;
            tool.classList.add('dragging');
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            offsetX = clientX - toolRect.left;
            offsetY = clientY - toolRect.top;
            e.preventDefault();
        }

        function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

        function onPointerMove(e) {
            if (!dragging || step5Completed) return;
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            let left = clientX - rect.left - offsetX;
            let top = clientY - rect.top - offsetY;
            left = clamp(left, 0, rect.width - toolRect.width);
            top = clamp(top, 0, rect.height - toolRect.height);
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            tool.classList.remove('dragging');
            checkDrop();
        }

        function centerDistance(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.hypot(dx, dy);
        }

        function checkDrop() {
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const toolCenter = {
                x: toolRect.left - rect.left + toolRect.width / 2,
                y: toolRect.top - rect.top + toolRect.height / 2
            };
            const target = getTargetPoint(rect);
            if (centerDistance(toolCenter, target) <= tolerancePx) {
                snapToTarget();
            }
        }

        function snapToTarget() {
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const target = getTargetPoint(rect);
            const left = target.x - toolRect.width / 2;
            const top = target.y - toolRect.height / 2;
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
            tool.style.transition = 'left 0.15s ease, top 0.15s ease';
            setTimeout(() => { tool.style.transition = ''; }, 200);
            dropZone.classList.add('success');
            step5Completed = true;
            if (nextButton) nextButton.disabled = false;

            // Update instruction text
            const instructions = gifContainer.querySelector('.drag-instructions');
            if (instructions) {
                instructions.textContent = 'Step complete!';
            }

            const ok = document.createElement('div');
            ok.className = 'drag-success';
            ok.textContent = 'Placed correctly!';
            stage.appendChild(ok);
            setTimeout(() => ok.remove(), 1200);
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('mousemove', onPointerMove, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('mouseup', onPointerUp, { passive: true });
        window.addEventListener('touchend', onPointerUp, { passive: true });

        cleanupStep5 = function () {
            try {
                window.removeEventListener('resize', resizeStageToImage);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                tool.removeEventListener('mousedown', onPointerDown);
                tool.removeEventListener('touchstart', onPointerDown);
            } catch (e) { }
        }
    }

    function renderStep2(timestamp) {
        step2Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = getSimulationPath('images/simulation/2.1.mp4');
        const video1Src = getSimulationPath('images/simulation/2.1.mp4');
        const chunkBgPath = getSimulationPath('images/simulation/2.png');
        const keyPath = getSimulationPath('images/simulation/key.png');

        // Phase 3 Assets
        const chunkOpenBgPath = getSimulationPath('images/simulation/2.1.png');
        const video2Src = getSimulationPath('images/simulation/2.2.mp4');
        const woodPath = getSimulationPath('images/simulation/wood.png');

        const substeps1 = [
            { time: 0, hotspot: { x: 0.5615, y: 0.4937436108689752, w: 0.061, h: 0.1002 }, instruction: 'Click on the chuck key to open the chuck.' },
            { time: 0.95, hotspot: { x: 0.4503, y: 0.7004, w: 0.047, h: 0.1042 }, instruction: 'Click on the chuck key to open the chuck.' },
            { time: 2.45, hotspot: { x: 0.3335, y: 0.4788, w: 0.061, h: 0.1002 }, instruction: 'Click on the chuck key to open the chuck.' },
            { time: 3.95, hotspot: { x: 0.4503, y: 0.2473, w: 0.047, h: 0.1042 }, instruction: 'Click on the chuck key to open the chuck.' },
            { time: 5.7, instruction: '' },
        ];

        const substeps2 = [
            // Placeholders for 2.2.mp4
            { time: 0, hotspot: { x: 0.4503, y: 0.2473, w: 0.047, h: 0.1042 }, instruction: 'Click on the chuck key to tighten.' },
            { time: 1.3, hotspot: { x: 0.5615, y: 0.4937436108689752, w: 0.061, h: 0.1002 }, instruction: 'Click on the chuck key to tighten.' },
            { time: 2.9, hotspot: { x: 0.4503, y: 0.7004, w: 0.047, h: 0.1042 }, instruction: 'Click on the chuck key to tighten.' },
            { time: 4.5, hotspot: { x: 0.3335, y: 0.4788, w: 0.061, h: 0.1002 }, instruction: 'Click on the chuck key to tighten.' },
            { time: 5.9, instruction: 'Step complete!' }
        ];

        let substeps = substeps1;
        let currentSubstep = 0;
        const hotspotDebug = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${steps[currentStepIndex].title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase 1: Key -->
                <div class="drag-stage" id="step2-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${chunkBgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                    <img src="${keyPath}?t=${timestamp}" id="draggable-key" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 8%; top: 10%; right: 10%;"/>
                    <div id="step2-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step2-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step2-video" src="${video1Src}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                    <button id="substep-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>

                <!-- Drag Phase 2: Wood -->
                 <div class="drag-stage" id="step2-drag-stage-2" style="position: relative; width: 100%; overflow: hidden; display: none;">
                    <img src="${chunkOpenBgPath}?t=${timestamp}" class="stage-bg-2" style="width: 100%; height: auto; display: block;"/>
                    <img src="${woodPath}?t=${timestamp}" id="draggable-wood" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 15%; top: 10%; right: 10%;"/>
                    <div id="step2-wood-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>
                
                <div id="substep-instruction" class="drag-instructions">Drag the chuck key to the chuck.</div>
            </div>
        `;

        // -- Elements --
        const dragStage1 = document.getElementById('step2-drag-stage');
        const key = document.getElementById('draggable-key');
        const dropZone1 = document.getElementById('step2-drop-zone');
        const dragBg1 = dragStage1.querySelector('.stage-bg');

        const playStage = document.getElementById('step2-play-stage');
        const video = document.getElementById('step2-video');
        const hotspot = document.getElementById('substep-hotspot');

        const dragStage2 = document.getElementById('step2-drag-stage-2');
        const wood = document.getElementById('draggable-wood');
        const dropZone2 = document.getElementById('step2-wood-drop-zone');
        const dragBg2 = dragStage2.querySelector('.stage-bg-2');

        const instructionElem = document.getElementById('substep-instruction');

        if (hotspotDebug) hotspot.classList.add('debug-highlight');

        // --- Drag Logic 1 (Key) ---
        const targetRel1 = { x: 0.58, y: 0.52 };
        const tolerancePx = 50;
        let dragging = false;
        let startX = 0, startY = 0;
        let currentDragObject = null;
        let currentStage = null;
        let currentDropZone = null;
        let onCurrentDropSuccess = null;

        function setDropZoneLayout(stage, dz, targetRel, sizeFactor = 0.08) {
            const rect = stage.getBoundingClientRect();
            const w = rect.width * sizeFactor;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;
            dz.style.width = w + 'px';
            dz.style.height = h + 'px';
            dz.style.left = (tx - w / 2) + 'px';
            dz.style.top = (ty - h / 2) + 'px';
        }

        const layout1 = () => setDropZoneLayout(dragStage1, dropZone1, targetRel1, 0.08);
        if (dragBg1.complete && dragBg1.naturalWidth) layout1();
        else dragBg1.onload = layout1;

        // --- Generic Drag Handlers ---
        function onPointerDown(e) {
            // Determine which object triggers this
            if (e.target === key) {
                currentDragObject = key;
                currentStage = dragStage1;
                currentDropZone = dropZone1;
                onCurrentDropSuccess = () => setTimeout(startVideoPhase, 500);
            } else if (e.target === wood) {
                currentDragObject = wood;
                currentStage = dragStage2;
                currentDropZone = dropZone2;
                onCurrentDropSuccess = () => {
                    const ok = document.createElement('div');
                    ok.className = 'drag-success';
                    ok.textContent = 'Placed correctly!';
                    dragStage2.appendChild(ok);
                    setTimeout(() => {
                        ok.remove();
                        startVideoPhase2();
                    }, 800);
                };
            } else {
                return;
            }

            dragging = true;
            currentDragObject.classList.add('dragging');
            const rect = currentDragObject.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging || !currentDragObject) return;
            const stageRect = currentStage.getBoundingClientRect();
            const objRect = currentDragObject.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - objRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - objRect.height));

            currentDragObject.style.left = newLeft + 'px';
            currentDragObject.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;

            // Check Drop
            const stageRect = currentStage.getBoundingClientRect();
            const objRect = currentDragObject.getBoundingClientRect();
            const objCenter = {
                x: objRect.left - stageRect.left + objRect.width / 2,
                y: objRect.top - stageRect.top + objRect.height / 2
            };

            // Re-calc target center based on drop zone (safer then saving logic vars)
            const dzRect = currentDropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(objCenter.x - targetX, objCenter.y - targetY);

            if (dist < tolerancePx) {
                currentDropZone.classList.add('success');
                // Snap to center of drop zone
                const dzRect = currentDropZone.getBoundingClientRect();
                const stageRect = currentStage.getBoundingClientRect();

                // Calculate position relative to stage
                const snapLeft = dzRect.left - stageRect.left + (dzRect.width / 2) - (objRect.width / 2);
                const snapTop = dzRect.top - stageRect.top + (dzRect.height / 2) - (objRect.height / 2);

                currentDragObject.style.left = snapLeft + 'px';
                currentDragObject.style.top = snapTop + 'px';

                if (onCurrentDropSuccess) onCurrentDropSuccess();
            }

            currentDragObject.classList.remove('dragging');
            currentDragObject = null;
        }

        key.addEventListener('mousedown', onPointerDown);
        key.addEventListener('touchstart', onPointerDown);
        wood.addEventListener('mousedown', onPointerDown);
        wood.addEventListener('touchstart', onPointerDown);

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);
        window.addEventListener('resize', () => {
            if (dragStage1.style.display !== 'none') layout1();
            if (dragStage2.style.display !== 'none') layout2();
        });


        // --- Video Logic ---
        let waitingForInteraction = false;
        let isSecondVideo = false;

        function startVideoPhase() {
            dragStage1.style.display = 'none';
            playStage.style.display = 'block';

            waitingForInteraction = false;
            currentSubstep = 0;
            substeps = substeps1;
            instructionElem.textContent = substeps[currentSubstep].instruction;

            // Reset video generic listeners
            video.onended = () => {
                startWoodDragPhase();
            };
            video.play();
        }

        function startVideoPhase2() {
            dragStage2.style.display = 'none';
            playStage.style.display = 'block';

            waitingForInteraction = false;
            currentSubstep = 0;
            substeps = substeps2;
            instructionElem.textContent = substeps[currentSubstep].instruction;
            isSecondVideo = true;

            video.src = video2Src + '?t=' + timestamp;
            video.onended = () => {
                instructionElem.textContent = 'Step complete!';
                step2Completed = true;
                if (nextButton) nextButton.disabled = false;
            };
            video.play();
        }

        function showHotspot() {
            const substep = substeps[currentSubstep];
            if (!substep.hotspot) return;

            const hotspotRel = substep.hotspot;
            const rect = playStage.getBoundingClientRect();
            hotspot.style.left = (rect.width * hotspotRel.x) + 'px';
            hotspot.style.top = (rect.height * hotspotRel.y) + 'px';
            hotspot.style.width = (rect.width * hotspotRel.w) + 'px';
            hotspot.style.height = (rect.height * hotspotRel.h) + 'px';
            hotspot.style.display = 'block';
        }

        hotspot.onclick = () => {
            hotspot.style.display = 'none';
            waitingForInteraction = false;

            if (currentSubstep < substeps.length - 1) {
                currentSubstep++;
                instructionElem.textContent = substeps[currentSubstep].instruction;
                video.play();
            } else {
                // Last interaction done. Resume video to finish.
                currentSubstep++; // Move past last substep so checkAndPause stops
                video.play();
            }
        };

        // When video ends, move to next phase
        video.onended = () => {
            startWoodDragPhase();
        };

        // --- Phase 3: Wood Drag ---
        const targetRel2 = { x: 0.47, y: 0.52 }; // Center of chuck roughly
        const layout2 = () => setDropZoneLayout(dragStage2, dropZone2, targetRel2, 0.15); // Bigger zone for wood

        function startWoodDragPhase() {
            playStage.style.display = 'none';
            dragStage2.style.display = 'block';
            instructionElem.textContent = "Drag the wood piece into the chuck.";

            if (dragBg2.complete && dragBg2.naturalWidth) layout2();
            else dragBg2.onload = layout2;
        }


        let rafId = null;
        let intervalId = null;
        const EPS = 0.05;

        function checkAndPause() {
            if (playStage.style.display === 'none' || waitingForInteraction) return;

            if (currentSubstep >= substeps.length) return;
            const target = substeps[currentSubstep].time;
            const t = video.currentTime;

            if (t >= target && t < target + 0.5) {
                video.pause();
                waitingForInteraction = true;
                showHotspot();
            }
        }

        function frameCallback() {
            checkAndPause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        const onPlay = () => {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(checkAndPause, 16);
            }
        };

        const onPause = () => {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        cleanupStep2 = () => {
            try {
                // Remove all generic listeners
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);

                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
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

    showCurrentStep();
});