import { useState } from "react";
import {
  border,
  Box,
  Button,
  Center,
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

export default function Login() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a new FormData object
    const newFormData = new FormData();

    // Append form data
    newFormData.append("email", formData.email);
    newFormData.append("password", formData.password);

    console.log({ formData: newFormData, baseURL });

    try {
      setLoading(true);
      const response = await axios.post(
        `${baseURL}/app/super-users/login`,
        newFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({response});
      if (response.data.errFlag === 0) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", formData.email);
        window.location.href = "/";
      } else {
        console.log(response.data);
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
        <title>Login</title>
        <meta name="description" content="xplorion login" />
      </Head>
      <main className={styles.main}>
        <Flex direction="column" alignItems={"center"} gap={"24px"}>
          {/* <Flex
            direction="column"
            gap={5}
            // border={"1px solid black"}
            m={"auto"}
          >
            <Center>
              <Image
                src="/login/logo.png"
                alt="logo"
                width={400}
                height={100}
                priority={true}
                style={{ objectFit: "cover", width: "auto" }}
              />
            </Center>
          </Flex> */}
          <Flex>
            <Box
              position="relative"
              w={"100%"}
              maxWidth={504}
              h={"auto"}
              maxHeight={440}
              //   border={"1px solid black"}
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
              p=" 40px"
              //   border={"1px solid black"}
              w={"504px"}
              alignItems={"flex-start"}
              gap={"24px"}
              justifyContent={"center"}
              borderRadius={"0px 8px 8px 0px"}
              bgColor={"#FFFFFF"}
            >
              <Heading
                fontSize={"24px"}
                fontWeight={600}
                // border={"1px solid black"}
              >
                Login to your account
              </Heading>
              <form action="submit" onSubmit={handleSubmit}>
                <VStack
                  //   border={"1px solid black"}
                  alignItems={"flex-start"}
                  gap={"16px"}
                >
                  <Box
                    //   border={"1px solid black"}
                    w={"100%"}
                  >
                    <label htmlFor="email">Email Id</label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter Email Id"
                      width="100%"
                      value={formData.email}
                      onChange={handleChange}
                      border={
                        loginFailed ? "1px solid red" : "1px solid #888888"
                      }
                      onClick={() => setLoginFailed(false)}
                      required
                    />
                  </Box>
                  <Box
                    //   border={"1px solid black"}
                    w={"100%"}
                  >
                    <label htmlFor="password">Password</label>
                    <InputGroup size="md">
                      <Input
                        pr="4.5rem"
                        type={show ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        border={
                          loginFailed ? "1px solid red" : "1px solid #888888"
                        }
                        onClick={() => setLoginFailed(false)}
                        required
                      />
                      <InputRightElement width="4.5rem">
                        <Box onClick={handleClick} cursor="pointer">
                          {show ? <BiHide /> : <BiShowAlt />}
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                    {loginFailed && (
                      <Text color={"red"}>Invalid Login Credentials</Text>
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
                    Login
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
