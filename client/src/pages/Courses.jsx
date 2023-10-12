import React, { useState, useEffect } from "react";
import logo from "../assets/images/udemy-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ethers, utils } from "ethers";
import {
  Container,
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Connect from "../components/Connect";

import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const useStyles = makeStyles({
  topBanner: {
    backgroundColor: "#3f51b5",
    color: "white",
    padding: "16px",
  },
  lrContainers: {
    display: "flex",
    justifyContent: "flex-end",
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
  courseDesc: {
    color: "#616161",
  },
  enrollButton: {
    backgroundColor: "#f44336",
    color: "white",
    "&:hover": {
      backgroundColor: "#e57373",
      color: "#212121",
    },
  },
  price: {
    color: "#3f51b5",
    fontWeight: "bold",
  },
});

const Courses = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const data = useSelector((state) => state.blockchain.value);

  const [coursesList, setCoursesList] = useState([]);

  const getCoursesList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const UdemyContract = new ethers.Contract(
      contractAddress,
      DecentralUdemy.abi,
      signer
    );

    const courses = await UdemyContract.getAllCourses();

    const items = courses.map((c) => {
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
        price: utils.formatUnits(c.price, "ether"),
      };
    });

    setCoursesList(items);
  };

  const enrollCourse = async (_id, _price) => {
    if (data.network === networksMap[networkDeployedTo]) {
      try {
        setLoading(true);
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

        const course = await UdemyContract.getCourse(_id);
        const coursePriceETH = await UdemyContract.convertFromUSD(
          utils.parseEther(_price, "ether")
        );

        const enroll_tx = await UdemyContract.enrollInCourse(_id, {
          value: coursePriceETH,
        });
        await enroll_tx.wait();

        setLoading(false);
        navigate("/dashboard");
      } catch (err) {
        setLoading(false);
        window.alert("An error has occurred, please try again");
      }
    } else {
      setLoading(false);
      window.alert(
        `Please switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  };

  useEffect(() => {
    getCoursesList();
  }, []);

  const classes = useStyles();

  return (
    <Container>
      {/* <Grid container>
        <Grid item xs={12}>
          <Box className={classes.topBanner}>
            <Box className={classes.lrContainers}>
              <Connect />
            </Box>
          </Box>
          <hr className="my-4" />
        </Grid>
      </Grid> */}

      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h4" align="center" style={{ margin: "16px" }}>
            Available Courses
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {coursesList.map((e, i) => (
          <Grid key={i} item xs={12} md={4}>
            <Card className={classes.courseCard}>
              <CardMedia component="img" image={e.coverImage} alt="course" />
              <CardContent>
                <Typography variant="h6" className={classes.courseTitle}>
                  {e.title}
                </Typography>
                <Typography variant="body2" className={classes.courseDesc}>
                  {e.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  className={classes.enrollButton}
                  variant="contained"
                  onClick={() => {
                    enrollCourse(e.id, e.price);
                  }}
                >
                  {loading ? <CircularProgress color="inherit" /> : "Enroll"}
                </Button>
                <Typography variant="body1" className={classes.price}>
                  {e.price} USD
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {coursesList.length === 0 && (
        <Grid container justifyContent="center" alignItems="center">
          <Typography variant="h5" style={{ margin: "16px" }}>
            No courses available
          </Typography>
        </Grid>
      )}
    </Container>
  );
};

export default Courses;
