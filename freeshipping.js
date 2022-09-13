//Free Shipping
//Init vars
var fsActive = true; 
var fsValue = 19.99;
var fsPromo = true; //Exclude products with sale price
var fsCalculateCart = true; //Sum cart items

//Language
var lang = "pt";
if(location.href.includes("/es/")) { lang = "es"; }

if(lang == "pt") {
    var msgDefault = "Entrega grátis em loja";
    var msgFS = "Entrega grátis em loja ou domicílio";
} else {
    var msgDefault = "Entrega grátis em loja";
    var msgFS = "Entrega grátis em loja ou domicílio";
}

//Init
//Wait for DOM content to be ready
if( document.readyState !== 'loading' ) {
    //console.log("Document is already ready");
    //Run script
    freeShipping();
    
} else {
    //console.log("Document was not ready");
    window.addEventListener("load", function () {
        //console.log("Document is now ready");
        //Run script
        freeShipping();
    });
}

function freeShipping() {
    if(!fsActive) { return false; }

    //Check if script runs at product page
    var productInfo = document.querySelector("#maincontent .product-info-main");
    if(!productInfo) { return false; }

    //Check product price (isProductPromo)
    var isPromo = productInfo.querySelector(".product-info-price__final");
    if(isPromo && !fsPromo) { return false; }

    if(isPromo) {
        var productPrice = isPromo.querySelector("span.price");
    } else {
        var productPrice = productInfo.querySelector(".product-info-price__regular span.price");
    }

    //Error check (?)
    if(!productPrice) { return false; }

    var add2cart = productInfo.querySelector(".add-to-cart-wrapper");
    if(!add2cart) { return false; }

    //Proceed
    var hasFreeShipping = false;

    //Format price
    productPrice = productPrice.textContent.replace(/\s/g,'');
    productPrice = productPrice.replace(/,/g,'.');
    productPrice = productPrice.split(/[€]+/)[0];
    productPrice = parseFloat(productPrice).toFixed(2);
    
    //hasFreeShipping
    if(productPrice >= fsValue) {
        hasFreeShipping = true;
    }

    if(hasFreeShipping) {
        //Immediately inject the free shipping message
        injectFS(msgFS, add2cart);
    } else {
        //Inject the default message (and show it later)
        injectFS(msgDefault, add2cart);
    }

    if(!hasFreeShipping && fsCalculateCart) {
        //Verify items in cart
        var userCart = document.querySelector("#cart-container");
        var userCartAuxTimeout;
        var cartSum = 0;

        //Loop and wait for the cart items to be fetched
        userCart.addEventListener('DOMNodeInserted', userCartHandler = function() {
            clearTimeout(userCartAuxTimeout);
            //console.log("Cart DOMNodeInserted");

            userCartAuxTimeout = setTimeout(function() {
                clearTimeout(userCartAuxTimeout);
                userCart.removeEventListener("DOMNodeInserted", userCartHandler);

                var cartItems = userCart.querySelectorAll(".price-container span.price");           
                for (var i = 0; i < cartItems.length; i++) {
                    var cartItemPrice = cartItems[i];

                    //Format price
                    cartItemPrice = cartItemPrice.textContent.replace(/\s/g,'');
                    cartItemPrice = cartItemPrice.replace(/,/g,'.');
                    cartItemPrice = cartItemPrice.split(/[€]+/)[0];
                    cartItemPrice = parseFloat(cartItemPrice).toFixed(2);

                    cartSum = parseFloat(cartSum) + parseFloat(cartItemPrice);
                    //console.log("Item " + i + ": " + cartItemPrice);
                }

                //console.log("Soma: " + cartSum + " (+ " + productPrice + ")");

                //hasFreeShipping
                if(parseFloat(cartSum) + parseFloat(productPrice) >= fsValue) {
                    injectFS(msgFS, add2cart);
                } else {
                    var fsEl = add2cart.querySelector("p.fsEl");
                    if(fsEl) { //Safety first
                        //Wait and show
                        setTimeout(function(){ fsEl.classList.add("show"); }, 1000);
                    }
                }
            }, 500);
        }); //end [addEventListener]
    } else {
        var fsEl = add2cart.querySelector("p.fsEl");
        if(fsEl) { //Safety first
            //Wait and show
            setTimeout(function(){ fsEl.classList.add("show"); }, 1000);
        }
    }
}

function injectFS($msg, $el) {
    var fsEl = $el.querySelector("p.fsEl");
    if(fsEl) { //Update <p> element
        fsEl.textContent = $msg;
        fsEl.classList.add("show");
    } else { //Create and update <p> element
        var fsEl = document.createElement('p');
        fsEl.classList.add("fsEl");
        fsEl.textContent = $msg;
        $el.appendChild(fsEl);
        
    }
    //console.log($msg);
}