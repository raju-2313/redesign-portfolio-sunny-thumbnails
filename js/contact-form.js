(() => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-form-status");
  const submit = form?.querySelector(".contact-submit");
  if (!form || !status || !submit) return;

  const endpoint = "https://wdvimoujmgruvvzeaajk.supabase.co/rest/v1/contact_submissions";
  const publishableKey = "sb_publishable_Y1n8GUJGTccbsifQNX84cg_0vAW4EZI";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    submit.disabled = true;
    status.className = "contact-form-status";
    status.textContent = "Sending your inquiry…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: publishableKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("The inquiry could not be sent.");

      form.reset();
      status.className = "contact-form-status is-success";
      status.textContent = "Thanks — your inquiry has been sent.";
    } catch {
      status.className = "contact-form-status is-error";
      status.textContent = "Something went wrong. Please check your details and try again.";
    } finally {
      submit.disabled = false;
    }
  });
})();
