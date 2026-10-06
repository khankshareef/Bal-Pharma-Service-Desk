import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useDispatch } from "react-redux";
import Loader from "../../loader/Loader";
import type { AppDispatch } from "../../../store/store/Store";
import { meApi } from "../../../store/user/slice/Login_Slice";

const AuthBootstrap = ({ children }: PropsWithChildren) => {
  const dispatch = useDispatch<AppDispatch>();
  const started = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const isPasswordChangeRoute = window.location.pathname === "/change-password";
    if (!sessionStorage.getItem("accessToken") || isPasswordChangeRoute) {
      setReady(true);
      return;
    }

    dispatch(meApi()).finally(() => setReady(true));
  }, [dispatch]);

  if (!ready) return <Loader />;

  return children;
};

export default AuthBootstrap;
