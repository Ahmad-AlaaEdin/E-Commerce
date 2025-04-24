/**
 * User management functions for the E-Commerce application
 */

/**
 * Updates user profile information
 * @param {Object} userData - User data to update (name, email, photo)
 * @returns {Promise} - Promise resolving to the updated user data
 */
const userDataForm = document.getElementById("form-user-data");
if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    
    formData.append("photo", document.getElementById("photo").files[0]);
    formData.append("phone", document.getElementById("phone").value);
    await updateUserProfile(formData);
    // Handle success
  });
}
export const updateUserProfile = async (userData) => {
  try {
    const response = await fetch("/api/v1/users/updateMe", {
      method: "PATCH",
      body: userData, // FormData for file uploads
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
/*

export const updateUserPassword = async (passwordData: {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}): Promise<any> => {
  try {
    const response = await fetch("/api/v1/users/updatePassword", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update password");
    }

    return data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};


export const updateUserAddress = async (addressData: {
  street: string;
  city: string;
  state: string;
  zip: string;
}): Promise<any> => {
  try {
    const response = await fetch("/api/v1/address", {
      method: "POST", // Using POST as your controller uses upsert
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update address");
    }

    return data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Example usage in forms:
 *
 * Profile form:
 * document.getElementById('profileForm').addEventListener('submit', async (e) => {
 *   e.preventDefault();
 *   const formData = new FormData(e.target);
 *   try {
 *     const result = await updateUserProfile(formData);
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * });
 *
 * Password form:
 * document.getElementById('passwordForm').addEventListener('submit', async (e) => {
 *   e.preventDefault();
 *   const passwordData = {
 *     currentPassword: document.getElementById('currentPassword').value,
 *     password: document.getElementById('newPassword').value,
 *     passwordConfirm: document.getElementById('confirmPassword').value
 *   };
 *   try {
 *     const result = await updateUserPassword(passwordData);
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * });
 *
 * Address form:
 * document.getElementById('addressForm').addEventListener('submit', async (e) => {
 *   e.preventDefault();
 *   const addressData = {
 *     street: document.getElementById('address').value,
 *     city: document.getElementById('city').value,
 *     state: document.getElementById('state').value,
 *     zip: document.getElementById('zip').value
 *   };
 *   try {
 *     const result = await updateUserAddress(addressData);
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * });
 */
