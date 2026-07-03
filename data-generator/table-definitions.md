# Table Definitions (28 tables)

> Auto-generated from `generate.py` output CSVs. Use these DDL statements to create
> tables manually in the **Catalyst Data Store** console before running the import script.

---

## 1. State

| Column    | Type        | Notes           |
|-----------|-------------|-----------------|
| StateID   | `INT`       | PRIMARY KEY     |
| StateName | `VARCHAR`   |                 |

---

## 2. GravityOffence

| Column             | Type      | Notes       |
|--------------------|-----------|-------------|
| GravityOffenceID   | `INT`     | PRIMARY KEY |
| GravityOffenceName | `VARCHAR` |             |

---

## 3. District

| Column       | Type      | Notes       |
|--------------|-----------|-------------|
| DistrictID   | `INT`     | PRIMARY KEY |
| StateID      | `INT`     | FK → State  |
| DistrictName | `VARCHAR` |             |
| LatMin       | `DECIMAL` |             |
| LatMax       | `DECIMAL` |             |
| LonMin       | `DECIMAL` |             |
| LonMax       | `DECIMAL` |             |

---

## 4. UnitType

| Column     | Type      | Notes       |
|------------|-----------|-------------|
| UnitTypeID | `INT`     | PRIMARY KEY |
| UnitTypeName| `VARCHAR`|             |

---

## 5. Unit

| Column     | Type      | Notes          |
|------------|-----------|----------------|
| UnitID     | `INT`     | PRIMARY KEY    |
| DistrictID | `INT`     | FK → District  |
| UnitTypeID | `INT`     | FK → UnitType  |
| UnitName   | `VARCHAR` |                |
| Latitude   | `DECIMAL` |                |
| Longitude  | `DECIMAL` |                |

---

## 6. Rank

| Column   | Type      | Notes       |
|----------|-----------|-------------|
| RankID   | `INT`     | PRIMARY KEY |
| RankName | `VARCHAR` |             |
| RankLevel| `INT`     |             |

---

## 7. Designation

| Column          | Type      | Notes       |
|-----------------|-----------|-------------|
| DesignationID   | `INT`     | PRIMARY KEY |
| DesignationName | `VARCHAR` |             |
| RankID          | `INT`     | FK → Rank   |

---

## 8. Employee

| Column        | Type      | Notes            |
|---------------|-----------|------------------|
| EmployeeID    | `INT`     | PRIMARY KEY      |
| UnitID        | `INT`     | FK → Unit        |
| DesignationID | `INT`     | FK → Designation |
| FirstName     | `VARCHAR` |                  |
| LastName      | `VARCHAR` |                  |
| Gender        | `CHAR(1)` | M / F            |
| DOB           | `DATE`    |                  |
| JoinDate      | `DATE`    |                  |
| PhoneNo       | `VARCHAR` |                  |

---

## 9. Act

| Column       | Type      | Notes       |
|--------------|-----------|-------------|
| ActID        | `INT`     | PRIMARY KEY |
| ActName      | `VARCHAR` |             |
| ActShortName | `VARCHAR` |             |

---

## 10. Section

| Column             | Type      | Notes       |
|--------------------|-----------|-------------|
| SectionID          | `INT`     | PRIMARY KEY |
| ActID              | `INT`     | FK → Act    |
| SectionNo          | `VARCHAR` | e.g. "302"  |
| SectionDescription | `VARCHAR` |             |

---

## 11. CrimeHead

| Column          | Type      | Notes                |
|-----------------|-----------|----------------------|
| CrimeHeadID     | `INT`     | PRIMARY KEY          |
| CrimeHeadName   | `VARCHAR` |                      |
| GravityOffenceID| `INT`     | FK → GravityOffence  |

---

## 12. CrimeSubHead

| Column          | Type      | Notes            |
|-----------------|-----------|------------------|
| CrimeSubHeadID  | `INT`     | PRIMARY KEY      |
| CrimeHeadID     | `INT`     | FK → CrimeHead   |
| CrimeSubHeadName| `VARCHAR` |                  |

---

## 13. CrimeHeadActSection

| Column       | Type  | Notes              |
|--------------|-------|--------------------|
| CHASID       | `INT` | PRIMARY KEY        |
| CrimeSubHeadID| `INT`| FK → CrimeSubHead  |
| SectionID    | `INT` | FK → Section       |

---

## 14. CaseCategory

| Column         | Type      | Notes       |
|----------------|-----------|-------------|
| CaseCategoryID | `INT`     | PRIMARY KEY |
| CategoryCode   | `VARCHAR` | "1","2" etc |
| CategoryShort  | `VARCHAR` | FIR, UDR    |
| CategoryName   | `VARCHAR` |             |

---

## 15. CaseStatusMaster

| Column        | Type      | Notes       |
|---------------|-----------|-------------|
| CaseStatusID  | `INT`     | PRIMARY KEY |
| CaseStatusName| `VARCHAR` |             |

---

## 16. OccupationMaster

| Column        | Type      | Notes       |
|---------------|-----------|-------------|
| OccupationID  | `INT`     | PRIMARY KEY |
| OccupationName| `VARCHAR` |             |

---

## 17. ReligionMaster

| Column      | Type      | Notes       |
|-------------|-----------|-------------|
| ReligionID  | `INT`     | PRIMARY KEY |
| ReligionName| `VARCHAR` |             |

---

## 18. CasteMaster

| Column     | Type      | Notes              |
|------------|-----------|--------------------|
| CasteID    | `INT`     | PRIMARY KEY        |
| CasteName  | `VARCHAR` |                    |
| ReligionID | `INT`     | FK → ReligionMaster|

---

## 19. Court

| Column     | Type      | Notes          |
|------------|-----------|----------------|
| CourtID    | `INT`     | PRIMARY KEY    |
| CourtName  | `VARCHAR` |                |
| DistrictID | `INT`     | FK → District  |

---

## 20. CaseMaster

| Column           | Type       | Notes                |
|------------------|------------|----------------------|
| CaseID           | `INT`      | PRIMARY KEY          |
| CrimeNo          | `VARCHAR`  | unique               |
| CaseNo           | `VARCHAR`  |                      |
| UnitID           | `INT`      | FK → Unit            |
| DistrictID       | `INT`      | FK → District        |
| CaseCategoryID   | `INT`      | FK → CaseCategory    |
| CrimeHeadID      | `INT`      | FK → CrimeHead       |
| CrimeSubHeadID   | `INT`      | FK → CrimeSubHead    |
| GravityOffenceID | `INT`      | FK → GravityOffence  |
| CaseStatusID     | `INT`      | FK → CaseStatusMaster|
| IOEmployeeID     | `INT`      | FK → Employee        |
| CourtID          | `INT`      | FK → Court           |
| RegistrationDate | `DATE`     |                      |
| IsAnomaly        | `BOOLEAN`  | 0 or 1               |
| AnomalyType      | `VARCHAR`  | nullable             |

---

## 21. OccurrenceTime

| Column             | Type       | Notes            |
|--------------------|------------|------------------|
| OccurrenceTimeID   | `INT`      | PRIMARY KEY      |
| CaseID             | `INT`      | FK → CaseMaster  |
| IncidentFromDate   | `DATETIME` |                  |
| IncidentToDate     | `DATETIME` |                  |
| InfoReceivedPSDate | `DATETIME` |                  |
| Latitude           | `DECIMAL`  |                  |
| Longitude          | `DECIMAL`  |                  |
| BriefFacts         | `TEXT`     |                  |
| MOPhrase           | `TEXT`     |                  |

---

## 22. ComplainantDetails

| Column        | Type      | Notes                |
|---------------|-----------|----------------------|
| ComplainantID | `INT`     | PRIMARY KEY          |
| CaseID        | `INT`     | FK → CaseMaster      |
| Name          | `VARCHAR` |                      |
| Gender        | `CHAR(1)` | M / F                |
| Age           | `INT`     |                      |
| OccupationID  | `INT`     | FK → OccupationMaster|
| ReligionID    | `INT`     | FK → ReligionMaster  |
| CasteID       | `INT`     | FK → CasteMaster     |
| PhoneNo       | `VARCHAR` |                      |
| Address       | `VARCHAR` |                      |

---

## 23. Victim

| Column       | Type      | Notes                |
|--------------|-----------|----------------------|
| VictimID     | `INT`     | PRIMARY KEY          |
| CaseID       | `INT`     | FK → CaseMaster      |
| Name         | `VARCHAR` |                      |
| Gender       | `CHAR(1)` | M / F                |
| Age          | `INT`     |                      |
| OccupationID | `INT`     | FK → OccupationMaster|
| ReligionID   | `INT`     | FK → ReligionMaster  |
| CasteID      | `INT`     | FK → CasteMaster     |
| InjuryType   | `VARCHAR` | Fatal / Minor / etc  |

---

## 24. Accused

| Column           | Type      | Notes                |
|------------------|-----------|----------------------|
| AccusedID        | `INT`     | PRIMARY KEY          |
| CaseID           | `INT`     | FK → CaseMaster      |
| Name             | `VARCHAR` |                      |
| Gender           | `CHAR(1)` | M / F                |
| Age              | `INT`     |                      |
| OccupationID     | `INT`     | FK → OccupationMaster|
| ReligionID       | `INT`     | FK → ReligionMaster  |
| CasteID          | `INT`     | FK → CasteMaster     |
| Address          | `VARCHAR` |                      |
| MOPhrase         | `TEXT`    |                      |
| IsRepeatOffender | `BOOLEAN` | 0 or 1               |
| IsNetworkMember  | `BOOLEAN` | 0 or 1               |

---

## 25. ActSectionAssociation

| Column    | Type  | Notes           |
|-----------|-------|-----------------|
| AssocID   | `INT` | PRIMARY KEY     |
| CaseID    | `INT` | FK → CaseMaster |
| SectionID | `INT` | FK → Section    |

---

## 26. ArrestSurrender

| Column            | Type      | Notes            |
|-------------------|-----------|------------------|
| ArrestID          | `INT`     | PRIMARY KEY      |
| CaseID            | `INT`     | FK → CaseMaster  |
| AccusedID         | `INT`     | FK → Accused     |
| ArrestDate        | `DATE`    |                  |
| ArrestType        | `VARCHAR` | Arrested/Surrender|
| ArrestingOfficerID| `INT`     | FK → Employee    |

---

## 27. ChargesheetDetails

| Column   | Type      | Notes            |
|----------|-----------|------------------|
| CSID     | `INT`     | PRIMARY KEY      |
| CaseID   | `INT`     | FK → CaseMaster  |
| CSType   | `CHAR(1)` | A / B / C        |
| CSDate   | `DATE`    |                  |
| CourtID  | `INT`     | FK → Court       |
| JudgeName| `VARCHAR` |                  |

---

## 28. DistrictStats

| Column             | Type      | Notes                |
|--------------------|-----------|----------------------|
| DistrictID         | `INT`     | PRIMARY KEY, FK → District |
| Population         | `BIGINT`  |                      |
| PopulationDensity  | `INT`     | per km²              |
| UrbanizationLevel  | `VARCHAR` | Urban/Peri-urban/Rural/Coastal/Semi-urban |
| ChargesheetRate    | `DECIMAL` | 0.000 – 1.000        |

---

> **Import order**: see `output/import_order.txt` (FK dependencies respected).
> Created tables must exactly match these names (case-sensitive) in the Catalyst console.
