import React, { useState, useEffect } from "react";
import logo from "../assets/images/udemy-logo.png";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";

import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { ethers, utils } from "ethers";
import { contractAddress } from "../utils/contracts-config";

const useStyles = makeStyles({
  homeContainer: {
    background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    minHeight: "100vh",
  },
  bannerTitle: {
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    color: "white",
  },
  searchForm: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "16px 0",
  },
  searchInput: {
    width: "60%",
  },
  searchButton: {
    width: "35%",
    backgroundColor: "#3f51b5",
    color: "white",
    "&:hover": {
      backgroundColor: "#7986cb",
      color: "#212121",
    },
  },
  courseCard: {
    maxWidth: "80%",
    margin: "0 auto",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
    transition: "0.3s",
    "&:hover": {
      boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
    },
  },
  courseTitle: {
    color: "#3f51b5",
    fontWeight: "bold",
  },
  courseDescription: {
    color: "#616161",
  },
  enrollButton: {
    backgroundColor: "#3f51b5",
    color: "white",
    "&:hover": {
      backgroundColor: "#7986cb",
      color: "#212121",
    },
  },
});

const Home = () => {
  const [searchInfo, setSearchInfo] = useState({
    query: "",
  });

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();
  const UdemyContract = new ethers.Contract(
    contractAddress,
    DecentralUdemy.abi,
    signer
  );

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const courses = await UdemyContract.getAllCourses();
      const formattedCourses = courses.map((c) => {
        // Format the coverImage URL
        const coverImage = c.coverImage.replace(
          "ipfs://",
          "https://gateway.pinata.cloud/ipfs/"
        );
        return {
          id: Number(c.id),
          title: c.title,
          description: c.description,
          coverImage: coverImage,
          videoURLs: c.videoURLs,
          price: c.price.toString(),
        };
      });
      setCourses(formattedCourses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const handleSearch = () => {
    const query = searchInfo.query.toLowerCase();
    if (query.trim() === "") {
      setFilteredCourses([]);
      return;
    }

    const filteredCourses = courses.filter((course) => {
      const courseTitle = course.title.toLowerCase();
      const courseDescription = course.description.toLowerCase();
      return courseTitle.includes(query) || courseDescription.includes(query);
    });

    setFilteredCourses(filteredCourses);
  };

  const classes = useStyles();

  return (
    <Box className={classes.homeContainer}>
      <Container>
        <Typography variant="h4" className={classes.bannerTitle}>
          Learn Anything, Anytime, Anywhere
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          Explore a world of online courses with DecentralUdemy.
        </Typography>
        <Box className={classes.searchForm}>
          <TextField
            className={classes.searchInput}
            label="Search for courses..."
            value={searchInfo.query}
            onChange={(e) =>
              setSearchInfo({
                ...searchInfo,
                query: e.target.value,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button
            className={classes.searchButton}
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <SearchIcon />
            Search
          </Button>
        </Box>
      </Container>
      {loading ? (
        <Container className="mt-4">
          <Box className="text-center">
            <Typography variant="body1" style={{ color: "white" }}>
              Loading...
            </Typography>
          </Box>
        </Container>
      ) : filteredCourses.length > 0 ? (
        <Container className="mt-4">
          <Typography variant="h5" style={{ color: "#3f51b5" }}>
            Search Results:
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="space-around">
            {filteredCourses.map((course) => (
              <Card key={course.id} className={classes.courseCard}>
                <CardMedia
                  component="img"
                  image={course.coverImage}
                  alt={course.title}
                />
                <CardContent>
                  <Typography variant="h6" className={classes.courseTitle}>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.courseDescription}
                  >
                    {course.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    className={classes.enrollButton}
                    variant="contained"
                    onClick={() => enrollCourse(course.id, course.price)}
                  >
                    Enroll
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Container>
      ) : (
        <Container className="mt-4">
          <Box className="text-center">
            <Typography variant="body1" style={{ color: "#f44336" }}>
              No search results.
            </Typography>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default Home;
