import $ from 'jquery';
import * as firebase from 'firebase';

class Modal {
  constructor() {
    // Shortcuts to DOM Elements.
    this.openModalButton = $('.open-modal');
    this.modal = $('.modal');
    this.closeModalButton = $('.modal__close');
    this.name = $('#contact-name');
    this.company = $('#contact-company');
    this.email = $('#contact-email');
    this.phone = $('#contact-phone');

    this.submitButton = $('#contact-submit');
    this.events();
  }

  events() {
    // clicking the open modal button
    this.openModalButton.click(this.openModal.bind(this));

    // clicking the x close modal button
    this.closeModalButton.click(this.closeModal.bind(this));

    // clicking the submit form button
    this.submitButton.click(this.closeModal.bind(this));

    // pushes any key
    $(document).keyup(this.keyPressHandler.bind(this));

    $(
      function() {
        // Initialize Firebase
        const config = {
          apiKey: 'AIzaSyA397G3xKSwW5NhD8x6a_m91zx838hUJnY',
          authDomain: 'rozaroute-62f40.firebaseapp.com',
          databaseURL: 'https://rozaroute-62f40.firebaseio.com',
          projectId: 'rozaroute-62f40',
          storageBucket: 'rozaroute-62f40.appspot.com',
          messagingSenderId: '894836901301'
        };
        firebase.initializeApp(config);
        // form submit
        $('#contact-form').on('submit', event => {
          event.preventDefault();
          const contact = {
            name: this.name.val(),
            company: this.company.val(),
            email: this.email.val(),
            phone: this.phone.val()
          };
          firebase.database().ref('contacts').push({ contact }).catch(error => {
            console.log(error);
          });
          $('#contact-form').trigger('reset');
        });
      }.bind(this)
    );
  }

  keyPressHandler(e) {
    if (e.keyCode == 27) {
      this.closeModal();
    }
  }

  openModal() {
    this.modal.addClass('modal--is-visible');
    return false;
  }

  closeModal() {
    this.modal.removeClass('modal--is-visible');
  }
}

export default Modal;
