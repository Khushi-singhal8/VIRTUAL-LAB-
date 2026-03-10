'use strict';

document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation script loaded');

    // --- ASSET PRELOADING ---
    const assetList = [
        // Base simulation images
        "images/simulation/1.png",
        "images/simulation/2.gif",
        "images/simulation/5.png",
        "images/simulation/6.png",
        "images/simulation/tool.png",

        // Base simulation videos
        "images/simulation/8.mp4",
        "images/simulation/9.mp4",

        // Teak wood assets
        "images/simulation/teak/1.5.mp4",
        "images/simulation/teak/1.5.png",
        "images/simulation/teak/2.1.mp4",
        "images/simulation/teak/2.1.png",
        "images/simulation/teak/2.2.mp4",
        "images/simulation/teak/2.mp4",
        "images/simulation/teak/2.png",
        "images/simulation/teak/3.mp4",
        "images/simulation/teak/5.png",
        "images/simulation/teak/6.mp4",
        "images/simulation/teak/6.png",
        "images/simulation/teak/7.mp4",
        "images/simulation/teak/7.png",
        "images/simulation/teak/8.mp4",
        "images/simulation/teak/9.mp4",
        "images/simulation/teak/key.png",
        "images/simulation/teak/key2.png",
        "images/simulation/teak/sand.png",
        "images/simulation/teak/teak.png",
        "images/simulation/teak/tool.png",
        "images/simulation/teak/wood.png",

        // Pine wood assets
        "images/simulation/pine/1.5.mp4",
        "images/simulation/pine/1.5.png",
        "images/simulation/pine/2.1.mp4",
        "images/simulation/pine/2.1.png",
        "images/simulation/pine/2.2.mp4",
        "images/simulation/pine/2.mp4",
        "images/simulation/pine/2.png",
        "images/simulation/pine/3.mp4",
        "images/simulation/pine/5.png",
        "images/simulation/pine/6.mp4",
        "images/simulation/pine/6.png",
        "images/simulation/pine/7.mp4",
        "images/simulation/pine/7.png",
        "images/simulation/pine/8.mp4",
        "images/simulation/pine/9.mp4",
        "images/simulation/pine/key.png",
        "images/simulation/pine/key2.png",
        "images/simulation/pine/sand.png",
        "images/simulation/pine/pine.png",
        "images/simulation/pine/tool.png",
        "images/simulation/pine/wood.png",

        // Mahogany wood assets
        "images/simulation/mahogany/1.5.mp4",
        "images/simulation/mahogany/1.5.png",
        "images/simulation/mahogany/2.1.mp4",
        "images/simulation/mahogany/2.1.png",
        "images/simulation/mahogany/2.2.mp4",
        "images/simulation/mahogany/2.png",
        "images/simulation/mahogany/3.mp4",
        "images/simulation/mahogany/5.png",
        "images/simulation/mahogany/6.mp4",
        "images/simulation/mahogany/6.png",
        "images/simulation/mahogany/7.mp4",
        "images/simulation/mahogany/7.png",
        "images/simulation/mahogany/8.mp4",
        "images/simulation/mahogany/9.mp4",
        "images/simulation/mahogany/key.png",
        "images/simulation/mahogany/key2.png",
        "images/simulation/mahogany/sand.png",
        "images/simulation/mahogany/mahogany.png",
        "images/simulation/mahogany/tool.png",
        "images/simulation/mahogany/wood.png"
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
    const resetButton = document.getElementById('reset-btn');
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
    let step1_5Completed = false;
    let step6Completed = false;
    let step8Completed = false;

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

    // Wood selection data
    const woodTypes = [
        { name: 'Teak', id: 'teak', hotspot: { x: 0.0025, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } },
        { name: 'Pine wood', id: 'pine', hotspot: { x: 0.415, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } },
        { name: 'Mahogany', id: 'mahogany', hotspot: { x: 0.83, y: 0.03974230857537948, w: 0.16875, h: 0.8585458443321057 } }
    ];

    const baseSteps = [
        {
            id: 'step1',
            title: 'Select the wood for pattern making.',
            instruction: 'Observe the types of wood available. Click on the wood you want to use to select it.',
            src: 'images/simulation/1.png',
            isWoodSelection: true
        },
        {
            id: 'step1.5',
            title: 'Mark the wood before starting.',
            instruction: 'Use the marking tool to make guides for your cutting. Watch the video carefully.',
            src: 'images/simulation/1.5.mp4'
        },
        {
            id: 'step2',
            title: 'Place the workpiece in the chuck.',
            instruction: 'Make sure it is tightly secured. Drag it into the chuck position as shown.',
            src: 'images/simulation/2.gif'
        },
        {
            id: 'step3',
            title: 'Prepare the machine.',
            instruction: 'Move the tool post and tailstock to their starting positions before operation.',
            src: 'images/simulation/3.mp4'
        },
        {
            id: 'step5',
            title: 'Move the tool to the tool post.',
            instruction: 'Drag and drop the cutting tool into the tool post as shown in the image.',
            src: 'images/simulation/5.png'
        },
        {
            id: 'step6',
            title: 'Start the operation.',
            instruction: 'Press the green button to start the machining process. Observe carefully.',
            src: 'images/simulation/6.mp4'
        },
        {
            id: 'step7',
            title: 'Finish with sandpaper.',
            instruction: 'Use sandpaper to smooth the surface as shown in the video.',
            src: 'images/simulation/7.mp4'
        },
        {
            id: 'step8',
            title: 'Measure diameter with vernier caliper.',
            instruction: 'Carefully check the diameter of the workpiece and note it.',
            src: 'images/simulation/8.mp4'
        },
        {
            id: 'step9',
            title: 'Measure length of segments with ruler.',
            instruction: 'Check each segment carefully using a ruler and record your measurements.',
            src: 'images/simulation/9.mp4'
        },
        {
            id: 'step10',
            title: 'Observation & Result',
            instruction: 'Print your results and observations for submission.',
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
            // Only disable if it's the wood selection step and no wood is selected
            if (step.isWoodSelection) {
                nextButton.disabled = !selectedWood;
            } else if (step.isPrintStep) {
                nextButton.disabled = true;
            } else {
                nextButton.disabled = false;
            }
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
        if (!selectedWood) return getAssetSrc(src);
        const woodPath = src.replace('images/simulation/', `images/simulation/${selectedWood}/`);
        return getAssetSrc(woodPath);
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
        if (cleanupStep2) { try { cleanupStep2(); } catch { } cleanupStep2 = null; }
        if (cleanupStep3) { try { cleanupStep3(); } catch { } cleanupStep3 = null; }
        if (cleanupStep5) { try { cleanupStep5(); } catch { } cleanupStep5 = null; }
        if (cleanupStep6) { try { cleanupStep6(); } catch { } cleanupStep6 = null; }
        if (cleanupStep7) { try { cleanupStep7(); } catch { } cleanupStep7 = null; }

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
            // Determine media type from the configured step source (not from any cached blob URL)
            const isVideo = step.src && step.src.endsWith('.mp4');

            // Initial button state for generic steps
            // if (nextButton) {
            //    if (step.id === 'step1.5') nextButton.disabled = !step1_5Completed;
            //    else if (step.id === 'step8') nextButton.disabled = !step8Completed;
            //    else nextButton.disabled = isVideo;
            // }

            gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="width:100%; position: relative; min-height:300px; display:flex; align-items:center; justify-content:center; background:#fff">
                            ${isVideo
                    ? `<video id="generic-video" src="${formatSrc(currentSrc, timestamp)}" autoplay muted playsinline style="width:100%; display:block;"></video>`
                    : `<img src="${formatSrc(currentSrc, timestamp)}" class="step-gif" style="width:100%; display:block;">`
                }
                        </div>
                    </div>
                </div>
                <div id="step-complete-msg" class="drag-instructions" style="display:none; width:96%;"></div>
            </div>
        `;

            if (isVideo) {
                const v = document.getElementById('generic-video');
                if (v) {
                    v.onended = () => {
                        if (step.id === 'step1.5') {
                            step1_5Completed = true; // Still track completion

                            // Show 1.5.png
                            const imgPath = getSimulationPath('images/simulation/1.5.png');
                            // We replace the video with the image
                            const container = v.parentElement;
                            container.innerHTML = `<img src="${formatSrc(imgPath, timestamp)}" class="step-gif" style="width:100%;height:100%;object-fit:cover;">`;

                            // Add instruction after step 1.5 finishes
                            const instructionDiv = document.createElement('div');
                            instructionDiv.className = 'drag-instructions';
                            instructionDiv.style.width = '96%';
                            instructionDiv.textContent = 'Step complete! Click next to place workpiece in the chuck.';
                            container.parentElement.appendChild(instructionDiv);
                        }

                        if (step.id === 'step8') {
                            step8Completed = true;
                            const msgBox = document.getElementById('step-complete-msg');
                            if (msgBox) {
                                msgBox.textContent = 'Step complete! Click next to measure the length of segments.';
                                msgBox.style.display = 'block';
                            }
                        }

                        if (step.id === 'step9') {
                            const msgBox = document.getElementById('step-complete-msg');
                            if (msgBox) {
                                msgBox.textContent = 'Step complete! Click next to view the observation and result.';
                                msgBox.style.display = 'block';
                            }
                        }

                        if (nextButton) nextButton.disabled = false;
                        updateScaling();
                    };
                    v.addEventListener('loadedmetadata', updateScaling, { once: true });
                }
            } else {
                const img = gifContainer.querySelector('.step-gif');
                if (img) {
                    if (img.complete) updateScaling();
                    else img.onload = updateScaling;
                }
            }
            window.addEventListener('resize', updateScaling);
        }

        // Call updateButton to set initial state based on logic (except for generic video which handled above)
        // Actually, updateButtons might overwrite what we just did corresponding to generic video if we fall through to 'else' block in updateButtons.
        // Let's refine updateButtons to read a state we set here? 
        // Or just let showCurrentStep logic prevail by NOT calling updateButtons immediately for generic steps?
        // Current updateButtons structure calculates state every time. 
        // Ideally we should track 'step.completed' state.

        // For now, let's inject a property into the step object at runtime for generic videos.
        if (step.id !== 'step1' && !step.id.startsWith('step1') && !['step2', 'step3', 'step5', 'step6', 'step7'].includes(step.id)) {
            // This block handles other generic steps if any? currently just 1.5, 8.
        }

        // We update buttons AFTER render to ensure correct initial state for complex steps
        updateButtons();
    }

    function renderPrintStep() {
        var selectedWoodName = '';
        var selectedWoodLength = 0;
        var selectedWoodD1 = 0;
        var selectedWoodD2 = 0;
        var selectedWoodD3 = 0;
        switch (selectedWood) {
            case 'teak':
                selectedWoodName = "Teak";
                selectedWoodLength = 100;
                selectedWoodD1 = 40;
                selectedWoodD2 = 60;
                selectedWoodD3 = 80;
                break;
            case 'pine':
                selectedWoodName = "Pine wood";
                selectedWoodLength = 200;
                selectedWoodD1 = 80;
                selectedWoodD2 = 120;
                selectedWoodD3 = 160;
                break;
            case 'mahogany':
                selectedWoodName = "Mahogany";
                selectedWoodLength = 125;
                selectedWoodD1 = 50;
                selectedWoodD2 = 75;
                selectedWoodD3 = 100;
                break;
        }
        gifContainer.innerHTML = `
        <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
            <h2 style="text-align:center;">Experiment Result</h2>
            <hr>

            <div style="text-align:center; margin:20px 0;">
             <!-- Use the selected wood image as the result image for now, as there isn't a specific 'result' image logic defined other than the wood choice -->
             ${selectedWood
                ? `<img 
                       src="${getAssetSrc(`images/simulation/${selectedWood}/${selectedWood}.png`)}"
                       alt="${selectedWood}"
                       style="max-width:90%; border:1px solid #ccc; border-radius:6px;"
                   >`
                : ''
            }
                <p style="font-size:14px; margin-top:6px;">Final workpiece after turning operation</p>
            </div>

            <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family: sans-serif">
                <tbody>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Experiment Details</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Experiment</td>
                        <td style="border:1px solid #000; padding:10px 15px;">Pattern Making – Turning Operation</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Material Used</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodName || 'N/A'}</td>
                    </tr>

                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Measurements</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Diameter – Part 1</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodD1} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Diameter – Part 2</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodD2} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Diameter – Part 3</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodD3} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Length – Part 1</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodLength} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Length – Part 2</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodLength} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;">Length – Part 3</td>
                        <td style="border:1px solid #000; padding:10px 15px;">${selectedWoodLength} mm</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; padding:10px 15px;"><strong>Total Length</strong></td>
                        <td style="border:1px solid #000; padding:10px 15px;"><strong>${selectedWoodLength * 3} mm</strong></td>
                    </tr>

                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold;">Result</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border:1px solid #000; padding:10px 15px;">
                            The turning operation was successfully completed and the diameter was measured using a Vernier Caliper.
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">
                    🖨 Print Results
                </button>
            </div>
        </div>
        `;

        if (nextButton) nextButton.disabled = true;
    }

    function renderWoodSelection(timestamp) {
        const imgSrc = getAssetSrc('images/simulation/1.png');

        gifContainer.innerHTML = `
        <div class="gif-wrapper" style="width: 100%; height: 100%;">
            <h3>Choose the wood to use for pattern making</h3>
            <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
            
            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div class="play-stage" id="play-stage" style="width: 100%; position: relative;">
                        <img id="wood-selection-img" src="${formatSrc(imgSrc, timestamp)}" alt="Wood types" style="width:100%; display: block; object-fit:contain;"/>
                    </div>
                </div>
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
                hotspot.setAttribute('aria-label', `Select ${wood.name} `);
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
            updateScaling();
        } else {
            img.addEventListener('load', () => {
                createWoodHotspots();
                updateScaling();
            }, { once: true });
        }

        window.addEventListener('resize', () => {
            layoutWoodHotspots();
            updateScaling();
        });
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
            instructions.textContent = `You selected: ${woodName} `;
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
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <!--Drag Phase-->
                        <div class="drag-stage" id="step7-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(bgPath, timestamp)}" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPath, timestamp)}" id="draggable-sand" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 8%; top: 20%; right: 10%;"/>
                            <div id="step7-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -170%; --arrow-left: 863%;"></div>
                        </div>

                        <!--Video Phase-->
                        <div class="play-stage" id="step7-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step7-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted style="width:100%"></video>
                        </div>
                    </div>
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

        if (dragBg.complete && dragBg.naturalWidth) {
            setDropZoneLayout();
            dropZone.style.visibility = 'visible';
            updateScaling();
        } else {
            dragBg.onload = () => {
                setDropZoneLayout();
                dropZone.style.visibility = 'visible';
                updateScaling();
            };
        }
        window.addEventListener('resize', () => {
            setDropZoneLayout();
            dropZone.style.visibility = 'visible';
            updateScaling();
        });

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            sand.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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
                // Successfully dropped - no snapping, keep current position
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
                instructionElem.textContent = "Step complete! Click next to measure the workpeice.";
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
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img id="step6-poster" alt="Operation" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                            <video id="step6-video" class="stage-bg" style="display:none; width: 100%;" playsinline muted></video>
                            <button id="play-hotspot" class="play-hotspot debug-highlight" aria-label="Start"></button>
                        </div>
                    </div>
                </div>
                <div class="drag-instructions">Click the green button to start.</div>
            </div>
            `;

        const stage = document.getElementById('play-stage');
        const poster = document.getElementById('step6-poster');
        const video = document.getElementById('step6-video');
        const hotspot = document.getElementById('play-hotspot');

        const HOTSPOT_MODE = 'rel';
        const hotspotRel = { x: 0.882664, y: 0.572911, w: 0.044926, h: 0.080160 };
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
            video.src = formatSrc(gifPath, timestamp);
            video.style.display = 'block';
            video.play();

            video.addEventListener('ended', () => {
                step6Completed = true;
                if (nextButton) nextButton.disabled = false;
                const instructions = gifContainer.querySelector('.drag-instructions');
                if (instructions) instructions.textContent = 'Step complete! Click next to finish the process by sanding the workpeice.';
            });
        }

        poster.src = formatSrc(posterPath, timestamp);
        // Layout hotspot based on poster size initially
        poster.onload = () => {
            layoutHotspot();
            updateScaling();
        };
        window.addEventListener('resize', () => {
            layoutHotspot();
            updateScaling();
        });

        hotspot.addEventListener('click', startVideo, { once: true });

        cleanupStep6 = function () {
            try {
                window.removeEventListener('resize', layoutHotspot);
            } catch (e) { }
        };
    }

    function renderStep3(timestamp) {
        step3Completed = false;
        // if (nextButton) nextButton.disabled = true;

        const videoSrc = getSimulationPath('images/simulation/3.mp4');
        const substeps = [
            // Placeholder substeps - Adjust time and hotspots as needed
            { time: 0.97, hotspot: { x: 0.61625, y: 0.5266666666666666, w: 0.045, h: 0.15333333333333332 }, instruction: 'Unlock the tool rest lock' },
            { time: 3.97, hotspot: { x: 0.50625, y: 0.31777777777777777, w: 0.2475, h: 0.36444444444444446 }, instruction: 'Move tool post to its position' },
            { time: 7, hotspot: { x: 0.71625, y: 0.31777777777777777, w: 0.23375, h: 0.3 }, instruction: 'Move tail stock to its position' },
            { time: 7.97, hotspot: { x: 0.53625, y: 0.32222222222222224, w: 0.0875, h: 0.16 }, instruction: 'Adjust the tail stock quill' },
            { time: 8.95, hotspot: { x: 0.29875, y: 0.49333333333333335, w: 0.0875, h: 0.16 }, instruction: 'Engage the tool rest lock' },
            { time: 8.95, instruction: 'Step complete! Click next to place the tool.' }
        ];
        let currentSubstep = 0;

        const hotspotDebug = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${steps[currentStepIndex].title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <video id="step3-video" src="${formatSrc(videoSrc, timestamp)}" playsinline muted style="width: 100%;"></video>
                            <button id="substep-hotspot-3" class="play-hotspot" style="display:none;"></button>
                        </div>
                    </div>
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

            // Debug check
            // console.log(`Step 3 Check: t = ${ t }, target = ${ target }, currentSubstep = ${ currentSubstep } `);

            // Remove upper bound to ensure we catch it even if we skip a frame
            if (t >= target) {
                video.pause();

                if (currentSubstep < substeps.length - 1) {
                    if (!video.paused) video.pause();
                    currentSubstep++;
                    setupSubstep();
                } else {
                    instructionElem.textContent = 'Step complete! Click next to begin the process.';

                    // Final step actions
                    step3Completed = true;
                    if (nextButton) {
                        nextButton.disabled = false;
                        nextButton.removeAttribute('disabled');
                    }
                }
            }
        }

        video.addEventListener('ended', () => {
            console.log('Step 3 video ended fallback');
            step3Completed = true;
            if (nextButton) {
                nextButton.disabled = false;
                nextButton.removeAttribute('disabled');
            }
            instructionElem.innerHTML = 'Step complete! Click next to begin the process.';
        });

        function frameCallback() {
            checkAndPause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        video.addEventListener('loadedmetadata', () => {
            setupSubstep();
            updateScaling();
        });

        window.addEventListener('resize', () => {
            if (currentSubstep < substeps.length && substeps[currentSubstep].hotspot) {
                const substep = substeps[currentSubstep];
                const rect = stage.getBoundingClientRect();
                hotspot.style.left = (rect.width * substep.hotspot.x) + 'px';
                hotspot.style.top = (rect.height * substep.hotspot.y) + 'px';
                hotspot.style.width = (rect.width * substep.hotspot.w) + 'px';
                hotspot.style.height = (rect.height * substep.hotspot.h) + 'px';
            }
            updateScaling();
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
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(backgroundPng, timestamp)}" alt="Background" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(toolPng, timestamp)}" alt="Tool" id="draggable-tool" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 15%;"/>
                            <div id="drop-zone" class="drop-zone" aria-hidden="true" style="visibility:hidden; --arrow-top: -70%; --arrow-left: 801%;"></div>
                        </div>
                    </div>
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
            dropZone.style.visibility = 'visible';
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
            updateScaling();
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
        window.addEventListener('resize', () => {
            resizeStageToImage();
            updateScaling();
        }, { passive: true });
        updateScaling();

        let dragging = false;
        let offsetX = 0, offsetY = 0;

        function onPointerDown(e) {
            if (step5Completed) return;
            const rect = stage.getBoundingClientRect();
            const toolRect = tool.getBoundingClientRect();
            dragging = true;
            toolMovedByUser = true;
            tool.classList.add('dragging');
            dropZone.classList.add('dragging-active');
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

            // Remove the drop zone immediately when placed correctly
            dropZone.style.opacity = '0';
            dropZone.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                dropZone.remove();
            }, 300);

            // Update instruction text
            const instructions = gifContainer.querySelector('.drag-instructions');
            if (instructions) {
                instructions.textContent = 'Step complete! Click next to begin the process.';
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
        // if (nextButton) nextButton.disabled = true;

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
            { time: 5.9, instruction: 'Step complete! Click next to proceed with the setup.' }
        ];

        let substeps = substeps1;
        let currentSubstep = 0;
        const hotspotDebug = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${steps[currentStepIndex].title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <!--Drag Phase 1: Key-->
                        <div class="drag-stage" id="step2-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                            <img src="${formatSrc(chunkBgPath, timestamp)}" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(keyPath, timestamp)}" id="draggable-key" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 8%; top: 20%; right: 10%;"/>
                            <div id="step2-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -356%; --arrow-left: 415%;"></div>
                        </div>

                        <!--Video Phase-->
                        <div class="play-stage" id="step2-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                            <video id="step2-video" src="${formatSrc(video1Src, timestamp)}" playsinline muted style="width: 100%; display: block;"></video>
                            <button id="substep-hotspot" class="play-hotspot" style="display:none;"></button>
                        </div>

                        <!--Drag Phase 2: Wood-->
                        <div class="drag-stage" id="step2-drag-stage-2" style="position: relative; width: 100%; overflow: hidden; display: none;">
                            <img src="${formatSrc(chunkOpenBgPath, timestamp)}" class="stage-bg-2" style="width: 100%; height: auto; display: block;"/>
                            <img src="${formatSrc(woodPath, timestamp)}" id="draggable-wood" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 18%; top: 33%; right: 10%;"/>
                            <div id="step2-wood-drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -88%; --arrow-left: 275%;"></div>
                        </div>
                    </div>
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
        const targetRel1 = { x: 0.58, y: 0.54 };
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
            currentDropZone.classList.add('dragging-active');
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
            const anchor = (currentDragObject === wood)
                ? { x: 0.5, y: 0.5 }
                : { x: 0.1, y: 0 };
            const objCenter = {
                x: objRect.left - stageRect.left + objRect.width * anchor.x,
                y: objRect.top - stageRect.top + objRect.height * anchor.y
            };

            // Re-calc target center based on drop zone
            const dzRect = currentDropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;
            const tol = Math.max(tolerancePx, dzRect.width / 2);

            const dist = Math.hypot(objCenter.x - targetX, objCenter.y - targetY);

            if (dist < tol) {
                currentDropZone.classList.add('success');
                if (currentDragObject === wood) {
                    const left = targetX - objRect.width / 2;
                    const top = targetY - objRect.height / 2;
                    currentDragObject.style.left = left + 'px';
                    currentDragObject.style.top = top + 'px';
                }
                // Successfully dropped - no snapping, keep current position
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
            if (dragStage1.style.display !== 'none') {
                layout1();
            }
            if (dragStage2.style.display !== 'none') {
                layout2();
            }
            if (playStage.style.display !== 'none' && substeps[currentSubstep] && substeps[currentSubstep].hotspot) {
                showHotspot();
            }
            updateScaling();
        });
        updateScaling();


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

            video.src = formatSrc(video2Src, timestamp);

            // Define handler
            const onVideoEnded = () => {
                console.log('Step 2 Final Video Ended');
                instructionElem.textContent = 'Step complete! Click next to start with the setup.';
                step2Completed = true;
                if (nextButton) nextButton.disabled = false;
                // Remove listener to prevent duplicates if function called multiple times
                video.removeEventListener('ended', onVideoEnded);
            };

            video.addEventListener('ended', onVideoEnded);
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
        const targetRel2 = { x: 0.473, y: 0.535 }; // Center of chuck roughly
        const layout2 = () => setDropZoneLayout(dragStage2, dropZone2, targetRel2, 0.15); // Bigger zone for wood

        function startWoodDragPhase() {
            playStage.style.display = 'none';
            dragStage2.style.display = 'block';
            instructionElem.textContent = "Drag the wood piece into the chuck.";

            const layoutAfterShow = () => layout2();
            if (dragBg2.complete && dragBg2.naturalWidth) {
                requestAnimationFrame(layoutAfterShow);
            } else {
                dragBg2.onload = () => requestAnimationFrame(layoutAfterShow);
            }
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

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            // Reset to wood selection screen (step 0)
            selectedWood = null;
            currentStepIndex = 0;
            showCurrentStep();
        });
    }

    preloadAssets();
});
