USE ContactManagerDB;

START TRANSACTION;

INSERT IGNORE INTO Users
(
    FirstName,
    LastName,
    Username,
    Email,
    PasswordHash,
    Role,
    IsDisabled
)
VALUES
(
    'Application',
    'Administrator',
    'root',
    'root@contactmanager.local',
    '$2y$12$.SDkblsKmEHw5o14R8jbYOgf/3UVb524xTz0wI9zpFQ6w7zd71gde',
    'admin',
    0
);

DELETE FROM Users
WHERE Username IN
(
    'avery.admin',
    'jamie.lee',
    'marcus.green',
    'sophia.chen'
);

INSERT INTO Users
(
    FirstName,
    LastName,
    Username,
    Email,
    PasswordHash,
    Role,
    IsDisabled
)
VALUES
(
    'Avery',
    'Morgan',
    'avery.admin',
    'avery.admin@example.com',
    '$2y$12$GJRFmQlyaS3h2B2sR3hDCO0SF71K33TNZKNsx9qI6vOzTNjydH1ey',
    'admin',
    0
),
(
    'Jamie',
    'Lee',
    'jamie.lee',
    'jamie.lee@example.com',
    '$2y$12$GJRFmQlyaS3h2B2sR3hDCO0SF71K33TNZKNsx9qI6vOzTNjydH1ey',
    'user',
    0
),
(
    'Marcus',
    'Green',
    'marcus.green',
    'marcus.green@example.com',
    '$2y$12$GJRFmQlyaS3h2B2sR3hDCO0SF71K33TNZKNsx9qI6vOzTNjydH1ey',
    'user',
    0
),
(
    'Sophia',
    'Chen',
    'sophia.chen',
    'sophia.chen@example.com',
    '$2y$12$GJRFmQlyaS3h2B2sR3hDCO0SF71K33TNZKNsx9qI6vOzTNjydH1ey',
    'user',
    0
);

-- =====================================================
-- AVERY MORGAN CONTACTS
-- =====================================================

INSERT INTO Contacts
(
    UserID, FirstName, LastName, Email, Phone,
    Address, City, State, PostalCode, Notes
)
VALUES
(
    (SELECT UserID FROM Users WHERE Username = 'avery.admin'),
    'Liam', 'Thompson', 'liam.thompson@example.com', '407-555-0120',
    '501 Orange Avenue', 'Orlando', 'FL', '32801',
    'Administrative contact'
),
(
    (SELECT UserID FROM Users WHERE Username = 'avery.admin'),
    'Isabella', 'Clark', 'isabella.clark@example.com', '321-555-0116',
    '910 Atlantic Avenue', 'Melbourne', 'FL', '32901',
    'Vendor representative'
);

-- =====================================================
-- JAMIE LEE CONTACTS
-- =====================================================

INSERT INTO Contacts
(
    UserID, FirstName, LastName, Email, Phone,
    Address, City, State, PostalCode, Notes
)
VALUES
(
    (SELECT UserID FROM Users WHERE Username = 'jamie.lee'),
    'Olivia', 'Martinez', 'olivia.martinez@example.com', '407-555-0101',
    '125 Magnolia Avenue', 'Orlando', 'FL', '32801',
    'Friend from college'
),
(
    (SELECT UserID FROM Users WHERE Username = 'jamie.lee'),
    'Daniel', 'Brooks', 'daniel.brooks@example.com', '321-555-0188',
    '742 River Road', 'Titusville', 'FL', '32780',
    'Works at accounting firm'
),
(
    (SELECT UserID FROM Users WHERE Username = 'jamie.lee'),
    'Emily', 'Parker', 'emily.parker@example.com', '407-555-0142',
    '88 Lakeview Drive', 'Winter Park', 'FL', '32789',
    'Emergency contact'
),
(
    (SELECT UserID FROM Users WHERE Username = 'jamie.lee'),
    'Noah', 'Williams', 'noah.williams@example.com', '321-555-0157',
    '301 Garden Street', 'Cocoa', 'FL', '32922',
    'Former coworker'
);

-- =====================================================
-- MARCUS GREEN CONTACTS
-- =====================================================

INSERT INTO Contacts
(
    UserID, FirstName, LastName, Email, Phone,
    Address, City, State, PostalCode, Notes
)
VALUES
(
    (SELECT UserID FROM Users WHERE Username = 'marcus.green'),
    'Ethan', 'Turner', 'ethan.turner@example.com', '305-555-0110',
    '450 Palm Street', 'Miami', 'FL', '33101',
    'Business contact'
),
(
    (SELECT UserID FROM Users WHERE Username = 'marcus.green'),
    'Mia', 'Roberts', 'mia.roberts@example.com', '954-555-0133',
    '920 Sunrise Boulevard', 'Fort Lauderdale', 'FL', '33301',
    'Family friend'
),
(
    (SELECT UserID FROM Users WHERE Username = 'marcus.green'),
    'Lucas', 'Anderson', 'lucas.anderson@example.com', '305-555-0199',
    '630 Brickell Avenue', 'Miami', 'FL', '33131',
    'Project manager'
);

-- =====================================================
-- SOPHIA CHEN CONTACTS
-- =====================================================

INSERT INTO Contacts
(
    UserID, FirstName, LastName, Email, Phone,
    Address, City, State, PostalCode, Notes
)
VALUES
(
    (SELECT UserID FROM Users WHERE Username = 'sophia.chen'),
    'Grace', 'Kim', 'grace.kim@example.com', '813-555-0127',
    '155 Bayshore Drive', 'Tampa', 'FL', '33606',
    'Friend'
),
(
    (SELECT UserID FROM Users WHERE Username = 'sophia.chen'),
    'Henry', 'Davis', 'henry.davis@example.com', '727-555-0174',
    '811 Central Avenue', 'St. Petersburg', 'FL', '33701',
    'Work contact'
),
(
    (SELECT UserID FROM Users WHERE Username = 'sophia.chen'),
    'Natalie', 'Evans', 'natalie.evans@example.com', '813-555-0164',
    '222 Franklin Street', 'Tampa', 'FL', '33602',
    'Dentist'
);

COMMIT;
