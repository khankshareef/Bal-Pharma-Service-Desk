import { motion } from "framer-motion";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import bal_pharma_limited_logo from "../../assets/bal_pharma_limited_logo.jpg";
import Reusable_Button from "../../component/button/Reusable_Button";
import LoginSlider from "../../component/common/login_slider/LoginSlider";
import Reusable_Field from "../../component/fields/Reusable_Field";
import type { AppDispatch } from "../../store/login_route_store/store";
import { FirstTimeChangePassword } from "../../store/user/slice/Login_Slice";

type LocationState = { empId?: string } | null;

const Password_Change = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const empId: string =
    (location.state as LocationState)?.empId ??
    sessionStorage.getItem("pwdChangeEmpId") ??
    "";

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });  

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!empId) {
      alert("Employee ID missing. Please login again.");
      navigate("/login");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    const payload = {
      employeeId: empId,                        
      oldPassword: password.oldPassword,       
      newPassword: password.newPassword,
      confirmPassword: password.confirmPassword,
    };

    console.log("CHANGE PASSWORD PAYLOAD:", payload);

    try {
      const response = await dispatch(FirstTimeChangePassword(payload)).unwrap();
      console.log("CHANGE PASSWORD RESPONSE:", response);
      sessionStorage.removeItem("pwdChangeEmpId");
      navigate("/login");
    } catch (error) {
      console.log("Change password failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <LoginSlider />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#003D8C]/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-sm sm:bg-transparent rounded-3xl sm:rounded-none p-8 sm:p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-none border border-slate-100 sm:border-none z-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block w-20 h-20 bg-white rounded-full shadow-sm mb-5 overflow-hidden p-1 border border-slate-100">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={bal_pharma_limited_logo}
                  alt="Bal Pharma Limited"
                  className="w-[100%] h-[100%] object-contain"
                />
              </motion.div>
            </div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800"
            >
              Update Password
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm mt-2 font-medium"
            >
              {empId ? `Employee: ${empId}` : "Please create a new password."}
            </motion.p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <Reusable_Field
              label="Current Password"
              title="Enter Current Password"
              name="oldPassword"                  
              type="password"
              placeholder="Enter Current Password"
              value={password.oldPassword}
              onChange={handleOnchange}
            />

            <Reusable_Field
              label="New Password"
              title="Enter New Password"
              name="newPassword"
              type="password"
              placeholder="Enter New Password"
              value={password.newPassword}
              onChange={handleOnchange}
            />

            <Reusable_Field
              label="Confirm Password"
              title="Enter Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Enter Confirm Password"
              value={password.confirmPassword}
              onChange={handleOnchange}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-2"
            >
              <Reusable_Button
                children="Confirm Password"
                variant="primary"
                className="w-full bg-[#003D8C] hover:bg-[#002f6c] text-white"
              />
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-xs font-medium text-slate-400"
          >
            <p>© {new Date().getFullYear()} Bal Pharma Limited. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Password_Change;