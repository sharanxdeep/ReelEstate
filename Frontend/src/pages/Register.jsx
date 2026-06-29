import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const data = await registerUser(
      formData.email,
      formData.name,
      formData.password,
      formData.phone,
    );
    if (data.error) {
      setError(data.error || "Registration failed");
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-300">
      <div className="bg-white p-8 rounded-lg w-96">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">ReelEstate</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border border-primary-200 rounded mb-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border border-primary-200 rounded mb-4"
        />

        <PhoneInput
          defaultCountry="in"
          value={formData.phone}
          onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          className="mb-4"
          inputClassName="!w-full !p-3 !border !border-primary-200 !rounded !text-base !h-full"
          countrySelectorStyleProps={{
            buttonClassName:
              "!p-3 !border !border-primary-200 !rounded-l !h-full",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 border border-primary-200 rounded mb-6"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-primary-900 text-white p-3 rounded font-bold hover:bg-primary-800"
        >
          Register
        </button>

        <p className="text-center text-sm text-primary-700 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="font-bold cursor-pointer text-primary-900"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
