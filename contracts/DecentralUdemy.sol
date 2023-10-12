// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./PriceConverter.sol";

contract DecentralUdemy is PriceConverter {
    //--------------------------------------------------------------------
    // VARIABLES

    address public admin;

    uint256 public courseCreationFee;
    uint256 private _courseIds;

    struct CourseInfo {
        uint256 id;
        address instructor;
        string title;
        string description;
        string coverImage;
        string[] videoURLs; // Array to store video URLs
        uint256 price;
    }

    struct Enrollment {
        address student;
        uint256 enrollmentDate;
    }

    CourseInfo[] public courses;
    mapping(address => uint256[]) instructorCourses; // Tracks courses added by instructors
    mapping(address => uint256[]) studentCourses;    // Tracks courses enrolled in by students
    mapping(uint256 => Enrollment[]) public courseEnrollments; // Declare and initialize the course enrollments mapping

    //--------------------------------------------------------------------
    // EVENTS

    event NewCourseCreated(
        uint256 id,
        address instructor,
        string title,
        string description,
        string coverImage,
        string[] videoURLs, 
        uint256 price
    );

    event NewEnrollment(
        uint256 courseId,
        address student,
        uint256 enrollmentDate
    );

    //--------------------------------------------------------------------
    // ERRORS

    error DecentralUdemy__OnlyAdmin();
    error DecentralUdemy__InvalidFee();
    error DecentralUdemy__InvalidCourseId();
    error DecentralUdemy__AlreadyEnrolled();
    error DecentralUdemy__InsufficientAmount();
    error DecentralUdemy__TransferFailed();

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyAdmin() {
        if (msg.sender != admin) revert DecentralUdemy__OnlyAdmin();
        _;
    }

    modifier isCourse(uint256 _id) {
        if (_id >= _courseIds) revert DecentralUdemy__InvalidCourseId();
        _;
    }

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(uint256 _courseCreationFee, address _priceFeedAddress) {
        admin = msg.sender;
        courseCreationFee = _courseCreationFee;
        priceFeedAddress = _priceFeedAddress;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS

    function createCourse(
        string memory _title,
        string memory _description,
        string memory _coverImage,
        string[] memory _videoURLs, // Array of video URLs
        uint256 _price
    ) external payable {
        require(msg.value == courseCreationFee, "Invalid fee");

        uint256 _courseId = _courseIds;

        CourseInfo memory newCourse = CourseInfo({
            id: _courseId,
            instructor: msg.sender,
            title: _title,
            description: _description,
            coverImage: _coverImage,
            videoURLs: _videoURLs, 
            price: _price
        });

        courses.push(newCourse);
        _courseIds++;
        
        // Track the course added by the instructor
        instructorCourses[msg.sender].push(_courseId);

        emit NewCourseCreated(
            _courseId,
            msg.sender,
            _title,
            _description,
            _coverImage,
            _videoURLs, 
            _price
        );
    }

    function enrollInCourse(uint256 _courseId) external payable {
        require(_courseId >= 0 && _courseId < courses.length, "Invalid course ID");

        CourseInfo storage course = courses[_courseId];

        // Check if the student is already enrolled
        for (uint256 i = 0; i < studentCourses[msg.sender].length; i++) {
            if (studentCourses[msg.sender][i] == _courseId) {
                revert DecentralUdemy__AlreadyEnrolled();
            }
        }

        uint256 coursePriceInETH = convertFromUSD(course.price); // Convert course price to ETH

        require(msg.value == coursePriceInETH, "Insufficient amount");

        // Transfer the course fee to the instructor
        payable(course.instructor).transfer(msg.value);

        Enrollment memory newEnrollment = Enrollment({
            student: msg.sender,
            enrollmentDate: block.timestamp
        });

        courseEnrollments[_courseId].push(newEnrollment);

        // Track the course enrolled in by the student
        studentCourses[msg.sender].push(_courseId);

        emit NewEnrollment(_courseId, msg.sender, block.timestamp);
    }

    function getCourse(uint256 _courseId) external view returns (CourseInfo memory) {
        require(_courseId >= 0 && _courseId < courses.length, "Invalid course ID");
        return courses[_courseId];
    }

    function getAllCourses() external view returns (CourseInfo[] memory) {
        return courses;
    }

    function getInstructorCourses(address instructor) external view returns (uint256[] memory) {
        return instructorCourses[instructor];
    }

    function getStudentEnrollments(address student) external view returns (uint256[] memory) {
        return studentCourses[student];
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    // ADMIN FUNCTIONS

    function changeCourseCreationFee(uint256 _newFee) external onlyAdmin {
        courseCreationFee = _newFee;
    }

    function withdrawBalance() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(admin).transfer(balance);
    }

    function updatePriceFeedAddress(address _newPriceFeedAddress) external onlyAdmin {
        priceFeedAddress = _newPriceFeedAddress;
    }

    function changeAdminAddress(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }
}
