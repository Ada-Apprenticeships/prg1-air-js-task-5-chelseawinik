const fs = require('fs');

// Function to read a CSV file and return its data as an array of rows
function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }

        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

// Function to validate a flight
function validateFlight(flight, airports, aeroplanes) {
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats] = flight;

    // Check if the overseas airport exists
    const airport = airports.find(a => a[0] === overseasAirport);
    if (!airport) {
        return { valid: false, error: `Invalid overseas airport code: ${overseasAirport}` };
    }

    // Check if the aircraft type exists
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    if (!aircraft) {
        return { valid: false, error: `Invalid aircraft type: ${aircraftType}` };
    }

    // Check if the aircraft has enough range
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);
    const maxRange = parseFloat(aircraft[2]);
    if (distance > maxRange) {
        return { valid: false, error: `Aircraft range insufficient for distance: ${distance} km > ${maxRange} km` };
    }

    // Check if the number of seats booked exceeds the aircraft's capacity
    const totalSeats = parseInt(aircraft[3]);
    const totalSeatsBooked = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    if (totalSeatsBooked > totalSeats) {
        return { valid: false, error: `Too many seats booked: ${totalSeatsBooked} > ${totalSeats}` };
    }

    // Check if the number of seats per class exceeds the aircraft's capacity
    const economyCapacity = parseInt(aircraft[4]);
    const businessCapacity = parseInt(aircraft[5]);
    const firstClassCapacity = parseInt(aircraft[6]);

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
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats, economyPrice, businessPrice, firstClassPrice] = flight;

    // Find the distance for the flight
    const airport = airports.find(a => a[0] === overseasAirport);
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);

    // Find the aircraft details
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    const costPerSeatPer100km = parseFloat(aircraft[1].replace('£', ''));

    // Calculate income
    const economyIncome = parseInt(economySeats) * parseFloat(economyPrice);
    const businessIncome = parseInt(businessSeats) * parseFloat(businessPrice);
    const firstClassIncome = parseInt(firstClassSeats) * parseFloat(firstClassPrice);
    const totalIncome = economyIncome + businessIncome + firstClassIncome;

    // Calculate cost
    const totalSeatsTaken = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    const costPerSeat = costPerSeatPer100km * (distance / 100);
    const totalCost = costPerSeat * totalSeatsTaken;

    // Calculate profit
    const profit = totalIncome - totalCost;
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

    // Process each flight
    flightsData.forEach(flight => {
        // Validate the flight
        const validation = validateFlight(flight, airportsData, aeroplanesData);

        if (!validation.valid) {
            // Log the error and skip this flight
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