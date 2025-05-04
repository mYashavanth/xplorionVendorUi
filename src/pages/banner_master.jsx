import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import styles from "../styles/banner_master.module.css";
import useAuth from "@/components/useAuth";
import Head from "next/head";
import {
  Box,
  HStack,
  Heading,
  Button,
  useDisclosure,
  Modal,
  Spacer,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
  Text,
  Skeleton,
  SkeletonText,
  Switch,
} from "@chakra-ui/react";
import { PiNotepad } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { HiOutlineSquaresPlus } from "react-icons/hi2";
import { FiEdit, FiUpload } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";

const ImageModal = ({ imageUrl, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Uploaded Image</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Image src={`${imageUrl}`} alt="Uploaded Image" w="100%" />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const EditModal = ({
  isOpen,
  onClose,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  authToken,
  fetchData,
}) => {
  const [travelCompanions, setTravelCompanions] = useState([]);
  const [budgetType, setBudgetType] = useState([]);
  const [imageToDisplay, setImageToDisplay] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setImageToDisplay(formData.bannerImage);
  }, [formData.bannerImage]);

  useEffect(() => {
    if (!authToken) return; // Avoid unnecessary API calls if authToken is not available

    const fetchTravelCompanions = async () => {
      try {
        const [companionsResponse, budgetResponse] = await Promise.all([
          axios.get(
            `https://xplorionai-bryz7.ondigitalocean.app/app/masters/travel-companion-names/${authToken}`
          ),
          axios.get(
            `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/${authToken}`
          ),
        ]);

        setTravelCompanions(companionsResponse.data);
        setBudgetType(budgetResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchTravelCompanions();
  }, [authToken]);

  async function handleSubmit(event) {
    event.preventDefault();

    // Validate form fields
    const newErrors = {};

    if (!formData.bannerTitle.trim())
      newErrors.bannerTitle = "Banner Title is required";
    if (!formData.bannerDescription.trim())
      newErrors.bannerDescription = "Banner Description is required";

    // Skip date validation if editing
    if (!isEditing) {
      const currentDate = new Date();
      const minBookingDate = new Date();
      minBookingDate.setDate(currentDate.getDate() + 1); // Adds 1 day to the current date
      minBookingDate.setHours(0, 0, 0, 0); // Set to midnight for consistent comparison

      if (!formData.fromDate) newErrors.fromDate = "From Date is required";
      if (new Date(formData.fromDate) < minBookingDate) {
        newErrors.fromDate = `From Date must be at least 1 day from today (${minBookingDate.toLocaleDateString()})`;
      }
      if (!formData.toDate) newErrors.toDate = "To Date is required";
      if (new Date(formData.fromDate) > new Date(formData.toDate))
        newErrors.toDate = "To Date must be after From Date";
    }

    if (!formData.travelCompanion)
      newErrors.travelCompanion = "Travel Companion is required";
    if (!formData.budgetType) newErrors.budgetType = "Budget Type is required";
    if (!isEditing && !formData.bannerImage)
      newErrors.bannerImage = "Banner Image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Display errors
      return; // Stop submission
    }

    setErrors({}); // Clear errors if all validations pass

    console.log({ "Form submitted": isEditing, formData });

    let apiUrl = isEditing
      ? `https://xplorionai-bryz7.ondigitalocean.app/admin/masters/home-page-banners/update`
      : `https://xplorionai-bryz7.ondigitalocean.app/admin/masters/home-page-banners/add`;

    const submitFormData = new FormData();
    submitFormData.append("token", authToken);
    submitFormData.append("bannerTitle", formData.bannerTitle);
    submitFormData.append("bannerDescription", formData.bannerDescription);
    submitFormData.append("bannerImage", formData.bannerImage);
    submitFormData.append("fromDate", formData.fromDate);
    submitFormData.append("toDate", formData.toDate);
    submitFormData.append("travelCompanion", formData.travelCompanion);
    submitFormData.append("budgetType", formData.budgetType);
    if (isEditing) {
      submitFormData.append("bannerId", formData._id);
    }

    try {
      const response = await axios.post(apiUrl, submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log({ response });

      fetchData();
    } catch (error) {
      console.error("Error while submitting the data:", error.message);
    }

    setIsEditing(false);
    onClose();
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    setFormData({
      ...formData,
      bannerImage: file,
    });
    reader.onload = () => {
      setImageToDisplay(reader.result);
    };
    reader.readAsDataURL(file);
    setErrors({ ...errors, bannerImage: "" });
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (!value.trim()) {
      setErrors({ ...errors, [field]: `${field} is required` });
    } else {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
          {isEditing ? "Edit Details" : "Create New"}
        </ModalHeader>
        <ModalCloseButton
          borderRadius={"full"}
          bgColor={"#F5F6F7"}
          _hover={{ bgColor: "#E5E7EB" }}
          w={"40px"}
          h={"40px"}
          m={"8px 24px 0 0"}
        />
        <form onSubmit={handleSubmit}>
          <ModalBody p={"20px 34px 60px"} bgColor={"#f5f6f7"}>
            <VStack spacing={6}>
              <FormControl isInvalid={errors.bannerTitle}>
                <FormLabel>Banner Title</FormLabel>
                <Input
                  placeholder="Banner Title"
                  value={formData.bannerTitle}
                  onChange={(e) =>
                    handleInputChange("bannerTitle", e.target.value)
                  }
                />
                {errors.bannerTitle && (
                  <Text color="red.500">{errors.bannerTitle}</Text>
                )}
              </FormControl>
              <FormControl isInvalid={errors.bannerDescription}>
                <FormLabel>Banner Description</FormLabel>
                <Input
                  placeholder="Banner Description"
                  value={formData.bannerDescription}
                  maxLength={120}
                  onChange={(e) =>
                    handleInputChange("bannerDescription", e.target.value)
                  }
                />
                {errors.bannerDescription && (
                  <Text color="red.500">{errors.bannerDescription}</Text>
                )}
              </FormControl>
              <FormControl isInvalid={errors.fromDate}>
                <FormLabel>From Date</FormLabel>
                <Input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => {
                    handleInputChange("fromDate", e.target.value);
                  }}
                />
                {errors.fromDate && (
                  <Text color="red.500">{errors.fromDate}</Text>
                )}
              </FormControl>
              <FormControl isInvalid={errors.toDate}>
                <FormLabel>To Date</FormLabel>
                <Input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => {
                    handleInputChange("toDate", e.target.value);
                  }}
                />
                {errors.toDate && <Text color="red.500">{errors.toDate}</Text>}
              </FormControl>
              <FormControl isInvalid={errors.travelCompanion}>
                <FormLabel>Travel Companion</FormLabel>
                <Select
                  placeholder="Select Travel Companion"
                  value={formData.travelCompanion}
                  onChange={(e) => {
                    handleInputChange("travelCompanion", e.target.value);
                  }}
                >
                  {travelCompanions.map((companion) => (
                    <option
                      key={companion._id}
                      value={companion.travel_companion_name}
                    >
                      {companion.travel_companion_name}
                    </option>
                  ))}
                </Select>
                {errors.travelCompanion && (
                  <Text color="red.500">{errors.travelCompanion}</Text>
                )}
              </FormControl>
              <FormControl isInvalid={errors.budgetType}>
                <FormLabel>Budget Type</FormLabel>
                <Select
                  placeholder="Select Budget Type"
                  value={formData.budgetType}
                  onChange={(e) => {
                    handleInputChange("budgetType", e.target.value);
                  }}
                >
                  {budgetType.map((companion) => (
                    <option key={companion._id} value={companion.budget_tier}>
                      {companion.budget_tier}
                    </option>
                  ))}
                </Select>
                {errors.budgetType && (
                  <Text color="red.500">{errors.budgetType}</Text>
                )}
              </FormControl>
              <FormControl isInvalid={errors.bannerImage}>
                <FormLabel
                  cursor={"pointer"}
                  border={"1px solid #005CE8"}
                  m={"0 0 10px 0"}
                  p={"7px"}
                  borderRadius={"80px"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  color={"#005CE8"}
                  gap={"8px"}
                  _hover={{ bgColor: "#005CE8", color: "white" }}
                  display={formData.bannerImage ? "none" : "flex"}
                >
                  <FiUpload /> Upload Banner Image
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                <Box
                  borderRadius={"8px"}
                  w={"100%"}
                  minH={"100px"}
                  border={"1px solid #E5E7EB"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  {imageToDisplay ? (
                    <Image
                      src={imageToDisplay}
                      alt="Uploaded Image"
                      w="100%"
                      h="100%"
                      objectFit={"cover"}
                      objectPosition={"center"}
                      borderRadius={"8px"}
                    />
                  ) : (
                    "Please upload an image"
                  )}
                </Box>
                {errors.bannerImage && (
                  <Text color="red.500">{errors.bannerImage}</Text>
                )}
              </FormControl>
              <Button
                onClick={() => setFormData({ ...formData, bannerImage: "" })}
                width={"100%"}
                backgroundColor={"#FDEDED"}
                color={"#E84646"}
                _hover={{ bgColor: "#ffdddd" }}
                borderRadius={"full"}
                border={"1px solid #E84646"}
                display={formData.bannerImage ? "block" : "none"}
              >
                Remove Image
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
              _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
              color={"white"}
              letterSpacing={"1px"}
            >
              {isEditing ? "Save" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default function BannerMaster() {
  const [rowData, setRowData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [selectedImage, setSelectedImage] = useState("");

  const [formData, setFormData] = useState({
    _id: "",
    bannerTitle: "",
    bannerDescription: "",
    bannerImage: "",
    fromDate: "",
    toDate: "",
    travelCompanion: "",
    budgetType: "",
  });
  function handleEdit(rowData) {
    setIsEditing(true);
    onEditModalOpen();
    setFormData((prev) => ({
      ...prev,
      _id: rowData._id,
      bannerTitle: rowData.banner_title,
      bannerDescription: rowData.banner_description,
      bannerImage: rowData.banner_image,
      fromDate: rowData.fromDate,
      toDate: rowData.toDate,
      travelCompanion: rowData.travelCompanion,
      budgetType: rowData.budgetType,
    }));
  }
  function handleAddNew() {
    onEditModalOpen();
    setIsEditing(false);
    setFormData({
      _id: "",
      bannerTitle: "",
      bannerDescription: "",
      bannerImage: "",
      fromDate: "",
      toDate: "",
      travelCompanion: "",
      budgetType: "",
    });
  }
  const fetchData = async () => {
    if (!authToken) return; // Prevent unnecessary calls if authToken is not available
    try {
      setIsLoading(true);
      const bannersData = await fetchBannersData(authToken); // Wait for the data to be fetched
      setRowData(bannersData); // Set the fetched data to rowData
    } catch (error) {
      console.error("Error fetching banners data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData(); // Call the async function
  }, [authToken]);

  // Ensure the fetchBannersData function remains unchanged
  async function fetchBannersData(authToken) {
    try {
      const response = await axios.get(
        `https://xplorionai-bryz7.ondigitalocean.app/admin/masters/home-page-banners/all/${authToken}`
      );
      console.log({ bannersData: response.data });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch banners data:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }

  //toggle function for switch button
  const handleToggle = async (data) => {
    console.log(data.status);
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("bannerId", data._id);
    formData.append("statusFlag", data.status == 1 ? 0 : 1);
    console.log(Object.fromEntries(formData.entries()));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/masters/home-page-banners/update/status`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const responseData = response.data;
      console.log(responseData);

      if (responseData.errFlag === 0) {
        // Update the rowData state
        setRowData((prevRowData) =>
          prevRowData.map((row) =>
            row._id === data._id
              ? { ...row, status: data.status == 1 ? 0 : 1 }
              : row
          )
        );
      } else {
        console.error("Error updating status:", responseData.message);
      }
    } catch (error) {
      console.error("Error toggling banner status:", error);
    }
  };

  const columns = [
    {
      headerName: "TITLE",
      field: "banner_title",
    },
    {
      headerName: "UPLOADED IMG",
      field: "banner_image",
      cellRenderer: (params) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSelectedImage(params.value);
            onImageModalOpen();
          }}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          View Image
        </a>
      ),
    },
    {
      headerName: "DESCRIPTION",
      field: "banner_description",
      cellStyle: { whiteSpace: "pre-wrap" },
      minWidth: 300,
      cellRenderer: (params) => {
        // trim the spaces in the starting and ending
        const description = params.value.trim();
        return description;
      },
    },
    {
      headerName: "DATE RANGE",
      field: "_id",
      minWidth: 190,
      cellStyle: { whiteSpace: "pre-wrap" },
      cellRenderer: (params) => {
        const { fromDate, toDate } = params.data;
        return (
          <Box whiteSpace="pre-wrap">
            <Box>{fromDate}</Box>
            <Box>To {toDate}</Box>
          </Box>
        );
      },
      valueFormatter: (params) =>
        `${params.data.fromDate} to ${params.data.toDate}`,
      valueGetter: (params) => ({
        fromDate: params.data.fromDate,
        toDate: params.data.toDate,
        fullData: params.data, // Include full row data if needed
      }),
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const { fromDate, toDate } = cellValue;

          const cellStartDate = new Date(fromDate);
          cellStartDate.setHours(0, 0, 0, 0); // Ensure time starts at midnight

          const cellEndDate = new Date(toDate);
          cellEndDate.setHours(0, 0, 0, 0); // Ensure time starts at midnight

          // console.log({
          //   filterLocalDateAtMidnight,
          //   cellStartDate,
          //   cellEndDate,
          // });

          if (
            filterLocalDateAtMidnight.getTime() === cellStartDate.getTime() ||
            filterLocalDateAtMidnight.getTime() === cellEndDate.getTime() ||
            (filterLocalDateAtMidnight >= cellStartDate &&
              filterLocalDateAtMidnight <= cellEndDate)
          ) {
            return 0; // Matches the range
          } else if (filterLocalDateAtMidnight < cellStartDate) {
            return 1; // Before the range
          } else if (filterLocalDateAtMidnight > cellEndDate) {
            return -1; // After the range
          }
        },
      },
    },
    {
      headerName: "COMPANION",
      field: "travelCompanion",
      maxWidth: 130,
    },
    {
      headerName: "BUDGET",
      field: "budgetType",
      maxWidth: 130,
    },
    {
      field: "status",
      headerName: "STATUS",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params) => (
        // console.log(params.data.status),

        <div
          style={
            {
              // display: "flex",
              // justifyContent: "center",
              // alignItems: "center",
              // height: "100%",
              // border: "1px solid red",
              // margin: "auto"
            }
          }
        >
          <Switch
            colorScheme="green"
            onChange={(event) => handleToggle(params.data)}
            defaultChecked={params.data.status == 1 ? true : false}
          />
        </div>
      ),
    },
    {
      headerName: "CREATED DATE",
      field: "created_date",
      cellRenderer: (params) => {
        const date = params.data.created_date;
        return `${date}`;
      },
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const date = cellValue; // Extract date part only for comparison
          const dateParts = date.split("-");
          const year = Number(dateParts[0]);
          const month = Number(dateParts[1]) - 1;
          const day = Number(dateParts[2]);
          const cellDate = new Date(year, month, day);

          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          } else {
            return 0;
          }
        },
      },
    },
    {
      headerName: "ACTION",
      field: "_id",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params) => (
        <HStack spacing={2}>
          <Button
            size="xs"
            colorScheme="blue"
            onClick={() => {
              handleEdit(params.data);
            }}
            borderRadius={"full"}
            w={"36px"}
            h={"36px"}
            bgColor={"transparent"}
            _hover={{ bgColor: "#f5f6f7" }}
            border={"1px solid #626C70"}
            mt={"4px"}
          >
            <FiEdit color={"#626C70"} size={"18px"} />
          </Button>
          <Button
            size="xs"
            colorScheme="red"
            onClick={() => {
              handleDelete(params.data._id);
            }}
            borderRadius={"full"}
            w={"36px"}
            h={"36px"}
            bgColor={"transparent"}
            _hover={{ bgColor: "#f5f6f7" }}
            border={"1px solid #E84646"}
            mt={"4px"}
          >
            <RiDeleteBin5Line color={"#E84646"} size={"18px"} />
          </Button>
        </HStack>
      ),
    },
  ];

  // Function to handle delete operation
  async function handleDelete(bannerId) {
    if (!authToken) {
      console.error("Auth token is missing");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?"
    );
    if (!confirmDelete) return;

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("bannerId", bannerId);

    try {
      const response = await axios.post(
        "https://xplorionai-bryz7.ondigitalocean.app/admin/masters/home-page-banners/delete-banner",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Delete response:", response.data);
      fetchData(); // Refresh the grid data after deletion
    } catch (error) {
      console.error("Error deleting banner:", error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Banner Master</title>
      </Head>
      <main className={styles.main}>
        {isLoading ? (
          <Box w={"100%"} h={"auto"} className="gridContainer">
            <HStack bgColor={"white"} p={"24px"}>
              <HStack gap={"12px"} alignItems={"center"}>
                <Skeleton height="24px" width="24px" borderRadius="full" />
                <SkeletonText noOfLines={1} width="200px" />
              </HStack>
              <Spacer />
              <Skeleton height="40px" width="160px" borderRadius="md" />
            </HStack>
            <Skeleton height="60px" width="100%" mt={4} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
          </Box>
        ) : (
          <Box w={"100%"} h={"auto"} className="gridContainer">
            <HStack
              bgColor={"white"}
              p={"24px"}
              borderRadius={"8px 8px 0px 0px"}
            >
              <HStack gap={"12px"} alignItems={"center"}>
                <HiOutlineSquaresPlus color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Banner Master
                </Heading>
              </HStack>
              <Spacer />
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                color={"white"}
                gap={"8px"}
                onClick={() => {
                  handleAddNew();
                }}
              >
                <BsFillPlusCircleFill size={22} />
                Add New
              </Button>
            </HStack>
            <AgGridReact
              className="ag-theme-quartz"
              rowData={Array.isArray(rowData) ? rowData : []}
              columnDefs={columns}
              pagination={true}
              paginationPageSize={5}
              paginationPageSizeSelector={[5, 10, 15]}
              enableCellTextSelection={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                floatingFilter: true,
                resizable: true,
                flex: 1,
                filterParams: {
                  debounceMs: 0,
                  buttons: ["reset"],
                },
              }}
              domLayout="autoHeight"
              // getRowHeight={(params) => {
              //   return 80;
              // }}
              getRowHeight={function (params) {
                const description = params.data?.banner_description || "";
                const words = description.split(" ").length;
                const baseHeight = 80;
                const heightPerWord = 6;
                const minHeight = 80;
                const calculatedHeight = baseHeight + words * heightPerWord;
                return Math.max(minHeight, calculatedHeight);
              }}
            />
          </Box>
        )}
        <ImageModal
          imageUrl={selectedImage}
          isOpen={isImageModalOpen}
          onClose={onImageModalClose}
        />
        {authToken && (
          <EditModal
            isOpen={isEditModalOpen}
            onClose={onEditModalClose}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={formData}
            setFormData={setFormData}
            authToken={authToken}
            fetchData={fetchData}
          />
        )}
      </main>
    </>
  );
}
