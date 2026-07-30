// src/utils/lab-templates.ts

export interface LabField {
  name: string;
  label: string;
  type: "number" | "text" | "select" | "boolean";
  unit?: string;
  referenceRange?: string;
  options?: string[]; // For select types
}

export interface LabTemplate {
  cptCode: string;
  serviceName: string;
  fields: LabField[];
}

export const labTemplates: Record<string, LabTemplate> = {
  // 1. Basic Metabolic Panel (BMP)[cite: 7]
  "80048": {
    cptCode: "80048",
    serviceName: "Basic metabolic panel (BMP)",
    fields: [
      { name: "glucose", label: "Glucose", type: "number", unit: "mg/dL", referenceRange: "70-99" },
      { name: "calcium", label: "Calcium", type: "number", unit: "mg/dL", referenceRange: "8.6-10.3" },
      { name: "sodium", label: "Sodium", type: "number", unit: "mEq/L", referenceRange: "135-145" },
      { name: "potassium", label: "Potassium", type: "number", unit: "mEq/L", referenceRange: "3.5-5.2" },
      { name: "chloride", label: "Chloride", type: "number", unit: "mEq/L", referenceRange: "96-106" },
      { name: "bun", label: "BUN", type: "number", unit: "mg/dL", referenceRange: "6-20" },
      { name: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", referenceRange: "0.6-1.3" },
    ],
  },
  
  // 2. Comprehensive Metabolic Panel (CMP)[cite: 7]
  "80053": {
    cptCode: "80053",
    serviceName: "Comprehensive metabolic panel (CMP)",
    fields: [
      // ... (Includes BMP fields above)
      { name: "ast", label: "AST (SGOT)", type: "number", unit: "U/L", referenceRange: "8-33" },
      { name: "alt", label: "ALT (SGPT)", type: "number", unit: "U/L", referenceRange: "4-36" },
      { name: "alp", label: "Alkaline Phosphatase", type: "number", unit: "U/L", referenceRange: "20-130" },
      { name: "bilirubin_total", label: "Bilirubin, Total", type: "number", unit: "mg/dL", referenceRange: "0.1-1.2" },
      { name: "protein_total", label: "Protein, Total", type: "number", unit: "g/dL", referenceRange: "6.0-8.3" },
    ],
  },

  // 3. Lipid Panel[cite: 7]
  "80061": {
    cptCode: "80061",
    serviceName: "Lipid panel",
    fields: [
      { name: "cholesterol_total", label: "Total Cholesterol", type: "number", unit: "mg/dL", referenceRange: "<200" },
      { name: "triglycerides", label: "Triglycerides", type: "number", unit: "mg/dL", referenceRange: "<150" },
      { name: "hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", referenceRange: ">40" },
      { name: "ldl", label: "LDL Cholesterol (Calculated)", type: "number", unit: "mg/dL", referenceRange: "<100" },
    ],
  },

  // 4. Hepatic Function Panel[cite: 7]
  "80076": {
    cptCode: "80076",
    serviceName: "Hepatic function panel",
    fields: [
      { name: "albumin", label: "Albumin", type: "number", unit: "g/dL", referenceRange: "3.4-5.4" },
      { name: "bilirubin_total", label: "Total Bilirubin", type: "number", unit: "mg/dL", referenceRange: "0.1-1.2" },
      { name: "bilirubin_direct", label: "Direct Bilirubin", type: "number", unit: "mg/dL", referenceRange: "<0.3" },
      { name: "ast", label: "AST", type: "number", unit: "U/L", referenceRange: "8-33" },
      { name: "alt", label: "ALT", type: "number", unit: "U/L", referenceRange: "4-36" },
    ],
  },

  // 5. Urinalysis, non-automated, with microscopy[cite: 7]
  "81000": {
    cptCode: "81000",
    serviceName: "Urinalysis, non-automated, with microscopy",
    fields: [
      { name: "color", label: "Color", type: "text", referenceRange: "Yellow" },
      { name: "clarity", label: "Clarity", type: "text", referenceRange: "Clear" },
      { name: "ph", label: "pH", type: "number", referenceRange: "5.0-8.0" },
      { name: "specific_gravity", label: "Specific Gravity", type: "number", referenceRange: "1.005-1.030" },
      { name: "protein", label: "Protein", type: "select", options: ["Negative", "Trace", "1+", "2+", "3+"], referenceRange: "Negative" },
      { name: "glucose", label: "Glucose", type: "select", options: ["Negative", "Trace", "1+", "2+", "3+"], referenceRange: "Negative" },
      { name: "wbc", label: "WBCs", type: "text", unit: "/HPF", referenceRange: "0-5" },
      { name: "rbc", label: "RBCs", type: "text", unit: "/HPF", referenceRange: "0-2" },
    ],
  },

  // 6. Urine Pregnancy Test[cite: 7]
  "81025": {
    cptCode: "81025",
    serviceName: "Urine pregnancy test",
    fields: [
      { name: "hcg_result", label: "hCG Result", type: "select", options: ["Positive", "Negative", "Indeterminate"] },
    ],
  },

  // 7. Glucose blood test (quantitative)[cite: 7]
  "82947": {
    cptCode: "82947",
    serviceName: "Glucose blood test (quantitative)",
    fields: [
      { name: "glucose_fasting", label: "Fasting Blood Glucose", type: "number", unit: "mg/dL", referenceRange: "70-99" },
    ],
  },

  // 8. Hemoglobin A1C test[cite: 7]
  "83036": {
    cptCode: "83036",
    serviceName: "Hemoglobin A1C test",
    fields: [
      { name: "hba1c", label: "HbA1c", type: "number", unit: "%", referenceRange: "<5.7" },
      { name: "eag", label: "Estimated Average Glucose (eAG)", type: "number", unit: "mg/dL" },
    ],
  },

  // 9. PSA (Prostate specific antigen) test[cite: 7]
  "84153": {
    cptCode: "84153",
    serviceName: "PSA (Prostate specific antigen) test",
    fields: [
      { name: "psa_total", label: "Total PSA", type: "number", unit: "ng/mL", referenceRange: "<4.0" },
    ],
  },

  // 10. TSH (Thyroid stimulating hormone) test[cite: 7]
  "84443": {
    cptCode: "84443",
    serviceName: "TSH (Thyroid stimulating hormone) test",
    fields: [
      { name: "tsh", label: "TSH", type: "number", unit: "mIU/L", referenceRange: "0.4-4.0" },
    ],
  },

  // 11. Complete blood count (CBC) with automated differential[cite: 7]
  "85025": {
    cptCode: "85025",
    serviceName: "Complete blood count (CBC) with automated differential",
    fields: [
      { name: "wbc", label: "White Blood Cells (WBC)", type: "number", unit: "10^3/uL", referenceRange: "4.5-11.0" },
      { name: "rbc", label: "Red Blood Cells (RBC)", type: "number", unit: "10^6/uL", referenceRange: "4.5-5.9" },
      { name: "hemoglobin", label: "Hemoglobin (Hb)", type: "number", unit: "g/dL", referenceRange: "13.5-17.5" },
      { name: "hematocrit", label: "Hematocrit (Hct)", type: "number", unit: "%", referenceRange: "41-53" },
      { name: "platelets", label: "Platelets", type: "number", unit: "10^3/uL", referenceRange: "150-450" },
      { name: "neutrophils", label: "Neutrophils", type: "number", unit: "%", referenceRange: "40-60" },
      { name: "lymphocytes", label: "Lymphocytes", type: "number", unit: "%", referenceRange: "20-40" },
      { name: "monocytes", label: "Monocytes", type: "number", unit: "%", referenceRange: "2-8" },
      { name: "eosinophils", label: "Eosinophils", type: "number", unit: "%", referenceRange: "1-4" },
      { name: "basophils", label: "Basophils", type: "number", unit: "%", referenceRange: "0.5-1" },
    ],
  },

  // 12. Prothrombin time (PT) test[cite: 7]
  "85610": {
    cptCode: "85610",
    serviceName: "Prothrombin time (PT) test",
    fields: [
      { name: "pt", label: "Prothrombin Time", type: "number", unit: "sec", referenceRange: "11.0-13.5" },
      { name: "inr", label: "INR", type: "number", referenceRange: "0.8-1.1" },
    ],
  },

  // 13. C-reactive protein (CRP) test[cite: 7]
  "86140": {
    cptCode: "86140",
    serviceName: "C-reactive protein (CRP) test",
    fields: [
      { name: "crp", label: "CRP", type: "number", unit: "mg/L", referenceRange: "<10.0" },
    ],
  },

  // 14. Influenza rapid test[cite: 7]
  "87804": {
    cptCode: "87804",
    serviceName: "Influenza rapid test",
    fields: [
      { name: "flu_a", label: "Influenza A", type: "select", options: ["Positive", "Negative", "Invalid"] },
      { name: "flu_b", label: "Influenza B", type: "select", options: ["Positive", "Negative", "Invalid"] },
    ],
  },

  // 15. Strep A rapid test[cite: 7]
  "87880": {
    cptCode: "87880",
    serviceName: "Strep A rapid test",
    fields: [
      { name: "strep_a", label: "Strep A Result", type: "select", options: ["Positive", "Negative", "Invalid"] },
    ],
  },

  // 16. HIV-1 antibody screening test[cite: 7]
  "86701": {
    cptCode: "86701",
    serviceName: "HIV-1 antibody screening test",
    fields: [
      { name: "hiv1_antibody", label: "HIV-1 Antibody", type: "select", options: ["Reactive", "Non-Reactive"] },
    ],
  },

  // 17. Widal Test[cite: 7]
  "86000": {
    cptCode: "86000",
    serviceName: "Widal Test (Febrile agglutinins, Salmonella)",
    fields: [
      { name: "salmonella_o", label: "Salmonella Typhi O", type: "select", options: ["1:20", "1:40", "1:80", "1:160", "1:320"] },
      { name: "salmonella_h", label: "Salmonella Typhi H", type: "select", options: ["1:20", "1:40", "1:80", "1:160", "1:320"] },
    ],
  },

  // 18. Blood Culture and Sensitivity[cite: 7]
  "87040": {
    cptCode: "87040",
    serviceName: "Blood Culture and Sensitivity (bacterial, aerobic)",
    fields: [
      { name: "growth", label: "Growth Detected?", type: "select", options: ["Yes", "No Growth after 5 days"] },
      { name: "organism_identified", label: "Organism Identified", type: "text" },
      { name: "sensitivity_report", label: "Sensitivity Findings", type: "text" }, // Could be a complex nested object in a real app
    ],
  },
  
  // 19. Hepatitis B surface antigen (HBsAg) immunoassay[cite: 7]
  "87340": {
    cptCode: "87340",
    serviceName: "Hepatitis B surface antigen (HBsAg) immunoassay",
    fields: [
      { name: "hbsag_result", label: "HBsAg Result", type: "select", options: ["Reactive", "Non-Reactive", "Indeterminate"] },
    ],
  },

  // 20. Stool Culture and Sensitivity[cite: 7]
  "87045": {
    cptCode: "87045",
    serviceName: "Stool Culture and Sensitivity (bacterial, aerobic)",
    fields: [
      { name: "appearance", label: "Macroscopic Appearance", type: "text" },
      { name: "occult_blood", label: "Occult Blood", type: "select", options: ["Positive", "Negative"] },
      { name: "parasites", label: "Ova and Parasites", type: "text", referenceRange: "None seen" },
      { name: "culture_growth", label: "Pathogenic Growth", type: "text", referenceRange: "Normal flora" },
    ],
  },

  // Malaria Parasite (MP) Rapid Diagnostic Test (RDT)
  "87899": {
    cptCode: "87899",
    serviceName: "Infectious agent detection by immunoassay with direct optical observation; not otherwise specified (Malaria RDT)",
    fields: [
      { name: "mp_antigen_falciparum", label: "P. falciparum (HRP2 Antigen)", type: "select", options: ["Positive", "Negative", "Invalid"], },
      { name: "mp_antigen_pan", label: "Pan-Malarial Antigen (pLDH)", type: "select", options: ["Positive", "Negative", "Invalid"], }
    ],
  },

  // Blood Film for Malaria Parasites (Thick and Thin Smear)
  "87207": {
    cptCode: "87207",
    serviceName: "Smear, primary source with interpretation; special stain for inclusion bodies or parasites (e.g., malaria)",
    fields: [
      { name: "parasite_presence", label: "Parasites Detected", type: "select", options: ["Positive", "Negative"] },
      { name: "plasmodium_species", label: "Plasmodium Species", type: "text" },
      { name: "parasitemia_level", label: "Parasitemia Density", type: "text" },
      { name: "microscopic_description", label: "Morphology Notes", type: "text"},
    ]
  },

  // 80051: Electrolyte panel (Sodium, Potassium, Chloride, CO2)[cite: 1]
  "80051": {
    cptCode: "80051",
    serviceName: "Electrolyte panel (Sodium, Potassium, Chloride, CO2)",
    fields: [
      { name: "sodium", label: "Sodium", type: "number", unit: "mEq/L", referenceRange: "135-145" },
      { name: "potassium", label: "Potassium", type: "number", unit: "mEq/L", referenceRange: "3.5-5.2" },
      { name: "chloride", label: "Chloride", type: "number", unit: "mEq/L", referenceRange: "96-106" },
      { name: "co2", label: "Carbon Dioxide (CO2)", type: "number", unit: "mEq/L", referenceRange: "23-29" }
    ],
  },

  // 80069: Renal function panel (Albumin, BUN, Creatinine, Electrolytes)[cite: 1]
  "80069": {
    cptCode: "80069",
    serviceName: "Renal function panel (Albumin, BUN, Creatinine, Electrolytes)",
    fields: [
      { name: "albumin", label: "Albumin", type: "number", unit: "g/dL", referenceRange: "3.4-5.4" },
      { name: "bun", label: "BUN", type: "number", unit: "mg/dL", referenceRange: "6-20" },
      { name: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", referenceRange: "0.6-1.3" },
      { name: "sodium", label: "Sodium", type: "number", unit: "mEq/L", referenceRange: "135-145" },
      { name: "potassium", label: "Potassium", type: "number", unit: "mEq/L", referenceRange: "3.5-5.2" },
      { name: "chloride", label: "Chloride", type: "number", unit: "mEq/L", referenceRange: "96-106" },
      { name: "co2", label: "Carbon Dioxide (CO2)", type: "number", unit: "mEq/L", referenceRange: "23-29" },
      { name: "calcium", label: "Calcium", type: "number", unit: "mg/dL", referenceRange: "8.6-10.3" },
      { name: "phosphorus", label: "Phosphorus", type: "number", unit: "mg/dL", referenceRange: "2.5-4.5" }
    ],
  },

  // 80074: Acute hepatitis panel[cite: 1]
  "80074": {
    cptCode: "80074",
    serviceName: "Acute hepatitis panel",
    fields: [
      { name: "hav_igm", label: "Hepatitis A IgM Antibody", type: "select", options: ["Reactive", "Non-Reactive"] },
      { name: "hbsag", label: "Hepatitis B Surface Antigen", type: "select", options: ["Reactive", "Non-Reactive"] },
      { name: "hbcab_igm", label: "Hepatitis B Core IgM Antibody", type: "select", options: ["Reactive", "Non-Reactive"] },
      { name: "hcv_ab", label: "Hepatitis C Antibody", type: "select", options: ["Reactive", "Non-Reactive"] }
    ],
  },

  // 81001: Urinalysis, automated with microscopy[cite: 1]
  "81001": {
    cptCode: "81001",
    serviceName: "Urinalysis, automated with microscopy",
    fields: [
      { name: "color", label: "Color", type: "text", referenceRange: "Yellow" },
      { name: "clarity", label: "Clarity", type: "text", referenceRange: "Clear" },
      { name: "ph", label: "pH", type: "number", referenceRange: "5.0-8.0" },
      { name: "specific_gravity", label: "Specific Gravity", type: "number", referenceRange: "1.005-1.030" },
      { name: "protein", label: "Protein", type: "select", options: ["Negative", "Trace", "1+", "2+", "3+"], referenceRange: "Negative" },
      { name: "glucose", label: "Glucose", type: "select", options: ["Negative", "Trace", "1+", "2+", "3+"], referenceRange: "Negative" },
      { name: "ketones", label: "Ketones", type: "select", options: ["Negative", "Trace", "Small", "Moderate", "Large"], referenceRange: "Negative" },
      { name: "leukocyte_esterase", label: "Leukocyte Esterase", type: "select", options: ["Negative", "Trace", "Small", "Moderate", "Large"], referenceRange: "Negative" },
      { name: "nitrite", label: "Nitrite", type: "select", options: ["Positive", "Negative"], referenceRange: "Negative" },
      { name: "wbc", label: "WBCs", type: "text", unit: "/HPF", referenceRange: "0-5" },
      { name: "rbc", label: "RBCs", type: "text", unit: "/HPF", referenceRange: "0-2" },
      { name: "bacteria", label: "Bacteria", type: "select", options: ["None", "Few", "Moderate", "Many"], referenceRange: "None" }
    ],
  },

  // 82040: Albumin blood test[cite: 1]
  "82040": {
    cptCode: "82040",
    serviceName: "Albumin blood test",
    fields: [
      { name: "albumin", label: "Albumin", type: "number", unit: "g/dL", referenceRange: "3.4-5.4" }
    ],
  },

  // 82150: Amylase blood test[cite: 1]
  "82150": {
    cptCode: "82150",
    serviceName: "Amylase blood test",
    fields: [
      { name: "amylase", label: "Amylase", type: "number", unit: "U/L", referenceRange: "30-110" }
    ],
  },

  // 82247: Bilirubin, total, blood test[cite: 1]
  "82247": {
    cptCode: "82247",
    serviceName: "Bilirubin, total, blood test",
    fields: [
      { name: "bilirubin_total", label: "Total Bilirubin", type: "number", unit: "mg/dL", referenceRange: "0.1-1.2" }
    ],
  },

  // 82565: Creatinine blood test[cite: 1]
  "82565": {
    cptCode: "82565",
    serviceName: "Creatinine blood test",
    fields: [
      { name: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", referenceRange: "0.6-1.3" }
    ],
  },

  // 82607: Vitamin B-12 level[cite: 1]
  "82607": {
    cptCode: "82607",
    serviceName: "Vitamin B-12 level",
    fields: [
      { name: "vitamin_b12", label: "Vitamin B-12", type: "number", unit: "pg/mL", referenceRange: "232-1245" }
    ],
  },

  // 82728: Ferritin test[cite: 1]
  "82728": {
    cptCode: "82728",
    serviceName: "Ferritin test",
    fields: [
      { name: "ferritin", label: "Ferritin", type: "number", unit: "ng/mL", referenceRange: "12-300" }
    ],
  },

  // 83540: Iron test[cite: 1]
  "83540": {
    cptCode: "83540",
    serviceName: "Iron test",
    fields: [
      { name: "iron", label: "Total Iron", type: "number", unit: "mcg/dL", referenceRange: "60-170" }
    ],
  },

  // 83690: Lipase blood test[cite: 1]
  "83690": {
    cptCode: "83690",
    serviceName: "Lipase blood test",
    fields: [
      { name: "lipase", label: "Lipase", type: "number", unit: "U/L", referenceRange: "0-160" }
    ],
  },

  // 83735: Magnesium level[cite: 1]
  "83735": {
    cptCode: "83735",
    serviceName: "Magnesium level",
    fields: [
      { name: "magnesium", label: "Magnesium", type: "number", unit: "mg/dL", referenceRange: "1.7-2.2" }
    ],
  },

  // 84439: Thyroxine (T4) test[cite: 1]
  "84439": {
    cptCode: "84439",
    serviceName: "Thyroxine (T4) test",
    fields: [
      { name: "free_t4", label: "Free T4", type: "number", unit: "ng/dL", referenceRange: "0.8-1.8" }
    ],
  },

  // 84450: Transferase, aspartate amino (AST/SGOT)[cite: 1]
  "84450": {
    cptCode: "84450",
    serviceName: "Transferase, aspartate amino (AST/SGOT)",
    fields: [
      { name: "ast", label: "AST (SGOT)", type: "number", unit: "U/L", referenceRange: "8-33" }
    ],
  },

  // 84460: Transferase, alanine amino (ALT/SGPT)[cite: 1]
  "84460": {
    cptCode: "84460",
    serviceName: "Transferase, alanine amino (ALT/SGPT)",
    fields: [
      { name: "alt", label: "ALT (SGPT)", type: "number", unit: "U/L", referenceRange: "4-36" }
    ],
  },

  // 84550: Uric acid, blood test[cite: 1]
  "84550": {
    cptCode: "84550",
    serviceName: "Uric acid, blood test",
    fields: [
      { name: "uric_acid", label: "Uric Acid", type: "number", unit: "mg/dL", referenceRange: "3.5-7.2" }
    ],
  },

  // 85018: Hemoglobin level[cite: 1]
  "85018": {
    cptCode: "85018",
    serviceName: "Hemoglobin level",
    fields: [
      { name: "hemoglobin", label: "Hemoglobin (Hb)", type: "number", unit: "g/dL", referenceRange: "12.0-17.5" }
    ],
  },

  // 85652: Sedimentation rate (ESR), automated[cite: 1]
  "85652": {
    cptCode: "85652",
    serviceName: "Sedimentation rate (ESR), automated",
    fields: [
      { name: "esr", label: "Erythrocyte Sedimentation Rate (ESR)", type: "number", unit: "mm/hr", referenceRange: "0-20" }
    ],
  },

  // 86038: Antinuclear antibodies (ANA) test[cite: 1]
  "86038": {
    cptCode: "86038",
    serviceName: "Antinuclear antibodies (ANA) test",
    fields: [
      { name: "ana_screen", label: "ANA Screen", type: "select", options: ["Positive", "Negative"] },
      { name: "ana_titer", label: "ANA Titer (if positive)", type: "text", referenceRange: "< 1:40" },
      { name: "ana_pattern", label: "ANA Pattern", type: "text" }
    ],
  },

  // 86703: HIV-1 and HIV-2 single result antibody assay[cite: 1]
  "86703": {
    cptCode: "86703",
    serviceName: "HIV-1 and HIV-2 single result antibody assay",
    fields: [
      { name: "hiv_1_2_ab", label: "HIV-1/HIV-2 Antibodies", type: "select", options: ["Reactive", "Non-Reactive"] }
    ],
  },

  // 87086: Urine culture, quantitative[cite: 1]
  "87086": {
    cptCode: "87086",
    serviceName: "Urine culture, quantitative",
    fields: [
      { name: "colony_count", label: "Colony Count", type: "text", referenceRange: "< 10,000 CFU/mL" },
      { name: "organism_identified", label: "Organism Identified", type: "text", referenceRange: "No growth" },
      { name: "sensitivity", label: "Sensitivity", type: "text" }
    ],
  }

};