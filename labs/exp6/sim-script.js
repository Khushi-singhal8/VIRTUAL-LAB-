document.addEventListener("DOMContentLoaded", function () {

    // Injects custom CSS styles for apparatus cards, click hints, and animations
    const style = document.createElement('style');
    style.innerHTML = `
.apparatus-img-box {
    width: 100%;
    height: 150px;
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

    // DOM references for navigation buttons and display containers
    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');

    // Tracks completion state for each interactive step
    let cleanupCurrent = null;
    let step1Completed = false;
    let step1_5Completed = false;
    let step2Completed = false;
    let step3_1Completed = false;
    let step3_2Completed = false;
    let step3_3Completed = false;
    let step4Completed = false;
    let step4_5Completed = false;
    let step4_6Completed = false;
    let step6Completed = false;
    let step7Completed = false;
    let step8Completed = false;

    // Apparatus items displayed in the identification step
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

    // List of all images, videos, and audio files to preload before simulation starts
    const assetList = [
        "images/apparatus/d].png",
        "images/apparatus/c].png",
        "images/apparatus/a].png",
        "images/apparatus/e].png",
        "images/apparatus/b].png",
        "images/apparatus/f].png",
        "images/simulation/1.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",
        "images/simulation/1.5.mp4",
        "images/simulation/1.5.png",
        "images/simulation/1.5-tool.png",
        "images/simulation/2.mp4",
        "images/simulation/3.1.mp4",
        "images/simulation/3.2.mp4",
        "images/simulation/3.1.5.mp4",
        "images/simulation/3.png",
        "images/simulation/3.1.png",
        "images/simulation/3-tool.png",
        "images/simulation/4.mp4",
        "images/simulation/4.png",
        "images/simulation/4-tool1.png",
        "images/simulation/4-tool2.png",
        "images/simulation/4.5.mp4",
        "images/simulation/4.5.png",
        "images/simulation/4-tool3.png",
        "images/simulation/4.6.mp3",
        "images/simulation/7.mp4",
        "images/simulation/7.png",
        "images/simulation/7-tool.png",
        "images/simulation/8.mp4",
        "images/simulation/8.png",
        "images/simulation/8-tool.png",
        "images/simulation/print .png"
    ];

    const assetCache = {};

    // Returns a cached blob URL for an asset, or the original URL if not cached
    function getAssetSrc(originalUrl) {
        return assetCache[originalUrl] || originalUrl;
    }

    // Appends a cache-busting timestamp to non-blob URLs
    function formatSrc(url, timestamp) {
        const src = getAssetSrc(url);
        if (src.startsWith('blob:')) return src;
        return `${src}?t=${timestamp}`;
    }

    // Fetches all assets into blob URLs and shows a loading overlay with progress bar
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

    // Defines all simulation steps in order with their type and media source
    const steps = [
        { id: 'apparatus', title: 'Apparatus Identification', type: 'apparatus' },
        { id: 'step1', title: 'Clean plate edges', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step1_5', title: 'Clean second plate', src: 'images/simulation/1.5.mp4', type: 'video' },
        { id: 'step2', title: 'Align plates and clamp them', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step3_1', title: 'Set gas pressure', src: 'images/simulation/3.1.mp4', type: 'video' },
        { id: 'step3_2', title: 'Ignite the torch', src: 'images/simulation/3.png', type: 'drag-drop' },
        { id: 'step3_3', title: 'Obtain neutral flame', src: 'images/simulation/3.2.mp4', type: 'video' },
        { id: 'step4', title: 'Apply tack welds at both ends of the plates', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step4_5', title: 'Welding simulation', src: 'images/simulation/4.5.mp4', type: 'video' },
        { id: 'step4_6', title: 'Perform welding operation', type: 'drag-drop' },
        { id: 'step7', title: 'Remove slag', src: 'images/simulation/7.mp4', type: 'video' },
        { id: 'step8', title: 'File edges', src: 'images/simulation/8.mp4', type: 'video' },
        { id: 'result', title: 'Observation & Result', type: 'result' }
    ];

    // Instruction text shown for each step: what to do now and what comes next
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
            next: "Adjust gas pressure."
        },
        step3_1: {
            now: "Follow the steps to set pressure and open acetylene valve.",
            next: "Ignite the torch."
        },
        step3_2: {
            now: "Drag the ignitor to the torch to ignite the flame.",
            next: "Obtain neutral flame."
        },
        step3_3: {
            now: "Click to increase oxygen to obtain neutral flame.",
            next: "Apply tack welds."
        },
        step4: {
            now: "Apply tack welds at both ends of the plates.",
            next: "Start the welding process."
        },
        step4_5: {
            now: "Perform welding.",
            next: "Perform welding on your own."
        },
        step4_6: {
            now: "Drag the torch and carefully weld the joint.",
            next: "Remove slag."
        },
        step7: {
            now: "Drag the chipping hammer to remove slag from the weld.",
            next: "File the edges."
        },
        step8: {
            now: "Drag the filing tool tool to start filing edges.",
            next: "View results."
        }
    };

    let currentStepIndex = 0;
    const totalSteps = steps.length;

    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    // Runs the previous step's cleanup function and removes resize listener
    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) { }
            cleanupCurrent = null;
        }
        window.removeEventListener('resize', updateScaling);
    }

    // Scales the simulation stage to fit within its container without overflow
    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage') ||
            document.getElementById('step1-drag-stage') ||
            document.getElementById('step1_5-drag-stage') ||
            document.getElementById('step4-drag-stage') ||
            document.getElementById('step4_5-drag-stage') ||
            document.getElementById('step4_6-drag-stage') ||
            document.getElementById('step4_6-weld-stage') ||
            document.getElementById('step7-drag-stage') ||
            document.getElementById('step8-drag-stage');

        if (!container || !wrapper || !stage) return;

        wrapper.style.transform = 'scale(1)';
        wrapper.style.width = '100%';
        wrapper.style.marginLeft = '0';

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            if (scale < 1) {
                wrapper.style.transform = `scale(${scale})`;
                wrapper.style.width = `${(1 / scale) * 100}%`;
                wrapper.style.transformOrigin = 'center center';
                wrapper.style.marginLeft = '0';
            } else {
                wrapper.style.transformOrigin = 'center center';
            }
        }
    }

    // Checks if a step requires user interaction before proceeding
    function isInteractiveStep(stepId) {
        return stepId === 'step1' || stepId === 'step1_5' || stepId === 'step2' || stepId === 'step3_1' || stepId === 'step3_2' || stepId === 'step3_3' || stepId === 'step4' || stepId === 'step4_6' || stepId === 'step6' || stepId === 'step8';
    }

    // Returns whether a given interactive step has been completed
    function isInteractiveCompleted(stepId) {
        if (stepId === 'step1') return step1Completed;
        if (stepId === 'step1_5') return step1_5Completed;
        if (stepId === 'step2') return step2Completed;
        if (stepId === 'step3_1') return step3_1Completed;
        if (stepId === 'step3_2') return step3_2Completed;
        if (stepId === 'step3_3') return step3_3Completed;
        if (stepId === 'step4') return step4Completed;
        if (stepId === 'step4_5') return step4_5Completed;
        if (stepId === 'step4_6') return step4_6Completed;
        if (stepId === 'step6') return step6Completed;
        if (stepId === 'step8') return step8Completed;
        return true;
    }

    // Marks a given interactive step as completed or not
    function setInteractiveCompleted(stepId, done) {
        if (stepId === 'step1') step1Completed = done;
        if (stepId === 'step1_5') step1_5Completed = done;
        if (stepId === 'step2') step2Completed = done;
        if (stepId === 'step3_1') step3_1Completed = done;
        if (stepId === 'step3_2') step3_2Completed = done;
        if (stepId === 'step3_3') step3_3Completed = done;
        if (stepId === 'step4') step4Completed = done;
        if (stepId === 'step4_5') step4_5Completed = done;
        if (stepId === 'step4_6') step4_6Completed = done;
        if (stepId === 'step6') step6Completed = done;
        if (stepId === 'step8') step8Completed = done;
    }

    // Renders the apparatus identification grid showing all welding tools
    function renderApparatusStep() {
        let html = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">
                Step ${currentStepIndex + 1} of ${totalSteps}
            </div>

            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div id="play-stage" style="width: 100%; padding: 20px;">
                        <div style="
                            display:grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap:20px;
                            max-width: 900px;
                            margin-left: auto;
                            margin-right: auto;
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
                    </div>
                </div>
            </div>

            <div class="drag-instructions" style="margin-top:20px; line-height: 15px">
                ${stepGuidance.apparatus.now}\n
                Click next to: ${stepGuidance.apparatus.next}
            </div>
        </div>
        `;

        gifContainer.innerHTML = html;
        updateScaling();
        window.addEventListener('resize', updateScaling);
    }

    // Main step router: cleans up previous step, disables next button, and renders the current step
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
        } else if (step.id === 'step3_1') {
            renderStep3_1(step, timestamp);
        } else if (step.id === 'step3_2') {
            renderStep3_2(step, timestamp);
        } else if (step.id === 'step3_3') {
            renderStep3_3(step, timestamp);
        } else if (step.id === 'step4') {
            renderStep4DragDrop(step, timestamp);
        } else if (step.id === 'step4_5') {
            renderStep4_5DragDrop(step, timestamp);
        } else if (step.id === 'step4_6') {
            renderStep4_6WeldingSimulation(step, timestamp);
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
            nextButton.disabled = true;
        }
    }

    // Plays a simple video step with no interaction required, enables next when video ends
    function renderPlainVideoStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" playsinline muted></video>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (nextButton) nextButton.disabled = true;

        const video = document.getElementById('step-video');
        const onMeta = () => {
            updateScaling();
            video.play().catch(() => { });
        };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
        video.addEventListener('ended', () => {
            if (nextButton) nextButton.disabled = false;
        }, { once: true });
        window.addEventListener('resize', updateScaling);

        cleanupCurrent = function () {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.removeEventListener('loadedmetadata', onMeta);
            } catch (_) { }
        };
    }

    // Handles drag-and-drop of torch and filler rod, then plays the welding video
    function renderStep4_5DragDrop(step, timestamp) {
        step4_5Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/4.5.mp4';
        const bgPath = 'images/simulation/4.5.png';
        const tool1Path = 'images/simulation/4-tool1.png';
        const tool2Path = 'images/simulation/4-tool2.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step4_5-drag-stage" style="position: relative; width: 100%;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate for welding" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(tool1Path, timestamp)}" id="draggable-tool1-4_5" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 33%; right: 39%;"/>
                            <img src="${formatSrc(tool2Path, timestamp)}" id="draggable-tool2-4_5" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 27%; right: 50%;"/>

                            <div id="step4_5-drop-zone1" class="drop-zone" aria-hidden="true" style="--arrow-top: -230%; --arrow-left: 100%;"></div>
                            <div id="step4_5-drop-zone2" class="drop-zone" style="--arrow-top: -250%; --arrow-left: 70%;"></div>
                        </div>

                        <div class="play-stage" id="step4_5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step4_5-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        const target1Rel = { x: 0.45, y: 0.5 };
        const target2Rel = { x: 0.3, y: 0.5 };
        const tolerancePx = 80;

        let tool1Placed = false;
        let tool2Placed = false;
        let activeTool = null;

        tool2.style.display = 'none';
        dropZone2.style.display = 'none';

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.08;
            const h = w;

            const tx1 = rect.width * target1Rel.x;
            const ty1 = rect.height * target1Rel.y;
            dropZone1.style.width = w + 'px';
            dropZone1.style.height = h + 'px';
            dropZone1.style.left = (tx1 - w / 2) + 'px';
            dropZone1.style.top = (ty1 - h / 2) + 'px';

            const tx2 = rect.width * target2Rel.x;
            const ty2 = rect.height * target2Rel.y;
            dropZone2.style.width = w + 'px';
            dropZone2.style.height = h + 'px';
            dropZone2.style.left = (tx2 - w / 2) + 'px';
            dropZone2.style.top = (ty2 - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            if (e.target !== tool1 && e.target !== tool2) return;
            dropZone1.classList.add('dragging-active');
            dropZone2.classList.add('dragging-active');

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

            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

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
                activeTool.style.left = (targetX - toolRect.width / 2) + 'px';
                activeTool.style.top = (targetY - toolRect.height / 2) + 'px';

                activeTool.style.pointerEvents = 'none';
                activeTool.style.cursor = 'default';

                dropZone.classList.add('success');

                if (activeTool === tool1) {
                    tool1Placed = true;
                    dropZone1.style.display = 'none';
                    tool2.style.display = 'block';
                    dropZone2.style.display = 'flex';
                    instructionElem.textContent = "Good! Now position the filler rod.";
                }
                if (activeTool === tool2) {
                    tool2Placed = true;
                    instructionElem.textContent = "Great! Starting welding process...";
                }

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
            window.removeEventListener('resize', setDropZoneLayout);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Observe the welding process carefully.";

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

    // Interactive welding step: drag tools into position, then drag torch along the joint to weld
    function renderStep4_6WeldingSimulation(step, timestamp) {
        step4_6Completed = false;
        if (nextButton) nextButton.disabled = true;

        const bgPath = 'images/simulation/4.5.png';
        const tool1Path = 'images/simulation/4-tool1.png';
        const tool2Path = 'images/simulation/4-tool2.png';
        const torchPath = 'images/simulation/4-tool3.png';

        const WELD_START = { x: 0.42, y: 0.625 };
        const WELD_END = { x: 0.62, y: 0.535 };
        const BEAD_ROTATION_DEG = -55;
        const WELD_HALF_W = 0.008;
        const BEAD_SURFACE_EDGE_SCALE = 3.8;
        const BEAD_ROOT_EDGE_SCALE = 3.2;
        const WELD_TOLERANCE = 0.05;
        const NUM_SEGMENTS = 30;
        const HOT_DURATION = 900;
        const beadRotationRad = (BEAD_ROTATION_DEG * Math.PI) / 180;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step4_6-drag-stage" style="position: relative; width: 100%;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate for welding" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(tool1Path, timestamp)}" id="draggable-tool1-4_6" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 33%; right: 39%;"/>
                            <img src="${formatSrc(tool2Path, timestamp)}" id="draggable-tool2-4_6" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 27%; right: 50%;"/>

                            <div id="step4_6-drop-zone1" class="drop-zone" aria-hidden="true" style="--arrow-top: -230%; --arrow-left: 100%;"></div>
                            <div id="step4_6-drop-zone2" class="drop-zone" style="--arrow-top: -250%; --arrow-left: 70%;"></div>
                        </div>

                        <div class="play-stage" id="step4_6-weld-stage" style="position: relative; width: 100%; height: 100%; display: none; line-height: 0;">
                            <img id="step4_6-bg" src="${formatSrc(bgPath, timestamp)}" style="width:100%; height:auto; display:block; pointer-events:none; user-select:none;"/>

                            <svg id="step4_6-weld-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible;">
                                <defs>
                                    <filter id="weld-glow-4_6" x="-80%" y="-80%" width="260%" height="260%">
                                        <feGaussianBlur stdDeviation="4" result="blur"/>
                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <filter id="bead-shadow-4_6" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="#00000088"/>
                                    </filter>
                                </defs>
                                <g id="step4_6-bead-group"></g>
                                <circle id="step4_6-arc-glow" cx="-999" cy="-999" r="14" fill="#0077d7" filter="url(#weld-glow-4_6)" opacity="0"/>
                            </svg>

                            <canvas id="step4_6-spark-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></canvas>

                            <img id="step4_6-torch" src="${formatSrc(torchPath, timestamp)}" style="position:absolute; width:27%; top:47%; right:43%; cursor:grab; z-index:30; user-select:none; touch-action:none;" draggable="false"/>
                        </div>
                    </div>
                </div>

                <div id="step4_6-weld-progress-container" style="display:none; margin-top:10px; padding:0 4px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:13px; color:#555; white-space:nowrap;">Weld Progress:</span>
                        <div style="flex:1; height:12px; background:#ddd; border-radius:6px; overflow:hidden;">
                            <div id="step4_6-progress-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#ff6600,#ffcc00); border-radius:6px; transition:width 0.15s linear, background 0.2s ease;"></div>
                        </div>
                        <span id="step4_6-progress-text" style="font-size:13px; color:#555; width:36px; text-align:right;">0%</span>
                    </div>
                </div>

                <div id="step4_6-instruction" class="drag-instructions">
                    Drag the torch to the starting position to begin welding.
                </div>
            </div>
        `;

        const dragStage = document.getElementById('step4_6-drag-stage');
        const tool1 = document.getElementById('draggable-tool1-4_6');
        const tool2 = document.getElementById('draggable-tool2-4_6');
        const dropZone1 = document.getElementById('step4_6-drop-zone1');
        const dropZone2 = document.getElementById('step4_6-drop-zone2');
        const dragBg = dragStage.querySelector('.stage-bg');
        const instructionElem = document.getElementById('step4_6-instruction');

        const target1Rel = { x: 0.5, y: 0.55 };
        const target2Rel = { x: 0.36, y: 0.55 };
        const tolerancePx = 80;

        let tool1Placed = false;
        let tool2Placed = false;
        let activeTool = null;

        tool2.style.display = 'none';
        dropZone2.style.display = 'none';

        function setDropZoneLayout() {
            if (!dragStage || !dragStage.parentNode) return;
            const rect = dragStage.getBoundingClientRect();
            if (rect.width === 0) return;
            const w = rect.width * 0.08;
            const h = w;

            const tx1 = rect.width * target1Rel.x;
            const ty1 = rect.height * target1Rel.y;
            dropZone1.style.width = w + 'px';
            dropZone1.style.height = h + 'px';
            dropZone1.style.left = (tx1 - w / 2) + 'px';
            dropZone1.style.top = (ty1 - h / 2) + 'px';

            const tx2 = rect.width * target2Rel.x;
            const ty2 = rect.height * target2Rel.y;
            dropZone2.style.width = w + 'px';
            dropZone2.style.height = h + 'px';
            dropZone2.style.left = (tx2 - w / 2) + 'px';
            dropZone2.style.top = (ty2 - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', setDropZoneLayout);

        let phase1Dragging = false;
        let p1StartX = 0, p1StartY = 0;

        function onPointerDownPhase1(e) {
            if (e.target !== tool1 && e.target !== tool2) return;
            dropZone1.classList.add('dragging-active');
            dropZone2.classList.add('dragging-active');

            activeTool = e.target;
            phase1Dragging = true;
            activeTool.classList.add('dragging');

            const rect = activeTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            p1StartX = clientX - rect.left;
            p1StartY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMovePhase1(e) {
            if (!phase1Dragging || !activeTool) return;

            const stageRect = dragStage.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - p1StartX;
            let newTop = clientY - stageRect.top - p1StartY;

            activeTool.style.left = newLeft + 'px';
            activeTool.style.top = newTop + 'px';
        }

        function onPointerUpPhase1() {
            if (!phase1Dragging || !activeTool) return;
            phase1Dragging = false;
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
                activeTool.style.left = (targetX - toolRect.width / 2) + 'px';
                activeTool.style.top = (targetY - toolRect.height / 2) + 'px';
                activeTool.style.pointerEvents = 'none';
                activeTool.style.cursor = 'default';

                dropZone.classList.add('success');

                if (activeTool === tool1) {
                    tool1Placed = true;
                    dropZone1.style.display = 'none';
                    tool2.style.display = 'block';
                    dropZone2.style.display = 'flex';
                    instructionElem.textContent = "Good! Now position the filler rod.";
                }
                if (activeTool === tool2) {
                    tool2Placed = true;
                    dropZone2.style.display = 'none';
                    instructionElem.textContent = "Great! Starting welding process...";
                }

                if (tool1Placed && tool2Placed) {
                    setTimeout(startInteractiveWeldingPhase, 500);
                }
            }

            activeTool = null;
        }

        tool1.addEventListener('mousedown', onPointerDownPhase1);
        tool1.addEventListener('touchstart', onPointerDownPhase1);
        tool2.addEventListener('mousedown', onPointerDownPhase1);
        tool2.addEventListener('touchstart', onPointerDownPhase1);
        window.addEventListener('mousemove', onPointerMovePhase1);
        window.addEventListener('touchmove', onPointerMovePhase1);
        window.addEventListener('mouseup', onPointerUpPhase1);
        window.addEventListener('touchend', onPointerUpPhase1);

        const weldStage = document.getElementById('step4_6-weld-stage');
        const weldBg = document.getElementById('step4_6-bg');
        const torch = document.getElementById('step4_6-torch');
        const sparkCanvas = document.getElementById('step4_6-spark-canvas');
        const beadGroup = document.getElementById('step4_6-bead-group');
        const arcGlow = document.getElementById('step4_6-arc-glow');
        const progressBar = document.getElementById('step4_6-progress-bar');
        const progressTxt = document.getElementById('step4_6-progress-text');
        const hint = document.getElementById('step4_6-hint');
        const progressContainer = document.getElementById('step4_6-weld-progress-container');
        const ctx = sparkCanvas.getContext('2d');

        const weldedAt = new Array(NUM_SEGMENTS).fill(null);
        let totalWelded = 0;
        let sparks = [];
        let phase2Dragging = false;
        let p2StartX = 0, p2StartY = 0;
        let animFrame = null;
        let completed = false;

        const weldingAudio = new Audio(formatSrc('images/simulation/4.6.mp3', timestamp));
        weldingAudio.loop = true;
        weldingAudio.volume = 0.6;
        let isAudioPlaying = false;

        function syncCanvasSize() {
            if (!sparkCanvas || !weldStage) return;
            sparkCanvas.width = weldStage.offsetWidth;
            sparkCanvas.height = weldStage.offsetHeight;
        }

        weldBg.addEventListener('load', () => { syncCanvasSize(); updateScaling(); });

        // Determines which weld segment the torch tip is currently over
        function getSegmentUnderTip(tipX, tipY) {
            const ax = WELD_START.x, ay = WELD_START.y;
            const bx = WELD_END.x, by = WELD_END.y;
            const dx = bx - ax, dy = by - ay;
            const lenSq = dx * dx + dy * dy;
            const t = Math.max(0, Math.min(1, ((tipX - ax) * dx + (tipY - ay) * dy) / lenSq));
            const closestX = ax + t * dx;
            const closestY = ay + t * dy;
            const dist = Math.hypot(tipX - closestX, tipY - closestY);
            if (dist > WELD_TOLERANCE) return null;
            return Math.min(NUM_SEGMENTS - 1, Math.floor(t * NUM_SEGMENTS));
        }

        // Draws the weld bead SVG polygons with hot/cool color transitions
        function redrawBead() {
            const W = weldStage.offsetWidth, H = weldStage.offsetHeight;
            const sx = WELD_START.x * W, sy = WELD_START.y * H;
            const ex = WELD_END.x * W, ey = WELD_END.y * H;
            const dx = ex - sx, dy = ey - sy;
            const totalLen = Math.hypot(dx, dy) || 1;
            const uxPath = dx / totalLen, uyPath = dy / totalLen;
            const pxPath = -uyPath, pyPath = uxPath;

            const cosA = Math.cos(beadRotationRad);
            const sinA = Math.sin(beadRotationRad);
            const uxShape = uxPath * cosA - uyPath * sinA;
            const uyShape = uxPath * sinA + uyPath * cosA;
            const pxShape = -uyShape;
            const pyShape = uxShape;

            const scR = WELD_HALF_W * W;
            const stepSize = totalLen / NUM_SEGMENTS;
            const scallopsPerSeg = 1;

            const now = Date.now();
            let newHtml = '';

            for (let seg = NUM_SEGMENTS - 3; seg >= 0; seg--) {
                if (weldedAt[seg] === null) continue;

                const age = now - weldedAt[seg];
                const isHot = age < HOT_DURATION;
                const hotFrac = isHot ? 1 - age / HOT_DURATION : 0;

                for (let sc = 0; sc < scallopsPerSeg; sc++) {
                    const t = (seg + (sc + 0.5) / scallopsPerSeg) * stepSize;
                    const cx = sx + uxPath * t;
                    const cy = sy + uyPath * t;

                    let fill;
                    if (hotFrac > 0.7) fill = '#ffcc00';
                    else if (hotFrac > 0.3) fill = `rgb(${Math.floor(180 + hotFrac * 75)},${Math.floor(hotFrac * 120)},0)`;
                    else {
                        const shade = 50 + (seg % 2) * 16;
                        fill = `rgb(${shade},${shade - 6},${shade - 12})`;
                    }

                    const halfAlong = stepSize * 0.48;
                    const halfAcrossSurface = scR * BEAD_SURFACE_EDGE_SCALE;
                    const halfAcrossRoot = scR * BEAD_ROOT_EDGE_SCALE;
                    const triTipLen = scR * 4;

                    const centerOffset = scR * -0.4;
                    const centerX = cx + pxPath * centerOffset;
                    const centerY = cy + pyPath * centerOffset;

                    if (seg === 0) {
                        const p1x = centerX + pxShape * halfAcrossSurface;
                        const p1y = centerY + pyShape * halfAcrossSurface;
                        const p2x = centerX - pxShape * halfAcrossRoot;
                        const p2y = centerY - pyShape * halfAcrossRoot;
                        const p3x = centerX - uxShape * triTipLen;
                        const p3y = centerY - uyShape * triTipLen;

                        newHtml += `
                            <polygon
                                points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}"
                                fill="${fill}"
                                stroke="rgba(58,30,10,0.65)"
                                stroke-width="0.7"
                                stroke-linejoin="round"
                                filter="url(#bead-shadow-4_6)"
                                opacity="0.98">
                            </polygon>`;
                    } else {
                        const p1x = centerX - uxShape * halfAlong - pxShape * halfAcrossRoot;
                        const p1y = centerY - uyShape * halfAlong - pyShape * halfAcrossRoot;
                        const p2x = centerX + uxShape * halfAlong - pxShape * halfAcrossRoot;
                        const p2y = centerY + uyShape * halfAlong - pyShape * halfAcrossRoot;
                        const p3x = centerX + uxShape * halfAlong + pxShape * halfAcrossSurface;
                        const p3y = centerY + uyShape * halfAlong + pyShape * halfAcrossSurface;
                        const p4x = centerX - uxShape * halfAlong + pxShape * halfAcrossSurface;
                        const p4y = centerY - uyShape * halfAlong + pyShape * halfAcrossSurface;

                        newHtml += `
                            <polygon
                                points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}"
                                fill="${fill}"
                                stroke="rgba(58,30,10,0.65)"
                                stroke-width="0.7"
                                stroke-linejoin="round"
                                filter="url(#bead-shadow-4_6)"
                                opacity="0.98">
                            </polygon>`;
                    }
                }
            }
            beadGroup.innerHTML = newHtml;
        }

        function getClient(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        function onPointerDownPhase2(e) {
            if (completed || e.target !== torch) return;
            phase2Dragging = true;
            torch.style.cursor = 'grabbing';
            const r = torch.getBoundingClientRect();
            const c = getClient(e);
            p2StartX = c.x - r.left;
            p2StartY = c.y - r.top;
            e.preventDefault();
        }

        // Moves the torch and welds segments as it passes over the joint line
        function onPointerMovePhase2(e) {
            if (!phase2Dragging) return;
            const stageRect = weldStage.getBoundingClientRect();
            const torchRect = torch.getBoundingClientRect();
            const c = getClient(e);
            const W = stageRect.width, H = stageRect.height;

            let newLeft = c.x - stageRect.left - p2StartX;
            let newTop = c.y - stageRect.top - p2StartY;
            newLeft = Math.max(0, Math.min(newLeft, W - torchRect.width));
            newTop = Math.max(0, Math.min(newTop, H - torchRect.height));

            torch.style.left = newLeft + 'px';
            torch.style.top = newTop + 'px';
            torch.style.right = 'auto';

            const tipX = (newLeft + torchRect.width * 0.55) / W;
            const tipY = (newTop + torchRect.height * 0.9) / H;
            const seg = getSegmentUnderTip(tipX, tipY);

            if (seg !== null && !completed) {
                if (!isAudioPlaying) {
                    weldingAudio.currentTime = 0;
                    weldingAudio.play().catch(() => {});
                    isAudioPlaying = true;
                }

                const isNew = weldedAt[seg] === null;
                weldedAt[seg] = Date.now();
                if (isNew) {
                    totalWelded++;
                    const pct = Math.round((totalWelded / NUM_SEGMENTS) * 100);
                    progressBar.style.width = pct + '%';
                    progressTxt.textContent = pct + '%';
                }

                redrawBead();

                if (totalWelded >= NUM_SEGMENTS && !completed) {
                    if (isAudioPlaying) {
                        weldingAudio.pause();
                        isAudioPlaying = false;
                    }
                    finishWeld();
                    return;
                }

                if (!completed) {
                    const tipPxX = tipX * W, tipPxY = tipY * H;
                    emitSparks(tipPxX, tipPxY, stageRect);
                    arcGlow.setAttribute('cx', tipPxX + '');
                    arcGlow.setAttribute('cy', tipPxY + '');
                    arcGlow.setAttribute('opacity', '0.9');
                    instructionElem.textContent = 'Welding… drag the torch along the entire joint!';
                }
            } else {
                if (isAudioPlaying) {
                    weldingAudio.pause();
                    isAudioPlaying = false;
                }
                arcGlow.setAttribute('opacity', '0');
                if (totalWelded < NUM_SEGMENTS) {
                    instructionElem.textContent = 'Move the torch closer to the joint gap!';
                }
            }
            e.preventDefault();
        }

        function onPointerUpPhase2() {
            if (!phase2Dragging) return;

            phase2Dragging = false;
            torch.style.cursor = 'grab';
            arcGlow.setAttribute('opacity', '0');

            if (isAudioPlaying) {
                weldingAudio.pause();
                weldingAudio.currentTime = 0;
                isAudioPlaying = false;
            }
        }

        // Creates random spark particles near the torch tip for visual effect
        function emitSparks(px, py, stageRect) {
            if (Math.random() > 0.6) return;
            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                sparks.push({
                    x: px, y: py,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    life: 1.0,
                    maxLife: Math.random() * 0.5 + 0.5
                });
            }
        }

        // Animation loop that updates spark particles and redraws the weld bead
        function animateLoop() {
            if (!weldStage) return;
            const W = sparkCanvas.width, H = sparkCanvas.height;
            ctx.clearRect(0, 0, W, H);

            if (sparks.length > 0) {
                for (let i = sparks.length - 1; i >= 0; i--) {
                    const s = sparks[i];
                    s.vy += 0.25;
                    s.x += s.vx;
                    s.y += s.vy;
                    s.life -= 0.02;

                    if (s.life <= 0 || s.y > H || s.x < 0 || s.x > W) {
                        sparks.splice(i, 1);
                        continue;
                    }

                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                    const alpha = Math.max(0, s.life / s.maxLife);
                    ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
                    ctx.fill();
                }
            }

            redrawBead();
            animFrame = requestAnimationFrame(animateLoop);
        }

        // Transitions from tool placement to the interactive torch-dragging welding phase
        function startInteractiveWeldingPhase() {
            dragStage.style.display = 'none';
            weldStage.style.display = 'inline-block';
            progressContainer.style.display = 'block';
            instructionElem.textContent = "Drag the torch along the joint to weld.";
            syncCanvasSize();
            updateScaling();

            window.removeEventListener('mousemove', onPointerMovePhase1);
            window.removeEventListener('touchmove', onPointerMovePhase1);
            window.removeEventListener('mouseup', onPointerUpPhase1);
            window.removeEventListener('touchend', onPointerUpPhase1);

            torch.addEventListener('mousedown', onPointerDownPhase2);
            torch.addEventListener('touchstart', onPointerDownPhase2);
            window.addEventListener('mousemove', onPointerMovePhase2);
            window.addEventListener('touchmove', onPointerMovePhase2);
            window.addEventListener('mouseup', onPointerUpPhase2);
            window.addEventListener('touchend', onPointerUpPhase2);

            animFrame = requestAnimationFrame(animateLoop);
        }

        // Marks welding as complete and enables the next button
        function finishWeld() {
            phase2Dragging = true;
            if (isAudioPlaying) {
                weldingAudio.pause();
                isAudioPlaying = false;
            }
            progressBar.style.width = '100%';
            progressTxt.textContent = '100%';
            progressBar.style.background = 'linear-gradient(90deg,#28a745,#20c997)';
            arcGlow.setAttribute('opacity', '0');
            instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance["step4_6"].next;
            step4_6Completed = true;
            if (nextButton) nextButton.disabled = false;

            setTimeout(() => {
                const remainingHot = weldedAt.filter(t => t !== null && (Date.now() - t) < HOT_DURATION).length;
                if (remainingHot === 0) {
                }
            }, HOT_DURATION);
        }

        cleanupCurrent = () => {
            try {
                if (weldingAudio) {
                    weldingAudio.pause();
                    weldingAudio.currentTime = 0;
                }
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMovePhase1);
                window.removeEventListener('touchmove', onPointerMovePhase1);
                window.removeEventListener('mouseup', onPointerUpPhase1);
                window.removeEventListener('touchend', onPointerUpPhase1);

                window.removeEventListener('mousemove', onPointerMovePhase2);
                window.removeEventListener('touchmove', onPointerMovePhase2);
                window.removeEventListener('mouseup', onPointerUpPhase2);
                window.removeEventListener('touchend', onPointerUpPhase2);

                if (animFrame) cancelAnimationFrame(animFrame);
            } catch (_) { }
        };
    }

    // Plays a video that pauses at specific timestamps and shows clickable hotspots
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
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" playsinline muted></video>
                            <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                        </div>
                    </div>
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
            const rect = { width: stage.offsetWidth, height: stage.offsetHeight };
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
            hotspot.style.display = 'flex';
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

        window.addEventListener('resize', () => {
            layoutHotspot();
            updateScaling();
        });
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();
            updateScaling();
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

    // Plays a video with hotspots for setting gas pressure and opening the acetylene valve
    function renderStep3_1(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        const phase1Cfg = [
            { pauseAt: 2.4, hotspot: { x: 0.011111, y: 0.272593, w: 0.181111, h: 0.169877 }, instruction: 'Set pressure for acetylene to 120kPa' },
            { pauseAt: 7.4, hotspot: { x: 0.556667, y: 0.213333, w: 0.183333, h: 0.169877 }, instruction: 'Set pressure for oxygen to 250kPa.' },
            { pauseAt: 18.2, hotspot: { x: 0.186667, y: 0.377284, w: 0.108889, h: 0.193580 }, instruction: 'Open acetylene valve slightly.' }
        ];

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="step3_1-play-stage">
                            <video id="step3_1-video" src="${formatSrc(step.src, timestamp)}" playsinline muted></video>
                            <button id="step3_1-hotspot" class="play-hotspot" style="display:none;"></button>
                        </div>
                    </div>
                </div>
                <div id="step3_1-instruction" class="drag-instructions"></div>
            </div>
        `;

        const stage = document.getElementById('step3_1-play-stage');
        const video = document.getElementById('step3_1-video');
        const hotspot = document.getElementById('step3_1-hotspot');
        const instructionElem = document.getElementById('step3_1-instruction');

        let segmentIndex = 0;
        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedForSegment = false;

        function layoutHotspot() {
            const rect = { width: stage.offsetWidth, height: stage.offsetHeight };
            const cfg = phase1Cfg[Math.min(segmentIndex, phase1Cfg.length - 1)];
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
        }

        function showHotspot() {
            const cfg = phase1Cfg[segmentIndex];
            instructionElem.textContent = cfg.instruction;
            layoutHotspot();
            hotspot.style.display = 'flex';
            hotspot.classList.add('debug-highlight');
        }

        function maybePause() {
            if (segmentIndex >= phase1Cfg.length || pausedForSegment) return;
            if (video.currentTime + EPS >= phase1Cfg[segmentIndex].pauseAt) {
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
            instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance[step.id].next;
            if (nextButton) nextButton.disabled = false;
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', onHotspotClick);

        window.addEventListener('resize', () => {
            layoutHotspot();
            updateScaling();
        });
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();
            updateScaling();
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

    // Handles drag-and-drop of the ignitor to the torch, then plays the ignition video
    function renderStep3_2(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        const dragTarget = { x: 0.32, y: 0.6 };
        const tolerancePx = 80;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step3_2-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc('images/simulation/3.png', timestamp)}" class="stage-bg" alt="Background" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc('images/simulation/3-tool.png', timestamp)}" id="step3_2-draggable" class="draggable" alt="Tool" style="position: absolute; z-index: 20; cursor: grab; width: 18%; top: 10%; right: 80%;"/>
                            <div id="step3_2-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -340%; --arrow-left: -210%;"></div>
                        </div>

                        <div class="play-stage" id="step3_2-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step3_2-video" src="${formatSrc('images/simulation/3.1.5.mp4', timestamp)}" playsinline></video>
                        </div>
                    </div>
                </div>

                <div id="step3_2-instruction" class="drag-instructions">Drag the ignitor to the torch.</div>
            </div>
        `;

        const dragStage = document.getElementById('step3_2-drag-stage');
        const draggable = document.getElementById('step3_2-draggable');
        const dropZone = document.getElementById('step3_2-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');
        const instructionElem = document.getElementById('step3_2-instruction');

        const playStage = document.getElementById('step3_2-play-stage');
        const video = document.getElementById('step3_2-video');

        function setDropZoneLayout() {
            const rect = { width: dragStage.offsetWidth, height: dragStage.offsetHeight };
            const w = rect.width * 0.10;
            const h = w;
            const tx = rect.width * dragTarget.x;
            const ty = rect.height * dragTarget.y;
            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) {
            setDropZoneLayout();
            updateScaling();
        } else {
            dragBg.onload = () => {
                setDropZoneLayout();
                updateScaling();
            };
        }
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            draggable.classList.add('dragging');
            dropZone.classList.add('dragging-active');
            const rect = draggable.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
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

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            draggable.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const toolRect = draggable.getBoundingClientRect();
            const anchorX = 0.6;
            const anchorY = 0.2;
            const toolCenter = {
                x: toolRect.left - stageRect.left + toolRect.width * anchorX,
                y: toolRect.top - stageRect.top + toolRect.height * anchorY
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                const zoneCenterRelX = dropZone.offsetLeft + dropZone.offsetWidth / 2;
                const zoneCenterRelY = dropZone.offsetTop + dropZone.offsetHeight / 2;

                draggable.style.left = (zoneCenterRelX - draggable.offsetWidth * anchorX) + 'px';
                draggable.style.top = (zoneCenterRelY - draggable.offsetHeight * anchorY) + 'px';

                dropZone.style.display = 'none';
                instructionElem.textContent = 'Click the ignitor to ignite the flame.';

                draggable.style.cursor = 'pointer';
                draggable.removeEventListener('mousedown', onPointerDown);
                draggable.removeEventListener('touchstart', onPointerDown);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);

                setTimeout(() => {
                    draggable.addEventListener('click', onToolClick);
                }, 100);
            }
        }

        function onToolClick() {
            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Igniting...";

            video.onended = () => {
                setInteractiveCompleted(step.id, true);
                instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance[step.id].next;
                if (nextButton) nextButton.disabled = false;
            };

            video.play();
        }

        draggable.addEventListener('mousedown', onPointerDown);
        draggable.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        cleanupCurrent = function () {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                draggable.removeEventListener('click', onToolClick);
            } catch (_) { }
        };
    }

    // Plays a video with a hotspot for adjusting oxygen to obtain a neutral flame
    function renderStep3_3(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        const phase3Cfg = [
            { pauseAt: 0.45, hotspot: { x: 0.755556, y: 0.393086, w: 0.094444, h: 0.167901 }, instruction: 'Click to increase oxygen to obtain neutral flame.' }
        ];

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="step3_3-play-stage">
                            <video id="step3_3-video" src="${formatSrc(step.src, timestamp)}" playsinline></video>
                            <button id="step3_3-hotspot" class="play-hotspot" style="display:none;"></button>
                        </div>
                    </div>
                </div>
                <div id="step3_3-instruction" class="drag-instructions"></div>
            </div>
        `;

        const stage = document.getElementById('step3_3-play-stage');
        const video = document.getElementById('step3_3-video');
        const hotspot = document.getElementById('step3_3-hotspot');
        const instructionElem = document.getElementById('step3_3-instruction');

        let segmentIndex = 0;
        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedForSegment = false;

        function layoutHotspot() {
            const rect = { width: stage.offsetWidth, height: stage.offsetHeight };
            const cfg = phase3Cfg[Math.min(segmentIndex, phase3Cfg.length - 1)];
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
        }

        function showHotspot() {
            const cfg = phase3Cfg[segmentIndex];
            instructionElem.textContent = cfg.instruction;
            layoutHotspot();
            hotspot.style.display = 'flex';
            hotspot.classList.add('debug-highlight');
        }

        function maybePause() {
            if (segmentIndex >= phase3Cfg.length || pausedForSegment) return;
            if (video.currentTime + EPS >= phase3Cfg[segmentIndex].pauseAt) {
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
            instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance[step.id].next;
            if (nextButton) nextButton.disabled = false;
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', onHotspotClick);

        window.addEventListener('resize', () => {
            layoutHotspot();
            updateScaling();
        });
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();
            updateScaling();
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

    // Handles drag-and-drop of the file tool to the first plate edge, then plays cleaning video
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

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step1-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-file-1" class="draggable" alt="File tool" style="position: absolute; z-index: 20; cursor: grab; width: 30%; top: 10%; right: 20%;"/>
                            <div id="step1-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -270%; --arrow-left: 345%;"></div>
                        </div>

                        <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step1-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            fileTool.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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

    // Handles drag-and-drop of the file tool to the second plate edge, then plays cleaning video
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

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step1_5-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate edges" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-file-1_5" class="draggable" alt="Tool" style="position: absolute; z-index: 20; cursor: grab; width: 30%; top: 10%; right: 65%;"/>
                            <div id="step1_5-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -255%; --arrow-left: -500%;"></div>
                        </div>

                        <div class="play-stage" id="step1_5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step1_5-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            fileTool.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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

    // Handles drag-and-drop of torch and filler rod for tack welding, then plays the tack weld video
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

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step4-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Plate for tack welding" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(tool1Path, timestamp)}" id="draggable-tool1" class="draggable" alt="Welding tool 1" style="position: absolute; z-index: 20; cursor: grab; width: 13%; top: 10%; right: 10%;"/>
                            <img src="${formatSrc(tool2Path, timestamp)}" id="draggable-tool2" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 16%; top: 10%; left: 10%;"/>

                            <div id="step4-drop-zone1" class="drop-zone" aria-hidden="true" style="--arrow-top: -398%; --arrow-left: 490%;"></div>
                            <div id="step4-drop-zone2" class="drop-zone" aria-hidden="true" style="--arrow-top: -280%; --arrow-left: 470%;"></div>
                        </div>

                        <div class="play-stage" id="step4-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step4-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        const target1Rel = { x: 0.5, y: 0.55 };
        const target2Rel = { x: 0.36, y: 0.55 };
        const tolerancePx = 80;

        let tool1Placed = false;
        let tool2Placed = false;
        let activeTool = null;

        tool2.style.display = 'none';
        dropZone2.style.display = 'none';

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.08;
            const h = w;

            const tx1 = rect.width * target1Rel.x;
            const ty1 = rect.height * target1Rel.y;
            dropZone1.style.width = w + 'px';
            dropZone1.style.height = h + 'px';
            dropZone1.style.left = (tx1 - w / 2) + 'px';
            dropZone1.style.top = (ty1 - h / 2) + 'px';

            const tx2 = rect.width * target2Rel.x;
            const ty2 = rect.height * target2Rel.y;
            dropZone2.style.width = w + 'px';
            dropZone2.style.height = h + 'px';
            dropZone2.style.left = (tx2 - w / 2) + 'px';
            dropZone2.style.top = (ty2 - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            if (e.target !== tool1 && e.target !== tool2) return;

            activeTool = e.target;
            dragging = true;
            activeTool.classList.add('dragging');
            dropZone1.classList.add('dragging-active');
            dropZone2.classList.add('dragging-active');

            const rect = activeTool.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches[0].clientX;
            const clientY = e.clientY ?? e.touches[0].clientY;

            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging || !activeTool) return;

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

            const dropZone = (activeTool === tool1) ? dropZone1 : dropZone2;
            const dzRect = dropZone.getBoundingClientRect();

            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(toolCenter.x - targetX, toolCenter.y - targetY);

            if (dist < tolerancePx) {
                activeTool.style.left = (targetX - toolRect.width / 2) + 'px';
                activeTool.style.top = (targetY - toolRect.height / 2) + 'px';

                activeTool.style.pointerEvents = 'none';
                activeTool.style.cursor = 'default';

                dropZone.classList.add('success');

                if (activeTool === tool1) {
                    tool1Placed = true;
                    dropZone1.style.display = 'none';
                    tool2.style.display = 'block';
                    dropZone2.style.display = 'flex';
                    instructionElem.textContent = "Good! Now drag the filler rod to its position.";
                }
                if (activeTool === tool2) {
                    tool2Placed = true;
                    instructionElem.textContent = "Excellent! Now we are ready to start the process.";
                }

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

    // Handles drag-and-drop of the chipping hammer to the weld, then plays slag removal video
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

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step7-drag-stage" style="position: relative; width: 100%;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Welded joint" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-hammer-7" class="draggable" alt="Chipping hammer" style="position: absolute; z-index: 20; cursor: grab; width: 45%; top: 10%; right: 3%;"/>
                            <div id="step7-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -480%; --arrow-left: 360%;"></div>
                        </div>

                        <div class="play-stage" id="step7-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step7-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            hammerTool.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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

            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

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

    // Handles drag-and-drop of the filing tool to the weld, then plays edge filing video
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

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step8-drag-stage" style="position: relative; width: 100%;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" alt="Welded joint for inspection" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-8" class="draggable" alt="Inspection tool" style="position: absolute; z-index: 20; cursor: grab; width: 35%; top: 10%; right: 10%;"/>
                            <div id="step8-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -430%; --arrow-left: 220%;"></div>
                        </div>

                        <div class="play-stage" id="step8-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step8-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        const targetRel = { x: 0.55, y: 0.68 };
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

        if (dragBg.complete && dragBg.naturalWidth) { setDropZoneLayout(); updateScaling(); }
        else dragBg.onload = () => { setDropZoneLayout(); updateScaling(); };
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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

            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

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

    // Shows the final result page with welding parameters table and a print button
    function renderResultStep() {
        document.body.classList.add('result-mode');

        gifContainer.innerHTML = `
        <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
            <h2 style="text-align:center;">Experiment Result</h2>
            <hr>

            <div class="sim-media-container" style="height: auto; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="text-align:center; margin:20px 0; width: 100%;">
                    <img src="${getAssetSrc('images/simulation/print .png')}" alt="Final Welded Butt Joint" style="max-width:90%; border:1px solid #ccc; border-radius:6px;">
                    <p style="font-size:14px; margin-top:6px;">Final welded butt joint after dressing</p>
                </div>

                <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family: sans-serif">
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
                            <td style="border:1px solid #000; padding:10px 15px;">Travel Speed</td>
                            <td style="border:1px solid #000; padding:10px 15px;">5 mm/s</td>
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
                            <td style="border:1px solid #000; padding:10px 15px;">Joint Quality</td>
                            <td style="border:1px solid #000; padding:10px 15px;">Proper fusion with smooth and clean weld bead</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">
                    🖨 Print Results
                </button>
            </div>
        </div>
        `;

        if (nextButton) nextButton.disabled = true;
    }

    // Navigation button event listeners for previous, next, and reset
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
            if (typeof window.customNextHandler === 'function') {
                window.customNextHandler();
                return;
            }
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
