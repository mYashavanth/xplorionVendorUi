import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/login.module.css";
import { BiShowAlt } from "react-icons/bi";
import { BiHide } from "react-icons/bi";
import axios from "axios";
import { useRouter } from "next/router";

export default function ChangePassword() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const router = useRouter();
  console.log({ authToken });

  useEffect(() => {
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

        console.log({ authResponce: response });

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
  }, [router]);

  // State to handle form data
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State to toggle password visibility for each input
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Show password on press and hold
  const handlePressHoldPassword = (field, show) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: show,
    }));
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create new form data
    const newFormData = new FormData();
    newFormData.append("oldPassword", formData.oldPassword);
    newFormData.append("newPassword", formData.newPassword);
    newFormData.append("confirmPassword", formData.confirmPassword);

    try {
      setLoading(true);
      const response = await axios.post(
        `${baseURL}/app/super-users/change-password`,
        newFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.errFlag === 0) {
        window.location.href = "/"; // Redirect after successful password change
      } else {
        setLoginFailed(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Change Password</title>
        <meta name="description" content="Change Password" />
      </Head>
      <main className={styles.main}>
        <Flex direction="column" alignItems={"center"} gap={"24px"}>
          <Flex>
            <Box
              position="relative"
              w={"100%"}
              maxWidth={504}
              h={"auto"}
              maxHeight={440}
            >
              <Image
                src="/login/Photo.png"
                alt="photo"
                width={504}
                height={440}
                style={{
                  borderRadius: "8px 0px 0px 8px",
                  objectFit: "cover",
                }}
                priority={true}
              />
            </Box>
            <VStack
              p="40px"
              w={"504px"}
              alignItems={"flex-start"}
              gap={"24px"}
              justifyContent={"center"}
              borderRadius={"0px 8px 8px 0px"}
              bgColor={"#FFFFFF"}
            >
              <Heading fontSize={"24px"} fontWeight={600}>
                Change Password
              </Heading>
              <form onSubmit={handleSubmit}>
                <VStack alignItems={"flex-start"} gap={"16px"}>
                  {/* Old Password Input */}
                  <Box w={"100%"}>
                    <label htmlFor="oldPassword">Old Password</label>
                    <InputGroup size="md">
                      <Input
                        id="oldPassword"
                        name="oldPassword"
                        type={showPassword.oldPassword ? "text" : "password"}
                        placeholder="Enter Old Password"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        border={
                          loginFailed ? "1px solid red" : "1px solid #888888"
                        }
                        onClick={() => setLoginFailed(false)}
                        required
                      />
                      <InputRightElement width="4.5rem">
                        <Box
                          onMouseDown={() =>
                            handlePressHoldPassword("oldPassword", true)
                          }
                          onMouseUp={() =>
                            handlePressHoldPassword("oldPassword", false)
                          }
                          onMouseLeave={() =>
                            handlePressHoldPassword("oldPassword", false)
                          }
                          cursor="pointer"
                        >
                          {showPassword.oldPassword ? (
                            <BiHide />
                          ) : (
                            <BiShowAlt />
                          )}
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  {/* New Password Input */}
                  <Box w={"100%"}>
                    <label htmlFor="newPassword">New Password</label>
                    <InputGroup size="md">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.newPassword ? "text" : "password"}
                        placeholder="Enter New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        border={
                          loginFailed ? "1px solid red" : "1px solid #888888"
                        }
                        onClick={() => setLoginFailed(false)}
                        required
                      />
                      <InputRightElement width="4.5rem">
                        <Box
                          onMouseDown={() =>
                            handlePressHoldPassword("newPassword", true)
                          }
                          onMouseUp={() =>
                            handlePressHoldPassword("newPassword", false)
                          }
                          onMouseLeave={() =>
                            handlePressHoldPassword("newPassword", false)
                          }
                          cursor="pointer"
                        >
                          {showPassword.newPassword ? (
                            <BiHide />
                          ) : (
                            <BiShowAlt />
                          )}
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  {/* Confirm New Password Input */}
                  <Box w={"100%"}>
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <InputGroup size="md">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        placeholder="Re-enter New Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        border={
                          loginFailed ? "1px solid red" : "1px solid #888888"
                        }
                        onClick={() => setLoginFailed(false)}
                        required
                      />
                      <InputRightElement width="4.5rem">
                        <Box
                          onMouseDown={() =>
                            handlePressHoldPassword("confirmPassword", true)
                          }
                          onMouseUp={() =>
                            handlePressHoldPassword("confirmPassword", false)
                          }
                          onMouseLeave={() =>
                            handlePressHoldPassword("confirmPassword", false)
                          }
                          cursor="pointer"
                        >
                          {showPassword.confirmPassword ? (
                            <BiHide />
                          ) : (
                            <BiShowAlt />
                          )}
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                    {loginFailed && (
                      <Text color={"red"}>Invalid Password Change Attempt</Text>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    w={"100%"}
                    mt={"8px"}
                    bgGradient="linear(to-r, #0099FF, #54AB6A)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, #0099FF, #54AB6A)",
                      boxShadow: "xl",
                    }}
                    isLoading={loading}
                  >
                    Change Password
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Flex>
        </Flex>
      </main>
    </>
  );
}
