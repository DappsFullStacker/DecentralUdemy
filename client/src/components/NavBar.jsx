import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Connect from "./Connect";
import logo from "../assets/images/udemy-logo.png";
import { ethers } from "ethers";
import DecentralUdemy from "../artifacts/contracts/DecentralUdemy.sol/DecentralUdemy.json";
import { contractAddress } from "../utils/contracts-config";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  logo: {
    height: 40,
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: theme.spacing(2),
  },
}));

function NavBar() {
  const classes = useStyles();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

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

  // Handle the menu open and close events
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <RouterLink to="/">
          <img className={classes.logo} src={logo} alt="logo" />
        </RouterLink>
        <Typography variant="h6" className={classes.title}>
          Decentralized Udemy
        </Typography>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {isAdmin && (
            <MenuItem
              component={RouterLink}
              to="/admin"
              onClick={handleMenuClose}
            >
              Admin
            </MenuItem>
          )}
          <MenuItem
            component={RouterLink}
            to="/add-course"
            onClick={handleMenuClose}
          >
            Add Courses
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/dashboard"
            onClick={handleMenuClose}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/courses"
            onClick={handleMenuClose}
          >
            All Courses
          </MenuItem>
        </Menu>
        <Connect />
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
