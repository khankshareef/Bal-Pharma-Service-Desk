import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import bal_pharma_limited_logo from "../../assets/bal_pharma_limited_logo.jpg";
import Reusable_Button from "../../component/button/Reusable_Button";
import LoginSlider from "../../component/common/login_slider/LoginSlider";
import Reusable_Field from "../../component/fields/Reusable_Field";
import Loader from "../../component/loader/Loader";
import ReusablePopup, { type PopupType } from "../../component/popups/Reusable_Popup";
import type { AppDispatch } from "../../store/login_route_store/store";
import { LoginSlice } from "../../store/user/slice/Login_Slice";
function getCoords(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [employeeId, setEmployeeCode] = useState("");
  const [role, setRole] = useState("Employee");
  const [password, setPassword] = useState("");
  const [isLoader, setLoader] = useState(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: PopupType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const closePopup = () => setPopup((prev) => ({ ...prev, isOpen: false }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "employeeId") setEmployeeCode(value);
    if (name === "role") setRole(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    setLoader(true);

    const coords = await getCoords();

    const payload = {
      employeeId,
      role,
      password,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    try {
      const loginRes = await dispatch(LoginSlice(payload)).unwrap();

      try {
        setLoader(false);

        if (loginRes.mustChangePassword === true) {
          setPopup({
            isOpen: true,
            type: "error",
            title: "Password Change Required",
            message: "You must change your password before accessing the system.",
            confirmText: "Change Password",
            onConfirm: () => {
              closePopup();
              navigate("/change-password", {
                state: { empId: loginRes?.employeeId ?? employeeId },
              });
            },
          });
          return;
        }

        const roleName = (loginRes?.activeRole || "").toString().toUpperCase();

        const proceedToDashboard = () => {
          closePopup();
          if (navTimerRef.current) {
            clearTimeout(navTimerRef.current);
            navTimerRef.current = null;
          }

          switch (roleName) {
            case "EMPLOYEE":
              navigate("/employee/dashboard");
              break;
            case "EXECUTIVE":
              navigate("/executive/dashboard");
              break;
            case "DEPUTY_MANAGER":
              navigate("/deputy-manager/dashboard");
              break;
            case "SUPER_MANAGER":
              navigate("/super-manager/dashboard");
              break;
            case "ADMIN":
              navigate("/super-manager/dashboard");
              break;
            default:
              console.error("Unknown role:", roleName);
              navigate("/login");
          }
        };

        setPopup({
          isOpen: true,
          type: "success",
          title: "Login Successful",
          message:
            loginRes.message || "You have successfully logged in to the system.",
          confirmText: "Continue",
          onConfirm: proceedToDashboard,
        });

        navTimerRef.current = setTimeout(() => {
          proceedToDashboard();
        }, 3000);
      } catch (meError: any) {
        setLoader(false);
        console.log("ME API ERROR:", meError);
        const isPwdRequired = meError?.code === "PASSWORD_CHANGE_REQUIRED";
        setPopup({
          isOpen: true,
          type: "error",
          title: isPwdRequired
            ? "PASSWORD_CHANGE_REQUIRED"
            : "Authentication Error",
          message:
            meError?.error ||
            meError?.message ||
            "Failed to fetch user details.",
          confirmText: isPwdRequired ? "Change Password" : "OK",
          onConfirm: () => {
            closePopup();
            if (isPwdRequired) navigate("/change-password");
          },
        });
      }
    } catch (error: any) {
      setLoader(false);
      console.log("Login failed:", error);

      const isPwdRequired =
        error?.code === "PASSWORD_CHANGE_REQUIRED" ||
        error?.message ===
          "Password change required before accessing the system";

      setPopup({
        isOpen: true,
        type: "error",
        title: isPwdRequired ? "PASSWORD_CHANGE_REQUIRED" : "Login Failed",
        message:
          error?.error ||
          error?.message ||
          "Invalid credentials or server error.",
        confirmText: isPwdRequired ? "Change Password" : "Try Again",
        onConfirm: () => {
          closePopup();
          if (isPwdRequired) navigate("/change-password");
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans relative">
      {isLoader && <Loader />}
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
              Bal Pharma Limited
            </motion.h2>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm mt-2 font-medium"
            >
              Please enter your details to sign in.
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
              label="Employee ID"
              type="text"
              name="employeeId"
              placeholder="DEV-SM-001"
              value={employeeId}
              onChange={handleChange}
            />

            <Reusable_Field
              label="Role"
              type="select"
              name="role"
              value={role}
              onChange={handleChange}
              options={[
                { label: "Employee (Create Ticket)", value: "Employee" },
                { label: "Executive (Approve Tickets)", value: "Executive" },
                {
                  label: "Super Manager (Head of Department)",
                  value: "SUPER_MANAGER",
                },
                {
                  label: "Deputy Manager (Department Manager)",
                  value: "DEPUTY_MANAGER",
                },
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <Reusable_Field
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={handleChange}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-2"
            >
              <Reusable_Button
                children="Sign in"
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

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={closePopup}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        onConfirm={popup.onConfirm ?? closePopup}
      />
    </div>
  );
};

export default Login;