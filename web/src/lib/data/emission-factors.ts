export interface FuelEmissionFactor {
  id: number;
  name: string;
  unit: string;
  co2: number;
  ch4: number | null;
  n2o: number | null;
  category?: "fossil" | "biofuel";
}

export const FOSSIL_FUELS: FuelEmissionFactor[] = [
  { id: 2, name: "Acetileno", unit: "kg", co2: 3.0, ch4: null, n2o: null },
  { id: 3, name: "Alcatrão", unit: "m³", co2: 2888.0, ch4: null, n2o: null },
  { id: 4, name: "Asfaltos", unit: "m³", co2: 3389.0, ch4: null, n2o: null },
  { id: 5, name: "Carvão Metalúrgico Importado", unit: "Toneladas", co2: 2931.0, ch4: null, n2o: null },
  { id: 6, name: "Carvão Metalúrgico Nacional", unit: "Toneladas", co2: 2543.0, ch4: null, n2o: null },
  { id: 7, name: "Carvão Vapor 3100 kcal/kg", unit: "Toneladas", co2: 1250.0, ch4: null, n2o: null },
  { id: 8, name: "Carvão Vapor 3300 kcal/kg", unit: "Toneladas", co2: 1313.0, ch4: null, n2o: null },
  { id: 9, name: "Carvão Vapor 3700 kcal/kg", unit: "Toneladas", co2: 1483.0, ch4: null, n2o: null },
  { id: 10, name: "Carvão Vapor 4200 kcal/kg", unit: "Toneladas", co2: 1609.0, ch4: null, n2o: null },
  { id: 11, name: "Carvão Vapor 4500 kcal/kg", unit: "Toneladas", co2: 1709.0, ch4: null, n2o: null },
  { id: 12, name: "Carvão Vapor 4700 kcal/kg", unit: "Toneladas", co2: 1763.0, ch4: null, n2o: null },
  { id: 13, name: "Carvão Vapor 5200 kcal/kg", unit: "Toneladas", co2: 1971.0, ch4: null, n2o: null },
  { id: 14, name: "Carvão Vapor 5900 kcal/kg", unit: "Toneladas", co2: 2218.0, ch4: null, n2o: null },
  { id: 15, name: "Carvão Vapor 6000 kcal/kg", unit: "Toneladas", co2: 2258.0, ch4: null, n2o: null },
  { id: 16, name: "Carvão Vapor sem Especificação", unit: "Toneladas", co2: 1208.0, ch4: null, n2o: null },
  { id: 17, name: "Coque de Carvão Mineral", unit: "Toneladas", co2: 3093.0, ch4: null, n2o: null },
  { id: 18, name: "Coque de Petróleo", unit: "m³", co2: 3563.0, ch4: null, n2o: null },
  { id: 19, name: "Etano", unit: "Toneladas", co2: 2858.0, ch4: null, n2o: null },
  { id: 20, name: "Gás de Coqueria", unit: "Toneladas", co2: 1717.0, ch4: null, n2o: null },
  { id: 21, name: "Gás de Refinaria", unit: "Toneladas", co2: 2850.0, ch4: null, n2o: null },
  { id: 22, name: "Gás Liquefeito de Petróleo (GLP)", unit: "Toneladas", co2: 2931.0, ch4: null, n2o: null },
  { id: 23, name: "Gás Natural Seco", unit: "m³", co2: 2.07, ch4: null, n2o: null },
  { id: 24, name: "Gás Natural Úmido", unit: "m³", co2: 2.33, ch4: null, n2o: null },
  { id: 25, name: "Gasolina Automotiva (pura)", unit: "Litros", co2: 2.24, ch4: null, n2o: null },
  { id: 26, name: "Gasolina de Aviação", unit: "Litros", co2: 2.26, ch4: null, n2o: null },
  { id: 27, name: "Líquidos de Gás Natural (LGN)", unit: "Toneladas", co2: 2836.0, ch4: null, n2o: null },
  { id: 28, name: "Lubrificantes", unit: "Litros", co2: 2.72, ch4: null, n2o: null },
  { id: 29, name: "Nafta", unit: "m³", co2: 2291.0, ch4: null, n2o: null },
  { id: 30, name: "Óleo Combustível", unit: "Litros", co2: 3.11, ch4: null, n2o: null },
  { id: 31, name: "Óleo de Xisto", unit: "Toneladas", co2: 2793.0, ch4: null, n2o: null },
  { id: 32, name: "Óleo Diesel (puro)", unit: "Litros", co2: 2.63, ch4: null, n2o: null },
  { id: 33, name: "Óleos Residuais", unit: "Toneladas", co2: 2947.0, ch4: null, n2o: null },
  { id: 34, name: "Outros Produtos de Petróleo", unit: "Toneladas", co2: 3132.0, ch4: null, n2o: null },
  { id: 35, name: "Parafina", unit: "Toneladas", co2: 2947.0, ch4: null, n2o: null },
  { id: 36, name: "Petróleo Bruto", unit: "m³", co2: 2931.0, ch4: null, n2o: null },
  { id: 37, name: "Querosene de Aviação", unit: "Toneladas", co2: 3113.0, ch4: null, n2o: null },
  { id: 38, name: "Querosene Iluminante", unit: "Toneladas", co2: 3129.0, ch4: null, n2o: null },
  { id: 39, name: "Resíduos Industriais", unit: "TJ", co2: 143000.0, ch4: null, n2o: null },
  { id: 40, name: "Resíduos Municipais (não-biomassa)", unit: "Toneladas", co2: 917.0, ch4: null, n2o: null },
  { id: 41, name: "Solventes", unit: "Litros", co2: 2.4, ch4: null, n2o: null },
  { id: 42, name: "Turfa", unit: "Toneladas", co2: 1035.0, ch4: null, n2o: null },
  { id: 43, name: "Xisto Betuminoso e Areias Betuminosas", unit: "Toneladas", co2: 952.0, ch4: null, n2o: null },
];

export const BIOFUELS: FuelEmissionFactor[] = [
  { id: 49, name: "Etanol Anidro", unit: "Litros", co2: 1.58, ch4: null, n2o: null },
  { id: 50, name: "Etanol Hidratado", unit: "Litros", co2: 1.51, ch4: null, n2o: null },
  { id: 51, name: "Bagaço de Cana", unit: "Toneladas", co2: 893.0, ch4: null, n2o: null },
  { id: 52, name: "Biodiesel (B100)", unit: "Litros", co2: 2.46, ch4: null, n2o: null },
  { id: 53, name: "Biogás (outros)", unit: "Toneladas", co2: 1705.0, ch4: null, n2o: null },
  { id: 54, name: "Biogás de aterro", unit: "Toneladas", co2: 1467.0, ch4: null, n2o: null },
  { id: 55, name: "Biometano", unit: "Toneladas", co2: 2749.0, ch4: null, n2o: null },
  { id: 56, name: "Biopropano (bioGLP)", unit: "Toneladas", co2: 2926.0, ch4: null, n2o: null },
  { id: 57, name: "Caldo de Cana", unit: "Toneladas", co2: 207.0, ch4: null, n2o: null },
  { id: 58, name: "Carvão Vegetal", unit: "Toneladas", co2: 2886.0, ch4: null, n2o: null },
  { id: 59, name: "Lenha Comercial", unit: "Toneladas", co2: 1451.0, ch4: null, n2o: null },
  { id: 60, name: "Licor Negro (Lixívia)", unit: "Toneladas", co2: 1142.0, ch4: null, n2o: null },
  { id: 61, name: "Melaço", unit: "Toneladas", co2: 616.0, ch4: null, n2o: null },
  { id: 62, name: "Resíduos Municipais (biomassa)", unit: "Toneladas", co2: 1160.0, ch4: null, n2o: null },
  { id: 63, name: "Resíduos Vegetais", unit: "Toneladas", co2: 1161.0, ch4: null, n2o: null },
];

export const ALL_FUELS: FuelEmissionFactor[] = [
  ...FOSSIL_FUELS.map((f) => ({ ...f, category: "fossil" as const })),
  ...BIOFUELS.map((f) => ({ ...f, category: "biofuel" as const })),
];

export const GWP = { CO2: 1, CH4: 27.2, N2O: 273 };

export const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const SECTORS = ["Industrial", "Comercial", "Residencial", "Público", "Agropecuário"];

export const RENEWABLE_SOURCES = ["Solar", "Eólica", "Biomassa", "Hídrica", "Geotérmica"];
