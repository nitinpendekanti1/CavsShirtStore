
// index.js
let openShopping = document.getElementsByClassName('cart-icon');
let closeShopping = document.getElementsByClassName('closeShopping');
let list = document.querySelector('.list');
let listCard = document.querySelector('.listCart');
let body = document.querySelector('body');
let total = document.querySelector('.total');

openShopping[0].addEventListener('click', function (event) {
    event.preventDefault();
    body.classList.add('active');
    console.log("hello")
})

closeShopping[0].addEventListener('click', function (event) {
    event.preventDefault();
    body.classList.remove('active');
})


let products = [
    {
        id: 1,
        name: 'Lil Tjay Shirt',
        image: '1.png',
        price: 56
    },
    {
        id: 2,
        name: 'Green Workout Shirt',
        image: '2.png',
        price: 112
    },
    {
        id: 3,
        name: 'Gray Workout Shirt',
        image: '3.png',
        price: 24
    },
    {
        id: 4,
        name: 'Red Fullsleeves',
        image: '4.png',
        price: 38
    },
    {
        id: 5,
        name: 'Grey Tshirt',
        image: '5.png',
        price: 56
    },
    {
        id: 6,
        name: 'Yellow Fullsleeves',
        image: '6.png',
        price: 40
    },
    {
        id: 7,
        name: 'Blue Choir Shirt',
        image: '7.png',
        price: 33
    },
    {
        id: 8,
        name: 'Tan Tshirt',
        image: '8.png',
        price: 120
    },
    {
        id: 9,
        name: 'Blue Tshirt',
        image: '9.png',
        price: 145
    },
    {
        id: 10,
        name: 'Purple Polo',
        image: '10.png',
        price: 156
    },
    {
        id: 11,
        name: 'Navy Tshirt',
        image: '11.png',
        price: 11
    },
    {
        id: 12,
        name: 'Hawaiian Shirt',
        image: '12.png',
        price: 40
    },
    {
        id: 13,
        name: 'Teal Tshirt',
        image: '13.png',
        price: 50
    }
];

let listCards = [];
let allCards = [];
function initApp() {
    products.forEach((value, key) => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('item');
        newDiv.id = value.id;
        newDiv.innerHTML = `
            <img src="static/img/${value.image}" alt="${value.name}">
            <div class="title">${value.name}</div>
            <div class="price">$${value.price.toLocaleString()}</div>
            <button onclick="addToCard(${key})">Add to Cart</button>`;
        list.appendChild(newDiv);
    })
}
initApp();

function searchResults(inputs) {
    list.innerHTML = '';

    products.forEach((value, key) => {
        if (inputs.indexOf(value.name) > -1) {
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.id = value.id;
            newDiv.innerHTML = `
            <img src="static/img/${value.image}" alt="${value.name}">
            <div class="title">${value.name}</div>
            <div class="price">$${value.price.toLocaleString()}</div>
            <button onclick="addToCard(${key})">Add to Cart</button>`;
            list.appendChild(newDiv);
        }
    })
}

function search(event) {
    if (event.keyCode === 13) {
        
        const inputValue = document.getElementById('input').value;
        if(inputValue == ''){
            list.innerHTML = ''
            initApp();
        } else {
            search_engine_gpt(inputValue).then(answer => {
                searchResults(answer);
            });
        }
    }
}

function addToCard(key) {
    if (listCards[key] == null) {
        // copy product form list to list card
        listCards[key] = JSON.parse(JSON.stringify(products[key]));
        listCards[key].quantity = 1;
    }
    reloadCard();
}
function reloadCard() {
    listCard.innerHTML = '';
    let count = 0;
    let totalPrice = 0;
    listCards.forEach((value, key) => {
        totalPrice = totalPrice + value.price;
        count = count + value.quantity;
        if (value != null) {
            let newDiv = document.createElement('li');
            newDiv.innerHTML = `
                <img src="static/img/${value.image}" alt="${value.name}">
                <div>${value.name}</div>
                <div>$${value.price.toLocaleString()}</div>
                <div>
                    <button onclick="changeQuantity(${key}, ${value.quantity - 1})">-</button>
                    <div class="count">${value.quantity}</div>
                    <button onclick="changeQuantity(${key}, ${value.quantity + 1})">+</button>
                </div>`;
            listCard.appendChild(newDiv);
        }
    })
    total.innerText = '$' + totalPrice.toLocaleString();
}

function changeQuantity(key, quantity) {
    if (quantity == 0) {
        delete listCards[key];
    } else {
        listCards[key].quantity = quantity;
        listCards[key].price = quantity * products[key].price;
    }
    reloadCard();
}

total.addEventListener('click', function (event) {
    listCards = [];
    reloadCard();
})

