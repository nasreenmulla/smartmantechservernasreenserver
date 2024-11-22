
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
oracledb.initOracleClient();

const poolConfig = {
    user: 'SMART',
    password: 'SMARTQADIM48',
    connectString: 'HOSNEY-RAWNAQ:1521/SMART',
    // Define other pool configuration parameters as needed
    poolAlias: 'default' // Optional: Specify the pool alias
};

async function initPool() {
    try {
        await oracledb.createPool(poolConfig);
        console.log('Oracle Database connection pool created successfully');
    } catch (error) {
        console.error('Error creating Oracle Database connection pool:', error);
        throw error;
    }
}

// Connect to the database pool
// Correct usage of initPool()
initPool().catch(err => {
    console.error('Failed to initialize Oracle Database connection pool:', err);
    process.exit(1); // Exit the process if pool initialization fails
});

// Handle login API endpoint


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection(); // Use default pool alias 'default'

        // Example query to validate credentials against a users table in Oracle
        const result = await connection.execute(
            `SELECT * FROM USERS_INFORMATION WHERE USRINFO_USERNAME = :username AND USR_PASSWORD = :password`,
            { username, password },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Additional logic if needed

        // If everything is valid, return success
        res.status(200).json({ message: 'Login successful', username });


    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });

    } finally {
        if (connection) {
            try {
                // Release the connection back to the pool
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

app.get('/api/company', async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        // Query to fetch all rows from BANKCODE table
        const result = await connection.execute(
            `SELECT * FROM COMPANIES`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Send the fetched data as JSON response
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });

    } finally {
        if (connection) {
            try {
                // Release the connection back to the pool
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
//iNSURANCECOMPAMY api 
app.get('/api/bankcodes', async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        // Query to fetch all rows from BANKCODE table
        const result = await connection.execute(
            `SELECT * FROM BANKS`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Send the fetched data as JSON response
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });

    } finally {
        if (connection) {
            try {
                // Release the connection back to the pool
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
//for city list
app.get('/api/citycodes', async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        // Query to fetch all rows from BANKCODE table
        const result = await connection.execute(
            `SELECT * FROM CITIES_LIST`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Send the fetched data as JSON response
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });

    } finally {
        if (connection) {
            try {
                // Release the connection back to the pool
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
app.get('/api/nationalities', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT NAME_E FROM NATIONALITY`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const nationalities = result.rows.map(row => row.NAME_E);
        res.status(200).json(nationalities);
    } catch (error) {
        console.error('Error fetching nationalities:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

app.post('/api/savePatientInfo', async (req, res) => {
    const {
        USRINFO_USERNAME,
        ACTIVE,
        CIT_ID,
        MOBILE,
        CUST_ID,
        NAME_E,
        DOB,
        NATIONALITY,
        CITY_ID,
        INSURANCE,
        EMAIL,
        INSURANCE_EXPIRY,
        WORK_TYPE,
        PHONE,
        HASBAND_NAME,
        HASBAND_ID,
        HASBAND_PHONE,
        GENDER,
        SMOKER,
        BLOOD_TYPE,
        MARITAL_STATUS,
        VIP,
        CUSTTYP_ID,
        COMMISSION,
        CUST_CODE,
        COM_NO // Assuming COM_NO is sent from the frontend
    } = req.body;

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Retrieve STR_CODE(s) based on COM_NO
        const strCodeQuery = `SELECT STR_CODE FROM STORES WHERE COM_NO = :COM_NO`;
        console.log('Query:', strCodeQuery); // Log the query for debugging
        console.log('COM_NO:', COM_NO); // Log the COM_NO received from frontend
        const strCodeResult = await connection.execute(strCodeQuery, [COM_NO]);
        console.log('Query Result:', strCodeResult); // Log the query result object

        // Extract STR_CODEs from the query result
        const strCodes = strCodeResult.rows.map(row => row[0]);
        console.log('STR_CODES:', strCodes); // Log the extracted STR_CODEs

        // Check if strCodes is empty
        if (strCodes.length === 0) {
            throw new Error('No STR_CODEs found for the given COM_NO');
        }

        // Insert into CUSTOMERS table
        const insertCustomerQuery = `
            INSERT INTO CUSTOMERS (
                USRINFO_USERNAME, ACTIVE, CUST_ID, NAME_E, CUST_CODE, COMMISSION, CUSTTYP_ID, CIT_ID,
                NATIONALITY, INSURANCE, VIP, MOBILE, INSURANCE_EXPIRY, DOB, CITY_ID, EMAIL, PHONE,
                WORK_TYPE, HASBAND_NAME, HASBAND_ID, HASBAND_PHONE, GENDER, SMOKER, BLOOD_TYPE, MARITAL_STATUS
            ) VALUES (
                :USRINFO_USERNAME, :ACTIVE, :CUST_ID, :NAME_E, :CUST_CODE, :COMMISSION, :CUSTTYP_ID, :CIT_ID,
                :NATIONALITY, :INSURANCE, :VIP, :MOBILE, TO_DATE(:INSURANCE_EXPIRY,'MM/DD/YYYY'), TO_DATE(:DOB,'MM/DD/YYYY'),
                :CITY_ID, :EMAIL, :PHONE, :WORK_TYPE, :HASBAND_NAME, :HASBAND_ID, :HASBAND_PHONE, :GENDER, :SMOKER,
                :BLOOD_TYPE, :MARITAL_STATUS
            )
        `;
        const customerParams = {
            USRINFO_USERNAME, ACTIVE, CIT_ID, MOBILE, CUST_ID, NAME_E, DOB, NATIONALITY, CITY_ID, INSURANCE,
            EMAIL, INSURANCE_EXPIRY, PHONE, WORK_TYPE, HASBAND_NAME, HASBAND_ID, HASBAND_PHONE, GENDER,
            SMOKER, BLOOD_TYPE, MARITAL_STATUS, VIP, CUSTTYP_ID, COMMISSION, CUST_CODE
        };
        await connection.execute(insertCustomerQuery, customerParams);
        for (let strCode of strCodes) {
            const patAccNoQuery = `
                SELECT PAT_ACC_NO
                FROM COMPANIES
                WHERE COM_NO = :COM_NO
            `;
            
            const patAccNoResult = await connection.execute(patAccNoQuery, [COM_NO]);
        
            if (patAccNoResult.rows.length === 0) {
                throw new Error(`No PAT_ACC_NO found for COM_NO ${COM_NO}`);
            }
        
            const patAccNo = patAccNoResult.rows[0][0];
            
            // Construct ACC_COM_NO using COM_NO
            const accComNo = `${COM_NO}`;
        
            // Insert into STORE_CUSTOMERS table
            const insertStoreCustomerQuery = `
                INSERT INTO STORE_CUSTOMERS (CUST_ID, STR_CODE, COM_NO, PRICE_ACCESS, CREDIT_LIMIT, ACC_COM_NO, ACC_NO)
                VALUES (:CUST_ID, :STR_CODE, :COM_NO, 1, 5000000, :c, :ACC_NO)
            `;
        
            const params = {
                CUST_ID,
                STR_CODE: strCode,
                COM_NO,
                c: accComNo, // Use accComNo for ACC_COM_NO
                ACC_NO: `${COM_NO}-${patAccNo}`
            };
        
            await connection.execute(insertStoreCustomerQuery, params);
        }
        
        // Insert into STORE_CUSTOMERS table for each STR_CODE
        // for (let strCode of strCodes) {

        //     const patAccNoQuery = `
        //     SELECT PAT_ACC_NO
        //     FROM COMPANIES
        //     WHERE COM_NO = :COM_NO
        // `;
        
        // const patAccNoResult = await connection.execute(patAccNoQuery, [COM_NO]);

        // if (patAccNoResult.rows.length === 0) {
        //     throw new Error(`No PAT_ACC_NO found for COM_NO ${COM_NO}`);
        // }
    
        // const patAccNo = patAccNoResult.rows[0][0];
        // console.log(patAccNo)
       
    
        // const c=COM_NO;
        // console.log(c)
        // const accComNo = `${COM_NO}-${patAccNo}`;
        // console.log(accComNo)
        //     const insertStoreCustomerQuery = `
        //         INSERT INTO STORE_CUSTOMERS (CUST_ID, STR_CODE, COM_NO, PRICE_ACCESS,CREDIT_LIMIT,ACC_COM_NO,ACC_NO) VALUES (:CUST_ID, :STR_CODE, :COM_NO, 1, 5000000, :c, :ACC_NO)
        //     `;
        //     // await connection.execute(insertStoreCustomerQuery, [CUST_ID, strCode, COM_NO,accComNo]);
        //     const params = {
        //         CUST_ID,
        //         STR_CODE: strCode,
        //         COM_NO,
        //         ACC_COM_NO: c, // Use COM_NO for ACC_COM_NO
        //         ACC_NO: `${COM_NO}-${patAccNo}`
        //     };
        //     await connection.execute(insertStoreCustomerQuery, params);
        // }
        

        // Commit the transaction
        await connection.commit();

        console.log('Customer data inserted successfully');
        res.status(200).json({ message: 'Customer data inserted successfully' });
    } catch (error) {
        console.error('Error inserting customer data:', error);
        res.status(500).json({ error: 'Error inserting customer data' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});







app.get('/api/maxCustomerId', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Query to get maximum CUST_ID
        const result = await connection.execute(
            `SELECT MAX(CUST_ID) AS MAX_CUST_ID FROM CUSTOMERS`
        );

        console.log('Query result:', result); // Log the query result for debugging

        // Extract maximum CUST_ID from result
        const maxCustId = result.rows[0][0]; // Access the value in the first row and first column

        console.log('Max CUST_ID:', maxCustId); // Log the extracted maximum CUST_ID

        res.status(200).json({ maxCustId });
    } catch (error) {
        console.error('Error fetching maximum CUST_ID:', error);
        res.status(500).json({ error: 'Error fetching maximum CUST_ID' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
let cachedData = null

app.get('/api/fetchStoresAndCompanies', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();

        const query = `
            SELECT s.COM_NO , s.STR_CODE , c.PAT_ACC_NO 
            FROM STORES s
            JOIN COMPANIES c ON s.COM_NO = c.COM_NO`;

        const result = await connection.execute(query);
        const parameters=result.rows;
      
        
        res.status(200).json(parameters);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});



//FOR SEARCH 
app.get('/api/searchPatient', async (req, res) => {
    let connection;

    try {
        // Retrieve query parameter from request
        const { q } = req.query;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to search for customers
        const query = `
            SELECT *
            FROM CUSTOMERS
            WHERE CUST_ID = :q OR MOBILE = :q OR CIT_ID = :q
        `;
        console.log(query)

        // Bind parameter and execute the query
        const result = await connection.execute(query, [q, q, q], { resultSet: true });
        console.log(result)

        // Fetch all rows from the result set
        const resultSet = result.resultSet;
        console.log(resultSet)
        const rows = await resultSet.getRows(100); 
        console.log(rows)// Adjust the fetch size as needed

        // Convert rows to a standard JSON format
        const customers = rows.map(row => {
            return {
                CREATED_DAT:formatDate(row[14]),
                USRINFO_USERNAME:row[13],

                CUST_ID: row[0],               // CUST_ID
                NAME_E: row[1], 
                ADDRESS:row[3],
                PHONE:row[5],               // NAME_E
                MOBILE: row[6],
                EMAIL:row[8],                // MOBILE
                ACTIVE: row[9],  
                CIT_ID:row[15],              // ACTIVE
                CITY_ID: row[29],              // CITY_ID
                CUST_CODE: row[19],            // CUST_CODE
                GENDER: row[25],               // GENDER
                DOB: formatDate(row[27]),        // Convert date string to Date object
                NATIONALITY: row[30],          // NATIONALITY
                INSURANCE: row[28],            // INSURANCE
                INSURANCE_EXPIRY: formatDate(row[32]),     // Convert date string to Date object
                WORK_TYPE: row[15],            // WORK_TYPE
                SMOKER: row[23],               // SMOKER
                BLOOD_TYPE: row[24],           // BLOOD_TYPE
                MARITAL_STATUS: row[25],       // MARITAL_STATUS
                VIP: row[33]   ,
                HASBAND_NAME:row[34],
                HASBAND_ID:row[35],
                HASBAND_PHONE:row[36],
                WORK_TYPE:row[21]   ,
                GENDER:row[26]           // VIP
                // Add more fields as needed
            };
        });
        
        console.log(customers)
        // Respond with the search results
        res.status(200).json(customers);

        // Close resultSet and release connection
        await resultSet.close();
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Error fetching search results' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
function formatDate(dateString) {
    if (!dateString) return null; // Handle null or undefined case

    const dateObject = new Date(dateString);
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    return `${month}/${day}/${year}`;
}
//for reportcustid
app.get('/api/patient/:custId', async (req, res) => {
    let connection;

    try {
        // Retrieve custId from request parameters
        const { custId } = req.params;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to fetch patient details
        const query = `
            SELECT NAME_E, CIT_ID, NATIONALITY, INSURANCE, GENDER, DOB, SMOKER, BLOOD_TYPE, MARITAL_STATUS,
                   ADDRESS, MOBILE, EMAIL, PHONE, CREATED_DAT, USRINFO_USERNAME,CUST_ID
            FROM CUSTOMERS
            WHERE CUST_ID = :custId
        `;

        // Bind parameter and execute the query
        const result = await connection.execute(query, [custId]);

        // Extract the first row (assuming CUST_ID is unique)
        const patientData = result.rows[0];

        if (!patientData) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Map the database fields to a more structured response
        const formattedData = {
            name: patientData[0],
            qid: patientData[1],
            nationality: patientData[2],
            insurance: patientData[3],
            gender: patientData[4],
            dateOfBirth: patientData[5] ? patientData[5].toISOString().split('T')[0] : '', // Assuming DOB is a Date object
            smoker: patientData[6],
            bloodType: patientData[7],
            maritalStatus: patientData[8],
            address: patientData[9],
            mobile: patientData[10],
            email: patientData[11],
            phone: patientData[12],
            createdDate: patientData[13] ? patientData[13].toISOString().split('T')[0] : '', // Assuming CREATED_DAT is a Date object
            createdBy: patientData[14],
           
            custId:patientData[15]

            // Add more fields as needed
        };

        // Respond with formatted patient data
        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error fetching patient data:', error);
        res.status(500).json({ error: 'Error fetching patient data' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});




//FOR ADDRESSOF REPORT
app.get('/api/company/:scustId', async (req, res) => {
    let connection;

    try {
        // Retrieve SCUST_ID from request parameters
        const { scustId } = req.params;
        console.log('SCUST_ID:', scustId);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch COM_NO from store_customers table based on SCUST_ID
        const comNoQuery = `
            SELECT COM_NO
            FROM STORE_CUSTOMERS
            WHERE CUST_ID = :scustId
        `;
        console.log('comNoQuery:', comNoQuery);

        // Execute the query to fetch COM_NO
        const comNoResult = await connection.execute(comNoQuery, [scustId]);
        console.log('comNoResult:', comNoResult);

        // Extract COM_NO from the first row (assuming only one row is expected)
        const comNo = comNoResult.rows.length > 0 ? comNoResult.rows[0][0] : null;
        console.log('COM_NO:', comNo);

        if (!comNo) {
            return res.status(404).json({ error: 'No company found for the given SCUST_ID' });
        }

        // Query to fetch company details from company table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :comNo
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [comNo]);
        const companyData = companyResult.rows[0];
        console.log(companyData)

        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the response as needed
        const formattedCompanyData = {
            // comNo: companyData[0],  // Adjust indices based on your database schema
            Name1E: companyData[20],
            Name1A:companyData[21],
            Name2E:companyData[22],
            Name2A:companyData[23],
            Name3E:companyData[24],
            Name3A:companyData[25],
            Name4E:companyData[26],
            Name4A:companyData[27],
            Name5E:companyData[28],
            Name5A:companyData[29]



            
            // Add more fields as needed
        };

        // Respond with company details
        res.status(200).json(formattedCompanyData);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ error: 'Error fetching company details' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
app.get('/api/fetchAll', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT USRINFO_USERNAME
             FROM USERS_INFORMATION
             WHERE TYPE = 'D'`,
            [], // No bind variables needed
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Correctly set here
        );
        const doctors = result.rows.map(row => row.USRINFO_USERNAME);
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});



app.get('/api/fetchDoctors', async (req, res) => {
    const { specialty } = req.query;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT USRINFO_USERNAME
             FROM USERS_INFORMATION
             WHERE SPECIALTY = :specialty
             AND TYPE = 'D'`,
            [specialty],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const doctors = result.rows.map(row => row.USRINFO_USERNAME);
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

app.get('/api/fetchSpeciality', async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        // Query to fetch non-null SPECIALTY values from USERS_INFORMATION table
        const result = await connection.execute(
            `SELECT DISTINCT SPECIALTY
             FROM USERS_INFORMATION
             WHERE SPECIALTY IS NOT NULL`, // Filter out null SPECIALTY values
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Extract SPECIALTY values from result rows
        const specialities = result.rows.map(row => row.SPECIALTY);

        // Send the SPECIALTY values as JSON response
        res.status(200).json(specialities);

    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });

    } finally {
        if (connection) {
            try {
                // Release the connection back to the pool
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

app.get('/api/fetchExpectedTime', async (req, res) => {
    const { doctorName } = req.query;
    console.log('doctor is', doctorName); // Assuming doctorName is passed as a query parameter
    let connection;
  
    try {
      // Get a connection from the pool
      connection = await oracledb.getConnection();
  
      // Query to fetch EXPECTED_TIME, START_TIME, and END_TIME for the selected doctor
      const result = await connection.execute(
        `SELECT EXPECTED_TIME, ST_STTIME, ST_ENTIME
         FROM USERS_INFORMATION
         WHERE USRINFO_USERNAME = :doctorName`,
        { doctorName },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (result.rows.length === 0) {
        // If no matching record found for the doctor
        res.status(404).json({ error: 'Doctor not found' });
      } else {
        // Extract EXPECTED_TIME, START_TIME, and END_TIME from the result
        const expectedTime = result.rows[0].EXPECTED_TIME;
        console.log(expectedTime);
        
        const startTime = result.rows[0].ST_STTIME;
        console.log(startTime);

        const endTime = result.rows[0].ST_ENTIME;
        console.log(endTime)
        res.status(200).json({ expectedTime, startTime, endTime });
      }
  
    } catch (error) {
      console.error('Error executing Oracle query:', error);
      res.status(500).json({ error: 'Internal server error' });
  
    } finally {
      if (connection) {
        try {
          // Release the connection back to the pool
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
  
  app.get('/api/searchPatients', async (req, res) => {
    const searchTerm = req.query.searchTerm;
  
    let connection;
  
    try {
      // Get a connection from the OracleDB pool
      connection = await oracledb.getConnection();
  
      // Execute the query to search patients
      const result = await connection.execute(
        `SELECT CUST_ID, NAME_E AS PatientName, CIT_ID AS QID, MOBILE, INSURANCE, NATIONALITY, VIP, MARITAL_STATUS, SMOKER, BLOOD_TYPE, GENDER, DOB 
         FROM CUSTOMERS
         WHERE UPPER(NAME_E) LIKE UPPER(:searchTerm) OR UPPER(MOBILE) LIKE UPPER(:searchTerm)`,
        { searchTerm: `%${searchTerm}%` },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      // Transform the data to match frontend requirements
      const transformedData = result.rows.map(row => ({
        QID: row.QID,
        Mobile: row.MOBILE,
        FileNo: row.CUST_ID,
        PatientName: row.PatientName,
        Insurance: row.INSURANCE,
        Nationality: row.NATIONALITY,
        DOB: row.DOB,
        BloodType: row.BLOOD_TYPE,
        Gender: row.GENDER,
        VIP: row.VIP,
        MaritalStatus: row.MARITAL_STATUS,
        Smoker: row.SMOKER,
      }));
  
      // Send the transformed data as JSON response
      res.status(200).json(transformedData);
    } catch (error) {
      console.error('Error searching patients:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (connection) {
        try {
          // Release the connection back to the pool
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
  
  app.get('/api/searchPatientDetails', async (req, res) => {
    const { searchTerm } = req.query; // Make sure this matches the query parameter name used in the frontend

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection();

        const result = await connection.execute(
            `SELECT NAME_E, MOBILE FROM CUSTOMERS WHERE CUST_ID = :searchTerm`,
            { searchTerm }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Map the data to match frontend requirements
        const patientDetails = {
            NAME_E: result.rows[0][0], // NAME_E
            MOBILE: result.rows[0][1],  // MOBILE
            // Add other fields if needed
        };

        res.status(200).json(patientDetails);
    } catch (error) {
        console.error('Error searching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});
app.get('/api/fetchStartEndTimesForDoctors', async (req, res) => {
    let connection;
  
    try {
      // Get a connection from the pool
      connection = await oracledb.getConnection();
  
      // Query to fetch ST_STTIME and ST_ENTIME for all doctors where USRINFO_TYPE = 'd'
      const result = await connection.execute(
        `SELECT USRINFO_USERNAME, ST_STTIME, ST_ENTIME
         FROM USERS_INFORMATION
         WHERE TYPE = 'D'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      // Extract the list of doctors with their start and end times
      const doctorsTimes = result.rows.map(row => ({
        doctorName: row.USRINFO_USERNAME,
        startTime: row.ST_STTIME,
        endTime: row.ST_ENTIME
      }));
  
      res.status(200).json(doctorsTimes);
  
    } catch (error) {
      console.error('Error executing Oracle query:', error);
      res.status(500).json({ error: 'Internal server error' });
  
    } finally {
      if (connection) {
        try {
          // Release the connection back to the pool
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
 
  
  app.get('/api/app', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Query to get maximum CUST_ID
        const result = await connection.execute(
            `SELECT MAX(APPOINTMENT_NO) AS MAX_APP FROM CLNC_APPOINTMENT_MEVN`
        );

        console.log('Query result:', result); // Log the query result for debugging

        // Extract maximum CUST_ID from result
        const maxAPP = result.rows[0][0]; // Access the value in the first row and first column

        console.log('MAX_APP', maxAPP); // Log the extracted maximum CUST_ID

        res.status(200).json({ maxAPP });
    } catch (error) {
        console.error('Error fetching maximum CUST_ID:', error);
        res.status(500).json({ error: 'Error fetching maximum CUST_ID' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});




app.post('/api/saveEvent', async (req, res) => {
    // Destructure appointment details from request body
    const {
      APPOINTMENT_NO,
      LOCATION_NAME_E,
      CREATED_BY,
      
      NOTES,
      STATUS,
      TIME_FROM,
      TIME_TO,
      FILE_NO,
      PATIENT_FIRST_NAME,
      PHONE,
      SCHEDULE_DATE,
      DOCTOR_NAME, // Assuming DOCTOR_NAME is included in appointment details
    } = req.body;
  
    let connection;
    try {
      // Establish connection to Oracle Database
      connection = await oracledb.getConnection();
  
      // Insert into CLNC_APPOINTMENT_MEVN table
      const insertQuery = `
        INSERT INTO CLNC_APPOINTMENT_MEVN (
          APPOINTMENT_NO,
          LOCATION_NAME_E,
           CREATED_BY,
      
          NOTES,
          STATUS,
          TIME_FROM,
          TIME_TO,
          FILE_NO,
          PATIENT_FIRST_NAME,
          PHONE,
          SCHEDULE_DATE,
          DOCTOR_NAME
        ) VALUES (
          :APPOINTMENT_NO,
          :LOCATION_NAME_E,
          : CREATED_BY,
     
          :NOTES,
          :STATUS,
          :TIME_FROM,
          :TIME_TO,
          :FILE_NO,
          :PATIENT_FIRST_NAME,
          :PHONE,
         TO_DATE(:SCHEDULE_DATE,'MM/DD/YYYY'),
          :DOCTOR_NAME
        )
      `;
    console.log(insertQuery)
      // Bind parameters for the query
      const bindParams = {
        APPOINTMENT_NO,
        LOCATION_NAME_E,
        CREATED_BY,
       
        NOTES,
        STATUS,
        TIME_FROM,
        TIME_TO,
        FILE_NO,
        PATIENT_FIRST_NAME,
        PHONE,
        SCHEDULE_DATE,
        DOCTOR_NAME,
      };
  
      // Execute the insert query
      const result = await connection.execute(insertQuery, bindParams, { autoCommit: true });
      console.log('Appointment saved successfully:', result);
  
      // Send success response
      res.status(201).json({ message: 'Appointment saved successfully' });
    } catch (error) {
      console.error('Error saving appointment:', error);
      // Send error response
      res.status(500).json({ error: 'Failed to save appointment' });
    } finally {
      // Close OracleDB connection
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error closing OracleDB connection:', error);
        }
      }
    }
  });

  app.get('/api/getEvent/:APP', async (req, res) => {
    let connection;

    try {
        // Retrieve APPOINTMENT_NO from request parameters
        const { APP } = req.params;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to fetch appointment details
        const query = `
            SELECT APPOINTMENT_NO AS Id,
                   TIME_FROM AS StartTime,
                   TIME_TO AS EndTime,
                   DOCTOR_NAME AS DoctorName,
                   PATIENT_FIRST_NAME AS Subject
            FROM CLNC_APPOINTMENT_MEVN
            WHERE APPOINTMENT_NO = :APP
        `;

        // Bind parameter and execute the query
        const result = await connection.execute(query, [APP]);

        // Extract the first row (assuming APPOINTMENT_NO is unique)
        const appointmentData = result.rows;

        if (appointmentData.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Respond with formatted appointment data
        res.status(200).json(appointmentData[0]);
    } catch (error) {
        console.error('Error fetching appointment data:', error);
        res.status(500).json({ error: 'Error fetching appointment data' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

  
//apointment

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



