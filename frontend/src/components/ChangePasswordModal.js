import React, { useState } from "react";
import "./ChangePasswordModal.css"; // optional for styling

const ChangePasswordModal = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("Password successfully changed!");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };
 

  return (
  <div 
    className="modal-overlay"
    onClick={onClose} // click outside closes modal
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()} // prevents overlay click closing modal
    >
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className="buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Update Password"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  </div>
);

  
};

export default ChangePasswordModal;
