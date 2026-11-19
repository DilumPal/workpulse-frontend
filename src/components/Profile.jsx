import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editable form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  // Photo upload state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/employees/me");
        const data = response.data;
        setProfile(data);

        // Pre-fill the editable fields
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
        });
        setPreviewUrl(data.profilePhotoUrl || null);
      } catch (err) {
        setError("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show instant preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      let photoUrl = profile.profilePhotoUrl || "";

      // 1. Upload new photo to Supabase Storage if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${profile.employeeId || Date.now()}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, selectedFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      // 2. Send text fields + permanent URL to Spring Boot
      const uploadData = new FormData();
      uploadData.append("firstName", formData.firstName);
      uploadData.append("lastName", formData.lastName);
      uploadData.append("phoneNumber", formData.phoneNumber);
      if (photoUrl) {
        uploadData.append("profilePhotoUrl", photoUrl);
      }

      const response = await api.put("/employees/me", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(response.data);
      setPreviewUrl(response.data.profilePhotoUrl || photoUrl);
      setSelectedFile(null);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Notify EmployeeLayout sidebar to update immediately
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: response.data }),
      );
    } catch (err) {
      const rawError =
        err.response?.data?.details ||
        err.message ||
        "Failed to update profile.";
      setError(
        typeof rawError === "object"
          ? Object.values(rawError).join(", ")
          : String(rawError),
      );
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
    // Reset to original data
    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phoneNumber: profile?.phoneNumber || "",
    });
    setPreviewUrl(profile?.profilePhotoUrl || null);
    setSelectedFile(null);
  };

  if (!profile)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );

  // A reusable input style based on whether it is disabled or editable
  const getInputStyle = (disabled) =>
    `w-full px-4 py-2 border rounded-md text-sm focus:outline-none ${
      disabled
        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
        : "bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-200"
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">
          {successMessage}
        </div>
      )}

      <div className="p-8 bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* Top Section: Photo and Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8 pb-8 border-b">
            {/* Profile Photo Area */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400 font-bold capitalize">
                    {profile.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
                  title="Change Photo"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-500 font-medium">
                {profile.jobRole || "Employee"}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                ID: {profile.id || profile.employeeId}
              </span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EDITABLE FIELDS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className={getInputStyle(!isEditing)}
                value={isEditing ? formData.firstName : profile.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className={getInputStyle(!isEditing)}
                value={isEditing ? formData.lastName : profile.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                className={getInputStyle(!isEditing)}
                value={
                  isEditing ? formData.phoneNumber : profile.phoneNumber || "--"
                }
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
              />
            </div>

            {/* READ-ONLY FIELDS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                disabled
                className={getInputStyle(true)}
                value={
                  profile.departmentName ||
                  profile.department?.name ||
                  "Unassigned"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                type="text"
                disabled
                className={getInputStyle(true)}
                value={profile.jobRole || "Unassigned"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Type
              </label>
              <input
                type="text"
                disabled
                className={getInputStyle(true)}
                value={profile.employmentType || profile.empType || "Full time"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                type="text"
                disabled
                className={getInputStyle(true)}
                value={
                  profile.salary
                    ? `Rs. ${parseFloat(profile.salary).toLocaleString()}`
                    : "--"
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}