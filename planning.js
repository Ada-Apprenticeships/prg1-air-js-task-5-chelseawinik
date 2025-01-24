// Import the 'fs' module to enable file system operations
const fs = require('fs');

// Function to read a CSV file and return its data as an array of rows
function readCsv(filename, delimiter = ',') {
    try {
        // Read the file content synchronously with UTF-8 encoding
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        
        // Split the file content into rows based on newline characters
        const rows = fileContent.split('\n');
        
        // Initialize an empty array to store the parsed data
        const data = [];

        // Loop through each row, starting from the second row (index 1) to skip the header
        for (let i = 1; i < rows.length; i++) {
            // Trim any leading/trailing whitespace from the row
            const row = rows[i].trim();
            
            // Check if the row is not empty
            if (row) {
                // Split the row into columns based on the delimiter
                const columns = row.split(delimiter);
                
                // Add the columns to the data array
                data.push(columns);
            }
        }

        // Return the parsed data
        return data;
    } catch (err) {
        // Log an error message if the file cannot be read
        console.error("Error reading file:", err.message);
        
        // Return null to indicate failure
        return null;
    }
}

// Function to validate a flight
function validateFlight(flight, airports, aeroplanes) {
    // Destructure the flight array into individual variables
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats] = flight;

    // Check if the overseas airport exists in the airports data
    const airport = airports.find(a => a[0] === overseasAirport);
    if (!airport) {
        // Return an error if the airport is not found
        return { valid: false, error: `Invalid overseas airport code: ${overseasAirport}` };
    }

    // Check if the aircraft type exists in the aeroplanes data
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    if (!aircraft) {
        // Return an error if the aircraft type is not found
        return { valid: false, error: `Invalid aircraft type: ${aircraftType}` };
    }

    // Calculate the distance based on the UK airport (MAN or another)
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);
    
    // Get the maximum range of the aircraft
    const maxRange = parseFloat(aircraft[2]);
    
    // Check if the aircraft's range is insufficient for the distance
    if (distance > maxRange) {
        return { valid: false, error: `Aircraft range insufficient for distance: ${distance} km > ${maxRange} km` };
    }

    // Calculate the total number of seats booked
    const totalSeats = parseInt(aircraft[3]);
    const totalSeatsBooked = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    
    // Check if the total seats booked exceed the aircraft's capacity
    if (totalSeatsBooked > totalSeats) {
        return { valid: false, error: `Too many seats booked: ${totalSeatsBooked} > ${totalSeats}` };
    }

    // Get the capacity for each class of seats
    const economyCapacity = parseInt(aircraft[4]);
    const businessCapacity = parseInt(aircraft[5]);
    const firstClassCapacity = parseInt(aircraft[6]);

    // Check if the number of seats booked for each class exceeds its capacity
    if (parseInt(economySeats) > economyCapacity) {
        return { valid: false, error: `Too many economy seats booked: ${economySeats} > ${economyCapacity}` };
    }
    if (parseInt(businessSeats) > businessCapacity) {
        return { valid: false, error: `Too many business seats booked: ${businessSeats} > ${businessCapacity}` };
    }
    if (parseInt(firstClassSeats) > firstClassCapacity) {
        return { valid: false, error: `Too many first-class seats booked: ${firstClassSeats} > ${firstClassCapacity}` };
    }

    // If all checks pass, the flight is valid
    return { valid: true };
}

// Function to calculate the profit for a flight
function calculateProfit(flight, airports, aeroplanes) {
    // Destructure the flight array into individual variables
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats, economyPrice, businessPrice, firstClassPrice] = flight;

    // Find the distance for the flight based on the UK airport
    const airport = airports.find(a => a[0] === overseasAirport);
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);

    // Find the aircraft details
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    
    // Extract the cost per seat per 100 km (removing the '£' symbol)
    const costPerSeatPer100km = parseFloat(aircraft[1].replace('£', ''));

    // Calculate income for each class of seats
    const economyIncome = parseInt(economySeats) * parseFloat(economyPrice);
    const businessIncome = parseInt(businessSeats) * parseFloat(businessPrice);
    const firstClassIncome = parseInt(firstClassSeats) * parseFloat(firstClassPrice);
    
    // Calculate the total income
    const totalIncome = economyIncome + businessIncome + firstClassIncome;

    // Calculate the total number of seats booked
    const totalSeatsTaken = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    
    // Calculate the cost per seat for the entire distance
    const costPerSeat = costPerSeatPer100km * (distance / 100);
    
    // Calculate the total cost
    const totalCost = costPerSeat * totalSeatsTaken;

    // Calculate the profit by subtracting the total cost from the total income
    const profit = totalIncome - totalCost;
    
    // Return the profit
    return profit;
}

// Main function to orchestrate the program
function main() {
    // Read the data from the CSV files
    const airportsData = readCsv('airports.csv');
    const aeroplanesData = readCsv('aeroplanes.csv');
    const flightsData = readCsv('invalid_flight_data.csv');

    // Check if any of the CSV files failed to load
    if (!airportsData || !aeroplanesData || !flightsData) {
        console.error("Failed to read CSV files.");
        return;
    }

    // Process each flight in the flights data
    flightsData.forEach(flight => {
        // Validate the flight
        const validation = validateFlight(flight, airportsData, aeroplanesData);

        if (!validation.valid) {
            // Log the error and skip this flight if it's invalid
            console.error(`Invalid flight: ${flight[0]} to ${flight[1]} with ${flight[2]} - ${validation.error}`);
        } else {
            // Calculate and log the profit for valid flights
            const profit = calculateProfit(flight, airportsData, aeroplanesData);
            console.log(`Flight from ${flight[0]} to ${flight[1]} with ${flight[2]}: Profit = £${profit.toFixed(2)}`);
        }
    });
}

// Run the main function to start the program
main();
