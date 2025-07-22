import { useState } from "react";
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

export default function ActivityConfig() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const [formData, setFormData] = useState({
    totalItinerary: "",
    noOfRedo: "",
    noOfSimilarActivity: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  console.log(authToken);

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

    if (!formData.totalItinerary) {
      newErrors.totalItinerary = "Total itinerary is required";
    } else if (isNaN(formData.totalItinerary) || formData.totalItinerary <= 0) {
      newErrors.totalItinerary = "Must be a positive number";
    }

    if (!formData.noOfRedo) {
      newErrors.noOfRedo = "Number of redo is required";
    } else if (isNaN(formData.noOfRedo) || formData.noOfRedo < 0) {
      newErrors.noOfRedo = "Must be a non-negative number";
    }

    if (!formData.noOfSimilarActivity) {
      newErrors.noOfSimilarActivity =
        "Number of similar activities is required";
    } else if (
      isNaN(formData.noOfSimilarActivity) ||
      formData.noOfSimilarActivity < 0
    ) {
      newErrors.noOfSimilarActivity = "Must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        console.log("Form submitted:", {
          totalItinerary: Number(formData.totalItinerary),
          noOfRedo: Number(formData.noOfRedo),
          noOfSimilarActivity: Number(formData.noOfSimilarActivity),
        });

        toast({
          title: "Configuration saved",
          description:
            "Your activity configuration has been saved successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setIsSubmitting(false);
      }, 1000);
    }
  };

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
            <FormControl isInvalid={!!errors.totalItinerary} mb={6}>
              <FormLabel>Total Itinerary Per User</FormLabel>
              <NumberInput
                min={1}
                value={formData.totalItinerary}
                onChange={(valueString) =>
                  handleChange("totalItinerary", valueString)
                }
              >
                <NumberInputField placeholder="Enter total itinerary" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.totalItinerary}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.noOfRedo} mb={6}>
              <FormLabel>Number of Redo</FormLabel>
              <NumberInput
                min={0}
                value={formData.noOfRedo}
                onChange={(valueString) =>
                  handleChange("noOfRedo", valueString)
                }
              >
                <NumberInputField placeholder="Enter number of redo attempts" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.noOfRedo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.noOfSimilarActivity} mb={8}>
              <FormLabel>Number of Similar Activities</FormLabel>
              <NumberInput
                min={0}
                value={formData.noOfSimilarActivity}
                onChange={(valueString) =>
                  handleChange("noOfSimilarActivity", valueString)
                }
              >
                <NumberInputField placeholder="Enter number of similar activities" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.noOfSimilarActivity}</FormErrorMessage>
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
