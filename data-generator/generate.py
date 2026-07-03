#!/usr/bin/env python3
"""
Karnataka Police FIR Database Generator
========================================
Generates 50,000 synthetic FIR records (2023-2026) with full FK integrity,
seven planted analytical patterns, and 25 behavioral anomaly cases.

Tables produced (28):
  State, District, UnitType, Unit, Rank, Designation, Employee,
  Act, Section, CrimeHead, CrimeSubHead, CrimeHeadActSection,
  CaseCategory, GravityOffence, CaseStatusMaster, OccupationMaster,
  ReligionMaster, CasteMaster, Court,
  CaseMaster, OccurrenceTime, ComplainantDetails, Victim, Accused,
  ActSectionAssociation, ArrestSurrender, ChargesheetDetails,
  DistrictStats

Usage:
  pip install faker pandas numpy
  py generate.py        (Windows)
  python generate.py    (Linux/Mac)
"""

import math
import os
import random
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
fake = Faker("en_IN")
fake.seed_instance(SEED)

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / "output"
DOCS_DIR = SCRIPT_DIR.parent / "docs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_CASES = 50_000
START_DATE = date(2023, 1, 1)
END_DATE = date(2026, 6, 30)

HOTSPOT_LAT = 12.975
HOTSPOT_LON = 77.625
HOTSPOT_RADIUS_DEG = 0.018          # ~2 km

BURST_LAT = 12.720
BURST_LON = 77.285
BURST_ANCHOR = date(2025, 4, 14)

print("=" * 64)
print("  Karnataka Police FIR Database Generator")
print(f"  Target {TARGET_CASES:,} cases  |  {START_DATE} to {END_DATE}")
print("=" * 64)


# ---------------------------------------------------------------------------
# SECTION A: REFERENCE CONSTANTS
# ---------------------------------------------------------------------------

_DISTRICT_RAW = [
    ( 1, "Bengaluru Urban",   12.85, 13.14, 77.45, 77.78, 35.0),
    ( 2, "Bengaluru Rural",   12.80, 13.35, 77.05, 77.75,  2.5),
    ( 3, "Mysuru",            11.90, 12.50, 76.20, 76.80, 10.0),
    ( 4, "Dakshina Kannada",  12.30, 13.00, 74.80, 75.60,  8.0),
    ( 5, "Belagavi",          15.65, 16.60, 74.35, 75.45,  4.5),
    ( 6, "Kalaburagi",        17.00, 17.90, 76.50, 77.65,  3.0),
    ( 7, "Dharwad",           15.20, 15.60, 74.90, 75.45,  2.5),
    ( 8, "Ballari",           14.80, 15.60, 76.45, 77.20,  2.5),
    ( 9, "Vijayapura",        16.45, 17.20, 75.50, 76.50,  2.0),
    (10, "Shivamogga",        13.50, 14.40, 75.10, 76.00,  2.0),
    (11, "Tumakuru",          13.10, 14.10, 76.50, 77.40,  1.8),
    (12, "Hassan",            12.70, 13.30, 75.80, 76.50,  1.5),
    (13, "Chitradurga",       13.90, 14.90, 76.20, 76.90,  1.2),
    (14, "Davanagere",        14.20, 14.70, 75.60, 76.20,  1.5),
    (15, "Raichur",           15.85, 16.70, 76.70, 77.60,  1.2),
    (16, "Bidar",             17.60, 18.25, 76.75, 77.75,  1.0),
    (17, "Bagalkot",          15.80, 16.80, 75.40, 76.30,  1.0),
    (18, "Gadag",             15.15, 15.80, 75.30, 75.90,  0.8),
    (19, "Haveri",            14.50, 15.10, 74.95, 75.65,  0.8),
    (20, "Uttara Kannada",    13.90, 15.10, 74.10, 75.20,  0.8),
    (21, "Chikkamagaluru",    12.80, 13.70, 75.40, 76.20,  0.8),
    (22, "Mandya",            12.20, 12.80, 76.40, 77.10,  1.0),
    (23, "Chamarajanagar",    11.80, 12.30, 76.60, 77.45,  0.7),
    (24, "Kodagu",            11.80, 12.80, 75.30, 76.20,  0.7),
    (25, "Udupi",             13.10, 13.80, 74.60, 75.30,  0.8),
    (26, "Chikkaballapur",    13.40, 13.90, 77.40, 78.00,  0.7),
    (27, "Kolar",             12.70, 13.45, 77.90, 78.60,  0.8),
    (28, "Ramanagara",        12.50, 13.00, 77.00, 77.55,  0.7),
    (29, "Yadgir",            16.55, 17.10, 76.65, 77.50,  0.6),
    (30, "Koppal",            15.15, 15.90, 76.00, 76.70,  0.6),
    (31, "Vijayanagara",      14.90, 15.60, 76.00, 76.80,  0.6),
]
_total_w = sum(d[6] for d in _DISTRICT_RAW)
DISTRICTS        = [(*d[:6], d[6] / _total_w) for d in _DISTRICT_RAW]
DISTRICT_IDS     = [d[0] for d in DISTRICTS]
DISTRICT_WEIGHTS = [d[6] for d in DISTRICTS]
DIST_LOOKUP      = {d[0]: d for d in DISTRICTS}

RURAL_DISTRICT_IDS = {13, 15, 16, 17, 18, 19, 20, 21, 23, 24, 26, 28, 29, 30, 31}

STATION_COUNTS = {
     1: 15,  2: 10,  3: 12,  4: 11,  5: 12,  6:  9,  7:  9,
     8:  9,  9:  8, 10:  9, 11:  9, 12:  8, 13:  8, 14:  9,
    15:  8, 16:  8, 17:  8, 18:  8, 19:  8, 20:  8, 21:  8,
    22:  9, 23:  8, 24:  8, 25:  9, 26:  8, 27:  8, 28:  8,
    29:  8, 30:  8, 31:  8,
}

RANK_DATA = [
    ( 1, "Director General of Police",      1),
    ( 2, "Additional DGP",                  2),
    ( 3, "Inspector General of Police",     3),
    ( 4, "Deputy Inspector General",        4),
    ( 5, "Superintendent of Police",        5),
    ( 6, "Additional SP",                   6),
    ( 7, "Deputy Superintendent of Police", 7),
    ( 8, "Inspector of Police",             8),
    ( 9, "Sub Inspector",                   9),
    (10, "Assistant Sub Inspector",        10),
    (11, "Head Constable",                 11),
    (12, "Police Constable",               12),
    (13, "Driver Police Constable",        13),
]

DESIG_DATA = [
    ( 1, "Director General of Police",      1),
    ( 2, "Additional DGP (Crime)",          2),
    ( 3, "Inspector General of Police",     3),
    ( 4, "Deputy Inspector General",        4),
    ( 5, "Superintendent of Police",        5),
    ( 6, "Additional Superintendent",       6),
    ( 7, "Deputy Superintendent",           7),
    ( 8, "Inspector of Police",             8),
    ( 9, "Station House Officer",           8),
    (10, "Sub Inspector",                   9),
    (11, "Assistant Sub Inspector",        10),
    (12, "Head Constable",                 11),
    (13, "Police Constable",               12),
    (14, "Driver PC",                      13),
    (15, "Women Police Constable",         12),
]
STATION_DESIG_IDS = [8, 9, 10, 11, 12, 13, 14, 15]

ACT_DATA = [
    (1, "Indian Penal Code",                                     "IPC"),
    (2, "Bharatiya Nyaya Sanhita",                               "BNS"),
    (3, "Information Technology Act",                             "IT Act"),
    (4, "Narcotic Drugs and Psychotropic Substances Act",         "NDPS"),
    (5, "Protection of Children from Sexual Offences Act",        "POCSO"),
    (6, "Karnataka Excise Act",                                   "KE Act"),
    (7, "Motor Vehicles Act",                                     "MVA"),
]

SECTION_DATA = [
    ( 1, 1, "302",  "Murder"),
    ( 2, 1, "304",  "Culpable homicide not amounting to murder"),
    ( 3, 1, "304A", "Causing death by negligence"),
    ( 4, 1, "307",  "Attempt to commit murder"),
    ( 5, 1, "323",  "Voluntarily causing hurt"),
    ( 6, 1, "324",  "Voluntarily causing hurt by dangerous weapons"),
    ( 7, 1, "325",  "Voluntarily causing grievous hurt"),
    ( 8, 1, "354",  "Assault or criminal force to outrage modesty"),
    ( 9, 1, "354A", "Sexual harassment"),
    (10, 1, "376",  "Rape"),
    (11, 1, "379",  "Theft"),
    (12, 1, "380",  "Theft in dwelling house"),
    (13, 1, "392",  "Robbery"),
    (14, 1, "393",  "Attempt to commit robbery"),
    (15, 1, "395",  "Dacoity"),
    (16, 1, "420",  "Cheating and dishonest inducement"),
    (17, 1, "427",  "Mischief causing damage"),
    (18, 1, "436",  "Mischief by fire or explosive"),
    (19, 1, "457",  "Lurking house-trespass by night"),
    (20, 1, "458",  "Lurking house-trespass with assault"),
    (21, 1, "465",  "Forgery"),
    (22, 1, "468",  "Forgery for cheating"),
    (23, 1, "471",  "Using forged document as genuine"),
    (24, 1, "498A", "Cruelty by husband or relatives"),
    (25, 1, "506",  "Criminal intimidation"),
    (26, 1, "509",  "Word or gesture to insult modesty of a woman"),
    (27, 2, "103",  "Murder (BNS 2023)"),
    (28, 2, "109",  "Abetment of suicide (BNS)"),
    (29, 2, "115",  "Voluntarily causing hurt (BNS)"),
    (30, 3, "43",   "Damage to computer systems"),
    (31, 3, "66C",  "Identity theft"),
    (32, 3, "66D",  "Cheating by personation using computer resource"),
    (33, 3, "67",   "Publishing obscene material electronically"),
    (34, 4, "20",   "Cannabis possession / production"),
    (35, 4, "21",   "Opium possession / production"),
    (36, 4, "22",   "Psychotropic substances possession"),
    (37, 5, "4",    "Penetrative sexual assault on child"),
    (38, 5, "6",    "Aggravated penetrative sexual assault"),
    (39, 5, "7",    "Sexual assault on child"),
    (40, 6, "32",   "Possession of liquor without permit"),
    (41, 6, "38",   "Illicit distillation of liquor"),
    (42, 7, "184",  "Driving dangerously"),
    (43, 7, "185",  "Driving under influence of alcohol"),
]

GRAVITY_DATA = [(1, "Heinous"), (2, "Non-Heinous")]

CRIME_HEAD_DATA = [
    ( 1, "Crimes Against Body",     1, "violent"),
    ( 2, "Crimes Against Property", 2, "property"),
    ( 3, "Crimes Against Women",    1, "sexual"),
    ( 4, "Crimes Against Children", 1, "sexual"),
    ( 5, "Economic Offences",       2, "white_collar"),
    ( 6, "Cyber Crimes",            2, "cyber"),
    ( 7, "Drug Offences",           1, "drug"),
    ( 8, "Burglary",                1, "property"),
    ( 9, "Road Accidents",          2, "accident"),
    (10, "Excise Offences",         2, "excise"),
]

CRIME_SUB_HEAD_DATA = [
    ( 1,  1, "Murder",                     [1],           1),
    ( 2,  1, "Attempt to Murder",          [4],           4),
    ( 3,  1, "Culpable Homicide",          [2],           2),
    ( 4,  1, "Grievous Hurt",              [7],           7),
    ( 5,  1, "Simple Hurt",                [5, 6],        5),
    ( 6,  2, "Vehicle Theft",              [11],         11),
    ( 7,  2, "Theft (Other)",              [11, 12],     11),
    ( 8,  2, "Robbery",                    [13],         13),
    ( 9,  2, "Dacoity",                    [15],         15),
    (10,  2, "Mischief",                   [17, 18],     17),
    (11,  3, "Rape",                       [10],         10),
    (12,  3, "Sexual Harassment",          [8, 9],        8),
    (13,  3, "Domestic Violence/Cruelty",  [24],         24),
    (14,  4, "POCSO - Penetrative",        [37, 38],     37),
    (15,  4, "POCSO - Non-Penetrative",    [39],         39),
    (16,  5, "Cheating",                   [16],         16),
    (17,  5, "Forgery",                    [21, 22],     21),
    (18,  6, "Online Financial Fraud",     [31, 32],     31),
    (19,  6, "Online Obscenity",           [33],         33),
    (20,  7, "Cannabis/Ganja",             [34],         34),
    (21,  7, "Opium/Heroin",               [35],         35),
    (22,  7, "Psychotropic Substances",    [36],         36),
    (23,  8, "Burglary by Night",          [19, 20],     19),
    (24,  8, "Attempt to Burglary",        [19],         19),
    (25,  9, "Drunken Driving",            [42, 43],     42),
    (26, 10, "Illicit Liquor",             [41],         41),
    (27, 10, "Liquor Possession",          [40],         40),
]

SH_TO_CH      = {s[0]: s[1] for s in CRIME_SUB_HEAD_DATA}
SH_SECTIONS   = {s[0]: s[3] for s in CRIME_SUB_HEAD_DATA}
SH_PRI_SEC    = {s[0]: s[4] for s in CRIME_SUB_HEAD_DATA}
CH_TO_GRAVITY = {c[0]: c[2] for c in CRIME_HEAD_DATA}

SH_CATEGORY = {
     1:"murder",        2:"murder",       3:"murder",
     4:"hurt",          5:"hurt",
     6:"vehicle_theft", 7:"theft",
     8:"robbery",       9:"robbery",      10:"mischief",
    11:"sexual",       12:"sexual",       13:"domestic",
    14:"sexual",       15:"sexual",
    16:"cheating",     17:"cheating",
    18:"cyber",        19:"cyber",
    20:"drug",         21:"drug",         22:"drug",
    23:"burglary",     24:"burglary",
    25:"accident",     26:"excise",       27:"excise",
}

CASE_CATEGORY_DATA = [
    (1, "1", "FIR",   "First Information Report"),
    (2, "2", "UDR",   "Unnatural Death Report"),
    (3, "3", "PAR",   "Petition and Representation"),
    (4, "4", "ZFIR",  "Zero FIR"),
]
CAT_CODE_MAP = {c[0]: c[1] for c in CASE_CATEGORY_DATA}

CASE_STATUS_DATA = [
    (1,"Under Investigation"),(2,"Chargesheeted"),(3,"Referred to Court"),
    (4,"Closed - Undetected"),(5,"Closed - False Case"),
    (6,"Pending CS Filing"),(7,"Stayed by Court"),
]

OCCUPATION_DATA = [
    ( 1,"Student"),         ( 2,"Farmer"),
    ( 3,"Business"),        ( 4,"Private Employee"),
    ( 5,"Government Employee"), ( 6,"Daily Wage Worker"),
    ( 7,"Unemployed"),      ( 8,"Housewife"),
    ( 9,"Driver"),          (10,"Trader"),
    (11,"IT Professional"), (12,"Teacher"),
    (13,"Doctor"),          (14,"Lawyer"),
    (15,"Retired"),         (16,"Shopkeeper"),
    (17,"Auto/Taxi Driver"),(18,"Mechanic"),
]
OCC_IDS = [o[0] for o in OCCUPATION_DATA]

RELIGION_DATA = [
    (1,"Hindu"),(2,"Muslim"),(3,"Christian"),
    (4,"Jain"),(5,"Buddhist"),(6,"Sikh"),(7,"Others"),
]
REL_IDS     = [r[0] for r in RELIGION_DATA]
REL_WEIGHTS = [55, 15, 10, 3, 2, 1, 14]

CASTE_DATA = [
    ( 1,"General",   1),( 2,"OBC",      1),( 3,"SC",      1),
    ( 4,"ST",        1),( 5,"Vokkaliga", 1),( 6,"Lingayat", 1),
    ( 7,"Kuruba",    1),( 8,"Bunt",      1),
    ( 9,"General",   2),(10,"OBC",       2),(11,"SC",       2),
    (12,"General",   3),(13,"OBC",       3),
    (14,"General",   4),(15,"OBC",       4),
    (16,"Mahar",     5),(17,"Others",    6),(18,"Others",   7),
]
CASTE_BY_REL = defaultdict(list)
for _c in CASTE_DATA:
    CASTE_BY_REL[_c[2]].append(_c[0])

MALE_FIRST = [
    "Rajesh","Suresh","Ramesh","Mahesh","Ganesh","Naresh","Dinesh",
    "Rakesh","Umesh","Shivakumar","Ravi","Naveen","Praveen","Anil",
    "Sunil","Vikas","Manoj","Sanjay","Vijay","Ajay","Deepak",
    "Prasad","Basavaraj","Manjunath","Siddesh","Girish","Harish",
    "Nagaraj","Gopal","Venkatesh","Krishnaraj","Shashi","Lokesh",
    "Puneeth","Chethan","Bharath","Abhishek","Kiran","Surendra",
    "Nandakumar","Pradeep","Santosh","Madesh","Mohammed","Imran",
    "Faisal","Rahul","Arjun","Akash","Nikhil","Rohan","Salman",
]
FEMALE_FIRST = [
    "Lakshmi","Savitha","Kavitha","Rekha","Sudha","Radha","Uma",
    "Geeta","Meena","Priya","Deepa","Asha","Usha","Vanitha",
    "Manjula","Shanthala","Padmavathi","Ratna","Sumathi","Pushpa",
    "Hemavathi","Sharadha","Nirmala","Parvathi","Gayathri","Anitha",
    "Sunitha","Vidya","Veena","Mallika","Roopa","Nagaveni","Pavithra",
    "Divya","Sowmya","Spandana","Bhavana","Chandana","Nanditha",
    "Rubina","Fathima","Ayesha","Akshata","Pooja","Sneha","Reshma",
]
SURNAMES = [
    "Gowda","Naik","Rao","Sharma","Kumar","Reddy","Hegde","Nayak",
    "Shetty","Bhat","Patil","Joshi","Nair","Verma","Singh","Khan",
    "Patel","Gupta","Kamath","Shenoy","Prabhu","Acharya","Raju",
    "Swamy","Murthy","Prasad","Choudhary","Desai","Sridhara",
    "Yellappa","Basappa","Thimmaiah","Krishnappa","Veerappa",
    "Muddaiah","Lingaiah","Hanumaiah","Rangaiah","Puttaiah",
    "Shaikh","Siddiqui","Mirza","DSouza","Fernandez","Pinto",
]

MO_PHRASES = {
    "burglary":[
        "gained entry through rear window after removing iron grille",
        "forced open rear wooden door using crowbar",
        "broke rear ventilation shaft and crawled inside",
        "climbed compound wall under cover of darkness and entered through rear window",
        "removed clay roof tiles and descended into premises",
    ],
    "vehicle_theft":[
        "broke steering column lock using fabricated key",
        "pushed parked two-wheeler silently and hotwired ignition",
        "towed two-wheeler away using rope after attendant left",
        "used duplicate key to start and drive away the vehicle",
    ],
    "theft":[
        "entered unlocked premises and removed valuables",
        "distracted occupant and removed cash from premises",
        "lifted articles from unattended counter",
    ],
    "cyber":[
        "posed as bank official via phone call and extracted OTP",
        "sent phishing link via SMS impersonating IRCTC booking portal",
        "impersonated customer care executive of e-commerce platform",
        "created fake UPI ID resembling victim contact and diverted payment",
        "accessed victim net banking credentials using SIM-swap technique",
        "posed as electricity department official and collected advance via UPI",
    ],
    "robbery":[
        "confronted victim with knife near ATM and snatched cash and valuables",
        "posed as delivery agent and forcibly entered premises",
        "waylaid victim on isolated road and snatched gold chain",
        "accosted victim on pretext of asking directions and grabbed bag",
    ],
    "murder":[
        "attacked victim with sharp-edged agricultural implement following altercation",
        "administered poison mixed in food and beverages",
        "strangulated victim using electric wire",
        "inflicted multiple stab wounds using butcher knife",
    ],
    "drug":[
        "found in possession of contraband concealed in vehicle spare tyre",
        "recovered contraband from false bottom of suitcase",
        "intercepted while transporting ganja concealed in vegetable sacks",
        "found in possession of contraband hidden inside mattress",
    ],
    "domestic":[
        "subjected victim to physical assault and verbal abuse within matrimonial home",
        "harassed victim demanding additional dowry from parental home",
        "inflicted injuries using blunt object within matrimonial premises",
    ],
    "sexual":[
        "gained victims trust over months before committing offence",
        "committed offence while victim was in incapacitated state",
        "took victim to isolated location under false pretext and committed offence",
    ],
    "accident":[
        "drove vehicle in rash and negligent manner at excessive speed",
        "operated vehicle in inebriated condition and lost directional control",
    ],
    "cheating":[
        "approached victim with fake investment scheme promising high returns",
        "collected advance payment for supply of goods and absconded",
        "forged identity documents to obtain financial benefit from victim",
    ],
    "hurt":   ["accosted victim and caused bodily harm using blunt instrument"],
    "mischief":["set fire to victims property following personal dispute"],
    "excise":[
        "operating illicit arrack distillation unit concealed in agricultural shed",
        "transporting liquor without valid permit concealed in water tanker",
    ],
}

REPEAT_MOS = [
    "posed as bank official via mobile phone and extracted OTP",
    "gained entry through rear window after removing iron grille",
    "waylaid victim near ATM and snatched gold chain and mobile phone",
    "posed as BESCOM meter-reader and collected illegal advance payment",
    "accessed victim accounts using stolen SIM card via SIM-swap technique",
    "confronted victim with knife on isolated rural road demanding cash and jewellery",
    "pushed parked motorcycle silently and departed using hotwire ignition technique",
    "operated fake online shopping portal collecting advance payments from buyers",
    "approached victim posing as licensed property dealer and collected advance",
    "intercepted courier and substituted genuine goods with counterfeit items",
    "administered sedative mixed in beverage and subsequently robbed victim",
    "broke into commercial establishments by forcing shutters using hydraulic jack",
    "posed as BBMP revenue inspector and extracted bribes for property mutations",
    "created fake matrimonial profile online and defrauded multiple victims",
    "operated fake employment agency collecting advance fees from rural youth",
]

NETWORK_MO = "operated in coordinated group with pre-assigned roles to execute targeted robbery"
BURST_MO   = "waylaid victim on Bengaluru-Mysuru highway and snatched valuables using blunt weapons"

CRIME_HOUR_RANGES = {
    "murder":        (18, 23),
    "hurt":          (17, 23),
    "vehicle_theft": (22,  4),
    "theft":         (21,  4),
    "robbery":       (20,  2),
    "burglary":      (21,  4),
    "cheating":      ( 9, 18),
    "cyber":         ( 9, 20),
    "drug":          ( 0, 23),
    "domestic":      (17, 23),
    "sexual":        (17, 23),
    "accident":      (18,  2),
    "excise":        ( 0, 23),
    "mischief":      (17, 23),
}

SH_WEIGHTS = {
     1:1.5, 2:2.0, 3:0.5, 4:3.0, 5:5.0,
     6:9.0, 7:8.0, 8:3.5, 9:0.5,10:2.5,
    11:2.0,12:3.0,13:6.0,14:1.0,15:0.8,
    16:5.0,17:2.0,18:8.0,19:1.0,
    20:5.0,21:1.5,22:1.0,
    23:7.0,24:2.0,25:4.0,26:3.0,27:2.0,
}

DISTRICT_SOCIO = {
     1:(13_600_000,3200,"Urban"),       2:( 1_200_000, 290,"Peri-urban"),
     3:( 3_300_000, 420,"Urban"),       4:( 2_200_000, 460,"Urban"),
     5:( 5_000_000, 570,"Semi-urban"),  6:( 2_600_000, 310,"Semi-urban"),
     7:( 1_900_000, 700,"Semi-urban"),  8:( 2_500_000, 350,"Semi-urban"),
     9:( 2_200_000, 240,"Rural"),      10:( 1_800_000, 280,"Semi-urban"),
    11:( 2_700_000, 320,"Semi-urban"), 12:( 1_900_000, 220,"Rural"),
    13:( 1_700_000, 170,"Rural"),      14:( 2_000_000, 380,"Semi-urban"),
    15:( 2_000_000, 200,"Rural"),      16:( 1_700_000, 230,"Rural"),
    17:( 1_900_000, 200,"Rural"),      18:( 1_100_000, 240,"Rural"),
    19:( 1_600_000, 230,"Rural"),      20:( 1_500_000, 110,"Rural"),
    21:( 1_200_000, 100,"Rural"),      22:( 2_100_000, 320,"Rural"),
    23:( 1_100_000, 140,"Rural"),      24:(   550_000, 120,"Rural"),
    25:( 1_200_000, 310,"Coastal"),    26:( 1_300_000, 220,"Rural"),
    27:( 1_700_000, 250,"Semi-urban"), 28:( 1_200_000, 220,"Rural"),
    29:( 1_200_000, 170,"Rural"),      30:( 1_400_000, 210,"Rural"),
    31:( 1_600_000, 220,"Rural"),
}


# ---------------------------------------------------------------------------
# SECTION B: HELPERS
# ---------------------------------------------------------------------------

def rand_name(gender=None):
    if gender is None:
        gender = random.choice(["M", "F"])
    pool = MALE_FIRST if gender == "M" else FEMALE_FIRST
    return f"{random.choice(pool)} {random.choice(SURNAMES)}"

def rand_phone():
    pfx = random.choice(["98","97","96","95","94","93","80","81","82","83","99"])
    return pfx + str(random.randint(10_000_000, 99_999_999))

def rand_amount(lo=500, hi=500_000):
    return round(random.randint(lo, hi) / 500) * 500

def rand_vehicle_reg():
    return f"KA {random.randint(1,70):02d} {random.choice(['AB','AC','AD','BC','BD'])} {random.randint(1000,9999)}"

def rand_point_in_box(lat_min, lat_max, lon_min, lon_max):
    return (round(random.uniform(lat_min, lat_max), 6),
            round(random.uniform(lon_min, lon_max), 6))

def rand_point_near(lat, lon, radius_deg):
    angle = random.uniform(0, 2 * math.pi)
    r = random.uniform(0, radius_deg)
    return (round(lat + r * math.cos(angle), 6),
            round(lon + r * math.sin(angle), 6))

def pick_hour(sh_id, *, is_improbable=False, is_hotspot=False):
    if is_improbable:
        return random.randint(2, 4)
    cat = SH_CATEGORY.get(sh_id, "other")
    if is_hotspot and cat == "burglary":
        return random.choice([23, 0, 1, 2, 3, 4])
    lo, hi = CRIME_HOUR_RANGES.get(cat, (0, 23))
    if lo <= hi:
        return random.randint(lo, hi)
    return random.choice(list(range(lo, 24)) + list(range(0, hi + 1)))

def rand_rel():
    return random.choices(REL_IDS, weights=REL_WEIGHTS)[0]

def rand_caste(rel_id):
    return random.choice(CASTE_BY_REL.get(rel_id) or [1])

def pick_date(year_w):
    years = [2023, 2024, 2025, 2026]
    yr = random.choices(years, weights=year_w)[0]
    mo = random.randint(1, 6 if yr == 2026 else 12)
    dm = 28 if mo == 2 else 30 if mo in (4,6,9,11) else 31
    try:
        return date(yr, mo, random.randint(1, dm))
    except ValueError:
        return date(yr, mo, 28)

def pick_date_oct_nov(year_w):
    years = [2023, 2024, 2025, 2026]
    yr = random.choices(years, weights=year_w)[0]
    if yr == 2026:
        mo = random.choices(range(1, 7), weights=[1]*6)[0]
    else:
        mo = random.choices(range(1, 13), weights=[1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1])[0]
    dm = 28 if mo == 2 else 30 if mo in (4,6,9,11) else 31
    return date(yr, mo, random.randint(1, dm))

def build_brief_facts(sh_id, mo, comp, vict, sec):
    cat = SH_CATEGORY.get(sh_id, "other")
    if cat == "burglary":
        items = random.choice(["cash, gold ornaments and electronic items",
                                "jewellery, cash and laptop",
                                f"cash and equipment valued at Rs.{rand_amount(10_000,200_000):,}"])
        return (f"The complainant {comp} reported that on the date of incident "
                f"the accused {mo}. The accused decamped with {items}. "
                f"Case registered u/s {sec} IPC at this station.")
    if cat == "vehicle_theft":
        return (f"The complainant {comp} reported vehicle bearing reg. no. {rand_vehicle_reg()} was stolen. "
                f"The accused {mo}. Case registered u/s {sec} IPC.")
    if cat == "cyber":
        return (f"The complainant {comp} reported that the accused {mo}. "
                f"An amount of Rs.{rand_amount(5_000,500_000):,} was fraudulently transferred. "
                f"Case registered u/s {sec} IT Act r/w IPC.")
    if cat == "robbery":
        return (f"On the date of incident the accused {mo}. "
                f"The complainant {comp} was deprived of valuables estimated at Rs.{rand_amount(2_000,150_000):,}. "
                f"Case registered u/s {sec} IPC.")
    if cat == "murder":
        return (f"The complainant {comp} reported that the accused {mo}, resulting in the death of {vict}. "
                f"Body found at the incident spot; case registered u/s {sec} IPC.")
    if cat == "drug":
        return (f"The accused {mo}. The contraband was seized and weighed; case registered u/s {sec} NDPS Act.")
    if cat == "domestic":
        return (f"The complainant {comp} reported that the accused {mo}. "
                f"Medical examination conducted. Case registered u/s {sec} IPC.")
    if cat == "sexual":
        return (f"The complainant {comp} reported that the accused {mo}. "
                f"Medical and forensic examination conducted. Case registered u/s {sec} IPC/POCSO.")
    if cat == "cheating":
        return (f"The complainant {comp} reported that the accused {mo}. "
                f"Financial loss of Rs.{rand_amount(10_000,1_000_000):,}. Case registered u/s {sec} IPC.")
    if cat == "accident":
        return (f"The accused {mo}. The complainant {comp} was hospitalised. Case registered u/s {sec} MVA.")
    if cat == "excise":
        return f"The accused was found {mo}. Contraband seized; case registered u/s {sec} KE Act."
    return (f"The complainant {comp} lodged a complaint. The accused {mo}. Case registered u/s {sec} IPC.")


# ---------------------------------------------------------------------------
# SECTION C: REFERENCE DATA FRAMES
# ---------------------------------------------------------------------------
print("\n[1/16] Building reference DataFrames...")

df_state       = pd.DataFrame([(29,"Karnataka")], columns=["StateID","StateName"])
df_district    = pd.DataFrame([(d[0],29,d[1],d[2],d[3],d[4],d[5]) for d in DISTRICTS],
                               columns=["DistrictID","StateID","DistrictName","LatMin","LatMax","LonMin","LonMax"])
df_unit_type   = pd.DataFrame([(1,"Police Station"),(2,"Outpost"),(3,"Special Cell")],
                               columns=["UnitTypeID","UnitTypeName"])
df_rank        = pd.DataFrame(RANK_DATA,  columns=["RankID","RankName","RankLevel"])
df_designation = pd.DataFrame([(d[0],d[1],d[2]) for d in DESIG_DATA],
                               columns=["DesignationID","DesignationName","RankID"])
df_act         = pd.DataFrame(ACT_DATA,   columns=["ActID","ActName","ActShortName"])
df_section     = pd.DataFrame([(s[0],s[1],s[2],s[3]) for s in SECTION_DATA],
                               columns=["SectionID","ActID","SectionNo","SectionDescription"])
df_gravity     = pd.DataFrame(GRAVITY_DATA, columns=["GravityOffenceID","GravityOffenceName"])
df_crime_head  = pd.DataFrame([(c[0],c[1],c[2]) for c in CRIME_HEAD_DATA],
                               columns=["CrimeHeadID","CrimeHeadName","GravityOffenceID"])
df_crime_sub_head = pd.DataFrame([(s[0],s[1],s[2]) for s in CRIME_SUB_HEAD_DATA],
                                  columns=["CrimeSubHeadID","CrimeHeadID","CrimeSubHeadName"])

_chas_rows, _ci = [], 1
for _sub in CRIME_SUB_HEAD_DATA:
    for _sid in _sub[3]:
        _chas_rows.append((_ci, _sub[0], _sid)); _ci += 1
df_chas = pd.DataFrame(_chas_rows, columns=["CHASID","CrimeSubHeadID","SectionID"])

df_case_category = pd.DataFrame([(c[0],c[1],c[2],c[3]) for c in CASE_CATEGORY_DATA],
                                  columns=["CaseCategoryID","CategoryCode","CategoryShort","CategoryName"])
df_case_status  = pd.DataFrame(CASE_STATUS_DATA, columns=["CaseStatusID","CaseStatusName"])
df_occupation   = pd.DataFrame(OCCUPATION_DATA,  columns=["OccupationID","OccupationName"])
df_religion     = pd.DataFrame(RELIGION_DATA,    columns=["ReligionID","ReligionName"])
df_caste        = pd.DataFrame(CASTE_DATA,       columns=["CasteID","CasteName","ReligionID"])
print("   OK reference tables")


# ---------------------------------------------------------------------------
# SECTION D: UNITS
# ---------------------------------------------------------------------------
print("[2/16] Generating units...")

unit_rows, _uid = [], 1
district_units  = {}
hotspot_uids    = []
rural_quiet_uid = {}
_HS_NAMES = ["Shivajinagar PS","Indiranagar PS","Halasuru PS"]

for d in DISTRICTS:
    did, dname, la, lb, la2, lb2, _ = d[0],d[1],d[2],d[3],d[4],d[5],d[6]
    n = STATION_COUNTS[did]
    district_units[did] = []
    for i in range(n):
        utype = 1 if i < n-1 else 2
        if did == 1 and i < 3:
            name = _HS_NAMES[i]
            lat, lon = rand_point_near(HOTSPOT_LAT, HOTSPOT_LON, 0.030)
        elif i == 0 and did in RURAL_DISTRICT_IDS:
            name = f"{dname} Rural PS"
            lat  = round(random.uniform(la, lb), 6)
            lon  = round(random.uniform(la2, lb2), 6)
        else:
            name = f"{dname} PS {i+1}"
            lat  = round(random.uniform(la, lb), 6)
            lon  = round(random.uniform(la2, lb2), 6)
        unit_rows.append((_uid, did, utype, name, lat, lon))
        district_units[did].append(_uid)
        if did == 1 and i < 3:
            hotspot_uids.append(_uid)
        if i == 0 and did in RURAL_DISTRICT_IDS:
            rural_quiet_uid[did] = _uid
        _uid += 1

df_unit = pd.DataFrame(unit_rows, columns=["UnitID","DistrictID","UnitTypeID","UnitName","Latitude","Longitude"])
UNIT_TO_DIST = dict(zip(df_unit.UnitID, df_unit.DistrictID))
ALL_UNIT_IDS = df_unit.UnitID.tolist()
print(f"   OK {len(df_unit)} units | hotspot: {hotspot_uids}")


# ---------------------------------------------------------------------------
# SECTION E: COURTS
# ---------------------------------------------------------------------------
print("[3/16] Generating courts...")

court_rows, _cc = [], 1
district_courts = {}
for d in DISTRICTS:
    did, dname = d[0], d[1]
    nc = 2 if did in {1,3,4} else 1
    district_courts[did] = []
    for j in range(nc):
        if did==1 and j==0: cn="City Civil & Sessions Court, Bengaluru"
        elif did==1:          cn=f"Additional CMM Court {j}, Bengaluru"
        elif j==0:            cn=f"District & Sessions Court, {dname}"
        else:                 cn=f"JMFC Court, {dname}"
        court_rows.append((_cc, cn, did))
        district_courts[did].append(_cc)
        _cc += 1
df_court = pd.DataFrame(court_rows, columns=["CourtID","CourtName","DistrictID"])
print(f"   OK {len(df_court)} courts")


# ---------------------------------------------------------------------------
# SECTION F: EMPLOYEES
# ---------------------------------------------------------------------------
print("[4/16] Generating employees...")

emp_rows, _eid = [], 1
unit_employees = defaultdict(list)
_nu = len(df_unit); _bp = 2000//_nu; _ex = 2000%_nu

for i, (idx, urow) in enumerate(df_unit.iterrows()):
    uid_v = urow["UnitID"]
    ne = max(_bp + (1 if i < _ex else 0), 4)
    for k in range(ne):
        g   = "F" if k==ne-1 and ne>3 else random.choices(["M","F"],[80,20])[0]
        did_val = random.choice(STATION_DESIG_IDS)
        fn  = random.choice(FEMALE_FIRST if g=="F" else MALE_FIRST)
        ln  = random.choice(SURNAMES)
        dy  = random.randint(1965,1998)
        dob = date(dy, random.randint(1,12), random.randint(1,28))
        jy  = min(dy+random.randint(22,32),2022)
        jn  = date(jy, random.randint(1,12), random.randint(1,28))
        emp_rows.append((_eid, uid_v, did_val, fn, ln, g, str(dob), str(jn), rand_phone()))
        unit_employees[uid_v].append(_eid)
        _eid += 1

df_employee = pd.DataFrame(emp_rows,
    columns=["EmployeeID","UnitID","DesignationID","FirstName","LastName",
             "Gender","DOB","JoinDate","PhoneNo"])

def get_officer(uid_val):
    pool = unit_employees.get(uid_val)
    if pool: return random.choice(pool)
    dist = UNIT_TO_DIST.get(uid_val, 1)
    for u in district_units.get(dist,[]):
        p = unit_employees.get(u)
        if p: return random.choice(p)
    return emp_rows[0][0]

print(f"   OK {len(df_employee)} employees")


# ---------------------------------------------------------------------------
# SECTION G: GENERATE CASES
# ---------------------------------------------------------------------------
print("[5/16] Generating 50,000 cases...")

GEN_YEAR_W = [1.00, 1.05, 1.10, 0.55]
CYB_YEAR_W = [1.00, 1.40, 1.96, 0.68]

N_ANOMALY = 25
N_CYBER   = 4_000
N_FESTIVAL_SPIKE = 4_500
N_BURG    = 4_500
N_ORGANIZED = 15
N_OTHER   = TARGET_CASES - N_CYBER - N_FESTIVAL_SPIKE - N_BURG - N_ANOMALY - N_ORGANIZED

MANAGED_SHS   = {6, 7, 18, 19, 23, 24}
other_sh_ids  = [s for s in SH_WEIGHTS if s not in MANAGED_SHS]
_osp = np.array([SH_WEIGHTS[s] for s in other_sh_ids], dtype=float)
_osp /= _osp.sum()

CAT_IDS = [c[0] for c in CASE_CATEGORY_DATA]
CAT_W   = [80, 5, 10, 5]

dist_cs_rate = {d[0]: round(random.uniform(0.55, 0.85), 3) for d in DISTRICTS}

def _mk(case_id, uid, did, reg, sh_id, atype="", status_id=None):
    ch  = SH_TO_CH[sh_id]
    grav = CH_TO_GRAVITY[ch]
    cat  = random.choices(CAT_IDS, weights=CAT_W)[0]
    if status_id is None:
        status_id = random.choices([1,1,2,4,5],[40,20,20,15,5])[0]
    return {"CaseID":case_id,"UnitID":uid,"DistrictID":did,
            "CaseCategoryID":cat,"CrimeSubHeadID":sh_id,"CrimeHeadID":ch,
            "GravityOffenceID":grav,"CaseStatusID":status_id,
            "IOEmployeeID":get_officer(uid),
            "CourtID":random.choice(district_courts[did]),
            "RegistrationDate":str(reg),
            "IsAnomaly":1 if atype else 0,"AnomalyType":atype}

def _pdu():
    did = int(np.random.choice(DISTRICT_IDS, p=DISTRICT_WEIGHTS))
    return district_units[did][random.randint(0,len(district_units[did])-1)], did

cases, _cid = [], 1

# Cybercrime growth cases
for _ in range(N_CYBER):
    u,d=_pdu(); cases.append(_mk(_cid,u,d,pick_date(CYB_YEAR_W),random.choice([18,19]))); _cid+=1

# Festival crime spike (vehicle theft & general theft spiked in Oct-Nov)
for _ in range(N_FESTIVAL_SPIKE):
    u,d=_pdu(); cases.append(_mk(_cid,u,d,pick_date_oct_nov(GEN_YEAR_W),random.choice([6,7]))); _cid+=1

# Burglary hotspot cases
for i in range(N_BURG):
    if i < int(N_BURG*0.15) and hotspot_uids:
        u=random.choice(hotspot_uids); d=1
    else:
        u,d=_pdu()
    cases.append(_mk(_cid,u,d,pick_date(GEN_YEAR_W),random.choices([23,24],[0.80,0.20])[0])); _cid+=1

# Organized crime cases (drug smuggling across districts 1, 4, 5)
org_case_ids = []
for _ in range(N_ORGANIZED):
    d = random.choice([1, 4, 5])
    u = random.choice(district_units[d])
    sh = random.choice([20, 21, 22])
    cases.append(_mk(_cid,u,d,pick_date(GEN_YEAR_W),sh))
    org_case_ids.append(_cid)
    _cid+=1

# Other random cases
for _ in range(N_OTHER):
    u,d=_pdu(); cases.append(_mk(_cid,u,d,pick_date(GEN_YEAR_W),int(np.random.choice(other_sh_ids,p=_osp)))); _cid+=1

# Pattern 6: 25 behavioral anomalies (all valid data, behaviorally unusual)
print("   Planting 25 behavioral anomalies...")

# 6a) 8 heinous at rural quiet stations
for did in sorted(RURAL_DISTRICT_IDS)[:8]:
    uid=rural_quiet_uid[did]
    yr=random.randint(2023,2025)
    reg=date(yr,random.randint(1,12),random.randint(1,28))
    cases.append(_mk(_cid,uid,did,reg,random.choice([1,8,9]),atype="heinous_rural")); _cid+=1

# 6b) 8 white-collar at improbable hours
for _ in range(8):
    did=random.choice([1,3,4]); uid=random.choice(district_units[did])
    yr=random.randint(2023,2025); reg=date(yr,random.randint(1,12),random.randint(1,28))
    cases.append(_mk(_cid,uid,did,reg,random.choice([16,17]),atype="improbable_hour")); _cid+=1

# 6c) 4 novel section combos (cyber + NDPS in rural conservative districts)
for did in [9,16,17,29]:
    uid=district_units[did][0]; yr=random.randint(2023,2025)
    reg=date(yr,random.randint(1,12),random.randint(1,28))
    cases.append(_mk(_cid,uid,did,reg,18,atype="novel_section")); _cid+=1

# 6d) 5 burst robbery cases, same week, Bengaluru-Mysuru highway
_bdid=28; _buid=district_units[_bdid][0]
for i in range(5):
    reg=BURST_ANCHOR+timedelta(days=random.randint(0,6))
    cases.append(_mk(_cid,_buid,_bdid,reg,8,atype="modus_burst")); _cid+=1

df_case = pd.DataFrame(cases)
assert len(df_case)==TARGET_CASES, f"Got {len(df_case)}"
print(f"   OK {len(df_case):,} cases")


# ---------------------------------------------------------------------------
# SECTION H: CrimeNo / CaseNo
# ---------------------------------------------------------------------------
print("[6/16] Assigning CrimeNo / CaseNo...")

df_case["Year"]=df_case["RegistrationDate"].str[:4].astype(int)
df_case=df_case.sort_values(["UnitID","CaseCategoryID","Year","CaseID"]).reset_index(drop=True)
df_case["Serial"]=df_case.groupby(["UnitID","CaseCategoryID","Year"]).cumcount()+1

def _cn(row):
    cc=CAT_CODE_MAP[int(row["CaseCategoryID"])]
    return f"{cc}{int(row['DistrictID']):04d}{int(row['UnitID']):04d}{int(row['Year']):04d}{int(row['Serial']):05d}"

df_case["CrimeNo"]=df_case.apply(_cn,axis=1)
df_case["CaseNo"] =df_case["CrimeNo"].str[-9:]
assert df_case["CrimeNo"].nunique()==len(df_case),"CrimeNo not unique!"
print(f"   OK CrimeNo unique ({len(df_case):,})")

CASE_COLS=["CaseID","CrimeNo","CaseNo","UnitID","DistrictID",
           "CaseCategoryID","CrimeHeadID","CrimeSubHeadID",
           "GravityOffenceID","CaseStatusID","IOEmployeeID",
           "CourtID","RegistrationDate","IsAnomaly","AnomalyType"]
df_cm=df_case[CASE_COLS].copy()

CASE_UNIT =dict(zip(df_cm.CaseID,df_cm.UnitID))
CASE_DIST =dict(zip(df_cm.CaseID,df_cm.DistrictID))
CASE_REG  =dict(zip(df_cm.CaseID,df_cm.RegistrationDate))
CASE_SH   =dict(zip(df_cm.CaseID,df_cm.CrimeSubHeadID))
CASE_ATYPE=dict(zip(df_cm.CaseID,df_cm.AnomalyType))
ALL_CID   =df_cm.CaseID.tolist()


# ---------------------------------------------------------------------------
# SECTION I: PATTERN CASE-ID SETS
# ---------------------------------------------------------------------------
print("[7/16] Pre-computing pattern sets...")

# Pattern 4: Repeat Offenders (15 offenders)
RO_CASE_MO={}; repeat_offenders=[]
_ro_pool=df_cm[df_cm.DistrictID.isin([1,3,4,5,6])].CaseID.tolist()
random.shuffle(_ro_pool); _roc=0
for ri in range(15):
    g=random.choices(["M","F"],[75,25])[0]; rel=rand_rel(); nc=random.randint(5,12)
    mo=REPEAT_MOS[ri]; rc=_ro_pool[_roc:_roc+nc]; _roc+=nc
    if not rc: rc=random.sample(ALL_CID,nc)
    for cid in rc: RO_CASE_MO[cid]=mo
    repeat_offenders.append({"ri":ri+1,"name":rand_name(g),"gender":g,
        "age":random.randint(22,45),"occ":random.choice([7,3,6,10,2]),
        "rel":rel,"caste":rand_caste(rel),"mo":mo,"cases":rc})

# Pattern 7: Criminal Gang (8-person robbery network in Bengaluru Urban)
NET_CASE_MO={}
_np=df_cm[(df_cm.DistrictID==1) & (df_cm.CrimeSubHeadID==8)].CaseID.tolist()
if len(_np) < 20:
    _np = df_cm[df_cm.DistrictID==1].CaseID.tolist()
random.shuffle(_np)
network_cases=_np[:20]
for cid in network_cases: NET_CASE_MO[cid]=NETWORK_MO
NET_LOCS=[(12.950,77.580),(12.900,77.520),(12.980,77.555)]
network_members=[{"nm_id":i+1,"name":rand_name("M" if i<6 else "F"),
    "gender":"M" if i<6 else "F","age":random.randint(20,40),
    "occ":random.choice([7,3,6]),"rel":(r:=rand_rel()),"caste":rand_caste(r)}
    for i in range(8)]

# Pattern 3: Organized Crime Syndicate (6-member drug smuggling syndicate)
ORG_CASE_MO={}
ORGANIZED_MO="transporting commercial quantity of contraband across district borders in concealed vehicle compartments"
for cid in org_case_ids: ORG_CASE_MO[cid]=ORGANIZED_MO
org_members=[{"org_id":i+1,"name":rand_name("M" if i<5 else "F"),
    "gender":"M" if i<5 else "F","age":random.randint(25,55),
    "occ":random.choice([3,9,10]),"rel":(r:=rand_rel()),"caste":rand_caste(r)}
    for i in range(6)]

print(f"   OK {len(repeat_offenders)} repeat offenders, {len(network_cases)} gang cases, {len(org_case_ids)} organized crime cases")


# ---------------------------------------------------------------------------
# SECTION J: OCCURRENCE TIME
# ---------------------------------------------------------------------------
print("[8/16] Generating OccurrenceTime...")

unit_bbox={}
for _,ur in df_unit.iterrows():
    d=DIST_LOOKUP[ur["DistrictID"]]
    unit_bbox[ur["UnitID"]]=(d[2],d[3],d[4],d[5])

SEC_NO={s[0]:s[2] for s in SECTION_DATA}
occ_rows=[]; _oid=1

for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]; uid=crow["UnitID"]; sh=crow["CrimeSubHeadID"]
    at=crow["AnomalyType"]; reg=date.fromisoformat(crow["RegistrationDate"])
    ih=pick_hour(sh,is_improbable=(at=="improbable_hour"),is_hotspot=(uid in hotspot_uids))
    im=random.randint(0,59)
    idate=max(reg-timedelta(days=random.randint(0,30)),START_DATE)
    ifrom=datetime(idate.year,idate.month,idate.day,ih,im)
    ito  =ifrom+timedelta(minutes=random.randint(5,300))
    info =ifrom+timedelta(hours=random.uniform(0.5,8))
    reg_end = datetime(reg.year, reg.month, reg.day, 23, 59, 59)
    if info > reg_end:
        info = reg_end
    if uid in hotspot_uids and SH_CATEGORY.get(sh)=="burglary":
        lat,lon=rand_point_near(HOTSPOT_LAT,HOTSPOT_LON,HOTSPOT_RADIUS_DEG)
    elif at=="modus_burst":
        lat=round(BURST_LAT+random.uniform(-0.005,0.005),6)
        lon=round(BURST_LON+random.uniform(-0.005,0.005),6)
    elif cid in NET_CASE_MO:
        lat,lon=rand_point_near(*random.choice(NET_LOCS),0.010)
    elif cid in ORG_CASE_MO:
        did_val = CASE_DIST.get(cid, 1)
        if did_val == 4:   # Dakshina Kannada (Mangaluru Port / Border Checkpoint)
            lat, lon = rand_point_near(12.8700, 74.8400, 0.02)
        elif did_val == 5: # Belagavi (Nippani Border Checkpoint)
            lat, lon = rand_point_near(16.4000, 74.3800, 0.02)
        else:              # Bengaluru Urban (Nice Road Toll Plaza)
            lat, lon = rand_point_near(12.8500, 77.6600, 0.02)
    else:
        bb=unit_bbox.get(uid,(12.85,13.14,77.45,77.78))
        lat,lon=rand_point_in_box(*bb)
    if at=="modus_burst":   mo=BURST_MO
    elif cid in NET_CASE_MO: mo=NETWORK_MO
    elif cid in ORG_CASE_MO: mo=ORGANIZED_MO
    elif cid in RO_CASE_MO:  mo=RO_CASE_MO[cid]
    else:
        cat=SH_CATEGORY.get(sh,"other")
        mo=random.choice(MO_PHRASES.get(cat,["committed the alleged offence"]))
    sec=SEC_NO.get(SH_PRI_SEC.get(sh,1),"IPC")
    bf=build_brief_facts(sh,mo,rand_name(),rand_name(),sec)
    occ_rows.append({"OccurrenceTimeID":_oid,"CaseID":cid,
        "IncidentFromDate":ifrom.strftime("%Y-%m-%d %H:%M:%S"),
        "IncidentToDate":ito.strftime("%Y-%m-%d %H:%M:%S"),
        "InfoReceivedPSDate":info.strftime("%Y-%m-%d %H:%M:%S"),
        "Latitude":lat,"Longitude":lon,"BriefFacts":bf,"MOPhrase":mo})
    _oid+=1

df_occ=pd.DataFrame(occ_rows)
CASE_MO=dict(zip(df_occ.CaseID,df_occ.MOPhrase))
print(f"   OK {len(df_occ):,} OccurrenceTime records")


# ---------------------------------------------------------------------------
# SECTION K: COMPLAINANTS
# ---------------------------------------------------------------------------
print("[9/16] Generating ComplainantDetails...")

comp_rows=[]; _ci2=1; PLACES=["Main Road","Cross","Layout","Nagar","Colony","Extension"]
for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]
    for _ in range(random.choices([1,2,3],[75,20,5])[0]):
        g=random.choices(["M","F"],[55,45])[0]; r=rand_rel()
        comp_rows.append({"ComplainantID":_ci2,"CaseID":cid,"Name":rand_name(g),
            "Gender":g,"Age":random.randint(18,70),"OccupationID":random.choice(OCC_IDS),
            "ReligionID":r,"CasteID":rand_caste(r),"PhoneNo":rand_phone(),
            "Address":f"{random.randint(1,500)}, {random.choice(PLACES)}, Karnataka"})
        _ci2+=1
df_complainant=pd.DataFrame(comp_rows)
print(f"   OK {len(df_complainant):,} complainant records")


# ---------------------------------------------------------------------------
# SECTION L: VICTIMS
# ---------------------------------------------------------------------------
print("[10/16] Generating Victims...")

vict_rows=[]; _vi=1
for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]; sh=crow["CrimeSubHeadID"]; cat=SH_CATEGORY.get(sh,"other")
    if cat=="murder":   nv,ic=random.choices([1,2,3],[70,25,5])[0],["Fatal"]
    elif cat in{"robbery","hurt"}: nv,ic=random.choices([1,2,3],[80,15,5])[0],["Minor","Grievous"]
    elif cat in{"vehicle_theft","cheating","cyber"}: nv,ic=1,["None"]
    elif cat=="accident": nv,ic=random.choices([1,2],[80,20])[0],["Minor","Grievous","Fatal"]
    else: nv,ic=random.choices([1,2],[85,15])[0],["None","Minor","Psychological"]
    for _ in range(nv):
        g="F" if cat in{"sexual","domestic"} else random.choices(["M","F"],[55,45])[0]
        r=rand_rel()
        vict_rows.append({"VictimID":_vi,"CaseID":cid,"Name":rand_name(g),"Gender":g,
            "Age":random.randint(15,75),"OccupationID":random.choice(OCC_IDS),
            "ReligionID":r,"CasteID":rand_caste(r),"InjuryType":random.choice(ic)})
        _vi+=1
df_victim=pd.DataFrame(vict_rows)
print(f"   OK {len(df_victim):,} victim records")


# ---------------------------------------------------------------------------
# SECTION M: ACCUSED
# ---------------------------------------------------------------------------
print("[11/16] Generating Accused...")

acc_rows=[]; _aid=1; acc_id_to_case={}
ro_accused_ids=[]; net_accused_ids=[]; org_accused_ids=[]

for ro in repeat_offenders:
    for cid in ro["cases"]:  # type: ignore
        acc_rows.append({"AccusedID":_aid,"CaseID":cid,"Name":ro["name"],
            "Gender":ro["gender"],"Age":ro["age"],"OccupationID":ro["occ"],
            "ReligionID":ro["rel"],"CasteID":ro["caste"],"Address":"Karnataka",
            "MOPhrase":ro["mo"],"IsRepeatOffender":1,"IsNetworkMember":0})
        acc_id_to_case[_aid]=cid; ro_accused_ids.append((ro["ri"],_aid,cid)); _aid+=1

for nm in network_members:
    for cid in network_cases:
        if random.random()<0.65:
            acc_rows.append({"AccusedID":_aid,"CaseID":cid,"Name":nm["name"],
                "Gender":nm["gender"],"Age":nm["age"],"OccupationID":nm["occ"],
                "ReligionID":nm["rel"],"CasteID":nm["caste"],"Address":"Bengaluru",
                "MOPhrase":NETWORK_MO,"IsRepeatOffender":0,"IsNetworkMember":1})
            acc_id_to_case[_aid]=cid; net_accused_ids.append((nm["nm_id"],_aid,cid)); _aid+=1

# Organized Crime Syndicate Accused
for cid in org_case_ids:
    num_acc = random.randint(2, 4)
    members = random.sample(org_members, num_acc)
    for m in members:
        acc_rows.append({"AccusedID":_aid,"CaseID":cid,"Name":m["name"],
            "Gender":m["gender"],"Age":m["age"],"OccupationID":m["occ"],
            "ReligionID":m["rel"],"CasteID":m["caste"],"Address":"Karnataka",
            "MOPhrase":ORGANIZED_MO,"IsRepeatOffender":0,"IsNetworkMember":1})
        acc_id_to_case[_aid]=cid; org_accused_ids.append((m["org_id"],_aid,cid)); _aid+=1

for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]; sh=crow["CrimeSubHeadID"]; cat=SH_CATEGORY.get(sh,"other"); at=crow["AnomalyType"]
    if cid in org_case_ids:
        continue
    if cat in{"robbery","dacoity"}: na=random.choices([0,1,2,3,4,5],[5,30,30,20,10,5])[0]
    elif cat=="murder": na=random.choices([0,1,2,3],[10,50,30,10])[0]
    else: na=random.choices([0,1,2,3],[20,50,25,5])[0]
    mo=BURST_MO if at=="modus_burst" else CASE_MO.get(cid,"committed the alleged offence")
    for _ in range(na):
        g=random.choices(["M","F"],[85,15])[0]; r=rand_rel()
        acc_rows.append({"AccusedID":_aid,"CaseID":cid,"Name":rand_name(g),"Gender":g,
            "Age":random.randint(18,60),"OccupationID":random.choice([7,3,6,10,2]),
            "ReligionID":r,"CasteID":rand_caste(r),
            "Address":f"{random.randint(1,500)}, {random.choice(PLACES)}, Karnataka",
            "MOPhrase":mo,"IsRepeatOffender":0,"IsNetworkMember":0})
        acc_id_to_case[_aid]=cid; _aid+=1

df_accused=pd.DataFrame(acc_rows)
print(f"   OK {len(df_accused):,} accused records")


# ---------------------------------------------------------------------------
# SECTION N: ACT SECTION ASSOCIATION
# ---------------------------------------------------------------------------
print("[12/16] Generating ActSectionAssociation...")

asa_rows=[]; _asid=1
for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]; sh=crow["CrimeSubHeadID"]; at=crow["AnomalyType"]
    secs=list(SH_SECTIONS.get(sh,[1]))
    if at=="novel_section": secs=secs+[34]   # add NDPS s.20 to cyber case
    ns=min(random.choices([1,2,3],[70,25,5])[0],len(secs))
    for sid in random.sample(secs,ns):
        asa_rows.append({"AssocID":_asid,"CaseID":cid,"SectionID":sid}); _asid+=1
df_asa=pd.DataFrame(asa_rows)
print(f"   OK {len(df_asa):,} act-section records")


# ---------------------------------------------------------------------------
# SECTION O: ARREST/SURRENDER
# ---------------------------------------------------------------------------
print("[13/16] Generating ArrestSurrender...")

arrest_rows=[]; _arrid=1; arr_set=set()
AT_TYPES=["Arrested","Surrender"]; AT_W=[85,15]

def _arr(cid, acid):
    global _arrid
    reg=date.fromisoformat(CASE_REG.get(cid,str(START_DATE)))
    ad=min(reg+timedelta(days=random.randint(0,90)),END_DATE)
    uid=CASE_UNIT.get(cid,ALL_UNIT_IDS[0])
    arrest_rows.append({"ArrestID":_arrid,"CaseID":cid,"AccusedID":acid,
        "ArrestDate":str(ad),"ArrestType":random.choices(AT_TYPES,AT_W)[0],
        "ArrestingOfficerID":get_officer(uid)})
    arr_set.add(acid); _arrid+=1

for _,rai,rcid in ro_accused_ids:  _arr(rcid,rai)
for _,nai,ncid in net_accused_ids: _arr(ncid,nai)
for _,oai,ocid in org_accused_ids: _arr(ocid,oai)

_reg_mask=(df_accused["IsRepeatOffender"]==0)&(df_accused["IsNetworkMember"]==0)
_reg_df=df_accused[_reg_mask].sample(frac=0.40,random_state=SEED)
for _,row in _reg_df.iterrows():
    if row["AccusedID"] not in arr_set: _arr(row["CaseID"],row["AccusedID"])

df_arrest=pd.DataFrame(arrest_rows)
print(f"   OK {len(df_arrest):,} arrest/surrender records")


# ---------------------------------------------------------------------------
# SECTION P: CHARGESHEET DETAILS
# ---------------------------------------------------------------------------
print("[14/16] Generating ChargesheetDetails...")

JUDGES=["Shri B.N. Prasad","Smt. K. Latha","Shri M.V. Reddy","Smt. R. Sumathi",
        "Shri P.K. Sharma","Smt. N. Hegde","Shri A. Krishnamurthy","Smt. V. Patil",
        "Shri S.R. Naik","Smt. D. Savitha","Shri T.G. Rao","Smt. J. Anitha",
        "Shri R.K. Kulkarni","Smt. P. Sridevi","Shri Y. Manjunath"]

arr_cids=set(df_arrest["CaseID"].tolist())
CASE_ARR_DATE=df_arrest.groupby("CaseID")["ArrestDate"].max().to_dict()
cs_rows=[]; _csid=1
for _,crow in df_cm.iterrows():
    cid=crow["CaseID"]; did=crow["DistrictID"]
    reg=date.fromisoformat(crow["RegistrationDate"]); rate=dist_cs_rate.get(did,0.65); r=random.random()
    if   r<rate*0.80 and cid in arr_cids: cst="A"
    elif r<rate*0.88: cst="B"
    elif r<rate:      cst="C"
    else: continue
    cs_delta = random.randint(30, 180)
    cs_date = reg + timedelta(days=cs_delta)
    if cid in CASE_ARR_DATE:
        arr_date = date.fromisoformat(CASE_ARR_DATE[cid])
        cs_date = max(cs_date, arr_date + timedelta(days=random.randint(5, 30)))
    cs_date = min(cs_date, END_DATE)
    cs_rows.append({"CSID":_csid,"CaseID":cid,"CSType":cst,
        "CSDate":str(cs_date),
        "CourtID":crow["CourtID"],"JudgeName":random.choice(JUDGES)})
    _csid+=1
df_chargesheet=pd.DataFrame(cs_rows)

# Update CaseStatusID in CaseMaster (df_cm) to match chargesheet details
df_cm["CaseStatusID"] = 1
cs_status_map = {"A": 2, "B": 5, "C": 4}
for cs_row in cs_rows:
    df_cm.loc[df_cm["CaseID"] == cs_row["CaseID"], "CaseStatusID"] = cs_status_map.get(str(cs_row["CSType"]), 1)
print(f"   OK {len(df_chargesheet):,} chargesheet records")


# ---------------------------------------------------------------------------
# SECTION Q: DISTRICT STATS
# ---------------------------------------------------------------------------
# Calculate actual observed chargesheet rate per district (fraction of cases with CSType == 'A')
cs_a_case_ids = set(df_chargesheet[df_chargesheet["CSType"] == "A"]["CaseID"])
dist_cases = df_cm.groupby("DistrictID").size()
dist_cs_a = df_cm[df_cm["CaseID"].isin(cs_a_case_ids)].groupby("DistrictID").size()
actual_cs_rates = {}
for did in DISTRICT_IDS:
    total = dist_cases.get(did, 0)
    cs_a = dist_cs_a.get(did, 0)
    actual_cs_rates[did] = round(cs_a / total, 4) if total > 0 else 0.0

print("[15/16] Generating DistrictStats...")
df_district_stats=pd.DataFrame([
    {"DistrictID":d[0],"Population":DISTRICT_SOCIO[d[0]][0],
     "PopulationDensity":DISTRICT_SOCIO[d[0]][1],
     "UrbanizationLevel":DISTRICT_SOCIO[d[0]][2],
     "ChargesheetRate":actual_cs_rates.get(d[0],0.0)} for d in DISTRICTS])
print(f"   OK {len(df_district_stats)} district stats rows")


# ---------------------------------------------------------------------------
# SECTION R: WRITE OUTPUT
# ---------------------------------------------------------------------------
print("\n[16/16] Writing CSVs...")

def wcsv(df, name):
    df.to_csv(OUTPUT_DIR/f"{name}.csv",index=False)
    print(f"   OK {name}.csv ({len(df):,} rows)")

wcsv(df_state,          "State")
wcsv(df_district,       "District")
wcsv(df_unit_type,      "UnitType")
wcsv(df_unit,           "Unit")
wcsv(df_rank,           "Rank")
wcsv(df_designation,    "Designation")
wcsv(df_employee,       "Employee")
wcsv(df_act,            "Act")
wcsv(df_section,        "Section")
wcsv(df_crime_head,     "CrimeHead")
wcsv(df_crime_sub_head, "CrimeSubHead")
wcsv(df_chas,           "CrimeHeadActSection")
wcsv(df_case_category,  "CaseCategory")
wcsv(df_gravity,        "GravityOffence")
wcsv(df_case_status,    "CaseStatusMaster")
wcsv(df_occupation,     "OccupationMaster")
wcsv(df_religion,       "ReligionMaster")
wcsv(df_caste,          "CasteMaster")
wcsv(df_court,          "Court")
wcsv(df_cm,             "CaseMaster")
wcsv(df_occ,            "OccurrenceTime")
wcsv(df_complainant,    "ComplainantDetails")
wcsv(df_victim,         "Victim")
wcsv(df_accused,        "Accused")
wcsv(df_asa,            "ActSectionAssociation")
wcsv(df_arrest,         "ArrestSurrender")
wcsv(df_chargesheet,    "ChargesheetDetails")
wcsv(df_district_stats, "DistrictStats")

IO=["State","GravityOffence","District","UnitType","Unit",
    "Rank","Designation","Employee","Act","Section",
    "CrimeHead","CrimeSubHead","CrimeHeadActSection",
    "CaseCategory","CaseStatusMaster","OccupationMaster","ReligionMaster","CasteMaster",
    "Court","CaseMaster","OccurrenceTime",
    "ComplainantDetails","Victim","Accused","ActSectionAssociation",
    "ArrestSurrender","ChargesheetDetails","DistrictStats"]
with open(OUTPUT_DIR/"import_order.txt","w") as f:
    f.writelines(n+".csv\n" for n in IO)
print("   OK import_order.txt")


# ---------------------------------------------------------------------------
# SECTION S: VERIFICATION
# ---------------------------------------------------------------------------
print("\n"+"="*64+"\n  VERIFICATION\n"+"="*64)
tot=len(df_cm)
print(f"Total cases       : {tot:,}")
for yr in [2023,2024,2025,2026]:
    n=df_cm["RegistrationDate"].str.startswith(str(yr)).sum()
    print(f"  {yr}: {n:>7,}  ({n/tot*100:.1f}%)")
print(f"P6 Hidden Anom.   : {int(df_cm.IsAnomaly.sum()):,}")
_burg_hot=df_cm[df_cm.UnitID.isin(hotspot_uids)&df_cm.CrimeSubHeadID.isin([23,24])]
print(f"P1 Hotspot Burg   : {len(_burg_hot):,}")
_cy=df_cm[df_cm.CrimeSubHeadID.isin([18,19])]
print(f"P2 Cyber Growth   : 2023={_cy['RegistrationDate'].str.startswith('2023').sum():,} | 2024={_cy['RegistrationDate'].str.startswith('2024').sum():,} | 2025={_cy['RegistrationDate'].str.startswith('2025').sum():,} | 2026(H1)={_cy['RegistrationDate'].str.startswith('2026').sum():,}")
print(f"P3 Org. Crime drug: {len(org_case_ids):,} cases (Accused marked IsNetworkMember=1)")
print(f"P4 RO (Repeat Off): {(df_accused.IsRepeatOffender==1).sum():,} accused entries")
_fest=df_cm[df_cm.CrimeSubHeadID.isin([6,7])]
_on=_fest["RegistrationDate"].str[5:7].isin(["10","11"]).sum()
print(f"P5 Festival Spike : {_on:,} / {len(_fest):,} Oct-Nov cases ({_on/max(len(_fest),1)*100:.1f}%)")
print(f"P7 Crim. Gang rob : {len(network_cases):,} cases in Bengaluru Urban")
_a,_b,_c=[(df_chargesheet.CSType==t).sum() for t in["A","B","C"]]
print(f"Disposal CS Rate  : CS A={_a:,} B={_b:,} C={_c:,}")
print("="*64)
print("  Generation complete -- data-generator/output/")
print("="*64)


# ---------------------------------------------------------------------------
# SECTION T: WRITE docs/patterns.md
# ---------------------------------------------------------------------------
_cs5="\n".join(f"  DistrictID {k}: {v:.3f}" for k,v in sorted(dist_cs_rate.items())[:5])
_ro_table="\n".join(f"| RO-{i+1:02d} | {m} |" for i,m in enumerate(REPEAT_MOS))

PATTERNS_MD = f"""# Karnataka Police FIR Database -- Planted Patterns & Anomalies

> **Generated by** `data-generator/generate.py`
> **Dataset** 50,000 FIR cases, Karnataka, 2023-01-01 to 2026-06-30
> **Seed** {SEED} (fully reproducible)

---

## Overview

Seven analytical patterns are deliberately planted in this synthetic dataset.
They simulate real-world investigative signals: geographic crime clusters,
repeat offenders, criminal networks, seasonal spikes, digital crime growth,
behavioral anomalies, and district-level clearance disparities.

---

## Pattern 1 - Burglary Hotspot (Bengaluru East, 3 stations)

| Property | Value |
|----------|-------|
| **UnitIDs** | {hotspot_uids} |
| **Stations** | Shivajinagar PS, Indiranagar PS, Halasuru PS |
| **Centroid** | Lat {HOTSPOT_LAT}, Lon {HOTSPOT_LON} |
| **Radius** | ~2 km ({HOTSPOT_RADIUS_DEG} deg) |
| **Time window** | 23:00 to 04:00 hrs |
| **CrimeSubHeadIDs** | 23 (Burglary by Night), 24 (Attempt to Burglary) |
| **Tables** | `OccurrenceTime` (Latitude, Longitude, IncidentFromDate), `CaseMaster` |

~15% of all burglary cases are routed to these stations.
IncidentFromDate hour is always in {{23,0,1,2,3,4}} for hotspot cases,
and coordinates fall within 2 km of ({HOTSPOT_LAT}, {HOTSPOT_LON}).

```sql
SELECT c.CaseID, c.UnitID, o.IncidentFromDate, o.Latitude, o.Longitude
FROM   CaseMaster c JOIN OccurrenceTime o ON o.CaseID = c.CaseID
WHERE  c.UnitID IN ({', '.join(str(u) for u in hotspot_uids)})
  AND  c.CrimeSubHeadID IN (23, 24)
  AND  CAST(SUBSTR(o.IncidentFromDate, 12, 2) AS INT) NOT BETWEEN 5 AND 22;
```

---

## Pattern 2 - Cybercrime Growth (+40% Year-on-Year)

| Property | Value |
|----------|-------|
| **Growth rate** | +40% Year-on-Year |
| **CrimeSubHeadIDs** | 18 (Online Financial Fraud), 19 (Online Obscenity) |
| **Year Weights** | 2023=1.00, 2024=1.40, 2025=1.96, 2026(H1)~1.37 |
| **Tables** | `CaseMaster` (RegistrationDate, CrimeSubHeadID) |

Cybercrime cases follow an exponential YoY growth rate of 40%.

```sql
SELECT SUBSTR(RegistrationDate,1,4) AS Year, COUNT(*) AS CyberCases
FROM   CaseMaster WHERE CrimeSubHeadID IN (18,19)
GROUP  BY Year ORDER BY Year;
```

---

## Pattern 3 - Organized Crime (Drug Smuggling Syndicate)

| Property | Value |
|----------|-------|
| **Syndicate Size** | 6 persons |
| **Cases** | {len(org_case_ids)} (Bengaluru Urban, Dakshina Kannada, Belagavi) |
| **MO** | {ORGANIZED_MO} |
| **CrimeSubHeadIDs** | 20 (Cannabis/Ganja), 21 (Opium/Heroin), 22 (Psychotropic Substances) |
| **Tables** | `Accused` (IsNetworkMember=1, MOPhrase), `OccurrenceTime`, `ArrestSurrender` |

6 syndicate members repeatedly co-appear in drug smuggling cases across border, coastal, and urban districts.

```sql
SELECT a1.Name, a2.Name, COUNT(*) AS SharedCases
FROM   Accused a1 JOIN Accused a2 ON a1.CaseID=a2.CaseID AND a1.AccusedID<a2.AccusedID
WHERE  a1.MOPhrase = '{ORGANIZED_MO}'
GROUP  BY a1.Name, a2.Name HAVING COUNT(*)>=3 ORDER BY SharedCases DESC;
```

---

## Pattern 4 - 15 Repeat Offenders

| Property | Value |
|----------|-------|
| **Offenders** | 15 |
| **Cases per offender** | 5-12 |
| **Districts** | 2-3 per offender (pool: Bengaluru Urban, Mysuru, DK, Belagavi, Kalaburagi) |
| **Tables** | `Accused` (IsRepeatOffender=1, MOPhrase), `ArrestSurrender` |

Each offender: identical Name+Age+Gender, unique MOPhrase embedded verbatim
in BriefFacts. All have guaranteed ArrestSurrender records.

| RO# | MOPhrase |
|-----|----------|
{_ro_table}

```sql
SELECT Name, Gender, Age, MOPhrase, COUNT(*) AS N, COUNT(DISTINCT c.DistrictID) AS Districts
FROM   Accused a JOIN CaseMaster c ON c.CaseID=a.CaseID
WHERE  a.IsRepeatOffender=1
GROUP  BY Name,Gender,Age,MOPhrase HAVING COUNT(*)>=5 ORDER BY N DESC;
```

---

## Pattern 5 - Festival Crime Spike (October-November spike)

| Property | Value |
|----------|-------|
| **Impacted Months** | October (10) and November (11) |
| **Multiplier** | ~2x volume of theft cases |
| **CrimeSubHeadIDs** | 6 (Vehicle Theft), 7 (Theft (Other)) |
| **Tables** | `CaseMaster` (RegistrationDate, CrimeSubHeadID) |

Vehicle thefts and general thefts spike by roughly 2x in October and November, correlating with major regional festivals (Dasara/Vijayadashami and Diwali) when homes are left vacant and commercial spaces/temples are highly crowded.

```sql
SELECT SUBSTR(RegistrationDate,6,2) AS Month, COUNT(*) AS N
FROM   CaseMaster WHERE CrimeSubHeadID IN (6,7) GROUP BY Month ORDER BY Month;
```

---

## Pattern 6 - 25 Behavioral Anomalies (IsAnomaly=1, all valid data)

| AnomalyType | Count | Description |
|-------------|-------|-------------|
| `heinous_rural` | 8 | Murder/Robbery/Dacoity at historically quiet rural police stations |
| `improbable_hour` | 8 | Cheating/Forgery incidents 02:00-04:00 hrs (statistically improbable for white-collar crime) |
| `novel_section` | 4 | Cyber fraud cases in conservative rural districts (Vijayapura/Bidar/Bagalkot/Yadgir) with BOTH IT Act s.66C/66D AND NDPS s.20 - cross-domain section combo never seen in those districts |
| `modus_burst` | 5 | 5 identical-MO robbery cases in 7-day window 2025-04-14 to 2025-04-20, clustered at ({BURST_LAT},{BURST_LON}) on Bengaluru-Mysuru highway, new geographic cluster |

```sql
SELECT AnomalyType, COUNT(*) AS N, MIN(RegistrationDate), MAX(RegistrationDate)
FROM   CaseMaster WHERE IsAnomaly=1 GROUP BY AnomalyType;
```

---

## Pattern 7 - Criminal Gang (Bengaluru Urban Robbery Gang)

| Property | Value |
|----------|-------|
| **Size** | 8 persons |
| **Cases** | {len(network_cases)} (Bengaluru Urban) |
| **Shared locations** | (12.950,77.580), (12.900,77.520), (12.980,77.555) |
| **MO** | {NETWORK_MO} |
| **CrimeSubHeadIDs** | 8 (Robbery) |
| **Tables** | `Accused` (IsNetworkMember=1), `OccurrenceTime`, `ArrestSurrender` |

3-5 gang members co-appear in each of the robbery cases. Coordinates cluster at 3 fixed points on Nice Road and ATM locations.

```sql
SELECT a1.Name, a2.Name, COUNT(*) AS SharedCases
FROM   Accused a1 JOIN Accused a2 ON a1.CaseID=a2.CaseID AND a1.AccusedID<a2.AccusedID
WHERE  a1.MOPhrase = '{NETWORK_MO}'
GROUP  BY a1.Name,a2.Name HAVING COUNT(*)>=3 ORDER BY SharedCases DESC;
```

---

## Pattern 8 - District Chargesheet Rate 55-85%

CSType: A=Chargesheet filed (requires ArrestSurrender), B=False Case, C=Undetected.

Sample rates:
{_cs5}

```sql
SELECT d.DistrictName, ds.ChargesheetRate,
       SUM(CASE WHEN cs.CSType='A' THEN 1 ELSE 0 END)*1.0/COUNT(cm.CaseID) AS ObservedRate
FROM   District d
JOIN   DistrictStats ds ON ds.DistrictID=d.DistrictID
JOIN   CaseMaster cm ON cm.DistrictID=d.DistrictID
LEFT   JOIN ChargesheetDetails cs ON cs.CaseID=cm.CaseID
GROUP  BY d.DistrictID ORDER BY ObservedRate DESC;
```

---

## CrimeNo Format

```
{{CategoryCode:1}}{{DistrictID:04d}}{{UnitID:04d}}{{Year:04d}}{{Serial:05d}}
  1=FIR 2=UDR 3=PAR 4=ZFIR
```
CaseNo = last 9 digits of CrimeNo. Serial resets per (UnitID, CategoryCode, Year).

---

## ML Feature Suggestions

| Feature | Source |
|---------|--------|
| Crime rate per capita | CaseMaster + DistrictStats.Population |
| Chargesheet efficiency | ChargesheetDetails.CSType ratio per district |
| Temporal hotspot | OccurrenceTime Lat/Lon + IncidentFromDate |
| Repeat offender risk | Accused.IsRepeatOffender + appearance count |
| Network centrality | IsNetworkMember + co-case graph |
| MO clustering | Accused.MOPhrase text similarity |
| Seasonal crime index | RegistrationDate month + CrimeSubHeadID |
| Urbanization vs crime | DistrictStats.UrbanizationLevel + CrimeHead |

*Auto-generated by generate.py seed={SEED}. Re-run to refresh.*
"""

with open(DOCS_DIR/"patterns.md","w",encoding="utf-8") as f:
    f.write(PATTERNS_MD)
print("\n   OK docs/patterns.md written")
