document.addEventListener("DOMContentLoaded", function () {

    function applyTestLogic(submitBtnId) {

        const submitBtn = document.getElementById(submitBtnId);
        if (!submitBtn) return;

        // -------- CREATE RESET BUTTON --------
        const resetBtn = document.createElement("button");
        resetBtn.innerText = "Reset";
        resetBtn.classList.add("reset-btn");
        resetBtn.style.marginLeft = "10px";
        submitBtn.insertAdjacentElement("afterend", resetBtn);

        // -------- CREATE SCORE DISPLAY --------
        const scoreDiv = document.createElement("div");
        scoreDiv.style.marginTop = "10px";
        scoreDiv.style.fontWeight = "bold";
        submitBtn.insertAdjacentElement("afterend", scoreDiv);

        // -------- SUBMIT FUNCTION --------
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const questions = document.querySelectorAll(".question");
            let score = 0;
            let allAnswered = true;

            // ✅ STEP 1: CHECK IF ALL QUESTIONS ARE ANSWERED
            questions.forEach(question => {
                const selected = question.querySelector("input[type='radio']:checked");
                if (!selected) {
                    allAnswered = false;
                }
            });

            // ❌ IF NOT ALL ANSWERED → STOP HERE (NO SOLUTION SHOWN)
            if (!allAnswered) {
                alert("⚠️ Please answer ALL questions before submitting!");
                return;
            }

            // ✅ STEP 2: NOW SHOW SOLUTION & CALCULATE SCORE
            questions.forEach(question => {
                const correct = question.dataset.correct;
                const selected = question.querySelector("input[type='radio']:checked");

                const options = question.querySelectorAll("label");
                options.forEach(opt => opt.style.color = "black");

                if (selected.value === correct) {
                    selected.parentElement.style.color = "green";
                    score++;
                } else {
                    selected.parentElement.style.color = "red";

                    const correctOption = question.querySelector(`input[value='${correct}']`);
                    if (correctOption) {
                        correctOption.parentElement.style.color = "green";
                    }
                }
            });

            // ✅ SHOW FINAL SCORE
            scoreDiv.innerHTML = "✅ Your Score: " + score + " / " + questions.length;
        });

        // -------- RESET FUNCTION --------
        resetBtn.addEventListener("click", function () {
            const questions = document.querySelectorAll(".question");

            questions.forEach(question => {
                const options = question.querySelectorAll("label");
                options.forEach(opt => opt.style.color = "black");

                const radios = question.querySelectorAll("input[type='radio']");
                radios.forEach(r => r.checked = false);
            });

            scoreDiv.innerHTML = "";
        });
    }

    // ========== PRETEST ==========
    applyTestLogic("submit-btn");

    // ========== POSTTEST ==========
    applyTestLogic("posttest-submit-btn");

});
