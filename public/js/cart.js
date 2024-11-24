



//check the deletion button to be disabled
// -------------------------------------------------------------------------------------------------------------
const checkboxes = document.querySelectorAll('.nameCheckbox');
const button = document.getElementById('deleteSelected');

function handleCheckboxChange() {
    let anyChecked = false;
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            anyChecked = true;
        }
    });

    if (anyChecked) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', 'disabled');
    }
}

checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', handleCheckboxChange);
});
// -------------------------------------------------------------------------------------------------------------






//delete one
// -------------------------------------------------------------------------------------------------------------


async function deleteOne(id, specID) {

    showSpinner()


    try {
        const response = await fetch(`/cart/remove-one/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.error) {
                console.error('Error occurred while removing data:', data.error);
            } else {
                const formattedPrice = (data.getTotalPriceOfProduct ?? 0).toLocaleString('vi-VN');
                document.getElementById('subtotalPrice').textContent = `${formattedPrice} đ`;
                document.getElementById('totalPrice').textContent = `${formattedPrice} đ`;
                const button = document.querySelector(`.deleteProduct-${specID}`);

                button.parentElement.remove();

                hideSpinner();
            }
        } else {
            console.error('Error occurred while removing data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};



let queryQuantity = 0

async function adjustQuantity(productId, isIncreasing, id, maxQuantity) {
    showSpinner()
    const quantityInput = document.querySelector(`#quantityInputField-${id}`);
    let currentQuantity = parseInt(quantityInput.value);
    let maxQty = parseInt(maxQuantity)

    currentQuantity = isIncreasing ? currentQuantity + 1 : Math.max(currentQuantity - 1, 1); // Ensure quantity doesn't go below 1
    if (currentQuantity > maxQty) {
        currentQuantity = maxQty
    }

    try {
        const response = await fetch(`/cart/update-quantity/${productId}/${id}/${currentQuantity}`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();



        const totalPrice = (data.productPrice ?? 0) * (currentQuantity ?? 1);

        const formattedTotalPrice = Number.isFinite(totalPrice)
            ? totalPrice.toLocaleString('vi-VN')
            : '0';

        document.querySelector(`#productPrice-${id}`).textContent = `${formattedTotalPrice} đ`;
        document.querySelector(`#quantityInputField-${id}`).value = data.quantity
        const formattedPrice = (data.getTotalPriceOfProduct ?? 0).toLocaleString('vi-VN');
        document.getElementById('totalPrice').textContent = `${formattedPrice} đ`;
        document.getElementById('subtotalPrice').textContent = `${formattedPrice} đ`;
        hideSpinner()
    } catch (error) {
        console.error('There was a problem updating the quantity:', error);
    } finally {
        ;
    }
}





//Change the quantity after out of focusing the input
function obtainIDinPut(productId, id) {
    const inputUpdateWhenOutOfFocus = document.querySelector(`#quantityInputField-${id}`);

    if (!inputUpdateWhenOutOfFocus) {
        console.error('Input field not found for product:', id);
        return;
    }

    // Update quantity when focus is lost
    inputUpdateWhenOutOfFocus.addEventListener('focusout', (event) => {
        const inputValue = event.target.value;
        updateWhenEntering(productId, inputValue, id);
    });

    // Update quantity on pressing 'Enter'
    inputUpdateWhenOutOfFocus.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action to avoid form submission
            inputUpdateWhenOutOfFocus.blur(); // Trigger focusout event
        }
    });
}


//Change the quantity after pressing Enter
let debounceTimer;
function updateWhenEntering(productId, inputValue, id) {
    showSpinner()
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`/cart/enter-update-quantity/${productId}/${id}/${inputValue}`, { method: 'PUT' })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const totalPrice = data.totalProductsPrice ?? 0;
                const formattedTotalPrice = Number.isFinite(totalPrice)
                    ? totalPrice.toLocaleString('vi-VN')
                    : '0';

                document.querySelector(`#productPrice-${id}`).textContent = `${formattedTotalPrice} đ`;
                document.querySelector(`#quantityInputField-${id}`).value = data.quantity;
                const formattedPrice = (data.getTotalPriceOfProduct ?? 0).toLocaleString('vi-VN');
                document.getElementById('totalPrice').textContent = `${formattedPrice} đ`;
                document.getElementById('subtotalPrice').textContent = `${formattedPrice} đ`;
                hideSpinner()
            })
            .catch(error => {
                console.error('There was a problem updating the quantity:', error);
                // Implement error feedback here
            })
            .finally(() => {
                ; // Ensure this function properly re-enables the relevant buttons
            });
    }, 500); // Debounce time in milliseconds
}


$('#checkoutBtn').click(function () {
    showSpinner()

    $.ajax({
        url: '/cart',
        method: 'POST',
        success: function (data) {

            if (data.message && !data.isCartEmpty && !data.isCartUpdated) {
                showAlert('success', data.message, 1);


            } else if (data.message && data.isCartEmpty) {
                showAlert('warning', data.message, 2);
            } else if (data.message && data.isCartUpdated) {
                showAlert('warning', data.message, 3);
            }
            else {

                window.location.href = "/cart/checkout";


            }
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
});

let alertElement = null;
function showAlert(type, message, number) {
    console.log(type, message, number)
    alertElement?.remove();
    alertElement = $(`<div class="alert alert-${type} alert-dismissible fade show">${message}</div>`);
    $('.cart_sum_pros').prepend(alertElement);
    setTimeout(() => alertElement.alert('close'), 5000);
    if (type == "warning" && number === 2) {
        $('#applyCoupon').prop('disabled', true).addClass('btn disabled').text('X');
        $('#checkoutBtn').prop('disabled', true).addClass('btn disabled').text('Giỏ hàng trống')
    } else if (type == "warning" && number === 3 ) {
        $('#applyCoupon').prop('disabled', true).addClass('btn disabled').text('X');
        $('#checkoutBtn').replaceWith('<a class="btn btn-warning w-100" id="" href="/cart">Cập nhật lại trang</a>');
    }
    else {
        $('#checkoutBtn').replaceWith('<a class="btn btn-success w-100" id="" href="/account/manage-address?uai=t">Cập nhật địa chỉ</a>');
    }
    hideSpinner()
}


function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}


function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

