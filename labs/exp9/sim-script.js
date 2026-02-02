document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E6 script loaded');

    /* ---------------- CSS ---------------- */
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

    /* ---------------- DOM ---------------- */
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    /* ---------------- HOTSPOTS ---------------- */
    const hotspotSteps = new Set(['step0', 'step2', 'step3']);
    const hotspotCompleted = { step0: false, step1_5: false, step2: false, step3: false };

    /* ---------------- APPARATUS DATA ---------------- */
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

    /* ---------------- ASSET PRELOADING ---------------- */
    const assetList = [
        // Apparatus
        "images/simulation/apparatus/brush.png",
        "images/simulation/apparatus/cylinder.png",
        "images/simulation/apparatus/plates.png",
        "images/simulation/apparatus/machine.png",
        "images/simulation/apparatus/torch.png",
        "images/simulation/apparatus/CLIP.png",

        // Step 0
        "images/simulation/0.5.mp4",

        // Step 1
        "images/simulation/1.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",

        // Step 1.5
        "images/simulation/1.5.mp4",
        "images/simulation/1.5.png",
        "images/simulation/1.5-tool.png",
        "images/simulation/1.5.2.png",

        // Step 2
        "images/simulation/2.mp4",

        // Step 3
        "images/simulation/3.mp4",

        // Step 4
        "images/simulation/4.mp4",
        "images/simulation/4.png",
        "images/simulation/4-tool.png",

        // Step 5
        "images/simulation/5.mp4",
        "images/simulation/5.png",
        // Note: Step 5 reuses 1-tool.png which is already listed 

        // Result
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


    /* ---------------- STEPS ---------------- */
    const steps = [
        { id: 'apparatus', title: 'Apparatus Used', type: 'apparatus' },
        { id: 'step0', title: 'Align the plates', src: 'images/simulation/0.5.mp4', type: 'video' },
        { id: 'step1', title: 'Clean workpiece using wire brush', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Set current', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step1_5', title: 'Attaching the ground clamp', src: 'images/simulation/1.5.mp4', type: 'video' },
        { id: 'step3', title: 'Setup shielding gas', src: 'images/simulation/3.mp4', type: 'video' },
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

        step4: {
            now: "Drag the welding torch to the joint area to start welding the plates together.",
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

        <div class="drag-instructions" style="margin-top:20px">
            ${stepGuidance.apparatus.now}<br>
            Click next to: ${stepGuidance.apparatus.next}
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
        else if (step.id === 'result') {
            document.body.classList.add('result-mode');
            renderResultStep();
        }
        else if (step.id === 'step1') {
            renderStep1DragDrop(step, timestamp);
        } else if (step.id === 'step1_5') {
            renderStep1_5DragDrop(step, timestamp);
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

        if (step.id !== 'result') {
            document.body.classList.remove('result-mode');
        }
        // if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1) || !isHotspotDone(step);
        if (nextButton) {
            nextButton.disabled =
                (currentStepIndex === totalSteps - 1);
            // || !isHotspotDone(step);
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
                    <video id="step-video" src="${formatSrc(step.src, timestamp)}" style="width:100%;height:100%;" preload="auto" playsinline muted></video>
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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
                    <video id="step-video" src="${formatSrc(step.src, timestamp)}" style="width:100%;height:100%;" playsinline muted></video>
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step1-drop-zone" class="drop-zone"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step1-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:100%;" playsinline muted></video>
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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

    function renderStep1_5DragDrop(step, timestamp) {
        if (nextButton) nextButton.disabled = true;

        const bgPath = 'images/simulation/1.5.png';
        const toolPath = 'images/simulation/1.5-tool.png';
        const finalPath = 'images/simulation/1.5.2.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="drag-stage" id="step1_5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${formatSrc(bgPath, timestamp)}" id="step1_5-bg" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-1_5" class="draggable" style="position: absolute; width: 12%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step1_5-drop-zone" class="drop-zone"></div>
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

        // Hotspot target relative coordinates
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
                // Success
                tool.style.display = 'none';
                dropZone.style.display = 'none';
                bgImg.src = formatSrc(finalPath, timestamp);

                if (stepGuidance[step.id]) {
                    instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
                } else {
                    instructionElem.textContent = 'Step complete.';
                }

                if (nextButton) nextButton.disabled = false;

                // Cleanup events since we are done interacting
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

    function renderStep4DragDrop(step, timestamp) {
        if (nextButton) nextButton.disabled = false;

        const videoSrc = 'images/simulation/4.mp4';
        const bgPath = 'images/simulation/4.png';
        const toolPath = 'images/simulation/4-tool.png'; // Assuming 4-tool.png exists

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step4-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-4" class="draggable" style="position: absolute; width: 25%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step4-drop-zone" class="drop-zone"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step4-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step4-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:100%;" playsinline></video>
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

        const targetRel = { x: 0.28, y: 0.27 }; // Center target for now
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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
        if (nextButton) nextButton.disabled = false;

        const videoSrc = 'images/simulation/5.mp4';
        const bgPath = 'images/simulation/5.png'; // Reusing 1.png as per "copy step 1" request
        const toolPath = 'images/simulation/1-tool.png'; // Reusing 1-tool.png

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                    <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"/>
                    <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-5" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 10;"/>
                    <div id="step5-drop-zone" class="drop-zone"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step5-video" src="${formatSrc(videoSrc, timestamp)}" style="width:100%; height:100%;" playsinline muted></video>
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

        const targetRel = { x: 0.47, y: 0.5 }; // Center target
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
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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

    function renderResultStep() {
    gifContainer.innerHTML = `
        <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
            <h2 style="text-align:center;">Experiment Result</h2>
            <hr>

            <div style="text-align:center; margin:20px 0;">
                <img src="${getAssetSrc('images/simulation/result.png')}" 
                     alt="Final Welded Joint" 
                     style="max-width:55%; border:1px solid #ccc; border-radius:6px;">
                <p style="font-size:14px; margin-top:6px;">Final welded joint after cleaning</p>
            </div>

            <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family:sans-serif;">
                <tbody>

                    <!-- Welding Parameters -->
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

                    <!-- Shielding Gas Settings -->
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

                    <!-- Welding Operation Parameters -->
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background:#f0f0f0;">
                            Welding Operation Parameters
                        </td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Gun Travel Speed</td>
                        <td style="border:1px solid #000; padding:10px 15px;">2.5 mm/s</td>
                    </tr>

                    <!-- Result -->
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
            const step = steps[currentStepIndex];

            // if (!isHotspotDone(step)) return;

            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
    }

    preloadAssets();

});
