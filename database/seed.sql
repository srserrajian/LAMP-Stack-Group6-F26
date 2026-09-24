USE ContactManagerDB;

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
    '$2y$12$x19VssOBqTZ1nYUGV6jBD.c7JdZHXSKRTf2/OH4FTjNX3WnClKIy6',
    'admin',
    0
);