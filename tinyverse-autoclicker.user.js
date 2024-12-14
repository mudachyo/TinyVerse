// ==UserScript==
// @name         Tiny Verse Autoclicker
// @namespace    Violentmonkey Scripts
// @match        https://*.tonverse.app/*
// @grant        none
// @version      1.0
// @author       mudachyo
// @icon         https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT_G0oRZtHTCj0Z6AEqmLAcFrRP34XjdA-hnD2dyyqu-H_5ue6j
// @downloadURL  https://github.com/mudachyo/TinyVerse/raw/main/tinyverse-autoclicker.user.js
// @updateURL    https://github.com/mudachyo/TinyVerse/raw/main/tinyverse-autoclicker.user.js
// @homepage     https://github.com/mudachyo/TinyVerse
// ==/UserScript==

(function() {
    'use strict';

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function simulateClick(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const events = [
            { type: 'pointerdown', options: { pointerId: 1, width: 1, height: 1, pressure: 0.5 } },
            { type: 'mousedown', options: {} },
            { type: 'pointermove', options: { pointerId: 1, width: 1, height: 1, pressure: 0.5 } },
            { type: 'mousemove', options: {} },
            { type: 'pointerup', options: { pointerId: 1, width: 1, height: 1, pressure: 0 } },
            { type: 'mouseup', options: {} },
            { type: 'click', options: {} }
        ];

        for (const { type, options } of events) {
            const event = new PointerEvent(type, {
                ...options,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
            });
            element.dispatchEvent(event);
        }
    }

    const defaultSettings = {
        min: 1,
        max: 30
    };
    const settings = JSON.parse(localStorage.getItem('tinyverse-autoclicker-settings')) || defaultSettings;

    function saveSettings() {
        localStorage.setItem('tinyverse-autoclicker-settings', JSON.stringify(settings));
    }

    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = '⚙️';
    document.body.appendChild(settingsButton);

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    const settingsModal = document.createElement('div');
    settingsModal.className = 'settings-menu';
    settingsModal.style.display = 'none';

    settingsModal.innerHTML = `
        <div class="settings-title">
            Tiny Verse Autoclicker
            <button class="settings-close-button">×</button>
        </div>
        <div class="setting-item">
            <span class="setting-label-text">Min Threshold</span>
            <input type="range" id="minThreshold" min="1" max="100" value="${settings.min}" class="setting-slider">
            <span id="minValue" class="setting-value">${settings.min}</span>
        </div>
        <div class="setting-item">
            <span class="setting-label-text">Max Threshold</span>
            <input type="range" id="maxThreshold" min="1" max="100" value="${settings.max}" class="setting-slider">
            <span id="maxValue" class="setting-value">${settings.max}</span>
        </div>
        <div class="social-buttons">
            <a href="https://github.com/mudachyo/TinyVerse" target="_blank" class="social-button">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADv0lEQVR4nO2ZW4iNURTHP4YMcs+4X3In8eASxgMpcosXhPJCcifhlTzILZdGKY/y4M0tdx5JeDAyDDMkxqUwjfu4HD8t1qnjtM/37X3Ot8+ZNP/adTrft9Ze/73XXpf9BUEj/lMAHYC5wB7gLFAJ1ALfdMjvB/pM3pkDtA8aAoAWwGLgIvATd4jMeWCR6AoKQKAlsBF4QXyoATYAxfkiMR2oxh+qgGm+3egg+cNR2fm4SXQBbpN/3ARK4iLRV7e7UHgkNuRKorOG0UKjGuiaLYniArlTmJu5h2jgMA0PZdmE2DBsUbcbDWwFnuZgnGT7zcBIrQ72Rbw/1SXZReWJngY3FEJfgSvAemAiMBBorWOQ/rcKOAV8BNYCRWm6Rloc/mgX04wdBWP2BZpbrVbIu0A3i/nX2yQ9m7Ij3kT1rw1dLeZ/HrorWgDaYIhHIqWWNiwMUyJVrA3meySy2tKGc5kUdHAoxbd7JHLE0oYfQFuTAmmKbPBeDqRHIkOB75a2zDYp2GspvM8XiSSA45a27DYJSwtqg7GBZwDzLG05bRKWRGPjl83yQGSwJZFKk/BbC8G3vkkIgF6WRN4E6dCbjijIO00CzwCGp3lBrY5fafbUm4STkWKS1jv9gI5Ad/2dHN6JpEJcWVODjCZaC/ZILqxJoE4f3gDuAI/V3V7p7+RYEHgGUBbiFZ9TjkGtSfihPryqpfQ6idNasY7QlvfPquSBSFOdqzcwTCIlMFMr5516FyZ4YBK+oA93aBm+HzgBXAPKdTfe6TlZ4nk36vVMPAEqgFvAGeCQ9kJ7M5YpUnZgj0+yUx5ILDcc6DBsMymZghu+AEvjcDVtH3Y5khBMNilrZRmC03Fdz1JRFgRa62KI27qiPmNflHJO0iF9yjJJQCGKXwPHgJWyUkB/oF2K7k7Sx8h1KLBJygttd7PF2bAVkpXNFPJKtQcXg23cToztkqK7RP+TZ3FgRlTYk0hhQrk+HwN8iCBRGjJHaQxkqsSWKL+V0JsJM1NKiAvqGsmPOM+Ay8Cs0An+yq/Ikchqq9sN4K6zXzpAdzbTHFG4Y12BAxOAhEFJIq78oUHBFQlgnOtEkkVNqNOLtZ6Rfhquf0AWRA5mM1FzrbtcUOSo3wWXXC4A0ydr6+LLWei3RUXOX4CBPsD9AhK5Jx1jTiRSJmwjlWYBiFyO/Vu8+nRZhmgWN5EEcMDrRQcwSvsDX0TKgfF+rDf30WvTvqPUZKHnZYq86FqTj+umTBlaWtCTyfLFUX62ys7IJSc1ohGBP/wGjidhuRxqAwcAAAAASUVORK5CYII=" alt="GitHub">
            </a>
            <a href="https://t.me/shopalenka" target="_blank" class="social-button">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADKElEQVR4nO2a34tNURTHD+HOGGGIOxSFPHhSkj9AlIkRHjQxnsSTh+vH5EGKN3MpKUkevXmQuDQX4YEnEZIMd4YXFHORB7+Zj1a2nE77/Nj77nPPofnWrds9Z3/X+t6999prrXM8bxT/KYBpwDrgCHAJGADeAV/VR74/VtcOq3vbvTwAaAG2AFeBn5jjB3AZ6BEuLwMBrcAe4BXuIFy7hbtZItYAz0gPQ8DqtJfRMZqH08BE1yJmAfdoPu4AHa5EzFfTnRUGxYdGRcwEnpI9hqxnRkWmLJZTGO5ahWjgFPnDCZsQm1d0miypLDd3ks0fv8SAXvKPnUkOPZdpR1J8Bz4Z3P8yclZUAtgsjABVYAMwGRgHXDQYvzlKiGSxaeM9cBRYqLG/y4CnGlVPSFqdFh4A24G2iD+ybMAnvk7VkaxPwXkxVgFWAGNCl8JfH84Z8q/VkUhl5woSMA4As+OcD/jw0NBOWUciJWijuAl0A+NDHJ2rKsJuzbWxhpFLUNEZsU0OP6p0ZnHMv70V+CAzH3J9joXtAR3RW4sTdi8wPUZAB3BejemLuG+5hZA3OiLpdCTBFcl3ZClECVCcPap7IjgYc+82CyFfbIRIBFoZ57ziKgYi0L4EY0xCb6SQesygz8CiBA5tBIZ943oTijcNvYJh280us3JdkjZggWYvnAmkIKUkItT4mqvNbpLn/MEj4CxwQ5MV7DAQ0WbZ4KukfSDeSipC2V5maaesI5NerCs8ByYZCJEzxgZdOrJ2x0mjpBtLEgqRbNgUUsNMCSOUM8IlxNghYEKMkGsW3P1xB1gauB+VwgCvLTg3ZVXqyoG7P5hQqk6mKV4AhahZ9lRrP+1+7lKfvT4LjlKkiCa2g0bU2SMd92+GY2uJO47yfIL8YlUiET4xJ8kfjhuJ8G18Wc95we3YDR4hZgbwJGsF/C7iilYiAuFxMGMR8xoSEUjR5flEFsup6ESET0whg4ehrU5FBAR1przUasYhtgExLapKlK64KwhXKas3IAoq0axalgAypl8669ah1TWkoSy9WNUNqagXaOq+l2rq6rcL6p6u0HpiFN6/j19y2btcBwDRQQAAAABJRU5ErkJggg==" alt="Telegram">
            </a>
            <a href="https://mudachyo.codes/donate/" target="_blank" class="social-button">
                <img src="data:image/png;base64,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" alt="Donate">
            </a>
        </div>
    `;

    document.body.appendChild(settingsModal);

    const style = document.createElement('style');
    style.textContent = `
		.settings-menu {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background-color: rgba(17, 17, 17, 0.95);
			border-radius: 24px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
			color: #ffffff;
			font-family: 'Space Grotesk', sans-serif;
			z-index: 10000;
			padding: 16px;
			width: 340px;
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.1);
			padding: 20px 20px 20px 20px;
			opacity: 0.8;
		}

		.settings-title {
			font-size: 16px;
			font-weight: 600;
			display: flex;
			justify-content: space-between;
			margin-bottom: 12px;
		}

		.settings-close-button {
			background: rgba(255, 255, 255, 0.1);
			border: none;
			color: #ffffff;
			font-size: 16px;
			cursor: pointer;
			border-radius: 8px;
		}

		.setting-item {
			margin: 20px 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.setting-slider {
			width: 150px;
		}

		.setting-value {
			margin-left: 8px;
			width: 24px;
			height: 24px;
		}

		.social-buttons {
			display: flex;
			justify-content: space-between;
			margin-top: 12px;
		}

		.social-button img {
			width: 32px;
			height: 32px;
		}

		.settings-button {
			position: fixed;
			bottom: 20px;
			right: 20px;
			width: 60px;
			height: 60px;
			background-color: #1f1f1f;
			border: none;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.6);
			transition: transform 0.2s ease, box-shadow 0.2s ease;
			cursor: pointer;
		}

		span.setting-label-text {
			width: 120px;
		}

		.settings-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			backdrop-filter: blur(8px);
			z-index: 9999;
		}
    `;

    document.head.appendChild(style);

    settingsButton.addEventListener('click', () => {
        const isModalVisible = settingsModal.style.display === 'block';
        settingsModal.style.display = isModalVisible ? 'none' : 'block';
        overlay.style.display = isModalVisible ? 'none' : 'block';
    });

    settingsModal.querySelector('.settings-close-button').addEventListener('click', () => {
        settingsModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    let randomThreshold = getRandomInt(settings.min, settings.max);

    document.getElementById('minThreshold').addEventListener('input', (e) => {
        const newValue = parseInt(e.target.value, 10);
        settings.min = newValue;
        document.getElementById('minValue').textContent = newValue;
        e.target.value = newValue;
        saveSettings();
        randomThreshold = getRandomInt(settings.min, settings.max);
        console.log(`New randomThreshold: ${randomThreshold}`);
    });

    document.getElementById('maxThreshold').addEventListener('input', (e) => {
        const newValue = parseInt(e.target.value, 10);
        settings.max = newValue;
        document.getElementById('maxValue').textContent = newValue;
        e.target.value = newValue;
        saveSettings();
        randomThreshold = getRandomInt(settings.min, settings.max);
        console.log(`New randomThreshold: ${randomThreshold}`);
    });

    (async function waitAndClick() {
        const elementSelector = '#ui-bottom > a:nth-child(2)';

        while (true) {
            const element = document.querySelector(elementSelector);

            if (!element) {
                console.warn('Element not found');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const percentageText = element.querySelector('span.font-mono')?.textContent;
            if (percentageText) {
                const percentage = parseInt(percentageText.replace('%', ''), 10);
                console.log(`Current value: ${percentage}%, Threshold: ${randomThreshold}%`);

                if (percentage >= randomThreshold) {
                    simulateClick(element);
                    console.log(`Clicked element at: ${percentage}%`);
                    randomThreshold = getRandomInt(settings.min, settings.max);
                    console.log(`New threshold: ${randomThreshold}%`);
                }
            } else {
                console.warn('Could not retrieve percentage text');
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
    })();
})();