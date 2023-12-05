// script.js
document.addEventListener("DOMContentLoaded", function () {
    fetchShirtData();
});

let selectedShirts = [];

async function fetchShirtData() {
    const response = await fetch('/recommend');
    const shirtData = await response.json();
    displayShirts(shirtData);
}

function displayShirts(shirts) {
    const container = document.getElementById('shirt-container');

    for (let i = 0; i < Math.min(shirts.length, 8); i++) {
        const shirt = shirts[i];
        const shirtCard = document.createElement('div');
        shirtCard.className = 'shirt';

        shirtCard.innerHTML = `
            <h2>${shirt.name}</h2>
            <img src="${shirt.image}" alt="Shirt Image">
            <input type="hidden" name="selectedShirts" value="${shirt.name}">
        `;

        shirtCard.addEventListener('click', function () {
            toggleBluescale(this, shirt.name, shirt.image, shirt.embeddings);
        });

        container.appendChild(shirtCard);
    }
}

function toggleBluescale(element, name, image, embeddings) {
    element.classList.toggle('bluescaled');

    const selectedShirt = { name, image, embeddings: JSON.parse(embeddings) };

    if (element.classList.contains('bluescaled')) {
        selectedShirts.push(selectedShirt);
        if (selectedShirts.length === 3) {
            showContinueButton();
        }
    } else {
        const index = selectedShirts.findIndex(shirt => shirt.name === name);
        if (index !== -1) {
            selectedShirts.splice(index, 1);
        }
        if (selectedShirts.length !== 3) {
            hideContinueButton();
        }
    }

    console.log("Selected Shirts:", selectedShirts);
}

function showContinueButton() {
    const continueButton = document.getElementById('continue-button');
    continueButton.style.display = 'block';
}

function hideContinueButton() {
    const continueButton = document.getElementById('continue-button');
    continueButton.style.display = 'none';
}

function handleRecommendationSubmission() {
    // Send selectedShirts to the server for recommendation calculation
    fetch('/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedShirts }),
    })
    .then(response => response.json())
    .then(data => {
        // Redirect to centroid.html with the centroid embedding
        window.location.href = '/centroid';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
