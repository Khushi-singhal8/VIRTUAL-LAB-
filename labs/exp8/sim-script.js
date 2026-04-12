document.addEventListener("DOMContentLoaded", function () {
    const style = document.createElement('style');
    style.innerHTML = `
    .apparatus-img-box {
        width: 100%;
        height: 150px;
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
    style.innerHTML += `
    @media print {
        .no-print, #prev-btn, #next-btn, .sidebar, .header-container { display: none !important; }
        .print-area { display: block !important; width: 100% !important; height: auto !important; position: static !important; }
        body { background: white !important; }
        .gif-wrapper { border: none !important; box-shadow: none !important; }
    }
    body.result-mode #next-btn { display: none; }
    `;
    document.head.appendChild(style);

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const hotspotSteps = new Set(['step0', 'step2', 'step3']);
    const hotspotCompleted = { step0: false, step1_5: false, step2: false, step3: false };

    const apparatusData = [
        {
            name: "Wire Brush",
            img: "images/simulation/apparatus/brush.png",
            desc: "Used to clean rust, scale, and dirt from the metal surface before welding."
        },
        {
            name: "Gas Cylinder",
            img: "images/simulation/apparatus/cylinder.png",
            desc: "Supplies shielding gas to protect the weld pool from atmospheric contamination."
        },
        {
            name: "Workpeice",
            img: "images/simulation/apparatus/plates.png",
            desc: "Metal workpieces that are joined together during the welding process."
        },
        {
            name: "Welding Machine",
            img: "images/simulation/apparatus/machine.png",
            desc: "Supplies and controls the electrical current required for welding."
        },
        {
            name: "Welding torch",
            img: "images/simulation/apparatus/torch.png",
            desc: "Holds the non-consumable tungsten electrode to create an electric arc and delivers shielding gas to protect the weld pool from contamination."
        },
        {
            name: "Ground clamp",
            img: "images/simulation/apparatus/CLIP.png",
            desc: "Used to complete the electrical circuit by connecting the workpiece to the welding machine."
        }
    ];

    const assetList = [
        "images/simulation/apparatus/brush.png",
        "images/simulation/apparatus/cylinder.png",
        "images/simulation/apparatus/plates.png",
        "images/simulation/apparatus/machine.png",
        "images/simulation/apparatus/torch.png",
        "images/simulation/apparatus/CLIP.png",
        "images/simulation/0.5.mp4",
        "images/simulation/1.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",
        "images/simulation/1.5.mp4",
        "images/simulation/1.5.png",
        "images/simulation/1.5-tool.png",
        "images/simulation/1.5.2.png",
        "images/simulation/2.mp4",
        "images/simulation/3.mp4",
        "images/simulation/4.mp4",
        "images/simulation/4.png",
        "images/simulation/4-tool.png",
        "images/simulation/4.mp3",
        "images/simulation/5.mp4",
        "images/simulation/5.png",
        "images/simulation/result.png"
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
        { id: 'apparatus', title: 'Apparatus Used', type: 'apparatus' },
        { id: 'step0', title: 'Align the plates', src: 'images/simulation/0.5.mp4', type: 'video' },
        { id: 'step1', title: 'Clean workpiece using wire brush', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Set current', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step1_5', title: 'Attaching the ground clamp', src: 'images/simulation/1.5.mp4', type: 'video' },
        { id: 'step3', title: 'Setup shielding gas', src: 'images/simulation/3.mp4', type: 'video' },
        { id: 'step4_5', title: 'Welding simulation', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step4', title: 'Welding', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step5', title: 'Cleaning', src: 'images/simulation/5.mp4', type: 'video' },
        { id: 'result', title: 'Observation & Result', type: 'result' }
    ];

    const stepGuidance = {
        apparatus: {
            now: "Carefully observe all the apparatus shown above.",
            next: "Begin the welding simulation."
        },
        step0: {
            now: "Click on both metal plates one by one to align them properly before welding.",
            next: "Clean the metal surface."
        },
        step1: {
            now: "Drag the wire brush and place it on the metal surface to remove dust, rust, and impurities.",
            next: "Set the current."
        },
        step1_5: {
            now: "Click to attach the ground clamp to the workpiece.",
            next: "Adjust shielding gas flow rate"
        },
        step2: {
            now: "Click on the control and adjust the welding current to 60 Amperes (60A).",
            next: "Attach the ground clamp."
        },
        step3: {
            now: "Set the shielding gas flow rate to 10 LPM (Liters Per Minute) to protect the weld area.",
            next: "Start welding process."
        },
        step4_5: {
            now: "Drag the welding torch to the joint area to start welding the plates together.",
            next: "Perform the process on your own."
        },
        step4: {
            now: "Drag the torch and carefully weld the joint.",
            next: "Clean the welded joint."
        },
        step5: {
            now: "Drag the wire brush over the welded joint to remove slag and improve finish.",
            next: "View result."
        }
    };

    let currentStepIndex = 0;
    const totalSteps = steps.length;
    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    function renderApparatusStep() {
        let html = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div id="play-stage" style="width: 100%; padding: 20px;">
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:auto;">
        `;

        for (let i = 0; i < 3; i++) {
            const a = apparatusData[i];
            html += `
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;text-align:center">
                <div class="apparatus-img-box"><img src="${getAssetSrc(a.img)}" alt="${a.name}"></div>
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
                <div class="apparatus-img-box"><img src="${getAssetSrc(a.img)}" alt="${a.name}"></div>
                <h4>${i + 1}. ${a.name}</h4>
                <p>${a.desc}</p>
            </div>`;
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>

        <div class="drag-instructions" style="margin-top:20px">
            ${stepGuidance.apparatus.now}<br>
            Click next to: ${stepGuidance.apparatus.next}
        </div>
        </div>`;

        gifContainer.innerHTML = html;
        if (nextButton) nextButton.disabled = false;
        updateScaling();
        window.addEventListener('resize', updateScaling);
    }

    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage') ||
            document.getElementById('step1-drag-stage') ||
            document.getElementById('step1_5-drag-stage') ||
            document.getElementById('step4-drag-stage') ||
            document.getElementById('drag-stage');

        if (!container || !wrapper || !stage) return;

        wrapper.style.transform = 'scale(1)';

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            if (scale < 1) {
                wrapper.style.transform = `scale(${scale})`;
            }
        }
    }

    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) { }
            cleanupCurrent = null;
        }
        window.removeEventListener('resize', updateScaling);
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

        if (nextButton) nextButton.disabled = true;

        if (step.type === 'apparatus') {
            renderApparatusStep();
        }
        else if (step.id === 'result') {
            document.body.classList.add('result-mode');
            renderResultStep();
        }
        else if (step.id === 'step1') {
            renderStep1DragDrop(step, timestamp);
        } else if (step.id === 'step1_5') {
            renderStep1_5DragDrop(step, timestamp);
        } else if (step.id === 'step4_5') {
            renderStep4_5DragDrop(step, timestamp);
        } else if (step.id === 'step4') {
            renderStep4WeldingSimulation(step, timestamp);
        } else if (step.id === 'step5') {
            renderStep5DragDrop(step, timestamp);
        } else if (isHotspotStep(step)) {
            renderHotspotStep(step, timestamp);
        } else {
            renderAutoplayStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;

        if (step.id !== 'result') {
            document.body.classList.remove('result-mode');
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
            step1_5: { x: 0.434444, y: 0.746667, w: 0.061111, h: 0.108642, instruction: 'Click to attach the ground clamp.' },
            step2: { x: 0.441257, y: 0.573163, w: 0.054645, h: 0.097146, instruction: 'Set current to 60A.' },
            step3: { x: 0.367486, y: 0.014572, w: 0.300546, h: 0.250152, instruction: 'Set sheilding gas flow rate to 10 LPM (liters per minute).' }
        };

        let config = hotspotMap[step.id] || [{ time: 0, x: 0.45, y: 0.45, w: 0.15, h: 0.15, instruction: 'Click to continue.' }];
        if (!Array.isArray(config)) {
            config = [{ ...config, time: 0 }];
        }
        const substeps = config.map(c => ({ ...c, done: false }));
        let currentSubIndex = 0;

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" preload="auto" playsinline muted></video>
                            <button id="play-hotspot" class="play-hotspot ${step.id === 'step3' ? 'step3-arrow' : ''}" style="visibility:hidden; ${step.id === 'step3' ? '--arrow-top: 10%; --arrow-left: -20%; --arrow-width: auto; --arrow-transform: translateX(-50%); --arrow-content: \'➡\';' : ''}"></button>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        function layoutHotspot(cfg) {
            if (!cfg) return;
            const rect = { width: stage.offsetWidth, height: stage.offsetHeight };
            hotspot.style.left = (rect.width * cfg.x) + 'px';
            hotspot.style.top = (rect.height * cfg.y) + 'px';
            hotspot.style.width = (rect.width * cfg.w) + 'px';
            hotspot.style.height = (rect.height * cfg.h) + 'px';
        }

        function showHotspot(substep) {
            instructionElem.textContent = substep.instruction;
            layoutHotspot(substep);
            hotspot.style.visibility = 'visible';
            hotspot.classList.add('debug-highlight');
        }

        function checkPause() {
            if (currentSubIndex >= substeps.length) return;
            const sub = substeps[currentSubIndex];
            if (!sub.done && video.currentTime >= sub.time && !video.paused) {
                video.pause();
                showHotspot(sub);
            }
        }

        video.addEventListener('loadedmetadata', () => {
            layoutHotspot(substeps[currentSubIndex]);
            updateScaling();
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
            hotspot.style.visibility = 'hidden';
            substeps[currentSubIndex].done = true;
            currentSubIndex++;

            if (currentSubIndex >= substeps.length) {
                setHotspotDone(step.id);
                instructionElem.textContent = '  ';
            } else {
                instructionElem.textContent = 'Aligning...';
            }
            video.play().catch(() => { });
        });

        video.addEventListener('ended', () => {
            if (currentSubIndex >= substeps.length) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
                if (nextButton) nextButton.disabled = false;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
        }, { once: true });

        window.addEventListener('resize', () => {
            if (currentSubIndex < substeps.length) layoutHotspot(substeps[currentSubIndex]);
            updateScaling();
        });

        cleanupCurrent = function () {
            try {
                video.removeEventListener('timeupdate', checkPause);
            } catch (_) { }
        };
    }

    function renderAutoplayStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" playsinline muted></video>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('step-video');
        const instructionElem = document.getElementById('play-instruction');

        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : '';

        video.addEventListener('loadedmetadata', () => {
            updateScaling();
            video.play().catch(() => { });
        }, { once: true });
        window.addEventListener('resize', updateScaling);

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            }
            if (nextButton) nextButton.disabled = false;
        }, { once: true });

        cleanupCurrent = function () {
            try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) { }
        };
    }

    function renderStep1DragDrop(step, timestamp) {
        const videoSrc = 'images/simulation/1.mp4';
        const bgPath = 'images/simulation/1.png';
        const toolPath = 'images/simulation/1-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step1-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 20;"/>
                            <div id="step1-drop-zone" class="drop-zone" style="--arrow-top: -150%; --arrow-left: 225%;"></div>
                        </div>

                        <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step1-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted></video>
                        </div>
                    </div>
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

        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Drag the tool.";

        const targetRel = { x: 0.5, y: 0.5 };
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

        setTimeout(() => {
            setDropZoneLayout();
            updateScaling();
        }, 50);
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
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
                dropZone.style.display = 'none';
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false;
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

    function renderStep1_5DragDrop(step, timestamp) {
        const bgPath = 'images/simulation/1.5.png';
        const toolPath = 'images/simulation/1.5-tool.png';
        const finalPath = 'images/simulation/1.5.2.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step1_5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" id="step1_5-bg" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-1_5" class="draggable" style="position: absolute; width: 12%; top: 10%; right: 10%; cursor: grab; z-index: 20;"/>
                            <div id="step1_5-drop-zone" class="drop-zone" style="--arrow-top: -430%; --arrow-left: 385%;"></div>
                        </div>
                    </div>
                </div>

                <div id="step1_5-instruction" class="drag-instructions"></div>
            </div>
        `;

        const dragStage = document.getElementById('step1_5-drag-stage');
        const bgImg = document.getElementById('step1_5-bg');
        const tool = document.getElementById('draggable-tool-1_5');
        const dropZone = document.getElementById('step1_5-drop-zone');
        const instructionElem = document.getElementById('step1_5-instruction');

        instructionElem.textContent = "Drag the ground clamp to the workpiece.";

        const targetRel = { x: 0.465, y: 0.801 };
        const tolerancePx = 100;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            if (rect.width === 0) return;

            const w = rect.width * 0.10;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;

            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        setTimeout(() => { setDropZoneLayout(); updateScaling(); }, 50);
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
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
                tool.style.display = 'none';
                dropZone.style.display = 'none';
                bgImg.src = formatSrc(finalPath, timestamp);

                if (stepGuidance[step.id]) {
                    instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
                } else {
                    instructionElem.textContent = 'Step complete.';
                }

                if (nextButton) nextButton.disabled = false;

                try {
                    window.removeEventListener('mousemove', onPointerMove);
                    window.removeEventListener('touchmove', onPointerMove);
                    window.removeEventListener('mouseup', onPointerUp);
                    window.removeEventListener('touchend', onPointerUp);
                } catch (_) { }
            }
        }

        tool.addEventListener('mousedown', onPointerDown);
        tool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        cleanupCurrent = function () {
            try {
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
                window.removeEventListener('resize', setDropZoneLayout);
            } catch (_) { }
        };
    }

    function renderStep4_5DragDrop(step, timestamp) {
        const videoSrc = 'images/simulation/4.mp4';
        const bgPath = 'images/simulation/4.png';
        const toolPath = 'images/simulation/4-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step4-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-4" class="draggable" style="position: absolute; width: 25%; top: 10%; right: 10%; cursor: grab; z-index: 20;"/>
                            <div id="step4-drop-zone" class="drop-zone" style="--arrow-top: -10%; --arrow-left: 345%;"></div>
                        </div>

                        <div class="play-stage" id="step4-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step4-video" src="${formatSrc(videoSrc, timestamp)}" playsinline></video>
                        </div>
                    </div>
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

        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Start welding.";

        const targetRel = { x: 0.28, y: 0.27 };
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

        setTimeout(() => { setDropZoneLayout(); updateScaling(); }, 50);
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
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
                dropZone.style.display = 'none';
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

            instructionElem.textContent = "Observe the welding process.";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false;
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

    function renderStep4WeldingSimulation(step, timestamp) {
        const bgPath   = 'images/simulation/4.png';
        const toolPath = 'images/simulation/4-tool.png';

        const WELD_START     = { x: 0.29, y: 0.28 };
        const WELD_END       = { x: 0.7,  y: 0.7  };
        const WELD_HALF_W    = 0.008;
        const WELD_TOLERANCE = 0.02;
        const NUM_SEGMENTS   = 80;
        const HOT_DURATION   = 900;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div id="step4-weld-stage" style="position:relative; width:100%; display:inline-block; line-height:0;">
                            <img id="step4-bg" src="${formatSrc(bgPath, timestamp)}"
                                 style="width:100%; height:auto; display:block; pointer-events:none; user-select:none;"/>

                            <svg id="step4-weld-svg"
                                 style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible;">
                                <defs>
                                    <filter id="weld-glow" x="-80%" y="-80%" width="260%" height="260%">
                                        <feGaussianBlur stdDeviation="4" result="blur"/>
                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <filter id="bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="#00000088"/>
                                    </filter>
                                </defs>
                                <g id="step4-bead-group"></g>
                                <circle id="step4-arc-glow" cx="-999" cy="-999" r="14"
                                        fill="#ffe566" filter="url(#weld-glow)" opacity="0"/>
                            </svg>

                            <canvas id="step4-spark-canvas"
                                    style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></canvas>

                            <img id="step4-torch" src="${formatSrc(toolPath, timestamp)}"
                                 style="position:absolute; width:22%; top:8%; right:5%;
                                        cursor:grab; z-index:30; user-select:none; touch-action:none;"
                                 draggable="false"/>
                        </div>
                    </div>
                </div>

                <div style="margin-top:10px; padding:0 4px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:13px; color:#555; white-space:nowrap;">Weld Progress:</span>
                        <div style="flex:1; height:12px; background:#ddd; border-radius:6px; overflow:hidden;">
                            <div id="step4-progress-bar"
                                 style="height:100%; width:0%; background:linear-gradient(90deg,#ff6600,#ffcc00);
                                        border-radius:6px; transition:width 0.15s linear;"></div>
                        </div>
                        <span id="step4-progress-text"
                              style="font-size:13px; color:#555; width:36px; text-align:right;">0%</span>
                    </div>
                </div>

                <div id="step4-instruction" class="drag-instructions">
                    ${stepGuidance[step.id] ? stepGuidance[step.id].now : 'Drag the welding torch over the joint to weld the plates together.'}
                </div>
            </div>
        `;

        setTimeout(() => { updateScaling(); }, 50);
        window.addEventListener('resize', updateScaling);

        const stage       = document.getElementById('step4-weld-stage');
        const bgImg       = document.getElementById('step4-bg');
        const torch       = document.getElementById('step4-torch');
        const sparkCanvas = document.getElementById('step4-spark-canvas');
        const beadGroup   = document.getElementById('step4-bead-group');
        const arcGlow     = document.getElementById('step4-arc-glow');
        const progressBar = document.getElementById('step4-progress-bar');
        const progressTxt = document.getElementById('step4-progress-text');
        const hint        = document.getElementById('step4-hint');
        const instructionElem = document.getElementById('step4-instruction');
        const ctx         = sparkCanvas.getContext('2d');

        const weldedAt = new Array(NUM_SEGMENTS).fill(null);
        let totalWelded = 0;
        let sparks      = [];
        let dragging    = false;
        let startX = 0, startY = 0;
        let animFrame   = null;
        let completed   = false;

        const weldingAudio = new Audio(formatSrc('images/simulation/4.mp3', timestamp));
        weldingAudio.preload = "auto";
        weldingAudio.loop = true;
        weldingAudio.volume = 0.75;
        weldingAudio.playbackRate = 1.1;
        let isAudioPlaying = false;

        function syncCanvasSize() {
            sparkCanvas.width  = stage.offsetWidth;
            sparkCanvas.height = stage.offsetHeight;
        }
        bgImg.addEventListener('load', () => { syncCanvasSize(); updateScaling(); });
        if (bgImg.complete) syncCanvasSize();

        function getSegmentUnderTip(tipX, tipY) {
            const ax = WELD_START.x, ay = WELD_START.y;
            const bx = WELD_END.x,   by = WELD_END.y;
            const dx = bx - ax, dy = by - ay;
            const lenSq = dx * dx + dy * dy;
            const t = Math.max(0, Math.min(1, ((tipX - ax) * dx + (tipY - ay) * dy) / lenSq));
            const closestX = ax + t * dx;
            const closestY = ay + t * dy;
            const dist = Math.hypot(tipX - closestX, tipY - closestY);
            if (dist > WELD_TOLERANCE) return null;
            return Math.min(NUM_SEGMENTS - 1, Math.floor(t * NUM_SEGMENTS));
        }

        function redrawBead() {
            const W = stage.offsetWidth, H = stage.offsetHeight;
            const sx = WELD_START.x * W, sy = WELD_START.y * H;
            const ex = WELD_END.x   * W, ey = WELD_END.y   * H;
            const dx = ex - sx, dy = ey - sy;
            const totalLen = Math.hypot(dx, dy) || 1;
            const ux = dx / totalLen, uy = dy / totalLen;

            const scR  = WELD_HALF_W * W;
            const step = totalLen / NUM_SEGMENTS;
            const scallopsPerSeg = Math.max(1, Math.floor(step / (scR * 1.4)));

            const now = Date.now();
            beadGroup.innerHTML = '';

            for (let seg = 0; seg < NUM_SEGMENTS; seg++) {
                if (weldedAt[seg] === null) continue;

                const age     = now - weldedAt[seg];
                const isHot   = age < HOT_DURATION;
                const hotFrac = isHot ? 1 - age / HOT_DURATION : 0;

                for (let sc = 0; sc < scallopsPerSeg; sc++) {
                    const t  = (seg + (sc + 0.5) / scallopsPerSeg) * step;
                    const cx = sx + ux * t;
                    const cy = sy + uy * t;

                    let fill;
                    if (hotFrac > 0.7) {
                        fill = '#ffcc00';
                    } else if (hotFrac > 0.3) {
                        fill = `rgb(${Math.floor(180 + hotFrac * 75)},${Math.floor(hotFrac * 120)},0)`;
                    } else {
                        const shade = 50 + (seg % 2) * 16;
                        fill = `rgb(${shade},${shade - 6},${shade - 12})`;
                    }

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', cx);
                    circle.setAttribute('cy', cy);
                    circle.setAttribute('r',  scR);
                    circle.setAttribute('fill', fill);
                    circle.setAttribute('filter', 'url(#bead-shadow)');
                    circle.setAttribute('opacity', '0.93');
                    beadGroup.appendChild(circle);
                }
            }
        }

        function getClient(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        function onPointerDown(e) {
            if (completed) return;
            dragging = true;
            torch.style.cursor = 'grabbing';
            const r = torch.getBoundingClientRect();
            const c = getClient(e);
            startX = c.x - r.left;
            startY = c.y - r.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = stage.getBoundingClientRect();
            const torchRect = torch.getBoundingClientRect();
            const c = getClient(e);
            const W = stageRect.width, H = stageRect.height;

            let newLeft = c.x - stageRect.left - startX;
            let newTop  = c.y - stageRect.top  - startY;
            newLeft = Math.max(0, Math.min(newLeft, W - torchRect.width));
            newTop  = Math.max(0, Math.min(newTop,  H - torchRect.height));

            torch.style.left  = newLeft + 'px';
            torch.style.top   = newTop  + 'px';
            torch.style.right = 'auto';

            const tipX = (newLeft + torchRect.width  * 0.15) / W;
            const tipY = (newTop  + torchRect.height * 0.8)  / H;

            const seg = getSegmentUnderTip(tipX, tipY);

            if (seg !== null && !completed) {
                if (!isAudioPlaying) {
                    weldingAudio.currentTime = 0;
                    weldingAudio.play().catch(() => { });
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

        function onPointerUp() {
            dragging = false;
            torch.style.cursor = 'grab';
            arcGlow.setAttribute('opacity', '0');

            if (isAudioPlaying) {
                weldingAudio.pause();
                isAudioPlaying = false;
            }
        }

        function emitSparks(px, py, stageRect) {
            const scaleX = sparkCanvas.width  / stageRect.width;
            const scaleY = sparkCanvas.height / stageRect.height;
            const cx = px * scaleX, cy = py * scaleY;
            for (let i = 0; i < 7; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 6;
                sparks.push({
                    x: cx, y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    life: 18 + Math.random() * 14,
                    maxLife: 32,
                    r: 1 + Math.random() * 2,
                    color: Math.random() < 0.6
                        ? `rgb(255,${Math.floor(160 + Math.random() * 95)},0)`
                        : `rgb(255,255,${Math.floor(Math.random() * 120)})`
                });
            }
        }

        function animateLoop() {
            ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                const alpha = s.life / s.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle   = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = s.color;
                ctx.lineWidth   = s.r * 0.5;
                ctx.globalAlpha = alpha * 0.4;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
                ctx.stroke();
                s.x += s.vx; s.y += s.vy;
                s.vy += 0.25; s.vx *= 0.96;
                s.life--;
                if (s.life <= 0) sparks.splice(i, 1);
            }
            ctx.globalAlpha = 1;

            const hasHot = weldedAt.some(t => t !== null && Date.now() - t < HOT_DURATION);
            if (hasHot) redrawBead();

            animFrame = requestAnimationFrame(animateLoop);
        }
        animFrame = requestAnimationFrame(animateLoop);

        function finishWeld() {
            completed = true;
            if (isAudioPlaying) {
                weldingAudio.pause();
                isAudioPlaying = false;
            }
            arcGlow.setAttribute('opacity', '0');
            redrawBead();
            progressBar.style.background = '#4CAF50';
            progressBar.style.width = '100%';
            progressTxt.textContent = '100%';
            instructionElem.innerHTML = "<b>Step complete.</b> Click next to: " + stepGuidance["step4"].next;
            if (nextButton) nextButton.disabled = false;
        }

        torch.addEventListener('mousedown',  onPointerDown);
        torch.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('mouseup',   onPointerUp);
        window.addEventListener('touchend',  onPointerUp);

        cleanupCurrent = function () {
            try {
                if (weldingAudio) {
                    weldingAudio.pause();
                    weldingAudio.currentTime = 0;
                }
                window.removeEventListener('mousemove',  onPointerMove);
                window.removeEventListener('touchmove',  onPointerMove);
                window.removeEventListener('mouseup',    onPointerUp);
                window.removeEventListener('touchend',   onPointerUp);
                window.removeEventListener('resize',     updateScaling);
                cancelAnimationFrame(animFrame);
            } catch (_) { }
        };
    }

    function renderStep5DragDrop(step, timestamp) {
        const videoSrc = 'images/simulation/5.mp4';
        const bgPath = 'images/simulation/5.png';
        const toolPath = 'images/simulation/1-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-5" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 20;"/>
                            <div id="step5-drop-zone" class="drop-zone" style="--arrow-top: -140%; --arrow-left: 255%;"></div>
                        </div>

                        <div class="play-stage" id="step5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step5-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted></video>
                        </div>
                    </div>
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

        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Drag the tool.";

        const targetRel = { x: 0.47, y: 0.5 };
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

        setTimeout(() => { setDropZoneLayout(); updateScaling(); }, 50);
        window.addEventListener('resize', () => { setDropZoneLayout(); updateScaling(); });

        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            tool.style.cursor = 'grabbing';
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
                dropZone.style.display = 'none';
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
            if (nextButton) nextButton.disabled = false;
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

    function renderResultStep() {
        gifContainer.innerHTML = `
        <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
            <h2 style="text-align:center;">Experiment Result</h2>\n            <p style="text-align:center; margin-top:10px;"><b>Aim:</b> To study the welding of stainless-steel specimens using Tungsten Inert Gas (TIG) welding and understand the associated techniques, equipment, and weld quality parameters.</p>

            <hr>

            <div class="sim-media-container" style="height: auto; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="text-align:center; width: 100%;">
                    <img src="${getAssetSrc('images/simulation/result.png')}"
                         alt="Final Welded Joint"
                         style="max-width:55%; border:1px solid #ccc; border-radius:6px;">
                    <p style="font-size:14px; margin-top:6px;">Final welded joint after cleaning</p>
                </div>
            </div>

            <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family:sans-serif;">
                <tbody>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background:#f0f0f0;">
                            Welding Parameters
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Process</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Gas Tungsten Arc Welding (GTAW / TIG)</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Workpiece Material</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Stainless Steel</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Current</td>
                        <td style="border:1px solid #000; padding:10px 15px;">60 Amperes (60 A)</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Filler Material</td>
                        <td style="border:1px solid #000; padding:10px 15px;">ER308L</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background:#f0f0f0;">
                            Shielding Gas Settings
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Shielding Gas</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Argon</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Gas Flow Rate</td>
                        <td style="border:1px solid #000; padding:10px 15px;">10 LPM (liters per minute)</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background:#f0f0f0;">
                            Welding Operation Parameters
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Gun Travel Speed</td>
                        <td style="border:1px solid #000; padding:10px 15px;">2.5 mm/s</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background:#f0f0f0;">
                            Result
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Joint Quality</td>
                        <td style="border:1px solid #000; padding:10px 15px;">High-quality, clean weld</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Dressing</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Slag removed, smooth finish</td>
                    </tr>
                </tbody>
            </table>

            <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                <button onclick="window.print()"
                        style="padding:12px 24px; font-size:16px; cursor:pointer; background-color:#007bff; color:white; border:none; border-radius:6px;">
                    🖨 Print Results
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
            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
    }

    preloadAssets();
});
