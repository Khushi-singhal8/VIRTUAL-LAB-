document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E6 script loaded');

    
    const style = document.createElement('style');
    style.innerHTML = `
    .apparatus-img-box {
        width: 100%;
        height: 190px;
        border: 2px solid #ccc;
        border-radius: 8px;
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
    }`;
    document.head.appendChild(style);

    
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    /* ---------------- HOTSPOTS ---------------- */
    const hotspotSteps = new Set(['step0', 'step2', 'step3']);
    const hotspotCompleted = { step0: false, step2: false, step3: false };

    /* ---------------- APPARATUS DATA ---------------- */
    const apparatusData = [
    {
        name: "Wire Brush",
        img: "images/simulation/apparatus/brush.png",
        desc: "Used to clean rust, scale, and dirt from the metal surface before welding."
    },
    {
        name: "Gas Cylinder",
        img: "images/simulation/apparatus/gas-cylinder.png",
        desc: "Supplies shielding gas to protect the weld pool from atmospheric contamination."
    },
    {
        name: "Plates",
        img: "images/simulation/apparatus/plates.png",
        desc: "Metal workpieces that are joined together during the welding process."
    },
    {
        name: "Filler Rod",
        img: "images/simulation/apparatus/wire.png",
        desc: "Provides filler metal that melts and forms the weld joint."
    },
    {
        name: "Welding Machine",
        img: "images/simulation/apparatus/torch.png",
        desc: "Supplies and controls the electrical current required for welding."
    },
    {
        name: "Clip",
        img: "images/simulation/apparatus/CLIP.png",
        desc: "Used to complete the electrical circuit by connecting the workpiece to the welding machine."
    }
];


    
    const steps = [
        { id: 'apparatus', title: 'Apparatus Used', type: 'apparatus' },
        { id: 'step0', title: 'Align the plates', src: 'images/simulation/0.5.mp4', type: 'video' },
        { id: 'step1', title: 'Clean workpiece using wire brush', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Set current', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step3', title: 'Setup shielding gas', src: 'images/simulation/3.mp4', type: 'video' },
        { id: 'step4', title: 'Welding', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step5', title: 'Cleaning', src: 'images/simulation/5.mp4', type: 'video' },
        { id: 'print', title: 'Print Experiment', type: 'print' }
    ];

    const stepGuidance = {
    apparatus: {
        now: "Carefully observe all the apparatus shown above. Read the name and use of each item.",
        next: "Click on the Next button to begin the welding simulation."
    },

    step0: {
        now: "Click on both metal plates one by one to align them properly before welding.",
        next: "After alignment, proceed to clean the metal surface."
    },

    step1: {
        now: "Drag the wire brush and place it on the metal surface to remove dust, rust, and impurities.",
        next: "Once the surface is clean, set the welding current."
    },

    step2: {
        now: "Click on the control and adjust the welding current to 60 Amperes (60A).",
        next: "After setting the current, adjust the shielding gas supply."
    },

    step3: {
        now: "Set the shielding gas flow rate to 10 LPM (Liters Per Minute) to protect the weld area.",
        next: "After gas setup, start the welding process."
    },

    step4: {
        now: "Drag the welding torch to the joint area to start welding the plates together.",
        next: "After welding is completed, clean the welded joint."
    },

    step5: {
        now: "Drag the cleaning tool over the welded joint to remove slag and improve finish.",
        next: "The welding process is now complete."
    }
};



    let currentStepIndex = 0;
    const totalSteps = steps.length;
    if (totalStepsElement) totalStepsElement.textContent = totalSteps;
 
    /* ---------------- APPARATUS RENDER ---------------- */
    function renderApparatusStep() {
        let html = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:auto;">
        `;

        for (let i = 0; i < 3; i++) {
            const a = apparatusData[i];
            html += `
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;text-align:center">
                <div class="apparatus-img-box"><img src="${a.img}" alt="${a.name}"></div>
                <h4>${i + 1}. ${a.name}</h4>
                <p>${a.desc}</p>
            </div>`;
        }
        html += `</div>

        <div style="display:flex;justify-content:center;gap:20px;margin-top:20px;">`;

        for (let i = 3; i < apparatusData.length; i++) {
            const a = apparatusData[i];
            html += `
            <div style="width:280px;background:#f5f5f5;padding:15px;border-radius:12px;text-align:center">
                <div class="apparatus-img-box"><img src="${a.img}" alt="${a.name}"></div>
                <h4>${i + 1}. ${a.name}</h4>
                <p>${a.desc}</p>
            </div>`;
        }

        html += `
        </div>

        <div class="drag-instructions" style="margin-top:20px">
            <b>Now:</b> ${stepGuidance.apparatus.now}<br>
            <b>Next:</b> ${stepGuidance.apparatus.next}
        </div>
        </div>`;

        gifContainer.innerHTML = html;
    }

    function clearCleanup() {
    if (typeof cleanupCurrent === 'function') {
        cleanupCurrent();
        cleanupCurrent = null;
    }
}

function isHotspotStep(step) {
    return hotspotSteps.has(step.id);
}

function isHotspotDone(step) {
    if (!isHotspotStep(step)) return true;
    return hotspotCompleted[step.id] === true;
}

function setHotspotDone(stepId) {
    hotspotCompleted[stepId] = true;
}



    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();
        if (step.type === 'apparatus') {
        renderApparatusStep();
    }
    else if (step.type === 'print') {
    renderPrintStep();
}
        else if (step.id === 'step1') {
            renderStep1DragDrop(step, timestamp);
        } else if (step.id === 'step4') {
            renderStep4DragDrop(step, timestamp);
        } else if (step.id === 'step5') {
            renderStep5DragDrop(step, timestamp);
        } else if (isHotspotStep(step)) {
            renderHotspotStep(step, timestamp);
        } else {
            renderAutoplayStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        // if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1) || !isHotspotDone(step);
        if (nextButton) {
    nextButton.disabled =
        (currentStepIndex === totalSteps - 1) ||
        !isHotspotDone(step);
}


        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderHotspotStep(step, timestamp) {
        const hotspotMap = {
            step0: [
                { time: 0, x: 0.621585, y: 0.114147, w: 0.163934, h: 0.291439, instruction: 'Click to align first plate.' },
                { time: 2, x: 0.210383, y: 0.570735, w: 0.163934, h: 0.291439, instruction: 'Click to align second plate.' }
            ],
            step1: { x: 0.6506482281763181, y: 0.29908199176338446, w: 0.28988764044943816, h: 0.2500001497566455, instruction: 'Click brush to proceed.' },
            step2: { x: 0.441257, y: 0.573163, w: 0.054645, h: 0.097146, instruction: 'Set current to 60A.' },
            step3: { x: 0.367486, y: 0.014572, w: 0.300546, h: 0.250152, instruction: 'Set sheilding gas flow rate to 10 LPM (liters per minute).' }
        };

        let config = hotspotMap[step.id] || [{ time: 0, x: 0.45, y: 0.45, w: 0.15, h: 0.15, instruction: 'Click to continue.' }];
        // Normalize to array of substeps
        if (!Array.isArray(config)) {
            config = [{ ...config, time: 0 }];
        }
        // Build substeps
        const substeps = config.map(c => ({ ...c, done: false }));
        let currentSubIndex = 0;

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" preload="auto" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        function layoutHotspot(cfg) {
            if (!cfg) return;
            const rect = stage.getBoundingClientRect();
            hotspot.style.left = (rect.width * cfg.x) + 'px';
            hotspot.style.top = (rect.height * cfg.y) + 'px';
            hotspot.style.width = (rect.width * cfg.w) + 'px';
            hotspot.style.height = (rect.height * cfg.h) + 'px';
        }

        function showHotspot(substep) {
            instructionElem.textContent = substep.instruction;
            layoutHotspot(substep);
            hotspot.style.display = 'block';
            hotspot.classList.add('debug-highlight');
        }

        function checkPause() {
            if (currentSubIndex >= substeps.length) return;
            const sub = substeps[currentSubIndex];
            // If time is 0, we handle it on load/init separately or here if we catch it fast enough. 
            // Usually timeupdate is good for > 0.
            if (!sub.done && video.currentTime >= sub.time && !video.paused) {
                video.pause();
                // Ensure we don't overshoot too much?
                // video.currentTime = sub.time; 
                showHotspot(sub);
            }
        }

        video.addEventListener('loadedmetadata', () => {
            // Handle start-of-video hotspot
            if (currentSubIndex < substeps.length && substeps[currentSubIndex].time <= 0.1) {
                video.currentTime = 0.01;
                video.pause();
                showHotspot(substeps[currentSubIndex]);
            } else {
                video.play().catch(() => { });
            }
        }, { once: true });

        video.addEventListener('timeupdate', checkPause);

        hotspot.addEventListener('click', () => {
            hotspot.style.display = 'none';
            substeps[currentSubIndex].done = true;
            currentSubIndex++;

            // If all substeps done, we just play to end? 
            // Or if there are more substeps, we play until next.
            if (currentSubIndex >= substeps.length) {
                setHotspotDone(step.id);
                instructionElem.textContent = '  ';
                if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
            } else {
                instructionElem.textContent = 'Aligning...';
            }
            video.play().catch(() => { });
        });

        video.addEventListener('ended', () => {
            if (currentSubIndex >= substeps.length) {
                instructionElem.innerHTML = '<b>Step complete.</b> Next: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
        }, { once: true });

        window.addEventListener('resize', () => {
            if (currentSubIndex < substeps.length) layoutHotspot(substeps[currentSubIndex]);
        });

        cleanupCurrent = function () {
            try {
                video.removeEventListener('timeupdate', checkPause);
                // window.removeEventListener... attached anonymous function (leak), but okay for now or fix
            } catch (_) { }
        };
    }

    function renderAutoplayStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('step-video');
        const instructionElem = document.getElementById('play-instruction');

        // Initial instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : '';

        video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => { });
        }, { once: true });

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Next: ' + stepGuidance[step.id].next;
            }
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        cleanupCurrent = function () {
            try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) { }
        };
    }

    function renderStep1DragDrop(step, timestamp) {
        // if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/1.mp4';
        const bgPath = 'images/simulation/1.png';
        const toolPath = 'images/simulation/1-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step1-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-tool" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step1-drop-zone" class="drop-zone" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5; display: block;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
                
                <div id="step1-instruction" class="drag-instructions"></div>
            </div>
        `;

        const dragStage = document.getElementById('step1-drag-stage');
        const tool = document.getElementById('draggable-tool');
        const dropZone = document.getElementById('step1-drop-zone');
        const instructionElem = document.getElementById('step1-instruction');
        const playStage = document.getElementById('step1-play-stage');
        const video = document.getElementById('step1-video');

        // Initial Instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Drag the tool.";

        const targetRel = { x: 0.5, y: 0.5 }; // Center target for now
        const tolerancePx = 100;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            // Wait for rect to be valid
            if (rect.width === 0) return;

            const w = rect.width * 0.15;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;

            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        // Delay slightly to ensure layout
        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
            const rect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            // Constrain
            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

            tool.style.left = newLeft + 'px';
            tool.style.top = newTop + 'px';
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            tool.style.cursor = 'grab';

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const toolCenter = {
                x: toolRect.left - stageRect.left + toolRect.width / 2,
                y: toolRect.top - stageRect.top + toolRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                // Success
                dropZone.style.borderColor = 'green';
                dropZone.style.backgroundColor = 'rgba(0,255,0,0.2)';
                setTimeout(startVideoPhase, 200);
            }
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            // Cleanup drag
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);
            window.removeEventListener('resize', setDropZoneLayout);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';

            // Can update instruction here to something transitional if needed, or leave 'now' 
            instructionElem.textContent = "Cleaning...";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Next: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false; // Allow next regardless of total steps for now, or check
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                window.removeEventListener('resize', setDropZoneLayout);
                video.pause();
            } catch (_) { }
        };
    }

    function renderStep4DragDrop(step, timestamp) {
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/4.mp4';
        const bgPath = 'images/simulation/4.png';
        const toolPath = 'images/simulation/4-tool.png'; // Assuming 4-tool.png exists

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step4-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-tool-4" class="draggable" style="position: absolute; width: 25%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step4-drop-zone" class="drop-zone" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5; display: block;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step4-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step4-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
                
                <div id="step4-instruction" class="drag-instructions"></div>
            </div>
        `;

        const dragStage = document.getElementById('step4-drag-stage');
        const tool = document.getElementById('draggable-tool-4');
        const dropZone = document.getElementById('step4-drop-zone');
        const instructionElem = document.getElementById('step4-instruction');
        const playStage = document.getElementById('step4-play-stage');
        const video = document.getElementById('step4-video');

        // Initial Instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Start welding.";

        const targetRel = { x: 0.27, y: 0.3 }; // Center target for now
        const tolerancePx = 100;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            if (rect.width === 0) return;

            const w = rect.width * 0.15;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;

            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
            const rect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

            tool.style.left = newLeft + 'px';
            tool.style.top = newTop + 'px';
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            tool.style.cursor = 'grab';

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const toolCenter = {
                x: toolRect.left - stageRect.left + toolRect.width / 2,
                y: toolRect.top - stageRect.top + toolRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.style.borderColor = 'green';
                dropZone.style.backgroundColor = 'rgba(0,255,0,0.2)';
                setTimeout(startVideoPhase, 200);
            }
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);
            window.removeEventListener('resize', setDropZoneLayout);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';

            instructionElem.textContent = "Welding...";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Next: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false;
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                window.removeEventListener('resize', setDropZoneLayout);
                video.pause();
            } catch (_) { }
        };
    }

    function renderStep5DragDrop(step, timestamp) {
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/5.mp4';
        const bgPath = 'images/simulation/5.png'; // Reusing 1.png as per "copy step 1" request
        const toolPath = 'images/simulation/1-tool.png'; // Reusing 1-tool.png

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-tool-5" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step5-drop-zone" class="drop-zone" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5; display: block;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step5-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
                
                <div id="step5-instruction" class="drag-instructions"></div>
            </div>
        `;

        const dragStage = document.getElementById('step5-drag-stage');
        const tool = document.getElementById('draggable-tool-5');
        const dropZone = document.getElementById('step5-drop-zone');
        const instructionElem = document.getElementById('step5-instruction');
        const playStage = document.getElementById('step5-play-stage');
        const video = document.getElementById('step5-video');

        // Initial Instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Drag the tool.";

        const targetRel = { x: 0.5, y: 0.5 }; // Center target
        const tolerancePx = 100;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            if (rect.width === 0) return;

            const w = rect.width * 0.15;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;

            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
            const rect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

            tool.style.left = newLeft + 'px';
            tool.style.top = newTop + 'px';
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            tool.style.cursor = 'grab';

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            const toolCenter = {
                x: toolRect.left - stageRect.left + toolRect.width / 2,
                y: toolRect.top - stageRect.top + toolRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.style.borderColor = 'green';
                dropZone.style.backgroundColor = 'rgba(0,255,0,0.2)';
                setTimeout(startVideoPhase, 200);
            }
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);
            window.removeEventListener('resize', setDropZoneLayout);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';

            instructionElem.textContent = "Cleaning...";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Next: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false;
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                window.removeEventListener('resize', setDropZoneLayout);
                video.pause();
            } catch (_) { }
        };
    }

    function renderPrintStep() {
    gifContainer.innerHTML = `
        <div class="gif-wrapper print-page">
            <h2 style="text-align:center;">Welding Experiment Report</h2>

            <p><b>Experiment Name:</b> Gas Tungsten Arc Welding (GTAW)</p>
            <p><b>Objective:</b> To perform welding of metal plates using proper parameters.</p>

            <h3>Steps Performed</h3>
            <ol>
                <li>Aligned the metal plates</li>
                <li>Cleaned the workpiece</li>
                <li>Set current to 60A</li>
                <li>Set shielding gas to 10 LPM</li>
                <li>Performed welding</li>
                <li>Cleaned the welded joint</li>
            </ol>

            <h3>Result</h3>
            <p>The plates were successfully welded successfully.</p>

            <div style="text-align:center; margin-top:30px;">
                <button onclick="window.print()" style="
                    padding:12px 24px;
                    font-size:16px;
                    border:none;
                    border-radius:6px;
                    background:#007bff;
                    color:white;
                    cursor:pointer;
                ">
                    🖨 Print Experiment
                </button>
            </div>
        </div>
    `;

    if (nextButton) nextButton.disabled = true;
}


        if (prevButton) {
    prevButton.addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            showCurrentStep();
        }
    });
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        const step = steps[currentStepIndex];

        if (!isHotspotDone(step)) return;

        if (currentStepIndex < totalSteps - 1) {
            currentStepIndex++;
            showCurrentStep();
        }
    });
}

showCurrentStep();
});
