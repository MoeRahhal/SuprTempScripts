let serverUrl = "";
let domainName = "";

const checkoutBtn = document.getElementById("mamo-checkout");
const consumerUrl = encodeURIComponent(window.location.href);

class CheckoutIframeManager {
  constructor(button) {
    this.button = button;
    this.iframe = null;
    this.serverUrl = button.getAttribute("data-src");
    this.domainName = this.getDomain(this.serverUrl);
    this.initIframe();
    this.observeButtonChanges();
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
    iframe.src = `${url}?consumer=${consumerUrl}`;
    iframe.id = "iframe-mamo-checkout";
    iframe.style = "background-color: transparent; position: fixed; top: 0; left: 0; border: 0; width:100%; height:100%; display: none; z-index: 99999;";
    return iframe;
  }

  updateIframe() {
    const newUrl = this.button.getAttribute("data-src");
    if (newUrl !== this.serverUrl) {
      this.serverUrl = newUrl;
      this.domainName = this.getDomain(this.serverUrl);
      if (this.iframe) {
        document.body.removeChild(this.iframe);
      }
      this.initIframe();
    }
  }

  initIframe() {
    if (!this.serverUrl || !this.domainName) {
      console.error("Data source URL is missing, invalid, or domain name could not be retrieved.");
      return;
    }

    this.iframe = this.createIframe(this.serverUrl);
    document.body.appendChild(this.iframe);
    this.setupEventListeners();
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
    if (this.iframe) {
      this.iframe.style.display = "flex";
      loader.style.justifyContent = "center";
      loader.style.alignItems = "center";
    } else {
      console.error("Iframe not found.");
    }
  }

  observeButtonChanges() {
    const observer = new MutationObserver(() => this.updateIframe());
    observer.observe(this.button, { attributes: true, attributeFilter: ['data-src'] });
  }
}

const checkoutIframeManager = new CheckoutIframeManager(checkoutBtn);

window.onload = () => checkoutIframeManager.initIframe();
checkoutBtn.onclick = () => checkoutIframeManager.displayIframe();
