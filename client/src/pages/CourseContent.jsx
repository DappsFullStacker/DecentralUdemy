import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ReactPlayer from "react-player";
import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress } from "../utils/contracts-config";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  card: {
    maxWidth: "80%",
    margin: "0 auto",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
    transition: "0.3s",
    "&:hover": {
      boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
    },
  },
  cardHeader: {
    backgroundColor: "#2196f3",
    color: "white",
    textAlign: "center",
  },
  title: {
    color: "orange",
    fontWeight: "bold",
  },
  videoPlayer: {
    maxWidth: "100%",
    margin: "0 auto",
  },
  videoControls: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4caf50",
    color: "white",
    "&:hover": {
      backgroundColor: "#81c784",
      color: "#212121",
    },
  },
  select: {
    color: "blue",
    fontSize: "16px",
    paddingBottom: "5px",
  },
  menuItem: {
    fontSize: "14px",
    color: "blue",
  },
});

const CourseContent = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [videoUrls, setVideoUrls] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playerRef = useRef(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const UdemyContract = new ethers.Contract(
          contractAddress,
          DecentralUdemy.abi,
          signer
        );

        const courseInfo = await UdemyContract.getCourse(courseId);
        const videos = courseInfo.videoURLs;

        setCourse(courseInfo);
        setVideoUrls(videos);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

  const handleVideoEnd = () => {
    if (currentVideoIndex < videoUrls.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const playPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const playNextVideo = () => {
    if (currentVideoIndex < videoUrls.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePlaybackSpeedChange = (speed) => {
    if (speed >= 0.25 && speed <= 4) {
      setPlaybackSpeed(speed);
    }
  };

  const playbackSpeedOptions = [1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4];
  const classes = useStyles();

  return (
    <Box className="container mt-4">
      {course && (
        <Card>
          <CardHeader
            title={
              <Typography variant="h4" style={{ color: "orange" }}>
                {course.title}
              </Typography>
            }
            style={{
              backgroundColor: "primary",
              color: "white",
              textAlign: "center",
            }}
          />
          <CardContent style={{ textAlign: "center" }}>
            <Box className="video-player embed-responsive embed-responsive-16by9">
              <ReactPlayer
                ref={playerRef}
                url={videoUrls[currentVideoIndex]}
                controls={true}
                playing={true}
                playbackRate={playbackSpeed}
                onEnded={handleVideoEnd}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                    tracks: [],
                    forceVideo: true,
                  },
                }}
                style={{ maxWidth: "100%", margin: "0 auto" }}
              />
            </Box>

            <Box className="video-controls mt-3">
              <Button
                variant="contained"
                color="success"
                onClick={playPreviousVideo}
                disabled={currentVideoIndex === 0}
              >
                Previous Video
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={playNextVideo}
                disabled={currentVideoIndex === videoUrls.length - 1}
              >
                Next Video
              </Button>
              <Box className="form-group mt-3">
                <Typography variant="body1" style={{ color: "blue" }}>
                  <span
                    style={{
                      backgroundColor: "yellow",
                      padding: "4px",
                      borderRadius: "4px",
                    }}
                  >
                    Playback Speed:
                  </span>
                </Typography>
                <Select
                  id="playbackSpeed"
                  value={playbackSpeed}
                  onChange={(e) =>
                    handlePlaybackSpeedChange(parseFloat(e.target.value))
                  }
                  style={{
                    color: "blue",
                    fontSize: "16px",
                    paddingBottom: "5px",
                  }}
                >
                  {playbackSpeedOptions.map((speed) => (
                    <MenuItem
                      key={speed}
                      value={speed}
                      style={{ fontSize: "14px", color: "blue" }}
                    >
                      {speed}x
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CourseContent;
