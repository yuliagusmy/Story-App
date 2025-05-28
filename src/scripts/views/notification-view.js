export class NotificationView {
  constructor() {
    this.notificationContainer = null;
  }

  render() {
    return `
      <div id="notification-container" class="notification-container"></div>
    `;
  }

  afterRender() {
    this.notificationContainer = document.querySelector('#notification-container');
  }

  showNotification(message, type = 'info') {
    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement('div');
      this.notificationContainer.id = 'notification-container';
      this.notificationContainer.className = 'notification-container';
      document.body.appendChild(this.notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    this.notificationContainer.appendChild(notification);

    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification-hide');
      setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('notification-hide');
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInfo(message) {
    this.showNotification(message, 'info');
  }
}