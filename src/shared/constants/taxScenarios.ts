export interface TaxScenario {
  id: string;
  description: string;
  saleType: string;
  saleTypeId: number;
}

export const TAX_SCENARIOS: TaxScenario[] = [
  {
    id: "SN001",
    description: "Goods at standard rate to registered buyers",
    saleType: "Goods at standard rate (default)",
    saleTypeId: 75,
  },
  {
    id: "SN002",
    description: "Goods at standard rate to unregistered buyers",
    saleType: "Goods at standard rate (default)",
    saleTypeId: 75,
  },
  {
    id: "SN003",
    description: "Sale of Steel (Melted and Re-Rolled)",
    saleType: "Steel Melting and re-rolling",
    saleTypeId: 123,
  },
  {
    id: "SN004",
    description: "Sale by Ship Breakers",
    saleType: "Ship breaking",
    saleTypeId: 125,
  },
  {
    id: "SN005",
    description: "Reduced rate sale",
    saleType: "Goods at Reduced Rate",
    saleTypeId: 24,
  },
  {
    id: "SN006",
    description: "Exempt goods sale",
    saleType: "Exempt goods",
    saleTypeId: 81,
  },
  {
    id: "SN007",
    description: "Zero rated sale",
    saleType: "Goods at zero-rate",
    saleTypeId: 80,
  },
  {
    id: "SN008",
    description: "Sale of 3rd schedule goods",
    saleType: "3rd Schedule Goods",
    saleTypeId: 23,
  },
  {
    id: "SN009",
    description: "Cotton Spinners purchase from Cotton Ginners (Textile Sector)",
    saleType: "Cotton Ginners",
    saleTypeId: 130,
  },
  {
    id: "SN010",
    description: "Telecom services rendered or provided",
    saleType: "Telecommunication services",
    saleTypeId: 84,
  },
  {
    id: "SN011",
    description: "Toll Manufacturing sale by Steel sector",
    saleType: "Toll Manufacturing",
    saleTypeId: 181,
  },
  {
    id: "SN012",
    description: "Sale of Petroleum products",
    saleType: "Petroleum Products",
    saleTypeId: 85,
  },
  {
    id: "SN013",
    description: "Electricity Supply to Retailers",
    saleType: "Electricity Supply to Retailers",
    saleTypeId: 62,
  },
  {
    id: "SN014",
    description: "Sale of Gas to CNG stations",
    saleType: "Gas to CNG stations",
    saleTypeId: 77,
  },
  {
    id: "SN015",
    description: "Sale of mobile phones",
    saleType: "Mobile Phones",
    saleTypeId: 122,
  },
  {
    id: "SN016",
    description: "Processing / Conversion of Goods",
    saleType: "Processing/ Conversion of Goods",
    saleTypeId: 25,
  },
  {
    id: "SN017",
    description: "Sale of Goods where FED is charged in ST mode",
    saleType: "Goods (FED in ST Mode)",
    saleTypeId: 21,
  },
  {
    id: "SN018",
    description: "Services rendered or provided where FED is charged in ST mode",
    saleType: "Services (FED in ST Mode)",
    saleTypeId: 22,
  },
  {
    id: "SN019",
    description: "Services rendered or provided",
    saleType: "Services",
    saleTypeId: 18,
  },
  {
    id: "SN020",
    description: "Sale of Electric Vehicles",
    saleType: "Electric Vehicle",
    saleTypeId: 132,
  },
  {
    id: "SN021",
    description: "Sale of Cement /Concrete Block",
    saleType: "Cement /Concrete Block",
    saleTypeId: 134,
  },
  {
    id: "SN022",
    description: "Sale of Potassium Chlorate",
    saleType: "Potassium Chlorate",
    saleTypeId: 115,
  },
  {
    id: "SN023",
    description: "Sale of CNG",
    saleType: "CNG Sales",
    saleTypeId: 178,
  },
  {
    id: "SN024",
    description: "Goods sold that are listed in SRO 297(1)/2023",
    saleType: "Goods as per SRO.297(|)/2023",
    saleTypeId: 139,
  },
  {
    id: "SN025",
    description: "Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1",
    saleType: "Non-Adjustable Supplies",
    saleTypeId: 138,
  },
  {
    id: "SN026",
    description: "Sale to End Consumer by retailers",
    saleType: "Goods at standard rate (default)",
    saleTypeId: 75,
  },
  {
    id: "SN027",
    description: "Sale to End Consumer by retailers",
    saleType: "3rd Schedule Goods",
    saleTypeId: 23,
  },
  {
    id: "SN028",
    description: "Sale to End Consumer by retailers",
    saleType: "Goods at Reduced Rate",
    saleTypeId: 24,
  },
];

export interface BusinessActivityScenario {
  serialNumber: number;
  businessActivity: string;
  sector: string;
  scenarios: string[];
}

export const BUSINESS_ACTIVITY_SCENARIOS: BusinessActivityScenario[] = [
  {
    serialNumber: 1,
    businessActivity: "Manufacturer",
    sector: "All Other Sectors",
    scenarios: ["SN001", "SN002", "SN005", "SN006", "SN007", "SN015", "SN016", "SN017", "SN021", "SN022", "SN024"],
  },
  {
    serialNumber: 2,
    businessActivity: "Manufacturer",
    sector: "Steel",
    scenarios: ["SN003", "SN004", "SN011"],
  },
  {
    serialNumber: 3,
    businessActivity: "Manufacturer",
    sector: "FMCG",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN008",
    ],
  },
  {
    serialNumber: 4,
    businessActivity: "Manufacturer",
    sector: "Textile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN009",
    ],
  },
  {
    serialNumber: 5,
    businessActivity: "Manufacturer",
    sector: "Telecom",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN010",
    ],
  },
  {
    serialNumber: 6,
    businessActivity: "Manufacturer",
    sector: "Petroleum",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN012",
    ],
  },
  {
    serialNumber: 7,
    businessActivity: "Manufacturer",
    sector: "Electricity Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN013",
    ],
  },
  {
    serialNumber: 8,
    businessActivity: "Manufacturer",
    sector: "Gas Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN014",
    ],
  },
  {
    serialNumber: 9,
    businessActivity: "Manufacturer",
    sector: "Services",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN018",
      "SN019",
    ],
  },
  {
    serialNumber: 10,
    businessActivity: "Manufacturer",
    sector: "Automobile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN020",
    ],
  },
  {
    serialNumber: 11,
    businessActivity: "Manufacturer",
    sector: "CNG Stations",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN023",
    ],
  },
  {
    serialNumber: 12,
    businessActivity: "Manufacturer",
    sector: "Pharmaceuticals",
    scenarios: ["SN001", "SN002", "SN005", "SN006", "SN007", "SN015", "SN016", "SN017", "SN021", "SN022", "SN024"],
  },
  {
    serialNumber: 13,
    businessActivity: "Manufacturer",
    sector: "Wholesale / Retails",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 16,
    businessActivity: "Importer",
    sector: "All Other Sectors",
    scenarios: ["SN001", "SN002", "SN005", "SN006", "SN007", "SN015", "SN016", "SN017", "SN021", "SN022", "SN024"],
  },
  {
    serialNumber: 17,
    businessActivity: "Importer",
    sector: "Steel",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN003",
      "SN004",
      "SN011",
    ],
  },
  {
    serialNumber: 18,
    businessActivity: "Importer",
    sector: "FMCG",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN008",
    ],
  },
  {
    serialNumber: 19,
    businessActivity: "Importer",
    sector: "Textile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN009",
    ],
  },
  {
    serialNumber: 20,
    businessActivity: "Importer",
    sector: "Telecom",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN010",
    ],
  },
  {
    serialNumber: 21,
    businessActivity: "Importer",
    sector: "Petroleum",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN012",
    ],
  },
  {
    serialNumber: 22,
    businessActivity: "Importer",
    sector: "Electricity Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN013",
    ],
  },
  {
    serialNumber: 23,
    businessActivity: "Importer",
    sector: "Gas Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN014",
    ],
  },
  {
    serialNumber: 24,
    businessActivity: "Importer",
    sector: "Services",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN018",
      "SN019",
    ],
  },
  {
    serialNumber: 25,
    businessActivity: "Importer",
    sector: "Automobile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN020",
    ],
  },
  {
    serialNumber: 26,
    businessActivity: "Importer",
    sector: "CNG Stations",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN023",
    ],
  },
  {
    serialNumber: 27,
    businessActivity: "Importer",
    sector: "Pharmaceuticals",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN025",
    ],
  },
  {
    serialNumber: 28,
    businessActivity: "Importer",
    sector: "Wholesale / Retails",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 31,
    businessActivity: "Distributor",
    sector: "All Other Sectors",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 32,
    businessActivity: "Distributor",
    sector: "Steel",
    scenarios: ["SN003", "SN004", "SN011", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 33,
    businessActivity: "Distributor",
    sector: "FMCG",
    scenarios: ["SN008", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 34,
    businessActivity: "Distributor",
    sector: "Textile",
    scenarios: ["SN009", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 35,
    businessActivity: "Distributor",
    sector: "Telecom",
    scenarios: ["SN010", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 36,
    businessActivity: "Distributor",
    sector: "Petroleum",
    scenarios: ["SN012", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 37,
    businessActivity: "Distributor",
    sector: "Electricity Distribution",
    scenarios: ["SN013", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 38,
    businessActivity: "Distributor",
    sector: "Gas Distribution",
    scenarios: ["SN014", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 39,
    businessActivity: "Distributor",
    sector: "Services",
    scenarios: ["SN018", "SN019", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 40,
    businessActivity: "Distributor",
    sector: "Automobile",
    scenarios: ["SN020", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 41,
    businessActivity: "Distributor",
    sector: "CNG Stations",
    scenarios: ["SN023", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 42,
    businessActivity: "Distributor",
    sector: "Pharmaceuticals",
    scenarios: ["SN025", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 43,
    businessActivity: "Distributor",
    sector: "Wholesale / Retails",
    scenarios: ["SN001", "SN002", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 46,
    businessActivity: "Wholesaler",
    sector: "All Other Sectors",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 47,
    businessActivity: "Wholesaler",
    sector: "Steel",
    scenarios: ["SN003", "SN004", "SN011", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 48,
    businessActivity: "Wholesaler",
    sector: "FMCG",
    scenarios: ["SN008", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 49,
    businessActivity: "Wholesaler",
    sector: "Textile",
    scenarios: ["SN009", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 50,
    businessActivity: "Wholesaler",
    sector: "Telecom",
    scenarios: ["SN010", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 51,
    businessActivity: "Wholesaler",
    sector: "Petroleum",
    scenarios: ["SN012", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 52,
    businessActivity: "Wholesaler",
    sector: "Electricity Distribution",
    scenarios: ["SN013", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 53,
    businessActivity: "Wholesaler",
    sector: "Gas Distribution",
    scenarios: ["SN014", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 54,
    businessActivity: "Wholesaler",
    sector: "Services",
    scenarios: ["SN018", "SN019", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 55,
    businessActivity: "Wholesaler",
    sector: "Automobile",
    scenarios: ["SN020", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 56,
    businessActivity: "Wholesaler",
    sector: "CNG Stations",
    scenarios: ["SN023", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 57,
    businessActivity: "Wholesaler",
    sector: "Pharmaceuticals",
    scenarios: ["SN025", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 58,
    businessActivity: "Wholesaler",
    sector: "Wholesale / Retails",
    scenarios: ["SN001", "SN002", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 61,
    businessActivity: "Exporter",
    sector: "All Other Sectors",
    scenarios: ["SN001", "SN002", "SN005", "SN006", "SN007", "SN015", "SN016", "SN017", "SN021", "SN022", "SN024"],
  },
  {
    serialNumber: 62,
    businessActivity: "Exporter",
    sector: "Steel",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN003",
      "SN004",
      "SN011",
    ],
  },
  {
    serialNumber: 63,
    businessActivity: "Exporter",
    sector: "FMCG",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN008",
    ],
  },
  {
    serialNumber: 64,
    businessActivity: "Exporter",
    sector: "Textile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN009",
    ],
  },
  {
    serialNumber: 65,
    businessActivity: "Exporter",
    sector: "Telecom",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN010",
    ],
  },
  {
    serialNumber: 66,
    businessActivity: "Exporter",
    sector: "Petroleum",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN012",
    ],
  },
  {
    serialNumber: 67,
    businessActivity: "Exporter",
    sector: "Electricity Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN013",
    ],
  },
  {
    serialNumber: 68,
    businessActivity: "Exporter",
    sector: "Gas Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN014",
    ],
  },
  {
    serialNumber: 69,
    businessActivity: "Exporter",
    sector: "Services",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN018",
      "SN019",
    ],
  },
  {
    serialNumber: 70,
    businessActivity: "Exporter",
    sector: "Automobile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN020",
    ],
  },
  {
    serialNumber: 71,
    businessActivity: "Exporter",
    sector: "CNG Stations",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN023",
    ],
  },
  {
    serialNumber: 72,
    businessActivity: "Exporter",
    sector: "Pharmaceuticals",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN025",
    ],
  },
  {
    serialNumber: 73,
    businessActivity: "Exporter",
    sector: "Wholesale / Retails",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 76,
    businessActivity: "Retailer",
    sector: "All Other Sectors",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
  {
    serialNumber: 77,
    businessActivity: "Retailer",
    sector: "Steel",
    scenarios: ["SN003", "SN004", "SN011"],
  },
  {
    serialNumber: 78,
    businessActivity: "Retailer",
    sector: "FMCG",
    scenarios: ["SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 79,
    businessActivity: "Retailer",
    sector: "Textile",
    scenarios: ["SN009", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 80,
    businessActivity: "Retailer",
    sector: "Telecom",
    scenarios: ["SN010", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 81,
    businessActivity: "Retailer",
    sector: "Petroleum",
    scenarios: ["SN012", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 82,
    businessActivity: "Retailer",
    sector: "Electricity Distribution",
    scenarios: ["SN013", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 83,
    businessActivity: "Retailer",
    sector: "Gas Distribution",
    scenarios: ["SN014", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 84,
    businessActivity: "Retailer",
    sector: "Services",
    scenarios: ["SN018", "SN019", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 85,
    businessActivity: "Retailer",
    sector: "Automobile",
    scenarios: ["SN020", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 86,
    businessActivity: "Retailer",
    sector: "CNG Stations",
    scenarios: ["SN023", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 87,
    businessActivity: "Retailer",
    sector: "Pharmaceuticals",
    scenarios: ["SN025", "SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 88,
    businessActivity: "Retailer",
    sector: "Wholesale / Retails",
    scenarios: ["SN026", "SN027", "SN028", "SN008"],
  },
  {
    serialNumber: 91,
    businessActivity: "Service Provider",
    sector: "All Other Sectors",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN018",
      "SN019",
    ],
  },
  {
    serialNumber: 92,
    businessActivity: "Service Provider",
    sector: "Steel",
    scenarios: ["SN003", "SN004", "SN011", "SN018", "SN019"],
  },
  {
    serialNumber: 93,
    businessActivity: "Service Provider",
    sector: "FMCG",
    scenarios: ["SN008", "SN018", "SN019"],
  },
  {
    serialNumber: 94,
    businessActivity: "Service Provider",
    sector: "Textile",
    scenarios: ["SN009", "SN018", "SN019"],
  },
  {
    serialNumber: 95,
    businessActivity: "Service Provider",
    sector: "Telecom",
    scenarios: ["SN010", "SN018", "SN019"],
  },
  {
    serialNumber: 96,
    businessActivity: "Service Provider",
    sector: "Petroleum",
    scenarios: ["SN012", "SN018", "SN019"],
  },
  {
    serialNumber: 97,
    businessActivity: "Service Provider",
    sector: "Electricity Distribution",
    scenarios: ["SN013", "SN018", "SN019"],
  },
  {
    serialNumber: 98,
    businessActivity: "Service Provider",
    sector: "Gas Distribution",
    scenarios: ["SN014", "SN018", "SN019"],
  },
  {
    serialNumber: 99,
    businessActivity: "Service Provider",
    sector: "Services",
    scenarios: ["SN018", "SN019"],
  },
  {
    serialNumber: 100,
    businessActivity: "Service Provider",
    sector: "Automobile",
    scenarios: ["SN020", "SN018", "SN019"],
  },
  {
    serialNumber: 101,
    businessActivity: "Service Provider",
    sector: "CNG Stations",
    scenarios: ["SN023", "SN018", "SN019"],
  },
  {
    serialNumber: 102,
    businessActivity: "Service Provider",
    sector: "Pharmaceuticals",
    scenarios: ["SN025", "SN018", "SN019"],
  },
  {
    serialNumber: 103,
    businessActivity: "Service Provider",
    sector: "Wholesale / Retails",
    scenarios: ["SN026", "SN027", "SN028", "SN008", "SN018", "SN019"],
  },
  {
    serialNumber: 106,
    businessActivity: "Other",
    sector: "All Other Sectors",
    scenarios: ["SN001", "SN002", "SN005", "SN006", "SN007", "SN015", "SN016", "SN017", "SN021", "SN022", "SN024"],
  },
  {
    serialNumber: 107,
    businessActivity: "Other",
    sector: "Steel",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN003",
      "SN004",
      "SN011",
    ],
  },
  {
    serialNumber: 108,
    businessActivity: "Other",
    sector: "FMCG",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN008",
    ],
  },
  {
    serialNumber: 109,
    businessActivity: "Other",
    sector: "Textile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN009",
    ],
  },
  {
    serialNumber: 110,
    businessActivity: "Other",
    sector: "Telecom",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN010",
    ],
  },
  {
    serialNumber: 111,
    businessActivity: "Other",
    sector: "Petroleum",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN012",
    ],
  },
  {
    serialNumber: 112,
    businessActivity: "Other",
    sector: "Electricity Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN013",
    ],
  },
  {
    serialNumber: 113,
    businessActivity: "Other",
    sector: "Gas Distribution",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN014",
    ],
  },
  {
    serialNumber: 114,
    businessActivity: "Other",
    sector: "Services",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN018",
      "SN019",
    ],
  },
  {
    serialNumber: 115,
    businessActivity: "Other",
    sector: "Automobile",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN020",
    ],
  },
  {
    serialNumber: 116,
    businessActivity: "Other",
    sector: "CNG Stations",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN023",
    ],
  },
  {
    serialNumber: 117,
    businessActivity: "Other",
    sector: "Pharmaceuticals",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN025",
    ],
  },
  {
    serialNumber: 118,
    businessActivity: "Other",
    sector: "Wholesale / Retails",
    scenarios: [
      "SN001",
      "SN002",
      "SN005",
      "SN006",
      "SN007",
      "SN015",
      "SN016",
      "SN017",
      "SN021",
      "SN022",
      "SN024",
      "SN026",
      "SN027",
      "SN028",
      "SN008",
    ],
  },
];

export function getScenarioById(scenarioId: string): TaxScenario | undefined {
  return TAX_SCENARIOS.find((scenario) => scenario.id === scenarioId);
}

export function getTaxScenariosByBusinessActivityAndSector(
  businessActivity: string[],
  sector: string[]
): TaxScenario[] {
  const businessScenarios = BUSINESS_ACTIVITY_SCENARIOS.filter(
    (item) => businessActivity.includes(item.businessActivity) && sector.includes(item.sector)
  );
  const scenarioCodes = businessScenarios.flatMap((item) => item.scenarios);
  const uniqueScenarioCodes = Array.from(new Set<string>(scenarioCodes));
  return TAX_SCENARIOS.filter((scenario) => uniqueScenarioCodes.includes(scenario.id));
}

export function getCombinationsByActivitiesAndSectors(
  activities: string[],
  sectors: string[]
): { businessActivity: string; sector: string }[] {
  return BUSINESS_ACTIVITY_SCENARIOS.filter(
    (item) => activities.includes(item.businessActivity) && sectors.includes(item.sector)
  );
}

export function getScenariosByBusinessActivity(businessActivity: string, sector?: string): string[] {
  const filtered = BUSINESS_ACTIVITY_SCENARIOS.filter((item) => {
    const activityMatch = item.businessActivity.toLowerCase() === businessActivity.toLowerCase();
    if (sector) {
      return activityMatch && item.sector.toLowerCase() === sector.toLowerCase();
    }
    return activityMatch;
  });

  return filtered.length > 0 ? filtered[0].scenarios : [];
}

export function getSaleTypeByScenario(scenarioId: string): string | undefined {
  const scenario = getScenarioById(scenarioId);
  return scenario?.saleType;
}

export const RETAILER_ONLY_SCENARIOS = ["SN026", "SN027", "SN028"];

export const SCENARIO_NOTES = {
  RETAILER_ONLY: "Scenarios SN026, SN027 & SN028 are applicable only if registered as retailer in sales tax profile.",
};

export interface BusinessActivityType {
  id: number;
  name: string;
  description?: string;
}

export const BUSINESS_ACTIVITIES: BusinessActivityType[] = [
  { id: 1, name: "Manufacturer", description: "Manufacturing businesses" },
  { id: 2, name: "Importer", description: "Import businesses" },
  { id: 3, name: "Distributor", description: "Distribution businesses" },
  { id: 4, name: "Wholesaler", description: "Wholesale businesses" },
  { id: 5, name: "Exporter", description: "Export businesses" },
  { id: 6, name: "Retailer", description: "Retail businesses" },
  { id: 7, name: "Service Provider", description: "Service providing businesses" },
  { id: 8, name: "Other", description: "Other business types" },
];

export interface Sector {
  id: number;
  name: string;
  description?: string;
}

export const BUSINESS_SECTORS: Sector[] = [
  { id: 1, name: "All Other Sectors", description: "General sectors not specified elsewhere" },
  { id: 2, name: "Steel", description: "Steel manufacturing and related" },
  { id: 3, name: "FMCG", description: "Fast Moving Consumer Goods" },
  { id: 4, name: "Textile", description: "Textile manufacturing and related" },
  { id: 5, name: "Telecom", description: "Telecommunications services" },
  { id: 6, name: "Petroleum", description: "Petroleum products and services" },
  { id: 7, name: "Electricity Distribution", description: "Electricity distribution services" },
  { id: 8, name: "Gas Distribution", description: "Gas distribution services" },
  { id: 9, name: "Services", description: "General services" },
  { id: 10, name: "Automobile", description: "Automobile manufacturing and related" },
  { id: 11, name: "CNG Stations", description: "CNG stations and related services" },
  { id: 12, name: "Pharmaceuticals", description: "Pharmaceutical products and services" },
  { id: 13, name: "Wholesale / Retails", description: "Wholesale and retail businesses" },
];

export function getBusinessActivityTypeByName(name: string): BusinessActivityType | undefined {
  return BUSINESS_ACTIVITIES.find((type) => type.name.toLowerCase() === name.toLowerCase());
}

export function getSectorByName(name: string): Sector | undefined {
  return BUSINESS_SECTORS.find((sector) => sector.name.toLowerCase() === name.toLowerCase());
}

export function getAvailableSectorsForBusinessActivities(businessActivityTypeIds: number[]): Sector[] {
  if (!businessActivityTypeIds || businessActivityTypeIds.length === 0) {
    return [];
  }

  // Get unique sectors from business activity scenarios that match the selected business activities
  const availableSectorNames = new Set<string>();

  BUSINESS_ACTIVITY_SCENARIOS.forEach((scenario) => {
    const businessActivityType = getBusinessActivityTypeByName(scenario.businessActivity);
    if (businessActivityType && businessActivityTypeIds.includes(businessActivityType.id)) {
      availableSectorNames.add(scenario.sector);
    }
  });

  // Return sector objects for the available sector names
  return BUSINESS_SECTORS.filter((sector) => availableSectorNames.has(sector.name));
}

export function getScenariosForBusinessActivityAndSectorCombinations(
  businessActivityTypeIds: number[],
  sectorIds: number[]
): string[] {
  if (!businessActivityTypeIds.length || !sectorIds.length) {
    return [];
  }

  const scenarios = new Set<string>();

  businessActivityTypeIds.forEach((activityId) => {
    const activityType = BUSINESS_ACTIVITIES.find((t) => t.id === activityId);
    if (!activityType) return;

    sectorIds.forEach((sectorId) => {
      const sector = BUSINESS_SECTORS.find((s) => s.id === sectorId);
      if (!sector) return;

      // Find matching business activity scenario
      const matchingScenario = BUSINESS_ACTIVITY_SCENARIOS.find(
        (bas) => bas.businessActivity === activityType.name && bas.sector === sector.name
      );

      if (matchingScenario) {
        matchingScenario.scenarios.forEach((scenarioId) => scenarios.add(scenarioId));
      }
    });
  });

  return Array.from(scenarios);
}

export interface Province {
  state_province_code: number;
  state_province_desc: string;
}

export const PROVINCES: Province[] = [
  { state_province_code: 2, state_province_desc: "Balochistan" },
  { state_province_code: 4, state_province_desc: "Azad Jammu And Kashmir" },
  { state_province_code: 5, state_province_desc: "Capital Territory" },
  { state_province_code: 6, state_province_desc: "Khyber Pakhtunkhwa" },
  { state_province_code: 7, state_province_desc: "Punjab" },
  { state_province_code: 8, state_province_desc: "Sindh" },
  { state_province_code: 9, state_province_desc: "Northern Areas" },
];
