// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', (event) => {

    // --- Modal Logic ---

    // Get modal elements
    const signInButton = document.getElementById('user-profile-btn');
    const modalOverlay = document.getElementById('signin-modal');
    const modalCloseButton = document.getElementById('modal-close-btn');

    // Get elements *inside* the modal
    // This scoping is important to avoid conflicts
    const modalEmailButton = modalOverlay.querySelector('.email-signup-button');
    const modalEmailInput = modalOverlay.querySelector('#modal-email-input');
    const modalSocialButtons = modalOverlay.querySelectorAll('.social-button');

    // Event listener for the user profile icon (header) to *open* the modal
    if (signInButton) {
        signInButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default button behavior
            console.log('User profile button clicked');
            if (modalOverlay) {
                modalOverlay.classList.add('show');
            }
        });
    }

    // Event listener for the modal's close 'x' button
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    }

    // Event listener to close the modal by clicking on the overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            // Check if the click is on the overlay itself, not the modal box
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    }

    // Event listener for the "Continue with email" button *inside the modal*
    if (modalEmailButton) {
        modalEmailButton.addEventListener('click', function() {
            const email = modalEmailInput ? modalEmailInput.value : '';
            
            if (email) {
                // Using console.log instead of alert for a cleaner experience
                console.log('Modal: Continuing with email: ' + email);
                // In a real application, you would send this to a server
            } else {
                console.log('Modal: Please enter your email.');
                // You could show an error message near the input
            }
        });
    }

    // Event listeners for social media buttons *inside the modal*
    modalSocialButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                console.log('Modal: Continuing with Google');
                // Trigger Google Sign-In flow
            } else if (this.classList.contains('apple')) {
                console.log('Modal: Continuing with Apple');
                // Trigger Apple Sign-In flow
            }
        });
    });

});
