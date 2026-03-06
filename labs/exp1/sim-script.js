/* jshint esversion: 6 */
/* global console */
'use strict';

document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E1 script loaded');

    // --- ASSET PRELOADING ---
    const assetList = [
        // Simulation videos
        "images/simulation/1.mp4",
        "images/simulation/2.mp4",
        "images/simulation/3.mp4",
        "images/simulation/4.mp4",

        // Result images
        "images/workpiece.png",
        "images/vernier.png",
        "images/vernier calliper.png",
        "images/scale.png",

        // Reading images (all frames)
        "images/p1.1.png", "images/p1.2.png", "images/p1.3.png", "images/p1.4.png", "images/p1.5.png", "images/p1.6.png",
        "images/p2.1.png", "images/p2.2.png", "images/p2.3.png", "images/p2.4.png", "images/p2.5.png", "images/p2.6.png",
        "images/p3.1.png", "images/p3.2.png", "images/p3.3.png", "images/p3.4.png", "images/p3.5.png", "images/p3.6.png",
        "images/p4.1.png", "images/p4.2.png", "images/p4.3.png", "images/p4.4.png", "images/p4.5.png",

        // Step images
        "images/step1.png",
        "images/step2.png",
        "images/step3.png",
        "images/step4.png",

        // Finals
        "images/final read.png",
        "images/final read 2.png",
        "images/A.png"
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

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            const finalScale = Math.min(scale, 1);
            wrapper.style.transform = `scale(${finalScale})`;
            wrapper.style.transformOrigin = 'center center';
        }
    }

    const steps = [
        {
            id: 'step1',
            title: '1. Measure internal diameter of workpiece',
            src: 'images/simulation/1.mp4',
            type: 'video',
            substeps: [
                { time: 1.45, hotspot: { x: 0.346542783059637, y: 0.3661370273305878, w: 0.05604148660328436, h: 0.09014601272931487 }, instruction: 'Click here to unscrew the lock screw' },
                { time: 4.4, hotspot: { x: 0.3391097666378565, y: 0.5368086858854362, w: 0.16222990492653414, h: 0.16 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 7.4, hotspot: { x: 0.1990924805531547, y: 0.0006798951703481843, w: 0.20717372515125324, h: 0.42057656308498687 }, instruction: 'Click here to move workpiece to the correct position.' },
                { time: 9.5, hotspot: { x: 0.4445548833189283, y: 0.5368086858854362, w: 0.16222990492653414, h: 0.16 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 11.5, hotspot: { x: 0.4860414866032844, y: 0.37806664170722576, w: 0.0567847882454624, h: 0.09410707600149758 }, instruction: 'Click here to tighten the lock screw.' },
                { time: 23.3, instruction: 'Let\'s have a look at this from the top' },
                { time: 25, instruction: 'Take reading:\nMSR = 25 mm, VSR = 45 divisions (say, aligned), LC = 0.02 mm \nFinal Reading = 25 + (45 × 0.02) = 25 + 0.9 = 25.9 mm\n\nClick next to start measuring outer diameter.' }
            ]
        },
        {
            id: 'step2',
            title: '2. Measure outer diameter of workpiece',
            src: 'images/simulation/2.mp4',
            type: 'video',
            substeps: [
                { time: 1.65, hotspot: { x: 0.4674157303370786, y: 0.16657431673530512, w: 0.06258426966292134, h: 0.1021265443654062 }, instruction: 'Click here to unscrew the lock screw.' },
                { time: 3.65, hotspot: { x: 0.4229386343993085, y: 0.4209659303631599, w: 0.15630077787381158, h: 0.1740097341819543 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 5.68, hotspot: { x: 0.14347450302506481, y: 0.6306252339947586, w: 0.22717372515125323, h: 0.3387420441782104 }, instruction: 'Click here to move workpiece to correct position.' },
                { time: 7.65, hotspot: { x: 0.7254451166810718, y: 0.5767128416323475, w: 0.1597579948141746, h: 0.18 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 9.75, hotspot: { x: 0.6226015557476232, y: 0.2313051291651067, w: 0.0567847882454624, h: 0.09410707600149758 }, instruction: 'Click here to tighten the lock screw.' },
                { time: 19.30, instruction: 'Let\'s have a look at this from the top' },
                { time: 25, instruction: 'Take reading:\nMSR = 30 mm, VSR = 5 divisions (say, aligned), LC = 0.02 mm\nFinal Reading = 30 + (5 × 0.02) = 30 + 0.1 = 30.1 mm\n\nClick next to start measuring thickness.' }
            ]
        },
        {
            id: 'step3',
            title: '3. Measure thickness',
            src: 'images/simulation/3.mp4',
            type: 'video',
            substeps: [
                { time: 1.825, hotspot: { x: 0.67487625, y: 0.7423177777777777, w: 0.06369922212618842, h: 0.12202920254586297 }, instruction: 'Click here to unscrew the lock screw.' },
                { time: 4.85, hotspot: { x: 0.47035436473638725, y: 0.6345877948333957, w: 0.1, h: 0.10405840509172594 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 7.85, hotspot: { x: 0.4893690579083838, y: 0.20628378884312992, w: 0.25903197925669835, h: 0.42154249344814676 }, instruction: 'Click here to move workpiece to correct position.' },
                { time: 10.84, hotspot: { x: 0.3476231633535004, y: 0.6705293897416698, w: 0.11901469317199653, h: 0.11004867090977162 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 12.9, hotspot: { x: 0.6716437500000001, y: 0.7564222222222222, w: 0.061970625, h: 0.11004866666666667 }, instruction: 'Click here to tighten the lock screw.' },
                { time: 26.45, instruction: 'Let\'s have a look at this from the top' },
                { time: 30, instruction: 'Take reading:\nMSR = 2 mm, VSR = 5 divisions (say, aligned), LC = 0.02 mm \nFinal Reading = 2 + (5 × 0.02) = 2 + 0.1 = 2.1 mm\n\nClick next to start measuring outer depth of the workpiece.' }
            ]
        },
        {
            id: 'step4',
            title: '4. Measure depth',
            src: 'images/simulation/4.mp4',
            type: 'video',
            substeps: [
                { time: 1.03, hotspot: { x: 0.8568366464995678, y: 0.18019318607263196, w: 0.13901469317199655, h: 0.3447323099962561 }, instruction: 'Click here to move workpiece to correct position.' },
                { time: 3, hotspot: { x: 0.11408815903197926, y: 0.3958427555222763, w: 0.06468452895419188, h: 0.1021265443654062 }, instruction: 'Click here to unscrew the lock screw.' },
                { time: 4.98, hotspot: { x: 0.21607605877268798, y: 0.623472856608012, w: 0.13555747623163353, h: 0.12608760763758892 }, instruction: 'Click here to move jaws using finger hook.' },
                { time: 7.1, hotspot: { x: 0.20933448573898011, y: 0.35005016847622616, w: 0.06542783059636992, h: 0.11004867090977162 }, instruction: 'Click here to tighten the lock screw.' },
                { time: 13.5, instruction: 'Let\'s have a look at this from the top' },
                { time: 14, instruction: 'Take reading:\nMSR = 30 mm, VSR = 3 divisions (say, aligned), LC = 0.02 mm \nFinal Reading = 30 + (3 × 0.02) = 30 + 0.06 = 30.06 mm\n\nClick next to see final result.' }
            ]
        },
        {
            id: 'step5',
            title: '5. Final Result',
            type: 'final',
            instruction: 'Click the button below to print the results.',
            action: 'print',
            content: `
        <div style="overflow-y:auto; padding:20px; font-family:Arial, sans-serif;">
            <h2 style="text-align:center; margin-bottom:20px;">Measurement Results</h2>
            <hr style="margin-bottom:30px;">

            <!-- Workpiece Section -->
            <div style="text-align:center; margin-bottom:20px;">
                <img src="images/workpiece.png" 
                     alt="Workpiece" 
                     style="width:500px; border:1px solid #ccc; border-radius:6px;">
                <p style="font-size:14px; margin-top:6px;">Workpiece</p>
            </div>

            <!-- Workpiece Table -->
            <table style="border-collapse:collapse; width:100%; max-width:500px; margin:0 auto 40px auto; border:1px solid #000; font-size:14px;">
                <tbody>
                    <tr style="background:#f0f0f0; font-weight:bold;">
                        <td colspan="2" style="padding:10px; text-align:center;">Workpiece Measurements</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Outer Diameter</td>
                        <td style="border:1px solid #000; padding:10px;">30.1 mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Inner Diameter</td>
                        <td style="border:1px solid #000; padding:10px;">25.9 mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Depth</td>
                        <td style="border:1px solid #000; padding:10px;">30.06 mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Thickness</td>
                        <td style="border:1px solid #000; padding:10px;">2.1 mm</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Vernier Caliper Table -->
            <table style="border-collapse:collapse; width:100%; max-width:500px; margin:0 auto 40px auto; border:1px solid #000; font-size:14px;">
                <tbody>
                    <tr style="background:#f0f0f0; font-weight:bold;">
                        <td colspan="2" style="padding:10px; text-align:center;">Vernier Caliper Details</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Vernier Scale Divisions</td>
                        <td style="border:1px solid #000; padding:10px;">50 divisions</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px;">Least Count</td>
                        <td style="border:1px solid #000; padding:10px;">0.02 mm</td>
                    </tr>
                </tbody>
            </table>

            <!-- Print Button -->
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

    function showCurrentStep() {
        if (!gifContainer) return;

        if (currentStepIndex === totalSteps - 1 && steps[currentStepIndex].type === 'final') {
            const step = steps[currentStepIndex];
            gifContainer.innerHTML = step.content;  // <-- render the HTML content
            if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
            if (totalStepsElement) totalStepsElement.textContent = totalSteps;
            if (prevButton) prevButton.disabled = false;
            if (nextButton) nextButton.disabled = true;
            return;
        }


        const step = steps[currentStepIndex];
        clearCleanup();

        if (Array.isArray(step.substeps) && step.substeps.length) {
            renderSubstepVideo(step, Date.now());
        } else {
            renderSimpleVideo(step, Date.now());
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) nextButton.disabled = currentStepIndex === totalSteps - 1;

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderSubstepVideo(step, timestamp) {
        const substeps = step.substeps;
        let currentSubstep = 0;
        if (nextButton) nextButton.disabled = true;
        const hotspotDebug = true;
        let finalHandled = false;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
                
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="width: 100%; position: relative;">
                            <video id="substep-video" src="${formatSrc(step.src, timestamp)}" style="width:100%; display: block;" playsinline muted></video>
                            <button id="substep-hotspot" class="play-hotspot" style="visibility:hidden;"></button>
                        </div>
                    </div>
                </div>
                <div id="substep-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('substep-video');
        const hotspot = document.getElementById('substep-hotspot');
        const instructionElem = document.getElementById('substep-instruction');
        // Ensure newline characters ("\n") inside instruction text render as line breaks
        if (instructionElem) instructionElem.style.whiteSpace = 'pre-line';
        const stage = document.getElementById('play-stage');
        if (hotspotDebug) hotspot.classList.add('debug-highlight');

        function layoutHotspot(rel) {
            if (!rel) return;
            const rect = video.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const offsetX = rect.left - stageRect.left;
            const offsetY = rect.top - stageRect.top;
            hotspot.style.left = (offsetX + rect.width * rel.x) + 'px';
            hotspot.style.top = (offsetY + rect.height * rel.y) + 'px';
            hotspot.style.width = (rect.width * rel.w) + 'px';
            hotspot.style.height = (rect.height * rel.h) + 'px';
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
                    if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
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
                        instructionElem.textContent = s.instruction || 'Step complete!';
                        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
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
                    instructionElem.textContent = s.instruction || 'Step complete!';
                    if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
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
        }, { once: true });

        video.addEventListener('loadeddata', () => {
            if (currentSubstep < substeps.length && substeps[currentSubstep].hotspot) {
                layoutHotspot(substeps[currentSubstep].hotspot);
            }
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

        window.addEventListener('resize', () => {
            if (substeps[currentSubstep] && substeps[currentSubstep].hotspot) layoutHotspot(substeps[currentSubstep].hotspot);
            updateScaling();
        });

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
        <div class="gif-wrapper" style="width:100%;height:100%;">
            <h3>${step.title}</h3>
            

            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div class="play-stage" id="play-stage" style="width:100%; position: relative;">
                        <video id="simple-video" src="${formatSrc(step.src, timestamp)}" style="width:100%; display: block;" playsinline muted></video>
                    </div>
                </div>
            </div>

            <div id="play-instruction" class="drag-instructions"></div>
        </div>
    `;

        const video = document.getElementById('simple-video');
        const inst = document.getElementById('play-instruction');

        if (inst) {
            inst.style.whiteSpace = 'pre-line';
        }

        // Auto play when metadata loads
        video.addEventListener(
            'loadedmetadata',
            () => {
                video.play().catch(() => { });
                updateScaling();
            },
            { once: true }
        );
        window.addEventListener('resize', updateScaling);

        // Enable next button when video ends
        video.addEventListener(
            'ended',
            () => {
                if (nextButton) {
                    nextButton.disabled = (currentStepIndex === totalSteps - 1);
                }
            },
            { once: true }
        );

        // Cleanup function
        cleanupCurrent = () => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) { }
        };
    }


    /* =========================
       Navigation Buttons
       ========================= */

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


    /* =========================
       Initial Load
       ========================= */

    preloadAssets();
});
