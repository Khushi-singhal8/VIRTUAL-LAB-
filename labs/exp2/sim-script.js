'use strict';

document.addEventListener("DOMContentLoaded", function () {

    const assetList = [
        "images/simulation/1.mp4",
        "images/simulation/2.mp4",
        "images/simulation/measurement1.1.png",
        "images/simulation/measurement1.2.png",
        "images/simulation/measurement2.1.png",
        "images/simulation/measurement2.2.png",
        "images/micrometer.png",
        "images/micrometer 1.png",
        "images/micrometer 2.png",
        "images/micrometer 3.png",
        "images/b.png",
        "images/c.png",
        "images/result1.png",
        "images/result2.png",
        "images/p1.1.png", "images/p1.2.png", "images/p1.3.png", "images/p1.4.png",
        "images/p2.1.png", "images/p2.2.png", "images/p2.3.png", "images/p2.4.png",
        "images/1.png", "images/2.png", "images/3.png", "images/4.png", "images/5.png", "images/6.png"
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
            completionInstruction: 'Step complete! Click next to take reading.',
            substeps: [
                { time: 3.7, hotspot: { x: 0.63985125, y: 0.5428844444444445, w: 0.10389875, h: 0.1802057777777778 }, instruction: 'Click here to rotate the thimble and open micrometer' },
                { time: 7.83, hotspot: { x: 0.5502336448598131, y: 0.1640706126687435, w: 0.11682242990654206, h: 0.20768431983385255 }, instruction: 'Click here to place sheet between anvil and spindle' },
                { time: 10.6, hotspot: { x: 0.6684625, y: 0.5552011111111111, w: 0.11480063530159179, h: 0.1930408398567874 }, instruction: 'Click here to rotate thimble until slip click' },
                { time: 11.7, hotspot: { x: 0.7797125, y: 0.5840888888888889, w: 0.077300625, h: 0.19304088888888887 }, instruction: 'Click here to rotate ratchet for fine tuning' },
                { time: 13.5, hotspot: { x: 0.47308875, y: 0.5732355555555556, w: 0.053811625, h: 0.10618488888888888 }, instruction: 'Click here to lock the spindle using the lock lever' }
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
                'Final reading = 2 + 0.08 + 0.006 = 2.086 mm\n\nClick next to measure wire diamter.'
        },
        {
            id: 'step4',
            title: '2. Measure wire diameter using micrometer',
            src: 'images/simulation/2.mp4',
            type: 'video',
            completionInstruction: 'Step complete! Click next to take reading.',
            substeps: [
                { time: 4.1, hotspot: { x: 0.69735125, y: 0.6095799721835883, w: 0.10389874704408286, h: 0.18020588627950723 }, instruction: 'Click here to rotate the thimble and open micrometer' },
                { time: 8.2, hotspot: { x: 0.30433875, y: 0.1287911111111111, w: 0.05881125, h: 0.39062888888888886 }, instruction: 'Click here to place wire between anvil and spindle' },
                { time: 11, hotspot: { x: 0.71860125, y: 0.6162559109874827, w: 0.10389874704408286, h: 0.18020588627950723 }, instruction: 'Click here to rotate thimble until slip click' },
                { time: 12, hotspot: { x: 0.80485125, y: 0.6318331015299027, w: 0.06639875, h: 0.1802058414464534 }, instruction: 'Click here to rotate ratchet for fine tuning' },
                { time: 13.83, hotspot: { x: 0.56433875, y: 0.646568888888889, w: 0.053811625, h: 0.10618488888888888 }, instruction: 'Click here to lock the spindle using the lock lever' }
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
            <h2 style="text-align:center; margin-bottom:20px;">Measurement Results</h2>\n            <p style="text-align:center; margin-top:10px;"><b>Aim:</b> To understand the construction and working of a micrometer screw gauge and perform precise measurements.</p>

            <hr style="margin-bottom:30px;">
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
                        <td style="border:1px solid #000; padding:10px;">Diameter of wire</td>
                        <td style="border:1px solid #000; padding:10px;">0.8517 mm</td>
                    </tr>
                </tbody>
            </table>
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
        window.removeEventListener('resize', updateScaling);
    }

    function getStepCompletionInstruction(step) {
        return step.completionInstruction || 'Step complete! Click Next to continue.';
    }

    function showStepCompletionInstruction(step, instructionElem) {
        if (!instructionElem) return;
        instructionElem.textContent = getStepCompletionInstruction(step);
    }

    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage');

        if (!container || !wrapper || !stage) return;

        wrapper.style.transform = 'scale(1)';
        wrapper.style.width = '100%';

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
                wrapper.style.transform = 'scale(1)';
                wrapper.style.width = '100%';
                wrapper.style.marginLeft = '0';
                wrapper.style.transformOrigin = 'center center';
            }
        }
    }

    function showCurrentStep() {
        if (!gifContainer) return;

        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (nextButton) nextButton.disabled = true;

        if (step.type === 'final') {
            gifContainer.innerHTML = step.content;
            if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
            if (prevButton) prevButton.disabled = false;
            if (nextButton) nextButton.disabled = true;
            return;
        }

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
        const hotspotDebug = true;
        let finalHandled = false;

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="substep-video" src="${formatSrc(step.src, timestamp)}" style="width:100%;height:auto;" playsinline muted></video>
                            <button id="substep-hotspot" class="play-hotspot" style="visibility:hidden;"></button>
                        </div>
                    </div>
                </div>
                <div id="substep-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
            </div>`;

        const video = document.getElementById('substep-video');
        const hotspot = document.getElementById('substep-hotspot');
        const instructionElem = document.getElementById('substep-instruction');
        const stage = document.getElementById('play-stage');
        if (hotspotDebug) hotspot.classList.add('debug-highlight');

        function layoutHotspot(rel) {
            if (!rel || !stage) return;
            const w = stage.offsetWidth;
            const h = stage.offsetHeight;
            hotspot.style.left = (w * rel.x) + 'px';
            hotspot.style.top = (h * rel.y) + 'px';
            hotspot.style.width = (w * rel.w) + 'px';
            hotspot.style.height = (h * rel.h) + 'px';
        }

        function setupSubstep() {
            if (currentSubstep >= substeps.length) return;
            const s = substeps[currentSubstep];
            instructionElem.textContent = s.instruction || '';
            if (s.hotspot) {
                layoutHotspot(s.hotspot);
                hotspot.style.visibility = 'visible';
                hotspot.onclick = () => {
                    hotspot.style.visibility = 'hidden';
                    video.play();
                };
            } else {
                const isLast = currentSubstep === substeps.length - 1;
                if (isLast) {
                    if (nextButton) nextButton.disabled = false;
                    showStepCompletionInstruction(step, instructionElem);
                    try { video.play(); } catch (_) { }
                } else {
                    try { video.play(); } catch (_) { }
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
                        showStepCompletionInstruction(step, instructionElem);
                        if (nextButton) nextButton.disabled = false;
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
                    showStepCompletionInstruction(step, instructionElem);
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
            video.pause();
            setupSubstep();
            updateScaling();
            window.addEventListener('resize', updateScaling);
        }, { once: true });

        function onPlay() {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(checkAndPause, 33);
            }
        }
        function onPause() {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') { video.cancelVideoFrameCallback(rafId); rafId = null; }
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
        }
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        cleanupCurrent = () => {
            try {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
            } catch (_) { }
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId); rafId = null;
            }
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
        };
    }

    function renderSimpleVideo(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="simple-video" src="${formatSrc(step.src, timestamp)}" style="width:100%;height:auto;" playsinline muted></video>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;
        const video = document.getElementById('simple-video');
        const instructionElem = document.getElementById('play-instruction');
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => { });
            updateScaling();
            window.addEventListener('resize', updateScaling);
        }, { once: true });
        video.addEventListener('ended', () => {
            showStepCompletionInstruction(step, instructionElem);
            if (nextButton) nextButton.disabled = false;
        }, { once: true });
        cleanupCurrent = () => { try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) { } };
    }

    function renderImage(step) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <img id="step-image" src="${getAssetSrc(step.src)}" style="width:100%;height:auto;object-fit:contain;" alt="${step.title}"/>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;">${step.instruction || ''}</div>
            </div>`;
        const img = document.getElementById('step-image');
        img.addEventListener('load', () => {
            updateScaling();
            window.addEventListener('resize', updateScaling);
        });
        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        cleanupCurrent = () => { };
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

    preloadAssets();
});
