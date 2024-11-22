
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Console } = require('console');

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
function formatDateM (dateString) {
    if (!dateString) return ''; // Handle case where dateString is empty or undefined
  
    const dateObject = new Date(dateString);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = dateObject.getFullYear();
  
    return `${day}-${month}-${year}`;
  };
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
app.get('/api/lab', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT 
                i.DESC_E,
                i.DESC_A,
                i.REF_CODE,
                i.ITM_CODE,
                i.CAT_CODE
            FROM 
                ITEMS i
            WHERE 
                i.STATUS = 'A' 
                AND i.LAB_SERVICE = 'Y'`, // Add your lab service condition here
            [], // No bind variables needed
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Set output format to object
        );

        // Map results to include the required fields
        const items = result.rows.map(row => ({
            descriptionEnglish: row.DESC_E,
            descriptionArabic: row.DESC_A,
            referenceCode: row.REF_CODE,
            itemCode: row.ITM_CODE,
            categoryCode: row.CAT_CODE
        }));

        res.status(200).json(items); // Return the array of objects
    } catch (error) {
        console.error('Error fetching items:', error);
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

app.get('/api/medi', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `     SELECT DISTINCT
                d.ITM_CODE,
                d.DESC_E
                
            FROM DISTRIBUTIONS d
            JOIN ITEMS i ON d.ITM_CODE = i.ITM_CODE
           
            WHERE d.QTY != 0
              AND d.QTY_ON_HAND != 0
              AND i.STATUS = 'A'
              AND i.EFFECT_QTY = 'Y'`


        
             , // Ensure non-zero QTY and QTY_ON_HAND
            [], // No bind variables needed
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Set output format to object
        );

        // Map results to include both ITM_CODE and DESC_E
        const medicines = result.rows.map(row => ({
            itemCode: row.ITM_CODE,
            description: row.DESC_E
        }));

        res.status(200).json(medicines); // Return the array of objects
    } catch (error) {
        console.error('Error fetching medicines:', error);
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
app.get('/api/medip', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        
        const query = `
            SELECT DISTINCT
                d.ITM_CODE,
                d.DESC_E,
                d.QTY,
                d.PRICE,
                i.REF_CODE,
                i.CAT_CODE,
                c.DESC_E AS CAT_DESC
            FROM DISTRIBUTIONS d
            JOIN ITEMS i ON d.ITM_CODE = i.ITM_CODE
            JOIN CATEGORIES c ON i.CAT_CODE = c.CAT_CODE
            WHERE d.QTY != 0
              AND d.QTY_ON_HAND != 0
              AND i.STATUS = 'A'
              AND i.EFFECT_QTY = 'N'
        `;

        const result = await connection.execute(
            query,
            [], // No bind variables needed
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Set output format to object
        );

        // Map results to include the required fields
        const medicines = result.rows.map(row => ({
            itemCode: row.ITM_CODE,
            description: row.DESC_E,
            qty: row.QTY,
            price: row.PRICE,
            refCode: row.REF_CODE,
            catCode: row.CAT_CODE,
            catDesc: row.CAT_DESC // Category description
        }));

        res.status(200).json(medicines); // Return the array of objects
    } catch (error) {
        console.error('Error fetching medicines:', error);
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

// app.get('/api/medip', async (req, res) => {
//     let connection;
//     try {
//         connection = await oracledb.getConnection();
//         const result = await connection.execute(
//             `SELECT DISTINCT ITM_CODE, DESC_E, QTY, PRICE
//              FROM DISTRIBUTIONS
//              WHERE QTY != 0 AND QTY_ON_HAND != 0`, // Ensure non-zero QTY and QTY_ON_HAND
//             [], // No bind variables needed
//             { outFormat: oracledb.OUT_FORMAT_OBJECT } // Set output format to object
//         );

//         // Map results to include both ITM_CODE and DESC_E
//         const medicines = result.rows.map(row => ({
//             itemCode: row.ITM_CODE,
//             description: row.DESC_E,
//             qty:row.QTY,
//             pr:row.PRICE
//         }));

//         res.status(200).json(medicines); // Return the array of objects
//     } catch (error) {
//         console.error('Error fetching medicines:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

app.get('/api/icd10-codes', async (req, res) => {
    let connection;

    try {
        // Obtain a connection to Oracle Database
        connection = await oracledb.getConnection();

        // SQL query to fetch distinct ICD10_CODE_DESCRIPTOR and ICD10_CODE
        const query = `
            SELECT DISTINCT ICD10_CODE_DESCRIPTOR, ICD10_CODE 
            FROM CLNC_ICD10
        `;

        const result = await connection.execute(query);

        // Send the result as a JSON response
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching ICD10 codes:', error);
        res.status(500).json({ message: 'Error fetching ICD10 codes' });
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


app.get('/api/diseases', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT DISEASES_NAME
         FROM CLNC_COMMON_DISEASES`,
        [], // No bind variables needed
        { outFormat: oracledb.OUT_FORMAT_OBJECT } // Correctly set here
      );
      const diseases = result.rows.map(row => row.DISEASES_NAME);
      res.status(200).json(diseases);
    } catch (error) {
      console.error('Error fetching diseases:', error);
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
app.get('/api/labreport', async (req, res) => {
    let connection;

    try {
        // Retrieve com_no, id, and visitId from query parameters
        const { com_no, id, visitId } = req.query;
        console.log('COM_NO received in lab report:', com_no, 'ID:', id, 'Visit ID:', visitId);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch company details from the COMPANIES table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :com_no
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [com_no]);
        console.log('companyResult:', companyResult);

        // Extract company data
        const companyData = companyResult.rows[0];
        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the company details response
        const companyDetails = {
            Name1E: companyData[20],
            Name1A: companyData[21],
            Name2E: companyData[22],
            Name2A: companyData[23],
            Name3E: companyData[24],
            Name3A: companyData[25],
            Name4E: companyData[26],
            Name4A: companyData[27],
            Name5E: companyData[28],
            Name5A: companyData[29],
            // Add more fields as needed
        };

        // Query to fetch details from the CLNC_LAB_DETAILS table based on id and visitId
        const clnclabQuery = `
            SELECT CL.LAB_NO, CL.TEST_ID, CL.ITM_CODE, CL.RESULT, CL.TEST_NAME, CL.REF_RANGE, CL.TEST_HEADER, CL.CREATED_DAT, CL.USRINFO_USERNAME, 
                   I.DESC_E
            FROM CLNC_LAB_DETAILS CL
            JOIN ITEMS I ON CL.ITM_CODE = I.ITM_CODE
            WHERE CL.PAT_ID = :id AND CL.VISIT_ID = :visitId
        `;
        console.log('clnclabQuery:', clnclabQuery);

        // Execute the query to fetch CLNCLAB details with ITEM description
        const clnclabResult = await connection.execute(clnclabQuery, [id, visitId]);
        console.log('clnclabResult:', clnclabResult);

        // Extract CLNCLAB data
        const clnclabData = clnclabResult.rows;
        if (clnclabData.length === 0) {
            return res.status(404).json({ error: 'No CLNCLAB details found for the given ID and Visit ID' });
        }

        // Query to fetch details from the CUSTOMERS table based on ID
        const customerQuery = `
            SELECT CUST_ID, NAME_E, CIT_ID, DOB, ADDRESS, MOBILE, NATIONALITY, GENDER, INSURANCE
            FROM CUSTOMERS
            WHERE CUST_ID = :id
        `;
        console.log('customerQuery:', customerQuery);

        // Execute the query to fetch CUSTOMER details
        const customerResult = await connection.execute(customerQuery, [id]);
        console.log('customerResult:', customerResult);

        // Extract CUSTOMER data
        const customerData = customerResult.rows[0];
        if (!customerData) {
            return res.status(404).json({ error: 'Customer details not found for the given ID' });
        }

        // Send combined response
        res.status(200).json({
            companyDetails,
            clnclabData: clnclabData.map(row => ({
                LAB_NO: row[0],
                TEST_ID: row[1],
                ITM_CODE: row[2],
                RESULT: row[3],
                TEST_NAME: row[4],
                REF_RANGE: row[5],
                TEST_HEADER: row[6],
                CREATED_DAT: row[7],
                USRINFO_USERNAME: row[8],
                DESC_E: row[9],  // The description from ITEMS
            })),
            customerData,
        });
    } catch (error) {
        console.error('Error fetching lab report data:', error);
        res.status(500).json({ error: 'Error fetching lab report data' });
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


app.get('/api/dentalreport', async (req, res) => {
    let connection;

    try {
        // Retrieve com_no from query parameters
        const { com_no } = req.query;
        console.log('COM_NO:', com_no);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch company details from the COMPANIES table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :com_no
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [com_no]);
        console.log('companyResult:', companyResult);

        // Extract company data
        const companyData = companyResult.rows[0];
        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the company details response
        const companyDetails = {
            Name1E: companyData[20],  // Adjust indices based on your database schema
            Name1A: companyData[21],
            Name2E: companyData[22],
            Name2A: companyData[23],
            Name3E: companyData[24],
            Name3A: companyData[25],
            Name4E: companyData[26],
            Name4A: companyData[27],
            Name5E: companyData[28],
            Name5A: companyData[29],
            // Add more fields as needed
        };

      
        res.status(200).json({
            companyDetails
            
        });
    } catch (error) {
        console.error('Error fetching lab report data:', error);
        res.status(500).json({ error: 'Error fetching lab report data' });
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
app.get('/api/presreport', async (req, res) => {
    let connection;

    try {
        // Retrieve com_no from query parameters
        const { com_no } = req.query;
        console.log('COM_NO:', com_no);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch company details from the COMPANIES table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :com_no
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [com_no]);
        console.log('companyResult:', companyResult);

        // Extract company data
        const companyData = companyResult.rows[0];
        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the company details response
        const companyDetails = {
            Name1E: companyData[20],  // Adjust indices based on your database schema
            Name1A: companyData[21],
            Name2E: companyData[22],
            Name2A: companyData[23],
            Name3E: companyData[24],
            Name3A: companyData[25],
            Name4E: companyData[26],
            Name4A: companyData[27],
            Name5E: companyData[28],
            Name5A: companyData[29],
            // Add more fields as needed
        };

      
        res.status(200).json({
            companyDetails
            
        });
    } catch (error) {
        console.error('Error fetching lab report data:', error);
        res.status(500).json({ error: 'Error fetching lab report data' });
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
app.get('/api/proreport', async (req, res) => {
    let connection;

    try {
        // Retrieve com_no from query parameters
        const { com_no } = req.query;
        console.log('COM_NO:', com_no);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch company details from the COMPANIES table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :com_no
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [com_no]);
        console.log('companyResult:', companyResult);

        // Extract company data
        const companyData = companyResult.rows[0];
        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the company details response
        const companyDetails = {
            Name1E: companyData[20],  // Adjust indices based on your database schema
            Name1A: companyData[21],
            Name2E: companyData[22],
            Name2A: companyData[23],
            Name3E: companyData[24],
            Name3A: companyData[25],
            Name4E: companyData[26],
            Name4A: companyData[27],
            Name5E: companyData[28],
            Name5A: companyData[29],
            // Add more fields as needed
        };

      
        res.status(200).json({
            companyDetails
            
        });
    } catch (error) {
        console.error('Error fetching lab report data:', error);
        res.status(500).json({ error: 'Error fetching lab report data' });
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
           WHERE TYPE = 'D'
             AND ACTIVE = 'Y'`,
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
             AND TYPE = 'D'
             AND ACTIVE = 'Y'`,
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
    const { searchTerm } = req.query; // Ensure this matches the query parameter name used in the frontend

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection();

        // Adjust the SQL query to select the FILE_NO field as well
        const result = await connection.execute(
            `SELECT CUST_ID, NAME_E, MOBILE, CIT_ID
             FROM CUSTOMERS
             WHERE UPPER(CUST_ID) = UPPER(:searchTerm)
                `,
            { searchTerm }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Map the data to match frontend requirements
        const patientDetails = {
            FILE_NO: result.rows[0][0], // FILE_NO
            NAME_E: result.rows[0][1],  // NAME_E
            MOBILE: result.rows[0][2], 
            CIT_ID: result.rows[0][3] // MOBILE
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
app.get('/api/searchPatientDetailsN', async (req, res) => {
    const { searchTerm } = req.query; // Ensure this matches the query parameter name used in the frontend

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection();

        // Adjust the SQL query to select the FILE_NO field as well
        const result = await connection.execute(
            `SELECT CUST_ID, NAME_E, MOBILE, CIT_ID
             FROM CUSTOMERS
             WHERE UPPER(NAME_E) = UPPER(:searchTerm)
                `,
            { searchTerm }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Map the data to match frontend requirements
        const patientDetails = {
            FILE_NO: result.rows[0][0], // FILE_NO
            NAME_E: result.rows[0][1],  // NAME_E
            MOBILE: result.rows[0][2], 
            CIT_ID: result.rows[0][3] // MOBILE
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
app.get('/api/searchPatientDetailsP', async (req, res) => {
    const { searchTerm } = req.query; // Ensure this matches the query parameter name used in the frontend

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection();

        // Adjust the SQL query to select the FILE_NO field as well
        const result = await connection.execute(
            `SELECT CUST_ID, NAME_E, MOBILE, CIT_ID
             FROM CUSTOMERS
             WHERE MOBILE = :searchTerm
                `,
            { searchTerm }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Map the data to match frontend requirements
        const patientDetails = {
            FILE_NO: result.rows[0][0], // FILE_NO
            NAME_E: result.rows[0][1],  // NAME_E
            MOBILE: result.rows[0][2], 
            CIT_ID: result.rows[0][3] // MOBILE
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
app.get('/api/searchPatientDetailsi', async (req, res) => {
    const { searchTerm } = req.query; // Ensure this matches the query parameter name used in the frontend

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection();

        // Adjust the SQL query to select the FILE_NO field as well
        const result = await connection.execute(
            `SELECT CUST_ID, NAME_E, MOBILE, CIT_ID
             FROM CUSTOMERS
            WHERE UPPER(CIT_ID) = UPPER(:searchTerm)
                `,
            { searchTerm }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Map the data to match frontend requirements
        const patientDetails = {
            FILE_NO: result.rows[0][0], // FILE_NO
            NAME_E: result.rows[0][1],  // NAME_E
            MOBILE: result.rows[0][2], 
            CIT_ID: result.rows[0][3] // MOBILE
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
  console.log(SCHEDULE_DATE)
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
        
          :SCHEDULE_DATE,
          :DOCTOR_NAME
        )
      `;
      //   when thetype is not date just need to send the desired formatfrom frontedn for SCHEDULE_DATE
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
  app.get('/api/getEventEdit/:eventId', async (req, res) => {
    let connection;

    try {
        const eventId = req.params.eventId;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to fetch appointment details
        const query = `
            SELECT 
                   FILE_NO AS FileNo,
                   PATIENT_FIRST_NAME AS PatientFirstName,
                   PHONE AS Phone,
                   NOTES AS Notes,
                   SCHEDULE_DATE AS ScheduleDate,
                   TIME_FROM AS StartTime,
                   TIME_TO AS EndTime,
                   DOCTOR_NAME AS DoctorName,
                   STATUS AS Status,

                   CREATED_BY AS CREATED_BY,
                   CREATED_DATE AS CREATION_DATE

            FROM CLNC_APPOINTMENT_MEVN
            WHERE APPOINTMENT_NO = :eventId
        `;

        // Bind parameter and execute the query
        const result = await connection.execute(query, [eventId]);

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
app.post('/api/updateEvent', async (req, res) => {
    let connection;

    try {
        const {
            VISIT_ID,
            PAT_ID,
            VISIT_DATE,
            COM_NO,
            CREATED_BY,
            UPDATED_BY,
            CREATIOIN_DATE,
            STATUS,
            QUEUE_NUMBER,
            VISIT_HOUR,
            VISIT_MINUTES,
            EXPECTED_TIME,
            DOCTOR_ID,
            CANCELED,
            Aid,
            S,
            E
        } = req.body;

        console.log('Aid:', Aid);
        console.log('sssssssssssssssssssssssssssssssssssssssssssssss',VISIT_DATE)

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        if (isNaN(VISIT_HOUR) || isNaN(VISIT_MINUTES) || isNaN(EXPECTED_TIME)) {
            throw new Error('Numeric fields must be valid numbers');
        }

        // Insert into CLNC_PATIENT_VISITS only if STATUS is 'R'
        if (STATUS === 'R') {
            console.log('EXECUTED R');
            const insertQuery = `
                INSERT INTO CLNC_PATIENT_VISITS (
                    VISIT_ID,
                    PAT_ID,
                    VISIT_DATE,
                    COM_NO,
                    CREATED_BY,
                    UPDATED_BY,
                    CREATIOIN_DATE,
                    STATUS,
                    QUEUE_NUMBER,
                    VISIT_HOUR,
                    VISIT_MINUTES,
                    EXPECTED_TIME,
                    DOCTOR_ID,
                    CANCELED
                ) VALUES (
                    :VISIT_ID,
                    :PAT_ID,
                    TO_DATE(:VISIT_DATE, 'MM/DD/YYYY'),
                    :COM_NO,
                    :CREATED_BY,
                    :UPDATED_BY,
                    TO_DATE(:CREATIOIN_DATE, 'MM/DD/YYYY'),
                    :STATUS,
                    :QUEUE_NUMBER,
                    :VISIT_HOUR,
                    :VISIT_MINUTES,
                    :EXPECTED_TIME,
                    :DOCTOR_ID,
                    :CANCELED
                )`;

            // Bind parameters and execute the insert query
            await connection.execute(insertQuery, {
                VISIT_ID,
                PAT_ID,
                VISIT_DATE,
                COM_NO,
                CREATED_BY,
                UPDATED_BY,
                CREATIOIN_DATE,
                STATUS,
                QUEUE_NUMBER,
                VISIT_HOUR,
                VISIT_MINUTES,
                EXPECTED_TIME,
                DOCTOR_ID,
                CANCELED
            });
        }
        const formatDateStringZ = (dateString) => {
            if (!dateString) return ''; // Handle empty or undefined cases
        
            const parts = dateString.split('/');
            if (parts.length !== 3) return ''; // Handle invalid format
        
            const [month, day, year] = parts; // Change the order to match MM/DD/YYYY
            return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`; // Convert to DD-MM-YYYY
        };
        console.log(VISIT_DATE,'fffhjwqkejhlieuwyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
        const formattedVisitDateZ = formatDateStringZ(VISIT_DATE);
        // Construct query to update CLNC_APPOINTMENT_MEVN
        const updateQuery = `
            UPDATE CLNC_APPOINTMENT_MEVN
            SET STATUS = :STATUS,
                TIME_FROM = :S,
                TIME_TO = :E,
                SCHEDULE_DATE = :VISIT_DATE,
                DOCTOR_NAME = :DOCTOR_ID
            WHERE  APPOINTMENT_NO = :Aid`;

        // Calculate TIME_FROM and TIME_TO as strings
        const timeFrom = `${String(VISIT_HOUR).padStart(2, '0')}:${String(VISIT_MINUTES).padStart(2, '0')}`;
        const timeTo = `${String((VISIT_HOUR + 1) % 24).padStart(2, '0')}:${String(VISIT_MINUTES).padStart(2, '0')}`;

        // Bind parameters and execute the update query
        await connection.execute(updateQuery, {
            STATUS,
           
            
            Aid,
            S,
            E,
            VISIT_DATE: formattedVisitDateZ,
            DOCTOR_ID
        });

        // Commit the transaction
        await connection.commit();

        // Respond with success message
        res.status(200).json({ message: 'Visit details added and status updated successfully' });

    } catch (error) {
        console.error('Error adding visit details and updating status:', error);
        res.status(500).json({ error: 'Error adding visit details and updating status' });
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



// app.post('/api/updateEvent', async (req, res) => {
//     let connection;

//     try {
//         const {
//             VISIT_ID,
//             PAT_ID,
//             VISIT_DATE,
//             COM_NO,
//             CREATED_BY,
//             UPDATED_BY,
//             CREATIOIN_DATE, // Assuming this is coming from the client
//             STATUS,
//             QUEUE_NUMBER,
//             VISIT_HOUR,
//             VISIT_MINUTES,
//             EXPECTED_TIME,
//             DOCTOR_ID,
//             CANCELED,
//             Aid,
//         } = req.body;

//         console.log('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'
//             ,Aid);

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         if (isNaN(VISIT_HOUR) || isNaN(VISIT_MINUTES) || isNaN(EXPECTED_TIME)) {
//             throw new Error('Numeric fields must be valid numbers');
//         }

//         // Construct query to insert into CLNC_PATIENT_VISITS
//         if (STATUS === 'R') {
//             console.log('EXECUTED R')
//             const insertQuery = `
//                 INSERT INTO CLNC_PATIENT_VISITS (
//                     VISIT_ID,
//                     PAT_ID,
//                     VISIT_DATE,
//                     COM_NO,
//                     CREATED_BY,
//                     UPDATED_BY,
//                     CREATIOIN_DATE,
//                     STATUS,
//                     QUEUE_NUMBER,
//                     VISIT_HOUR,
//                     VISIT_MINUTES,
//                     EXPECTED_TIME,
//                     DOCTOR_ID,
//                     CANCELED
//                 ) VALUES (
//                     :VISIT_ID,
//                     :PAT_ID,
//                     TO_DATE(:VISIT_DATE, 'MM/DD/YYYY'),
//                     :COM_NO,
//                     :CREATED_BY,
//                     :UPDATED_BY,
//                     TO_DATE(:CREATIOIN_DATE, 'MM/DD/YYYY'),
//                     :STATUS,
//                     :QUEUE_NUMBER,
//                     :VISIT_HOUR,
//                     :VISIT_MINUTES,
//                     :EXPECTED_TIME,
//                     :DOCTOR_ID,
//                     :CANCELED
//                 )`;
        
//             // Bind parameters and execute the insert query
//             await connection.execute(insertQuery, {
//                 VISIT_ID,
//                 PAT_ID,
//                 VISIT_DATE,
//                 COM_NO,
//                 CREATED_BY,
//                 UPDATED_BY,
//                 CREATIOIN_DATE,
//                 STATUS,
//                 QUEUE_NUMBER,
//                 VISIT_HOUR,
//                 VISIT_MINUTES,
//                 EXPECTED_TIME,
//                 DOCTOR_ID,
//                 CANCELED
//             });
//         }
        
//         // Construct query to update CLNC_APPOINTMENT_MEVN
//         const updateQuery = `
//             UPDATE CLNC_APPOINTMENT_MEVN
//             SET STATUS = :STATUS
//             WHERE FILE_NO = :PAT_ID 
//             AND APPOINTMENT_NO = :Aid`;

//         // Bind parameters and execute the update query
//         await connection.execute(updateQuery, {
//             STATUS,
//             PAT_ID,
//             Aid
//         });

//         // Commit the transaction
//         await connection.commit();

//         // Respond with success message
//         res.status(200).json({ message: 'Visit details added and status updated successfully' });
        
//     } catch (error) {
//         console.error('Error adding visit details and updating status:', error);
//         res.status(500).json({ error: 'Error adding visit details and updating status' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });


  

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
                   PATIENT_FIRST_NAME AS Subject,
                  SCHEDULE_DATE AS dateford

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

app.get('/api/visitId', async (req, res) => {
    let connection;
  
    try {
      connection = await oracledb.getConnection();
  
      // Query to get maximum VISIT_ID
      const result = await connection.execute(
        `SELECT MAX(VISIT_ID) AS MAX_VISIT_ID FROM CLNC_PATIENT_VISITS`
      );
  
      // Extract maximum VISIT_ID from result
      const maxVisitId = result.rows[0][0]; // Access the value in the first row and column
  
      res.status(200).send( maxVisitId.toString() );
    } catch (error) {
      console.error('Error fetching maximum VISIT_ID:', error);
      res.status(500).json({ error: 'Error fetching maximum VISIT_ID' });
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

  app.get('/api/EventAppointments', async (req, res) => {
    let connection;
  
    try {
      const { visitFromDate } = req.query;
  
      // Validate query parameters
      if (!visitFromDate) {
        return res.status(400).json({ error: 'visitFromDate is required' });
      }
  
      // Establish connection to Oracle Database
      connection = await oracledb.getConnection();
  
      // Construct query to fetch appointments
      const query = `
        SELECT * 
        FROM CLNC_APPOINTMENT_MEVN
        WHERE SCHEDULE_DATE = :visitFromDate
      `;
  
      // Execute the query
      const result = await connection.execute(query, { visitFromDate });
  
      // Check if there are any results
      if (result.rows.length === 0) {
        return res.json([]);
      }
  
      // Map result rows to custom format
      const mappedResults = result.rows.map(row => ({
        Id: row[0],                // Index 0 for Id
        Subject: row[3],           // Index 3 for Subject
        StartTime: row[8],         // Index 8 for StartTime
        EndTime: row[9],           // Index 9 for EndTime
        DoctorName: row[10] ,
          SDate:row[7],
            STATUSC:row[11]   // Index 10 for DoctorName
      }));
  
      // Send the results back to the client
      res.json(mappedResults);
    } catch (error) {
      console.error('Error fetching event appointments:', error);
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
  
  
  app.get('/api/filterAppointments', async (req, res) => {
    let connection;

    try {
        const { doctor, visitFromDate, visitToDate } = req.query;

        // Validate query parameters
        if (!visitFromDate || !visitToDate) {
            return res.status(400).json({ error: 'Missing required date parameters' });
        }

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to filter appointments
        let query = `
        SELECT STATUS, QUEUE_NUMBER, VISIT_DATE, VISIT_HOUR, VISIT_MINUTES, EXPECTED_TIME, DOCTOR_ID, CANCELED, PAT_ID, VISIT_ID
        FROM CLNC_PATIENT_VISITS
        WHERE VISIT_DATE BETWEEN TO_DATE(:visitFromDate, 'MM/DD/YYYY') AND TO_DATE(:visitToDate, 'MM/DD/YYYY')
         AND STATUS != 'D'
    `;

        let queryParams = {
            visitFromDate,
            visitToDate
        };

        if (doctor) {
            query += ' AND DOCTOR_ID = :doctor';
            queryParams.doctor = doctor;
        }

        // Execute the query
        const result = await connection.execute(query, queryParams);

        // If no appointments are found, return an empty array
        if (result.rows.length === 0) {
            return res.json([]);
        }

        // Extract PAT_IDs from the result
        const patIds = result.rows.map(row => row[8]); // Assuming PAT_ID is at index 8

        // Construct the dynamic SQL query for customer IDs
        const placeholders = patIds.map((_, index) => `:patId${index}`).join(', ');
        const customerQuery = `
             SELECT CUST_ID 
            FROM CUSTOMERS
            WHERE CUST_ID IN (${placeholders})
        `;

        // Bind parameters
        const customerBindParams = patIds.reduce((params, patId, index) => {
            params[`patId${index}`] = patId;
            return params;
        }, {});

        // Execute the customer query
        const customerResult = await connection.execute(customerQuery, customerBindParams);

        // Create a map for fast lookups
        const customerIds = new Map(customerResult.rows.map(row => [row[0], row[0]])); // Assuming PAT_ID is at index 0 and CUST_ID is at index 1

        // Extract PAT_IDs from the result for patient names query
        const patientPlaceholders = patIds.map((_, index) => `:patIdName${index}`).join(', ');
        const patientQuery = `
            SELECT FILE_NO, PATIENT_FIRST_NAME
            FROM CLNC_APPOINTMENT_MEVN
            WHERE FILE_NO IN (${patientPlaceholders})
        `;

        // Bind parameters for patient names
        const patientBindParams = patIds.reduce((params, patId, index) => {
            params[`patIdName${index}`] = patId;
            return params;
        }, {});

        // Execute the patient query
        const patientResult = await connection.execute(patientQuery, patientBindParams);

        // Create a map for fast lookups
        const patientNames = new Map(patientResult.rows.map(row => [row[0], row[1]])); // Assuming FILE_NO is at index 0 and PATIENT_FIRST_NAME is at index 1

        // Combine appointment data with patient names and customer IDs
        const appointmentsWithDetails = result.rows.map(row => ({
            STATUS: row[0],
            QUEUE_NUMBER: row[1],
            VISIT_DATE: row[2],
            VISIT_HOUR: row[3],
            VISIT_MINUTES: row[4],
            EXPECTED_TIME: row[5],
            DOCTOR_ID: row[6],
            CANCELED: row[7],
            PAT_ID: row[8],
            VISIT_ID: row[9],
            CUST_ID: customerIds.get(row[8]) || 'Unknown', // Add CUST_ID from CUSTOMERS table
            PATIENT_FIRST_NAME: patientNames.get(row[8]) || 'Unknown' // Add patient names
        }));

        // Send the results back to the client
        res.json(appointmentsWithDetails);
    } catch (error) {
        console.error('Error fetching filtered appointments:', error);
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

//   app.get('/api/filterAppointments', async (req, res) => {
//     let connection;

//     try {
//         const { doctor, visitFromDate, visitToDate } = req.query;

//         // Validate query parameters
//         if (!visitFromDate || !visitToDate) {
//             return res.status(400).json({ error: 'Missing required date parameters' });
//         }

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Construct query to filter appointments
//         let query = `
//         SELECT STATUS, QUEUE_NUMBER, VISIT_DATE, VISIT_HOUR, VISIT_MINUTES, EXPECTED_TIME, DOCTOR_ID, CANCELED, PAT_ID, VISIT_ID
//         FROM CLNC_PATIENT_VISITS
//         WHERE VISIT_DATE BETWEEN TO_DATE(:visitFromDate, 'MM/DD/YYYY') AND TO_DATE(:visitToDate, 'MM/DD/YYYY')
//         AND PAT_ID IN (
//             SELECT PAT_ID
//             FROM CLNC_PATIENT_VISITS
//             WHERE VISIT_DATE BETWEEN TO_DATE(:visitFromDate, 'MM/DD/YYYY') AND TO_DATE(:visitToDate, 'MM/DD/YYYY')
//             GROUP BY PAT_ID
//         )
//     `;


//         let queryParams = {
//             visitFromDate,
//             visitToDate
//         };

//         if (doctor) {
//             query += ' AND DOCTOR_ID = :doctor';
//             queryParams.doctor = doctor;
//         }

//         // Execute the query
//         const result = await connection.execute(query, queryParams);

//         // If no appointments are found, return an empty array
//         if (result.rows.length === 0) {
//             return res.json([]);
//         }

//         // Extract PAT_IDs from the result
//         const patIds = result.rows.map(row => row[8]); // Assuming PAT_ID is at index 8

//         if (patIds.length === 0) {
//             return res.json(result.rows.map(row => ({
//                 STATUS: row[0],
//                 QUEUE_NUMBER: row[1],
//                 VISIT_DATE: row[2],
//                 VISIT_HOUR: row[3],
//                 VISIT_MINUTES: row[4],
//                 EXPECTED_TIME: row[5],
//                 DOCTOR_ID: row[6],
//                 CANCELED: row[7],
//                 PAT_ID: row[8],
//                 VISIT_ID: row[9],
//                 PATIENT_FIRST_NAME: 'Unknown'
//             })));
//         }

//         // Construct the dynamic SQL query for patient names
//         const placeholders = patIds.map((_, index) => `:patId${index}`).join(', ');
//         const patientQuery = `
//             SELECT FILE_NO, PATIENT_FIRST_NAME
//             FROM CLNC_APPOINTMENT_MEVN
//             WHERE FILE_NO IN (${placeholders})
//         `;
        

//         // Bind parameters
//         const patientBindParams = patIds.reduce((params, patId, index) => {
//             params[`patId${index}`] = patId;
//             return params;
//         }, {});

//         // Execute the patient query
//         const patientResult = await connection.execute(patientQuery, patientBindParams);

//         // Create a map for fast lookups
//         const patientNames = new Map(patientResult.rows.map(row => [row[0], row[1]])); // Assuming FILE_NO is at index 0 and PATIENT_FIRST_NAME is at index 1

//         // Combine appointment data with patient names
//         const appointmentsWithNames = result.rows.map(row => ({
//             STATUS: row[0],
//             QUEUE_NUMBER: row[1],
//             VISIT_DATE: row[2],
//             VISIT_HOUR: row[3],
//             VISIT_MINUTES: row[4],
//             EXPECTED_TIME: row[5],
//             DOCTOR_ID: row[6],
//             CANCELED: row[7],
//             PAT_ID: row[8],
//             VISIT_ID: row[9],
//             PATIENT_FIRST_NAME: patientNames.get(row[8]) || 'Unknown'
//         }));

//         // Send the results back to the client
//         res.json(appointmentsWithNames);
//     } catch (error) {
//         console.error('Error fetching filtered appointments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

//   app.get('/api/filterAppointments', async (req, res) => {
//     let connection;

//     try {
//         const { doctor, visitFromDate, visitToDate } = req.query;

//         // Validate query parameters
//         if (!doctor || !visitFromDate || !visitToDate) {
//             return res.status(400).json({ error: 'Missing required query parameters' });
//         }

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Construct query to filter appointments
//         const query = `
//             SELECT STATUS,QUEUE_NUMBER,VISIT_DATE,VISIT_HOUR,VISIT_MINUTES,EXPECTED_TIME,DOCTOR_ID,CANCELED,PAT_ID 
//             FROM CLNC_PATIENT_VISITS
//             WHERE DOCTOR_ID = :doctor
//             AND VISIT_DATE BETWEEN TO_DATE(:visitFromDate, 'MM-DD-YYYY') AND TO_DATE(:visitToDate, 'MM-DD-YYYY')
//         `;

//         // Execute the query
//         const result = await connection.execute(query, {
//             doctor,
//             visitFromDate,
//             visitToDate
//         });

//         // If no appointments are found, return an empty array
//         if (result.rows.length === 0) {
//             return res.json([]);
//         }

//         // Extract PAT_IDs from the result
//         const patIds = result.rows.map(row => row[8]); // Assuming PAT_ID is at index 8

//         if (patIds.length === 0) {
//             return res.json(result.rows.map(row => ({
//                 STATUS: row[0],
//                 QUEUE_NUMBER: row[1],
//                 VISIT_DATE: row[2],
//                 VISIT_HOUR: row[3],
//                 VISIT_MINUTES: row[4],
//                 EXPECTED_TIME: row[5],
//                 DOCTOR_ID: row[6],
//                 CANCELED: row[7],
//                 PAT_ID: row[8],
//                 PATIENT_FIRST_NAME: 'Unknown'
//             })));
//         }

//         // Construct the dynamic SQL query for patient names
//         const placeholders = patIds.map((_, index) => `:patId${index}`).join(', ');
//         const patientQuery = `
//             SELECT FILE_NO, PATIENT_FIRST_NAME
//             FROM CLNC_APPOINTMENT_MEVN
//             WHERE FILE_NO IN (${placeholders})
//         `;

//         // Bind parameters
//         const patientBindParams = patIds.reduce((params, patId, index) => {
//             params[`patId${index}`] = patId;
//             return params;
//         }, {});

//         // Execute the patient query
//         const patientResult = await connection.execute(patientQuery, patientBindParams);

//         // Create a map for fast lookups
//         const patientNames = new Map(patientResult.rows.map(row => [row[0], row[1]])); // Assuming FILE_NO is at index 0 and PATIENT_FIRST_NAME is at index 1

//         // Combine appointment data with patient names
//         const appointmentsWithNames = result.rows.map(row => ({
//             STATUS: row[0],
//             QUEUE_NUMBER: row[1],
//             VISIT_DATE: row[2],
//             VISIT_HOUR: row[3],
//             VISIT_MINUTES: row[4],
//             EXPECTED_TIME: row[5],
//             DOCTOR_ID: row[6],
//             CANCELED: row[7],
//             PAT_ID: row[8],
//             PATIENT_FIRST_NAME: patientNames.get(row[8]) || 'Unknown'
//         }));

//         // Send the results back to the client
//         res.json(appointmentsWithNames);
//     } catch (error) {
//         console.error('Error fetching filtered appointments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.post('/api/updateAppointment', async (req, res) => {
    let connection;
  
    try {
      const { PAT_ID, VISIT_ID, CANCELED } = req.body;
  
      // Validate request body
      if (!PAT_ID || !VISIT_ID || typeof CANCELED === 'undefined') {
        return res.status(400).json({ error: 'PAT_ID, VISIT_ID, and CANCELED status are required' });
      }
  
      // Establish connection to Oracle Database
      connection = await oracledb.getConnection();
  
      // Construct query to update the appointment
      const query = `
        UPDATE CLNC_PATIENT_VISITS
        SET CANCELED = :canceled
        WHERE PAT_ID = :patId AND VISIT_ID = :visitId
      `;
  
      // Execute the query
      const result = await connection.execute(query, {
        canceled: CANCELED,
        patId: PAT_ID,
        visitId: VISIT_ID
      });
  
      // Commit the transaction
      await connection.commit();
  
      // Check if any rows were affected
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (connection) {
        try {
          // Close the database connection
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
  

  
//   app.get('/api/filterAppointments', async (req, res) => {
//     let connection;

//     try {
//         const { doctor, visitFromDate, visitToDate } = req.query;

//         // Validate query parameters
//         if (!doctor || !visitFromDate || !visitToDate) {
//             return res.status(400).json({ error: 'Missing required query parameters' });
//         }

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Construct query to filter appointments
//         const query = `
//             SELECT STATUS,QUEUE_NUMBER,VISIT_DATE,VISIT_HOUR,VISIT_MINUTES,EXPECTED_TIME,DOCTOR_ID,CANCELED,PAT_ID FROM CLNC_PATIENT_VISITS
//             WHERE DOCTOR_ID = :doctor
//             AND VISIT_DATE BETWEEN TO_DATE(:visitFromDate, 'MM-DD-YYYY') AND TO_DATE(:visitToDate, 'MM-DD-YYYY')
//         `;

//         // Execute the query
//         const result = await connection.execute(query, {
//             doctor,
//             visitFromDate,
//             visitToDate
//         });

//         // Send the results back to the client
//         res.json(result.rows);
//     } catch (error) {
//         console.error('Error fetching filtered appointments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

app.delete('/api/deleteEvent/:eventId', async (req, res) => {
    let connection;

    try {
        const eventId = req.params.eventId;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Step 1: Fetch FILE_NO using APPOINTMENT_NO
        const fetchFileNoQuery = `
            SELECT FILE_NO
            FROM CLNC_APPOINTMENT_MEVN
            WHERE APPOINTMENT_NO = :eventId
        `;
        const result = await connection.execute(fetchFileNoQuery, [eventId]);

        // Check if appointment was found
        if (result.rows.length === 0) {
            await connection.execute('ROLLBACK');
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const fileNo = result.rows[0][0];

        // Step 2: Delete from CLNC_PATIENT_VISITS table using FILE_NO
        const deletePatientVisitsQuery = `
            DELETE FROM CLNC_PATIENT_VISITS
            WHERE PAT_ID = :fileNo
        `;
        await connection.execute(deletePatientVisitsQuery, [fileNo]);

        // Step 3: Delete the appointment record
        const deleteAppointmentQuery = `
            DELETE FROM CLNC_APPOINTMENT_MEVN
            WHERE APPOINTMENT_NO = :eventId
        `;
        await connection.execute(deleteAppointmentQuery, [eventId]);

        // Commit the transaction
        await connection.execute('COMMIT');

        // Respond with success message
        res.status(200).json({ message: 'Appointment and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment data:', error);
        // Rollback the transaction in case of an error
        if (connection) {
            try {
                await connection.execute('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        res.status(500).json({ error: 'Error deleting appointment data' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing Oracle DB connection:', closeError);
            }
        }
    }
});

app.get('/api/getMaxQueueNumber', async (req, res) => {
    let connection;

    try {
        const { VISIT_DATE, DOCTOR_ID } = req.query;

        // Validate required query parameters
        if (!VISIT_DATE || !DOCTOR_ID) {
            return res.status(400).json({ error: 'Missing required query parameters: VISIT_DATE or DOCTOR_ID' });
        }

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum queue number for the given visit date and doctor ID
        const query = `
            SELECT MAX(QUEUE_NUMBER) AS MAX_QUEUE_NUMBER
            FROM CLNC_PATIENT_VISITS
            WHERE VISIT_DATE = TO_DATE(:VISIT_DATE, 'MM/DD/YYYY')
            AND DOCTOR_ID = :DOCTOR_ID
        `;

        // Execute the query with parameter binding
        const result = await connection.execute(query, {
            VISIT_DATE: VISIT_DATE,
            DOCTOR_ID: DOCTOR_ID
        });

        // Extract the maximum queue number from the result
        const maxQueueNumber = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum queue number as a JSON response
        res.status(200).json({ maxQueueNumber });

    } catch (error) {
        console.error('Error fetching maximum queue number:', error);
        res.status(500).json({ error: 'Error fetching maximum queue number' });
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


app.post('/api/updateAppointmentStatus', async (req, res) => {
    let connection;

    try {
        const { PAT_ID, STATUS, VISIT_ID } = req.body;
        console.log('Received:', { PAT_ID, STATUS, VISIT_ID });

        if (!PAT_ID || !STATUS || !VISIT_ID) {
            return res.status(400).json({ error: 'Missing required parameters: PAT_ID, STATUS, or VISIT_ID' });
        }

        connection = await oracledb.getConnection();

        const query = `
            UPDATE CLNC_PATIENT_VISITS
            SET STATUS = :STATUS
            WHERE PAT_ID = :PAT_ID 
            AND VISIT_ID = :VISIT_ID
        `;

        const result = await connection.execute(query, {
            STATUS: STATUS,
            PAT_ID: PAT_ID,
            VISIT_ID: VISIT_ID
        });

        await connection.commit();
        console.log(`Rows affected: ${result.rowsAffected}`);

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'No records updated. Check your PAT_ID and VISIT_ID.' });
        }

        res.status(200).json({ message: 'Appointment status updated successfully' });

    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ error: `Error updating appointment status: ${error.message}` });
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

app.get('/api/userRole/:username', async (req, res) => {
    let connection;

    try {
        // Extract username from the request parameters
        const { username } = req.params;

        // Validate the username parameter
        if (!username) {
            return res.status(400).json({ error: 'Missing username parameter' });
        }

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to get all ROLE_ID and ACTIVE for the given username
        const query = `
            SELECT ROLE_ID, ACTIVE
            FROM USER_ROLES
            WHERE USRINFO_USERNAME = :username
        `;

        // Execute the query with parameter binding
        const result = await connection.execute(query, [username]);

        // Check if any rows were returned
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract ROLE_ID and ACTIVE from the result
        const roles = result.rows.map(row => ({
            ROLE_ID: row[0],
            ACTIVE: row[1]
        }));

        // Send the result as a JSON response
        res.status(200).json({ roles });

    } catch (error) {
        console.error('Error fetching user role:', error);
        res.status(500).json({ error: 'Error fetching user role' });
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
// Assuming you are using Express.js
app.get('/api/billingDetails/:searchCode', async (req, res) => {
    let connection;

    try {
        // Extract searchCode from the request parameters
        const { searchCode } = req.params;

        // Validate the searchCode parameter
        if (!searchCode) {
            return res.status(400).json({ error: 'Missing search code parameter' });
        }

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to get billing details based on service code or name, case-insensitive, unique results, and with qty and qty_in_hand conditions
        const query = `
            SELECT DISTINCT
                i.REF_CODE AS serviceCode,
                i.DESC_E AS serviceName,
                i.UOM_CODE AS uomCode,
                i.ITM_CODE AS itemCode,
                d.PRICE AS servicePrice,
                u.DESC_E AS uomDescription
            FROM 
                ITEMS i
            LEFT JOIN 
                DISTRIBUTIONS d ON i.ITM_CODE = d.ITM_CODE
            LEFT JOIN 
                UNIT_OF_MEASURES u ON i.UOM_CODE = u.UOM_CODE
            WHERE 
                (UPPER(i.REF_CODE) = UPPER(:searchCode) OR UPPER(i.DESC_E) LIKE '%' || UPPER(:searchCode) || '%')
                AND d.QTY > 0
                AND d.QTY_ON_HAND > 0
        `;

        // Execute the query with parameter binding
        const result = await connection.execute(query, [searchCode]);

        // Check if any rows were returned
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No billing details found' });
        }

        // Extract billing details from the result
        const billingDetails = result.rows.map(row => ({
            serviceCode: row[0],
            serviceName: row[1],
            uomCode: row[2],
            itemCode: row[3],
            servicePrice: row[4],
            uomDescription: row[5]
        }));

        // Send the result as a JSON response
        res.status(200).json({ billingDetails });

    } catch (error) {
        console.error('Error fetching billing details:', error);
        res.status(500).json({ error: 'Error fetching billing details' });
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

// app.get('/api/billingDetails/:searchCode', async (req, res) => {
//     let connection;

//     try {
//         // Extract searchCode from the request parameters
//         const { searchCode } = req.params;

//         // Validate the searchCode parameter
//         if (!searchCode) {
//             return res.status(400).json({ error: 'Missing search code parameter' });
//         }

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to get billing details based on service code or name, case-insensitive and unique results
//         const query = `
//             SELECT DISTINCT
//                 i.REF_CODE AS serviceCode,
//                 i.DESC_E AS serviceName,
//                 i.UOM_CODE AS uomCode,
//                 i.ITM_CODE AS itemCode,
//                 d.PRICE AS servicePrice,
//                 u.DESC_E AS uomDescription
//             FROM 
//                 ITEMS i
//             LEFT JOIN 
//                 DISTRIBUTIONS d ON i.ITM_CODE = d.ITM_CODE
//             LEFT JOIN 
//                 UNIT_OF_MEASURES u ON i.UOM_CODE = u.UOM_CODE
//             WHERE 
//                 UPPER(i.REF_CODE) = UPPER(:searchCode) OR UPPER(i.DESC_E) LIKE '%' || UPPER(:searchCode) || '%'
//         `;

//         // Execute the query with parameter binding
//         const result = await connection.execute(query, [searchCode]);

//         // Check if any rows were returned
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No billing details found' });
//         }

//         // Extract billing details from the result
//         const billingDetails = result.rows.map(row => ({
//             serviceCode: row[0],
//             serviceName: row[1],
//             uomCode: row[2],
//             itemCode: row[3],
//             servicePrice: row[4],
//             uomDescription: row[5]
//         }));

//         // Send the result as a JSON response
//         res.status(200).json({ billingDetails });

//     } catch (error) {
//         console.error('Error fetching billing details:', error);
//         res.status(500).json({ error: 'Error fetching billing details' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });



  // Example endpoint to fetch user details based on username
app.get('/api/userDetails/:username', async (req, res) => {
    let connection;

    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ error: 'Missing username parameter' });
        }

        connection = await oracledb.getConnection();

        const query = `
            SELECT PRICE_ACCESS, ACTIVE, DISCOUNT_PERCENTAGE
            FROM STORE_USERS
            WHERE USRINFO_USERNAME = :username
        `;

        const result = await connection.execute(query, [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User details not found' });
        }

        const userDetails = result.rows[0];
        const [priceAccess, active, discountPercentage] = userDetails;

        res.status(200).json({ priceAccess, active, discountPercentage });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Error fetching user details' });
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

app.post('/api/saveBillingData', async (req, res) => {
    let connection;

    const {
        appointmentId,
        patientName,
        fileNo,
        doctor,
        billingData,
        paymentData,
        totalBill,
        totalDiscount,
        netBill
    } = req.body;

    try {
        // Validate required fields
        if (!appointmentId || !patientName || !fileNo || !doctor || !billingData || !paymentData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

       

        // Log and Save patient details
        console.log('Inserting into PATIENT_DETAILS:', {
            appointmentId,
            patientName,
            fileNo,
            doctor
        });
        const patientQuery = `
            INSERT INTO PATIENT_DETAILS (APPOINTMENT_ID, PATIENT_NAME, FILE_NO, DOCTOR_ID)
            VALUES (:appointmentId, :patientName, :fileNo, :doctor)
        `;
        await connection.execute(patientQuery, {
            appointmentId,
            patientName,
            fileNo,
            doctor
        });

        // Log and Save billing details
        for (const detail of billingData) {
            console.log('Inserting into BILLING_DETAILS:', {
                serviceCode: detail.serviceCode,
                serviceName: detail.serviceName,
                uomDescription: detail.uomDescription,
                quantity: detail.quantity,
                price: detail.price,
                discountPercentage: detail.discountPercentage
            });
            const billingQuery = `
                INSERT INTO BILLING_DETAILS (SERVICE_CODE, SERVICE_NAME, UOM_DESCRIPTION, QUANTITY, PRICE, DISCOUNT_PERCENTAGE)
                VALUES (:serviceCode, :serviceName, :uomDescription, :quantity, :price, :discountPercentage)
            `;
            await connection.execute(billingQuery, {
                serviceCode: detail.serviceCode,
                serviceName: detail.serviceName,
                uomDescription: detail.uomDescription,
                quantity: detail.quantity,
                price: detail.price,
                discountPercentage: detail.discountPercentage
            });
        }

        // Log and Save payment details
        console.log('Inserting into PAYMENT_DETAILS:', {
            cash: paymentData.cash || null,
            creditCard: paymentData.creditCard || null,
            insurance: paymentData.insurance || null,
            totalBill,
            totalDiscount,
            netBill
        });
        const paymentQuery = `
            INSERT INTO PAYMENT_DETAILS (CASH, CREDIT_CARD, INSURANCE, TOTAL_BILL, TOTAL_DISCOUNT, NET_BILL)
            VALUES (:cash, :creditCard, :insurance, :totalBill, :totalDiscount, :netBill)
        `;
        await connection.execute(paymentQuery, {
            cash: paymentData.cash || null,
            creditCard: paymentData.creditCard || null,
            insurance: paymentData.insurance || null,
            totalBill,
            totalDiscount,
            netBill
        });

        // Commit transaction
        await connection.execute('COMMIT');

        res.status(200).json({ message: 'Data saved successfully' });

    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Error saving data' });
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
app.get('/api/patientsr', async (req, res) => {
    let connection;
    const {date} = req.query;//this name must be same as sent in url from api date name
    console.log('date recived',date)
    const dateObj = new Date(date);

    
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch patient IDs, visit IDs, visit hour, visit minute, visit date, and doctor ID with today's visit date and status 'W'
        const patientIdsQuery = `
            SELECT
                VISIT_ID,
                PAT_ID,
                VISIT_HOUR,
                 VISIT_MINUTES,
                  TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') VISIT_DATE,
                DOCTOR_ID
            FROM
                CLNC_PATIENT_VISITS
            WHERE
                TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
                STATUS = :status
        `;

        // Execute the query to get patient IDs and visit details
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday,
            status: 'W'
        });

        // Extract visit details and patient IDs
        const patientDetails = patientIdsResult.rows.map(row => ({
            visitId: row[0],         // VISIT_ID
            patId: row[1],           // PAT_ID
            visitHour: row[2],       // VISIT_HOUR
            visitMinute: row[3],     // VISIT_MINUTE
            visitDate: row[4],       // VISIT_DATE
            doctorId: row[5]         // DOCTOR_ID
        }));

        if (patientDetails.length === 0) {
            return res.status(200).json([]); // No patients found
        }

        // Construct query to fetch detailed patient information from CUSTOMERS table
        const customersQuery = `
            SELECT 
                
                CUST_ID,
                NAME_E,
                DOB,
                MARITAL_STATUS,
                GENDER,
                BLOOD_TYPE,
                SMOKER
            FROM
                CUSTOMERS
            WHERE
                CUST_ID IN (${patientDetails.map(detail => `'${detail.patId}'`).join(',')})
        `;

        // Execute the query to get patient details
        const customersResult = await connection.execute(customersQuery);

        // Map customer results to a dictionary for quick lookup
        const customersMap = new Map(customersResult.rows.map(row => [row[0], {
            name: row[1],       // NAME_E
            dob: row[2],        // DOB
            maritalStatus: row[3], // MARITAL_STATUS
            gender: row[4],     // GENDER
            bloodType: row[5],  // BLOOD_TYPE
            smoker: row[6]      // SMOKER
        }]));

        // Combine visit details with patient information
        const response = patientDetails.map(detail => ({
            visitId: detail.visitId,
            id: detail.patId,
            visitHour: detail.visitHour,
            visitMinute: detail.visitMinute,
            visitDate: detail.visitDate,
            doctorId: detail.doctorId,
            ...customersMap.get(detail.patId) || {}  // Merge patient details
        }));

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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
app.get('/api/patientsfollow', async (req, res) => {
    let connection;
    const { date, username, patientId } = req.query; // Extract date and username from query parameters
    console.log('date received:', date);
    console.log('username received:', username);
    console.log('patientId received:', patientId); // Log patientId for debugging

    // Ensure username and patientId are provided
    if (!username || !patientId) {
        return res.status(400).json({ error: 'Username and Patient ID are required' });
    }

    // Parse the date and format it to MM/DD/YYYY for Oracle
    const dateObj = new Date(date);
    const formattedToday = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch all fields from CLNC_PAT_FOLLOW_UP
        const patientIdsQuery = `
            SELECT *
            FROM CLNC_PAT_FOLLOW_UP
            WHERE TRUNC(CREATION_DATE) = TO_DATE(:today, 'MM/DD/YYYY') AND
                  CREATED_BY = :username AND 
                  PAT_ID = :patientId
        `;

        // Execute the query to get patient details
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday,
            username: username,
            patientId: patientId // Filter by patientId
        });

        // Extract all fields directly from the result
        const patientDetails = patientIdsResult.rows;

        if (patientDetails.length === 0) {
            return res.status(200).json([]); // No patients found
        }

        // Send the patient details directly as the response
        res.status(200).json(patientDetails);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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

app.get('/api/patientspres', async (req, res) => {
    let connection;
    const { date, username,patientId } = req.query; // Extract date and username from query parameters
    console.log('date received:', date);
    console.log('username received:', username);

    // Ensure username is provided
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Parse the date into a Date object and format it for Oracle
    const dateObj = new Date(date);
    const formattedToday = dateObj.toISOString().slice(0, 10); // Format: YYYY-MM-DD for comparison

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch all fields from CLNC_PAT_FOLLOW_UP
        const patientIdsQuery = `
            SELECT DISTINCT *
            FROM CLNC_PAT_PRESCRIPTIONS
            WHERE TRUNC(CREATION_DATE) = TO_DATE(:today, 'YYYY-MM-DD') AND
                  CREATED_BY = :username AND 
                  PAT_ID = :patientId
        `;

        // Execute the query to get patient details
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday,
            username: username,
            patientId:patientId // Filter by username
        });

        // Extract all fields directly from the result
        const patientDetails = patientIdsResult.rows;

        if (patientDetails.length === 0) {
            return res.status(200).json([]); // No patients found
        }

        // Send the patient details directly as the response
        res.status(200).json(patientDetails);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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
app.get('/api/patientslab', async (req, res) => {
    let connection;
    const { date } = req.query; // Extract date from query parameters
    console.log('Date received:', date);

    // Ensure date is provided
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const dateObj = new Date(date);
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch PAT_ID and VISIT_ID from CLNC_LAB_REQUEST
        const patientIdsQuery = `
            SELECT
                PAT_ID,
                VISIT_ID
            FROM
                CLNC_LAB_REQUEST
            WHERE
                TO_CHAR(CREATED_DAT, 'MM/DD/YYYY') = :today
        `;

        // Execute the query to get patient IDs
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday,
        });

        // Extract patient IDs and visit IDs
        const patientDetails = patientIdsResult.rows.map(row => ({
            patId: row[0], // PAT_ID
            visitId: row[1] // VISIT_ID
        }));

        if (patientDetails.length === 0) {
            return res.status(200).json([]); // No patients found
        }

        console.log('Received patient IDs:', patientDetails);

        // Construct query to fetch detailed patient information from CUSTOMERS table
        const customersQuery = `
            SELECT
                CUST_ID,
                NAME_E,
                DOB,
                MARITAL_STATUS,
                GENDER,
                BLOOD_TYPE,
                SMOKER
            FROM
                CUSTOMERS
            WHERE
                CUST_ID IN (${patientDetails.map(detail => `'${detail.patId.trim()}'`).join(',')})
        `;

        // Execute the query to get patient details
        const customersResult = await connection.execute(customersQuery);

        // Map customer results to a dictionary for quick lookup
        const customersMap = new Map(customersResult.rows.map(row => [row[0].trim(), {
            name: row[1],       // NAME_E
            dob: row[2],        // DOB
            maritalStatus: row[3], // MARITAL_STATUS
            gender: row[4],     // GENDER
            bloodType: row[5],  // BLOOD_TYPE
            smoker: row[6]      // SMOKER
        }]));

        // Combine lab request details with patient information and visit details
        const response = await Promise.all(patientDetails.map(async (detail) => {
            const trimmedPatId = detail.patId.trim(); // Trim the PAT_ID for consistent comparison
            const customerInfo = customersMap.get(trimmedPatId) || {};

            // Fetch visit details from CLNC_PATIENT_VISITS
            const visitQuery = `
                SELECT
                    VISIT_ID,
                    PAT_ID,
                    VISIT_HOUR,
                    VISIT_MINUTES,
                    TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') AS VISIT_DATE,
                    DOCTOR_ID
                FROM
                    CLNC_PATIENT_VISITS
                WHERE
                    PAT_ID = :patId AND VISIT_ID = :visitId AND TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today
            `;

            const visitResult = await connection.execute(visitQuery, {
                patId: trimmedPatId,
                visitId: detail.visitId,
                today: formattedToday
            });
            
            console.log(visitResult.rows[0], 'RESULT FROM');

            // Destructure visit information from the result
            const visitInfo = visitResult.rows[0] || [];
            const [
                visitId,
                patId,
                visitHour,
                visitMinutes,
                visitDate,
                doctorId
            ] = visitInfo;

            return {
                id: trimmedPatId,  // Use the trimmed ID
                visitId: detail.visitId, // Include visit ID
                ...customerInfo, // Spread the customer details into the response
                visitHour: visitHour || null,
                visitMinutes: visitMinutes || null,
                visitDate: visitDate || null,
                doctorId: doctorId || null
            };
        }));

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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

app.get('/api/get-next-test-id', async (req, res) => {
    let connection;

    try {
        // Establish a connection to the Oracle database
        connection = await oracledb.getConnection();

        // Query to get the maximum TEST_ID from your table
        const query = `
            SELECT MAX(TEST_ID) AS MAX_TEST_ID
            FROM CLNC_LAB_MASTER
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TEST_ID
        const maxTestId = result.rows[0][0];

        // Calculate the next TEST_ID
        const nextTestId = (maxTestId === null ? 1 : maxTestId + 1); // Return 1 if no records exist

        // Respond with the next TEST_ID
        res.status(200).json({ nextTestId });
    } catch (error) {
        console.error('Error retrieving next TEST_ID:', error);
        res.status(500).json({ error: 'Error retrieving next TEST_ID' });
    } finally {
        // Close the database connection if it was established
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

// app.get('/api/patientslab', async (req, res) => {
//     let connection;
//     const { date } = req.query; // Extract date from query parameters
//     console.log('date received:', date);

//     // Ensure date is provided
//     if (!date) {
//         return res.status(400).json({ error: 'Date is required' });
//     }

//     const dateObj = new Date(date);
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch PAT_ID and VISIT_ID from CLNC_LAB_REQUEST
//         const patientIdsQuery = `
//             SELECT
//                 PAT_ID,
//                 VISIT_ID
//             FROM
//                 CLNC_LAB_REQUEST
//             WHERE
//                 TO_CHAR(CREATED_DAT, 'MM/DD/YYYY') = :today
//         `;

//         // Execute the query to get patient IDs
//         const patientIdsResult = await connection.execute(patientIdsQuery, {
//             today: formattedToday,
//         });

//         // Extract patient IDs and visit IDs
//         const patientDetails = patientIdsResult.rows.map(row => ({
//             patId: row[0], // PAT_ID
//             visitId: row[1] // VISIT_ID
//         }));

//         if (patientDetails.length === 0) {
//             return res.status(200).json([]); // No patients found
//         }
        
//         console.log('Received patient IDs:', patientDetails);

//         // Construct query to fetch detailed patient information from CUSTOMERS table
//         const customersQuery = `
//             SELECT
//                 CUST_ID,
//                 NAME_E,
//                 DOB,
//                 MARITAL_STATUS,
//                 GENDER,
//                 BLOOD_TYPE,
//                 SMOKER
//             FROM
//                 CUSTOMERS
//             WHERE
//                 CUST_ID IN (${patientDetails.map(detail => `'${detail.patId.trim()}'`).join(',')})
//         `;

//         // Execute the query to get patient details
//         const customersResult = await connection.execute(customersQuery);

//         // Map customer results to a dictionary for quick lookup
//         const customersMap = new Map(customersResult.rows.map(row => [row[0].trim(), {
//             name: row[1],       // NAME_E
//             dob: row[2],        // DOB
//             maritalStatus: row[3], // MARITAL_STATUS
//             gender: row[4],     // GENDER
//             bloodType: row[5],  // BLOOD_TYPE
//             smoker: row[6]      // SMOKER
//         }]));

//         // Combine lab request details with patient information
//         const response = patientDetails.map(detail => {
//             const trimmedPatId = detail.patId.trim(); // Trim the PAT_ID for consistent comparison
//             const customerInfo = customersMap.get(trimmedPatId) || {};
//             return {
//                 id: trimmedPatId,  // Use the trimmed ID
//                 visitId: detail.visitId, // Include visit ID
//                 ...customerInfo // Spread the customer details into the response
//             };
//         });

//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error fetching patients:', error);
//         res.status(500).json({ error: 'Error fetching patients' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.get('/api/get-next-lab-no', async (req, res) => {
    let connection;

    try {
        // Establish a connection to the Oracle database
        connection = await oracledb.getConnection();

        // Query to get the maximum LAB_NO from your table
        const query = `
            SELECT MAX(LAB_NO) AS MAX_LAB_NO
            FROM CLNC_LAB_DETAILS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum LAB_NO
        const maxLabNo = result.rows[0][0];

        // Calculate the next LAB_NO
        const nextLabNo = (maxLabNo === null ? 1 : maxLabNo + 1); // Return 1 if no records exist

        // Respond with the next LAB_NO
        res.status(200).json({ nextLabNo });
    } catch (error) {
        console.error('Error retrieving next LAB_NO:', error);
        res.status(500).json({ error: 'Error retrieving next LAB_NO' });
    } finally {
        // Close the database connection if it was established
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});

app.post('/api/updateMasterTestId', async (req, res) => {
    const { username, testDetails } = req.body;
  
    let connection;
  
    // Function to format date as MM/DD/YYYY
    const formatDate = (date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`; // Format: MM/DD/YYYY
    };
  
    const createdDate = formatDate(new Date()); // Get current date in desired format
  
    try {
      connection = await oracledb.getConnection();
  
      // Prepare the update query
      const updateQuery = `
        UPDATE CLNC_LAB_MASTER
        SET TEST_NAME = :testName,
            REF_RANGE = :referenceRange,
            COMMENTS = :comments,
            ACTIVE = :active,
            TEST_HEADER = :testHeader,
            CREATED_DAT = TO_DATE(:createdDate, 'MM/DD/YYYY'),  -- Use formatted date
            USRINFO_USERNAME = :username
        WHERE TEST_ID = :testId
      `;
  
      // Loop through each test detail and execute the update
      for (const testResult of testDetails) {
        const { testId, testName, referenceRange, comments, active, testHeader } = testResult;
  
        // Execute the update for the current test result
        await connection.execute(updateQuery, {
          testId: testId,
          testName: testName,
          referenceRange: referenceRange,
          comments: comments,
          active: active,
          testHeader: testHeader,
          username: username,
          createdDate: createdDate, // Pass the formatted date
        });
      }
  
      // Commit the transaction
      await connection.commit();
  
      // Respond with success
      res.status(200).json({ message: 'Test details updated successfully' });
    } catch (error) {
      console.error('Error updating test details:', error);
      res.status(500).json({ error: 'Error updating test details' });
    } finally {
      // Close the database connection if it was established
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
  
app.get('/api/test-details/:itemCode', async (req, res) => {
    let connection;
    const { itemCode } = req.params; // Extract itemCode from request parameters

    if (!itemCode) {
        return res.status(400).json({ error: 'Item code is required' });
    }

    try {
        connection = await oracledb.getConnection();

        // Query to fetch all test details where itemCode matches and is active
        const query = `
            SELECT TEST_ID, TEST_NAME, REF_RANGE, COMMENTS, TEST_HEADER, ITM_CODE, ACTIVE
            FROM CLNC_LAB_MASTER
            WHERE ITM_CODE = :itemCode
              AND ACTIVE = 'Y'  -- Assuming you have an 'ACTIVE' column to check status
        `;

        const result = await connection.execute(query, { itemCode });

        if (result.rows.length > 0) {
            // Convert rows to a more readable format
            const testDetails = result.rows.map(row => ({
                testId: row[0],
                testName: row[1],
                referenceRange: row[2],
                comments: row[3],
                testHeader: row[4],
                itemCode: row[5],
                active: row[6]
               
            }));

            res.status(200).json(testDetails); // Send all matching test details
        } else {
            res.status(404).json({ error: 'No test details found for the provided item code' });
        }
    } catch (error) {
        console.error('Error fetching test details:', error);
        res.status(500).json({ error: 'Error fetching test details' });
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
app.post('/api/submit-test-details', async (req, res) => {
    const { username, selectedItemCode, nextTestNo: initialNextTestNo, testDetails } = req.body;

    let connection;
    let nextTestNo = initialNextTestNo; // Declare as let for modification

    // Function to format date as MM/DD/YYYY
    const formatDate = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`; // Format: MM/DD/YYYY
    };

    const createdDate = formatDate(new Date()); // Get current date in desired format

    try {
        connection = await oracledb.getConnection();

        // Prepare the insert query without the RESULT column
        const insertQuery = `
            INSERT INTO CLNC_LAB_MASTER 
            (TEST_ID, TEST_NAME, COMMENTS, REF_RANGE, CREATED_DAT, USRINFO_USERNAME, ITM_CODE, TEST_HEADER, ACTIVE)
            VALUES (:testId, :testName, :comments, :referenceRange, TO_DATE(:createdDate, 'MM/DD/YYYY'), :username, :itemCode, :testHeader, :active)
        `;

        // Loop through each test detail and execute the insert
        for (const testResult of testDetails) {
            const { testName, referenceRange, testHeader } = testResult;

            // Check for comments and default to 'N' if not present
            const comments = testResult.comments ? testResult.comments : 'N';
            // Check for active status and default to 'N' if not present
            const active = testResult.active ? testResult.active : 'N';

            // Execute the insert for the current test result
            await connection.execute(insertQuery, {
                testId: nextTestNo, // Ensure testId is the nextTestNo
                testName: testName,
                comments: comments, // Pass the computed comments
                referenceRange: referenceRange,
                createdDate: createdDate,
                username: username,
                itemCode: selectedItemCode,
                testHeader: testHeader,
                active: active // Pass the active status to the query
            });

            // Increment nextTestNo for the next iteration
            nextTestNo += 1; // Increment like currentLabNo
        }

        // Commit the transaction
        await connection.commit();

        // Respond with success
        res.status(201).json({ message: 'Test details added successfully' });
    } catch (error) {
        console.error('Error adding test details:', error);
        res.status(500).json({ error: 'Error adding test details' });
    } finally {
        // Close the database connection if it was established
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});




app.post('/api/submit-test-results', async (req, res) => {
    let connection;

    const { testResults, patientId, visitId, username, labNo, itemCode, itemDescription } = req.body;
    console.log(testResults, 'required test results');

    // Validate incoming data
    if (!testResults || !Array.isArray(testResults) || testResults.length === 0) {
        return res.status(400).json({ error: 'Test results are required' });
    }
    if (!patientId || !visitId || !username || !labNo || !itemCode) {
        return res.status(400).json({ error: 'Patient ID, Visit ID, username, LAB_NO, and itemCode are required' });
    }

    try {
        connection = await oracledb.getConnection();

        const formatDate = (date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`; // Format: MM/DD/YYYY
        };

        const createdDate = formatDate(new Date());
        const insertQuery = `
            INSERT INTO CLNC_LAB_DETAILS (PAT_ID, VISIT_ID, LAB_NO, TEST_ID, TEST_NAME, RESULT, COMMENTS, REF_RANGE, CREATED_DAT, USRINFO_USERNAME, ITM_CODE, TEST_HEADER)
            VALUES (:patId, :visitId, :labNo, :testId, :testName, :resultValue, :comments, :referenceRange, TO_DATE(:createdDate, 'MM/DD/YYYY'), :username, :itemCode, :testHeader)
        `;

        // Initialize the current lab number
        let currentLabNo = labNo;

        for (const testResult of testResults) {
            const { testName, resultValue, comment, referenceRange, testId, testHeader } = testResult;

            // Log the query and values for debugging
            console.log('Executing query:', insertQuery, {
                patId: patientId,
                visitId: visitId,
                labNo: currentLabNo,
                testId: testId,
                testName: testName,
                resultValue: resultValue,
                comments: comment, // Ensure this is correctly assigned
                referenceRange: referenceRange,
                createdDate: createdDate,
                username: username,
                itemCode: itemCode,
                testHeader: testHeader
            });

            await connection.execute(insertQuery, {
                patId: patientId,
                visitId: visitId,
                labNo: currentLabNo, // Use the current lab number
                testId: testId,
                testName: testName,
                resultValue: resultValue,
                comments: comment || '', // Default to empty string if comment is undefined
                referenceRange: referenceRange,
                createdDate: createdDate,
                username: username,
                itemCode: itemCode,
                testHeader: testHeader
            });

            // Increment the lab number for the next test result
            currentLabNo += 1; // Adjust this logic based on how you want to increment
        }

        await connection.commit();

        res.status(200).json({ message: 'Test results submitted successfully' });
    } catch (error) {
        console.error('Error submitting test results:', error);
        res.status(500).json({ error: 'Error submitting test results' });
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


app.put('/api/update-test-details', async (req, res) => {
    let connection;

    const { testDetails, patientId, visitId, itemCode,username } = req.body;
    console.log(testDetails,patientId,visitId, 'received test details');

    if (!testDetails || !Array.isArray(testDetails) || testDetails.length === 0) {
        return res.status(400).json({ error: 'Test details are required' });
    }
  

    try {
        connection = await oracledb.getConnection();
        const formatDate = (date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`; // Format: YYYY-MM-DD for better compatibility
        };

        const modifiedDate = formatDate(new Date());

        const updateLabDetailsQuery = `
            UPDATE CLNC_LAB_DETAILS
            SET RESULT = :result,
                COMMENTS = :comments,
                REF_RANGE = :referenceRange,
                TEST_NAME = :testName,
                      MODIFIED_BY = :modifiedBy,
                MODIFIED_DAT = TO_DATE(:modifiedDate, 'YYYY-MM-DD')
            WHERE PAT_ID = :patientId
              AND VISIT_ID = :visitId
              AND TEST_ID = :testId
              AND ITM_CODE = :itemCode
              AND LAB_NO = :labno
        `;

        const updateMastersQuery = `
            UPDATE CLNC_LAB_MASTER
            SET TEST_NAME = :testName,
                REF_RANGE = :referenceRange
            WHERE ITM_CODE = :itemCode
              AND TEST_ID = :testId
              
        `;

        for (const testDetail of testDetails) {
            const { testId, result, comments, referenceRange, testName, labno } = testDetail;
            console.log('Lab No:', labno); // Debugging line

            // Log the query and values for debugging
            console.log('Executing update query for lab details:', updateLabDetailsQuery, {
                patientId,
                visitId,
                testId,
                labno,
                result,
                comments,
                referenceRange,
                testName,
                modifiedBy: username,
                modifiedDate,
                itemCode
            });

            await connection.execute(updateLabDetailsQuery, {
                result,
                comments,
                referenceRange,
                testName,
                modifiedBy: username,
                modifiedDate,
                patientId,
                visitId,
                testId,
                labno,
             
                itemCode
            });

            console.log('Executing update query for masters:', updateMastersQuery, {
                itemCode,
                testId,
                testName,
                referenceRange
            });

            await connection.execute(updateMastersQuery, {
                testName,
                referenceRange,
                itemCode,
                testId
                
            });
        }

        await connection.commit();

        res.status(200).json({ message: 'Test details and masters updated successfully' });
    } catch (error) {
        console.error('Error updating test details:', error);
        res.status(500).json({ error: 'Error updating test details' });
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







app.get('/api/patientlab/:patientId', async (req, res) => {
    let connection;
    const { patientId } = req.params; // Extract patient ID from request parameters
    console.log('Patient ID received:', patientId);

    // Ensure patient ID is provided
    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch requested_by, created_date, item_code, and created_by based on patient ID
        const labRequestsQuery = `
            SELECT
                REQUESTED_BY,          -- Requested by
                CREATED_DAT AS created_date, -- Creation date
                ITM_CODE,              -- Item code
                CREATED_BY             -- Created by
            FROM
                CLNC_LAB_REQUEST
            WHERE
                PAT_ID = :patientId
        `;

        // Execute the query to get lab request details
        const result = await connection.execute(labRequestsQuery, {
            patientId: patientId.trim(), // Trim to avoid whitespace issues
        });

        // Check if results were found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No lab requests found for this patient.' });
        }

        // Map the results to a more readable format
        const labRequests = result.rows.map(row => ({
            requestedBy: row[0],      // REQUESTED_BY
            creationDate: row[1],     // CREATED_DAT
            itemCode: row[2],         // ITM_CODE
            createdBy: row[3]         // CREATED_BY
        }));

        // Send the response back to the client
        res.status(200).json(labRequests);

    } catch (error) {
        console.error('Error fetching lab requests:', error);
        res.status(500).json({ error: 'Error fetching lab requests' });
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


app.get('/api/patients', async (req, res) => {
    let connection;
    const { date, username } = req.query; // Extract date and username from query parameters
    console.log('date received:', date);
    console.log('username received:', username);

    // Ensure username is provided
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const dateObj = new Date(date);
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Updated query to include status 'P'
        const patientIdsQuery = `
            SELECT
                VISIT_ID,
                PAT_ID,
                VISIT_HOUR,
                VISIT_MINUTES,
                TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') VISIT_DATE,
                DOCTOR_ID
            FROM
                CLNC_PATIENT_VISITS
            WHERE
                TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
                STATUS IN (:status1, :status2) AND
                DOCTOR_ID = :username
        `;

        // Execute the query to get patient IDs and visit details
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday,
            status1: 'W',
            status2: 'P',
            username: username // Add username as a parameter to filter by DOCTOR_ID
        });

        // Extract visit details and patient IDs
        const patientDetails = patientIdsResult.rows.map(row => ({
            visitId: row[0],         // VISIT_ID
            patId: row[1],           // PAT_ID
            visitHour: row[2],       // VISIT_HOUR
            visitMinute: row[3],     // VISIT_MINUTE
            visitDate: row[4],       // VISIT_DATE
            doctorId: row[5]         // DOCTOR_ID
        }));

        if (patientDetails.length === 0) {
            return res.status(200).json([]); // No patients found
        }

        // Construct query to fetch detailed patient information from CUSTOMERS table
        const customersQuery = `
            SELECT
                CUST_ID,
                NAME_E,
                DOB,
                MARITAL_STATUS,
                GENDER,
                BLOOD_TYPE,
                SMOKER
            FROM
                CUSTOMERS
            WHERE
                CUST_ID IN (${patientDetails.map(detail => `'${detail.patId}'`).join(',')})
        `;

        // Execute the query to get patient details
        const customersResult = await connection.execute(customersQuery);

        // Map customer results to a dictionary for quick lookup
        const customersMap = new Map(customersResult.rows.map(row => [row[0], {
            name: row[1],       // NAME_E
            dob: row[2],        // DOB
            maritalStatus: row[3], // MARITAL_STATUS
            gender: row[4],     // GENDER
            bloodType: row[5],  // BLOOD_TYPE
            smoker: row[6]      // SMOKER
        }]));

        // Combine visit details with patient information
        const response = patientDetails.map(detail => ({
            visitId: detail.visitId,
            id: detail.patId,
            visitHour: detail.visitHour,
            visitMinute: detail.visitMinute,
            visitDate: detail.visitDate,
            doctorId: detail.doctorId,
            ...customersMap.get(detail.patId) || {}  // Merge patient details
        }));

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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

// app.get('/api/patients', async (req, res) => {
//     let connection;
//     const { date, username } = req.query; // Extract date and username from query parameters
//     console.log('date received:', date);
//     console.log('username received:', username);

//     // Ensure username is provided
//     if (!username) {
//         return res.status(400).json({ error: 'Username is required' });
//     }

//     const dateObj = new Date(date);
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch patient IDs, visit IDs, visit hour, visit minute, visit date, and doctor ID with today's visit date, status 'W', and doctor ID matching username
//         const patientIdsQuery = `
//             SELECT
//                 VISIT_ID,
//                 PAT_ID,
//                 VISIT_HOUR,
//                 VISIT_MINUTES,
//                 TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') VISIT_DATE,
//                 DOCTOR_ID
//             FROM
//                 CLNC_PATIENT_VISITS
//             WHERE
//                 TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
//                 STATUS = :status AND
//                 DOCTOR_ID = :username
//         `;

//         // Execute the query to get patient IDs and visit details
//         const patientIdsResult = await connection.execute(patientIdsQuery, {
//             today: formattedToday,
//             status: 'W',
//             username: username // Add username as a parameter to filter by DOCTOR_ID
//         });

//         // Extract visit details and patient IDs
//         const patientDetails = patientIdsResult.rows.map(row => ({
//             visitId: row[0],         // VISIT_ID
//             patId: row[1],           // PAT_ID
//             visitHour: row[2],       // VISIT_HOUR
//             visitMinute: row[3],     // VISIT_MINUTE
//             visitDate: row[4],       // VISIT_DATE
//             doctorId: row[5]         // DOCTOR_ID
//         }));

//         if (patientDetails.length === 0) {
//             return res.status(200).json([]); // No patients found
//         }

//         // Construct query to fetch detailed patient information from CUSTOMERS table
//         const customersQuery = `
//             SELECT
//                 CUST_ID,
//                 NAME_E,
//                 DOB,
//                 MARITAL_STATUS,
//                 GENDER,
//                 BLOOD_TYPE,
//                 SMOKER
//             FROM
//                 CUSTOMERS
//             WHERE
//                 CUST_ID IN (${patientDetails.map(detail => `'${detail.patId}'`).join(',')})
//         `;

//         // Execute the query to get patient details
//         const customersResult = await connection.execute(customersQuery);

//         // Map customer results to a dictionary for quick lookup
//         const customersMap = new Map(customersResult.rows.map(row => [row[0], {
//             name: row[1],       // NAME_E
//             dob: row[2],        // DOB
//             maritalStatus: row[3], // MARITAL_STATUS
//             gender: row[4],     // GENDER
//             bloodType: row[5],  // BLOOD_TYPE
//             smoker: row[6]      // SMOKER
//         }]));

//         // Combine visit details with patient information
//         const response = patientDetails.map(detail => ({
//             visitId: detail.visitId,
//             id: detail.patId,
//             visitHour: detail.visitHour,
//             visitMinute: detail.visitMinute,
//             visitDate: detail.visitDate,
//             doctorId: detail.doctorId,
//             ...customersMap.get(detail.patId) || {}  // Merge patient details
//         }));

//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error fetching patients:', error);
//         res.status(500).json({ error: 'Error fetching patients' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.get('/api/visit/:visitId', async (req, res) => {
    let connection;
    const { visitId } = req.params; // Get visitId from URL parameters
    const { selectedDate } = req.query; // Get selectedDate from query parameters
    console.log(selectedDate, 'date received in visit');

    // Convert selectedDate from YYYY-MM-DD to MM/DD/YYYY
    const dateObj = new Date(selectedDate);
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

    try {
        // Establish connection to your database
        connection = await oracledb.getConnection();

        // Query to fetch visit details based on visitId and formattedDate
        const visitDetailsQuery = `
            SELECT
                COMPLAINT,
                INVESTIGATION_RESULTS,
                DIAGNOSIS,
                MANAGEMENT_PLAN,
                FOLLOW_UP
            FROM
                CLNC_PAT_FOLLOW_UP
            WHERE
                VISIT_ID = :visitId
                AND CREATION_DATE = TO_DATE(:formattedDate, 'MM/DD/YYYY')
        `;

        // Execute the query
        const result = await connection.execute(visitDetailsQuery, {
            visitId: visitId,
            formattedDate: formattedDate // Pass the formatted date as a parameter
        });

        // Check if visit details were found
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        // Send the details back to the client
        const visitDetails = {
            complaint: result.rows[0][0],
            investigationResults: result.rows[0][1],
            diagnosis: result.rows[0][2],
            managementPlan: result.rows[0][3],
            followupPlan: result.rows[0][4]
        };

        res.status(200).json(visitDetails);

    } catch (error) {
        console.error('Error fetching visit details:', error);
        res.status(500).json({ error: 'Error fetching visit details' });
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
app.get('/api/visitpres/:visitId', async (req, res) => {
    let connection;
    const { visitId } = req.params; // Get visitId from URL parameters
    const { selectedDate } = req.query; // Get selectedDate from query parameters
    console.log(selectedDate, 'date received in visit');

    // Convert selectedDate from YYYY-MM-DD to MM/DD/YYYY
    const dateObj = new Date(selectedDate);
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

    try {
        // Establish connection to your database
        connection = await oracledb.getConnection();

        // Query to fetch visit details based on visitId and formattedDate
        const visitDetailsQuery = `
            SELECT
                DOSAGE_QUANTITY,
                REPEATED_IN_DAY,
                DAYS_PERIOD,
                NOTES,
                ITEM_NAME
            FROM
                CLNC_PAT_PRESCRIPTIONS
            WHERE
                VISIT_ID = :visitId
                AND CREATION_DATE = TO_DATE(:formattedDate, 'MM/DD/YYYY')
        `;

        // Execute the query
        const result = await connection.execute(visitDetailsQuery, {
            visitId: visitId,
            formattedDate: formattedDate // Pass the formatted date as a parameter
        });

        // Check if visit details were found
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        console.log(result, 'result from prscrop00');

        // Map the rows to a more structured format
        const visitDetails = result.rows.map(row => ({
            dosageQuantity: row[0],
            repeatedInDay: row[1],
            daysPeriod: row[2],
            notes: row[3],
            itemName: row[4]
        }));

        // Send the details back to the client
        res.status(200).json(visitDetails);

    } catch (error) {
        console.error('Error fetching visit details:', error);
        res.status(500).json({ error: 'Error fetching visit details' });
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



// app.get('/api/patients', async (req, res) => {
//     let connection;
//     const {date} = req.query;//this name must be same as sent in url from api date name
//     console.log('date recived',date)
//     const dateObj = new Date(date);

    
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch patient IDs, visit IDs, visit hour, visit minute, visit date, and doctor ID with today's visit date and status 'W'
//         const patientIdsQuery = `
//             SELECT
//                 VISIT_ID,
//                 PAT_ID,
//                 VISIT_HOUR,
//                  VISIT_MINUTES,
//                   TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') VISIT_DATE,
//                 DOCTOR_ID
//             FROM
//                 CLNC_PATIENT_VISITS
//             WHERE
//                 TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
//                 STATUS = :status
//         `;

//         // Execute the query to get patient IDs and visit details
//         const patientIdsResult = await connection.execute(patientIdsQuery, {
//             today: formattedToday,
//             status: 'W'
//         });

//         // Extract visit details and patient IDs
//         const patientDetails = patientIdsResult.rows.map(row => ({
//             visitId: row[0],         // VISIT_ID
//             patId: row[1],           // PAT_ID
//             visitHour: row[2],       // VISIT_HOUR
//             visitMinute: row[3],     // VISIT_MINUTE
//             visitDate: row[4],       // VISIT_DATE
//             doctorId: row[5]         // DOCTOR_ID
//         }));

//         if (patientDetails.length === 0) {
//             return res.status(200).json([]); // No patients found
//         }

//         // Construct query to fetch detailed patient information from CUSTOMERS table
//         const customersQuery = `
//             SELECT
//                 CUST_ID,
//                 NAME_E,
//                 DOB,
//                 MARITAL_STATUS,
//                 GENDER,
//                 BLOOD_TYPE,
//                 SMOKER
//             FROM
//                 CUSTOMERS
//             WHERE
//                 CUST_ID IN (${patientDetails.map(detail => `'${detail.patId}'`).join(',')})
//         `;

//         // Execute the query to get patient details
//         const customersResult = await connection.execute(customersQuery);

//         // Map customer results to a dictionary for quick lookup
//         const customersMap = new Map(customersResult.rows.map(row => [row[0], {
//             name: row[1],       // NAME_E
//             dob: row[2],        // DOB
//             maritalStatus: row[3], // MARITAL_STATUS
//             gender: row[4],     // GENDER
//             bloodType: row[5],  // BLOOD_TYPE
//             smoker: row[6]      // SMOKER
//         }]));

//         // Combine visit details with patient information
//         const response = patientDetails.map(detail => ({
//             visitId: detail.visitId,
//             id: detail.patId,
//             visitHour: detail.visitHour,
//             visitMinute: detail.visitMinute,
//             visitDate: detail.visitDate,
//             doctorId: detail.doctorId,
//             ...customersMap.get(detail.patId) || {}  // Merge patient details
//         }));

//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error fetching patients:', error);
//         res.status(500).json({ error: 'Error fetching patients' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.get('/api/CLNC-pat-VISIT', async (req, res) => {
    let connection;
    const { patId, visitId, visitDate } = req.query;

    if (!patId || !visitId || !visitDate) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch appointment details
        const appointmentQuery = `
            SELECT
                VISIT_ID,
                PAT_ID,
                VISIT_HOUR,
                VISIT_MINUTES,
                TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') AS VISIT_DATE,
                DOCTOR_ID,
                EXPECTED_TIME,
                QUEUE_NUMBER
            FROM
                CLNC_PATIENT_VISITS
            WHERE
                PAT_ID = :patId AND
                VISIT_ID = :visitId AND
                TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :visitDate
        `;
        const appointmentResult = await connection.execute(appointmentQuery, {
            patId: patId,
            visitId: visitId,
            visitDate: visitDate
        });

        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = appointmentResult.rows[0];
        const appointmentDetails = {
            visitId: appointment[0],
            patId: appointment[1],
            visitHour: appointment[2],
            visitMinute: appointment[3],
            visitDate: appointment[4],
            doctorId: appointment[5],
            expected: appointment[6],
            queue:appointment[7]
        };

        res.status(200).json(appointmentDetails);

    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ error: 'Error fetching appointment details' });
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

// app.get('/api/patients', async (req, res) => {
//     let connection;
//     const today = new Date();
//     const formattedToday = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`; // Format: MM/DD/YYYY

//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch patient IDs and visit IDs with today's visit date and status 'W'
//         const patientIdsQuery = `
//             SELECT
//                 VISIT_ID,
//                 PAT_ID
//             FROM
//                 CLNC_PATIENT_VISITS
//             WHERE
//                 TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
//                 STATUS = :status
//         `;

//         // Execute the query to get patient IDs and visit IDs
//         const patientIdsResult = await connection.execute(patientIdsQuery, {
//             today: formattedToday,
//             status: 'W'
//         });

//         // Extract visit IDs and patient IDs
//         const patientDetails = patientIdsResult.rows.map(row => ({
//             visitId: row[0], // VISIT_ID
//             patId: row[1]   // PAT_ID
//         }));

//         if (patientDetails.length === 0) {
//             return res.status(200).json([]); // No patients found
//         }

//         // Construct query to fetch detailed patient information from CUSTOMERS table
//         const customersQuery = `
//             SELECT
//                 CUST_ID,
//                 NAME_E,
//                 DOB,
//                 MARITAL_STATUS,
//                 GENDER,
//                 BLOOD_TYPE,
//                 SMOKER
//             FROM
//                 CUSTOMERS
//             WHERE
//                 CUST_ID IN (${patientDetails.map(detail => `'${detail.patId}'`).join(',')})
//         `;

//         // Execute the query to get patient details
//         const customersResult = await connection.execute(customersQuery);

//         // Map customer results to a dictionary for quick lookup
//         const customersMap = new Map(customersResult.rows.map(row => [row[0], {
//             name: row[1],       // NAME_E
//             dob: row[2],        // DOB
//             maritalStatus: row[3], // MARITAL_STATUS
//             gender: row[4],     // GENDER
//             bloodType: row[5],  // BLOOD_TYPE
//             smoker: row[6]      // SMOKER
//         }]));

//         // Combine visit IDs with patient details
//         const response = patientDetails.map(detail => ({
//             visitId: detail.visitId,
//             id: detail.patId,
//             ...customersMap.get(detail.patId) || {}  // Merge patient details
//         }));

//         res.status(200).json(response);
     
//     } catch (error) {
//         console.error('Error fetching patients:', error);
//         res.status(500).json({ error: 'Error fetching patients' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

// app.get('/api/patients', async (req, res) => {
//     let connection;
//     const today = new Date();
//     const formattedToday = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`; // Format: MM/DD/YYYY

//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch patient IDs with today's visit date and status 'W'
//         const patientIdsQuery = `
//             SELECT
                
//                 PAT_ID
//             FROM
//                 CLNC_PATIENT_VISITS
//             WHERE
//                 TO_CHAR(VISIT_DATE, 'MM/DD/YYYY') = :today AND
//                 STATUS = :status
//         `;

//         // Execute the query to get patient IDs
//         const patientIdsResult = await connection.execute(patientIdsQuery, {
//             today: formattedToday,
//             status: 'W'
//         });

//         // Extract patient IDs
//         const patientIds = patientIdsResult.rows.map(row => row[0]);

//         if (patientIds.length === 0) {
//             return res.status(200).json([]); // No patients found
//         }

//         // Construct query to fetch detailed patient information from CUSTOMERS table
//         const customersQuery = `
//             SELECT
//                 CUST_ID,
//                 NAME_E,
//                 DOB,
//                 MARITAL_STATUS,
//                 GENDER,
//                 BLOOD_TYPE,
//                 SMOKER
//             FROM
//                 CUSTOMERS
//             WHERE
//                 CUST_ID IN (${patientIds.map(id => `'${id}'`).join(',')})
//         `;

//         // Execute the query to get patient details
//         const customersResult = await connection.execute(customersQuery);

//         // Send the fetched data as response
//         res.status(200).json(customersResult.rows.map(row => ({
//             id: row[0],         // Assuming CUST_ID is the first column
//             name: row[1],       // Assuming NAME_E is the second column
//             dob: row[2],        // Assuming DOB is the third column
//             maritalStatus: row[3], // Assuming MARITAL_STATUS is the fourth column
//             gender: row[4],     // Assuming GENDER is the fifth column
//             bloodType: row[5],  // Assuming BLOOD_TYPE is the sixth column
//             smoker: row[6]      // Assuming SMOKER is the seventh column
//         })));
     
//     } catch (error) {
//         console.error('Error fetching patients:', error);
//         res.status(500).json({ error: 'Error fetching patients' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.post('/api/submit-details', async (req, res) => {
    let connection;
    const today = new Date();
    const formattedToday = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`; // Format: MM/DD/YYYY

    try {
        // Extract form data from request body
        const {
            weight,
            height,
            heartRate,
            oxygenSaturation,
            bloodSugar,
            temperature,
            bpSystolic,
            bpDiastolic,
            headCircumference,
            nurseNotes,
            fileNo ,
            VISIT_ID,
            createdBy
        } = req.body;

        // Validate data if needed

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Insert data into CLNC_PAT_READ table
        const insertQuery = `
            INSERT INTO CLNC_PAT_READS (
            CREATED_BY,
            VISIT_ID,
                PAT_ID,
                WEIGHT,
                HEIGHT,
                HR,
                SPO2,
                SUGAR,
                TEMP,
                CONSTRICTION,
                ENERGIZES,
                HEAD_CIRCUMFERENCE,
                NOTES,
                CREATION_DATE
            ) VALUES (
             :createdby,
             :VISIT_ID,
             :fileNo,
                :weight,
                :height,
                :heartRate,
                :oxygenSaturation,
                :bloodSugar,
                :temperature,
                :bpSystolic,
                :bpDiastolic,
                :headCircumference,
                :nurseNotes,
                TO_DATE(:formattedToday, 'MM/DD/YYYY') 
            )
        `;

        await connection.execute(insertQuery, {
            createdBy,
            VISIT_ID,
            fileNo,
            weight,
            height,
            heartRate,
            oxygenSaturation,
            bloodSugar,
            temperature,
            bpSystolic,
            bpDiastolic,
            headCircumference,
            nurseNotes,
            formattedToday
        });

        await connection.commit();

        res.status(200).json({ message: 'Details submitted successfully' });

    } catch (error) {
        console.error('Error submitting details:', error);
        res.status(500).json({ error: 'Error submitting details' });
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
app.put('/api/update-collected', async (req, res) => {
    let connection;
    const { itemCode, patientId, date,sample } = req.body;
    console.log('sample collected',sample)

    // Ensure inputs are trimmed
    const trimmedItemCode = itemCode;
    const trimmedPatientId = patientId;
    const trimmedDate = date;

    console.log('Updating collected status for Item Code:', trimmedItemCode);
    console.log('Patient ID:', trimmedPatientId);
    console.log('Date:', trimmedDate);

    try {
        connection = await oracledb.getConnection();

        // Query to update the collected status
        const updateQuery = `
            UPDATE CLNC_LAB_REQUEST
            SET SAMPLE_COLLECTED = :sample
            WHERE ITM_CODE = :itemCode
              AND TRIM(PAT_ID) = TRIM(:patientId)
              AND TRUNC(CREATED_DAT) = TO_DATE(:formattedDate, 'MM/DD/YYYY')
        `;

        // Format the date to MM/DD/YYYY
        const dateObj = new Date(trimmedDate);
        const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

        const result = await connection.execute(updateQuery, {
            itemCode: trimmedItemCode,
            patientId: trimmedPatientId,
            formattedDate,
            sample
        });

        // Commit the transaction
        await connection.commit();

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'No lab request found to update.' });
        }

        res.status(200).json({ message: 'Collected status updated successfully.' });

    } catch (error) {
        console.error('Error updating collected status:', error);
        res.status(500).json({ error: 'Error updating collected status' });
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


app.get('/api/patient-lab/:id', async (req, res) => {
    let connection;
    const patientId = req.params.id.trim(); // Ensure patientId is trimmed
    console.log('Fetching lab requests for Patient ID:', patientId);
    
    const selectedDate = req.query.date;
    console.log('Selected Date:', selectedDate);
    
    // Format the selected date to MM/DD/YYYY
    const dateObj = new Date(selectedDate);
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    try {
        connection = await oracledb.getConnection();

        // Query to fetch lab request details and item descriptions from CLNC_LAB_REQUEST and ITEMS
        const query = `
            SELECT
                lr.ITM_CODE, 
                lr.REQUESTED_BY, 
                lr.CREATED_BY, 
                lr.CREATED_DAT,
                i.DESC_E AS itemDescription,
                lr.SAMPLE_COLLECTED
            FROM
                CLNC_LAB_REQUEST lr
            JOIN
                ITEMS i ON lr.ITM_CODE = i.ITM_CODE
            WHERE
                TRIM(lr.PAT_ID) = TRIM(:patientId)
                AND TRUNC(lr.CREATED_DAT) = TO_DATE(:formattedDate, 'MM/DD/YYYY')  -- Match the formatted date
        `;
        console.log('Executing Query:', query);
        
        const result = await connection.execute(query, { patientId, formattedDate });
        console.log('Lab result:', result);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No lab requests found for this patient.' });
        }

        // Map the results to a more readable format
        const labRequests = result.rows.map(row => ({
            itemCode: row[0],
            requestedBy: row[1],
            createdBy: row[2],
            creationDate: row[3],
            itemDescription: row[4],
            sample:row[5] // Add the item description
        }));

        res.status(200).json(labRequests);

    } catch (error) {
        console.error('Error fetching lab requests:', error);
        res.status(500).json({ error: 'Error fetching lab requests' });
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

// app.get('/api/patient-lab/:id', async (req, res) => {
//     let connection;
//     const patientId = req.params.id.trim(); // Ensure patientId is trimmed
//     console.log('Fetching lab requests for Patient ID:', patientId);
//     const selectedDate = req.query.date
//     console.log('selecteddate',selectedDate)
//     const dateObj = new Date(selectedDate);
//     const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
//     try {
//         connection = await oracledb.getConnection();

//         // Query to fetch lab request details and item descriptions from CLNC_LAB_REQUEST and ITEMS
//         const query = `
//             SELECT
//                 lr.ITM_CODE, 
//                 lr.REQUESTED_BY, 
//                 lr.CREATED_BY, 
//                 lr.CREATED_DAT,
//                 i.DESC_E AS itemDescription
//             FROM
//                 CLNC_LAB_REQUEST lr
//             JOIN
//                 ITEMS i ON lr.ITM_CODE = i.ITM_CODE
//             WHERE
//                 TRIM(lr.PAT_ID) = TRIM(:patientId)
//         `;
//         console.log('Executing Query:', query);
        
//         const result = await connection.execute(query, { patientId });
//         console.log('Lab result:', result);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No lab requests found for this patient.' });
//         }

//         // Map the results to a more readable format
//         const labRequests = result.rows.map(row => ({
//             itemCode: row[0],
//             requestedBy: row[1],
//             createdBy: row[2],
//             creationDate: row[3],
//             itemDescription: row[4] // Add the item description
//         }));

//         res.status(200).json(labRequests);

//     } catch (error) {
//         console.error('Error fetching lab requests:', error);
//         res.status(500).json({ error: 'Error fetching lab requests' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });



app.get('/api/patient-DT/:id', async (req, res) => {
    let connection;
    const patientId = req.params.id;
    const visitId = req.query.visitId; // Get visitId from query parameters
    console.log(`Patient ID: ${patientId}, Visit ID: ${visitId}`);

    try {
        connection = await oracledb.getConnection();

        // Query to fetch all patient details from the details table
        const query = `
            SELECT *
            FROM
                CLNC_LAB_DETAILS  -- Replace with your actual table name
            WHERE
                PAT_ID = :patientId
                AND VISIT_ID = :visitId
        `;

        const result = await connection.execute(query, { patientId, visitId });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient details not found' });
        }

        // Convert the result into an object with column names
        const columns = result.metaData.map(col => col.name);
        const data = {};
        for (let i = 0; i < columns.length; i++) {
            data[columns[i]] = result.rows[0][i];
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Error fetching patient details' });
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

app.get('/api/patient-details/:id', async (req, res) => {
    let connection;
    const patientId = req.params.id;
    console.log(patientId)

    try {
        connection = await oracledb.getConnection();

        // Query to fetch patient details from CLNC_PAT_READS
        const query = `
            SELECT
                WEIGHT,
                HEIGHT,
                HR AS heartRate,
                SPO2 AS oxygenSaturation,
                SUGAR AS bloodSugar,
                TEMP AS temperature,
                CONSTRICTION AS bpSystolic,
                ENERGIZES AS bpDiastolic,
                HEAD_CIRCUMFERENCE AS headCircumference,
                NOTES AS nurseNotes,
                PAT_ID AS fileNo,
                VISIT_ID
            FROM
                CLNC_PAT_READS
            WHERE
                PAT_ID = :patientId
           
        `;

        const result = await connection.execute(query, { patientId });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient details not found' });
        }

        const data = {
            weight: result.rows[0][0],
            height: result.rows[0][1],
            heartRate: result.rows[0][2],
            oxygenSaturation: result.rows[0][3],
            bloodSugar: result.rows[0][4],
            temperature: result.rows[0][5],
            bpSystolic: result.rows[0][6],
            bpDiastolic: result.rows[0][7],
            headCircumference: result.rows[0][8],
            nurseNotes: result.rows[0][9],
            fileNo: result.rows[0][10],
            VISIT_ID: result.rows[0][11]
        };

        res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Error fetching patient details' });
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
// Endpoint to update patient details
app.put('/api/update-details/:id', async (req, res) => {
    const today = new Date();
    const formattedToday = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`; // Format: MM/DD/YYYY
    let connection;
    const patientId = req.params.id;
    const {
        weight,
        height,
        heartRate,
        oxygenSaturation,
        bloodSugar,
        temperature,
        bpSystolic,
        bpDiastolic,
        headCircumference,
        nurseNotes,
        VISIT_ID,
        updatedBy // Include updatedBy in the request body
    } = req.body;

    try {
        connection = await oracledb.getConnection();

        // Get current date and time for updatedDate
        const updatedDate = new Date().toISOString();

        // Query to update patient details in CLNC_PAT_READS
        const query = `
            UPDATE CLNC_PAT_READS
            SET
                WEIGHT = :weight,
                HEIGHT = :height,
                HR = :heartRate,
                SPO2 = :oxygenSaturation,
                SUGAR = :bloodSugar,
                TEMP = :temperature,
                CONSTRICTION = :bpSystolic,
                ENERGIZES = :bpDiastolic,
                HEAD_CIRCUMFERENCE = :headCircumference,
                NOTES = :nurseNotes,
                VISIT_ID = :VISIT_ID,
                UPDATED_BY = :updatedBy,        -- Added updatedBy
                UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY')
            WHERE
                PAT_ID = :patientId
        `;

        const result = await connection.execute(query, {
            weight,
            height,
            heartRate,
            oxygenSaturation,
            bloodSugar,
            temperature,
            bpSystolic,
            bpDiastolic,
            headCircumference,
            nurseNotes,
            VISIT_ID,
            updatedBy,          // Bind updatedBy
            formattedToday,        // Bind updatedDate
            patientId
        }, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Patient details not found for update' });
        }

        res.status(200).json({ message: 'Patient details updated successfully' });

    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ error: 'Error updating patient details' });
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

app.get('/api/storeUsers', async (req, res) => {
    let connection;
    const { comNo, username } = req.query; // Retrieve query parameters
  
    if (!comNo || !username) {
      return res.status(400).json({ error: 'Missing required parameters: comNo and/or username' });
    }
  
    try {
      connection = await oracledb.getConnection();
  
      // Query to get STR_CODE values based on comNo and username
      const query = `
        SELECT STR_CODE
        FROM STORE_USERS
        WHERE COM_NO = :comNo
          AND USRINFO_USERNAME = :username
      `;
  
      const result = await connection.execute(query, { comNo, username });
  
      // Extract STR_CODE values from result
      const strCodes = result.rows.map(row => row[0]);
  
      // Return STR_CODE values as JSON
      res.status(200).json({ STR_CODES: strCodes });
  
    } catch (error) {
      console.error('Error fetching STR_CODES:', error);
      res.status(500).json({ error: 'Error fetching STR_CODES' });
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
  app.get('/api/getMaxSessionNo', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum session number from the table
        const query = `
            SELECT MAX(SESSION_NO) AS MAX_SESSION_NO
            FROM STORE_USER_CLOSINGS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum session number from the result
        const maxSessionNo = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum session number as a JSON response
        res.status(200).json({ maxSessionNo });

    } catch (error) {
        console.error('Error fetching maximum session number:', error);
        res.status(500).json({ error: 'Error fetching maximum session number' });
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
app.get('/api/getMaxTHSEQ', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
        const query = `
            SELECT MAX(TH_SEQ) AS MAX_TH_SEQ
            FROM TRANSACTION_HEADERS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TH_SEQ from the result
        const maxTHSEQ = result.rows.length > 0 && result.rows[0][0] !== null
            ? result.rows[0][0] + 1 // Add 1 to the maximum value
            : 1; // Default to 1 if no rows are found

        // Send the updated TH_SEQ value as a JSON response
        res.status(200).json({ maxTHSEQ });

    } catch (error) {
        console.error('Error fetching maximum TH_SEQ:', error);
        res.status(500).json({ error: 'Error fetching maximum TH_SEQ' });
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

// app.get('/api/getMaxTHSEQ', async (req, res) => {
//     let connection;

//     try {
//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
//         const query = `
//             SELECT MAX(TH_SEQ) AS MAX_TH_SEQ
//             FROM TRANSACTION_HEADERS
//         `;

//         // Execute the query
//         const result = await connection.execute(query);

//         // Extract the maximum TH_SEQ from the result
//         const maxTHSEQ = result.rows.length > 0 ? result.rows[0][0] : null;

//         // Send the maximum TH_SEQ as a JSON response
//         res.status(200).json({ maxTHSEQ });

//     } catch (error) {
//         console.error('Error fetching maximum TH_SEQ:', error);
//         res.status(500).json({ error: 'Error fetching maximum TH_SEQ' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });
app.get('/api/getMaxTLSEQ', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
        const query = `
            SELECT MAX(TL_SEQ) AS MAX_TL_SEQ
            FROM TRANSACTION_LINES
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TH_SEQ from the result
        const maxTLSEQ = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum TH_SEQ as a JSON response
        res.status(200).json({ maxTLSEQ });

    } catch (error) {
        console.error('Error fetching maximum TH_SEQ:', error);
        res.status(500).json({ error: 'Error fetching maximum TH_SEQ' });
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
app.get('/api/getMaxTRANSPAY', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
        const query = `
            SELECT MAX(TRANSPAY_SERIAL) AS MAX_TRANSPAY
            FROM TRANSACTION_PAYMENTS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TH_SEQ from the result
        const maxTPAY = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum TH_SEQ as a JSON response
        res.status(200).json({ maxTPAY });

    } catch (error) {
        console.error('Error fetching maximum TPAY:', error);
        res.status(500).json({ error: 'Error fetching maximum TPAY' });
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
app.get('/api/getMaxPAYINFINFO', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
        const query = `
            SELECT MAX(PAYINF_SERIAL) AS MAX_PAYINF
            FROM PAYMENT_INFORMATIONS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TH_SEQ from the result
        const PAYINF = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum TH_SEQ as a JSON response
        res.status(200).json({ PAYINF });

    } catch (error) {
        console.error('Error fetching maximum TPAY:', error);
        res.status(500).json({ error: 'Error fetching maximum TPAY' });
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
app.get('/api/getMaxPAYINF', async (req, res) => {
    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch the maximum TH_SEQ from the TRANSACTION_HEADERS table
        const query = `
            SELECT MAX(PAYINF_SERIAL) AS MAX_PAYINF
            FROM TRANSACTION_PAYMENTS
        `;

        // Execute the query
        const result = await connection.execute(query);

        // Extract the maximum TH_SEQ from the result
        const PAYINF = result.rows.length > 0 ? result.rows[0][0] : null;

        // Send the maximum TH_SEQ as a JSON response
        res.status(200).json({ PAYINF });

    } catch (error) {
        console.error('Error fetching maximum TPAY:', error);
        res.status(500).json({ error: 'Error fetching maximum TPAY' });
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
// app.get('/api/getMaxTransactionHeaderSerial', async (req, res) => {
//     let connection;

//     try {
//         const strCode = req.query.strCode;
//         const comNo = req.query.comNo;

//         if (!strCode || !comNo) {
//             return res.status(400).json({ error: 'STR_CODE and COM_NO must be provided' });
//         }

//         const currentYear = new Date().getFullYear();
        
//         connection = await oracledb.getConnection();

//         // Step 1: Fetch MAX_TRANSACTIONHEADER_SERIAL
//         const maxSerialQuery = `
//             SELECT MAX(TRANSHEAD_SERIAL) AS MAX_TRANSACTIONHEADER_SERIAL
//             FROM TRANSACTION_HEADERS
//             WHERE TRANSHEAD_YEAR = :currentYear
//               AND STR_CODE = :strCode
//               AND COM_NO = :comNo
//         `;

//         const maxSerialResult = await connection.execute(maxSerialQuery, {
//             currentYear: currentYear,
//             strCode: strCode,
//             comNo: comNo
//         });

//         const maxTransactionHeaderSerial = maxSerialResult.rows.length > 0 ? maxSerialResult.rows[0][0] : null;

//         // Step 2: Fetch BANK_ACC_NO from STORES table
//         const bankAccNoQuery = `
//             SELECT BANK_ACC_NO
//             FROM STORES
//             WHERE COM_NO = :comNo
//               AND STR_CODE = :strCode
//         `;

//         const bankAccNoResult = await connection.execute(bankAccNoQuery, {
//             comNo: comNo,
//             strCode: strCode
//         });

//         const bankAccNo = bankAccNoResult.rows.length > 0 ? bankAccNoResult.rows[0][0] : null;

//         if (!bankAccNo) {
//             return res.status(404).json({ error: 'Bank account number not found' });
//         }

//         // Step 3: Fetch BANKCODE from COMPANY_BANKS table
//         const bankCodeQuery = `
//             SELECT BANK_CODE
//             FROM COMPANY_BANKS
//             WHERE ACC_NO = :bankAccNo
//         `;

//         const bankCodeResult = await connection.execute(bankCodeQuery, {
//             bankAccNo: bankAccNo
//         });

//         const bankCodes = bankCodeResult.rows.map(row => row[0]);

//         if (bankCodes.length === 0) {
//             return res.status(404).json({ error: 'Bank codes not found' });
//         }

//         // Fetch the first bank code
//         const singleBankCode = bankCodes[0];

//         // Step 4: Fetch bank details from BANKS table where NAME-A is 'CREDIT_CARD'
//         const bankDetailsQuery = `
//             SELECT BANK_CODE, NAME_A
//             FROM BANKS
//             WHERE NAME_A = 'CREDIT_CARD'
//               AND BANK_CODE = :bankCode
//         `;

//         const bankDetailsResult = await connection.execute(bankDetailsQuery, {
//             bankCode: singleBankCode
//         });

//         const bankDetails = bankDetailsResult.rows.length > 0 ? {
//             bankCode: bankDetailsResult.rows[0][0],
//             bankName: bankDetailsResult.rows[0][1]
//         } : null;

//         res.status(200).json({
//             maxTransactionHeaderSerial,
//             bankCode: singleBankCode, // Send a single bankCode
//             bankDetails
//         });

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Error processing request' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

app.get('/api/getMaxTransactionHeaderSerial', async (req, res) => {
    let connection;

    try {
        const strCode = req.query.strCode;
        const comNo = req.query.comNo;

        if (!strCode || !comNo) {
            return res.status(400).json({ error: 'STR_CODE and COM_NO must be provided' });
        }

        const currentYear = new Date().getFullYear();
        
        connection = await oracledb.getConnection();

        // Step 1: Fetch MAX_TRANSACTIONHEADER_SERIAL and add 1
        const maxSerialQuery = `
            SELECT MAX(TRANSHEAD_SERIAL) AS MAX_TRANSACTIONHEADER_SERIAL
            FROM TRANSACTION_HEADERS
            WHERE TRANSHEAD_YEAR = :currentYear
              AND STR_CODE = :strCode
              AND COM_NO = :comNo
        `;

        const maxSerialResult = await connection.execute(maxSerialQuery, {
            currentYear: currentYear,
            strCode: strCode,
            comNo: comNo
        });

        const maxTransactionHeaderSerial = maxSerialResult.rows.length > 0 && maxSerialResult.rows[0][0] !== null
            ? maxSerialResult.rows[0][0] + 1 // Add 1 to the maximum value
            : 1; // Default to 1 if no rows are found

        // Step 2: Fetch BANK_ACC_NO from STORES table
        const bankAccNoQuery = `
            SELECT BANK_ACC_NO
            FROM STORES
            WHERE COM_NO = :comNo
              AND STR_CODE = :strCode
        `;

        const bankAccNoResult = await connection.execute(bankAccNoQuery, {
            comNo: comNo,
            strCode: strCode
        });

        const bankAccNo = bankAccNoResult.rows.length > 0 ? bankAccNoResult.rows[0][0] : null;

        if (!bankAccNo) {
            return res.status(404).json({ error: 'Bank account number not found' });
        }

        // Step 3: Fetch BANKCODE from COMPANY_BANKS table
        const bankCodeQuery = `
            SELECT BANK_CODE
            FROM COMPANY_BANKS
            WHERE ACC_NO = :bankAccNo
        `;

        const bankCodeResult = await connection.execute(bankCodeQuery, {
            bankAccNo: bankAccNo
        });

        const bankCodes = bankCodeResult.rows.map(row => row[0]);

        if (bankCodes.length === 0) {
            return res.status(404).json({ error: 'Bank codes not found' });
        }

        // Fetch the first bank code
        const singleBankCode = bankCodes[0];

        // Step 4: Fetch bank details from BANKS table where NAME_A is 'CREDIT_CARD'
        const bankDetailsQuery = `
            SELECT BANK_CODE, NAME_A
            FROM BANKS
            WHERE NAME_A = 'CREDIT_CARD'
              AND BANK_CODE = :bankCode
        `;

        const bankDetailsResult = await connection.execute(bankDetailsQuery, {
            bankCode: singleBankCode
        });

        const bankDetails = bankDetailsResult.rows.length > 0 ? {
            bankCode: bankDetailsResult.rows[0][0],
            bankName: bankDetailsResult.rows[0][1]
        } : null;

        res.status(200).json({
            maxTransactionHeaderSerial, // Return the incremented value
            bankCode: singleBankCode,    // Send a single bankCode
            bankDetails
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing request' });
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




app.get('/api/customers/:patientId', async (req, res) => {
    let connection;

    try {
        const patientId = req.params.patientId;
        console.log('Received Patient ID:', patientId);

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID must be provided' });
        }

        connection = await oracledb.getConnection();

        // Step 1: Retrieve the insurance name from the CUSTOMERS table
        const insuranceQuery = `
            SELECT INSURANCE
            FROM CUSTOMERS
            WHERE CUST_ID = :patientId
        `;

        console.log('Executing insurance query:', insuranceQuery);

        const insuranceResult = await connection.execute(insuranceQuery, {
            patientId: patientId
        });

        console.log('Insurance query result:', insuranceResult);

        // Extract the insurance name properly
        const insuranceName = insuranceResult.rows.length > 0 ? insuranceResult.rows[0][0] : null;
        console.log('Extracted Insurance Name:', insuranceName);

        if (!insuranceName) {
            return res.status(404).json({ message: 'Insurance not found for the provided patient ID' });
        }

        // Step 2: Fetch the bank code from the BANKS table where NAME_E equals the insurance name
        const bankQuery = `
            SELECT BANK_CODE
            FROM BANKS
            WHERE NAME_E = :insuranceName
        `;

        console.log('Executing bank query:', bankQuery);

        const bankResult = await connection.execute(bankQuery, {
            insuranceName: insuranceName
        });

        console.log('Bank query result:', bankResult);

        // Extract the bank code properly
        const bankCode = bankResult.rows.length > 0 ? bankResult.rows[0][0] : null;
        console.log('Extracted Bank Code:', bankCode);

        if (!bankCode) {
            return res.status(404).json({ message: 'Bank code not found for the provided insurance name' });
        }

        // Step 3: Fetch the account number from the COMPANY_BANKS table where BANK_CODE equals the bank code
        const accnoQuery = `
            SELECT ACC_NO
            FROM COMPANY_BANKS
            WHERE BANK_CODE = :bankCode
        `;

        console.log('Executing account number query:', accnoQuery);

        const accnoResult = await connection.execute(accnoQuery, {
            bankCode: bankCode
        });

        console.log('Account number query result:', accnoResult);

        // Extract the account number properly
        const accno = accnoResult.rows.length > 0 ? accnoResult.rows[0][0] : null;
        console.log('Extracted Account Number:', accno);

        if (accno) {
            res.status(200).json({ insuranceName, bankCode, accno });
        } else {
            res.status(404).json({ message: 'Account number not found for the provided bank code' });
        }

    } catch (error) {
        console.error('Error fetching insurance name, bank code, and account number:', error);
        res.status(500).json({ error: 'Error fetching insurance name, bank code, and account number' });
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







app.post('/api/BillingData', async (req, res) => {
    let connection;

    try {
        // Extract data from request body
        const { 
            newSessionNo,
            maxTHSEQ,
            maxTransactionHeaderSerial,
            username,
            com_no,
            strcode,
            CUST_ID,  // Add this line
            visitid,
            patientName,
            fileNo,
            doctor,
            billingData,
            paymentData,
            totalBill,
            totalDiscount,
            netBill,
            totalPayment,
            totalDiscountPercentage,
            newTL,
            newTPAY,
            newINF ,
            codeins,
            acc,
            ccode,
            QC,
            QY,
            QS
        } = req.body;
        let newTLI = req.body.newTL;
        let newTPAYI=req.body.newTPAY;
        let newINFI=req.body.newINF;
        
        console.log('got results',QC,QY,QS)
        // Calculate the incremented session number
        const incrementedSessionNo = Number(newSessionNo) + 1;

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();
         console.log( totalDiscountPercentage )
         console.log(newTL,'NEWTILMAX +PLUS')
         console.log(paymentData,'paymentdata')
         const PCAHS=paymentData.cash.amount;
         console.log(PCAHS,'PAYMET BY CASH')
         console.log(totalPayment,'total payment sum of all')
        // Get current date and time
        const currentDateTime = new Date();
        const formattedCurrentDateTime = formatDateTime(currentDateTime);
        console.log(formattedCurrentDateTime)
        const formattedCurrentDate = formattedCurrentDateTime.split(' ')[0];
        console.log(formattedCurrentDate) // Extract just the date part
        const formattedCurrentTime = formatTime(currentDateTime); 
        console.log(formattedCurrentTime)// HH:MI:SS AM/PM

        // Fetch START_AT and END_AT from STORE_SHIFTS table based on str_code where ACTIVE = 'Y'
        const shiftQuery = `
            SELECT START_AT, END_AT
            FROM STORE_SHIFTS
            WHERE STR_CODE = :strcode
              AND ACTIVE = 'Y'
        `;
        const shiftResult = await connection.execute(shiftQuery, [strcode]);

        if (shiftResult.rows.length === 0) {
            return res.status(404).json({
                message: 'No active shift found for the provided str_code.'
            });
        }

        const [startAt, endAt] = shiftResult.rows[0];

        // Format START_AT and END_AT to extract time parts
        const formattedStartTime = formatDateTime(startAt); // HH:MI:SS AM/PM
        console.log(formattedStartTime)
        const formattedEndTime = formatDateTime(endAt); 
        console.log(formattedEndTime)// HH:MI:SS AM/PM
        
        // Check if there is an existing open session for this str_code and current date
        const existingSessionQuery = `
            SELECT SESSION_NO, OPEN_DAT, SHIFT_START_AT, SHIFT_END_AT
            FROM STORE_USER_CLOSINGS
            WHERE STR_CODE = :strcode
              AND SESSION_CLOSED = 'O'
            
              AND TO_CHAR(SYSDATE, 'HH24:MI:SS') BETWEEN TO_CHAR(SHIFT_START_AT, 'HH24:MI:SS') 
              AND TO_CHAR(SHIFT_END_AT, 'HH24:MI:SS')
        `;
        const existingSessionResult = await connection.execute(existingSessionQuery, {
            strcode
        });

        if (existingSessionResult.rows.length > 0) {
            // console.log('Checking existing session');
            // Fetch existing session details
            const [existingSessionNo, openDat, existingStartAt, existingEndAt] = existingSessionResult.rows[0];
            const existSt=formatDateTime(existingStartAt)
            const existen=formatDateTime(existingEndAt)
            const open=formatDateTime(openDat)
            console.log(existSt)
            console.log(existen)
            console.log(open)

            // Close the existing session by adding a new record with SESSION_CLOSED as 'C'
            const insertClosedSessionQuery = `
                INSERT INTO STORE_USER_CLOSINGS (
                    SESSION_NO,
                    CLOSED_BY, 
                    USRINFO_USERNAME, 
                    COM_NO, 
                    STR_CODE, 
                    SHIFT_START_AT, 
                    SHIFT_END_AT, 
                    OPEN_DAT,
                    AMOUNT_SOLD,
                    AMOUNT_COUNTED,
                    SESSION_CLOSED,
                    CLOSED_DAT
                ) VALUES (
                    : newSessionNo, 
                    :username,
                    :username, 
                    :com_no, 
                    :strcode, 
                    TO_DATE(:existSt, 'MM/DD/YYYY HH:MI:SS AM'),
                    TO_DATE(:existen, 'MM/DD/YYYY HH:MI:SS AM'),
                    
                    TO_DATE(:openDateTime, 'MM/DD/YYYY HH:MI:SS AM'),
                    0,
                    0,
                    'C',
                    TO_DATE(:currentDateTime, 'MM/DD/YYYY HH:MI:SS AM')
                )
            `;
            await connection.execute(insertClosedSessionQuery, {
                newSessionNo,
                username, // Use incremented session number
                username,
                com_no,
                strcode,
                existSt,
                existen,
                openDateTime: formattedCurrentDateTime,
                currentDateTime: formattedCurrentDateTime
            });

            console.log('Existing session closed and recorded:', existingSessionNo);
        }

        // Insert the new record into STORE_USER_CLOSINGS with SESSION_CLOSED as 'O'
        const insertNewSessionQuery = `
            INSERT INTO STORE_USER_CLOSINGS (
                SESSION_NO, 
                USRINFO_USERNAME, 
                COM_NO, 
                STR_CODE, 
                SHIFT_START_AT, 
                SHIFT_END_AT, 
                OPEN_DAT,
                AMOUNT_SOLD,
                AMOUNT_COUNTED,
                SESSION_CLOSED
            ) VALUES (
                :incrementedSessionNo, 
                :username, 
                :com_no, 
                :strcode, 
                TO_DATE(:startAt, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(:endAt, 'MM/DD/YYYY HH:MI:SS AM'),
                TO_DATE(:openDateTime, 'MM/DD/YYYY HH:MI:SS AM'),
                0,
                0,
                'O'
            )
        `;
        await connection.execute(insertNewSessionQuery, {
            incrementedSessionNo, // Use incremented session number
            username,
            com_no,
            strcode,
            startAt: formattedStartTime,
            endAt: formattedEndTime,
            openDateTime: formattedCurrentDateTime
        });
        const currentYear = new Date().getFullYear();
        const issuedFor = `${fileNo} - ${patientName}`;
        console.log('total bill adding to headers table ',totalBill)
        // Ensure these are numbers
const totalAmount = parseFloat(totalBill);
const totalPaid = parseFloat(totalPayment);

// Calculate CREDIT_AMOUNT
const creditAmount = totalAmount - totalPaid;

// Determine PAYMENT_TYPE and PAYMENT_METHOD
const paymentType = creditAmount > 0 ? 'CR' : 'CA'; // 'CR' for Credit, 'CA' for Cash
const paymentMethod = creditAmount > 0 ? 'CR' : 'CA'; // 'Credit' if there's a difference, otherwise 'Cash'

// Insert Query
const insertTransactionHeaderQuery = `
  INSERT INTO TRANSACTION_HEADERS (
      COM_NO,
      STR_CODE,
      TRANSHEAD_SERIAL, 
      TRANSHEAD_YEAR,
      TRANSTYP_CODE,  
      SESSION_NO,
      CURR_CODE,
      CURR_RATE,
      USRINFO_USERNAME,
      TH_SEQ,
      CUST_ID,    
      SALESMAN,
      PATIENT_NAME,
      FILE_NO,
      VISIT_ID,
      ISSUED_FOR,
      COPY_NO,
      TOTAL_AMOUNT,
      TOTAL_PAID,
      DISCOUNT,
      DISCOUNT_PERCENT,
      CREDIT_AMT,
      PAYMENT_TYP,
      PAYMENT_METHOD,
      CREATED_DAT,
       QUOTHEAD_SERIAL,   
      QUOTHEAD_YEAR,     
      QUOT_TRANSTYP_CODE
  ) VALUES (
      :com_no,
      :strcode,
      :maxTransactionHeaderSerial,
      :transheadYear,
      '1',
      :newSessionNo,
      'QR',
      '1',
      :username,
      :maxTHSEQ,
      :CUST_ID,
      :doctor,
      :patientName,
      :fileNo,
      :visitid,
      :issuedFor,
      '1',
      '0',
      '0',
      '0',
      :totalDiscountPercentage,
      :creditAmount,
      :paymentType,
      :paymentMethod,
      TO_DATE(:currentDateTime, 'MM/DD/YYYY HH:MI:SS AM'),
      :quotationSerial,
      :quotationYear,
      :quotationType
  )
`;
const quotationSerial = QS ? QS : null;
const quotationYear = QY ? QY : null;
const quotationType = QC? QC : null;
// Execute query
await connection.execute(insertTransactionHeaderQuery, {
    com_no,
    strcode,
    maxTransactionHeaderSerial,
    transheadYear: currentYear,
    newSessionNo,
    username,
    maxTHSEQ,
    CUST_ID,
    doctor,
    patientName,
    fileNo,
    visitid,
    issuedFor,
   
    totalDiscountPercentage,
    creditAmount,
    paymentType,
    paymentMethod,
    currentDateTime: formattedCurrentDateTime,
    quotationSerial,
    quotationYear,
    quotationType
});

    //     const insertTransactionHeaderQuery = `
    //     INSERT INTO TRANSACTION_HEADERS (        
    //         COM_NO,
    //         STR_CODE,
    //         TRANSHEAD_SERIAL, 
    //         TRANSHEAD_YEAR,
    //         TRANSTYP_CODE,  
    //         SESSION_NO,
    //         CURR_CODE,
    //         CURR_RATE,
    //         USRINFO_USERNAME,
    //         TH_SEQ,
    //         CUST_ID,    
    //         SALESMAN,
    //         PATIENT_NAME,
    //         FILE_NO,
    //         VISIT_ID,
    //         ISSUED_FOR,
    //         COPY_NO,
    //         TOTAL_AMOUNT,
    //         TOTAL_PAID,
    //         DISCOUNT,
    //         DISCOUNT_PERCENT
    //     ) VALUES (
    //      :com_no,
    //         :strcode,
        
    //         :newTrans,
    //          :transheadYear,
           
    //         '1',
    //         :newSessionNo,
    //         'QR',
    //         '1',
    //         :username,
    //         :newTH,
    //         :CUST_ID,
    //         :doctor,
    //         :patientName,
    //         :fileNo,
    //         :visitid,
    //         :issuedFor,
    //         '1',
    //         '0',
    //         '0',
    //         '0',
    //         : totalDiscountPercentage 
                                 
           
                          
           
    //     )
    // `;
    
    // await connection.execute(insertTransactionHeaderQuery, {
       
        
        
    //     com_no,
    //     strcode,
    //     newTrans,
    //     transheadYear: currentYear,
    //     newSessionNo,
    //     username,
    //     newTH,
    //     CUST_ID,
    //     doctor,
    //     patientName,
    //     fileNo,
    //     visitid,
    //     issuedFor,
       
      
    //     totalDiscountPercentage 
        
    // });
    console.log(billingData,'billing data')
    let lineSerial = 1;
    for (const item of billingData) {
        const { serviceCode, uomDescription, quantity, price, discountPercentage,serviceName,discountAmount } = item;
    
        console.log(serviceCode);
        console.log(discountAmount,'AMOUNT DISCOUNT')
    
        // Fetch ITM_CODE using serviceCode
        const fetchServiceDetailsQuery = `
            SELECT ITM_CODE
            FROM ITEMS
            WHERE REF_CODE = :serviceCode
        `;
        const serviceDetailsResult = await connection.execute(fetchServiceDetailsQuery, [serviceCode]);
    
        if (serviceDetailsResult.rows.length === 0) {
            console.log(`Service code ${serviceCode} not found`);
            continue; // Skip this item or handle the error as needed
        }
    
        const [ITEM_CODE] = serviceDetailsResult.rows[0];
        console.log(`Service details for ${serviceCode}:`, { ITEM_CODE });
    
        // Fetch DISTRIB_SERIAL and PRICE from DISTRIBUTION table using ITEM_CODE
        const fetchDistributionDetailsQuery = `
            SELECT DISTRIB_SERIAL, PRICE, COST
            FROM DISTRIBUTIONS
            WHERE ITM_CODE = :itemCode
        `;
        const distributionDetailsResult = await connection.execute(fetchDistributionDetailsQuery, [ITEM_CODE]);
    
        if (distributionDetailsResult.rows.length === 0) {
            console.log(`Item code ${ITEM_CODE} not found in DISTRIBUTION table`);
           
            continue; // Skip this item or handle the error as needed
        }
    
        const [DISTRIB_SERIAL, DISTRIB_PRICE,COST] = distributionDetailsResult.rows[0];
        console.log(`Distribution details for ${ITEM_CODE}:`, { DISTRIB_SERIAL, DISTRIB_PRICE, COST });
        const currentYear = new Date().getFullYear();
        console.log(`Current year: ${currentYear}`); 
        console.log(newTL,'newtl')// Log the current year
        
    
        // Insert the transaction line with DISTRIB_SERIAL and DISTRIB_PRICE
        const insertTransactionLinesQuery = `
            INSERT INTO TRANSACTION_LINES (
                
                
                COM_NO,
                STR_CODE ,
                TRANSTYP_CODE,
                 TRANSHEAD_YEAR,
                 TRANSHEAD_SERIAL,
                 TRANSLINE_SERIAL, 
                 COM_NO_FOR,
                STR_CODE_FOR,
                ITM_CODE,
                DISTRIB_SERIAL,
                UOM_CODE,
                UOM_CODE_FOR,
                QTY,
                UOM_QTY,
                COST,
                PRICE,
                USRINFO_USERNAME,
                DUOM_COST,
                DUOM_PRICE,
                TH_SEQ,
                TL_SEQ,
                ITM_FOREIGN_DESC,
                DISCOUNT_PERCENT,
                DISCOUNT    

              
               
               
            ) VALUES (
                
                :com_no, 
                :strcode,
                '1',
                :transheadYear,
                :maxTransactionHeaderSerial,
                 :lineSerial,
                :com_no,
                :strcode,
            :itemCode,
                :distribSerial,
                'PC',
             'PC',
                '1',
                '1',
                 :cost,
                :pricep,
                :username,
                :cost,
                :pricep,
                :maxTHSEQ,
                :newTLI,
                 :serviceName,
                 :discountPercentage,
                 :discountAmount
 
               

                
            )
        `;
    
        await connection.execute(insertTransactionLinesQuery, {
           
         
            com_no,//1
            strcode, //2
            transheadYear: currentYear,//4
            maxTransactionHeaderSerial,//5
            lineSerial,//6
            com_no,//7
            strcode,//8
            itemCode: ITEM_CODE,//9
            distribSerial: DISTRIB_SERIAL,//10
            cost: COST,//15
            pricep: DISTRIB_PRICE, //16
            username, //17
            cost: COST,
            pricep: DISTRIB_PRICE,
            maxTHSEQ,
            newTLI,
            serviceName,
            discountPercentage,
            discountAmount 

            


          
        });
    
       
        lineSerial += 1;
        newTLI +=1;// Increment TL_SEQ
    }



    

 //PAYMENT TABLE   
//     const insertPaymentQuery = `
//     INSERT INTO TRANSACTION_PAYMENTS (
//         TRANSPAY_SERIAL,
//         COM_NO,
//         STR_CODE,
//         TRANSTYP_CODE,
//         TRANSHEAD_YEAR,
//         TYP,
//         PAYMENT_TYP,
       
//         AMOUNT,
        
//         STATUS,
//         USRINFO_USERNAME,
//         TRANSHEAD_SERIAL,
//         TH_SEQ
//     ) VALUES (
//         :newTPAYI,
//         :com_no,
//         :strcode,
//         '1', -- Assuming '1' for TRANSTYP_CODE
//         :transheadYear,
//         'P',
//         :typt,
        
//          :amount,
        
//         'PN',
//         :username,
//         :newTrans,
//          :newTH
//     )
// `;



// // // Loop through each payment type in paymentData

    // Ensure amount is a valid number and greater than 0
    // for (const [key, { type, amount }] of Object.entries(paymentData)) {
    //     if (amount > 0) {
    //         let paymentType = '';
    
    //         // Determine the payment type based on key
    //         if (key === 'creditCard' || key === 'insurance') {
    //             paymentType = 'CC'; // Visa Card and Insurance both use 'CC'
    //         } else if (key === 'cash') {
    //             paymentType = 'CA'; // Cash uses 'CA'
    //         }
    
    //         const values = {
    //                        newTPAYI,          // Payment serial number or relevant value
    //             com_no,
    //             strcode,
    //             transheadYear: currentYear,
    //             typt: paymentType,
    //             // Payment type (CA, CC, IN)
    //             amount,            // Ensure amount is a number
    //                     // Increment as needed
    //             username,
    //             newTrans,
    //             newTH        
    //         };
    
    //         console.log('Inserting Payment:', values);
    
    //         // Execute the query
    //         await connection.execute(insertPaymentQuery, values);
    
    //         // Increment as needed
    //         newTPAYI += 1;
    //     }
    // }
   
    //TRANSACTION PAYMENT TABLE
     
    


    //INFORMATION TABLE
            // const values = {
            //     newTPAYI,          // Payment serial number or relevant value
            //     com_no,
            //     strcode,
            //     transheadYear: currentYear,
            //     typt: paymentType,
            //     // Payment type (CA, CC, IN)
            //     totalPayment,            // Ensure amount is a number
            //             // Increment as needed
            //     username,
            //     newTrans,
            //     newTH           // Ensure username is provided
            // };

            // console.log('Inserting Payment:', values);

            // // Execute the query
            // await connection.execute(insertPaymentQuery, values);

            
         // Variables to track payment types
let hasCreditCard = false;
let hasInsurance = false;

// First pass to determine if we have both credit card and insurance
for (const [key, { type, amount }] of Object.entries(paymentData)) {
    if (type === 'CC' && amount > 0) {
        if (key === 'creditCard') {
            hasCreditCard = true;
        } else if (key === 'insurance') {
            hasInsurance = true;
        }
    }
}
// Start a transaction


// Start a transaction

try {
    for (const [key, { type, amount }] of Object.entries(paymentData)) {
        // Insert into PAYMENT_INFORMATIONS only if type is 'CC' and amount > 0
        if (type === 'CC' && amount > 0) {
            let paymentTypeName = '';
            let bankCode = ''; 

            // Determine the payment type name based on the flags
            if (key === 'creditCard') {
                paymentTypeName = hasInsurance ? 'M' : 'V'; // 'M' if both types are present, otherwise 'V'
            } else if (key === 'insurance') {
                paymentTypeName = 'I'; // 'I' for insurance
            }
             // Determine the BANK_CODE based on paymentTypeName
        if (paymentTypeName === 'I') {
            bankCode = codeins; // Use codeins if paymentTypeName is 'I'
        } else if (paymentTypeName === 'M' || paymentTypeName === 'V') {
            bankCode = ccode; // Use ccode if paymentTypeName is 'M' or 'V'
        }

            // Insert into PAYMENT_INFORMATIONS
            const insertPaymentInformationsQuery = `
                INSERT INTO PAYMENT_INFORMATIONS (
                    PAYINF_SERIAL,  
                    PAYMENT_TYP, 
                    AMOUNT,  
                    BANK_CODE,
                    CUSTOMER_NAME,
                    COM_NO,
                    ACC_NO,
                    USRINFO_USERNAME,
                    CUST_ID,
                    PAYMENT_AMT,
                    TH_SEQ,
                    PAID_AMOUNT,
                    PAID_DISCOUNT,
                    COLLECTION_DAT,
                    PAYMENT_TYP_NAME
                ) VALUES (
                    :newINFI,
                    :type,
                    :amount,
                  :bankCode,
                    :patientName,
                    :com_no,
                    :acc,
                    :username,
                    :fileNo,
                    :totalBill,
                    :maxTHSEQ,
                    :totalPayment,
                    :totalDiscount,
                    TO_DATE(:formattedCurrentDate, 'MM/DD/YYYY'),
                    :paymentTypeName
                )
            `;

            const paymentInfoResult = await connection.execute(insertPaymentInformationsQuery, {
                newINFI,
                type, // Use 'CC'
                amount,
                bankCode,
                patientName,
                com_no,
                acc,
                username,
                fileNo,
                totalBill,
                maxTHSEQ,
                totalPayment,
                totalDiscount,
                formattedCurrentDate,
                paymentTypeName // Set to 'V', 'M', or 'I'
            });

            // Ensure the insertion was successful
            if (paymentInfoResult.rowsAffected === 0) {
                throw new Error('Failed to insert into PAYMENT_INFORMATIONS');
            }

            // Get the inserted serial number (assuming you need it for TRANSACTION_PAYMENTS)
            const insertedINFI = newINFI; // Use the serial you had or retrieve from the result

            // Increment the serial number for PAYMENT_INFORMATIONS
            newINFI += 1;
        }

        // Insert into TRANSACTION_PAYMENTS for all payment types with amount > 0
        if (amount > 0) {
            let paymentType = '';
            let payinfSerial = null;

            // Determine the payment type and whether to include PAYINF_SERIAL
            if (key === 'creditCard' || key === 'insurance') {
                paymentType = 'CC'; // Credit Card and Insurance both use 'CC'
                payinfSerial = newINFI - 1; // Use the last inserted PAYINF_SERIAL from PAYMENT_INFORMATIONS
            } else if (key === 'cash') {
                paymentType = 'CA'; // Cash uses 'CA'
                payinfSerial = null; // Do not include PAYINF_SERIAL for cash
            }

            // Insert into TRANSACTION_PAYMENTS
            const insertPaymentQuery = `
                INSERT INTO TRANSACTION_PAYMENTS (
                    ${payinfSerial !== null ? 'PAYINF_SERIAL,' : ''}
                    TRANSPAY_SERIAL,
                    COM_NO,
                    STR_CODE,
                    TRANSTYP_CODE,
                    TRANSHEAD_YEAR,
                    TYP,
                    PAYMENT_TYP,
                    AMOUNT,
                    STATUS,
                    USRINFO_USERNAME,
                    TRANSHEAD_SERIAL,
                    TH_SEQ
                ) VALUES (
                    ${payinfSerial !== null ? ':payinfSerial,' : ''}
                    :newTPAYI,
                    :com_no,
                    :strcode,
                    '1', -- Assuming '1' for TRANSTYP_CODE
                    :transheadYear,
                    'P',
                    :typt,
                    :amount,
                    'PN',
                    :username,
                    :maxTransactionHeaderSerial,
                    :maxTHSEQ
                )
            `;

            const values = {
                ...(payinfSerial !== null && { payinfSerial: payinfSerial }), // Include PAYINF_SERIAL if applicable
                newTPAYI,          // Payment serial number or relevant value
                com_no,
                strcode,
                transheadYear: currentYear,
                typt: paymentType, // 'CC' or 'CA'
                amount,            // Ensure amount is a number
                username,
                maxTransactionHeaderSerial,
                maxTHSEQ       
            };

            console.log('Inserting Payment:', values);

            // Execute the query
            const paymentResult = await connection.execute(insertPaymentQuery, values);

            // Ensure the insertion was successful
            if (paymentResult.rowsAffected === 0) {
                throw new Error('Failed to insert into TRANSACTION_PAYMENTS');
            }

            // Increment serial numbers for TRANSACTION_PAYMENTS
            newTPAYI += 1;
        }
    }

    // Commit the transaction
    await connection.execute('COMMIT');
} catch (error) {
    // Rollback the transaction in case of error
    await connection.execute('ROLLBACK');
    console.error('Transaction failed:', error);
}

// Determine payment type name based on the presence of both types
// for (const [key, { type, amount }] of Object.entries(paymentData)) {
//     if (type === 'CC' && amount > 0) {
//         let paymentTypeName = '';

//         // Determine the payment type name based on the flags
//         if (key === 'creditCard') {
//             paymentTypeName = hasInsurance ? 'M' : 'V'; // 'M' if both types are present, otherwise 'V'
//         } else if (key === 'insurance') {
//             paymentTypeName = hasCreditCard ? 'I' : 'I'; // 'I' for insurance
//         }

//         // Insert into PAYMENT_INFORMATIONS
//         const insertPaymentInformationsQuery = `
//             INSERT INTO PAYMENT_INFORMATIONS (
//                 PAYINF_SERIAL,  
//                 PAYMENT_TYP, 
//                 AMOUNT,  
//                 BANK_CODE,
//                 CUSTOMER_NAME,
//                 COM_NO,
//                 ACC_NO,
//                 USRINFO_USERNAME,
//                 CUST_ID,
//                 PAYMENT_AMT,
//                 TH_SEQ,
//                 PAID_AMOUNT,
//                 PAID_DISCOUNT,
//                 COLLECTION_DAT,
//                 PAYMENT_TYP_NAME
//             ) VALUES (
//                 :newINFI,
//                 :type,
//                 :amount,
//                 :codeins,
//                 :patientName,
//                 :com_no,
//                 :acc,
//                 :username,
//                 :fileNo,
//                 :totalBill,
//                 :newTH,
//                 :totalPayment,
//                 :totalDiscount,
//                 TO_DATE(:formattedCurrentDate, 'MM/DD/YYYY'),
//                 :paymentTypeName
//             )
//         `;

//         await connection.execute(insertPaymentInformationsQuery, {
//             newINFI,
//             type, // Use 'CC'
//             amount,
//             codeins,
//             patientName,
//             com_no,
//             acc,
//             username,
//             fileNo,
//             totalBill,
//             newTH,
//             totalPayment,
//             totalDiscount,
//             formattedCurrentDate,
//             paymentTypeName // Set to 'V', 'M', or 'I'
//         });

        
      
//     }
//     const insertPaymentQuery = `
//     INSERT INTO TRANSACTION_PAYMENTS (
//         PAYINF_SERIAL,
//         TRANSPAY_SERIAL,
//         COM_NO,
//         STR_CODE,
//         TRANSTYP_CODE,
//         TRANSHEAD_YEAR,
//         TYP,
//         PAYMENT_TYP,
       
//         AMOUNT,
        
//         STATUS,
//         USRINFO_USERNAME,
//         TRANSHEAD_SERIAL,
//         TH_SEQ
//     ) VALUES (
//      :newINFI,
//         :newTPAYI,
//         :com_no,
//         :strcode,
//         '1', -- Assuming '1' for TRANSTYP_CODE
//         :transheadYear,
//         'P',
//         :typt,
        
//          :amount,
        
//         'PN',
//         :username,
//         :newTrans,
//          :newTH
//     )
// `;
// let paymentType = '';
    
// // Determine the payment type based on key
// if (key === 'creditCard' || key === 'insurance') {
//     paymentType = 'CC'; // Visa Card and Insurance both use 'CC'
// } else if (key === 'cash') {
//     paymentType = 'CA'; // Cash uses 'CA'
// }
// const values = {
//     newINFI,
//     newTPAYI,          // Payment serial number or relevant value
// com_no,
// strcode,
// transheadYear: currentYear,
// typt: paymentType,
// // Payment type (CA, CC, IN)
// amount,            // Ensure amount is a number
//  // Increment as needed
// username,
// newTrans,
// newTH        
// };

// console.log('Inserting Payment:', values);

// // Execute the query
// await connection.execute(insertPaymentQuery, values);
//     newINFI += 1;
//     newTPAYI += 1;
// }

            

            
//INFORMATION TABLE

    // Commit the transaction
    await connection.commit();

        // Send success response
        res.status(201).json({
            message: 'Existing session closed and new session opened successfully!',
            newSessionNo: incrementedSessionNo,
            maxTHSEQ,
            maxTransactionHeaderSerial // Return the new session number in the response
        });

    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({
            message: 'Failed to save data',
            error: error.message
        });
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

//FOR INVOICE 
app.get('/api/sores/:strCode/:comNo', async (req, res) => {
    let connection;

    try {
        // Retrieve STR_CODE and COM_NO from request parameters
        const { strCode, comNo } = req.params;
        console.log('STR_CODE:', strCode, 'COM_NO:', comNo);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch NAME_E from SORES table based on STR_CODE and COM_NO
        const soresQuery = `
            SELECT NAME_E
            FROM STORES
            WHERE STR_CODE = :strCode AND COM_NO = :comNo
        `;
        console.log('soresQuery:', soresQuery);

        // Execute the query to fetch NAME_E
        const soresResult = await connection.execute(soresQuery, [strCode, comNo]);
        const soresData = soresResult.rows[0];
        console.log('soresData:', soresData);

        if (!soresData) {
            return res.status(404).json({ error: 'Name not found for the given STR_CODE and COM_NO' });
        }

        // Respond with NAME_E
        res.status(200).json({ NAME_E: soresData[0] });
    } catch (error) {
        console.error('Error fetching SORES data:', error);
        res.status(500).json({ error: 'Error fetching SORES data' });
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


app.get('/api/comp/:comNo', async (req, res) => {
    let connection;

    try {
        // Retrieve COM_NO from request parameters
        const { comNo } = req.params;
        console.log('COM_NO:', comNo);

        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch company details from COMPANIES table based on COM_NO
        const companyQuery = `
            SELECT *
            FROM COMPANIES
            WHERE COM_NO = :comNo
        `;
        console.log('companyQuery:', companyQuery);

        // Execute the query to fetch company details
        const companyResult = await connection.execute(companyQuery, [comNo]);
        const companyData = companyResult.rows[0];
        console.log('companyData:', companyData);

        if (!companyData) {
            return res.status(404).json({ error: 'Company details not found for the given COM_NO' });
        }

        // Format the response as needed
        const formattedCompanyData = {
            Name1E: companyData[20],
            Name1A: companyData[21],
            Name2E: companyData[22],
            Name2A: companyData[23],
            Name3E: companyData[24],
            Name3A: companyData[25],
            Name4E: companyData[26],
            Name4A: companyData[27],
            Name5E: companyData[28],
            Name5A: companyData[29]
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

// Utility functions to format date and time
function formatDateTime(date) {
    // Format: MM/DD/YYYY HH:MI:SS AM/PM
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedHours = hours.toString().padStart(2, '0');
    return `${month}/${day}/${year} ${formattedHours}:${minutes}:${seconds} ${period}`;
}

function formatTime(date) {
    // Format: HH:MI:SS AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${period}`;
}

// const formatDateTime = (date) => {
//     const month = date.getMonth() + 1; // getMonth() returns 0-11
//     const day = date.getDate();
//     const year = date.getFullYear();
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const seconds = date.getSeconds();
    
//     // Determine AM or PM
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const adjustedHours = hours % 12 || 12; // Convert hours to 12-hour format
    
//     // Format numbers with leading zeros if necessary
//     const formattedMonth = month; // No leading zero
//     const formattedDay = day; // No leading zero
//     const formattedHours = String(adjustedHours).padStart(2, '0'); // Leading zero for hours
//     const formattedMinutes = String(minutes).padStart(2, '0'); // Leading zero for minutes
//     const formattedSeconds = String(seconds).padStart(2, '0'); // Leading zero for seconds

//     // Construct the formatted string
//     return `${formattedMonth}/${formattedDay}/${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
// };

// // Usage example
// const currentDateTime = new Date();
// const formattedDateTime = formatDateTime(currentDateTime);
// console.log(formattedDateTime); // Output example: 8/22/2000 9:22:15 AM
// app.post('/api/BillingData', async (req, res) => {
//     let connection;

//     try {
//         // Extract data from request body
//         const { newSessionNo, username, com_no, strcode } = req.body;

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Get current date and time
//         const currentDateTime = new Date();
//         const formattedCurrentDateTime = formatDateTime(currentDateTime);
//         const formattedCurrentDate = formattedCurrentDateTime.split(' ')[0]; // Extract just the date part

//         // Fetch START_AT and END_AT from STORE_SHIFTS table based on str_code where ACTIVE = 'Y'
//         const shiftQuery = `
//             SELECT START_AT, END_AT
//             FROM STORE_SHIFTS
//             WHERE STR_CODE = :strcode
//               AND ACTIVE = 'Y'
//         `;
//         const shiftResult = await connection.execute(shiftQuery, [strcode]);

//         if (shiftResult.rows.length === 0) {
//             return res.status(404).json({
//                 message: 'No active shift found for the provided str_code.'
//             });
//         }

//         const [startAt, endAt] = shiftResult.rows[0];

//         // Format START_AT and END_AT to the required format
//         const formattedStartAt = formatDateTime(startAt);
//         const formattedEndAt = formatDateTime(endAt);

//         // Log formatted values
//         console.log('Formatted START_AT:', formattedStartAt);
//         console.log('Formatted END_AT:', formattedEndAt);
//         console.log('Formatted Current DateTime:', formattedCurrentDateTime);
//         console.log('Username:', username);
//         console.log('Com No:', com_no);
//         console.log('Session No:', newSessionNo);
//         console.log('Str Code:', strcode);

//         // Check if there is an existing open session for this str_code
//         const existingSessionQuery = `
//             SELECT SESSION_NO, OPEN_DAT, SHIFT_START_AT, SHIFT_END_AT
//             FROM STORE_USER_CLOSINGS
//             WHERE STR_CODE = :strcode
//               AND SESSION_CLOSED = 'O'
//               AND TO_DATE(:currentDateTime, 'MM/DD/YYYY HH:MI:SS AM') BETWEEN SHIFT_START_AT AND SHIFT_END_AT
//         `;
//         const existingSessionResult = await connection.execute(existingSessionQuery, {
//             strcode,
//             currentDateTime: formattedCurrentDateTime
//         });

//         if (existingSessionResult.rows.length > 0) {
//             // Close the existing session by adding a new record with SESSION_CLOSED as 'C'
//             const [existingSessionNo, openDat, existingStartAt, existingEndAt] = existingSessionResult.rows[0];

//             const insertClosedSessionQuery = `
//                 INSERT INTO STORE_USER_CLOSINGS (
//                     SESSION_NO, 
//                     USRINFO_USERNAME, 
//                     COM_NO, 
//                     STR_CODE, 
//                     SHIFT_START_AT, 
//                     SHIFT_END_AT, 
//                     OPEN_DAT,
//                     AMOUNT_SOLD,
//                     AMOUNT_COUNTED,
//                     SESSION_CLOSED,
//                     CLOSED_DAT
//                 ) VALUES (
//                     :existingSessionNo, 
//                     :username, 
//                     :com_no, 
//                     :strcode, 
//                     TO_DATE(:existingStartAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                     TO_DATE(:existingEndAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                     TO_DATE(:openDat, 'MM/DD/YYYY'),
//                     0,
//                     0,
//                     'C',
//                     TO_DATE(:currentDateTime, 'MM/DD/YYYY HH:MI:SS AM')
//                 )
//             `;
//             await connection.execute(insertClosedSessionQuery, {
//                 existingSessionNo,
//                 username,
//                 com_no,
//                 strcode,
//                 existingStartAt: formattedStartAt,
//                 existingEndAt: formattedEndAt,
//                 openDat: formattedCurrentDate,
//                 currentDateTime: formattedCurrentDateTime
//             });

//             console.log('Existing session closed and recorded:', existingSessionNo);
//         }

//         // Insert the new record into STORE_USER_CLOSINGS with SESSION_CLOSED as 'O'
//         const insertNewSessionQuery = `
//             INSERT INTO STORE_USER_CLOSINGS (
//                 SESSION_NO, 
//                 USRINFO_USERNAME, 
//                 COM_NO, 
//                 STR_CODE, 
//                 SHIFT_START_AT, 
//                 SHIFT_END_AT, 
//                 OPEN_DAT,
//                 AMOUNT_SOLD,
//                 AMOUNT_COUNTED,
//                 SESSION_CLOSED
//             ) VALUES (
//                 :newSessionNo, 
//                 :username, 
//                 :com_no, 
//                 :strcode, 
//                 TO_DATE(:startAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                 TO_DATE(:endAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                 TO_DATE(:openDateTime, 'MM/DD/YYYY HH:MI:SS AM'),
//                 0,
//                 0,
//                 'O'
//             )
//         `;
//         await connection.execute(insertNewSessionQuery, {
//             newSessionNo,
//             username,
//             com_no,
//             strcode,
//             startAt: formattedStartAt,
//             endAt: formattedEndAt,
//             openDateTime: formattedCurrentDateTime
//         });

//         // Commit the transaction
//         await connection.commit();

//         // Send success response
//         res.status(201).json({
//             message: 'Existing session closed and new session opened successfully!'
//         });

//     } catch (error) {
//         console.error('Error saving data:', error);
//         res.status(500).json({
//             message: 'Failed to save data',
//             error: error.message
//         });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

// app.post('/api/BillingData', async (req, res) => {
//     let connection;

//     try {
//         // Extract data from request body
//         const { newSessionNo, username, com_no, strcode } = req.body;

//         // Establish connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Fetch START_AT and END_AT from stores_shift table based on str_code where ACTIVE = 'Y'
//         const shiftQuery = `
//             SELECT START_AT, END_AT
//             FROM STORE_SHIFTS
//             WHERE STR_CODE = :strcode
//               AND ACTIVE = 'Y'
//         `;
//         const shiftResult = await connection.execute(shiftQuery, [strcode]);

//         // Check if any active shift is found
//         if (shiftResult.rows.length === 0) {
//             return res.status(404).json({
//                 message: 'No active shift found for the provided str_code.'
//             });
//         }

//         const [startAt, endAt] = shiftResult.rows[0];

//         // Format START_AT and END_AT to the required format
//         const formattedStartAt = formatDateTime(startAt);
//         const formattedEndAt = formatDateTime(endAt);

//         // Get current date and time
//         const currentDateTime = new Date();
//         const formattedDateTime = formatDateTime(currentDateTime);

//         // Log formatted values
//         console.log('Formatted START_AT:', formattedStartAt);
//         console.log('Formatted END_AT:', formattedEndAt);
//         console.log('Formatted DateTime:', formattedDateTime);
//         console.log('Username:', username);
//         console.log('Com No:', com_no);
//         console.log('Session No:', newSessionNo);
//         console.log('Str Code:', strcode);

//         // Insert the new record into STORE_USER_CLOSINGS
//         const insertQuery = `
//             INSERT INTO STORE_USER_CLOSINGS (
//                 SESSION_NO, 
//                 USRINFO_USERNAME, 
//                 COM_NO, 
//                 STR_CODE, 
//                 SHIFT_START_AT, 
//                 SHIFT_END_AT, 
//                 OPEN_DAT,
//                 AMOUNT_SOLD,
//                 AMOUNT_COUNTED,
//                 SESSION_CLOSED
//             ) VALUES (
//                 :newSessionNo, 
//                 :username, 
//                 :com_no, 
//                 :strcode, 
//                 TO_DATE(:startAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                 TO_DATE(:endAt, 'MM/DD/YYYY HH:MI:SS AM'),
//                 TO_DATE(:openDateTime, 'MM/DD/YYYY HH:MI:SS AM'),
//                  0,
//                 0,
//                 'O'
//             )
//         `;
        
//         await connection.execute(insertQuery, {
//             newSessionNo,
//             username,
//             com_no,
//             strcode,
//             startAt: formattedStartAt,
//             endAt: formattedEndAt,
//             openDateTime: formattedDateTime
//         });

//         // Commit the transaction
//         await connection.commit();

//         // Send success response
//         res.status(201).json({
//             message: 'Data saved successfully!'
//         });

//     } catch (error) {
//         console.error('Error saving data:', error);
//         res.status(500).json({
//             message: 'Failed to save data',
//             error: error.message
//         });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });






// Helper function to format the date and time


app.get('/api/history', async (req, res) => {
    let connection;
    const {date,fileNo,name} = req.query;//this name must be same as sent in url from api date name
    console.log('date recived',date)
    const dateObj = new Date(date);


    
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
  
  
    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Query to fetch patient IDs, visit IDs, visit hour, visit minute, visit date, and doctor ID with today's visit date and status 'W'
        const patientIdsQuery = `
            SELECT
                PATIENT_NAME,
                FILE_NO,
                LISTAGG(TRANSHEAD_SERIAL, ', ') WITHIN GROUP (ORDER BY TRANSHEAD_SERIAL) AS SERIALS
            FROM
                TRANSACTION_HEADERS
            WHERE
                TO_CHAR(CREATED_DAT, 'MM/DD/YYYY') = :today 
            GROUP BY
                PATIENT_NAME,
                FILE_NO
        `;

        // Execute the query to get patient IDs and visit details
        const patientIdsResult = await connection.execute(patientIdsQuery, {
            today: formattedToday
        });

        // Log the query result for debugging
        const rows = patientIdsResult.rows;

        // Log the rows for debugging
        console.log('Rows extracted:', rows);

        // Extract specific columns into variables
        const result = rows.map(row => ({
            name: row[0],
            fileNo: row[1],
            serial: row[2]
        }));

        // Log the result for debugging
        console.log('Processed result:', result);

        // Send the result back to the client
        res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients' });
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
app.get('/api/transaction-headers', async (req, res) => {

    let connection;

    const {fileNo,serial}=req.query;
     console.log(fileNo)
    
    if (!fileNo) {
        return res.status(400).json({ error: 'fileNo is required' });
    }

    try {
        connection = await oracledb.getConnection();

        // Query to fetch transaction headers
        const query = `
            SELECT COM_NO, STR_CODE, CREATED_DAT, CUST_ID, SALESMAN, USRINFO_USERNAME, TH_SEQ, TOTAL_AMOUNT, DISCOUNT, TRANSHEAD_SERIAL, CREDIT_AMT
            FROM TRANSACTION_HEADERS
            WHERE CUST_ID = :fileNo
            ${serial ? 'AND TRANSHEAD_SERIAL = :serial' : ''}
        `;

        const binds = {
            fileNo: fileNo,
            serial: serial
        };

        const options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        // Execute the query to fetch transaction headers
        const result = await connection.execute(query, binds, options);
        const reportData = result.rows;

        // Collect COM_NO, TH_SEQ, TRANSHEAD_SERIAL, and CUST_ID values
        const comNos = reportData.map(item => item.COM_NO);
        const thSeqs = reportData.map(item => item.TH_SEQ);
        const transHeadSerials = reportData.map(item => item.TRANSHEAD_SERIAL);
        const custIds = [...new Set(reportData.map(item => item.CUST_ID))]; // Unique CUST_ID values

        console.log('TH_SEQs:', thSeqs);
        console.log('TRANSHEAD_SERIALs:', transHeadSerials);

        // Fetch transaction lines details if there are TH_SEQ and TRANSHEAD_SERIAL values
        let transactionLines = [];
        if (thSeqs.length > 0 && transHeadSerials.length > 0) {
            const transactionLinesQuery = `
                SELECT TH_SEQ, TRANSHEAD_SERIAL, ITM_CODE, UOM_QTY, DISCOUNT_PERCENT, ITM_FOREIGN_DESC, PRICE
                FROM TRANSACTION_LINES
                WHERE TH_SEQ IN (${thSeqs.map((_, index) => `:thSeq${index}`).join(', ')})
                AND TRANSHEAD_SERIAL IN (${transHeadSerials.map((_, index) => `:transHeadSerial${index}`).join(', ')})
            `;

            const transactionLinesBinds = {
                ...thSeqs.reduce((acc, thSeq, index) => {
                    acc[`thSeq${index}`] = thSeq;
                    return acc;
                }, {}),
                ...transHeadSerials.reduce((acc, transHeadSerial, index) => {
                    acc[`transHeadSerial${index}`] = transHeadSerial;
                    return acc;
                }, {})
            };

            console.log('Transaction Lines Query:', transactionLinesQuery);
            console.log('Transaction Lines Binds:', transactionLinesBinds);

            const transactionLinesResult = await connection.execute(transactionLinesQuery, transactionLinesBinds);
            transactionLines = transactionLinesResult.rows;

            console.log('Transaction Lines Result:', transactionLines);
        }

        const itmCodes = [...new Set(transactionLines.map(line => line[2]))].filter(code => code); // ITM_CODE is at index 2

        console.log('ITM Codes:', itmCodes);

        let itemDetails = {};
        if (itmCodes.length > 0) {
            const itemsQuery = `
                SELECT ITM_CODE, REF_CODE
                FROM ITEMS
                WHERE ITM_CODE IN (${itmCodes.map((_, index) => `:itmCode${index}`).join(', ')})
            `;

            const itemsBinds = itmCodes.reduce((acc, itmCode, index) => {
                acc[`itmCode${index}`] = itmCode;
                return acc;
            }, {});

            console.log('Items Query:', itemsQuery);
            console.log('Items Binds:', itemsBinds);

            const itemsResult = await connection.execute(itemsQuery, itemsBinds, options);
            itemDetails = itemsResult.rows.reduce((acc, item) => {
                acc[item.ITM_CODE] = item.REF_CODE;
                return acc;
            }, {});
        }

        console.log('Item Details:', itemDetails);

        const transactionLinesWithRefCode = transactionLines.map(line => ({
            TH_SEQ: line[0],
            TRANSHEAD_SERIAL: line[1],
            ITM_CODE: line[2],
            UOM_QTY: line[3],
            DISCOUNT_PERCENT: line[4],
            ITM_FOREIGN_DESC: line[5],
            PRICE: line[6],
            REF_CODE: itemDetails[line[2]] || null
        }));
        const custId = reportData.length > 0 ? reportData[0].CUST_ID : null;

     
        let insuranceDetails = {};
        if (custIds) {
            const customerQuery = `
                SELECT CUST_ID, INSURANCE, NAME_E
                FROM CUSTOMERS
                 WHERE CUST_ID = :custId
            `;

            const customerBinds = { custId: custId };

            const customerResult = await connection.execute(customerQuery, customerBinds, options);
            const customerData = customerResult.rows;

            // Assuming insurance details is a single value
            if (customerData.length > 0) {
                const customer = customerData[0];
                insuranceDetails = {
                    INSURANCE: customer.INSURANCE,
                    NAME_E: customer.NAME_E
                };
            }
        }

        console.log('Insurance Details:', insuranceDetails); // Check this output


        let companyDetails = [];
        if (comNos.length > 0) {
            const companyQuery = `
                SELECT * FROM COMPANIES
                WHERE COM_NO IN (${comNos.map((_, index) => `:comNo${index}`).join(', ')})
            `;

            const companyBinds = comNos.reduce((acc, comNo, index) => {
                acc[`comNo${index}`] = comNo;
                return acc;
            }, {});

            console.log('Company Query:', companyQuery);
            console.log('Company Binds:', companyBinds);

            const companyResult = await connection.execute(companyQuery, companyBinds);
            const companyData = companyResult.rows;

            companyDetails = companyData.map(company => ({
                Name1E: company[20],
                Name1A: company[21],
                Name2E: company[22],
                Name2A: company[23],
                Name3E: company[24],
                Name3A: company[25],
                Name4E: company[26],
                Name4A: company[27],
                Name5E: company[28],
                Name5A: company[29]
            }));
        }

        // Initialize payment amounts
        let cashAmount = 0;
        let visaAmount = 0;
        let insuranceAmount = 0;

        if (thSeqs.length > 0) {
            // Query payments
            const paymentQuery = `
                SELECT TH_SEQ, PAYMENT_TYP, AMOUNT
                FROM TRANSACTION_PAYMENTS
                WHERE TH_SEQ IN (${thSeqs.map((_, index) => `:thSeq${index}`).join(', ')})
            `;

            const paymentBinds = thSeqs.reduce((acc, thSeq, index) => {
                acc[`thSeq${index}`] = thSeq;
                return acc;
            }, {});

            console.log('Payment Query:', paymentQuery);
            console.log('Payment Binds:', paymentBinds);

            const paymentResult = await connection.execute(paymentQuery, paymentBinds, options);
            const payments = paymentResult.rows;

            payments.forEach(payment => {
                if (payment.PAYMENT_TYP === 'CA') {
                    cashAmount += payment.AMOUNT;
                }
            });

            // Query transaction information
            const transactionInfoQuery = `
                SELECT TH_SEQ, PAYMENT_TYP_NAME, AMOUNT
                FROM PAYMENT_INFORMATIONS
                WHERE TH_SEQ IN (${thSeqs.map((_, index) => `:thSeq${index}`).join(', ')})
            `;

            const transactionInfoBinds = thSeqs.reduce((acc, thSeq, index) => {
                acc[`thSeq${index}`] = thSeq;
                return acc;
            }, {});

            console.log('Transaction Information Query:', transactionInfoQuery);
            console.log('Transaction Information Binds:', transactionInfoBinds);

            const transactionInfoResult = await connection.execute(transactionInfoQuery, transactionInfoBinds, options);
            const transactionInfos = transactionInfoResult.rows;

            transactionInfos.forEach(info => {
                if (info.PAYMENT_TYP_NAME === 'I') {
                    insuranceAmount += info.AMOUNT;
                } else if (info.PAYMENT_TYP_NAME === 'M' || info.PAYMENT_TYPE_NAME === 'V') {
                    visaAmount += info.AMOUNT;
                }
            });
        }

        // Prepare response data
        const totalAmount = reportData.length > 0 ? reportData[0].TOTAL_AMOUNT : 0;
        const totalDiscountp = reportData.length > 0 ? reportData[0].DISCOUNT : 0;
        const patientCashPay = reportData.length > 0 ? reportData[0].CASH_PAY : 0;
        const patientCardPay = reportData.length > 0 ? reportData[0].CARD_PAY : 0;
        const insuranceShareBalance = reportData.length > 0 ? reportData[0].INSURANCE_SHARE : 0;
        const DOCTOR_ID = reportData.length > 0 ? reportData[0].SALESMAN : '';
        const username = reportData.length > 0 ? reportData[0].USRINFO_USERNAME : '';
        const PAT_ID = reportData.length > 0 ? reportData[0].CUST_ID : '';
        const newTH = reportData.length > 0 ? reportData.map(item => item.TH_SEQ) : [];
        const newTrans = reportData.length > 0 ? reportData.map(item => item.TRANSHEAD_SERIAL) : [];
        const date = reportData.length > 0 ? reportData[0].CREATED_DAT : [];
        const balance = reportData.length > 0 ? reportData[0].CREDIT_AMT : '';

        res.status(200).json({
            reportData,
            totalAmount,
            totalDiscountp,
            patientCashPay,
            patientCardPay,
            insuranceShareBalance,
            DOCTOR_ID,
            username,
            PAT_ID,
            newTH,
            newTrans,
            date,
            balance,
            insuranceDetails,
            companyDetails,
            transactionLines: transactionLinesWithRefCode,
            cashAmount, // Include credit card amount
            visaAmount, // Include visa cash amount
            insuranceAmount // Include insurance cash amount
        });

    } catch (error) {
        console.error('Error executing Oracle query:', error);
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


app.get('/api/user/lab', async (req, res) => {
    const { username } = req.query; // Get username from query parameters

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    let connection;
    try {
        connection = await oracledb.getConnection();
        
        // Updated query to include additional conditions
        const result = await connection.execute(
            `SELECT USRINFO_USERNAME, TYPE, ACTIVE, SPECIALTY 
             FROM USERS_INFORMATION 
             WHERE USRINFO_USERNAME = :username`,
            { username },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Check conditions: active is 'Y', type is 'D', and specialty is 'Laboratory medicine'
        const isAuthorized = (user.ACTIVE === 'Y' && user.TYPE === 'D' && user.SPECIALTY === 'Laboratory medicine') ? 'Y' : '';

        return res.status(200).json({ 
     
            isAuthorized 
        });

    } catch (error) {
        console.error('Error executing Oracle query:', error);
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




app.get('/api/user/details', async (req, res) => {
    const { username } = req.query; // Get username from query parameters

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT USRINFO_USERNAME, TYPE FROM USERS_INFORMATION WHERE USRINFO_USERNAME = :username`,
            { username },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.status(200).json({ username: user.USRINFO_USERNAME, userType: user.TYPE });
    } catch (error) {
        console.error('Error executing Oracle query:', error);
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
app.get('/api/max-hst-id', async (req, res) => {
    let connection;

    try {
        // Obtain a connection to Oracle Database
        connection = await oracledb.getConnection();

        // Construct query to fetch maximum HST_ID
        const query = `
            SELECT MAX(HST_ID) AS MAX_HST_ID
            FROM CLNC_PAT_HISTORY
        `;

        // Execute the query
        const result = await connection.execute(query, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT // Format result as an object
        });

        // Extract the maximum HST_ID
        const maxHstId = result.rows[0].MAX_HST_ID;

        // Respond with the maximum HST_ID
        res.status(200).json({ maxHstId });
    } catch (error) {
        console.error('Error fetching maximum HST_ID:', error);
        res.status(500).json({ error: 'Error fetching maximum HST_ID' });
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
app.post('/api/save-form-details', async (req, res) => {
    const dateObj = new Date();
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

    const {
        hstId, patId,visitId, username, chiefComplaints, historyPresentIllness, presentMedication, 
        pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations, 
        healthInfoFamily, childhoodDiseases,

        // Additional form data
        pregnant, lactating, previousSurgeries, bloodDisorders, cardiacProblem, respiratoryProblems,
        endocrineProblem, pregnancyTrimester,
        prevExtraction, prevRestoration, prevOrtho,
        prostheticType, prostheticDuration, prostheticClinic, clinicExamination, oralHygiene,
        checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, checkbox6, checkbox7, checkbox8,
        checkbox9, checkbox10, checkbox11, checkbox12, checkbox13, checkbox14, checkbox15, checkbox16,
        checkbox17, checkbox18, checkbox19, checkbox20, checkbox21, checkbox22, checkbox23, checkbox24,
        checkbox25, checkbox26, checkbox27, checkbox28, checkbox29, checkbox30, checkbox31, checkbox32,
        checkboxA, checkboxB, checkboxC, checkboxD, checkboxE, checkboxF, checkboxG, checkboxH, checkboxI, checkboxJ, checkboxK,
        numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility, crowding,
        sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan, radiologicalExamination,
        finalDiagnosis, instruction, followupPlan, referral, patientCooperative,
        prevExtractionClinic, prevRestorationClinic, prevOrthoClinic,
        previousSurgeriesNote, bloodDisordersNote, cardiacProblemNote, respiratoryProblemsNote, endocrineProblemNote,
        diagnosticNotes1, diagnosisNoteCheckbox1,
        diagnosticNotes2, diagnosisNoteCheckbox2,
        diagnosticNotes3, diagnosisNoteCheckbox3,
        diagnosticNotes4, diagnosisNoteCheckbox4,
        therapeuticNotes1, therapeuticNoteCheckbox1,
    therapeuticNotes2, therapeuticNoteCheckbox2,
    therapeuticNotes3, therapeuticNoteCheckbox3,
    therapeuticNotes4, therapeuticNoteCheckbox4,
    followupComplaint,
    followupInvestigationResults,
    followupDiagnosis,
    followupManagement,
    followfollowupPlan,
  

actionPlan, clinicData, followUpPlan,
        icdName1, icdName2, icdName3,
        note1, note2, note3,
        code1, code2, code3





    } = req.body;

    // Set default values for checkboxes if not provided
    const checkboxValues = {};
    for (let i = 1; i <= 32; i++) {
        checkboxValues[`checkbox${i}`] = req.body[`checkbox${i}`] || 'N';
    }
    const checkboxes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    checkboxes.forEach(letter => {
        checkboxValues[`checkbox${letter}`] = req.body[`checkbox${letter}`] || 'N';
    });

    // Log form details for debugging
    console.log(req.body);

    let connection;

    try {
        // Obtain a connection to Oracle Database
        connection = await oracledb.getConnection();
        const specialtyResult = await connection.execute(
            `SELECT SPECIALTY
             FROM USERS_INFORMATION
             WHERE USRINFO_USERNAME = :username`,
            [username],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        const specialty = specialtyResult.rows[0]?.SPECIALTY;
        
        // Fetch the specialty ID based on the fetched specialty
        let specialtyId = null;
        if (specialty) {
            const specialtyIdResult = await connection.execute(
                `SELECT SPECIALTY_ID
                 FROM CLNC_SPECIALTY
                 WHERE SPECIALTY_NAME = :specialty`,
                [specialty],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        
            specialtyId = specialtyIdResult.rows[0]?.SPECIALTY_ID;
        }
        // Prepare the SQL query for inserting details into CLNC_PAT_HISTORY
        const insertDetailsQuery = `
            INSERT INTO CLNC_PAT_HISTORY (
                CREATION_DATE, HST_ID, PAT_ID, CREATED_BY, HISTORY_TYPE, DESCREPTION, SPECIALTY_ID
            ) VALUES (
                TO_DATE(:formattedToday, 'MM/DD/YYYY'),
                :hstId,
                :patId,
                :username,
                :historyType,
                :description,
                :specialtyId
            )
        `;

        console.log('Inserting into database with query:', insertDetailsQuery);

        // Define an array of history types and descriptions
        const historyEntries = [
            { type: 'Chief Complaints', description: chiefComplaints },
            { type: 'History of Present Illness', description: historyPresentIllness },
            { type: 'Present Medication', description: presentMedication },
            { type: 'Past Surgical History', description: pastSurgicalHistory },
            { type: 'Allergies to Medications/Food/Latex/Other', description: allergiesToMedicationsFoodLatexOther },
            { type: 'History of Vaccines/Immunizations', description: historyVaccinesImmunizations },
            { type: 'Health Information/Family', description: healthInfoFamily },
            { type: 'Childhood Diseases', description: childhoodDiseases }
        ];

        // Filter out entries where description is null or an empty string
        const filteredEntries = historyEntries.filter(entry => entry.description != null && entry.description.trim() !== '');

        // Create an array of promises for inserting each valid entry
        const insertPromises = filteredEntries.map(entry => {
            console.log('Inserting entry:', entry); // Log each entry being inserted
            return connection.execute(insertDetailsQuery, {
                formattedToday,
                hstId,
                patId,
                username,
                historyType: entry.type,
                description: entry.description,
                specialtyId : specialtyId
            }, { autoCommit: true });
        });

        console.log('Insert promises:', insertPromises);

        // Execute all insert promises
        await Promise.all(insertPromises);

        // Prepare SQL query for inserting into DENTAL table
        const insertDentalQuery = `
            INSERT INTO CLNC_DENTAL_SHEET (
                PAT_ID,VISIT_ID, CREATION_DATE, PREGNANT, LACTATING, PREV_SURGERIES, BLOOD_DISORDERS,
                CARDIAC_PROBLEMS, RESPIRATORY, ENDOCINE, TRIMESTER,
                PREV_EXTRACTION, PREV_RESTORATION, PREV_ORTHO, ORAC_PROSTHETIC_TYPE, ORAC_PROSTHETIC_DURATION,
                ORAL_HYGINE, NUMBER_TEETH, MISSING_TEETH, FRACTURED_TEETH, FILLED_TEETH, DISCOLORED_TEETH,
                MOBILITY, CROW_SPACE, SINUS_OPENING, SWEELING, PULP_VITALITY, PROGNOSIS, TREATMENT_PLAN,
                FINAL_DIAGNOSIS, INSTRUCTIONS, FOLLOW_UP, REFERAL,
                COOPERATIVE, PREV_EXTRACTION_NOTES, PREV_RESTORATION_NOTES, PREV_ORTHO_NOTES,
                SURGERIES_NOTES, BLOOD_DISORDERS_NOTES, CARDIAC_PROBLEMS_NOTES, RESPIRATORY_NOTES,
                ENDOCINE_NOTE,
                CREATED_BY, SPECIALTY_ID
               
            ) VALUES (
                :patId, :visitId, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :pregnant, :lactating, :previousSurgeries,
                :bloodDisorders, :cardiacProblem, :respiratoryProblems, :endocrineProblem, :pregnancyTrimester,
                :prevExtraction, :prevRestoration, :prevOrtho, :prostheticType, :prostheticDuration,
                :oralHygiene, :numberOfTeeth, :missingTeeth, :fracturedTeeth, :filledTeeth, :discoloredTeeth,
                :mobility, :crowding, :sinusOpening, :swelling, :pulpVitality, :prognosis, :treatmentPlan,
                :finalDiagnosis, :instruction, :followupPlan, :referral, :patientCooperative, :prevExtractionClinic,
                :prevRestorationClinic, :prevOrthoClinic, :previousSurgeriesNote, :bloodDisordersNote,
                :cardiacProblemNote, :respiratoryProblemsNote, :endocrineProblemNote, :username,  :specialtyId
            )
        `;

        console.log('Inserting into DENTAL table with query:', insertDentalQuery);

        // Insert the form details into the DENTAL table
        await connection.execute(insertDentalQuery, {
            patId,visitId, formattedToday, pregnant, lactating, previousSurgeries, bloodDisorders,
            cardiacProblem, respiratoryProblems, endocrineProblem, pregnancyTrimester,
            prevExtraction, prevRestoration, prevOrtho, prostheticType, prostheticDuration,
            oralHygiene, numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility,
            crowding, sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan,
            finalDiagnosis, instruction, followupPlan, referral, patientCooperative, prevExtractionClinic,
            prevRestorationClinic, prevOrthoClinic, previousSurgeriesNote, bloodDisordersNote, cardiacProblemNote,
            respiratoryProblemsNote, endocrineProblemNote, username, specialtyId : specialtyId
        }, { autoCommit: true });

        console.log('Data inserted into DENTAL table successfully.');

        // Prepare SQL query for inserting checkboxes into the new table
        const insertCheckboxesQuery = `
            INSERT INTO CLNC_DENTAL_CARIES (
                PAT_ID, CREATION_DATE, C1, C2, C3, C4, C5,
                C6, C7, C8, C9, C10, C11, C12,
                C13, C14, C15, C16, C17, C18, C19,
                C20, C21, C22, C23, C24, C25, C26,
                C27, C28, C29, C30, C31, C32,
                CA, CB, CC, CD, CE, CF, CG, CH,
                CI, CJ, CK, CREATED_BY
            ) VALUES (
                :patId, TO_DATE(:formattedToday, 'MM/DD/YYYY'),
                :checkbox1, :checkbox2, :checkbox3, :checkbox4, :checkbox5,
                :checkbox6, :checkbox7, :checkbox8, :checkbox9, :checkbox10, :checkbox11, :checkbox12,
                :checkbox13, :checkbox14, :checkbox15, :checkbox16, :checkbox17, :checkbox18, :checkbox19,
                :checkbox20, :checkbox21, :checkbox22, :checkbox23, :checkbox24, :checkbox25, :checkbox26,
                :checkbox27, :checkbox28, :checkbox29, :checkbox30, :checkbox31, :checkbox32,
                :checkboxA, :checkboxB, :checkboxC, :checkboxD, :checkboxE, :checkboxF, :checkboxG, :checkboxH,
                :checkboxI, :checkboxJ, :checkboxK, :username
            )
        `;

        console.log('Inserting into CHECKBOXES table with query:', insertCheckboxesQuery);

        // Insert the checkbox data into the new table
        await connection.execute(insertCheckboxesQuery, {
            patId, formattedToday,
            checkbox1: checkboxValues.checkbox1, checkbox2: checkboxValues.checkbox2,
            checkbox3: checkboxValues.checkbox3, checkbox4: checkboxValues.checkbox4,
            checkbox5: checkboxValues.checkbox5, checkbox6: checkboxValues.checkbox6,
            checkbox7: checkboxValues.checkbox7, checkbox8: checkboxValues.checkbox8,
            checkbox9: checkboxValues.checkbox9, checkbox10: checkboxValues.checkbox10,
            checkbox11: checkboxValues.checkbox11, checkbox12: checkboxValues.checkbox12,
            checkbox13: checkboxValues.checkbox13, checkbox14: checkboxValues.checkbox14,
            checkbox15: checkboxValues.checkbox15, checkbox16: checkboxValues.checkbox16,
            checkbox17: checkboxValues.checkbox17, checkbox18: checkboxValues.checkbox18,
            checkbox19: checkboxValues.checkbox19, checkbox20: checkboxValues.checkbox20,
            checkbox21: checkboxValues.checkbox21, checkbox22: checkboxValues.checkbox22,
            checkbox23: checkboxValues.checkbox23, checkbox24: checkboxValues.checkbox24,
            checkbox25: checkboxValues.checkbox25, checkbox26: checkboxValues.checkbox26,
            checkbox27: checkboxValues.checkbox27, checkbox28: checkboxValues.checkbox28,
            checkbox29: checkboxValues.checkbox29, checkbox30: checkboxValues.checkbox30,
            checkbox31: checkboxValues.checkbox31, checkbox32: checkboxValues.checkbox32,
            checkboxA: checkboxValues.checkboxA, checkboxB: checkboxValues.checkboxB,
            checkboxC: checkboxValues.checkboxC, checkboxD: checkboxValues.checkboxD,
            checkboxE: checkboxValues.checkboxE, checkboxF: checkboxValues.checkboxF,
            checkboxG: checkboxValues.checkboxG, checkboxH: checkboxValues.checkboxH,
            checkboxI: checkboxValues.checkboxI, checkboxJ: checkboxValues.checkboxJ,
            checkboxK: checkboxValues.checkboxK, username
        }, { autoCommit: true });
        const insertDiagnosisQuery = `
        INSERT INTO CLNC_PAT_DIAGNOSIS (
            PAT_ID,VISIT_ID, DESCREPTION, CREATED_BY, CREATION_DATE, STATUS, SPECIALTY_ID
        ) VALUES (
            :patId, :visitId, :description, :createdBy, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :status,  :specialtyId
        )
    `;

    // Array to hold all diagnosis entries
    const diagnosisEntries = [];

    // Check each note and its corresponding checkbox
    const notes = [
        { note: diagnosticNotes1, checkbox: diagnosisNoteCheckbox1 },
        { note: diagnosticNotes2, checkbox: diagnosisNoteCheckbox2 },
        { note: diagnosticNotes3, checkbox: diagnosisNoteCheckbox3 },
        { note: diagnosticNotes4, checkbox: diagnosisNoteCheckbox4 },
    ];

    // Prepare entries to insert based on the notes and checkboxes
    notes.forEach((entry) => {
        const status = entry.checkbox === 'Y' ? 'A' : 'N'; // Set status based on checkbox
        if (entry.note && entry.note.trim() !== '') { // Check if note is not empty
            diagnosisEntries.push({
                patId,
                visitId,
                description: entry.note,
                createdBy: username,
                formattedToday,
                status,
                specialtyId : specialtyId
               
            });
        }
    });

    // Execute insertion for each valid diagnosis entry
    const insertPromisesD = diagnosisEntries.map(diagnosis => {
        return connection.execute(insertDiagnosisQuery, {
            patId: diagnosis.patId,
            visitId: diagnosis.visitId,
            description: diagnosis.description,
            createdBy: diagnosis.createdBy,
            formattedToday: diagnosis.formattedToday,
            status: diagnosis.status,
            specialtyId : diagnosis.specialtyId
            
        }, { autoCommit: true });
    });

    // Execute all insert promises
    await Promise.all(insertPromisesD);











    const insertTherapeuticQuery = `
    INSERT INTO CLNC_PAT_THERAPEUTIC (
        PAT_ID, VISIT_ID, DESCREPTION, CREATED_BY, CREATION_DATE, STATUS, SPECIALTY_ID
    ) VALUES (
        :patId, :visitId, :description, :createdBy, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :status,  :specialtyId
    )
`;

// Array to hold all therapeutic entries
const therapeuticEntries = [];

// Check each therapeutic note and its corresponding checkbox
const therapeuticNotes = [
    { note: therapeuticNotes1, checkbox: therapeuticNoteCheckbox1 },
    { note: therapeuticNotes2, checkbox: therapeuticNoteCheckbox2 },
    { note: therapeuticNotes3, checkbox: therapeuticNoteCheckbox3 },
    { note: therapeuticNotes4, checkbox: therapeuticNoteCheckbox4 },
];

// Prepare entries to insert based on the notes and checkboxes
therapeuticNotes.forEach((entry) => {
    const status = entry.checkbox === 'Y' ? 'Y' : 'N'; // Set status based on checkbox
    if (entry.note && entry.note.trim() !== '') { // Check if note is not empty
        therapeuticEntries.push({
            patId,
            visitId,
            description: entry.note,
            createdBy: username,
            formattedToday,
            status,
            specialtyId : specialtyId
            
        });
    }
});

// Execute insertion for each valid therapeutic entry
const insertPromisesT = therapeuticEntries.map(therapeutic => {
    return connection.execute(insertTherapeuticQuery, {
        patId: therapeutic.patId,
        visitId: therapeutic.visitId,
        description: therapeutic.description,
        createdBy: therapeutic.createdBy,
        formattedToday: therapeutic.formattedToday,
        status: therapeutic.status,
        specialtyId : therapeutic.specialtyId
        
    }, { autoCommit: true });
});

// Execute all insert promises for therapeutic notes
await Promise.all(insertPromisesT);





const insertFollowUpQuery = `
    INSERT INTO CLNC_PAT_FOLLOW_UP (
        PAT_ID, VISIT_ID, CREATED_BY, CREATION_DATE, FOLLOW_UP, DIAGNOSIS, MANAGEMENT_PLAN, INVESTIGATION_RESULTS, COMPLAINT, SPECIALTY_ID
    ) VALUES (
        :patId, :visitId, :createdBy, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :followUp, :diagnosis, :managementPlan, :investigationResults, :complaint, :specialtyId
    )
`;

console.log('Inserting into FOLLOW_UP table with query:', insertFollowUpQuery);

// Execute the insertion for follow-up details
await connection.execute(insertFollowUpQuery, {
    patId,
    visitId,
    createdBy: username,
    formattedToday,
    followUp: followfollowupPlan,
    diagnosis: followupDiagnosis,
    managementPlan: followupManagement,
    investigationResults: followupInvestigationResults,
    complaint: followupComplaint,
    specialtyId
}, { autoCommit: true });

console.log('Data inserted into FOLLOW_UP table successfully.');
        console.log('Data inserted into CHECKBOXES table successfully.');
        const insertManagementPlanQuery = `
            INSERT INTO CLNC_PAT_MANAGEMENT_PLAN (
                PAT_ID, VISIT_ID, CLINICAL_DATA, MANAGEMENT_PLAN,
                FOLLOW_UP, CREATED_BY, CREATION_DATE, SPECIALTY_ID,
                FINAL_DIAG1_CODE, FINAL_DIAG2_CODE, FINAL_DIAG3_CODE,
                FINAL_DIAG1_NAME, FINAL_DIAG2_NAME, FINAL_DIAG3_NAME,
                FINAL_DIAG1_COMMENTS, FINAL_DIAG2_COMMENTS, FINAL_DIAG3_COMMENTS
            ) VALUES (
                :patId, :visitId, :clinicData, :actionPlan,
                :followUpPlan, :username, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :specialtyId,
                :code1, :code2, :code3,
                :icdName1, :icdName2, :icdName3,
                :note1, :note2, :note3
            )
        `;

        // Execute the insertion into the management plan table
        await connection.execute(insertManagementPlanQuery, {
            patId,
            visitId,
            clinicData,
            actionPlan,
            followUpPlan,
            username,
            formattedToday,
            specialtyId, // Assuming specialtyId is already defined in your previous code
            code1,
            code2,
            code3,
            icdName1,
            icdName2,
            icdName3,
            note1,
            note2,
            note3,
        }, { autoCommit: true });

        console.log('Data inserted into MANAGEMENT_PLAN table successfully.');
        // Send success response
        res.status(200).json({ message: 'Form details saved successfully' });
    } catch (error) {
        console.error('Error saving form details:', error);
        res.status(500).json({ message: 'Error saving form details' });
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
app.post('/api/add-prescription', async (req, res) => {
    const dateObj = new Date();
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
    const prescriptions = req.body; // Expecting an array of prescription objects

    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Please provide an array of prescriptions.' });
    }

    let connection;
    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        for (const prescription of prescriptions) {
            const { medicineBrand, dose, repeat, noDays, prescriptionNote, patientId, visitId, createdBy,code } = prescription;
            console.log(code,'codesssssssssssssssssssssssssssssssssssssssssssssssssssssssss')
            // Validate each prescription object
            if (!medicineBrand || !dose || !repeat || !noDays || !patientId || !visitId || !createdBy) {
                return res.status(400).json({ error: 'All fields must be provided.' });
            }

            // Insert each prescription into the database
            const insertQuery = `
                INSERT INTO CLNC_PAT_PRESCRIPTIONS (PAT_ID, VISIT_ID, CREATED_BY, CREATION_DATE, ITEM_NAME, DOSAGE_QUANTITY, REPEATED_IN_DAY, DAYS_PERIOD, NOTES, ITM_CODE)
                VALUES (:patientId, :visitId, :createdBy, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :medicineBrand, :dose, :repeat, :noDays, :prescriptionNote, :code)
            `;

            await connection.execute(insertQuery, {
                patientId,
                visitId,
                createdBy,
                formattedToday, // Pass the formatted date here
                medicineBrand,
                dose,
                repeat,
                noDays,
                prescriptionNote,
                code
               
            });
        }

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ message: 'Prescriptions added successfully' });
    } catch (error) {
        console.error('Error adding prescriptions:', error);
        res.status(500).json({ error: 'Error adding prescriptions' });
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
app.delete('/api/delete-prescription', async (req, res) => {
    const { medicineBrand, dose, repeat, noDays, prescriptionNote, patientId, visitId, createdBy } = req.body;

    let connection;
    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        const deleteQuery = `
            DELETE FROM CLNC_PAT_PRESCRIPTIONS
            WHERE ITEM_NAME = :medicineBrand
              AND DOSAGE_QUANTITY = :dose
              AND REPEATED_IN_DAY = :repeat
              AND DAYS_PERIOD = :noDays
              AND NOTES = :prescriptionNote
              AND PAT_ID = :patientId
              AND VISIT_ID = :visitId
              AND CREATED_BY = :createdBy
        `;

        const result = await connection.execute(deleteQuery, {
            medicineBrand,
            dose,
            repeat,
            noDays,
            prescriptionNote,
            patientId,
            visitId,
            createdBy
        });

        await connection.commit();

        res.status(200).json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        res.status(500).json({ error: 'Error deleting prescription' });
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

app.put('/api/update-observations/:patId', async (req, res) => {
    const visitId = req.query.visitId;
    const dateObj = new Date();
    const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
    
    const {
        hstId, username, chiefComplaints, historyPresentIllness, presentMedication, 
        pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations, 
        healthInfoFamily, childhoodDiseases,
        bloodDisorders, bloodDisordersNote, cardiacProblem, cardiacProblemNote,
        respiratoryProblems, respiratoryProblemsNote, endocrineProblem, endocrineProblemNote,
        prevExtraction, prevExtractionClinic, prevOrtho, prevOrthoClinic, prevRestoration, prevRestorationClinic,
        prostheticType, prostheticDuration, prostheticClinic, clinicExamination, oralHygiene,
        numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility, crowding,
        sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan, radiologicalExamination, finalDiagnosis,
        instruction, followupPlan, referral, patientCooperative, previousSurgeriesNote,
        caries,
        checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, checkbox6, checkbox7, checkbox8,
        checkbox9, checkbox10, checkbox11, checkbox12, checkbox13, checkbox14, checkbox15, checkbox16,
        checkbox17, checkbox18, checkbox19, checkbox20, checkbox21, checkbox22, checkbox23, checkbox24,
        checkbox25, checkbox26, checkbox27, checkbox28, checkbox29, checkbox30, checkbox31, checkbox32,
        checkboxA, checkboxB, checkboxC, checkboxD, checkboxE, checkboxF, checkboxG, checkboxH, checkboxI,
        checkboxJ, checkboxK,
        diagnosticNotes1, diagnosticNotes2, diagnosticNotes3, diagnosticNotes4,
        diagnosisNoteCheckbox1, diagnosisNoteCheckbox2, diagnosisNoteCheckbox3, diagnosisNoteCheckbox4,
        therapeuticNotes1,
  therapeuticNoteCheckbox1,
  therapeuticNotes2,
  therapeuticNoteCheckbox2,
  therapeuticNotes3,
  therapeuticNoteCheckbox3,
  therapeuticNotes4,
  therapeuticNoteCheckbox4,
  followupComplaint,
  followupInvestigationResults,
  followupDiagnosis,
  followupManagement,
  followfollowupPlan,
  actionPlan, clinicData, followUpPlan,
  icdName1, icdName2, icdName3,
  note1, note2, note3,
  code1, code2, code3
    } = req.body;
    const { patId } = req.params;

    // Log form details for debugging
    console.log('Updating patient details with:', {
        hstId, username, chiefComplaints, historyPresentIllness, presentMedication,
        pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations,
        healthInfoFamily, childhoodDiseases, bloodDisorders, cardiacProblem, respiratoryProblems,
        endocrineProblem, prevExtraction, prevOrtho, prevRestoration, prostheticType,
        clinicExamination, oralHygiene, numberOfTeeth, missingTeeth, fracturedTeeth,
        filledTeeth, discoloredTeeth, mobility, crowding, sinusOpening, swelling,
        pulpVitality, prognosis, treatmentPlan, radiologicalExamination, finalDiagnosis,
        instruction, followupPlan, referral, patientCooperative, previousSurgeriesNote,
        caries
    });

    let connection;

    try {
        // Obtain a connection to Oracle Database
        connection = await oracledb.getConnection();

        // Prepare SQL queries
        const updateHistoryQuery = `
            UPDATE CLNC_PAT_HISTORY
            SET 
                UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
                UPDATED_BY = :username,
                DESCREPTION = :description
            WHERE 
                PAT_ID = :patId
                AND HISTORY_TYPE = :historyType
        `;

        const updateDentalQuery = `
            UPDATE CLNC_DENTAL_SHEET
            SET
                UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
                UPDATED_BY = :username,
                BLOOD_DISORDERS = :bloodDisorders,
                BLOOD_DISORDERS_NOTES = :bloodDisordersNote,
                CARDIAC_PROBLEMS = :cardiacProblem,
                CARDIAC_PROBLEMS_NOTES = :cardiacProblemNote,
                RESPIRATORY = :respiratoryProblems,
                RESPIRATORY_NOTES = :respiratoryProblemsNote,
                ENDOCINE = :endocrineProblem,
                ENDOCINE_NOTE = :endocrineProblemNote,
                PREV_EXTRACTION = :prevExtraction,
                PREV_EXTRACTION_NOTES = :prevExtractionClinic,
                PREV_ORTHO = :prevOrtho,
                PREV_ORTHO_NOTES = :prevOrthoClinic,
                PREV_RESTORATION = :prevRestoration,
                PREV_RESTORATION_NOTES = :prevRestorationClinic,
                ORAC_PROSTHETIC_TYPE = :prostheticType,
                ORAC_PROSTHETIC_DURATION = :prostheticDuration,
                ORAL_HYGINE = :oralHygiene,
                NUMBER_TEETH = :numberOfTeeth,
                MISSING_TEETH = :missingTeeth,
                FRACTURED_TEETH = :fracturedTeeth,
                FILLED_TEETH = :filledTeeth,
                DISCOLORED_TEETH = :discoloredTeeth,
                MOBILITY = :mobility,
                CROW_SPACE = :crowding,
                SINUS_OPENING = :sinusOpening,
                SWEELING = :swelling,
                PULP_VITALITY = :pulpVitality,
                PROGNOSIS = :prognosis,
                TREATMENT_PLAN = :treatmentPlan,
                RADIO_EXAM = :radiologicalExamination,
                FINAL_DIAGNOSIS = :finalDiagnosis,
                INSTRUCTIONS = :instruction,
                FOLLOW_UP = :followupPlan,
                REFERAL = :referral,
                COOPERATIVE = :patientCooperative,
                SURGERIES_NOTES = :previousSurgeriesNote
            WHERE 
                PAT_ID = :patId AND 
                VISIT_ID = :visitId
                
        `;

        const updateCariesQuery = `
            UPDATE CLNC_DENTAL_CARIES
            SET
                C1 = :checkbox1,
                C2 = :checkbox2,
                C3 = :checkbox3,
                C4 = :checkbox4,
                C5 = :checkbox5,
                C6 = :checkbox6,
                C7 = :checkbox7,
                C8 = :checkbox8,
                C9 = :checkbox9,
                C10 = :checkbox10,
                C11 = :checkbox11,
                C12 = :checkbox12,
                C13 = :checkbox13,
                C14 = :checkbox14,
                C15 = :checkbox15,
                C16 = :checkbox16,
                C17 = :checkbox17,
                C18 = :checkbox18,
                C19 = :checkbox19,
                C20 = :checkbox20,
                C21 = :checkbox21,
                C22 = :checkbox22,
                C23 = :checkbox23,
                C24 = :checkbox24,
                C25 = :checkbox25,
                C26 = :checkbox26,
                C27 = :checkbox27,
                C28 = :checkbox28,
                C29 = :checkbox29,
                C30 = :checkbox30,
                C31 = :checkbox31,
                C32 = :checkbox32,
                CA = :checkboxA,
                CB = :checkboxB,
                CC = :checkboxC,
                CD = :checkboxD,
                CE = :checkboxE,
                CF = :checkboxF,
                CG = :checkboxG,
                CH = :checkboxH,
                CI = :checkboxI,
                CJ = :checkboxJ,
                CK = :checkboxK
            WHERE 
                PAT_ID = :patId
        `;

        // Define history entries
        const historyEntries = [
            { type: 'Chief Complaints', description: chiefComplaints },
            { type: 'History of Present Illness', description: historyPresentIllness },
            { type: 'Present Medication', description: presentMedication },
            { type: 'Past Surgical History', description: pastSurgicalHistory },
            { type: 'Allergies to Medications/Food/Latex/Other', description: allergiesToMedicationsFoodLatexOther },
            { type: 'History of Vaccines/Immunizations', description: historyVaccinesImmunizations },
            { type: 'Health Information/Family', description: healthInfoFamily },
            { type: 'Childhood Diseases', description: childhoodDiseases }
        ];

        // Filter out entries where description is null or an empty string
        const filteredEntries = historyEntries.filter(entry => entry.description != null && entry.description.trim() !== '');

        // Create an array of promises for updating each valid entry
        const updateHistoryPromises = filteredEntries.map(entry => {
            return connection.execute(updateHistoryQuery, {
                formattedToday,
                username,
                patId,
                historyType: entry.type,
                description: entry.description
            }, { autoCommit: true });
        });

        // Update dental details
        const updateDentalPromise = connection.execute(updateDentalQuery, {
            formattedToday,
            username,
            visitId,
            patId,
            bloodDisorders,
            bloodDisordersNote,
            cardiacProblem,
            cardiacProblemNote,
            respiratoryProblems,
            respiratoryProblemsNote,
            endocrineProblem,
            endocrineProblemNote,
            prevExtraction,
            prevExtractionClinic,
            prevOrtho,
            prevOrthoClinic,
            prevRestoration,
            prevRestorationClinic,
            prostheticType,
            prostheticDuration,
            oralHygiene,
            numberOfTeeth,
            missingTeeth,
            fracturedTeeth,
            filledTeeth,
            discoloredTeeth,
            mobility,
            crowding,
            sinusOpening,
            swelling,
            pulpVitality,
            prognosis,
            treatmentPlan,
            radiologicalExamination,
            finalDiagnosis,
            instruction,
            followupPlan,
            referral,
            patientCooperative,
            previousSurgeriesNote
        }, { autoCommit: true });

        // Update caries details
        const updateCariesPromise = connection.execute(updateCariesQuery, {
            patId,
            checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, checkbox6, checkbox7, checkbox8,
            checkbox9, checkbox10, checkbox11, checkbox12, checkbox13, checkbox14, checkbox15, checkbox16,
            checkbox17, checkbox18, checkbox19, checkbox20, checkbox21, checkbox22, checkbox23, checkbox24,
            checkbox25, checkbox26, checkbox27, checkbox28, checkbox29, checkbox30, checkbox31, checkbox32,
            checkboxA, checkboxB, checkboxC, checkboxD, checkboxE, checkboxF, checkboxG, checkboxH, checkboxI,
            checkboxJ, checkboxK
        }, { autoCommit: true });


        const updateDiagnosisQuery = `
        UPDATE CLNC_PAT_DIAGNOSIS 
        SET DESCREPTION = :description, UPDATED_BY = :username, UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'), STATUS = :status
        WHERE PAT_ID = :patId AND VISIT_ID = :visitId
    `;
    
    // Collect non-empty notes and corresponding statuses
    const diagnosisUpdates = [];
    
    if (diagnosticNotes1) {
        diagnosisUpdates.push({ description: diagnosticNotes1, status: diagnosisNoteCheckbox1 });
    }
    if (diagnosticNotes2) {
        diagnosisUpdates.push({ description: diagnosticNotes2, status: diagnosisNoteCheckbox2 });
    }
    if (diagnosticNotes3) {
        diagnosisUpdates.push({ description: diagnosticNotes3, status: diagnosisNoteCheckbox3 });
    }
    if (diagnosticNotes4) {
        diagnosisUpdates.push({ description: diagnosticNotes4, status: diagnosisNoteCheckbox4 });
    }
    
    // Update each non-empty note with its status
    for (const update of diagnosisUpdates) {
        await connection.execute(updateDiagnosisQuery, {
            patId,
            visitId,
            description: update.description,
            username,
            formattedToday,
            status: update.status
        }, { autoCommit: true });
    }
    




    const updateTherapeuticQuery = `
    UPDATE CLNC_PAT_THERAPEUTIC 
    SET DESCREPTION = :description, UPDATED_BY = :username, UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'), STATUS = :status
    WHERE PAT_ID = :patId AND VISIT_ID = :visitId
`;

// Collect non-empty therapeutic notes and corresponding statuses
const therapeuticUpdates = [];

if (therapeuticNotes1) {
    therapeuticUpdates.push({ description: therapeuticNotes1, status: therapeuticNoteCheckbox1 });
}
if (therapeuticNotes2) {
    therapeuticUpdates.push({ description: therapeuticNotes2, status: therapeuticNoteCheckbox2 });
}
if (therapeuticNotes3) {
    therapeuticUpdates.push({ description: therapeuticNotes3, status: therapeuticNoteCheckbox3 });
}
if (therapeuticNotes4) {
    therapeuticUpdates.push({ description: therapeuticNotes4, status: therapeuticNoteCheckbox4 });
}

// Update each non-empty therapeutic note with its status
for (const update of therapeuticUpdates) {
    await connection.execute(updateTherapeuticQuery, {
        patId,
        visitId,
        description: update.description,
        username,
        formattedToday,
        status: update.status
    }, { autoCommit: true });
}


const updateFollowUpQuery = `
UPDATE CLNC_PAT_FOLLOW_UP
SET
    UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
    UPDATED_BY = :username,
    COMPLAINT = :followupComplaint,
    INVESTIGATION_RESULTS = :followupInvestigationResults,
    DIAGNOSIS = :followupDiagnosis,
    MANAGEMENT_PLAN = :followupManagement,
    FOLLOW_UP = : followfollowupPlan
WHERE 
    PAT_ID = :patId AND 
    VISIT_ID = :visitId
`;

// Execute the follow-up update
await connection.execute(updateFollowUpQuery, {
formattedToday,
username,
followupComplaint,
followupInvestigationResults,
followupDiagnosis,
followupManagement,
followfollowupPlan,
patId,
visitId
}, { autoCommit: true });
const updateManagementPlanQuery = `
UPDATE CLNC_PAT_MANAGEMENT_PLAN
SET 
    CLINICAL_DATA = :clinicData,
    MANAGEMENT_PLAN = :actionPlan,
    FOLLOW_UP = :followUpPlan,
    UPDATED_BY = :username,
    UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
    FINAL_DIAG1_CODE = :code1,
    FINAL_DIAG2_CODE = :code2,
    FINAL_DIAG3_CODE = :code3,
    FINAL_DIAG1_NAME = :icdName1,
    FINAL_DIAG2_NAME = :icdName2,
    FINAL_DIAG3_NAME = :icdName3,
    FINAL_DIAG1_COMMENTS = :note1,
    FINAL_DIAG2_COMMENTS = :note2,
    FINAL_DIAG3_COMMENTS = :note3
WHERE 
    PAT_ID = :patId AND VISIT_ID = :visitId
`;

// Execute the update
await connection.execute(updateManagementPlanQuery, {
clinicData,
actionPlan,
followUpPlan,
username,
formattedToday,
code1,
code2,
code3,
icdName1,
icdName2,
icdName3,
note1,
note2,
note3,
patId,
visitId
}, { autoCommit: true });

console.log('Data updated in CLNC_PAT_MANAGEMENT_PLAN table successfully.');


        

        // Execute all update promises
        await Promise.all([...updateHistoryPromises, updateDentalPromise, updateCariesPromise]);

        // Send success response
        res.status(200).json({ message: 'Patient details updated successfully' });
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ message: 'Error updating patient details' });
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


// app.put('/api/update-observations/:patId', async (req, res) => {
//     const dateObj = new Date();
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
    
//     const {
//         hstId, username, chiefComplaints, historyPresentIllness, presentMedication, 
//         pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations, 
//         healthInfoFamily, childhoodDiseases,
//         // Dental sheet details
//         bloodDisorders, bloodDisordersNote, cardiacProblem, cardiacProblemNote,
//         respiratoryProblems, respiratoryProblemsNote, endocrineProblem, endocrineProblemNote,
//         prevExtraction, prevExtractionClinic, prevOrtho, prevOrthoClinic, prevRestoration, prevRestorationClinic,
//         prostheticType, prostheticDuration, prostheticClinic, clinicExamination, oralHygiene,
//         numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility, crowding,
//         sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan, radiologicalExamination, finalDiagnosis,
//         instruction, followupPlan, referral, patientCooperative, previousSurgeriesNote,
//         // Caries details
//         caries
//     } = req.body;
//     const { patId } = req.params;

//     // Log form details for debugging
//     console.log('Updating patient details with:', {
//         hstId, username, chiefComplaints, historyPresentIllness, presentMedication,
//         pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations,
//         healthInfoFamily, childhoodDiseases, bloodDisorders, cardiacProblem, respiratoryProblems,
//         endocrineProblem, prevExtraction, prevOrtho, prevRestoration, prostheticType,
//         clinicExamination, oralHygiene, numberOfTeeth, missingTeeth, fracturedTeeth,
//         filledTeeth, discoloredTeeth, mobility, crowding, sinusOpening, swelling,
//         pulpVitality, prognosis, treatmentPlan, radiologicalExamination, finalDiagnosis,
//         instruction, followupPlan, referral, patientCooperative, previousSurgeriesNote,
//         caries
//     });

//     let connection;

//     try {
//         // Obtain a connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Prepare SQL queries
//         const updateHistoryQuery = `
//             UPDATE CLNC_PAT_HISTORY
//             SET 
//                 UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
//                 UPDATED_BY = :username,
//                 DESCREPTION = :description
//             WHERE 
//                 PAT_ID = :patId
//                 AND HISTORY_TYPE = :historyType
//         `;

//         const updateDentalQuery = `
//             UPDATE CLNC_DENTAL_SHEET
//             SET
//                 UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
//                 UPDATED_BY = :username,
//                 BLOOD_DISORDERS = :bloodDisorders,
//                 BLOOD_DISORDERS_NOTES = :bloodDisordersNote,
//                 CARDIAC_PROBLEMS = :cardiacProblem,
//                 CARDIAC_PROBLEMS_NOTES = :cardiacProblemNote,
//                 RESPIRATORY = :respiratoryProblems,
//                 RESPIRATORY_NOTES = :respiratoryProblemsNote,
//                 ENDOCINE = :endocrineProblem,
//                 ENDOCINE_NOTE = :endocrineProblemNote,
//                 PREV_EXTRACTION = :prevExtraction,
//                 PREV_EXTRACTION_NOTES = :prevExtractionClinic,
//                 PREV_ORTHO = :prevOrtho,
//                 PREV_ORTHO_NOTES = :prevOrthoClinic,
//                 PREV_RESTORATION = :prevRestoration,
//                 PREV_RESTORATION_NOTES = :prevRestorationClinic,
//                 PROSTHETIC_TYPE = :prostheticType,
//                 PROSTHETIC_DURATION = :prostheticDuration,
//                 PROSTHETIC_NOTES = :prostheticClinic,
           
//                 ORAL_HYGINE = :oralHygiene,
//                 NUMBER_TEETH = :numberOfTeeth,
//                 MISSING_TEETH = :missingTeeth,
//                 FRACTURED_TEETH = :fracturedTeeth,
//                 FILLED_TEETH = :filledTeeth,
//                 DISCOLORED_TEETH = :discoloredTeeth,
//                 MOBILITY = :mobility,
//                 CROW_SPACE = :crowding,
//                 SINUS_OPENING = :sinusOpening,
//                 SWEELING = :swelling,
//                 PULP_VITALITY = :pulpVitality,
//                 PROGNOSIS = :prognosis,
//                 TREATMENT_PLAN = :treatmentPlan,
                
//                 FINAL_DIAGNOSIS = :finalDiagnosis,
//                 INSTRUCTIONS = :instruction,
//                 FOLLOW_UP = :followupPlan,
//                 REFERAL = :referral,
//                 COOPERATIVE = :patientCooperative,
//                 SURGERIES_NOTES = :previousSurgeriesNote
//             WHERE 
//                 PAT_ID = :patId
//         `;

//         const updateCariesQuery = `
//             UPDATE CLNC_DENTAL_CRIES
//             SET
//                 C1 = :C1,
//                 C2 = :C2,
//                 C3 = :C3,
//                 C4 = :C4,
//                 C5 = :C5,
//                 C6 = :C6,
//                 C7 = :C7,
//                 C8 = :C8,
//                 C9 = :C9,
//                 C10 = :C10,
//                 C11 = :C11,
//                 C12 = :C12,
//                 C13 = :C13,
//                 C14 = :C14,
//                 C15 = :C15,
//                 C16 = :C16,
//                 C17 = :C17,
//                 C18 = :C18,
//                 C19 = :C19,
//                 C20 = :C20,
//                 C21 = :C21,
//                 C22 = :C22,
//                 C23 = :C23,
//                 C24 = :C24,
//                 C25 = :C25,
//                 C26 = :C26,
//                 C27 = :C27,
//                 C28 = :C28,
//                 C29 = :C29,
//                 C30 = :C30,
//                 C31 = :C31,
//                 C32 = :C32,
//                 CA = :CA,
//                 CB = :CB,
//                 CC = :CC,
//                 CD = :CD,
//                 CE = :CE,
//                 CF = :CF,
//                 CG = :CG,
//                 CH = :CH,
//                 CI = :CI,
//                 CJ = :CJ,
//                 CK = :CK,
//                 CL = :CL,
//                 CM = :CM,
//                 CN = :CN,
//                 CO = :CO,
//                 CP = :CP,
//                 CQ = :CQ,
//                 CR = :CR,
//                 CS = :CS,
//                 CT = :CT
//             WHERE 
//                 PAT_ID = :patId
//         `;

//         // Define history entries
//         const historyEntries = [
//             { type: 'Chief Complaints', description: chiefComplaints },
//             { type: 'History of Present Illness', description: historyPresentIllness },
//             { type: 'Present Medication', description: presentMedication },
//             { type: 'Past Surgical History', description: pastSurgicalHistory },
//             { type: 'Allergies to Medications/Food/Latex/Other', description: allergiesToMedicationsFoodLatexOther },
//             { type: 'History of Vaccines/Immunizations', description: historyVaccinesImmunizations },
//             { type: 'Health Information/Family', description: healthInfoFamily },
//             { type: 'Childhood Diseases', description: childhoodDiseases }
//         ];

//         // Filter out entries where description is null or an empty string
//         const filteredEntries = historyEntries.filter(entry => entry.description != null && entry.description.trim() !== '');

//         // Create an array of promises for updating each valid entry
//         const updateHistoryPromises = filteredEntries.map(entry => {
//             return connection.execute(updateHistoryQuery, {
//                 formattedToday: formattedToday,
//                 username,
//                 patId,
//                 historyType: entry.type,
//                 description: entry.description
//             }, { autoCommit: true });
//         });

//         // Update dental details
//         const updateDentalPromise = connection.execute(updateDentalQuery, {
//             formattedToday: formattedToday,
//             username,
//             patId,
//             bloodDisorders,
//             bloodDisordersNote,
//             cardiacProblem,
//             cardiacProblemNote,
//             respiratoryProblems,
//             respiratoryProblemsNote,
//             endocrineProblem,
//             endocrineProblemNote,
//             prevExtraction,
//             prevExtractionClinic,
//             prevOrtho,
//             prevOrthoClinic,
//             prevRestoration,
//             prevRestorationClinic,
//             prostheticType,
//             prostheticDuration,
//             prostheticClinic,
          
//             oralHygiene,
//             numberOfTeeth,
//             missingTeeth,
//             fracturedTeeth,
//             filledTeeth,
//             discoloredTeeth,
//             mobility,
//             crowding,
//             sinusOpening,
//             swelling,
//             pulpVitality,
//             prognosis,
//             treatmentPlan,
          
//             finalDiagnosis,
//             instruction,
//             followupPlan,
//             referral,
//             patientCooperative,
//             previousSurgeriesNote
//         }, { autoCommit: true });

//         // Extract caries values
//         const cariesValues = caries || {};

//         // Update caries details
//         const updateCariesPromise = connection.execute(updateCariesQuery, {
//             patId,
//             ...cariesValues // Spread the caries values into the query parameters
//         }, { autoCommit: true });

//         // Execute all update promises
//         await Promise.all([...updateHistoryPromises, updateDentalPromise, updateCariesPromise]);

//         console.log('Data updated successfully.');
//         // Send success response
//         res.status(200).json({ message: 'Form details updated successfully' });
//     } catch (error) {
//         console.error('Error updating form details:', error);
//         res.status(500).json({ message: 'Error updating form details' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });


// app.post('/api/save-form-details', async (req, res) => {
//     const dateObj = new Date();
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY

//     const {
//         hstId, patId, username, chiefComplaints, historyPresentIllness, presentMedication, 
//         pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations, 
//         healthInfoFamily, childhoodDiseases,

//         // Additional form data
//         pregnant, lactating, previousSurgeries, bloodDisorders, cardiacProblem, respiratoryProblems,
//         endocrineProblem, pregnancyTrimester,
//         prevExtraction, prevRestoration, prevOrtho,
//         prostheticType, prostheticDuration, prostheticClinic, clinicExamination, oralHygiene,
//         checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, checkbox6, checkbox7, checkbox8,
//         checkbox9, checkbox10, checkbox11, checkbox12, checkbox13, checkbox14, checkbox15, checkbox16,
//         checkbox17, checkbox18, checkbox19, checkbox20, checkbox21, checkbox22, checkbox23, checkbox24,
//         checkbox25, checkbox26, checkbox27, checkbox28, checkbox29, checkbox30, checkbox31, checkbox32,
//         checkbox33, checkbox34, checkbox35, checkbox36, checkboxa, checkboxb, checkboxc, checkboxd,
//         checkboxe, checkboxf, checkboxg, checkboxh, checkboxi, checkboxj, checkboxk,
//         numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility, crowding,
//         sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan, radiologicalExamination,
//         finalDiagnosis, instruction, followupPlan, referral, patientCooperative,
//         prevExtractionClinic, prevRestorationClinic, prevOrthoClinic,
//         previousSurgeriesNote, bloodDisordersNote, cardiacProblemNote, respiratoryProblemsNote, endocrineProblemNote
//     } = req.body;

//     // Log form details for debugging
//     console.log(req.body);

//     let connection;

//     try {
//         // Obtain a connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Prepare the SQL query for inserting details into CLNC_PAT_HISTORY
//         const insertDetailsQuery = `
//             INSERT INTO CLNC_PAT_HISTORY (
//                 CREATION_DATE, HST_ID, PAT_ID, CREATED_BY, HISTORY_TYPE, DESCREPTION
//             ) VALUES (
//                 TO_DATE(:formattedToday, 'MM/DD/YYYY'),
//                 :hstId,
//                 :patId,
//                 :username,
//                 :historyType,
//                 :description
//             )
//         `;

//         console.log('Inserting into database with query:', insertDetailsQuery);

//         // Define an array of history types and descriptions
//         const historyEntries = [
//             { type: 'Chief Complaints', description: chiefComplaints },
//             { type: 'History of Present Illness', description: historyPresentIllness },
//             { type: 'Present Medication', description: presentMedication },
//             { type: 'Past Surgical History', description: pastSurgicalHistory },
//             { type: 'Allergies to Medications/Food/Latex/Other', description: allergiesToMedicationsFoodLatexOther },
//             { type: 'History of Vaccines/Immunizations', description: historyVaccinesImmunizations },
//             { type: 'Health Information/Family', description: healthInfoFamily },
//             { type: 'Childhood Diseases', description: childhoodDiseases }
//         ];

//         // Filter out entries where description is null or an empty string
//         const filteredEntries = historyEntries.filter(entry => entry.description != null && entry.description.trim() !== '');

//         // Create an array of promises for inserting each valid entry
//         const insertPromises = filteredEntries.map(entry => {
//             console.log('Inserting entry:', entry); // Log each entry being inserted
//             return connection.execute(insertDetailsQuery, {
//                 formattedToday,
//                 hstId,
//                 patId,
//                 username,
//                 historyType: entry.type,
//                 description: entry.description
//             }, { autoCommit: true });
//         });

//         console.log('Insert promises:', insertPromises);

//         // Execute all insert promises
//         await Promise.all(insertPromises);

//         // Prepare SQL query for inserting into DENTAL table
//         const insertDentalQuery = `
//             INSERT INTO  CLNC_DENTAL_SHEET (
//                 PAT_ID, CREATION_DATE, PREGNANT, LACTATING, PREV_SURGERIES, BLOOD_DISORDERS,
//                 CARDIAC_PROBLEMS, RESPIRATORY, ENDOCINE, TRIMESTER,
//                 PREV_EXTRACTION, PREV_RESTORATION, PREV_ORTHO, ORAC_PROSTHETIC_TYPE, ORAC_PROSTHETIC_DURATION,
//                 ORAL_HYGINE, NUMBER_TEETH, MISSING_TEETH, FRACTURED_TEETH, FILLED_TEETH, DISCOLORED_TEETH,
//                 MOBILITY, CROW_SPACE, SINUS_OPENING, SWEELING, PULP_VITALITY, PROGNOSIS, TREATMENT_PLAN,
//                 FINAL_DIAGNOSIS, INSTRUCTIONS, FOLLOW_UP, REFERAL,
//                 COOPERATIVE, PREV_EXTRACTION_NOTES, PREV_RESTORATION_NOTES, PREV_ORTHO_NOTES,
//                 SURGERIES_NOTES, BLOOD_DISORDERS_NOTES, CARDIAC_PROBLEMS_NOTES, RESPIRATORY_NOTES,
//                 ENDOCINE_NOTE,
//                 CREATED_BY
//             ) VALUES (
//                 :patId, TO_DATE(:formattedToday, 'MM/DD/YYYY'), :pregnant, :lactating, :previousSurgeries,
//                 :bloodDisorders, :cardiacProblem, :respiratoryProblems, :endocrineProblem, :pregnancyTrimester,
//                 :prevExtraction, :prevRestoration, :prevOrtho, :prostheticType, :prostheticDuration,
//                :oralHygiene,  :numberOfTeeth,
//                 :missingTeeth, :fracturedTeeth, :filledTeeth, :discoloredTeeth, :mobility, :crowding, :sinusOpening,
//                 :swelling, :pulpVitality, :prognosis, :treatmentPlan,  :finalDiagnosis,
//                 :instruction, :followupPlan, :referral, :patientCooperative, :prevExtractionClinic,
//                 :prevRestorationClinic, :prevOrthoClinic, :previousSurgeriesNote, :bloodDisordersNote,
//                 :cardiacProblemNote, :respiratoryProblemsNote, :endocrineProblemNote, :username
//             )
//         `;

//         console.log('Inserting into DENTAL table with query:', insertDentalQuery);

//         // Insert the form details into the DENTAL table
//         await connection.execute(insertDentalQuery, {
//             patId, formattedToday, pregnant, lactating, previousSurgeries, bloodDisorders,
//             cardiacProblem, respiratoryProblems, endocrineProblem, pregnancyTrimester,
//             prevExtraction, prevRestoration, prevOrtho, prostheticType, prostheticDuration, 
//            oralHygiene,  numberOfTeeth, missingTeeth, fracturedTeeth, filledTeeth, discoloredTeeth, mobility,
//             crowding, sinusOpening, swelling, pulpVitality, prognosis, treatmentPlan,
//             finalDiagnosis, instruction, followupPlan, referral, patientCooperative, prevExtractionClinic,
//             prevRestorationClinic, prevOrthoClinic, previousSurgeriesNote, bloodDisordersNote, cardiacProblemNote,
//             respiratoryProblemsNote, endocrineProblemNote,username
//         }, { autoCommit: true });

//         console.log('Data inserted into DENTAL table successfully.');

//         // Send success response
//         res.status(200).json({ message: 'Form details saved successfully' });
//     } catch (error) {
//         console.error('Error saving form details:', error);
//         res.status(500).json({ message: 'Error saving form details' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });


// Update patient history details
// app.put('/api/update-observations/:patId', async (req, res) => {
//     const dateObj = new Date();
//     const formattedToday = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`; // Format: MM/DD/YYYY
    
//     const { hstId, username, chiefComplaints, historyPresentIllness, presentMedication, 
//             pastSurgicalHistory, allergiesToMedicationsFoodLatexOther, historyVaccinesImmunizations, 
//             healthInfoFamily, childhoodDiseases } = req.body;
//     const { patId } = req.params;

//     // Log form details for debugging
//     console.log('Updating patient history details with:', {
//         hstId,
//         username,
//         chiefComplaints,
//         historyPresentIllness,
//         presentMedication,
//         pastSurgicalHistory,
//         allergiesToMedicationsFoodLatexOther,
//         historyVaccinesImmunizations,
//         healthInfoFamily,
//         childhoodDiseases
//     });

//     let connection;

//     try {
//         // Obtain a connection to Oracle Database
//         connection = await oracledb.getConnection();

//         // Prepare the SQL query for updating details in CLNC_PAT_HISTORY
//         const updateDetailsQuery = `
//             UPDATE CLNC_PAT_HISTORY
//             SET 
//                 UPDATE_DATE = TO_DATE(:formattedToday, 'MM/DD/YYYY'),
//                 UPDATED_BY = :username,
//                 DESCREPTION = :description
//             WHERE 
                
//                  PAT_ID = :patId
//                 AND HISTORY_TYPE = :historyType
//         `;

//         // Define an array of history types and descriptions
//         const historyEntries = [
//             { type: 'Chief Complaints', description: chiefComplaints },
//             { type: 'History of Present Illness', description: historyPresentIllness },
//             { type: 'Present Medication', description: presentMedication },
//             { type: 'Past Surgical History', description: pastSurgicalHistory },
//             { type: 'Allergies to Medications/Food/Latex/Other', description: allergiesToMedicationsFoodLatexOther },
//             { type: 'History of Vaccines/Immunizations', description: historyVaccinesImmunizations },
//             { type: 'Health Information/Family', description: healthInfoFamily },
//             { type: 'Childhood Diseases', description: childhoodDiseases }
//         ];

//         // Filter out entries where description is null or an empty string
//         const filteredEntries = historyEntries.filter(entry => entry.description != null && entry.description.trim() !== '');

//         // Create an array of promises for updating each valid entry
//         const updatePromises = filteredEntries.map(entry => {
//             console.log('Updating entry:', entry); // Log each entry being updated
//             return connection.execute(updateDetailsQuery, {
//                 formattedToday: formattedToday,
//                 username,
               
//                 patId,
//                 historyType: entry.type,
//                 description: entry.description
//             }, { autoCommit: true });
//         });

//         console.log('Update promises:', updatePromises);

//         // Execute all update promises
//         await Promise.all(updatePromises);

//         console.log('Data updated successfully.');
//         // Send success response
//         res.status(200).json({ message: 'Form details updated successfully' });
//     } catch (error) {
//         console.error('Error updating form details:', error);
//         res.status(500).json({ message: 'Error updating form details' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });


app.get('/api/getSpecialty', async (req, res) => {
    const username = req.query.username;
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    let connection;
  
    try {
      // Obtain a connection to Oracle Database
      connection = await oracledb.getConnection();
  
      // Construct query to fetch specialty by username
      const query = `
        SELECT SPECIALTY
        FROM USERS_INFORMATION
        WHERE USRINFO_USERNAME = :username
      `;
  
      // Execute the query
      const result = await connection.execute(query, [username], {
        outFormat: oracledb.OUT_FORMAT_OBJECT // Format result as an object
      });
  
      // Check if user was found
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Extract the specialty
      const specialty = result.rows[0].SPECIALTY;
  
      // Respond with the specialty
      res.status(200).json({ specialty });
    } catch (error) {
      console.error('Error fetching user specialty:', error);
      res.status(500).json({ error: 'Error fetching user specialty' });
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
app.get('/api/patient-detailsv/:id', async (req, res) => {
    const patientId = req.params.id;
    const visitId = req.query.visitId;
     // Get patient ID from URL parameters

    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Fetch patient details from CLNC_PAT_HISTORY
        const historyResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_HISTORY WHERE PAT_ID = :id`,
            [patientId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Fetch data from DENTAL table
        const dentalResult = await connection.execute(
            `SELECT * FROM CLNC_DENTAL_SHEET WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
    { id: patientId, visitId: visitId }, // Pass both parameters
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Fetch data from CLNC_DENTAL_CRIES table
        const dentalCriesResult = await connection.execute(
            `SELECT * FROM CLNC_DENTAL_CARIES WHERE PAT_ID = :id`,
            [patientId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const diagnosisResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_DIAGNOSIS WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
            { id: patientId, visitId: visitId }, // Pass both parameters
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const therapeuticResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_THERAPEUTIC WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
            { id: patientId, visitId: visitId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const prescriptionsResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_PRESCRIPTIONS WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
            { id: patientId, visitId: visitId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const followUpResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_FOLLOW_UP WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
            { id: patientId, visitId: visitId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const managementPlanResult = await connection.execute(
            `SELECT * FROM CLNC_PAT_MANAGEMENT_PLAN WHERE PAT_ID = :id AND VISIT_ID = :visitId`,
            { id: patientId, visitId: visitId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (historyResult.rows.length === 0 && dentalResult.rows.length === 0 && dentalCriesResult.rows.length === 0) {
            return res.status(404).json({ error: 'Patient details not found' });
        }

        const patientDetails = {
            history: historyResult.rows,
            dental: dentalResult.rows,
            dentalCries: dentalCriesResult.rows,
            diagnosis: diagnosisResult.rows,
            therapeutic: therapeuticResult.rows,
            prescriptions: prescriptionsResult.rows  ,
            followUp: followUpResult.rows,
            managementPlan: managementPlanResult.rows   // Include follow-up details
        };

        res.status(200).json(patientDetails);
    } catch (error) {
        console.error('Error executing Oracle query:', error);
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



// app.get('/api/patient-detailsv/:id', async (req, res) => {
//     const patientId = req.params.id; // Get patient ID from URL parameters

//     if (!patientId) {
//         return res.status(400).json({ error: 'Patient ID is required' });
//     }

//     let connection;
//     try {
//         connection = await oracledb.getConnection();

//         const result = await connection.execute(
//             `SELECT * FROM  CLNC_PAT_HISTORY WHERE PAT_ID = :id`,
//             [patientId],
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Patient details not found' });
//         }

//         const patientDetails = result.rows;
//         res.status(200).json(patientDetails);
//     } catch (error) {
//         console.error('Error executing Oracle query:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });



// Start server

app.get('/api/checkScheduled', async (req, res) => {
    let connection;
    const { fileNumber, doctorName, newd } = req.query;
    console.log(newd);
  
    // Validate request parameters
    if (!fileNumber || !doctorName || !newd) {
      return res.status(400).json({ error: 'fileNumber, doctorName, and newd are required' });
    }
  
    // Convert `newd` to mm/dd/yyyy format
    const dateToCheck = formatDate(newd);
    const datetosave = formatDateM(newd);
    console.log('Date to Check:', dateToCheck);
    console.log('Date to Save:', datetosave);
  
    try {
      // Establish connection to Oracle Database
      connection = await oracledb.getConnection();
  
      // Construct query to check the schedule in both tables
      const query = `
        SELECT COUNT(*) AS count
        FROM (
          SELECT 1
          FROM CLNC_PATIENT_VISITS
          WHERE PAT_ID = :fileNumber
          AND DOCTOR_ID = :doctorName
          AND VISIT_DATE = TO_DATE(:appointmentDate, 'MM/DD/YYYY')
          AND STATUS != 'C'
    
          UNION ALL
    
          SELECT 1
          FROM CLNC_APPOINTMENT_MEVN
          WHERE FILE_NO = :fileNumber
          AND DOCTOR_NAME = :doctorName
          AND SCHEDULE_DATE = :dateToSave
          AND STATUS != 'C'
        )
      `;
  
      console.log('Executing Query:', query);
      console.log('Parameters:', {
        fileNumber,
        doctorName,
        appointmentDate: dateToCheck,
        dateToSave: datetosave
      });
  
      // Execute the query
      const result = await connection.execute(query, {
        fileNumber,
        doctorName,
        appointmentDate: dateToCheck,
        dateToSave: datetosave
      });
      
      console.log('Query Result:', result);
  
      // Access the count correctly
      const count = result.rows[0][0]; // Accessing the count directly
      const isScheduled = count > 0; // Determine if there are any scheduled entries
  
      console.log('Count:', count); // Log the count for debugging
      console.log('Is Scheduled:', isScheduled); // This should now log true if count is > 0
      res.json({ isScheduled });
    } catch (error) {
      console.error('Error checking schedule:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (connection) {
        try {
          // Close the database connection
          await connection.close();
        } catch (error) {
          console.error('Error closing Oracle DB connection:', error);
        }
      }
    }
  });
  






  app.get('/api/max-serial-quote', async (req, res) => {
    const { comNo } = req.query;
    console.log('com_no on quotation:', comNo); // Log to confirm the value

    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();
        const currentYear = new Date().getFullYear();

        // Query to fetch the maximum QUOTHEAD_SERIAL from the QUOTATION_LINES table
        const query = `
            SELECT MAX(QUOTHEAD_SERIAL) AS MAX_Q
            FROM QUOTATION_HEADERS 
            WHERE QUOTHEAD_YEAR = :currentYear
              AND COM_NO = :comNo
        `;

        // Execute the query with bind variables
        const result = await connection.execute(query, {
            currentYear: currentYear,
            comNo: comNo
        });

        console.log(result); // Log the result to see the output

        // Extract the maximum QUOTHEAD_SERIAL from the result
        const MAXQ = result.rows.length > 0 ? result.rows[0][0] : 0; // Default to 0 if no rows are found

        // Increment MAXQ by 1
        const incrementedMaxQ = MAXQ + 1;

        // Send the incremented value as a JSON response
        res.status(200).json({ MAXQ: incrementedMaxQ });

    } catch (error) {
        console.error('Error fetching maximum QUOTHEAD_SERIAL:', error);
        res.status(500).json({ error: 'Error fetching maximum QUOTHEAD_SERIAL' });
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

app.get('/api/pro', async (req, res) => {
    const { patientId } = req.query;
    let connection;

    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        // Query to fetch records from TRANSACTION_HEADERS based on patientId
        const result = await connection.execute(
            `SELECT TH_SEQ, TOTAL_AMOUNT, CREATED_DAT, TOTAL_RETURN, TOTAL_PAID, CREDIT_AMT 
             FROM TRANSACTION_HEADERS 
             WHERE CUST_ID = :patientId`, // Assuming FILE_NO is the patient ID column
            { patientId: { val: patientId, type: oracledb.STRING } }, // Bind the patientId
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Query Result:', result.rows); // Debugging output

        // Send the fetched data as JSON response
        if (result.rows) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: 'No data found for the provided patient ID' });
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
app.get('/api/details', async (req, res) => {
    const { thseq } = req.query; // Get THSEQ from the query
    let connection;

    // Log for debugging
    console.log('Received THSEQ:', thseq);

    try {
        connection = await oracledb.getConnection();

        // Query to fetch details based on THSEQ
        const result = await connection.execute(
            `SELECT ITM_FOREIGN_DESC,QTY,PRICE FROM TRANSACTION_LINES WHERE TH_SEQ = :thseq`, // Replace with your actual details table
            { thseq: { val: thseq, type: oracledb.STRING } }, // Adjust data type if necessary
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Log the result for debugging
        console.log('Details Query Result:', result.rows);

        // Check if any records were found
        if (result.rows.length > 0) {
            res.status(200).json(result.rows); // Send the details as JSON
        } else {
            res.status(404).json({ message: 'No details found for the provided THSEQ' });
        }

    } catch (error) {
        console.error('Error executing Oracle query:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close(); // Ensure connection is closed
            } catch (error) {
                console.error('Error closing Oracle DB connection:', error);
            }
        }
    }
});




app.get('/api/Q/:patientId', async (req, res) => {
    const patientId = req.params.patientId;
    const visitId = req.query.visitId; // Get visitId from query parameters
    let connection;

    if (!patientId || !visitId) {
        return res.status(400).json({ error: 'Patient ID and Visit ID are required' });
    }

    try {
        // Get a connection from the pool
        connection = await oracledb.getConnection();

        console.log('patientId:', patientId, 'type:', typeof patientId);
        console.log('visitId:', visitId, 'type:', typeof visitId);

        // Query to fetch details from the headers table
        const result = await connection.execute(
            `SELECT QUOTHEAD_SERIAL, QUOTHEAD_YEAR, TRANSTYP_CODE, QUOTATION_VALID_UNTIL 
             FROM QUOTATION_HEADERS 
             WHERE CUST_ID = :patientId AND REMARKS = :visitId`,
            {
                patientId: { val: patientId, type: oracledb.STRING },
                visitId: { val: visitId, type: oracledb.STRING }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found for the provided Patient ID and Visit ID' });
        }

        const serialNumber = result.rows[0].QUOTHEAD_SERIAL;

        if (serialNumber == null) {
            return res.status(404).json({ message: 'Quotation serial number not found' });
        }

        // Query to fetch all details from the line table using the QUOTHEAD_SERIAL
        const lineResult = await connection.execute(
            `SELECT ITM_CODE, ITM_FOREIGN_DESC, UOM_CODE, QTY, PRICE 
             FROM QUOTATION_LINES 
             WHERE QUOTHEAD_SERIAL = :serialNumber AND QUOTHEAD_YEAR = :year`,
            {
                serialNumber: { val: serialNumber, type: oracledb.NUMBER },
                year: { val: result.rows[0].QUOTHEAD_YEAR, type: oracledb.NUMBER } // Ensure this is a NUMBER
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Fetch ref_code for each ITM_CODE from the items table
        const itemCodes = lineResult.rows.map(row => row.ITM_CODE);
        const itemCodePlaceholders = itemCodes.map((_, index) => `:itmCode${index}`).join(', ');

        // Prepare bindings for ITM_CODE
        const refCodeResult = await connection.execute(
            `SELECT ITM_CODE, REF_CODE 
             FROM ITEMS 
             WHERE ITM_CODE IN (${itemCodePlaceholders})`,
            itemCodes.reduce((acc, itmCode, index) => {
                acc[`itmCode${index}`] = { val: itmCode, type: oracledb.NUMBER }; // Treat ITM_CODE as NUMBER
                return acc;
            }, {}),
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Create a map of ITM_CODE to REF_CODE for easy lookup
        const refCodeMap = {};
        refCodeResult.rows.forEach(row => {
            refCodeMap[row.ITM_CODE] = row.REF_CODE;
        });

        // Combine header and line details, including the ref_code
        const combinedLines = lineResult.rows.map(line => ({
            ...line,
            REF_CODE: refCodeMap[line.ITM_CODE] || null // Assign REF_CODE or null if not found
        }));

        const combinedResult = {
            header: result.rows[0],
            lines: combinedLines
        };

        // Send the combined data as JSON response
        res.status(200).json(combinedResult);

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

// app.get('/api/Q/:patientId', async (req, res) => {
//     const patientId = req.params.patientId;
//     const visitId = req.query.visitId; // Get visitId from query parameters
//     let connection;

//     if (!patientId || !visitId) {
//         return res.status(400).json({ error: 'Patient ID and Visit ID are required' });
//     }

//     try {
//         // Get a connection from the pool
//         connection = await oracledb.getConnection();

//         // Log the types and values of parameters for debugging
//         console.log('patientId:', patientId, 'type:', typeof patientId);
//         console.log('visitId:', visitId, 'type:', typeof visitId);

//         // Query to fetch details from the headers table
//         const result = await connection.execute(
//             `SELECT QUOTHEAD_SERIAL, QUOTHEAD_YEAR, TRANSTYP_CODE, QUOTATION_VALID_UNTIL 
//              FROM QUOTATION_HEADERS 
//              WHERE CUST_ID = :patientId AND REMARKS = :visitId`,
//             {
//                 patientId: { val: patientId, type: oracledb.STRING },
//                 visitId: { val: visitId, type: oracledb.STRING }
//             },
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );

//         // Check if any rows were returned
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No data found for the provided Patient ID and Visit ID' });
//         }

//         // Extract QUOTHEAD_SERIAL from the first row (assuming it's unique)
//         const serialNumber = result.rows[0].QUOTHEAD_SERIAL;

//         // Check if serialNumber is present before querying the line table
//         if (serialNumber == null) { // Handle null or undefined case
//             return res.status(404).json({ message: 'Quotation serial number not found' });
//         }

//         // Query to fetch all details from the line table using the QUOTHEAD_SERIAL
//         const lineResult = await connection.execute(
//             `SELECT ITM_CODE,ITM_FOREIGN_DESC,UOM_CODE,QTY,PRICE FROM QUOTATION_LINES WHERE QUOTHEAD_SERIAL = :serialNumber`,
//             {
//                 serialNumber: { val: serialNumber, type: oracledb.NUMBER } // Set type as NUMBER
//             },
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );

//         // Combine header and line details
//         const combinedResult = {
//             header: result.rows[0],
//             lines: lineResult.rows
//         };

//         // Send the combined data as JSON response
//         res.status(200).json(combinedResult);

//     } catch (error) {
//         console.error('Error executing Oracle query:', error);
//         res.status(500).json({ error: 'Internal server error' });

//     } finally {
//         if (connection) {
//             try {
//                 // Release the connection back to the pool
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });




app.post('/api/pay-request', async (req, res) => {
    const { selectedProcedures, maxSerialQuote, comNo, username, patientId, patientName,patientvisitId } = req.body;
    console.log(comNo,'com munbre')
    const today = new Date();
    const formattedToday = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`; // Format: MM/DD/YYYY

    // Calculate the date 7 days from today
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + 7);
    const formattedValidUntil = `${(validUntilDate.getMonth() + 1).toString().padStart(2, '0')}/${validUntilDate.getDate().toString().padStart(2, '0')}/${validUntilDate.getFullYear()}`; // Format: MM/DD/YYYY

    let connection;

    try {
        // Establish connection to Oracle Database
        connection = await oracledb.getConnection();

        // Calculate the total amount from the selected procedures
        const totalAmount = selectedProcedures.reduce((sum, procedure) => sum + procedure.pr * procedure.qty, 0);

        // Combine ID and name for the ISSUED_FOR field
        const issuedFor = `${patientId}-${patientName}`;

        // Insert into QUOTATION_HEADERS
        const headerQuery = `
                INSERT INTO QUOTATION_HEADERS (QUOTHEAD_SERIAL, QUOTHEAD_YEAR, COM_NO, ISSUED_FOR, SALESMAN, USRINFO_USERNAME, CUST_ID, TRANSTYP_CODE, CURR_RATE, QUOTATION_VALID_UNTIL,PRINTED, CURR_CODE,STATUS,REMARKS)
            VALUES (:maxSerialQuote, :currentYear, :comNo, :issuedFor, :username, :username, :patientId, 12, 1, TO_DATE(:formattedValidUntil, 'MM/DD/YYYY'), 'N', 'QR','CO', :patientvisitId )
        `;

        // Get the current year
        const currentYear = new Date().getFullYear();

        await connection.execute(headerQuery, {
            maxSerialQuote: maxSerialQuote,
            currentYear: currentYear,
            comNo: comNo,
            issuedFor: issuedFor, // Use combined ID and name
            username: username, // Salesman
            patientId: patientId,
            formattedValidUntil,
            patientvisitId:patientvisitId  // Assuming patientId is passed
           // Total amount calculated
        });

      // Loop through each selected procedure and insert into the PAYMENT_REQUESTS table
for (let index = 0; index < selectedProcedures.length; index++) {
    const procedure = selectedProcedures[index];
    const { itemCode, description, price, qty, comments } = procedure;

    const requestQuery = `
        INSERT INTO QUOTATION_LINES (QUOTHEAD_SERIAL, QUOTLINE_SERIAL, ITM_CODE, ITM_FOREIGN_DESC, PRICE, DUOM_PRICE, QTY, UOM_QTY, COMMENTS, COM_NO, USRINFO_USERNAME, TRANSTYP_CODE, UOM_CODE, UOM_CODE_FOR, STATUS,QUOTHEAD_YEAR)
        VALUES (:maxSerialQuote, :quotLineSerial, :itemCode, :description, :price, :price, :qty, :qty, :comments, :comNo, :username, 12, 'PC', 'PC', 'N', :currentYear)
    `;

    await connection.execute(requestQuery, {
        maxSerialQuote: maxSerialQuote,
        quotLineSerial: index + 1, // Line serial starts from 1 and increments
        itemCode: itemCode,
        description: description,
        price: price,
        qty: qty,
        comments: comments,
        comNo: comNo,
       // Set current date
        username: username,
        currentYear: currentYear // Include created by (username) in the insertion
    });
}




const updateQuery = `
UPDATE CLNC_PATIENT_VISITS
SET STATUS = 'P'
WHERE PAT_ID = :patientId AND VISIT_ID = :visitId
`;

// Bind parameters and execute the update query
await connection.execute(updateQuery, {
    patientId: patientId,
    visitId: patientvisitId // Ensure you use the correct variable for the visit ID
});


// Commit the transaction
await connection.commit();


        // Send a success response
        res.status(200).json({ message: 'Payment request processed successfully!' });
    } catch (error) {
        console.error('Error processing payment request:', error);
        res.status(500).json({ error: 'Error processing payment request' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing Oracle DB connection:', err);
            }
        }
    }
});


app.get('/api/test-detailsexam/:itemCode', async (req, res) => {
    let connection;
    const itemCode = Number(req.params.itemCode); // Ensure itemCode is trimmed
    const { visitId, patientId } = req.query; // Extract visitId and patientId from the query parameters
    console.log('Fetching test details for Item Code:', itemCode, 'Visit ID:', visitId, 'Patient ID:', patientId);
    
    try {
        connection = await oracledb.getConnection();

        // Query to fetch test name, reference range, and additional details from the MASTERS and DETAILS tables
        const query = `
            SELECT 
                m.TEST_HEADER AS testHeader,
                m.TEST_ID AS testId,
                m.TEST_NAME AS testName,
                m.REF_RANGE AS referenceRange,
                d.RESULT AS result,
                d.COMMENTS AS comments,
                d.LAB_NO AS labno
            FROM 
                CLNC_LAB_MASTER m
            LEFT JOIN 
                CLNC_LAB_DETAILS d ON m.TEST_ID = d.TEST_ID
            WHERE 
                m.ITM_CODE = :itemCode
                AND d.VISIT_ID = :visitId
                AND d.PAT_ID = :patientId
        `;

        console.log('Executing Query:', query);
        
        const result = await connection.execute(query, { itemCode, visitId, patientId });
        console.log('Test Details Result:', result);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No test details found for this item code, visit ID, and patient ID.' });
        }

        // Map the result to a more usable format
        const testDetails = result.rows.map(row => ({
            testHeader: row[0],
            testId: row[1],
            testName: row[2],
            referenceRange: row[3],
            result: row[4], // Result from the details table
            comments: row[5],
            labno:row[6] // Comments from the details table
        }));

        res.status(200).json(testDetails);

    } catch (error) {
        console.error('Error fetching test details:', error);
        res.status(500).json({ error: 'Error fetching test details' });
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

// Backend - Node.js/Express
// app.get('/api/test-details/:itemCode', async (req, res) => {
//     let connection;
//     const itemCode = Number(req.params.itemCode);// Ensure itemCode is trimmed
//     console.log('Fetching test details for Item Code:', itemCode);
    
//     try {
//         connection = await oracledb.getConnection();

//         // Query to fetch test name and reference range from the MASTERS table
//         const query = `
//             SELECT 
//             TEST_HEADER AS testHeader,
//              TEST_ID AS testId,
//                 TEST_NAME AS testName,
//                 REF_RANGE AS referenceRange
//             FROM 
//                 CLNC_LAB_MASTER

//             WHERE 
//                 ITM_CODE = :itemCode
//         `;
//         console.log('Executing Query:', query);
        
//         const result = await connection.execute(query, { itemCode });
//         console.log('Test Details Result:', result);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No test details found for this item code.' });
//         }
      
//         const testDetails = {
//             testName: result.rows[0][0], // Assuming first column is test name
//             referenceRange: result.rows[0][1],
//             testId:result.rows[0][2],
//             testHeader:result.rows[0][3]
//              // Assuming second column is reference range
//         };

//         res.status(200).json(result.rows);

//     } catch (error) {
//         console.error('Error fetching test details:', error);
//         res.status(500).json({ error: 'Error fetching test details' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error('Error closing Oracle DB connection:', error);
//             }
//         }
//     }
// });

  
  app.use(express.static(path.join(__dirname, '../clientf/build')));

// Handle GET requests to the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../clientf/build', 'index.html'));
});
  
  
//listen request from any ip
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});



