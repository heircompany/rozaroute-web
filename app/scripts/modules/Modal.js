import $ from 'jquery';

class Modal {
  constructor() {
    // Shortcuts to DOM Elements.
    this.openModalButton = $('.open-modal');
    this.modal = $('.modal');
    this.closeModalButton = $('.modal__close');
    this.name = $('#contact-name');
    this.email = $('#contact-email');
    this.phone = $('#contact-phone');
    this.zipcode = $('#contact-zipcode');

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
