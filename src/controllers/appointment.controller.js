import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// // Function to convert time string (HH:mm) to Date object
// const convertTimeStringToDate = (dateString, timeString) => {
//     const [hours, minutes] = timeString.split(':').map(Number);
//     const date = new Date();
//     const parsedDate = Date.parse(dateString)
//     parsedDate.setHours(hours, minutes, 0, 0).toLocaleString();

//     console.log(parsedDate)
//     return date;
// };

const convertTimeStringToDate = (dateString, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const [year, months, day] = dateString.split("-").map(Number)
    console.log(`Date: ${year}, ${months}, ${day}`)

    const date = new Date(`${year}, ${months}, ${day}`);

    date.setHours(hours, minutes, 0, 0);
    console.log(date.toDateString())
    return date;
};

convertTimeStringToDate("2019-05-02", "11:30");

const createAppointment = asyncHandler(
    async (req, res) => {
        const { userId, salonId, serviceId, salonExpertId, date, timeSlot } = req.body;

        // Validate incoming data
        if ([userId, salonId, serviceId, salonExpertId].some((filed) => { filed.trim() === "" })) {
            throw new ApiError(400, "All fields are required")
        }


    }
);

const cancelAppointment = asyncHandler(
    async (req, res) => {

    }
);