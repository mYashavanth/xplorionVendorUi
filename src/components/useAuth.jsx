import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const useAuth = (baseURL) => {
  const [authToken, setAuthToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // if (typeof window === "undefined") return;
    const verifyAuthToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${baseURL}/app/super-users/auth/${token}`
        );

        if (response.data.errFlag === 0) {
          setAuthToken(token);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication failed", error);
        router.push("/login");
      }
    };

    verifyAuthToken();
  }, [baseURL, router]);
  // console.log("useAuth is working", authToken);

  return authToken;
};

export default useAuth;
