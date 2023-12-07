
async function fetchProducts() {
    try {
        const apiUrl = 'https://g-sneaker-vbvi.onrender.com/api/v1/products';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            displayProduct(data.data);
        } else {
            console.error('Error fetching products:', data.message);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayProduct(products) {
    const productListElement = document.getElementById('product-list');

    products.forEach(product => {
        const shopItem = document.createElement('div');
        shopItem.classList.add('shop-item');

        shopItem.dataset.productId = product.id;
        text_content = localStorage.getItem(product.id) == true ? '✓' : 'ADD TO CART'
        shopItem.innerHTML = `
            <div class="shop-item-image" style="background-color: ${product.color};">
                <img src="${product.url}" alt="">
            </div>
            <div class="shop-item-name">${product.name}</div>
            <div class="shop-item-description">${product.description}</div>
            <div class="shop-item-botton">
                <div class="shop-item-price">$${product.price}</div>
                <div class="shop-item-button">
                    <p>${text_content}</p>
                </div>
            </div>
        `;

        productListElement.appendChild(shopItem);
    });

    document.addEventListener('click', function (event) {
        const addToCartButton = event.target.closest('.shop-item-button');

        if (addToCartButton) {
            const shopItem = addToCartButton.closest('.shop-item');
            const productId = shopItem.dataset.productId;

            addToCart(productId);
        }
    });
}


async function addToCart(productId) {
    try {
        const apiUrl = `https://g-sneaker-vbvi.onrender.com/api/v1/cart/add-item/${productId}`;
        const response = await fetch(apiUrl, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            // updateProductState(productId, true);
            localStorage.setItem(productId,true)
            const addToCartButton = document.querySelector(`.shop-item[data-product-id="${productId}"] .shop-item-button`);
            addToCartButton.innerHTML = '✓';
            fetchCartItems();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}


async function updateItemQuantity(itemId, changeAmount) {
    try {
        const apiUrl = `https://g-sneaker-vbvi.onrender.com/api/v1/cart/update-item/${itemId}`;
        const params = new URLSearchParams({change_amount: changeAmount });

        const response = await fetch(`${apiUrl}?${params.toString()}`, { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            console.log(data.message);
            fetchCartItems(); 
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error updating item quantity:', error);
    }
}

async function deleteCartItem(itemId){
    try{
        const apiUrl = `https://g-sneaker-vbvi.onrender.com/api/v1/cart/delete-item/${itemId}`;
        const response = await fetch(apiUrl, { method: 'DELETE' });
        const data = await response.json();
        if(data.success){
            const addToCartButton = document.querySelector(`.shop-item[data-product-id="${itemId}"] .shop-item-button`);
            addToCartButton.innerHTML= 'ADD TO CART';
            localStorage.removeItem(itemId)
            console.log(data.message);
            fetchCartItems();
        }else{
            console.error(data.message)
        }

    }catch(error){
        console.error('Error delete card item:', error)
    }

}

function addEventListenersToCountButtons(cartItemDiv) {
    const countButtons = cartItemDiv.querySelectorAll('.cart-count-button');

    countButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const itemId = cartItemDiv.dataset.productId;
            const changeAmount = button.textContent === '-' ? -1 : 1;

            await updateItemQuantity(itemId, changeAmount);
        });
    });
}

function addEventListenerToDeleteButtons(cartItemDiv){
    const deleteButton = cartItemDiv.querySelector('.cart-item-remove');
    deleteButton.addEventListener('click', async () => {
        const itemId = cartItemDiv.dataset.productId;
        await deleteCartItem(itemId);
    });
}

async function fetchCartItems() {
    try {
        const apiUrl = 'https://g-sneaker-vbvi.onrender.com/api/v1/cart/items';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            displayCartItems(data.data);
        } else {
            console.error('Error fetching cart items:', data.message);
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

function displayCartItems(cartItems) {
    const cartBody = document.getElementById('cartBody');
    cartBody.innerHTML = '';

    let totalAmount = 0;

    if (cartItems.length === 0) {
        // Display a message when the cart is empty
        const cartEmptyDiv = document.createElement('div');
        cartEmptyDiv.classList.add('cart-empty');
        cartEmptyDiv.innerHTML = `
            <p class="cart-empty-text">Your cart is empty.</p>
        `;
        cartBody.appendChild(cartEmptyDiv);
    } else {
        cartItems.forEach(item => {
            const cartItemDiv = document.createElement('div');
            product_id = item.productResponse.id;
            cartItemDiv.classList.add(`cart-item`);
            cartItemDiv.id = product_id;
            cartItemDiv.dataset.productId = product_id;
            const itemPrice = (item.quantity * item.productResponse.price).toFixed(2);
            totalAmount += parseFloat(itemPrice); 
            cartItemDiv.innerHTML = `
                <div class="cart-item-left">
                    <div class="cart-item-image" style="background-color: ${item.productResponse.color}">
                        <div class="cart-item-block">
                            <img src="${item.productResponse.url}" />
                        </div>
                    </div>
                </div>
                <div class="cart-item-right">
                    <div class="cart-item-name">${item.productResponse.name}</div>
                    <div class="cart-item-price">$${itemPrice}</div>
                    <div class="cart-item-action">
                        <div class="cart-item-count">
                            <div class="cart-count-button">-</div>
                            <div class="cart-count-number">${item.quantity}</div>
                            <div class="cart-count-button">+</div>
                        </div>
                        <div class="cart-item-remove">
                            <img src="./assets/trash.png">
                        </div>
                    </div>
                </div>
            `;

            cartBody.appendChild(cartItemDiv);

            addEventListenersToCountButtons(cartItemDiv);
            addEventListenerToDeleteButtons(cartItemDiv);
        });
    }
    const cartTitleAmount = document.querySelector('.cart-title-amount');
    cartTitleAmount.textContent = `$${totalAmount.toFixed(2)}`;
}

function initializePage() {
    fetchCartItems();
    fetchProducts();
}

document.addEventListener('DOMContentLoaded', initializePage);