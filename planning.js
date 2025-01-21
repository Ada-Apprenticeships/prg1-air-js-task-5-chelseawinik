const fs = require('fs');

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

function calculateProfit(flight, airports, aeroplanes) {
    const [ukAirport, overseasAirport, aircraftType, economySeats, businessSeats, firstClassSeats, economyPrice, businessPrice, firstClassPrice] = flight;

    // Log flight details for debugging
    console.log(`Processing flight: ${ukAirport} to ${overseasAirport} with ${aircraftType}`);

    // Find the distance for the flight
    const airport = airports.find(a => a[0] === overseasAirport);
    if (!airport) {
        console.error(`Airport not found: ${overseasAirport}`);
        return null;
    }
    const distance = parseFloat(ukAirport === 'MAN' ? airport[2] : airport[3]);
    console.log(`Distance: ${distance} km`);

    // Find the aircraft details
    const aircraft = aeroplanes.find(a => a[0] === aircraftType);
    if (!aircraft) {
        console.error(`Aircraft not found: ${aircraftType}`);
        return null;
    }
    const costPerSeatPer100km = parseFloat(aircraft[1]);
    const totalSeats = parseInt(aircraft[3]);
    console.log(`Cost per seat per 100km: £${costPerSeatPer100km}, Total seats: ${totalSeats}`);

    // Calculate income
    const economyIncome = parseInt(economySeats) * parseFloat(economyPrice);
    const businessIncome = parseInt(businessSeats) * parseFloat(businessPrice);
    const firstClassIncome = parseInt(firstClassSeats) * parseFloat(firstClassPrice);
    const totalIncome = economyIncome + businessIncome + firstClassIncome;
    console.log(`Total income: £${totalIncome}`);

    // Calculate cost
    const totalSeatsTaken = parseInt(economySeats) + parseInt(businessSeats) + parseInt(firstClassSeats);
    const costPerSeat = costPerSeatPer100km * (distance / 100);
    const totalCost = costPerSeat * totalSeatsTaken;
    console.log(`Total cost: £${totalCost}`);

    // Calculate profit
    const profit = totalIncome - totalCost;
    console.log(`Profit: £${profit.toFixed(2)}`);
    return profit;
}

function main() {
    const airportsData = readCsv('airports.csv');
    const aeroplanesData = readCsv('aeroplanes.csv');
    const flightsData = readCsv('valid_flight_data.csv');

    if (!airportsData || !aeroplanesData || !flightsData) {
        console.error("Failed to read CSV files.");
        return;
    }

    // Log CSV data for debugging
    console.log("Airports Data:", airportsData);
    console.log("Aeroplanes Data:", aeroplanesData);
    console.log("Flights Data:", flightsData);

    flightsData.forEach(flight => {
        const profit = calculateProfit(flight, airportsData, aeroplanesData);
        if (profit !== null) {
            console.log(`Flight from ${flight[0]} to ${flight[1]} with ${flight[2]}: Profit = £${profit.toFixed(2)}`);
        }
    });
}

main();