import React, { useState, useEffect } from "react";
// import "../assets/css/Dashboard.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import CourseContent from "./CourseContent";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import logo from "../assets/images/udemy-logo.png";
import { useSelector } from "react-redux";
import Connect from "../components/Connect";

import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress } from "../utils/contracts-config";

const useStyles = makeStyles({
  container: {
    marginTop: "16px",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#3f51b5",
  },
  line: {
    width: "80%",
    margin: "0 auto",
    border: "1px solid #3f51b5",
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
  courseMedia: {
    height: "200px",
  },
  courseTitle: {
    color: "orange",
    fontWeight: "bold",
  },
  courseDescription: {
    color: "#616161",
  },
  price: {
    color: "#3f51b5",
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#f44336",
    color: "white",
    "&:hover": {
      backgroundColor: "#e57373",
      color: "#212121",
    },
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

const Dashboard = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [coursesList, setCoursesList] = useState([]);
  const [enrollmentsList, setEnrollmentsList] = useState([]);

  const getCoursesList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const UdemyContract = new ethers.Contract(
      contractAddress,
      DecentralUdemy.abi,
      signer
    );

    const courses = await UdemyContract.getInstructorCourses(data.account);

    const items = await Promise.all(
      courses.map(async (c) => {
        return {
          id: Number(c),
          title: (await UdemyContract.getCourse(c)).title,
          description: (await UdemyContract.getCourse(c)).description,
          coverImage: (await UdemyContract.getCourse(c)).coverImage,
          price: utils.formatUnits(
            (await UdemyContract.getCourse(c)).price,
            "ether"
          ),
        };
      })
    );

    setCoursesList(items);
  };

  const getEnrollmentsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const UdemyContract = new ethers.Contract(
      contractAddress,
      DecentralUdemy.abi,
      signer
    );

    const enrollments = await UdemyContract.getStudentEnrollments(data.account);

    const items = await Promise.all(
      enrollments.map(async (e) => {
        const courseId = e;
        const course = await UdemyContract.getCourse(courseId);
        return {
          courseId: Number(courseId),
          title: course.title,
          description: course.description,
          coverImage: course.coverImage,
          price: utils.formatUnits(course.price, "ether"),
        };
      })
    );

    setEnrollmentsList(items);
  };

  useEffect(() => {
    getCoursesList();
    getEnrollmentsList();
  }, [data.account]);

  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" className={classes.title}>
            Your Courses
          </Typography>
          <hr className={classes.line} />
          {coursesList.length !== 0 ? (
            coursesList.map((e, i) => (
              <Card key={i} className={classes.courseCard}>
                <CardMedia
                  component="img"
                  image={e.coverImage}
                  alt="course"
                  className={classes.courseMedia}
                />
                <CardContent>
                  <Typography variant="h6" className={classes.courseTitle}>
                    {e.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.courseDescription}
                  >
                    {e.description}
                  </Typography>
                  <Typography variant="body1" className={classes.price}>
                    {e.price} USD
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Grid container justifyContent="center" alignItems="center">
              <Typography variant="h5">
                You haven't created any courses yet
              </Typography>
              <Link to="/add-course" style={{ textDecoration: "none" }}>
                <Button className={classes.createButton} variant="contained">
                  Create Course
                </Button>
              </Link>
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" className={classes.title}>
            Your Enrollments
          </Typography>
          <hr className={classes.line} />
          {enrollmentsList.length !== 0 ? (
            enrollmentsList.map((e, i) => (
              <Link
                to={`/course/${e.courseId}`}
                key={i}
                style={{ textDecoration: "none" }}
              >
                <Card className={classes.courseCard}>
                  <CardMedia
                    component="img"
                    image={e.coverImage}
                    alt="course"
                    className={classes.courseMedia}
                  />
                  <CardContent>
                    <Typography variant="h6" className={classes.courseTitle}>
                      {e.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.courseDescription}
                    >
                      {e.description}
                    </Typography>
                    <Typography variant="body1" className={classes.price}>
                      {e.price} USD
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      className={classes.enrollButton}
                      variant="contained"
                    >
                      Enroll
                    </Button>
                  </CardActions>
                </Card>
              </Link>
            ))
          ) : (
            <Grid container justifyContent="center" alignItems="center">
              <Typography variant="h5">
                You haven't enrolled in any courses yet
              </Typography>
              <Link to="/courses" style={{ textDecoration: "none" }}>
                <Button className={classes.enrollButton} variant="contained">
                  Explore Courses
                </Button>
              </Link>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
