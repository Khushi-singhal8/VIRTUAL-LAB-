document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E6 script loaded');

    /* ---------------- CSS ---------------- */
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

    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage') || document.querySelector('.drag-stage') || document.querySelector('.gif-wrapper');

        if (!container || !wrapper || !stage) return;

        // Reset scale for measurement
        wrapper.style.transform = 'scale(1)';
        wrapper.style.marginTop = '0px';

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            // Always set transform origin to center
            wrapper.style.transformOrigin = 'center center';

            if (scale < 1) {
                // Just scale, flexbox handles centering
                wrapper.style.transform = `scale(${scale})`;
            } else {
                wrapper.style.transform = 'scale(1)';
            }
        }
    }

    const hotspotSteps = new Set(['step0', 'step2', 'step3', 'step4']);
    const hotspotCompleted = { step0: false, step2: false, step3: false };

    /* ---------------- ASSET PRELOADING ---------------- */
    const assetList = [
        // Apparatus
        "images/simulation/apparatus/brush.png",
        "images/simulation/apparatus/cylinder.png",
        "images/simulation/apparatus/plates.png",
        "images/simulation/apparatus/machine.png",
        "images/simulation/apparatus/torch.png",
        "images/simulation/apparatus/clip.png",
        "images/simulation/apparatus/wire.png",

        // Steps
        "images/simulation/0.5.mp4",
        "images/simulation/1.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",
        "images/simulation/2.mp4",
        "images/simulation/3.mp4",
        "images/simulation/4.mp4",
        "images/simulation/1.5.mp4",
        "images/simulation/1.5.png",
        "images/simulation/1.5-tool.png",
        "images/simulation/1.5.2.png",
        "images/simulation/5.mp4",
        "images/simulation/5.png",
        "images/simulation/5-tool.png",
        "images/simulation/6.mp4",
        "images/simulation/6.png",

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
            desc: "Supplies shielding gas (CO2/Argon mix) to protect the weld pool from atmospheric contamination."
        },
        {
            name: "Workpiece",
            img: "images/simulation/apparatus/plates.png",
            desc: "Metal workpieces that are joined together during the welding process."
        },
        {
            name: "Welding Machine",
            img: "images/simulation/apparatus/machine.png",
            desc: "Supplies and controls the electrical voltage and wire feed for MIG welding."
        },
        {
            name: "Welding Torch",
            img: "images/simulation/apparatus/torch.png",
            desc: "Handheld, trigger-activated tool that delivers continuous consumable wire electrode, shielding gas, and electrical current to the weld pool."
        },
        {
            name: "Ground Clamp",
            img: "images/simulation/apparatus/clip.png",
            desc: "Used to complete the electrical circuit by connecting the workpiece to the welding machine."
        }
    ];

    const steps = [
        { id: 'apparatus', title: 'Apparatus Used', type: 'apparatus' },
        { id: 'step0', title: 'Align the plates', src: 'images/simulation/0.5.mp4', type: 'video' },
        { id: 'step1', title: 'Clean workpiece', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step3', title: 'Adjust voltage and wire feed rate', src: 'images/simulation/3.mp4', type: 'video' },
        { id: 'step1_5', title: 'Attaching the ground clamp', src: 'images/simulation/1.5.mp4', type: 'video' },
        { id: 'step2', title: 'Turn on shielding gas', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step4', title: 'Extrude the electrode wire', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step5_1', title: 'Welding simulation', src: 'images/simulation/5.mp4', type: 'video' },
        { id: 'step5', title: 'Welding process', src: 'images/simulation/5.mp4', type: 'video' },
        { id: 'step6', title: 'Clean the weld to remove slag', src: 'images/simulation/6.mp4', type: 'video' },
        { id: 'result', title: 'Observation & Result', type: 'result' }
    ];

    let currentStepIndex = 0;
    const totalSteps = steps.length;

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
            next: "Adjust voltage and wire feed."
        },
        step1_5: {
            now: "Attach ground clamp to the workpiece to complete the electrical circuit.",
            next: "Adjust shielding gas flow rate."
        },
        step2: {
            now: "Click to turn on the shielding gas to protect the weld area.",
            next: "Extrude the electrode wire."
        },
        step3: {
            now: "Click to adjust the voltage controls for the welding process.",
            next: "Attach ground clamp."
        },
        step4: {
            now: "Click to extrude the electrode wire.",
            next: "Begin the welding process."
        },
        step5_1: {
            now: "Drag the welding torch to the joint area to start welding the plates together.",
            next: "simulate the welding process."
        },
        step5: {
            now: "This is a simulation of the welding process. Observe how the weld pool forms and solidifies.",
            next: "Clean the weld."
        },
        step6: {
            now: "Drag the wire brush over the welded joint to remove slag and improve finish.",
            next: "View result."
        }
    };

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

    /* ---------------- APPARATUS RENDER ---------------- */
    function renderApparatusStep() {
        let apparatusHtml = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:auto;">
        `;

        for (let i = 0; i < 3; i++) {
            const a = apparatusData[i];
            apparatusHtml += `
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;text-align:center">
                <div class="apparatus-img-box"><img src="${getAssetSrc(a.img)}" alt="${a.name}"></div>
                <h4>${i + 1}. ${a.name}</h4>
                <p>${a.desc}</p>
            </div>`;
        }
        apparatusHtml += `</div>

        <div style="display:flex;justify-content:center;gap:20px;margin-top:20px;">`;

        for (let i = 3; i < apparatusData.length; i++) {
            const a = apparatusData[i];
            apparatusHtml += `
            <div style="width:280px;background:#f5f5f5;padding:15px;border-radius:12px;text-align:center">
                <div class="apparatus-img-box"><img src="${getAssetSrc(a.img)}" alt="${a.name}"></div>
                <h4>${i + 1}. ${a.name}</h4>
                <p>${a.desc}</p>
            </div>`;
        }
        apparatusHtml += `</div>`;

        gifContainer.innerHTML = `
        <div class="gif-wrapper" style="width: 100%; height: 100%;">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div id="play-stage" style="width: 100%; padding: 20px; box-sizing: border-box;">
                        ${apparatusHtml}
                    </div>
                </div>
            </div>

            <div class="drag-instructions" style="margin-top:20px">
                ${stepGuidance.apparatus.now}<br>
                Click next to: ${stepGuidance.apparatus.next}
            </div>
        </div>`;

        // Initial scaling
        setTimeout(updateScaling, 50);
        window.addEventListener('resize', updateScaling);
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
                <p style="font-size:14px; margin-top:6px;">
                    Final welded joint after cleaning
                </p>
            </div>

            <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family: sans-serif">
                <tbody>

                    <!-- Welding Parameters -->
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">
                            Welding Parameters
                        </td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Process</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Gas Metal Arc Welding (GMAW / MIG)</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Workpiece Material</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Mild Steel</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Welding Voltage</td>
                        <td style="border:1px solid #000; padding:10px 15px;">22 V</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">MIG Wire Type</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Solid Wire</td>
                    </tr>

                    <!-- Wire & Gas Settings -->
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">
                            Wire Feed & Gas Settings
                        </td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Wire Feed Rate</td>
                        <td style="border:1px solid #000; padding:10px 15px;">80 mm/s</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Shielding Gas</td>
                        <td style="border:1px solid #000; padding:10px 15px;">75% Argon + 25% CO₂</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Gas Flow Rate</td>
                        <td style="border:1px solid #000; padding:10px 15px;">10 LPM</td>
                    </tr>

                    <!-- Result -->
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">
                            Result
                        </td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Joint Quality</td>
                        <td style="border:1px solid #000; padding:10px 15px;">High-quality, uniform weld bead</td>
                    </tr>

                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Finish</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Slag removed, smooth surface</td>
                    </tr>

                </tbody>
            </table>

            <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                <button onclick="window.print()" 
                        style="padding:10px 20px; font-size:16px; cursor:pointer; background-color:#2196F3; color:white; border:none; border-radius:4px;">
                    🖨 Print Results
                </button>
            </div>
        </div>
    `;
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
        } else if (step.id === 'step5_1') {
            renderStep5_1DragDrop(step, timestamp);
        }
         else if (step.id === 'step5') {
            renderStep5DragDrop(step, timestamp);
        } else if (step.id === 'step6') {

            renderStep6DragDrop(step, timestamp);
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
        // TEMPORARY: Always enable next button
        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        // if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1) || !isHotspotDone(step);

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
            step2: { x: 0.330000, y: 0.043457, w: 0.362222, h: 0.242963, instruction: 'Set pressure of shielding gas to 10 LPM (liters per minute).' },
            step3: [
                { time: 0, x: 0.445556, y: 0.647901, w: 0.044444, h: 0.079012, instruction: 'Click on the yellow knob to set the voltage to 22V.' },
                { time: 2.5, x: 0.445556, y: 0.719012, w: 0.044444, h: 0.079012, instruction: 'Click on the red knob to set the wire feed rate to 80mm/s.' }
            ],
            step4: { x: 0.8229934406678593, y: 0.44188458367683425, w: 0.12908517590936197, h: 0.14415564715581206, instruction: 'Press button to release electrode.' }
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
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" preload="auto" playsinline muted style="width: 100%; display: block;"></video>
                            <button id="play-hotspot" class="play-hotspot ${step.id === 'step2' ? 'step2-arrow' : ''}" style="visibility:hidden; ${step.id === 'step2' ? '--arrow-top: 10%; --arrow-left: -20%; --arrow-width: auto; --arrow-transform: translateX(-50%); --arrow-content: \'➡\';' : ''}"></button>
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
            const rect = stage.getBoundingClientRect();
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
            // Handle start-of-video hotspot
            if (currentSubIndex < substeps.length && substeps[currentSubIndex].time <= 0.1) {
                video.currentTime = 0.01;
                video.pause();
                showHotspot(substeps[currentSubIndex]);
            } else {
                video.play().catch(() => { });
            }
            updateScaling();
        }, { once: true });

        video.addEventListener('timeupdate', checkPause);

        hotspot.addEventListener('click', () => {
            hotspot.style.visibility = 'hidden';
            substeps[currentSubIndex].done = true;
            currentSubIndex++;

            if (currentSubIndex >= substeps.length) {
                setHotspotDone(step.id);
                instructionElem.textContent = '  ';
                if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
            } else {
                instructionElem.textContent = '';
            }
            video.play().catch(() => { });
        });

        video.addEventListener('ended', () => {
            if (currentSubIndex >= substeps.length) {
                if (stepGuidance[step.id]) {
                    instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
                } else {
                    instructionElem.textContent = 'Step complete.';
                }
            } else {
                instructionElem.textContent = 'Step complete.';
            }
        }, { once: true });

        window.addEventListener('resize', () => {
            if (currentSubIndex < substeps.length) layoutHotspot(substeps[currentSubIndex]);
            updateScaling();
        });
        updateScaling();

        cleanupCurrent = function () {
            try {
                video.removeEventListener('timeupdate', checkPause);
            } catch (_) { }
        };
    }

    function renderAutoplayStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" playsinline muted style="width: 100%; display: block;"></video>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('step-video');
        const instructionElem = document.getElementById('play-instruction');

        // Initial instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : '';

        video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => { });
            updateScaling();
        }, { once: true });

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            }
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        window.addEventListener('resize', updateScaling);
        updateScaling();

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
                        <!-- Drag Phase -->
                        <div class="drag-stage" id="step1-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: auto; display: block; pointer-events: none;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 20;"/>
                            <div id="step1-drop-zone" class="drop-zone" style="--arrow-top: -150%; --arrow-left: 225%;"></div>
                        </div>

                        <!-- Video Phase -->
                        <div class="play-stage" id="step1-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step1-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted style="width: 100%; display: block;"></video>
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
            updateScaling();
        }

        // Delay slightly to ensure layout
        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        // Drag Logic
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
            // Cleanup drag
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

    function renderStep6DragDrop(step, timestamp) {
        const videoSrc = 'images/simulation/6.mp4';
        const bgPath = 'images/simulation/6.png';
        const toolPath = 'images/simulation/1-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <!-- Drag Phase -->
                        <div class="drag-stage" id="step6-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: auto; display: block; pointer-events: none;" alt="Welded workpiece"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-6" class="draggable" style="position: absolute; width: 20%; top: 10%; right: 10%; cursor: grab; z-index: 20;" alt="Wire brush"/>
                            <div id="step6-drop-zone" class="drop-zone" style="--arrow-top: -140%; --arrow-left: 255%;"></div>
                        </div>

                        <!-- Video Phase -->
                        <div class="play-stage" id="step6-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step6-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted style="width: 100%; display: block;"></video>
                        </div>
                    </div>
                </div>
                
                <div id="step6-instruction" class="drag-instructions"></div>
            </div>
        `;

        const dragStage = document.getElementById('step6-drag-stage');
        const tool = document.getElementById('draggable-tool-6');
        const dropZone = document.getElementById('step6-drop-zone');
        const instructionElem = document.getElementById('step6-instruction');
        const playStage = document.getElementById('step6-play-stage');
        const video = document.getElementById('step6-video');

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
            updateScaling();
        }

        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        // Drag Logic
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

            instructionElem.textContent = "Cleaning weld...";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
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
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="step1_5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" id="step1_5-bg" class="stage-bg" style="width: 100%; height: auto; display: block; pointer-events: none;"/>
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
            updateScaling();
        }

        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        // Drag Logic
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
    function renderStep5_1DragDrop(step, timestamp) {
        const videoSrc = 'images/simulation/5.mp4';
        const bgPath = 'images/simulation/5.png';
        const toolPath = 'images/simulation/5-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <!-- Drag Phase -->
                        <div class="drag-stage" id="step5-drag-stage" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: auto; display: block; pointer-events: none;" alt="Workpiece setup"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-tool-5" class="draggable" style="position: absolute; width: 30%; top: 10%; right: 10%; cursor: grab; z-index: 20;" alt="Welding torch"/>
                            <div id="step5-drop-zone" class="drop-zone" style="--arrow-top: -50%; --arrow-left: 345%;"></div>
                        </div>

                        <!-- Video Phase -->
                        <div class="play-stage" id="step5-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step5-video" src="${formatSrc(videoSrc, timestamp)}" playsinline style="width: 100%; display: block;"></video>
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

        // Initial Instruction
        instructionElem.textContent = stepGuidance[step.id] ? stepGuidance[step.id].now : "Drag the tool.";

        const targetRel = { x: 0.28, y: 0.27 }; // Center target
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
            updateScaling();
        }

        setTimeout(setDropZoneLayout, 50);
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            updateScaling();
        });

        // Drag Logic
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

            instructionElem.textContent = "Welding in progress...";

            video.play().catch(() => { });
        }

        video.addEventListener('ended', () => {
            if (stepGuidance[step.id]) {
                instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            } else {
                instructionElem.textContent = 'Step complete.';
            }
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

    const bgPath   = 'images/simulation/5.png';
    const toolPath = 'images/simulation/5-tool.png';

    const WELD_START     = { x: 0.29, y: 0.28 };
    const WELD_END       = { x: 0.7,  y: 0.7  };
    const WELD_HALF_W    = 0.008;
    const WELD_TOLERANCE = 0.02;
    const NUM_SEGMENTS   = 80;
    const HOT_DURATION   = 900;

    gifContainer.innerHTML = `
        <div class="gif-wrapper" style="width:100%; height:100%;">
            <h3>${step.title}</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>

            <div id="step5-weld-stage" style="position:relative; width:100%; display:inline-block; line-height:0;">
                <img id="step5-bg"
                     src="${formatSrc(bgPath, timestamp)}"
                     style="width:100%; height:auto; display:block; pointer-events:none; user-select:none;"/>

                <svg id="step5-weld-svg"
                     style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible;">
                    <defs>
                        <filter id="step5-weld-glow" x="-80%" y="-80%" width="260%" height="260%">
                            <feGaussianBlur stdDeviation="4" result="blur"/>
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="step5-bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="#00000088"/>
                        </filter>
                    </defs>

                    <g id="step5-bead-group"></g>
                    <circle id="step5-arc-glow"
                            cx="-999" cy="-999" r="14"
                            fill="#ffe566"
                            filter="url(#step5-weld-glow)"
                            opacity="0"/>
                </svg>

                <canvas id="step5-spark-canvas"
                        style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
                </canvas>

                <img id="step5-torch"
                     src="${formatSrc(toolPath, timestamp)}"
                     style="position:absolute; width:22%; top:8%; right:5%;
                            cursor:grab; z-index:30; user-select:none; touch-action:none;"
                     draggable="false"/>
            </div>
            <div id="step5-hint"
     style="position:absolute;
            top:18%;
            left:30%;
            font-size:1.6em;
            color:#ffd54f;
            text-shadow:0 0 8px #ff9800;
            animation:bounceArrow 1s infinite;
            pointer-events:none;
            z-index:25;
            white-space:nowrap;">
    ⬇ Drag torch here
</div>

            <div style="margin-top:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:13px;">Weld Progress:</span>
                    <div style="flex:1; height:12px; background:#ddd; border-radius:6px; overflow:hidden;">
                        <div id="step5-progress-bar"
                             style="height:100%; width:0%; background:linear-gradient(90deg,#ff6600,#ffcc00);
                                    border-radius:6px; transition:width 0.15s linear;">
                        </div>
                    </div>
                    <span id="step5-progress-text"
                          style="font-size:13px; width:36px; text-align:right;">0%</span>
                </div>
            </div>

            <div id="step5-instruction" class="drag-instructions">
                This is a simulation of the welding process. Observe how the weld pool forms and solidifies.
            </div>
        </div>
    `;

    const stage       = document.getElementById('step5-weld-stage');
    const bgImg       = document.getElementById('step5-bg');
    const torch       = document.getElementById('step5-torch');
    const sparkCanvas = document.getElementById('step5-spark-canvas');
    const beadGroup   = document.getElementById('step5-bead-group');
    const arcGlow     = document.getElementById('step5-arc-glow');
    const progressBar = document.getElementById('step5-progress-bar');
    const progressTxt = document.getElementById('step5-progress-text');
    const instructionElem = document.getElementById('step5-instruction');
    const hint = document.getElementById('step5-hint');
    const ctx         = sparkCanvas.getContext('2d');

    const weldedAt = new Array(NUM_SEGMENTS).fill(null);
    let totalWelded = 0;
    let sparks = [];
    let dragging = false;
    let startX = 0, startY = 0;
    let animFrame = null;
    let completed = false;

    function syncCanvasSize() {
        sparkCanvas.width  = stage.offsetWidth;
        sparkCanvas.height = stage.offsetHeight;
    }
    bgImg.addEventListener('load', syncCanvasSize);
    if (bgImg.complete) syncCanvasSize();

    function getSegmentUnderTip(tipX, tipY) {
        const ax = WELD_START.x, ay = WELD_START.y;
        const bx = WELD_END.x,   by = WELD_END.y;
        const dx = bx - ax, dy = by - ay;
        const lenSq = dx * dx + dy * dy;

        const t = Math.max(0, Math.min(1,
            ((tipX - ax) * dx + (tipY - ay) * dy) / lenSq
        ));

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

        beadGroup.innerHTML = '';
        const now = Date.now();

        for (let seg = 0; seg < NUM_SEGMENTS; seg++) {
            if (weldedAt[seg] === null) continue;

            const age = now - weldedAt[seg];
            const hotFrac = age < HOT_DURATION ? 1 - age / HOT_DURATION : 0;

            for (let sc = 0; sc < scallopsPerSeg; sc++) {
                const t  = (seg + (sc + 0.5) / scallopsPerSeg) * step;
                const cx = sx + ux * t;
                const cy = sy + uy * t;

                let fill;
                if (hotFrac > 0.7) fill = '#ffcc00';
                else if (hotFrac > 0.3)
                    fill = `rgb(${Math.floor(180 + hotFrac * 75)},${Math.floor(hotFrac * 120)},0)`;
                else {
                    const shade = 50 + (seg % 2) * 16;
                    fill = `rgb(${shade},${shade - 6},${shade - 12})`;
                }

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', cx);
                circle.setAttribute('cy', cy);
                circle.setAttribute('r', scR);
                circle.setAttribute('fill', fill);
                circle.setAttribute('filter', 'url(#step5-bead-shadow)');
                circle.setAttribute('opacity', '0.93');
                beadGroup.appendChild(circle);
            }
        }
    }

    function emitSparks(px, py) {
        for (let i = 0; i < 7; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            sparks.push({
                x: px, y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 18 + Math.random() * 14,
                maxLife: 32,
                r: 1 + Math.random() * 2
            });
        }
    }

    function animateLoop() {
        ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);

        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            const alpha = s.life / s.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ff9800';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();

            s.x += s.vx; s.y += s.vy;
            s.vy += 0.25;
            s.life--;
            if (s.life <= 0) sparks.splice(i, 1);
        }

        ctx.globalAlpha = 1;
        redrawBead();
        animFrame = requestAnimationFrame(animateLoop);
    }
    animFrame = requestAnimationFrame(animateLoop);

    function finishWeld() {
        completed = true;
        arcGlow.setAttribute('opacity', '0');
        progressBar.style.background = '#4CAF50';
        progressBar.style.width = '100%';
        progressTxt.textContent = '100%';
        instructionElem.innerHTML = '<b>Weld complete! ✅</b>';
        if (nextButton) nextButton.disabled = false;
    }

    function getClient(e) {
        if (e.touches && e.touches.length > 0)
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function onPointerDown(e) {
    if (completed) return;
    dragging = true;
    torch.style.cursor = 'grabbing';
    hint.style.display = 'none';

    const r = torch.getBoundingClientRect();
    const c = getClient(e);
    startX = c.x - r.left;
    startY = c.y - r.top;
    e.preventDefault();
}

    function onPointerMove(e) {
        if (!dragging || completed) return;

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

        const tipX = (newLeft + torchRect.width * 0.13) / W;
        const tipY = (newTop  + torchRect.height * 0.5) / H;

        const seg = getSegmentUnderTip(tipX, tipY);

        if (seg !== null) {
            const isNew = weldedAt[seg] === null;
            weldedAt[seg] = Date.now();

            if (isNew) {
                totalWelded++;
                const pct = Math.round((totalWelded / NUM_SEGMENTS) * 100);
                progressBar.style.width = pct + '%';
                progressTxt.textContent = pct + '%';
                if (totalWelded >= NUM_SEGMENTS && !completed) finishWeld();
            }

            const tipPxX = tipX * W;
            const tipPxY = tipY * H;
            emitSparks(tipPxX, tipPxY);
            arcGlow.setAttribute('cx', tipPxX);
            arcGlow.setAttribute('cy', tipPxY);
            arcGlow.setAttribute('opacity', '0.9');
        } else {
            arcGlow.setAttribute('opacity', '0');
        }

        e.preventDefault();
    }

    function onPointerUp() {
        dragging = false;
        torch.style.cursor = 'grab';
        arcGlow.setAttribute('opacity', '0');
    }

    torch.addEventListener('mousedown', onPointerDown);
    torch.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    cleanupCurrent = function () {
        cancelAnimationFrame(animFrame);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);
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

    preloadAssets();
});
