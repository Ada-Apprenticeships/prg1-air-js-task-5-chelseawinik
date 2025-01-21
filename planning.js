// Import the 'fs' module to read files
const fs = require('fs');

// Function to read a CSV file and return its data as an array of rows
function readCsv(filename, delimiter = ',') {
    try {
        // Read the file content as a string
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        
        // Split the file content into rows based on newline characters
        const rows = fileContent.split('\n');
        
        // Initialize an empty array to store the parsed data
        const data = [];

        // Loop through each row, starting from the second row (skip the header)
        for (let i = 1; i < rows.length; i++) {
            // Trim any extra spaces from the row
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
        // If there's an error reading the file, log the error and return null
        console.error("Error reading file:", err.message);
        return null;
    }
}

// Function to calculate the profit for a flight
function calculateProfit(flight, airports, aeroplanes) {
    // Destructure the flight data into individual variables
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats, economyPrice, businessPrice, firstClassPrice] = flight;

    // Log the flight details for debugging
    console.log(`Processing flight: ${ukAirport} to ${overseasAirport} with ${aircraftType}`);

    // Find the airport data for the overseas airport
    const airport = airports.find(a => a[0] === overseasAirport);
    if (!airport) {
        // If the airport is not found, log an error and return null
        console.error(`Airport not found: ${overseasAirport}`);
        return null;
    }

    // Get the distance based on the UK airport (MAN or LGW)
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);
    console.log(`Distance: ${distance} km`);

    // Find the aircraft data for the flight's aircraft type
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    if (!aircraft) {
        // If the aircraft is not found, log an error and return null
        console.error(`Aircraft not found: ${aircraftType}`);
        return null;
    }

    // Remove the £ symbol and parse the cost per seat per 100km as a number
    const costPerSeatPer100km = parseFloat(aircraft[1].replace('£', ''));
    
    // Get the total number of seats for the aircraft
    const totalSeats = parseInt(aircraft[3]);
    console.log(`Cost per seat per 100km: £${costPerSeatPer100km}, Total seats: ${totalSeats}`);

    // Calculate the income from economy, business, and first-class seats
    const economyIncome = parseInt(economySeats) * parseFloat(economyPrice);
    const businessIncome = parseInt(businessSeats) * parseFloat(businessPrice);
    const firstClassIncome = parseInt(firstClassSeats) * parseFloat(firstClassPrice);
    
    // Calculate the total income
    const totalIncome = economyIncome + businessIncome + firstClassIncome;
    console.log(`Total income: £${totalIncome}`);

    // Calculate the total number of seats booked
    const totalSeatsTaken = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    
    // Calculate the cost per seat for the entire flight
    const costPerSeat = costPerSeatPer100km * (distance / 100);
    
    // Calculate the total cost for the flight
    const totalCost = costPerSeat * totalSeatsTaken;
    console.log(`Total cost: £${totalCost}`);

    // Calculate the profit by subtracting the total cost from the total income
    const profit = totalIncome - totalCost;
    console.log(`Profit: £${profit.toFixed(2)}`);
    
    // Return the calculated profit
    return profit;
}

// Main function to orchestrate the program
function main() {
    // Read the data from the CSV files
    const airportsData = readCsv('airports.csv');
    const aeroplanesData = readCsv('aeroplanes.csv');
    const flightsData = readCsv('valid_flight_data.csv');

    // Check if any of the CSV files failed to load
    if (!airportsData || !aeroplanesData || !flightsData) {
        console.error("Failed to read CSV files.");
        return;
    }

    // Log the parsed CSV data for debugging
    console.log("Airports Data:", airportsData);
    console.log("Aeroplanes Data:", aeroplanesData);
    console.log("Flights Data:", flightsData);

    // Loop through each flight and calculate its profit
    flightsData.forEach(flight => {
        const profit = calculateProfit(flight, airportsData, aeroplanesData);
        
        // If the profit calculation is successful, log the result
        if (profit !== null) {
            console.log(`Flight from ${flight[0]} to ${flight[1]} with ${flight[2]}: Profit = £${profit.toFixed(2)}`);
        }
    });
}

// Run the main function to start the program
main();