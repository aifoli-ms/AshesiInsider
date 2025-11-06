
document.addEventListener('DOMContentLoaded', (event) => {

    
    const emailButtons = document.querySelectorAll('.email-signup-button');
    emailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const emailInput = this.previousElementSibling;
            const email = emailInput ? emailInput.value : '';
            
            if (email) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Please enter your email.');
            }
        });
    });

   
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                console.log('Continuing with Google');
          
            } else if (this.classList.contains('apple')) {
                console.log('Continuing with Apple');
              
            }
        });
    });

    
    const signInButton = document.querySelector('.header-actions .signin-btn');
    const modalOverlay = document.getElementById('signin-modal');
    const modalCloseButton = document.getElementById('modal-close-btn');

    if (signInButton) {
        signInButton.addEventListener('click', function(e) {
            e.preventDefault(); 
            console.log('Sign In button clicked');
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

});

