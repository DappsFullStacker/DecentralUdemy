const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralUdemy", () => {
  let contractFactory;
  let contract;
  let admin;
  let adminAddress;
  let user1;
  let user2;

  const courseCreationFee = ethers.utils.parseEther("0.01"); // 0.01 Ether

  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners();

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const mockAggregator = await MockV3Aggregator.deploy(8, 20000000000); // Example parameters, adjust as needed
    priceFeedAddress = mockAggregator.address;

    // Deploy DecentralUdemy contract
    contractFactory = await ethers.getContractFactory("DecentralUdemy");
    contract = await contractFactory.deploy(courseCreationFee, priceFeedAddress);
    adminAddress = await admin.getAddress();
  });

  describe("Correct Deployment", () => {
    it("should have correct admin address", async () => {
      const contractAdmin = await contract.admin();
      expect(contractAdmin).to.equal(adminAddress);
    });

    it("should have correct course creation fee", async () => {
      const fee = await contract.courseCreationFee();
      expect(fee).to.equal(courseCreationFee);
    });

    it("should have the correct price feed address", async () => {
      const priceFeed = await contract.priceFeedAddress();
      expect(priceFeed).to.equal(priceFeedAddress);
    });
  });

  describe("Course Creation", () => {
    it("should allow the admin to create a new course", async () => {
      const courseTitle = "Sample Course";
      const courseDescription = "Course Description";
      const courseCoverImage = "Image URL";
      const courseVideoURLs = ["Video URL 1", "Video URL 2"];
      const coursePrice = 1000; // 1000 $
  
      // Create a new course
      await contract
        .connect(admin)
        .createCourse(
          courseTitle,
          courseDescription,
          courseCoverImage,
          courseVideoURLs,
          coursePrice,
          { value: courseCreationFee }
        );
  
      // Retrieve the list of courses
      const courses = await contract.getAllCourses();
  
      // Ensure there is exactly one course
      expect(courses.length).to.equal(1);
  
      // Retrieve the created course
      const createdCourse = courses[0];
  
      // Check course properties
      expect(createdCourse.instructor).to.equal(adminAddress);
      expect(createdCourse.title).to.equal(courseTitle);
      expect(createdCourse.description).to.equal(courseDescription);
      expect(createdCourse.coverImage).to.equal(courseCoverImage);
      expect(createdCourse.videoURLs).to.deep.equal(courseVideoURLs);
      expect(createdCourse.price).to.equal(coursePrice);
    });  

    it("should require the correct course creation fee", async () => {
      const wrongCreationFee = ethers.utils.parseEther("0.005"); // Wrong fee
      const courseTitle = "Sample Course";
      const courseDescription = "Course Description";
      const courseCoverImage = "Image URL";
      const courseVideoURLs = ["Video URL 1", "Video URL 2"];
      const coursePrice = 1000; 

      await expect(
        contract
          .connect(admin)
          .createCourse(
            courseTitle,
            courseDescription,
            courseCoverImage,
            courseVideoURLs,
            coursePrice,
            { value: wrongCreationFee }
          )
      ).to.be.revertedWith("Invalid fee");
    });
  });

  describe("Enrollment and Access Control", () => {
    let courseCreationFee;
    let courseId;
  
    beforeEach(async () => {
      courseCreationFee = ethers.utils.parseEther("0.01"); // 0.01 Ether
  
      // Create a course
      await contract
        .connect(admin)
        .createCourse(
          "Sample Course",
          "Course Description",
          "Image URL",
          ["Video URL 1", "Video URL 2"],
          1000, 
          { value: courseCreationFee }
        );
  
      const courses = await contract.getAllCourses();
      courseId = courses[0].id;
    });
  
    it("should allow a student to enroll in a course", async () => {
      const course = await contract.getCourse(courseId);
      const coursePriceInUSD = course.price;
    
      // Use the convertFromUSD function to calculate the equivalent Ether value
      const coursePriceInETH = await contract.convertFromUSD(coursePriceInUSD);
      
      console.log(`Course Price in USD: ${coursePriceInUSD}`);
      console.log(`Course Price in ETH: ${coursePriceInETH}`);
    
      // Use the calculated Ether value as msg.value when enrolling
      await contract.connect(user1).enrollInCourse(courseId, { value: coursePriceInETH });
    
      const studentEnrollments = await contract.getStudentEnrollments(user1.address);
      console.log(`Student Enrollments: ${studentEnrollments}`);
      
      expect(studentEnrollments.toString()).to.include(courseId.toString());
    });    
  
    it("should prevent duplicate enrollment in the same course", async () => {
      const course = await contract.getCourse(courseId);
      const coursePriceInUSD = course.price;
    
      // Use the convertFromUSD function to calculate the equivalent Ether value
      const coursePriceInETH = await contract.convertFromUSD(coursePriceInUSD);
    
      console.log(`Course Price in USD: ${coursePriceInUSD}`);
      console.log(`Course Price in ETH: ${coursePriceInETH}`);
    
      // Use the calculated Ether value as msg.value when enrolling
      await contract.connect(user1).enrollInCourse(courseId, { value: coursePriceInETH });
    
      // Attempt to enroll in the same course again
      try {
        await contract.connect(user1).enrollInCourse(courseId, { value: coursePriceInETH });
        // If the transaction did not revert, fail the test
        expect.fail("Transaction should have reverted");
      } catch (error) {
        // Check if the error message matches the expected one
        expect(error.message).to.include("DecentralUdemy__AlreadyEnrolled");
      }
    });    
  
    it("should require the correct enrollment fee", async () => {
      const wrongEnrollmentFee = ethers.utils.parseEther("0.05"); // Wrong fee
  
      await expect(
        contract.connect(user1).enrollInCourse(courseId, { value: wrongEnrollmentFee })
      ).to.be.revertedWith("Insufficient amount");
    });
  
    it("should allow the admin to change the course creation fee", async () => {
      const newCourseCreationFee = ethers.utils.parseEther("0.02"); // 0.02 Ether
      await contract.connect(admin).changeCourseCreationFee(newCourseCreationFee);
  
      const updatedFee = await contract.courseCreationFee();
      expect(updatedFee).to.equal(newCourseCreationFee);
    });
  
    it("should allow the admin to withdraw contract balance", async () => {
      const initialBalanceContract = await ethers.provider.getBalance(contract.address);
      const initialBalanceAdmin = await ethers.provider.getBalance(adminAddress);
    
      // Withdraw the entire contract balance
      await contract.connect(admin).withdrawBalance();
    
      const finalBalanceContract = await ethers.provider.getBalance(contract.address);
      const finalBalanceAdmin = await ethers.provider.getBalance(adminAddress);
    
      // Check if the final contract balance is zero
      expect(finalBalanceContract).to.equal(0);
    
      // Check if the admin's balance increased
      expect(finalBalanceAdmin).to.be.gt(initialBalanceAdmin);
    });     
    
  
    it("should allow the admin to update the price feed address", async () => {
      const newPriceFeedAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; 
      await contract.connect(admin).updatePriceFeedAddress(newPriceFeedAddress);
  
      const updatedPriceFeed = await contract.priceFeedAddress();
      expect(updatedPriceFeed).to.equal(newPriceFeedAddress);
    });
  
    it("should allow the admin to change the admin address", async () => {
      const newAdminAddress = user1.address;
  
      await contract.connect(admin).changeAdminAddress(newAdminAddress);
  
      const updatedAdmin = await contract.admin();
      expect(updatedAdmin).to.equal(newAdminAddress);
    });
  });
  
});
