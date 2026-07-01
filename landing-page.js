// === Configuration ===
const initialText = "Hi! I'm";
const typingSpeed = 100; // Typing speed in milliseconds
const wordDelay = Math.random() * 50 + 150; // Delay/Pause of 150 to 200 ms after a word
const vowelRegex = /^[aeiouAEIOU]$/; // Regex for checking vowels

// === DOM Element References ===
let typewriterElement = null;
let titleElement = null;
let bottomGifElement = null;
let scrollDownTextElement = null;
let categorySelectElement = null;
let categoryDropZoneElement = null;
let placeholderElement = null;
let draggableItems = null;

// === Page State Variables ===
let animationsStarted = false;
let animationsComplete = false;
let isTyping = false;
let isDragging = false;
let scrollFadeTimeout;
let initialOrder = []; // Var to store order of Categories in the selection bank

const pageRedirects = { //Redirections to different sections for categorySelect
    "Engineer": "projects.html#engineering-page",
    "Designer": "projects.html#design-page",
    "Photographer": "projects.html#photography-page",
    "Programmer": "projects.html#programming-page"
};



// === Core Functions ===
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // Delay for each char
}

// Helper function to reset text element of typewriter animated sentence
function clearTypewriterText() {
    if (typewriterElement) {
        typewriterElement.textContent = "";
        return true;
    }
    return false;
}

async function typewriterAnimation(textToType) {
    if (isTyping || !typewriterElement) return; // Prevent Typing while existing animation is playing or if <typewriterElement> is not found

    isTyping = true;
    clearTypewriterText();

    for (const char of textToType) {
        typewriterElement.textContent += char;
        let delay = typingSpeed;

        if (char === ' ') {
            delay += wordDelay;
        }
        await sleep(delay);
    }

    triggerPageAnimations();
    isTyping = false;
}

// Only run on DOMContentLoaded initalization to reset intro animation (Title, GIF, and Scroll Down Text)
function setInitialState() {
    if (titleElement) {
        titleElement.style.transform = 'translateY(200px)';
        titleElement.style.opacity = '0';
    }
    if (bottomGifElement) {
        bottomGifElement.style.transform = 'translateY(100px)';
        bottomGifElement.style.opacity = '0';
    }
    if (scrollDownTextElement) {
        scrollDownTextElement.style.opacity = '0';
    }
}

// Helper function to trigger page animations when typewriter animation is complete
function triggerPageAnimations() {
    setTimeout(() => {
        if (titleElement) { //Animate Name title in
            titleElement.style.transition = 'transform 0.7s cubic-bezier(.2,1.2,.6,1), opacity 0.5s';
            titleElement.style.transform = 'translateY(0)';
            titleElement.style.opacity = '1';
        }
        if (bottomGifElement) { //Animate Waving Dude GIF in
            bottomGifElement.style.transition = 'transform 1.2s cubic-bezier(.4,1.25,.6,1), opacity 0.5s';
            bottomGifElement.style.transform = 'translateY(0)';
            bottomGifElement.style.opacity = '1';
        }
        if (titleElement) {
            titleElement.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'transform') {
                    document.body.classList.remove('no-scroll');
                    if (scrollDownTextElement) {
                        scrollDownTextElement.style.transition = 'opacity 0.7s';
                        scrollDownTextElement.style.opacity = '1';
                    }
                    // Mark the intro as complete
                    animationsComplete = true;
                    titleElement.removeEventListener('transitionend', handler);
                }
            });
        }
    }, 250); //Initial Delay for Landing Page Animations (ms)
}


// =============== Event Listeners ===============

window.addEventListener("DOMContentLoaded", (event) => { //Inital Conditions for Landing Page
    typewriterElement = document.querySelector(".typewriter-animation");
    titleElement = document.getElementById('scroll-title');
    bottomGifElement = document.querySelector('.bottom-gif');
    scrollDownTextElement = document.querySelector('.scroll-down-text');
    categorySelectElement = document.querySelector('.categorySelect');
    categoryDropZoneElement = document.getElementById('category-drop-zone');
    placeholderElement = document.querySelector('.placeholder-text');
    draggableItems = document.querySelectorAll('.draggable-item');

    window.scrollTo(0, 0);
    document.body.classList.add('no-scroll'); //Prevent Scroll for inital animation
    setInitialState();

    setTimeout(() => {
        window.scrollTo(0, 0);
        animationsStarted = true;
        typewriterAnimation(initialText);
    }, 250);

    // Initialize dragover and drop listeners for category selections and drop zones
    if (categoryDropZoneElement) {
        categoryDropZoneElement.addEventListener('dragover', handleDragOver);
        categoryDropZoneElement.addEventListener('drop', handleDrop);
    }

    if (categorySelectElement) {
        draggableItems.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            // === Touch Events for Mobile ===
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
            item.addEventListener('touchend', handleTouchEnd);
            item.addEventListener('touchcancel', handleTouchEnd);
            item.classList.add('touch-draggable');
            initialOrder.push(item.id);
        });

        categorySelectElement.addEventListener('dragover', handleDragOver);
        categorySelectElement.addEventListener('drop', handleReturnDrop);
        categorySelectElement.addEventListener('dragenter', () => categorySelectElement.classList.add('drag-over'));
        categorySelectElement.addEventListener('dragleave', () => categorySelectElement.classList.remove('drag-over'));
    }

    // === Global Touch Move for Drag Simulation ===
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    if (categoryDropZoneElement) {
        categoryDropZoneElement.addEventListener('touchend', handleTouchDropOnZone);
    }
    if (categorySelectElement) {
        categorySelectElement.addEventListener('touchend', handleTouchReturn);
    }
});

// SCROLL LISTENER
window.addEventListener('scroll', () => {
    if (!animationsStarted) return;

    const scrollY = window.scrollY;
    const scrollableElements = [categorySelectElement, categoryDropZoneElement];

    if (animationsComplete) {
        const triggerPoint = 300;

        if (scrollY > triggerPoint) {
            if (typewriterElement) {
                typewriterElement.classList.add('scrolled', 'shift-left');
                if (typewriterElement.textContent === initialText) {
                    typewriterElement.textContent += " a";
                }
            }
            scrollableElements.forEach(el => el?.classList.add('scrolled'));
        }
        else {
            if (typewriterElement) {
                typewriterElement.textContent = initialText;
                typewriterElement.classList.remove('scrolled', 'shift-left');
            }
            scrollableElements.forEach(el => el?.classList.remove('scrolled'));

            if (categoryDropZoneElement) {
                const selectedCategory = categoryDropZoneElement.querySelector('span[draggable="true"]');
                if (selectedCategory && categorySelectElement) {
                    handleReturnDrop({
                        preventDefault: () => { },
                        currentTarget: categorySelectElement,
                        dataTransfer: {
                            getData: () => selectedCategory.id
                        }
                    });

                    if (typeof resetWaveAnimation === 'function') {
                        resetWaveAnimation(selectedCategory);
                    }
                }
            }
        }
    }

    if (scrollDownTextElement) {
        scrollDownTextElement.style.opacity = '0';
        clearTimeout(scrollFadeTimeout);
        scrollFadeTimeout = setTimeout(() => {
            if (window.scrollY < 10 && animationsComplete) {
                scrollDownTextElement.style.opacity = '1';
            }
        }, 900);
    }

    if (titleElement && animationsComplete) {
        const fadeStart = 0;
        const fadeEnd = 200;
        let opacity = 1 - Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
        titleElement.style.opacity = opacity;
    }
});

// #region ============ Drag and Drop Functions ============

// === Helper function for Drag & Drop Text ===
function updateTypewriterArticle(text) {
    const article = vowelRegex.test(text.charAt(0)) ? " an" : " a";
    typewriterElement.textContent = initialText + article;
}

function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    const isDropZoneOccupied = categoryDropZoneElement.querySelector('.draggable-item');

    if (!isDropZoneOccupied && placeholderElement) {
        const draggedText = event.target.id;
        placeholderElement.textContent = draggedText;
        updateTypewriterArticle(draggedText);
        event.currentTarget.style.opacity = '0';
    }
}

function handleDragEnd(event) {
    if (placeholderElement) {
        placeholderElement.textContent = "";
        event.currentTarget.style.opacity = '1';
    }
}

function handleDragOver(event) {
    event.preventDefault();
    updateTypewriterArticle(placeholderElement.textContent);
}

function handleDrop(event) {
    event.preventDefault();
    const draggedItemId = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(draggedItemId);
    const dropZone = event.currentTarget;

    // Handles returning an existing item if the drop zone is occupied.
    const existingItem = dropZone.querySelector('.draggable-item');
    if (existingItem) {
        const originalContainer = document.querySelector('.categorySelect');
        handleReturnDrop({
            preventDefault: () => { },
            currentTarget: originalContainer,
            dataTransfer: {
                getData: () => existingItem.id
            }
        });
    }

    // Add the new item to the drop zone and update the typewriter text.

    dropZone.appendChild(draggedElement);
    updateTypewriterArticle(draggedElement.id);

    const redirectUrl = pageRedirects[draggedItemId];
    if (redirectUrl) {
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
    }
}

function handleDragEnter(event) {
    event.preventDefault();
}

function handleDragLeave(event) {
    // Reset the text to default
    if (typewriterElement && typewriterElement.classList.contains('scrolled')) {
        typewriterElement.textContent = initialText + " a";
    }
}

function handleReturnDrop(event) {
    event.preventDefault();
    const draggedItemId = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(draggedItemId);
    const returnZone = event.currentTarget;

    if (draggedElement) {
        const droppedIndex = initialOrder.indexOf(draggedElement.id);
        let nextSibling = null;

        // Iterate through the original order to find the first element
        // that should come after the dropped element and is currently in the list
        for (let i = droppedIndex + 1; i < initialOrder.length; i++) {
            const siblingId = initialOrder[i];
            const siblingElement = returnZone.querySelector('#' + siblingId);
            if (siblingElement) {
                nextSibling = siblingElement;
                break;
            }
        }
        if (nextSibling) {
            returnZone.insertBefore(draggedElement, nextSibling);
        } else {
            returnZone.appendChild(draggedElement);
        }
    }

    isDragging = false;

    if (typewriterElement && typewriterElement.classList.contains('scrolled')) {
        const isDropZoneEmpty = !categoryDropZoneElement.querySelector('.draggable-item');
        if (isDropZoneEmpty) {
            typewriterElement.textContent = initialText + " a";
        }
    }
}

function getSelectedCategory() {
    if (draggableItems) {
        return categoryDropZoneElement.id;
    } else {
        return null;
    }
}

// #region ============ Touch Events for Mobile ============
let touchDragElement = null;
let touchStartX = 0;
let touchStartY = 0;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleTouchStart(event) {
    touchDragElement = event.currentTarget;
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchOffsetX = touchStartX - touchDragElement.getBoundingClientRect().left;
    touchOffsetY = touchStartY - touchDragElement.getBoundingClientRect().top;

    touchDragElement.style.opacity = '0.6';
    touchDragElement.style.zIndex = '1000';
    touchDragElement.style.position = 'relative';

    if (placeholderElement) {
        placeholderElement.textContent = touchDragElement.id;
        updateTypewriterArticle(touchDragElement.id);
    }

    event.preventDefault();
}

function handleTouchMove(event) {
    if (!touchDragElement) return;
    event.preventDefault();

    const touch = event.touches[0];
    touchDragElement.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchDragElement.style.top = (touch.clientY - touchOffsetY) + 'px';

    // Highlight drop zone if finger is over it
    const dropZoneRect = categoryDropZoneElement.getBoundingClientRect();
    if (touch.clientX > dropZoneRect.left && touch.clientX < dropZoneRect.right &&
        touch.clientY > dropZoneRect.top && touch.clientY < dropZoneRect.bottom) {
        categoryDropZoneElement.classList.add('drag-over');
    } else {
        categoryDropZoneElement.classList.remove('drag-over');
    }
}

function handleTouchEnd(event) {
    if (!touchDragElement) return;

    touchDragElement.style.opacity = '1';
    touchDragElement.style.zIndex = '';
    touchDragElement.style.position = '';
    touchDragElement.style.left = '';
    touchDragElement.style.top = '';

    categoryDropZoneElement.classList.remove('drag-over');
    touchDragElement = null;
}

function handleTouchDropOnZone(event) {
    if (!touchDragElement) return;

    const touch = event.changedTouches[0];
    const dropZoneRect = categoryDropZoneElement.getBoundingClientRect();

    if (touch.clientX > dropZoneRect.left && touch.clientX < dropZoneRect.right &&
        touch.clientY > dropZoneRect.top && touch.clientY < dropZoneRect.bottom) {

        const existingItem = categoryDropZoneElement.querySelector('.draggable-item');
        if (existingItem) {
            categorySelectElement.appendChild(existingItem);
            if (typeof resetWaveAnimation === 'function') {
                resetWaveAnimation(existingItem);
            }
        }

        categoryDropZoneElement.appendChild(touchDragElement);
        updateTypewriterArticle(touchDragElement.id);

        if (placeholderElement) {
            placeholderElement.textContent = '';
        }

        const redirectUrl = pageRedirects[touchDragElement.id];
        if (redirectUrl) {
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 500);
        }
    }

    handleTouchEnd(event);
}

function handleTouchReturn(event) {
    if (!touchDragElement) return;

    const touch = event.changedTouches[0];
    const selectRect = categorySelectElement.getBoundingClientRect();

    if (touch.clientX > selectRect.left && touch.clientX < selectRect.right &&
        touch.clientY > selectRect.top && touch.clientY < selectRect.bottom) {

        const droppedIndex = initialOrder.indexOf(touchDragElement.id);
        let nextSibling = null;

        for (let i = droppedIndex + 1; i < initialOrder.length; i++) {
            const siblingElement = categorySelectElement.querySelector('#' + initialOrder[i]);
            if (siblingElement) {
                nextSibling = siblingElement;
                break;
            }
        }

        if (nextSibling) {
            categorySelectElement.insertBefore(touchDragElement, nextSibling);
        } else {
            categorySelectElement.appendChild(touchDragElement);
        }

        if (placeholderElement) {
            placeholderElement.textContent = '';
        }

        if (typewriterElement && typewriterElement.classList.contains('scrolled')) {
            typewriterElement.textContent = initialText + ' a';
        }
    }

    handleTouchEnd(event);
}
// #endregion
