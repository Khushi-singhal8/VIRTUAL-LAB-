document.addEventListener("DOMContentLoaded", function () {

    // ============================
    // FUNCTION: Apply checking logic
    // ============================
    function applyTestLogic(submitBtnId) {

        const submitBtn = document.getElementById(submitBtnId);

        if (!submitBtn) return; // if this form doesn't exist on the page

        // --- CREATE RESET BUTTON ---
       const resetBtn = document.createElement("button");
        resetBtn.innerText = "Reset";
        resetBtn.classList.add("reset-btn");  // <-- class added
        resetBtn.style.marginLeft = "10px";
        submitBtn.insertAdjacentElement("afterend", resetBtn);
        
        // --- SUBMIT CLICK FUNCTION ---
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const questions = document.querySelectorAll(".question");

            questions.forEach(question => {
                const correct = question.dataset.correct;
                const selected = question.querySelector("input[type='radio']:checked");

                const options = question.querySelectorAll("label");

                // Remove old color format
                options.forEach(opt => opt.style.color = "black");

                if (selected) {
                    if (selected.value === correct) {
                        selected.parentElement.style.color = "green";
                    } else {
                        selected.parentElement.style.color = "red";

                        const correctOption = question.querySelector(`input[value='${correct}']`);
                        if (correctOption) {
                            correctOption.parentElement.style.color = "green";
                        }
                    }
                }
            });
        });

        // --- RESET FUNCTION ---
        resetBtn.addEventListener("click", function () {
            const questions = document.querySelectorAll(".question");

            questions.forEach(question => {
                const options = question.querySelectorAll("label");
                options.forEach(opt => opt.style.color = "black");

                const radios = question.querySelectorAll("input[type='radio']");
                radios.forEach(r => r.checked = false);
            });
        });

    }

    // ============================
    // APPLY LOGIC FOR PRETEST
    // ============================
    applyTestLogic("submit-btn");

    // ============================
    // APPLY LOGIC FOR POSTTEST
    // ============================
    applyTestLogic("posttest-submit-btn");

});
