/**
 * Coordinate Helper for Play-Stage
 * 
 * SIMPLE FUNCTION - Copy this into browser console:
 */

// Convert pixel values to relative values
// stageW and stageH = your video/stage dimensions in pixels
function pxToRel(x, y, w, h, stageW, stageH) {
    return {
        x: x / stageW,
        y: y / stageH,
        w: w / stageW,
        h: h / stageH
    };
}

// Example usage:
// pxToRel(324, 156, 50, 72, 800, 650)
// Returns: { x: 0.405, y: 0.24, w: 0.0625, h: 0.1107 }

// Or use this version that auto-detects stage size:
function pxToRelAuto(x, y, w, h) {
    const stage = document.querySelector('.play-stage video') ||
        document.querySelector('.play-stage') ||
        document.querySelector('.drag-stage img') ||
        document.querySelector('.gif-wrapper video');
    if (!stage) {
        console.error('No stage found!');
        return null;
    }
    const rect = stage.getBoundingClientRect();
    const result = {
        x: (x / rect.width).toFixed(6),
        y: (y / rect.height).toFixed(6),
        w: (w / rect.width).toFixed(6),
        h: (h / rect.height).toFixed(6)
    };
    console.log(`{ x: ${result.x}, y: ${result.y}, w: ${result.w}, h: ${result.h} }`);
    return result;
}

// Example: pxToRelAuto(324, 156, 50, 72)

/**
 * Full Interactive Helper (optional)
 * 
 * Usage:
 * 1. Open the simulation page in your browser
 * 2. Open the browser console (F12 > Console)
 * 3. Copy and paste this entire script into the console
 * 4. Click anywhere on the play-stage to get relative coordinates
 * 
 * The script will output:
 * - Pixel coordinates (x, y)
 * - Relative coordinates (relX, relY) as decimals (0-1)
 */

(function () {
    console.log('🎯 Coordinate Helper Active!');
    console.log('Click anywhere on the play-stage or video to get coordinates.');
    console.log('---------------------------------------------');

    // Find the play-stage or video element
    const findStage = () => {
        // Try different selectors that might contain the interactive area
        return document.querySelector('.play-stage') ||
            document.querySelector('#drag-stage') ||
            document.querySelector('.drag-stage') ||
            document.querySelector('.gif-wrapper') ||
            document.querySelector('video');
    };

    const stage = findStage();

    if (!stage) {
        console.error('❌ Could not find play-stage element!');
        console.log('Make sure you are on a simulation step with a video/image.');
        return;
    }

    console.log('✅ Found stage element:', stage.tagName, stage.className || stage.id);

    // Add click listener
    document.addEventListener('click', function (e) {
        const currentStage = findStage();
        if (!currentStage) return;

        const rect = currentStage.getBoundingClientRect();

        // Calculate pixel position relative to stage
        const pxX = e.clientX - rect.left;
        const pxY = e.clientY - rect.top;

        // Calculate relative position (0-1)
        const relX = pxX / rect.width;
        const relY = pxY / rect.height;

        // Only log if click is within the stage bounds
        if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
            console.log('---------------------------------------------');
            console.log(`📍 Click Position:`);
            console.log(`   Pixel:    x: ${pxX.toFixed(0)}px, y: ${pxY.toFixed(0)}px`);
            console.log(`   Relative: x: ${relX.toFixed(6)}, y: ${relY.toFixed(6)}`);
            console.log(`   Stage size: ${rect.width.toFixed(0)} x ${rect.height.toFixed(0)}px`);
            console.log('');
            console.log('📋 Copy-paste format for hotspot:');
            console.log(`   { x: ${relX.toFixed(6)}, y: ${relY.toFixed(6)}, w: 0.05, h: 0.08 }`);
        }
    });

    // Also track mouse position on hover (optional - logs to a floating div)
    const tracker = document.createElement('div');
    tracker.id = 'coord-tracker';
    tracker.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: #0f0;
        padding: 10px 15px;
        font-family: monospace;
        font-size: 12px;
        border-radius: 5px;
        z-index: 99999;
        pointer-events: none;
    `;
    tracker.innerHTML = 'Move mouse over stage...';
    document.body.appendChild(tracker);

    document.addEventListener('mousemove', function (e) {
        const currentStage = findStage();
        if (!currentStage) {
            tracker.innerHTML = 'No stage found';
            return;
        }

        const rect = currentStage.getBoundingClientRect();
        const pxX = e.clientX - rect.left;
        const pxY = e.clientY - rect.top;
        const relX = pxX / rect.width;
        const relY = pxY / rect.height;

        if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
            tracker.innerHTML = `
                <b>Stage Coords</b><br>
                px: ${pxX.toFixed(0)}, ${pxY.toFixed(0)}<br>
                rel: ${relX.toFixed(4)}, ${relY.toFixed(4)}
            `;
            tracker.style.background = 'rgba(0,100,0,0.9)';
        } else {
            tracker.innerHTML = 'Outside stage';
            tracker.style.background = 'rgba(0,0,0,0.8)';
        }
    });

    console.log('💡 A floating tracker has been added to the bottom-right corner.');
    console.log('💡 To remove it, run: document.getElementById("coord-tracker").remove()');
})();
