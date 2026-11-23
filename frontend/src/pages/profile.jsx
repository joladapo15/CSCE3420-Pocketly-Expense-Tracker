import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Input from "../components/input";
import PasswordInput from "../components/passwordInput";
import Modal from "../components/modal";
import Button from "../components/button";
import { getProfile, updateProfile, changePassword, updateAvatar } from "../api/profile";
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
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [totalTransactions, setTotalTransactions] = useState(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState(emptyPasswordForm);
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const user = await getProfile();

        setForm({
          full_name: user.full_name || "",
          email: user.email || "",
          institution_name: user.institution_name || "",
          phone_number: user.phone_number || "",
        });

        setCreatedAt(user.created_at);
        setAvatar(user.avatar_url || null);
      } catch (err) {
        setMessage(err.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }

      try {
        const data = await apiFetch("/api/transactions");
        setTotalTransactions(data.transactions.length);
      } catch (err) {
        console.error("Failed to load transaction count:", err);
      }
    }

    loadProfileData();
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
      setMessageType("success");
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
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
      setMessageType("success");
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

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setAvatarError("Only JPG and PNG files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    setAvatarError("");

    try {
      const avatarData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read image."));
        reader.readAsDataURL(file);
      });

      const result = await updateAvatar(avatarData);

      setAvatar(result.avatar_url);
      setMessage("Profile photo updated successfully.");
      setMessageType("success");
    } catch (err) {
      setAvatarError(err.message || "Failed to update profile photo.");
    } finally {
      e.target.value = "";
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <p className="profile-subtitle">Manage your account information</p>

      {message && (
        <p className={`profile-message ${messageType}`}>
          {message}
        </p>
      )}

      <div className="profile-layout">
        {/* Left: Avatar Card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt="Profile avatar" />
            ) : (
              <span>
                {form.full_name.trim()
                  ? form.full_name.trim().charAt(0).toUpperCase()
                  : "?"}
              </span>
            )}
          </div>

          <h2>{form.full_name}</h2>
          <p className="profile-avatar-email">{form.email}</p>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-icon">📅</span>
              <div>
                <span className="profile-stat-label">Active since</span>
                <strong>
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">📈</span>
              <div>
                <span className="profile-stat-label">Total Transactions</span>
                <strong>{totalTransactions ?? "—"}</strong>
              </div>
            </div>
          </div>

          <div className="profile-photo-upload">
            <label htmlFor="profile-photo" className="profile-photo-btn">
              Change photo
            </label>
            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
              hidden
            />
            <span>JPG or PNG. Max 2 MB.</span>
          </div>

          {avatarError && (
            <p className="profile-avatar-error">{avatarError}</p>
          )}
        </div>

        {/* Right: Existing Profile Form */}
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
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwOpen}
        onClose={closePasswordModal}
        title="Change Password"
        footer={
          <>
            <Button variant="secondary" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handlePasswordSubmit}
              disabled={pwSaving}
            >
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