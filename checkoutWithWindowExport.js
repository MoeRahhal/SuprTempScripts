// CheckoutIframeManager Class Definition
class CheckoutIframeManager {
  constructor(button) {
    this.button = button;
    this.iframe = null;
    this.serverUrl = ""; // Initialize with an empty string
    this.domainName = "";
    this.setupEventListeners();
  }

  setServerUrl(url) {
    this.serverUrl = url;
    this.domainName = this.getDomain(url);
    this.updateIframe(); // Update the iframe whenever the URL is set/changed
  }

  getDomain(url) {
    try {
      return new URL(url).origin;
    } catch (e) {
      console.error("Invalid URL provided:", e);
      return null;
    }
  }

  createIframe(url) {
    const iframe = document.createElement("iframe");
    iframe.src = `${url}?consumer=${encodeURIComponent(window.location.href)}`;
    iframe.id = "iframe-mamo-checkout";
    iframe.style = "background-color: transparent; position: fixed; top: 0; left: 0; border: 0; width: 100%; height: 100%; display: none; z-index: 99999;";
    return iframe;
  }

  updateIframe() {
    if (this.iframe) {
      document.body.removeChild(this.iframe);
    }
    if (!this.serverUrl || !this.domainName) {
      console.error("Server URL is missing or invalid.");
      return;
    }
    this.iframe = this.createIframe(this.serverUrl);
    document.body.appendChild(this.iframe);
  }

  setupEventListeners() {
    this.iframe.onload = () => console.log("Iframe loaded successfully.");
    this.iframe.onerror = () => console.error("Error loading iframe.");
    window.addEventListener("message", this.handleMessageEvent.bind(this));
  }

  handleMessageEvent(event) {
    if (event.origin !== this.domainName || !this.iframe) return;
    const command = event.data === "closeIframe" || event.data === "checkout-complete";
    if (command) {
      this.iframe.style.display = "none";
    }
  }

  displayIframe() {
    if (!this.serverUrl || !this.domainName) {
      console.error("Server URL is missing or invalid.");
      return;
    }
    if (this.iframe) {
      this.iframe.style.display = "block";
    } else {
      console.error("Iframe not found.");
    }
  }
}

// Creating and Exposing the checkoutIframeManager Instance
const checkoutBtn = document.getElementById("mamo-checkout");
const checkoutIframeManager = new CheckoutIframeManager(checkoutBtn);

// Expose the instance globally
window.checkoutIframeManager = checkoutIframeManager;

// Event Listener for Button Click
checkoutBtn.onclick = () => window.checkoutIframeManager.displayIframe();
