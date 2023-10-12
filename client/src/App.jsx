import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Admin,
  AddCourses,
  Dashboard,
  Home,
  Courses,
  CourseContent,
} from "./pages";
import { ethers } from "ethers";
import DecentralUdemy from "./artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress } from "./utils/contracts-config";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState("");

  const connectToEthereum = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress,
          DecentralUdemy.abi,
          provider
        );

        const admin = await contract.getAdmin();
        const userAddress = await provider.getSigner().getAddress();

        if (admin === userAddress) {
          setIsAdmin(true);
        }

        setAdminAddress(admin);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    connectToEthereum();
  }, []);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        {isAdmin && <Route path="/admin" element={<Admin />} />}
        <Route path="/add-course" element={<AddCourses />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseContent />} />
      </Routes>
    </Router>
  );
}

export default App;
