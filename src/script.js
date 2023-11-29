let openShopping = document.getElementsByClassName('cart-icon');
let closeShopping = document.getElementsByClassName('closeShopping');
let list = document.querySelector('.list');
let listCard = document.querySelector('.listCart');
let body = document.querySelector('body');
let total = document.querySelector('.total');

openShopping[0].addEventListener('click', function(event){
    event.preventDefault();
    body.classList.add('active');
    console.log("hello")
})

closeShopping[0].addEventListener('click', function(event){
    event.preventDefault();
    body.classList.remove('active');
})


let products = [
    {
        id: 1,
        name: 'PRODUCT NAME 1',
        image: '1.png',
        price: 56
    },
    {
        id: 2,
        name: 'PRODUCT NAME 2',
        image: '2.png',
        price: 112
    },
    {
        id: 3,
        name: 'PRODUCT NAME 3',
        image: '3.png',
        price: 24
    },
    {
        id: 4,
        name: 'PRODUCT NAME 4',
        image: '4.png',
        price: 38
    },
    {
        id: 5,
        name: 'PRODUCT NAME 5',
        image: '5.png',
        price: 56
    },
    {
        id: 6,
        name: 'PRODUCT NAME 6',
        image: '6.png',
        price: 40
    },
    {
        id: 7,
        name: 'PRODUCT NAME 7',
        image: '7.png',
        price: 33
    },
    {
        id: 8,
        name: 'PRODUCT NAME 6',
        image: '8.png',
        price: 120
    },
    {
        id: 9,
        name: 'PRODUCT NAME 6',
        image: '9.png',
        price: 145
    },
    {
        id: 10,
        name: 'PRODUCT NAME 6',
        image: '10.png',
        price: 156
    },
    {
        id:11,
        name: 'PRODUCT NAME 6',
        image: '11.png',
        price: 11
    },
    {
        id: 12,
        name: 'PRODUCT NAME 6',
        image: '12.png',
        price: 40
    },
    {
        id: 13,
        name: 'PRODUCT NAME 6',
        image: '13.png',
        price: 50
    }
];

let listCards  = [];
function initApp(){
    products.forEach((value, key) =>{
        let newDiv = document.createElement('div');
        newDiv.classList.add('item');
        newDiv.innerHTML = `
            <img src="img/${value.image}">
            <div class="title">${value.name}</div>
            <div class="price">$${value.price.toLocaleString()}</div>
            <button onclick="addToCard(${key})">Add to Cart</button>`;
        list.appendChild(newDiv);
    })
}
initApp();
function addToCard(key){
    if(listCards[key] == null){
        // copy product form list to list card
        listCards[key] = JSON.parse(JSON.stringify(products[key]));
        listCards[key].quantity = 1;
    }
    reloadCard();
}
function reloadCard(){
    listCard.innerHTML = '';
    let count = 0;
    let totalPrice = 0;
    listCards.forEach((value, key)=>{
        totalPrice = totalPrice + value.price;
        count = count + value.quantity;
        if(value != null){
            let newDiv = document.createElement('li');
            newDiv.innerHTML = `
                <div><img src="img/${value.image}"/></div>
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

function changeQuantity(key, quantity){
    if(quantity == 0){
        delete listCards[key];
    }else{
        listCards[key].quantity = quantity;
        listCards[key].price = quantity * products[key].price;
    }
    reloadCard();
}

total.addEventListener('click', function(event){
    listCards = [];
    reloadCard();
})