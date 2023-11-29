// script.js
document.addEventListener("DOMContentLoaded", function () {
    fetchShirtData();
});

let selectedShirts = [];

async function fetchShirtData() {
    const response = await fetch('/');
    const shirtData = await response.json();
    displayShirts(shirtData);
}

function displayShirts(shirts) {
    const container = document.getElementById('shirt-container');

    for (let i = 0; i < Math.min(shirts.length, 5); i++) {
        const shirt = shirts[i];
        const shirtCard = document.createElement('div');
        shirtCard.className = 'shirt';

        shirtCard.addEventListener('click', function () {
            toggleBluescale(this, shirt.name, shirt.image, shirt.embeddings);
        });

        container.appendChild(shirtCard);
    }
}

function toggleBluescale(element, name, image, embeddings) {
    element.classList.toggle('bluescaled');

    const selectedShirt = { name, image, embeddings };

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

    // Update the selected shirts input value
    document.getElementById('selected-shirts-input').value = JSON.stringify(selectedShirts.map(shirt => shirt.embeddings));
}

function showContinueButton() {
    const continueButton = document.getElementById('continue-button');
    continueButton.style.display = 'block';
}

function hideContinueButton() {
    const continueButton = document.getElementById('continue-button');
    continueButton.style.display = 'none';
}

// Modify the get_centroid function to handle the AJAX request directly
function get_centroid() {
    const embeddingsInput = document.getElementById('selected-shirts-input');
    const embeddings = JSON.parse(embeddingsInput.value);

    // Make an AJAX request to the '/centroid' endpoint
    fetch('/centroid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeddings }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed
        console.log(data);
    })
    .catch(error => console.error('Error:', error));
}
