try {
    console.log("Require path...");
    require('path');
    console.log("Require fs...");
    require('fs');
    console.log("Require ./dashboardConfig...");
    require('./dashboardConfig');
    console.log("Require ./dbHelper...");
    require('./dbHelper');
    console.log("All requires success!");
} catch (e) {
    console.error("Require failed:", e);
}
