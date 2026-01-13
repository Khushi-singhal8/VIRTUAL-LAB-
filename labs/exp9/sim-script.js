document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E6 script loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const hotspotSteps = new Set(['step0', 'step2', 'step3']);
    const hotspotCompleted = { step0: false, step2: false, step3: false };

    const steps = [
        { id: 'step0', title: 'Align the plates', src: 'images/simulation/0.5.mp4', type: 'video' },
        { id: 'step1', title: 'Clean workpiece using wire brush', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Set current', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step3', title: 'Setup shielding gas', src: 'images/simulation/3.mp4', type: 'video' },
        { id: 'step4', title: 'Welding', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step5', title: 'Cleaning', src: 'images/simulation/5.mp4', type: 'video' }
    ];

    const stepGuidance = {
        step0: {
            now: "Align the plates.",
            next: "Clean workpiece using wire brush."
        },
        step1: {
            now: "Clean the workpiece surface.",
            next: "Set current."
        },
        step2: {
            now: "Set current.",
            next: "Setup shielding gas."
        },
        step3: {
            now: "Setup shielding gas.",
            next: "Start welding."
        },
        step4: {
            now: "Start welding.",
            next: "Clean the weld."
        },
        step5: {
            now: "Cleaning.",
            next: "Results."
        }
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

    function isHotspotStep(step) { return hotspotSteps.has(step.id); }
    function isHotspotDone(step) { return !isHotspotStep(step) || hotspotCompleted[step.id]; }

    function setHotspotDone(stepId) { if (hotspotCompleted.hasOwnProperty(stepId)) hotspotCompleted[stepId] = true; }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (step.id === 'step1') {
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
        if (nextButton) nextButton.disabled = false;

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
            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
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

    showCurrentStep();
});