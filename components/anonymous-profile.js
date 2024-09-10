import { supabase } from "../db.js";
import { notify } from "../notify.js";

class AnonymousProfile extends HTMLElement {
  constructor() {
    super();
    this.error = "";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const errorMessage = this.error != "" ? `<p>${this.error}</p>` : "";

    this.innerHTML = `<sl-button variant="primary" id="sign-in">Sign In</sl-button>
<sl-dialog label="Get magic link" class="dialog-overview">
${errorMessage}
${
  this.thanks
    ? `<p>${this.thanks}</p>`
    : `
    <form>
      <sl-input id="email" name="email" label="Email" required></sl-input>
      <br/>
      <sl-button variant="primary" id="login">Login</sl-button>
    </form>`
}

</sl-dialog>
`;

    this.querySelector("#sign-in").addEventListener("click", () => {
      this.querySelector("sl-dialog").show();
      this.querySelector("#login").addEventListener("click", (event) => {
        this.handleSignin(event);
      });
    });
  }

  async handleSignin(event) {
    this.error = "";
    event.preventDefault();
    const formData = new FormData(this.querySelector("form"));

    const email = formData.get("email");
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // emailRedirectTo: `${window.location.origin}/#profile`,
      },
    });

    if (error) {
      this.error = error.message;
      notify(error.message, "danger");
      this.render();
      this.querySelector("sl-dialog").show();
    } else {
      notify("Check your email for a login link", "success");
      this.thanks = "Check your email for a login link";
      this.render();
    }
  }
}

customElements.define("anonymous-profile", AnonymousProfile);
