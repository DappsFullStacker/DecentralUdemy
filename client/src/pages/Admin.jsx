import React, { useState } from "react";
import { ethers } from "ethers";
// import { Button, TextField, CircularProgress } from "@mui/material";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress } from "../utils/contracts-config";

const useStyles = makeStyles({
  title: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#3f51b5",
  },
  inputGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "16px 0",
  },
  input: {
    width: "60%",
  },
  button: {
    width: "35%",
    backgroundColor: "#3f51b5",
    color: "white",
    "&:hover": {
      backgroundColor: "#7986cb",
      color: "#212121",
    },
  },
  withdrawButton: {
    width: "50%",
    backgroundColor: "#3f51b5",
    color: "white",
    "&:hover": {
      backgroundColor: "#7986cb",
      color: "#212121",
    },
  },
});

const AdminPage = () => {
  const [newFee, setNewFee] = useState("");
  const [newPriceFeedAddress, setNewPriceFeedAddress] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const validateAddress = (address) => {
    return ethers.utils.isAddress(address);
  };

  const validateNumber = (number) => {
    return /^\d+$/.test(number);
  };

  const changeCourseCreationFee = async () => {
    if (!validateNumber(newFee)) {
      alert("Please enter a valid number for the new fee.");
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const UdemyContract = new ethers.Contract(
        contractAddress,
        DecentralUdemy.abi,
        signer
      );

      const transaction = await UdemyContract.changeCourseCreationFee(newFee);
      await transaction.wait();

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const withdrawBalance = async () => {
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const UdemyContract = new ethers.Contract(
        contractAddress,
        DecentralUdemy.abi,
        signer
      );

      const transaction = await UdemyContract.withdrawBalance();
      await transaction.wait();

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const updatePriceFeedAddress = async () => {
    if (!validateAddress(newPriceFeedAddress)) {
      alert("Please enter a valid Ethereum address for the new price feed.");
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const UdemyContract = new ethers.Contract(
        contractAddress,
        DecentralUdemy.abi,
        signer
      );

      const transaction = await UdemyContract.updatePriceFeedAddress(
        newPriceFeedAddress
      );
      await transaction.wait();

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const changeAdminAddress = async () => {
    if (!validateAddress(newAdminAddress)) {
      alert("Please enter a valid Ethereum address for the new admin.");
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const UdemyContract = new ethers.Contract(
        contractAddress,
        DecentralUdemy.abi,
        signer
      );

      const transaction = await UdemyContract.changeAdminAddress(
        newAdminAddress
      );
      await transaction.wait();

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const classes = useStyles();

  return (
    <Container className="admin-container">
      <Typography variant="h4" className={classes.title}>
        Admin Page
      </Typography>
      <Box>
        <Box className={classes.inputGroup}>
          <TextField
            className={classes.input}
            label="New Fee"
            type="number"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
          />
          <Button
            className={classes.button}
            variant="contained"
            onClick={changeCourseCreationFee}
            disabled={loading}
          >
            Change Course Creation Fee
          </Button>
        </Box>

        <Box className={classes.inputGroup}>
          <TextField
            className={classes.input}
            label="New Price Feed Address"
            value={newPriceFeedAddress}
            onChange={(e) => setNewPriceFeedAddress(e.target.value)}
          />
          <Button
            className={classes.button}
            variant="contained"
            onClick={updatePriceFeedAddress}
            disabled={loading}
          >
            Update Price Feed Address
          </Button>
        </Box>

        <Box className={classes.inputGroup}>
          <TextField
            className={classes.input}
            label="New Admin Address"
            value={newAdminAddress}
            onChange={(e) => setNewAdminAddress(e.target.value)}
          />
          <Button
            className={classes.button}
            variant="contained"
            onClick={changeAdminAddress}
            disabled={loading}
          >
            Change Admin Address
          </Button>
        </Box>
      </Box>

      <Box className="text-center mt-4">
        <Button
          className={classes.withdrawButton}
          variant="contained"
          onClick={withdrawBalance}
          disabled={loading}
        >
          Withdraw Balance
        </Button>
      </Box>

      {loading && (
        <Box className="text-center mt-4">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default AdminPage;
