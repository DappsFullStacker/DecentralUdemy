// import "../assets/css/AddRental.css";
import "bootstrap/dist/css/bootstrap.css";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import { Form, Table } from "react-bootstrap";
import { Button, CircularProgress } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import Connect from "../components/Connect";

import logo from "../assets/images/udemy-logo.png";
import bg from "../assets/images/add-image.jpg";

import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

import { StoreContent } from "../utils/StoreContent";

const AddCourses = () => {
  const navigate = useNavigate();

  const data = useSelector((state) => state.blockchain.value);
  const [generatingCourseURI, setGeneratingCourseURI] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);

  const [image, setImage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [imageName, setImageName] = useState(null);
  const [videoNames, setVideoNames] = useState([]);
  const [formInput, setFormInput] = useState({
    title: "",
    description: "",
    coverImage: null,
    courseURI: [],
    price: 0,
  });

  const isImage = (file) => {
    return file.type.startsWith("image/");
  };

  const isVideo = (file) => {
    return file.type.startsWith("video/");
  };

  const getImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isImage(file)) {
        window.alert("Please upload a valid video file (e.g., MP4).");
        return;
      }
      setImage(file);
      setImageName(file.name);
    }
  };

  const getVideo = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isVideo(file)) {
        window.alert("Please upload a valid video file (e.g., MP4).");
        return;
      }
      setVideos([...videos, file]);
      if (file.name) {
        setVideoNames([...videoNames, file.name]);
      }
    }
  };

  const removeVideo = (index) => {
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);

    const updatedVideoNames = [...videoNames];
    updatedVideoNames.splice(index, 1);

    setVideos(updatedVideos);
    setVideoNames(updatedVideoNames);
  };

  const openInNewTab = (uri) => {
    window.open(uri, "_blank");
  };

  const copyToClipboard = async (uri) => {
    try {
      await navigator.clipboard.writeText(uri);
      window.alert("URI copied to clipboard");
    } catch (err) {
      window.alert("Failed to copy URI to clipboard");
      console.error(err);
    }
  };

  const generateCourseURI = async () => {
    try {
      setGeneratingCourseURI(true);

      const cidImage = await StoreContent(image);
      const videoURIs = await Promise.all(
        videos.map(async (videoFile) => {
          const cidVideo = await StoreContent(videoFile);
          return `https://gateway.ipfs.io/ipfs/${cidVideo}/${videoFile.name}`;
        })
      );

      const imageURI = `https://gateway.ipfs.io/ipfs/${cidImage}/${imageName}`;

      setFormInput({
        ...formInput,
        courseURI: videoURIs,
        coverImage: imageURI,
      });
      setGeneratingCourseURI(false);
    } catch (err) {
      window.alert("An error has occurred while generating the course URI");
      setGeneratingCourseURI(false);
      console.error(err);
    }
  };

  const addCourse = async () => {
    console.log("formInput.courseURI:", formInput.courseURI);

    if (data.network === networksMap[networkDeployedTo]) {
      if (
        image !== null &&
        videos.length > 0 &&
        window.ethereum !== undefined &&
        formInput.title &&
        formInput.description &&
        formInput.price !== undefined
      ) {
        try {
          setAddingCourse(true);
          const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          );
          const signer = provider.getSigner();
          const UdemyContract = new ethers.Contract(
            contractAddress,
            DecentralUdemy.abi,
            signer
          );

          const courseCreationFee = await UdemyContract.courseCreationFee();

          if (formInput.courseURI && Array.isArray(formInput.courseURI)) {
            const addCourseTx = await UdemyContract.createCourse(
              formInput.title,
              formInput.description,
              formInput.coverImage,
              formInput.courseURI,
              parseFloat(formInput.price),
              { value: courseCreationFee }
            );
            await addCourseTx.wait();
          } else {
            window.alert("Course URI is missing or invalid.");
          }

          setImage(null);
          setVideos([]);
          setVideoNames([]);
          setAddingCourse(false);

          navigate("/dashboard");
        } catch (err) {
          window.alert("An error has occurred");
          setAddingCourse(false);
          console.error(err);
        }
      } else {
        window.alert(
          "Please Install Metamask, connect your wallet, and upload both an image and at least one video"
        );
      }
    } else {
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  };

  return (
    <>
      <div className="topBanner">
        <div>
          <Link to="/">
            <img className="logo" src={logo} alt="logo" />
          </Link>
        </div>
        <div className="lrContainers">
          <Connect />
        </div>
      </div>
      <hr className="line" />
      <br />
      <br />
      <div className="addRentalContent">
        <div className="addRentalContent-box text-center">
          <h2 style={{ fontSize: "2rem", color: "#2ccce4" }}>
            Add your Course
          </h2>
          <br />
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "1.2rem", color: "#e91e63" }}>
              Course Title:
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter course title"
              style={{ fontSize: "1rem" }}
              onChange={(e) => {
                setFormInput({ ...formInput, title: e.target.value });
              }}
              required={true}
            />
          </Form.Group>
          <br />
          <div>
            <label style={{ fontSize: "1.2rem", color: "#e91e63" }}>
              Course Description:
            </label>
            <Form.Control
              as="textarea"
              rows={5}
              maxLength={200}
              placeholder="Enter a description of the course"
              style={{ fontSize: "1rem" }}
              onChange={(e) => {
                setFormInput({ ...formInput, description: e.target.value });
              }}
              required={true}
            />
          </div>
          <br />
          <div>
            <label style={{ fontSize: "1.2rem", color: "#e91e63" }}>
              Course Cover Image:
            </label>
            <Form.Control
              type="file"
              name="file"
              onChange={(e) => {
                getImage(e);
              }}
            />
            <br />
            {image && (
              <div className="text-center">
                <img
                  className="rounded mt-4"
                  width="350"
                  src={URL.createObjectURL(image)}
                  alt="Cover Image"
                />
              </div>
            )}
          </div>
          <br />
          <div>
            <label style={{ fontSize: "1.2rem", color: "#e91e63" }}>
              Course Video(s):
            </label>
            <Form.Control
              type="file"
              name="video"
              onChange={(e) => {
                getVideo(e);
              }}
              multiple
            />
            {videoNames.length > 0 && (
              <ul>
                {videoNames.map((name, index) => (
                  <li key={index}>
                    {name}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeVideo(index)}
                    >
                      <DeleteIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <br />
          <div>
            <Button
              variant="contained"
              color="error"
              onClick={generateCourseURI}
              disabled={generatingCourseURI}
              style={{ fontSize: "1.2rem" }}
            >
              {generatingCourseURI ? (
                <CircularProgress color="inherit" />
              ) : (
                "Generate Course URI"
              )}
            </Button>
          </div>
          <br />
          {formInput.courseURI &&
            Array.isArray(formInput.courseURI) &&
            formInput.courseURI.length > 0 && (
              <div>
                {formInput.courseURI.map((uri, index) => (
                  <div key={index}>
                    <strong style={{ fontSize: "1.2rem", color: "#3f51b5" }}>
                      Generated Course URI:
                    </strong>
                    <br />
                    <p style={{ fontSize: "1rem", color: "#666" }}>{uri}</p>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => copyToClipboard(uri)}
                      style={{ fontSize: "1rem" }}
                    >
                      <FileCopyIcon />
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => openInNewTab(uri)}
                      style={{ fontSize: "1rem" }}
                    >
                      <OpenInNewIcon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          <br />
          <div>
            <label style={{ fontSize: "1.2rem", color: "#444" }}>
              Course Price in USD:
            </label>
            <Form.Control
              type="number"
              min={0}
              placeholder="Enter course price in USD"
              style={{ fontSize: "1rem" }}
              onChange={(e) =>
                setFormInput({ ...formInput, price: e.target.value })
              }
              required={true}
            />
          </div>
          <div className="text-center">
            <Button
              type="submit"
              variant="contained"
              color="error"
              onClick={addCourse}
              disabled={addingCourse || generatingCourseURI}
              style={{ fontSize: "1.2rem" }}
            >
              {addingCourse ? <CircularProgress color="inherit" /> : "Add"}
            </Button>
          </div>
          <br />
        </div>
      </div>
    </>
  );
};

export default AddCourses;
