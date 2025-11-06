
document.addEventListener('DOMContentLoaded', (event) => {

    const signInButton = document.getElementById('user-profile-btn');
    const modalOverlay = document.getElementById('signin-modal');
    const modalCloseButton = document.getElementById('modal-close-btn');

    const modalEmailButton = modalOverlay.querySelector('.email-signup-button');
    const modalEmailInput = modalOverlay.querySelector('#modal-email-input');
    const modalSocialButtons = modalOverlay.querySelectorAll('.social-button');


    if (signInButton) {
        signInButton.addEventListener('click', function(e) {
            e.preventDefault(); 
            console.log('User profile button clicked');
            if (modalOverlay) {
                modalOverlay.classList.add('show');
            }
        });
    }


    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
      
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    }


    if (modalEmailButton) {
        modalEmailButton.addEventListener('click', function() {
            const email = modalEmailInput ? modalEmailInput.value : '';
            
            if (email) {
               
                console.log('Modal: Continuing with email: ' + email);
               
            } else {
                console.log('Modal: Please enter your email.');
          
            }
        });
    }

  
    modalSocialButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                console.log('Modal: Continuing with Google');
            
            } else if (this.classList.contains('apple')) {
                console.log('Modal: Continuing with Apple');
             
            }
        });
    });

});
