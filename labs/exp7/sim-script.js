document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E5 script loaded');


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

.click-hint {
    position: absolute;
    border: 3px dashed #00ffcc;
    border-radius: 8px;
    animation: pulse 1.4s infinite;
    pointer-events: none;
    box-shadow: 0 0 12px rgba(0,255,204,0.7);
    z-index: 9;
}

.click-label {
    position: absolute;
    top: -28px;
    left: 0;
    background: #00ffcc;
    color: #000;
    padding: 3px 8px;
    font-size: 13px;
    font-weight: bold;
    border-radius: 4px;
}

@keyframes pulse {
    0%   { opacity: 0.3; }
    50%  { opacity: 1; }
    100% { opacity: 0.3; }
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
    let step7Completed = false;
    let step8Completed = false;

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
            name: "Chipping Hammer",
            img: "images/apparatus/a].png",
            desc: "Used to remove slag and impurities from the welded joint after welding."
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

    /* ---------------- ASSET PRELOADING ---------------- */
    const assetList = [
        // Apparatus
        "images/apparatus/d].png",
        "images/apparatus/c].png",
        "images/apparatus/a].png",
        "images/apparatus/e].png",
        "images/apparatus/b].png",
        "images/apparatus/f].png",

        // Step 1
        "images/simulation/1.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",

        // Step 1.5
        "images/simulation/1.5.mp4",
        "images/simulation/1.5.png",
        "images/simulation/1.5-tool.png",

        // Step 2
        "images/simulation/2.mp4",

        // Step 3
        "images/simulation/3.1.mp4",
        "images/simulation/3.2.mp4",
        "images/simulation/3.png",
        "images/simulation/3-tool.png",

        // Step 4
        "images/simulation/4.mp4",
        "images/simulation/4.png",
        "images/simulation/4-tool1.png",
        "images/simulation/4-tool2.png",

        // Step 4.5
        "images/simulation/4.5.mp4",

        // Step 7
        "images/simulation/7.mp4",
        "images/simulation/7.png",
        "images/simulation/7-tool.png",

        // Step 8
        "images/simulation/8.mp4",
        "images/simulation/8.png",
        "images/simulation/8-tool.png",

        // Result
        "images/simulation/print .png"
    ];

    const assetCache = {};

    function getAssetSrc(originalUrl) {
        return assetCache[originalUrl] || originalUrl;
    }

    function formatSrc(url, timestamp) {
        const src = getAssetSrc(url);
        if (src.startsWith('blob:')) return src;
        return `${src}?t=${timestamp}`;
    }

    async function preloadAssets() {
        const overlay = document.createElement('div');
        overlay.id = 'preload-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">Loading simulation resources...</div>
            <div style="width: 300px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                <div id="preload-progress" style="width: 0%; height: 100%; background: #4CAF50; transition: width 0.3s;"></div>
            </div>
            <div id="preload-text" style="margin-top: 10px; font-size: 14px;">0%</div>
        `;
        document.body.appendChild(overlay);

        const progressBar = document.getElementById('preload-progress');
        const progressText = document.getElementById('preload-text');
        let loadedCount = 0;

        const promises = assetList.map(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                assetCache[url] = objectUrl;
            } catch (err) {
                console.error(`Error preloading ${url}:`, err);
            } finally {
                loadedCount++;
                const percent = Math.round((loadedCount / assetList.length) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = percent + '%';
            }
        });

        await Promise.all(promises);

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
                showCurrentStep();
            }, 500);
        }, 500);
    }


    const steps = [
        { id: 'apparatus', title: 'Apparatus Identification', type: 'apparatus' },

        { id: 'step1', title: 'Clean plate edges with file', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step1_5', title: 'Clean second plate', src: 'images/simulation/1.5.mp4', type: 'video' },
        { id: 'step2', title: 'Align plates and clamp them', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step3', title: 'Ignite flame', src: 'images/simulation/3.1.mp4', type: 'video' },
        { id: 'step4', title: 'Apply small tack welds at both ends of the plates', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step4_5', title: 'Welding', src: 'images/simulation/4.5.mp4', type: 'video' },
        { id: 'step7', title: 'Use a chipping hammer to remove slag', src: 'images/simulation/7.mp4', type: 'video' },
        { id: 'step8', title: 'File edges inspection', src: 'images/simulation/8.mp4', type: 'video' },
        { id: 'result', title: 'Observation & Result', type: 'result' }

    ];

    const stepGuidance = {
        apparatus: {
            now: "Identify the apparatus used in gas welding.",
            next: "Begin the welding simulation."
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
            next: "Ignite the welding flame."
        },
        step3: {
            now: "Follow the steps to ignite a neutral flame.",
            next: "Apply tack welds at both ends."
        },
        step4: {
            now: "Apply tack welds at both ends of the plates.",
            next: "Start the welding process."
        },
        step4_5: {
            now: "Perform welding.",
            next: "Remove slag using chipping hammer."
        },
        step7: {
            now: "Drag the chipping hammer to remove slag from the weld.",
            next: "File the edges."
        },
        step8: {
            now: "Drag the filing tool tool to stasrt filing edges.",
            next: "View results."
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

    function isInteractiveStep(stepId) {
        return stepId === 'step1' || stepId === 'step1_5' || stepId === 'step2' || stepId === 'step3' || stepId === 'step4' || stepId === 'step6' || stepId === 'step8';
    }

    function isInteractiveCompleted(stepId) {
        if (stepId === 'step1') return step1Completed;
        if (stepId === 'step1_5') return step1_5Completed;
        if (stepId === 'step2') return step2Completed;
        if (stepId === 'step3') return step3Completed;
        if (stepId === 'step4') return step4Completed;
        if (stepId === 'step4_5') return step4_5Completed;
        if (stepId === 'step6') return step6Completed;
        if (stepId === 'step8') return step8Completed;
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
        if (stepId === 'step8') step8Completed = done;
    }


    function renderApparatusStep() {
        let html = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">
                Step ${currentStepIndex + 1} of ${totalSteps}
            </div>

            <div style="
                display:grid;
                grid-template-columns: repeat(3, 1fr);
                gap:20px;
                margin-top:20px;
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
                    <img src="${getAssetSrc(item.img)}" alt="${item.name}">
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
                ${stepGuidance.apparatus.now}<br>
                Click next to: ${stepGuidance.apparatus.next}
            </div>
        </div>
    `;

        gifContainer.innerHTML = html;
    }




    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();

        document.body.classList.remove('result-mode');
        clearCleanup();

        if (step.id === 'apparatus') {
            clearCleanup();
            renderApparatusStep();

            if (currentStepElement)
                currentStepElement.textContent = currentStepIndex + 1;

            if (prevButton) prevButton.disabled = true;
            if (nextButton) nextButton.disabled = false;

            return;
        }


        clearCleanup();

        if (step.id === 'step1') {
            renderStep1DragDrop(step, timestamp);
        } else if (step.id === 'step1_5') {
            renderStep1_5DragDrop(step, timestamp);
        } else if (step.id === 'step2') {
            renderInteractiveVideoStep(step, timestamp);
        } else if (step.id === 'step3') {
            renderStep3MultiPhase(step, timestamp);
        } else if (step.id === 'step4') {
            renderStep4DragDrop(step, timestamp);
        } else if (step.id === 'step4_5') {
            renderStep4_5DragDrop(step, timestamp);
        } else if (step.id === 'step6') {
            renderStep6DragDrop(step, timestamp);
        } else if (step.id === 'step7') {
            renderStep7DragDrop(step, timestamp);
        } else if (step.id === 'step8') {
            renderStep8DragDrop(step, timestamp);
        } else if (step.id === 'result') {
            document.body.classList.add('result-mode');
            renderResultStep();
        } else {
            renderPlainVideoStep(step, timestamp);
        }


        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) {
            // Temporarily enable next button always for testing
            nextButton.disabled = (currentStepIndex === totalSteps - 1);
            //             nextButton.disabled = (currentStepIndex === totalSteps - 1) || (isInteractiveStep(step.id) && !isInteractiveCompleted(step.id));
            // nextButton.disabled = (currentStepIndex === totalSteps - 1) || (isInteractiveStep(step.id) && !isInteractiveCompleted(step.id));
        }

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active');
                else itm.classList.remove('active');
            });
        }
    }

    function renderPlainVideoStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${formatSrc(step.src, timestamp)}" style="width:100%; height:100%;" playsinline muted></video>
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

    function renderStep4_5DragDrop(step, timestamp) {
        step4_5Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/4.5.mp4';
        const bgPath = 'images/simulation/4.png';
        const tool1Path = 'images/simulation/4-tool1.png';
        const tool2Path = 'images/simulation/4-tool2.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step4_5-drag-stage" style="position: relative; width: 100%;">
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate for welding" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(tool1Path, timestamp)}" id="draggable-tool1-4_5" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 33%; right: 39%;"/>
                    <img src="${formatSrc(tool2Path, timestamp)}" id="draggable-tool2-4_5" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 27%; right: 50%;"/>

                    <div id="step4_5-drop-zone1" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                    <div id="step4_5-drop-zone2" class="drop-zone" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step4_5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step4_5-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline></video>
                </div>
                
                <div id="step4_5-instruction" class="drag-instructions">
                    Drag the torch to the starting position to begin welding.
                </div>
            </div>
        `;

        const dragStage = document.getElementById('step4_5-drag-stage');
        const tool1 = document.getElementById('draggable-tool1-4_5');
        const tool2 = document.getElementById('draggable-tool2-4_5');
        const dropZone1 = document.getElementById('step4_5-drop-zone1');
        const dropZone2 = document.getElementById('step4_5-drop-zone2');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step4_5-play-stage');
        const video = document.getElementById('step4_5-video');
        const instructionElem = document.getElementById('step4_5-instruction');

        // Drop zone targets (same as step 4)
        const target1Rel = { x: 0.5, y: 0.6 };
        const target2Rel = { x: 0.36, y: 0.55 };
        const tolerancePx = 80;

        let tool1Placed = false;
        let tool2Placed = false;
        let activeTool = null;

        // Initially hide tool2 and its drop zone
        tool2.style.display = 'none';
        dropZone2.style.display = 'none';

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
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging || !activeTool) return;

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = activeTool.getBoundingClientRect();

            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            // removed clamping to allow dragging outside the box
            // newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            // newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

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
                if (activeTool === tool1) {
                    tool1Placed = true;
                    dropZone1.style.display = 'none';
                    tool2.style.display = 'block';
                    dropZone2.style.display = 'block';
                    instructionElem.textContent = "Good! Now position the filler rod.";
                }
                if (activeTool === tool2) {
                    tool2Placed = true;
                    instructionElem.textContent = "Great! Starting welding process...";
                }

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
            instructionElem.textContent = "Welding in progress...";

            video.onended = () => {
                instructionElem.innerHTML =
                    "<b>Step complete.</b> Click next to: " + stepGuidance.step4_5.next;

                step4_5Completed = true;
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

    function renderInteractiveVideoStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        let cfgSeq;
        if (step.id === 'step2') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.3, y: 0.5251851851851852, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the first plate.' },
                { pauseAt: 1.95, hotspot: { x: 0.7144444444444444, y: 0.591604938271605, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the second plate.' }
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
                    <video id="step-video" src="${formatSrc(step.src, timestamp)}" style="width:100%; height:100%;" playsinline muted></video>
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
                "<b>Step complete.</b> Click next to: " +
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

    // Step 3 Multi-Phase: Part 1 (video with hotspots) -> Part 2 (drag-and-drop) -> Part 3 (video with one hotspot)
    function renderStep3MultiPhase(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        // Phase 1 hotspots configuration (existing hotspots from 3.1.mp4)
        const phase1Cfg = [
            { pauseAt: 2.4, hotspot: { x: 0.011111, y: 0.272593, w: 0.181111, h: 0.169877 }, instruction: 'Set pressure for acetylene to 120kPa' },
            { pauseAt: 7.4, hotspot: { x: 0.556667, y: 0.213333, w: 0.183333, h: 0.169877 }, instruction: 'Set pressure for oxygen to 250kPa.' },
            { pauseAt: 18.2, hotspot: { x: 0.186667, y: 0.377284, w: 0.108889, h: 0.193580 }, instruction: 'Open acetylene valve slightly.' }
        ];

        // Phase 3 hotspot configuration (one hotspot at the beginning)
        const phase3Cfg = [
            { pauseAt: 0.45, hotspot: { x: 0.755556, y: 0.393086, w: 0.094444, h: 0.167901 }, instruction: 'Click to increase oxygen to obtain neutral flame.' }
        ];

        // Drag target for Phase 2
        const dragTarget = { x: 0.3, y: 0.6 };
        const tolerancePx = 80;

        let currentPhase = 1;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Phase 1 & 3: Video Stage -->
                <div class="play-stage" id="step3-play-stage">
                    <video id="step3-video" style="width:100%; height:100%;" playsinline muted></video>
                    <button id="step3-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>

                <!-- Phase 2: Drag Stage -->
                <div class="drag-stage" id="step3-drag-stage" style="position: relative; width: 100%; overflow: hidden; display: none;">
                    <img src="${formatSrc('images/simulation/3.png', timestamp)}" class="stage-bg" alt="Background" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc('images/simulation/3-tool.png', timestamp)}" id="step3-draggable" class="draggable" alt="Tool" style="position: absolute; z-index: 20; cursor: grab; width: 18%; top: 10%; right: 80%;"/>
                    <div id="step3-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <div id="step3-instruction" class="drag-instructions"></div>
            </div>
        `;

        const playStage = document.getElementById('step3-play-stage');
        const video = document.getElementById('step3-video');
        const hotspot = document.getElementById('step3-hotspot');
        const dragStage = document.getElementById('step3-drag-stage');
        const draggable = document.getElementById('step3-draggable');
        const dropZone = document.getElementById('step3-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');
        const instructionElem = document.getElementById('step3-instruction');

        let segmentIndex = 0;
        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedForSegment = false;
        let currentCfg = phase1Cfg;

        // ========== VIDEO/HOTSPOT FUNCTIONS ==========
        function layoutHotspot() {
            const rect = playStage.getBoundingClientRect();
            const cfg = currentCfg[Math.min(segmentIndex, currentCfg.length - 1)];
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
        }

        function showHotspot() {
            const cfg = currentCfg[segmentIndex];
            instructionElem.textContent = cfg.instruction;
            layoutHotspot();
            hotspot.style.display = 'block';
            hotspot.classList.add('debug-highlight');
        }

        function maybePause() {
            if (segmentIndex >= currentCfg.length || pausedForSegment) return;
            if (video.currentTime + EPS >= currentCfg[segmentIndex].pauseAt) {
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

        function onVideoEnded() {
            if (currentPhase === 1) {
                // Phase 1 ended -> transition to Phase 2 (drag-and-drop)
                startPhase2();
            } else if (currentPhase === 3) {
                // Phase 3 ended -> step complete
                setInteractiveCompleted(step.id, true);
                instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance[step.id].next;
                if (nextButton) nextButton.disabled = false;
            }
        }

        // ========== DRAG-AND-DROP FUNCTIONS (Phase 2) ==========
        let dragging = false;
        let startX = 0, startY = 0;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.10;
            const h = w;
            const tx = rect.width * dragTarget.x;
            const ty = rect.height * dragTarget.y;
            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        function onDragPointerDown(e) {
            dragging = true;
            draggable.classList.add('dragging');
            const rect = draggable.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onDragPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = draggable.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

            draggable.style.left = newLeft + 'px';
            draggable.style.top = newTop + 'px';
        }

        function onDragPointerUp() {
            if (!dragging) return;
            dragging = false;
            draggable.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = draggable.getBoundingClientRect();
            const anchorX = 0.8;  // 20% from left edge
            const anchorY = 0.1;  // 90% from top (near bottom)
            const toolCenter = {
                x: toolRect.left - stageRect.left + toolRect.width * anchorX,
                y: toolRect.top - stageRect.top + toolRect.height * anchorY
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                // Cleanup drag listeners and transition to Phase 3
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onDragPointerMove);
                window.removeEventListener('touchmove', onDragPointerMove);
                window.removeEventListener('mouseup', onDragPointerUp);
                window.removeEventListener('touchend', onDragPointerUp);
                setTimeout(startPhase3, 500);
            }
        }

        function startPhase2() {
            currentPhase = 2;
            playStage.style.display = 'none';
            dragStage.style.display = 'block';
            instructionElem.textContent = 'Drag the ignitor to the torch.';

            // Reset video listeners for phase 3
            video.removeEventListener('ended', onVideoEnded);

            // Setup drop zone layout
            if (dragBg.complete && dragBg.naturalWidth) setDropZoneLayout();
            else dragBg.onload = setDropZoneLayout;
            window.addEventListener('resize', setDropZoneLayout);

            // Attach drag listeners
            draggable.addEventListener('mousedown', onDragPointerDown);
            draggable.addEventListener('touchstart', onDragPointerDown);
            window.addEventListener('mousemove', onDragPointerMove);
            window.addEventListener('touchmove', onDragPointerMove);
            window.addEventListener('mouseup', onDragPointerUp);
            window.addEventListener('touchend', onDragPointerUp);
        }

        function startPhase3() {
            currentPhase = 3;
            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = 'Click to ignite the flame.';

            // Reset for Phase 3
            segmentIndex = 0;
            pausedForSegment = false;
            currentCfg = phase3Cfg;

            // Load Phase 3 video
            video.src = formatSrc('images/simulation/3.2.mp4', Date.now());
            video.addEventListener('ended', onVideoEnded, { once: true });
            video.addEventListener('loadedmetadata', () => {
                layoutHotspot();
                video.play().catch(() => { });
            }, { once: true });
        }

        // ========== START PHASE 1 ==========
        function startPhase1() {
            currentPhase = 1;
            currentCfg = phase1Cfg;
            segmentIndex = 0;
            passwordForSegment = false;

            video.src = formatSrc('images/simulation/3.1.mp4', timestamp);
            video.addEventListener('ended', onVideoEnded, { once: true });
            video.addEventListener('loadedmetadata', () => {
                layoutHotspot();
                video.play().catch(() => { });
            }, { once: true });
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        hotspot.addEventListener('click', onHotspotClick);
        window.addEventListener('resize', layoutHotspot);

        startPhase1();

        cleanupCurrent = function () {
            try {
                window.removeEventListener('resize', layoutHotspot);
                window.removeEventListener('resize', setDropZoneLayout);
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                hotspot.removeEventListener('click', onHotspotClick);
                window.removeEventListener('mousemove', onDragPointerMove);
                window.removeEventListener('touchmove', onDragPointerMove);
                window.removeEventListener('mouseup', onDragPointerUp);
                window.removeEventListener('touchend', onDragPointerUp);
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
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-file-1" class="draggable" alt="File tool" style="position: absolute; z-index: 20; cursor: grab; width: 30%; top: 10%; right: 20%;"/>
                    <div id="step1-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline muted></video>
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
        const targetRel = { x: 0.4, y: 0.55 };
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
                    "<b>Step complete.</b> Click next to: " +
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
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-file-1_5" class="draggable" alt="Tool" style="position: absolute; z-index: 20; cursor: grab; width: 30%; top: 10%; right: 10%;"/>
                    <div id="step1_5-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1_5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1_5-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline muted></video>
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
        const targetRel = { x: 0.6, y: 0.55 };
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
                    "<b>Step complete.</b> Click next to: " +
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
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate for tack welding" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(tool1Path, timestamp)}" id="draggable-tool1" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 10%; right: 10%;"/>
                   <img src="${formatSrc(tool2Path, timestamp)}" id="draggable-tool2"class="draggable"style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 10%; right: 25%;"/>

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
                    <video id="step4-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline></video>
                </div>
                
                <div id="step4-instruction" class="drag-instructions">
    Drag the torch to the highlighted starting position as shown.
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
        const target1Rel = { x: 0.5, y: 0.6 };
        const target2Rel = { x: 0.36, y: 0.55 };
        const tolerancePx = 80;

        let tool1Placed = false;
        let tool2Placed = false;
        let activeTool = null;

        // Initially hide tool2 and its drop zone
        tool2.style.display = 'none';
        dropZone2.style.display = 'none';


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
                if (activeTool === tool1) {
                    tool1Placed = true;
                    // Hide the first drop zone after tool1 is placed
                    dropZone1.style.display = 'none';
                    // Show and enable tool2 after tool1 is placed
                    tool2.style.display = 'block';
                    dropZone2.style.display = 'block';
                    instructionElem.textContent = "Good! Now drag the filler rod to its position.";
                }
                if (activeTool === tool2) {
                    tool2Placed = true;
                    instructionElem.textContent = "Excellent! Now we are ready to start the process.";
                }

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
                    "<b>Step complete.</b> Click next to: " +
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

    function renderStep7DragDrop(step, timestamp) {
        step7Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/7.mp4';
        const bgPath = 'images/simulation/7.png';
        const toolPath = 'images/simulation/7-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step7-drag-stage" style="position: relative; width: 100%;">
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Welded joint" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-hammer-7" class="draggable" alt="Chipping hammer" style="position: absolute; z-index: 20; cursor: grab; width: 45%; top: 10%; right: 3%;"/>
                    <div id="step7-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step7-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step7-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step7-instruction" class="drag-instructions">Drag the chipping hammer to the weld to remove slag.</div>
            </div>
        `;

        const dragStage = document.getElementById('step7-drag-stage');
        const hammerTool = document.getElementById('draggable-hammer-7');
        const dropZone = document.getElementById('step7-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step7-play-stage');
        const video = document.getElementById('step7-video');
        const instructionElem = document.getElementById('step7-instruction');

        // Drop zone target (adjust x and y for the weld location)
        const targetRel = { x: 0.5, y: 0.8 };
        const tolerancePx = 120;

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
            hammerTool.classList.add('dragging');
            const rect = hammerTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const hammerRect = hammerTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            // removed clamping to allow dragging outside the box
            // newLeft = Math.max(0, Math.min(newLeft, stageRect.width - hammerRect.width));
            // newTop = Math.max(0, Math.min(newTop, stageRect.height - hammerRect.height));

            hammerTool.style.left = newLeft + 'px';
            hammerTool.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            hammerTool.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const hammerRect = hammerTool.getBoundingClientRect();
            const hammerCenter = {
                x: hammerRect.left - stageRect.left + hammerRect.width / 2,
                y: hammerRect.top - stageRect.top + hammerRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(hammerCenter.x - targetX, hammerCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                setTimeout(startVideoPhase, 500);
            }
        }

        hammerTool.addEventListener('mousedown', onPointerDown);
        hammerTool.addEventListener('touchstart', onPointerDown);
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
            instructionElem.textContent = "Removing slag from the weld...";

            video.onended = () => {
                instructionElem.innerHTML =
                    "<b>Step complete.</b> Click next to: " +
                    stepGuidance.step7.next;

                step7Completed = true;
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

    function renderStep8DragDrop(step, timestamp) {
        step8Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/8.mp4';
        const bgPath = 'images/simulation/8.png';
        const toolPath = 'images/simulation/8-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step8-drag-stage" style="position: relative; width: 100%;">
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Welded joint for inspection" style="width: 100%; height: auto; display: block;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-8" class="draggable" alt="Inspection tool" style="position: absolute; z-index: 20; cursor: grab; width: 30%; top: 10%; right: 10%;"/>
                    <div id="step8-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step8-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step8-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step8-instruction" class="drag-instructions">Drag the filing tool to its highlighted position for cleaning.</div>
            </div>
        `;

        const dragStage = document.getElementById('step8-drag-stage');
        const tool = document.getElementById('draggable-tool-8');
        const dropZone = document.getElementById('step8-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step8-play-stage');
        const video = document.getElementById('step8-video');
        const instructionElem = document.getElementById('step8-instruction');

        // Drop zone target (adjust x and y for the inspection location)
        const targetRel = { x: 0.5, y: 0.93 };
        const tolerancePx = 120;

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
            tool.classList.add('dragging');
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

            // removed clamping to allow dragging outside the box
            // newLeft = Math.max(0, Math.min(newLeft, stageRect.width - toolRect.width));
            // newTop = Math.max(0, Math.min(newTop, stageRect.height - toolRect.height));

            tool.style.left = newLeft + 'px';
            tool.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            tool.classList.remove('dragging');

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
                dropZone.classList.add('success');
                setTimeout(startVideoPhase, 500);
            }
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown);
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
            instructionElem.textContent = "Filing edges...";

            video.onended = () => {
                instructionElem.innerHTML =
                    "<b>Step complete.</b> Click next to: " +
                    stepGuidance.step8.next;

                step8Completed = true;
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
        document.body.classList.add('result-mode');

        gifContainer.innerHTML = `
            <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
                <h2 style="text-align:center;">Experiment Result</h2>
                <hr>

                <div style="text-align:center; margin:20px 0;">
                    <img src="${getAssetSrc('images/simulation/print .png')}" alt="Final Welded Butt Joint" style="max-width:90%; border:1px solid #ccc; border-radius:6px;">
                    <p style="font-size:14px; margin-top:6px;">Final welded butt joint after dressing</p>
                </div>

                <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000;">
                    <tbody>
                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Welding Parameters</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Plate Material</td>
                            <td style="border:1px solid #000; padding:10px 15px;">Mild Steel</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Filler Rod</td>
                            <td style="border:1px solid #000; padding:10px 15px;">ER70S-6</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Flame Settings</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Temperature (Neutral Flame)</td>
                            <td style="border:1px solid #000; padding:10px 15px;">3200°C – 3300°C</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Flame Type</td>
                            <td style="border:1px solid #000; padding:10px 15px;">Neutral</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Pressure Settings</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">O₂ Pressure</td>
                            <td style="border:1px solid #000; padding:10px 15px;">250 kPa</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Acetylene Pressure</td>
                            <td style="border:1px solid #000; padding:10px 15px;">120 kPa</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Result</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Travel Speed</td>
                            <td style="border:1px solid #000; padding:10px 15px;">5 mm/s</td>
                        </tr>
                    </tbody>
                </table>

                <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">🖨 Print Results</button>
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

    preloadAssets();
});

