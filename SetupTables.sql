/**
*make sure to come back and add in any columns that were manually added through the terminal
^^ didn't think we were going to have to do that, but we do! yay!
adding in firebase_iidtoken for the members table.  I think that may be all though.
*/
/*
    ALTER TABLE table_name
ADD COLUMN new_column_name_1 data_type constraint,
ADD COLUMN new_column_name_2 data_type constraint,
...
ADD COLUMN new_column_name_n data_type constraint;
*/

DROP TABLE IF EXISTS Members;
CREATE TABLE Members (MemberID SERIAL PRIMARY KEY,
                      FirstName VARCHAR(255) NOT NULL,
		              LastName VARCHAR(255) NOT NULL,
                      Username VARCHAR(255) NOT NULL UNIQUE,
                      Email VARCHAR(255) NOT NULL UNIQUE,
                      Password VARCHAR(255) NOT NULL,
                      SALT VARCHAR(255),
                      /*adding Firebase_iidtoken VARCHAR(1024), */
                      Firebase_iidtoken VARCHAR(1024),
                      Verification INT DEFAULT 0
);

DROP TABLE IF EXISTS Contacts;
CREATE TABLE Contacts(PrimaryKey SERIAL PRIMARY KEY,
                      MemberID_A INT NOT NULL,
                      MemberID_B INT NOT NULL,
                      Verified INT DEFAULT 0,
                      FOREIGN KEY(MemberID_A) REFERENCES Members(MemberID),
                      FOREIGN KEY(MemberID_B) REFERENCES Members(MemberID)
);

DROP TABLE IF EXISTS Chats;
CREATE TABLE Chats (ChatID SERIAL PRIMARY KEY,
                    Name VARCHAR(255)
);

DROP TABLE IF EXISTS ChatMembers;
CREATE TABLE ChatMembers (ChatID INT NOT NULL,
                          MemberID INT NOT NULL,
                          FOREIGN KEY(MemberID) REFERENCES Members(MemberID),
                          FOREIGN KEY(ChatID) REFERENCES Chats(ChatID)
);

DROP TABLE IF EXISTS Messages;
CREATE TABLE Messages (PrimaryKey SERIAL PRIMARY KEY,
                       ChatID INT,
                       Message VARCHAR(255),
                       MemberID INT,
                       FOREIGN KEY(MemberID) REFERENCES Members(MemberID),
                       FOREIGN KEY(ChatID) REFERENCES Chats(ChatID),
                       TimeStamp TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

DROP TABLE IF EXISTS Locations;
CREATE TABLE Locations (PrimaryKey SERIAL PRIMARY KEY,
                        MemberID INT,
                        Nickname VARCHAR(255),
                        Lat DECIMAL,
                        Long DECIMAL,
                        ZIP INT,
                        FOREIGN KEY(MemberID) REFERENCES Members(MemberID)
);

DROP TABLE IF EXISTS Demo;
CREATE TABLE Demo (DemoID SERIAL PRIMARY KEY,
                        Text VARCHAR(255)
);