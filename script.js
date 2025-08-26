// Extracted JS from Index.html
document.addEventListener('DOMContentLoaded', () => {
    // Get elements from the DOM
    const display = document.getElementById('display');
    const modal = document.getElementById('wordProblemModal');
    const wordProblemInput = document.getElementById('wordProblemInput');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const solveButton = document.getElementById('solveButton');
    const modalError = document.getElementById('modal-error');
    const calculatorGrid = document.querySelector('.calculator-grid');

    // This variable will hold the current expression
    let currentExpression = '';

/**
 * Appends a character (number or operator) to the expression.
 * @param {string} char - The character to append.
 */
    function appendCharacter(char) {
    if (display.innerText === '0' && char !== '.') {
         currentExpression = '';
    }
    if (display.innerText === 'Error') {
        currentExpression = '';
    }
    currentExpression += char;
    updateDisplay();
}

/**
 * Updates the display with the current expression.
 */
    function updateDisplay() {
    if (currentExpression === '') {
        display.innerText = '0';
    } else {
        display.innerText = currentExpression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');
    }
}

/**
 * Clears the display and resets the expression.
 */
    function clearDisplay() {
    currentExpression = '';
    display.innerText = '0';
}

/**
 * Deletes the last character from the expression.
 */
    function deleteLast() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

/**
 * Calculates the result of the expression.
 */
    function calculateResult() {
    try {
        // Sanitize the expression for eval: only allow numbers and basic operators
        const sanitizedExpression = currentExpression.replace(/[^-()\d/*+.]/g, '');
        let result = eval(sanitizedExpression);
        if (!isFinite(result)) {
            throw new Error("Division by zero");
        }
        currentExpression = result.toString();
        updateDisplay();
    } catch (error) {
        display.innerText = 'Error';
        currentExpression = '';
    }
}

// --- Gemini API Feature Functions ---

/**
 * Opens the word problem modal.
 */
    function openWordProblemModal() {
        modal.style.display = 'flex';
        wordProblemInput.value = ''; // Clear previous input
        modalError.classList.add('hidden');
        wordProblemInput.focus(); // Focus on the input field
    }

/**
 * Closes the word problem modal.
 */
    function closeWordProblemModal() {
        modal.style.display = 'none';
    }

/**
 * Handles the submission of the word problem.
 */
    async function handleWordProblemSubmit() {
    const problem = wordProblemInput.value.trim();
    if (!problem) {
        modalError.innerText = "Please enter a word problem.";
        modalError.classList.remove('hidden');
        return;
    }
    
    modalError.classList.add('hidden');
    setLoading(true);

    try {
        const resultText = await callGemini(problem);
        // Extract the first number from the response (handles '36 apples' etc.)
        const numMatch = resultText && String(resultText).match(/-?\d+(?:\.\d+)?/);
        if (numMatch) {
            const n = parseFloat(numMatch[0]);
            if (!isNaN(n) && isFinite(n)) {
                currentExpression = String(n);
                updateDisplay();
                // small delay to let the UI update spinner before closing modal
                setTimeout(() => closeWordProblemModal(), 80);
            } else {
                throw new Error("AI/local solver returned an invalid number. Try rephrasing your problem.");
            }
        } else {
            throw new Error("AI/local solver returned a non-numeric response. Try rephrasing your problem.");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        modalError.innerText = error.message || "An error occurred. Please try again.";
        modalError.classList.remove('hidden');
    } finally {
        setLoading(false);
    }
}
    
/**
 * Calls the Gemini API with a given prompt.
 * @param {string} prompt - The prompt to send to the API.
 * @returns {Promise<string>} - The text response from the API.
 */
    async function callGemini(problemText) {
        // Lightweight local solver fallback for common arithmetic word problems
        function tryLocalSolve(text) {
            if (!text) return null;
            // normalize and replace simple number words (one, two, three, etc.) to digits
            const numberWords = {
                zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
                ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
                seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
                sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, dozen: 12
            };

            function replaceNumberWords(s) {
                return s.replace(/\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|dozen)\b/gi, (m) => {
                    const key = m.toLowerCase();
                    return String(numberWords[key] ?? m);
                });
            }

            text = replaceNumberWords(String(text));
            const t = text.toLowerCase().trim();
            // If the user entered a plain arithmetic expression, try to evaluate it safely
            const exprCandidate = text.replace(/[^0-9\.\+\-\*\/\(\)x×\s]/g, '').replace(/x|×/g, '*').trim();
            if (exprCandidate && /^[0-9\.\+\-\*\/\(\)\s]+$/.test(exprCandidate)) {
                try {
                    // eslint-disable-next-line no-eval
                    const val = eval(exprCandidate);
                    if (isFinite(val)) return val;
                } catch (_) { /* ignore */ }
            }

            const nums = (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

            // Patterns like "12 apples in each box" and "3 boxes"
            const boxesOfMatch = /(?:(\d+(?:\.\d+)?)\s*(?:boxes|box)\s*(?:of|with)?\s*(\d+(?:\.\d+)?))/i.exec(text);
            if (boxesOfMatch) return Number(boxesOfMatch[1]) * Number(boxesOfMatch[2]);

            // Patterns like "a box has 12 apples" and "you buy 3 boxes"
            const boxMatch = /box(?:es)?(?: has| contains| with)?\s+(\d+(?:\.\d+)?)/i.exec(text);
            const buyMatch = /(?:you\s+)?(?:buy|bought|purchase|purchased)\s+(\d+(?:\.\d+)?)/i.exec(text);
            if (boxMatch && buyMatch) return Number(boxMatch[1]) * Number(buyMatch[1]);

            // Patterns like "3 boxes, each has 12 apples" or "each has 12"
            const eachMatch = /(?:(\d+(?:\.\d+)?)\s*(?:boxes|box|items)?[^\d]{0,20}each[^\d]{0,20}(\d+(?:\.\d+)?))/i.exec(text);
            if (eachMatch) return Number(eachMatch[1]) * Number(eachMatch[2]);

            // simple 'x' or 'times' multiplication like '3 x 12' or '3 times 12'
            const multMatch = /(\d+(?:\.\d+)?)\s*(?:x|×|\*|times)\s*(\d+(?:\.\d+)?)/i.exec(text);
            if (multMatch) return Number(multMatch[1]) * Number(multMatch[2]);

            // keywords
            if (/\b(total|sum|add|plus|together)\b/.test(t) && nums.length > 0) return nums.reduce((a, b) => a + b, 0);
            if (/\b(subtract|minus|less|difference)\b/.test(t) && nums.length > 1) return nums.slice(1).reduce((a, b) => a - b, nums[0]);
            if (/\b(multiply|times|multiplied|product)\b/.test(t) && nums.length > 1) return nums.reduce((a, b) => a * b, 1);
            if (/\b(divide|divided|per)\b/.test(t) && nums.length > 1) return nums.slice(1).reduce((a, b) => a / b, nums[0]);
            if (nums.length === 2 && /\b(each|per|box|boxes)\b/.test(t)) return nums[0] * nums[1];
            if (nums.length === 1 && /\b(how many|how much|what is)\b/.test(t)) return nums[0];
            return null;
        }

        const apiKey = ""; // keep empty for client-side safety; set server-side or here if you understand the risk
        const local = tryLocalSolve(problemText);
        if (!apiKey) {
            if (local !== null) return String(local);
            throw new Error('API key not configured and problem could not be solved locally. Provide an API key or rephrase the problem.');
        }

        // If an API key is provided, call the remote Gemini API
        const apiUrl = ``;
        const payload = {
            contents: [{ parts: [{ text: `Solve the following math word problem. Provide only the final numerical answer, without any accompanying text, units, or explanation. Just the number. Problem: "${problemText}"` }] }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // fallback to local if possible
                if (local !== null) return String(local);
                const text = await response.text().catch(() => '');
                throw new Error(`API request failed with status ${response.status}${text ? ': ' + text : ''}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text.trim();
            } else {
                if (local !== null) return String(local);
                throw new Error('Unexpected response format from the API.');
            }
        } catch (err) {
            // network or other errors -> fallback
            if (local !== null) return String(local);
            throw err;
        }
    }

/**
 * Sets the loading state for the modal.
 * @param {boolean} isLoading - Whether to show the loading state.
 */
    function setLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            solveButton.disabled = true;
            solveButton.classList.add('opacity-50');
        } else {
            loadingSpinner.classList.add('hidden');
            solveButton.disabled = false;
            solveButton.classList.remove('opacity-50');
        }
    }

    // No automatic API testing on load. Solve runs when user clicks Solve and will fallback locally.

    calculatorGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !calculatorGrid.contains(btn)) return;
        const action = btn.dataset.action;
        const value = btn.dataset.value;
        if (action === 'append' && value !== undefined) {
            appendCharacter(value);
        } else if (action === 'clear') {
            clearDisplay();
        } else if (action === 'delete') {
            deleteLast();
        } else if (action === 'calculate') {
            calculateResult();
        }
    });

    // Modal buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'open-modal') openWordProblemModal();
        if (action === 'close-modal') closeWordProblemModal();
        if (action === 'solve') handleWordProblemSubmit();
    });

});
