import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/activity_config.module.css";
import useAuth from "@/components/useAuth";
import axios from "axios";

export default function ActivityConfig() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const [formData, setFormData] = useState({
    iternaryNo: "",
    similerResturants: "",
    activityRedo: "",
    dayRedo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (authToken) {
      fetchConfigData();
    }
  }, [authToken]);

  const fetchConfigData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/global-config/all/${authToken}`
      );
      const configData = response.data[0] || {};
      console.log("Fetched Config Data:", configData);

      setFormData({
        iternaryNo: configData.iternaryNo || "",
        similerResturants: configData.similerPlacesLimitNo || "",
        activityRedo: configData.activityRedoNo || "",
        dayRedo: configData.dayRedoNo || "",
      });
    } catch (error) {
      console.error("Error fetching config data:", error);
      toast({
        title: "Error",
        description: "Failed to load configuration data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.iternaryNo) {
      newErrors.iternaryNo = "Total itinerary is required";
    } else if (isNaN(formData.iternaryNo) || formData.iternaryNo <= 0) {
      newErrors.iternaryNo = "Must be a positive number";
    }

    if (!formData.dayRedo) {
      newErrors.dayRedo = "Number of day redo is required";
    } else if (isNaN(formData.dayRedo) || formData.dayRedo < 0) {
      newErrors.dayRedo = "Must be a non-negative number";
    }

    if (!formData.activityRedo) {
      newErrors.activityRedo = "Number of activity redo is required";
    } else if (isNaN(formData.activityRedo) || formData.activityRedo < 0) {
      newErrors.activityRedo = "Must be a non-negative number";
    }

    if (!formData.similerResturants) {
      newErrors.similerResturants = "Number of similar restaurants is required";
    } else if (
      isNaN(formData.similerResturants) ||
      formData.similerResturants < 0
    ) {
      newErrors.similerResturants = "Must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const uploadData = new FormData();
        uploadData.append("iternaryNo", Number(formData.iternaryNo));
        uploadData.append("similerPlaces", Number(formData.similerResturants));
        uploadData.append("activityRedo", Number(formData.activityRedo));
        uploadData.append("dayRedo", Number(formData.dayRedo));
        uploadData.append("token", authToken);

        console.log("Submitting Form Data:", {
          iternaryNo: formData.iternaryNo,
          similerPlaces: formData.similerResturants,
          activityRedo: formData.activityRedo,
          dayRedo: formData.dayRedo,
          token: authToken,
        });

        const response = await axios.post(
          `${baseURL}/global-config/iternary`,
          uploadData
        );

        console.log("API Response:", response.data);

        toast({
          title: "Configuration saved",
          description:
            "Your activity configuration has been saved successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);

        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to save configuration",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      <Head>
        <title>Activity Config</title>
      </Head>
      <main className={styles.main}>
        <Box p={6} borderRadius="8px" bg="white" w={"50%"}>
          <Heading fontSize={"20px"} fontWeight={600} mb={6}>
            Activity Configuration
          </Heading>

          <Box as="form" onSubmit={handleSubmit}>
            <FormControl isInvalid={!!errors.iternaryNo} mb={6}>
              <FormLabel>Total Itinerary Per User</FormLabel>
              <NumberInput
                min={1}
                value={formData.iternaryNo}
                onChange={(valueString) =>
                  handleChange("iternaryNo", valueString)
                }
              >
                <NumberInputField placeholder="Enter total itinerary" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.iternaryNo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.dayRedo} mb={6}>
              <FormLabel>Number of Day Redo</FormLabel>
              <NumberInput
                min={0}
                value={formData.dayRedo}
                onChange={(valueString) => handleChange("dayRedo", valueString)}
              >
                <NumberInputField placeholder="Enter number of day redo attempts" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.dayRedo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.activityRedo} mb={6}>
              <FormLabel>Number of Activity Redo</FormLabel>
              <NumberInput
                min={0}
                value={formData.activityRedo}
                onChange={(valueString) =>
                  handleChange("activityRedo", valueString)
                }
              >
                <NumberInputField placeholder="Enter number of activity redo attempts" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.activityRedo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.similerResturants} mb={8}>
              <FormLabel>Number of Similar Activities</FormLabel>
              <NumberInput
                min={0}
                value={formData.similerResturants}
                onChange={(valueString) =>
                  handleChange("similerResturants", valueString)
                }
              >
                <NumberInputField placeholder="Enter number of similar activities" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.similerResturants}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              w={"100%"}
              isLoading={isSubmitting}
              loadingText="Submitting"
              bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
              _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
              color={"white"}
            >
              Save Configuration
            </Button>
          </Box>
        </Box>
      </main>
    </>
  );
}
