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
} from "@chakra-ui/react";
import { PiNotepad } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { HiOutlineSquaresPlus } from "react-icons/hi2";
import { FiEdit, FiUpload } from "react-icons/fi";

const ImageModal = ({ imageUrl, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Uploaded Image</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Image src={imageUrl} alt="Uploaded Image" w="100%" />
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
}) => {
  const [imageToDisplay, setImageToDisplay] = useState(null);
  useEffect(() => {
    setImageToDisplay(formData.bannerImage);
  }, [formData.bannerImage]);
  function handleSubmit(event) {
    console.log({ "Form submitted": isEditing, formData });

    event.preventDefault();
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
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
          Edit Details
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
              <FormControl>
                <FormLabel>Banner Heading/ Title</FormLabel>
                <Input
                  placeholder="Banner Heading/ Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Page Redirection</FormLabel>
                <Input
                  placeholder="Page Redirection"
                  value={formData.pageLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pageLink: e.target.value,
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel
                  cursor={"pointer"}
                  border={"1px solid #005CE8"}
                  m={"0 0 10px 0"}
                  p={"7px"}
                  borderRadius={"80px"}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  color={"#005CE8"}
                  gap={"8px"}
                  _hover={{ bgColor: "#005CE8", color: "white" }}
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
                    />
                  ) : (
                    "please upload an image"
                  )}
                </Box>
              </FormControl>
              <Button
                onClick={() => setFormData({ ...formData, bannerImage: "" })}
                width={"100%"}
                backgroundColor={"#FDEDED"}
                color={"#E84646"}
                _hover={{ bgColor: "#ffdddd" }}
                borderRadius={"full"}
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
    title: "",
    pageLink: "",
    bannerImage: "",
  });
  function handleEdit(rowData) {
    setIsEditing(true);
    onEditModalOpen();
    setFormData((prev) => ({
      ...prev,
      ...rowData,
    }));
  }
  function handleAddNew() {
    onEditModalOpen();
    setIsEditing(false);
    setFormData({
      _id: "",
      title: "",
      pageLink: "",
      bannerImage: "",
    });
  }
  useEffect(() => {
    setRowData([
      {
        _id: 1,
        title: "title",
        bannerImage: "https://dummyimage.com/600x400/000/000",
        pageLink: "pageLink",
      },
      {
        _id: 2,
        title: "title2",
        bannerImage: "https://dummyimage.com/600x400/ffdddd/ffdddd",
        pageLink: "pageLink2",
      },
      {
        _id: 3,
        title: "title3",
        bannerImage: "https://dummyimage.com/600x400/dddddd/dddddd",
        pageLink: "pageLink3",
      },
    ]);
  }, []);

  const columns = [
    {
      headerName: "HEADING/ TITLE",
      field: "title",
    },
    {
      headerName: "UPLOADED IMAGE",
      field: "bannerImage",
      cellRenderer: (params) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSelectedImage(params.data.bannerImage);
            onImageModalOpen();
          }}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          View Image
        </a>
      ),
    },
    {
      headerName: "PAGE LINK",
      field: "pageLink",
    },
    {
      headerName: "ACTION",
      field: "_id",
      filter: false,
      cellRenderer: (params) => (
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
      ),
    },
  ];
  return (
    <>
      <Head>
        <title>Banner Master</title>
      </Head>
      <main className={styles.main}>
        <Box w={"100%"} h={"auto"} className="gridContainer">
          <HStack bgColor={"white"} p={"24px"}>
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
            getRowHeight={(params) => {
              return 80;
            }}
          />
        </Box>
        <ImageModal
          imageUrl={selectedImage}
          isOpen={isImageModalOpen}
          onClose={onImageModalClose}
        />
        <EditModal
          isOpen={isEditModalOpen}
          onClose={onEditModalClose}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          formData={formData}
          setFormData={setFormData}
        />
      </main>
    </>
  );
}
