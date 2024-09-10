import { supabase } from "../db.js";

class AuthedProfile extends HTMLElement {
  constructor() {
    super();
    this.image = "";
    this.name = "";
  }

  render() {
    this.innerHTML = `
    <sl-avatar id="avatar" image="${this.image}" lazy></sl-avatar>
    <sl-drawer label="Profile" class="drawer-overview">
    <form id="profile-form" class="input-validation-required">
      <sl-input name="name" label="Name" required value="${this.name}"></sl-input>
      <br />
      <input name="avatar" label="Avatar" type="file"></input>
      <br /><br />
      <sl-button type="submit" variant="primary">Submit</sl-button>
    </form>
      <sl-button slot="footer" variant="primary">Close</sl-button>
    </sl-drawer>
    `;
    this.addClickHandler();
    this.addSubmitHandler();
  }

  connectedCallback() {
    this.render();
    this.setAvatarUrl();
  }

  addClickHandler() {
    console.log("addClickHandler");
    const avatar = document.querySelector("#avatar");
    avatar.addEventListener("click", (event) => {
      console.log("avatar", event);
      const drawer = document.querySelector(".drawer-overview");
      drawer.show();
      // supabase.auth.signOut();
    });
  }

  async setAvatarUrl() {
    const { data: auth, error } = await supabase.auth.getUser();

    const fileName = `${auth.user.id}/avatar.jpg`;

    const { data: avatarUrlData, error: avatarUrlError } =
      await supabase.storage.from("avatars").getPublicUrl(fileName);
    console.log("avatarUrlData", avatarUrlData);
    console.log("avatarUrlError", avatarUrlError);
    /*
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", auth.user.id)
      .single();
*/
    this.image = avatarUrlData.publicUrl;
    this.render();
  }

  addSubmitHandler() {
    const form = document.querySelector("#profile-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const { data: auth, error } = await supabase.auth.getUser();

      const formData = new FormData(form);

      const name = formData.get("name");
      const avatar = formData.get("avatar");

      console.log("name", name);
      console.log("avatar", avatar);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: auth.user.id, full_name: name })
        .select();

      if (avatar) {
        console.log("Uploading avatar", avatar);
        const fileName = `${auth.user.id}/avatar.jpg`;
        console.log("fileName", fileName);

        const { data: avatarData, error: avatarError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar, {
            upsert: true,
          });

        console.log("avatarData", avatarData);
        console.log("avatarError", avatarError);

        const { data: avatarUrlData, error: avatarUrlError } =
          await supabase.storage.from("avatars").getPublicUrl(fileName);

        console.log("avatarUrlData", avatarUrlData);
        console.log("avatarUrlError", avatarUrlError);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: auth.user.id, avatar_url: avatarUrlData.publicUrl })
          .select();
        console.log("profileData", profileData);
        console.log("profileError", profileError);
      }
    });
  }
}

customElements.define("authed-profile", AuthedProfile);
