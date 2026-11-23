import { useEffect, useState } from "react";
import Input from "../components/input";
import PasswordInput from "../components/passwordInput";
import Modal from "../components/modal";
import Button from "../components/button";
import { getProfile, updateProfile, changePassword } from "../api/profile";
import "./profile.css";

const emptyPasswordForm = { current: "", next: "", confirm: "" };

export default function Profile() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    institution_name: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState(emptyPasswordForm);
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((user) =>
        setForm({
          full_name: user.full_name || "",
          email: user.email || "",
          institution_name: user.institution_name || "",
          phone_number: user.phone_number || "",
        })
      )
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateProfile() {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required.";
    else if (form.full_name.length > 100) next.full_name = "Max 100 characters.";
    if (form.institution_name.length > 150) next.institution_name = "Max 150 characters.";
    if (form.phone_number.length > 20) next.phone_number = "Max 20 characters.";
    return next;
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    const found = validateProfile();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        institution_name: form.institution_name,
        phone_number: form.phone_number,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handlePwChange(e) {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  }

  function validatePassword() {
    const next = {};
    if (!pwForm.current) next.current = "Enter your current password.";
    if (pwForm.next.length < 8 || !/\d/.test(pwForm.next)) {
      next.next = "At least 8 characters and one number.";
    } else if (pwForm.next === pwForm.current) {
      next.next = "New password must be different.";
    }
    if (pwForm.confirm !== pwForm.next) next.confirm = "Passwords do not match.";
    return next;
  }

  async function handlePasswordSubmit() {
    const found = validatePassword();
    setPwErrors(found);
    if (Object.keys(found).length > 0) return;

    setPwSaving(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      closePasswordModal();
      setMessage("Password changed successfully.");
    } catch (err) {
      setPwErrors({ current: err.message });
    } finally {
      setPwSaving(false);
    }
  }

  function closePasswordModal() {
    setPwOpen(false);
    setPwForm(emptyPasswordForm);
    setPwErrors({});
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <p className="profile-subtitle">Manage your account information</p>

      {message && <p className="profile-message">{message}</p>}

      <form className="profile-card" onSubmit={handleSave}>
        <Input
          label="Full Name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          error={errors.full_name}
        />
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled
          helperText="Email can't be changed."
        />
        <Input
          label="Institution"
          name="institution_name"
          value={form.institution_name}
          onChange={handleChange}
          placeholder="University of North Texas"
          error={errors.institution_name}
        />
        <Input
          label="Phone Number"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          error={errors.phone_number}
        />

        <div className="profile-actions">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="secondary" onClick={() => setPwOpen(true)}>
            Change Password
          </Button>
        </div>
      </form>

      <Modal
        isOpen={pwOpen}
        onClose={closePasswordModal}
        title="Change Password"
        footer={
          <>
            <Button variant="secondary" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handlePasswordSubmit} disabled={pwSaving}>
              {pwSaving ? "Saving..." : "Update Password"}
            </Button>
          </>
        }
      >
        <PasswordInput
          label="Current Password"
          name="current"
          value={pwForm.current}
          onChange={handlePwChange}
          error={pwErrors.current}
        />
        <PasswordInput
          label="New Password"
          name="next"
          value={pwForm.next}
          onChange={handlePwChange}
          error={pwErrors.next}
        />
        <PasswordInput
          label="Confirm New Password"
          name="confirm"
          value={pwForm.confirm}
          onChange={handlePwChange}
          error={pwErrors.confirm}
        />
      </Modal>
    </div>
  );
}