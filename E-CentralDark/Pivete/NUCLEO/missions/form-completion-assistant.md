# MISSAO - form-completion-assistant.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\form-completion-assistant.md
**SHA:** 1f6ea68d5c38a88a
**Timestamp:** 2026-08-26T18:42:52.972376
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}">

### Ouro Bruto (primeiros 5000 chars)
```
# Form Completion Assistant with Co-Browsing

Guide customers through complex forms in real-time using visual assistance and privacy-protected co-browsing.

## Use Case Overview

**Problem**: High form abandonment rates due to complexity, confusion, or lack of confidence in data entry.

**Solution**: Implement Zoom Cobrowse SDK to provide real-time visual guidance while protecting sensitive customer data through privacy masking.

**Related Skills**:
- [Zoom Cobrowse SDK](../../cobrowse-sdk/SKILL.md)
- [Customer Support Co-Browsing](customer-support-cobrowsing.md)

## Target Scenarios

### Financial Services
- Loan applications
- Account opening forms
- Investment questionnaires
- Insurance claims

### Healthcare
- Patient intake forms
- Insurance enrollment
- Medical history questionnaires
- Telehealth registration

### E-Commerce
- Complex checkout flows
- B2B order forms
- Subscription sign-ups
- Custom product configurators

## Implementation

### Quick Start Pattern

```html
<!DOCTYPE html>
<html>
<head>
  <title>Loan Application - Form Assistant</title>
  <script type="module">
    const ZOOM_SDK_KEY = 'YOUR_SDK_KEY';

    // Load Cobrowse SDK
    (function(r, a, b, f, c, d) {
      r[f] = r[f] || { init: function() { r.ZoomCobrowseSDKInitArgs = arguments }};
      var fragment = a.createDocumentFragment();
      function loadJs(url) {
        c = a.createElement(b);
        d = a.getElementsByTagName(b)[0];
        c["async"] = false;
        c.src = url;
        fragment.appendChild(c);
      }
      loadJs(`https://us01-zcb.zoom.us/static/resource/sdk/${ZOOM_SDK_KEY}/js/2.13.2`);
      d.parentNode.insertBefore(fragment, d);
    })(window, document, "script", "ZoomCobrowseSDK");
  </script>
</head>
<body>
  <div class="form-header">
    <h1>Loan Application</h1>
    <button id="help-btn">Need Help Completing This Form?</button>
  </div>

  <form id="loan-application">
    <!-- Step 1: Personal Information -->
    <section class="form-step" data-step="1">
      <h2>Personal Information</h2>
      <input name="firstName" placeholder="First Name" required>
      <input name="lastName" placeholder="Last Name" required>
      <input name="email" type="email" placeholder="Email" required>
      <input name="phone" type="tel" placeholder="Phone Number" required>
    </section>

    <!-- Step 2: Sensitive Information (MASKED) -->
    <section class="form-step" data-step="2">
      <h2>Identification</h2>
      <input name="ssn" class="pii-mask" placeholder="SSN"
             pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}">
      <small>🔒 This field is hidden from support agents</small>

      <input name="dob" class="pii-mask" type="date" placeholder="Date of Birth">
      <small>🔒 This field is hidden from support agents</small>
    </section>

    <!-- Step 3: Financial Information (PARTIALLY MASKED) -->
    <section class="form-step" data-step="3">
      <h2>Financial Information</h2>
      <input name="income" type="number" placeholder="Annual Income">
      <input name="employer" placeholder="Employer Name">

      <input name="accountNumber" class="pii-mask" placeholder="Bank Account Number">
      <small>🔒 This field is hidden from support agents</small>

      <input name="routingNumber" class="pii-mask" placeholder="Routing Number">
      <small>🔒 This field is hidden from support agents</small>
    </section>

    <!-- Step 4: Loan Details -->
    <section class="form-step" data-step="4">
      <h2>Loan Request</h2>
      <input name="loanAmount" type="number" placeholder="Requested Amount">
      <select name="loanPurpose">
        <option value="">Select Purpose</option>
        <option value="home">Home Purchase</option>
        <option value="auto">Auto Purchase</option>
        <option value="personal">Personal</option>
      </select>
    </section>
  </form>

  <div id="help-widget" style="display:none;">
    <p>Share this PIN with your support agent:</p>
    <div id="pin-code"></div>
    <button id="end-session">End Assistance</button>
  </div>

  <script>
    let sessionRef = null;
    let currentStep = 1;

    const settings = {
      allowAgentAnnotation: true,     // Agent can highlight fields
      allowCustomerAnnotation: false,
      piiMask: {
        maskType: "custom_input",
        maskCssSelectors: ".pii-mask"  // Hide sensitive fields
      }
    };

    ZoomCobrowseSDK.init(settings, function({ success, session, error }) {
      if (success) {
        sessionRef = session;

        session.on("pincode_updated", (payload) => {
          document.getElementById("pin-code").innerText = payload.pincode;
          document.getElementById("help-widget").style.display = "block";

          // Optional: Auto-dial support or show phone number
          showSupportContact(payload.pincode);
        });

        session.on("agent_joined", () => {
          showBanner("Support agent is now helping you");
          trackEvent("form_assistance_started");
        });

        session.on("agent_left", (
```