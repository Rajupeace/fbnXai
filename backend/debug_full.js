try {
    console.log("1. dotenv"); require('dotenv').config();
    console.log("2. path"); require('path');
    console.log("3. express"); require('express');
    console.log("4. cors"); require('cors');
    console.log("5. fs"); require('fs');
    console.log("6. chokidar"); require('chokidar');
    console.log("7. dashboardConfig"); require('./dashboardConfig');
    console.log("8. dbHelper"); require('./dbHelper');
    console.log("9. uuid"); require('uuid');
    console.log("10. mongoose"); require('mongoose');
    console.log("11. multer"); require('multer');
    console.log("12. config/db"); require('./config/db');
    console.log("13. jsonwebtoken"); require('jsonwebtoken');
    console.log("14. models/Admin"); require('./models/Admin');
    console.log("15. models/Student"); require('./models/Student');
    console.log("16. models/Faculty"); require('./models/Faculty');
    console.log("17. models/Course"); require('./models/Course');
    console.log("18. models/Message"); require('./models/Message');
    console.log("19. controllers/materialController"); require('./controllers/materialController');

    console.log("20. SUCCESS - ALL MODULES FOUND");
} catch (e) {
    console.error("!!! REQUIRE FAILED at step !!!");
    console.error(e);
}
