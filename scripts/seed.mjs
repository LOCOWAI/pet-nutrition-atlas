import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const db = await mysql.createConnection(process.env.DATABASE_URL);

// ============================================================
// TOPICS (15 health topics)
// ============================================================
const topicsData = [
  { name: "Digestive Health", slug: "digestive-health", description: "Research on gastrointestinal function, microbiome balance, and digestive enzyme activity in companion animals.", species: "both", iconCode: "stomach" },
  { name: "Skin & Coat", slug: "skin-coat", description: "Studies examining dermatological health, coat quality, essential fatty acid metabolism, and skin barrier function.", species: "both", iconCode: "sparkles" },
  { name: "Joint & Mobility", slug: "joint-mobility", description: "Evidence on osteoarthritis management, cartilage protection, glucosamine/chondroitin efficacy, and mobility support.", species: "both", iconCode: "activity" },
  { name: "Weight Management", slug: "weight-management", description: "Research on obesity prevention, caloric restriction, metabolic health, and body condition scoring.", species: "both", iconCode: "scale" },
  { name: "Urinary Health", slug: "urinary-health", description: "Studies on feline lower urinary tract disease, struvite/oxalate crystal prevention, and hydration strategies.", species: "both", iconCode: "droplets" },
  { name: "Kidney Support", slug: "kidney-support", description: "Evidence on chronic kidney disease management, phosphorus restriction, omega-3 supplementation, and renal diet formulation.", species: "both", iconCode: "shield" },
  { name: "Dental & Oral Health", slug: "dental-oral-health", description: "Research on periodontal disease prevention, dental calculus reduction, and oral hygiene interventions.", species: "both", iconCode: "smile" },
  { name: "Immune Support", slug: "immune-support", description: "Studies on immunomodulation, antioxidant nutrition, vaccine response, and immune senescence.", species: "both", iconCode: "shield-check" },
  { name: "Cognitive Aging", slug: "cognitive-aging", description: "Evidence on cognitive dysfunction syndrome, neuroprotective nutrients, DHA supplementation, and brain aging.", species: "both", iconCode: "brain" },
  { name: "Heart Health", slug: "heart-health", description: "Research on dilated cardiomyopathy, taurine deficiency, grain-free diet concerns, and cardiac nutrition.", species: "both", iconCode: "heart" },
  { name: "Liver Support", slug: "liver-support", description: "Studies on hepatic lipidosis, SAMe supplementation, milk thistle efficacy, and liver function support.", species: "both", iconCode: "activity" },
  { name: "Gut Microbiome", slug: "gut-microbiome", description: "Research on probiotic/prebiotic interventions, microbiome diversity, dysbiosis, and the gut-brain axis.", species: "both", iconCode: "microscope" },
  { name: "Food Sensitivity & Allergy", slug: "food-sensitivity-allergy", description: "Evidence on adverse food reactions, hydrolyzed protein diets, elimination trials, and allergen identification.", species: "both", iconCode: "alert-triangle" },
  { name: "Stress & Behavior", slug: "stress-behavior", description: "Studies on anxiety management, L-tryptophan supplementation, pheromone therapy, and behavioral nutrition.", species: "both", iconCode: "brain-circuit" },
  { name: "Muscle Maintenance", slug: "muscle-maintenance", description: "Research on sarcopenia prevention, protein requirements, leucine supplementation, and muscle mass preservation.", species: "both", iconCode: "dumbbell" },
];

console.log("Seeding topics...");
for (const t of topicsData) {
  await db.execute(
    `INSERT IGNORE INTO topics (name, slug, description, species, iconCode) VALUES (?, ?, ?, ?, ?)`,
    [t.name, t.slug, t.description, t.species, t.iconCode]
  );
}
console.log(`✓ ${topicsData.length} topics seeded`);

// ============================================================
// BREEDS
// ============================================================
const breedsData = [
  // Cats
  { species: "cat", breedName: "Ragdoll", slug: "ragdoll", overview: "Large, docile breed known for their gentle temperament. Prone to gastrointestinal sensitivity and hairball issues.", commonIssues: ["Hairball management", "Digestive sensitivity", "Weight management", "Cardiac concerns (HCM)"], nutritionFocus: ["High-quality protein", "Omega-3 fatty acids", "Fiber for hairball control", "Taurine supplementation"] },
  { species: "cat", breedName: "British Shorthair", slug: "british-shorthair", overview: "Stocky, calm breed with tendency toward obesity and urinary issues. Requires careful caloric management.", commonIssues: ["Obesity", "Urinary tract issues", "Joint stress from weight", "Polycystic kidney disease"], nutritionFocus: ["Calorie-controlled diet", "Urinary health support", "Joint support nutrients", "Phosphorus management"] },
  { species: "cat", breedName: "American Shorthair", slug: "american-shorthair", overview: "Hardy, adaptable breed with generally good health. Some predisposition to heart disease and obesity.", commonIssues: ["Obesity", "Heart disease", "Dental disease", "Hypertrophic cardiomyopathy"], nutritionFocus: ["Balanced macronutrients", "Taurine", "Dental health support", "Antioxidants"] },
  { species: "cat", breedName: "Maine Coon", slug: "maine-coon", overview: "Largest domestic cat breed. Predisposed to hypertrophic cardiomyopathy and hip dysplasia.", commonIssues: ["Hypertrophic cardiomyopathy", "Hip dysplasia", "Spinal muscular atrophy", "Obesity"], nutritionFocus: ["Taurine", "Omega-3 for heart health", "Joint support", "High protein for muscle maintenance"] },
  { species: "cat", breedName: "Siamese", slug: "siamese", overview: "Vocal, social breed prone to respiratory issues and dental disease. Sensitive digestive system.", commonIssues: ["Dental disease", "Respiratory issues", "Digestive sensitivity", "Amyloidosis"], nutritionFocus: ["Dental health diet", "Easily digestible proteins", "Antioxidants", "Moderate fat"] },
  { species: "cat", breedName: "Persian", slug: "persian", overview: "Long-haired breed requiring special attention to hairball management and kidney health.", commonIssues: ["Polycystic kidney disease", "Hairballs", "Brachycephalic issues", "Skin fold infections"], nutritionFocus: ["Kidney-supportive nutrition", "Hairball control fiber", "Omega-3 for skin/coat", "Moderate protein"] },
  { species: "cat", breedName: "Scottish Fold", slug: "scottish-fold", overview: "Known for folded ears; prone to osteochondrodysplasia and joint pain throughout life.", commonIssues: ["Osteochondrodysplasia", "Joint pain", "Arthritis", "Ear problems"], nutritionFocus: ["Joint support (glucosamine/chondroitin)", "Anti-inflammatory omega-3", "Antioxidants", "Healthy weight maintenance"] },
  // Dogs
  { species: "dog", breedName: "Poodle", slug: "poodle", overview: "Highly intelligent breed in multiple sizes. Prone to dental disease, tear staining, and skin issues.", commonIssues: ["Dental disease", "Tear staining", "Skin allergies", "Cognitive aging (miniature/toy)"], nutritionFocus: ["Dental health support", "Omega-3 for coat", "Antioxidants for cognition", "Zinc for skin"] },
  { species: "dog", breedName: "Golden Retriever", slug: "golden-retriever", overview: "Friendly, active breed with high cancer risk and joint issues. Requires careful weight management.", commonIssues: ["Cancer predisposition", "Hip dysplasia", "Obesity", "Skin allergies"], nutritionFocus: ["Antioxidants", "Joint support", "Omega-3 fatty acids", "Calorie management"] },
  { species: "dog", breedName: "Labrador Retriever", slug: "labrador-retriever", overview: "Highly food-motivated breed with strong obesity predisposition and joint issues.", commonIssues: ["Obesity", "Hip/elbow dysplasia", "Exercise-induced collapse", "Food motivation/overeating"], nutritionFocus: ["Calorie-controlled diet", "Joint support", "High satiety fiber", "L-carnitine for weight"] },
  { species: "dog", breedName: "French Bulldog", slug: "french-bulldog", overview: "Brachycephalic breed with skin fold infections, digestive sensitivity, and respiratory concerns.", commonIssues: ["Skin fold dermatitis", "Digestive sensitivity", "Brachycephalic syndrome", "Spinal issues (IVDD)"], nutritionFocus: ["Easily digestible proteins", "Omega-3 for skin", "Probiotics for gut health", "Anti-inflammatory nutrients"] },
  { species: "dog", breedName: "Corgi", slug: "corgi", overview: "Active herding breed prone to obesity due to low stature and high food motivation.", commonIssues: ["Obesity", "Intervertebral disc disease", "Hip dysplasia", "Eye conditions"], nutritionFocus: ["Calorie management", "Joint support", "Spinal health nutrients", "Antioxidants for eye health"] },
  { species: "dog", breedName: "Shiba Inu", slug: "shiba-inu", overview: "Independent Japanese breed with generally good health but some allergy predisposition.", commonIssues: ["Allergies", "Glaucoma", "Patellar luxation", "Hypothyroidism"], nutritionFocus: ["Hypoallergenic protein sources", "Omega-3 for skin", "Antioxidants", "Iodine for thyroid"] },
  { species: "dog", breedName: "Border Collie", slug: "border-collie", overview: "Highly intelligent working breed requiring high-energy nutrition and cognitive support.", commonIssues: ["Hip dysplasia", "Collie eye anomaly", "Epilepsy", "Trapped neutrophil syndrome"], nutritionFocus: ["High-energy diet", "DHA for cognition", "Antioxidants for eye health", "Joint support"] },
  { species: "dog", breedName: "German Shepherd", slug: "german-shepherd", overview: "Versatile working breed prone to digestive issues, joint problems, and degenerative myelopathy.", commonIssues: ["Degenerative myelopathy", "Hip dysplasia", "Exocrine pancreatic insufficiency", "Bloat (GDV)"], nutritionFocus: ["Easily digestible proteins", "Joint support", "Antioxidants for nerve health", "Prebiotics/probiotics"] },
  { species: "dog", breedName: "Bichon Frise", slug: "bichon-frise", overview: "Small, cheerful breed prone to allergies, dental disease, and bladder stones.", commonIssues: ["Allergies", "Dental disease", "Bladder stones", "Patellar luxation"], nutritionFocus: ["Hypoallergenic diet", "Dental health support", "Urinary health", "Omega-3 for skin"] },
];

console.log("Seeding breeds...");
for (const b of breedsData) {
  await db.execute(
    `INSERT IGNORE INTO breeds (species, breedName, slug, overview, commonIssues, nutritionFocus) VALUES (?, ?, ?, ?, ?, ?)`,
    [b.species, b.breedName, b.slug, b.overview, JSON.stringify(b.commonIssues), JSON.stringify(b.nutritionFocus)]
  );
}
console.log(`✓ ${breedsData.length} breeds seeded`);

// ============================================================
// PAPERS (10 sample papers with full fields)
// ============================================================
const papersData = [
  {
    title: "Dietary omega-3 fatty acid supplementation reduces inflammation and improves skin barrier function in cats with chronic dermatitis",
    authors: "Hansen, S.L., Bauer, J.E., Remillard, R.L.",
    year: 2022,
    journal: "Journal of Veterinary Internal Medicine",
    doi: "10.1111/jvim.16234",
    abstract: "This randomized controlled trial evaluated the effects of dietary EPA and DHA supplementation on inflammatory markers and skin barrier function in 48 cats with chronic dermatitis over a 12-week period.",
    species: "cat",
    lifeStage: "adult",
    studyType: "rct",
    evidenceLevel: "high",
    breedRelevance: "Persian, British Shorthair, Ragdoll",
    keywords: ["omega-3", "EPA", "DHA", "skin barrier", "dermatitis", "inflammation", "cats"],
    coreSummary: "This 12-week RCT demonstrated that dietary supplementation with EPA (180mg/day) and DHA (120mg/day) significantly reduced serum inflammatory cytokines (IL-6, TNF-α) by 34% and improved transepidermal water loss measurements by 28% in cats with chronic dermatitis. The study enrolled 48 adult cats (mean age 4.2 years) with confirmed allergic dermatitis, randomized to supplemented diet or control. Coat quality scores improved significantly in the treatment group by week 8.",
    keyFindings: ["EPA+DHA supplementation reduced inflammatory cytokines by 34% vs control", "Transepidermal water loss improved by 28%, indicating enhanced skin barrier function", "Coat quality scores significantly improved by week 8 of supplementation", "No adverse effects observed at tested doses", "Effect size was larger in Persian and British Shorthair breeds"],
    practicalRelevance: "This research supports the inclusion of marine-sourced omega-3 fatty acids in cat food formulations targeting skin and coat health. The dose-response data can inform product development for dermatology-focused cat foods.",
    limitations: "Single-center study with 12-week follow-up may not capture long-term effects. Breed-specific analysis was underpowered. Dietary background was not fully controlled.",
    harvardReference: "Hansen, S.L., Bauer, J.E. and Remillard, R.L. (2022) 'Dietary omega-3 fatty acid supplementation reduces inflammation and improves skin barrier function in cats with chronic dermatitis', *Journal of Veterinary Internal Medicine*, 36(4), pp. 1423-1431. Available at: https://doi.org/10.1111/jvim.16234.",
    status: "approved",
    featured: true,
    aiGenerated: true,
  },
  {
    title: "Probiotic supplementation with Lactobacillus acidophilus DSM 13241 modulates gut microbiota composition and reduces diarrhea frequency in adult dogs",
    authors: "Weese, J.S., Arroyo, L., Martin, H.",
    year: 2023,
    journal: "Veterinary Microbiology",
    doi: "10.1016/j.vetmic.2023.109821",
    abstract: "A double-blind placebo-controlled trial investigating the effects of Lactobacillus acidophilus DSM 13241 on gut microbiota diversity and clinical outcomes in 62 adult dogs with recurrent digestive issues.",
    species: "dog",
    lifeStage: "adult",
    studyType: "rct",
    evidenceLevel: "high",
    breedRelevance: "German Shepherd, French Bulldog, Labrador Retriever",
    keywords: ["probiotics", "Lactobacillus", "gut microbiome", "diarrhea", "dogs", "dysbiosis"],
    coreSummary: "This double-blind RCT assessed the impact of daily Lactobacillus acidophilus DSM 13241 supplementation (1×10^9 CFU/day) on gut microbiota and digestive health in 62 adult dogs with recurrent diarrhea. After 8 weeks, the probiotic group showed a 52% reduction in diarrhea frequency, significant increases in Bifidobacterium and Faecalibacterium populations, and improved fecal consistency scores. 16S rRNA sequencing confirmed enhanced alpha diversity in the treatment group.",
    keyFindings: ["52% reduction in diarrhea frequency in probiotic group vs 18% in placebo", "Significant increase in beneficial Bifidobacterium populations (p<0.001)", "Improved fecal consistency scores from week 4 onwards", "Enhanced gut microbiota alpha diversity (Shannon index +0.8)", "Effects maintained for 4 weeks post-supplementation"],
    practicalRelevance: "Supports the use of strain-specific probiotics in dog food and supplement formulations for digestive health claims. The persistence of effects post-supplementation suggests potential for intermittent dosing strategies.",
    limitations: "Study population limited to dogs with pre-existing digestive issues; results may not generalize to healthy dogs. Long-term microbiome stability was not assessed beyond 12 weeks.",
    harvardReference: "Weese, J.S., Arroyo, L. and Martin, H. (2023) 'Probiotic supplementation with Lactobacillus acidophilus DSM 13241 modulates gut microbiota composition and reduces diarrhea frequency in adult dogs', *Veterinary Microbiology*, 278, p. 109821. Available at: https://doi.org/10.1016/j.vetmic.2023.109821.",
    status: "approved",
    featured: true,
    aiGenerated: true,
  },
  {
    title: "Effect of dietary phosphorus restriction on progression of chronic kidney disease in cats: a prospective cohort study",
    authors: "Elliott, J., Rawlings, J.M., Markwell, P.J., Barber, P.J.",
    year: 2021,
    journal: "Journal of Small Animal Practice",
    doi: "10.1111/jsap.13298",
    abstract: "Prospective cohort study examining the relationship between dietary phosphorus intake and CKD progression in 94 cats with IRIS Stage 2-3 chronic kidney disease over 24 months.",
    species: "cat",
    lifeStage: "senior",
    studyType: "cohort",
    evidenceLevel: "high",
    breedRelevance: "Persian, British Shorthair",
    keywords: ["chronic kidney disease", "phosphorus restriction", "CKD", "cats", "renal diet", "IRIS staging"],
    coreSummary: "This 24-month prospective cohort study followed 94 cats with IRIS Stage 2-3 CKD, comparing outcomes between cats consuming phosphorus-restricted diets (<0.5% DM) versus standard diets. Cats on restricted diets showed significantly slower GFR decline (mean 0.8 vs 2.1 mL/min/year), lower serum phosphorus levels, and reduced parathyroid hormone concentrations. Survival analysis demonstrated a 40% reduction in CKD-related mortality in the restricted group.",
    keyFindings: ["40% reduction in CKD-related mortality with phosphorus restriction", "GFR decline significantly slower: 0.8 vs 2.1 mL/min/year", "Serum phosphorus maintained within normal range in 78% of restricted group", "PTH concentrations significantly lower, reducing secondary hyperparathyroidism", "Quality of life scores improved in restricted diet group"],
    practicalRelevance: "Provides strong evidence for phosphorus-restricted renal diets in cats with CKD. Supports product development for senior cat foods with controlled phosphorus levels and renal health positioning.",
    limitations: "Non-randomized design introduces selection bias. Dietary compliance was self-reported by owners. Concurrent medications were not fully controlled.",
    harvardReference: "Elliott, J., Rawlings, J.M., Markwell, P.J. and Barber, P.J. (2021) 'Effect of dietary phosphorus restriction on progression of chronic kidney disease in cats: a prospective cohort study', *Journal of Small Animal Practice*, 62(8), pp. 647-658. Available at: https://doi.org/10.1111/jsap.13298.",
    status: "approved",
    featured: true,
    aiGenerated: true,
  },
  {
    title: "Glucosamine and chondroitin sulfate supplementation in dogs with osteoarthritis: a systematic review and meta-analysis",
    authors: "Vandeweerd, J.M., Coisnon, C., Clegg, P., Cambier, C., Pierson, A., Hontoir, F.",
    year: 2022,
    journal: "Veterinary Journal",
    doi: "10.1016/j.tvjl.2022.105891",
    abstract: "Systematic review and meta-analysis of 18 RCTs examining the efficacy of glucosamine and chondroitin sulfate supplementation for osteoarthritis management in dogs.",
    species: "dog",
    lifeStage: "senior",
    studyType: "meta_analysis",
    evidenceLevel: "high",
    breedRelevance: "Labrador Retriever, Golden Retriever, German Shepherd, Corgi",
    keywords: ["glucosamine", "chondroitin", "osteoarthritis", "joint health", "dogs", "meta-analysis"],
    coreSummary: "This meta-analysis synthesized data from 18 RCTs (n=892 dogs) examining glucosamine/chondroitin supplementation for canine osteoarthritis. Pooled analysis showed statistically significant improvements in pain scores (SMD -0.68, 95% CI -0.94 to -0.42), mobility assessments (SMD -0.54), and owner-reported quality of life. Effect sizes were larger in studies using combination therapy versus single agents. Optimal dosing appeared to be glucosamine 20mg/kg/day + chondroitin 16mg/kg/day.",
    keyFindings: ["Significant pain score reduction (SMD -0.68) across all included studies", "Mobility improvements significant in 15 of 18 studies", "Combination therapy superior to single-agent supplementation", "Optimal dose: glucosamine 20mg/kg/day + chondroitin 16mg/kg/day", "Effects evident from 4-6 weeks of supplementation"],
    practicalRelevance: "Provides robust evidence base for joint health claims in dog food and supplement products. Dose-response data supports specific inclusion levels in functional dog food formulations.",
    limitations: "High heterogeneity between studies (I²=67%). Publication bias likely. Many studies were industry-funded. Outcome measures varied considerably across trials.",
    harvardReference: "Vandeweerd, J.M. et al. (2022) 'Glucosamine and chondroitin sulfate supplementation in dogs with osteoarthritis: a systematic review and meta-analysis', *Veterinary Journal*, 281, p. 105891. Available at: https://doi.org/10.1016/j.tvjl.2022.105891.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
  {
    title: "Taurine deficiency and dilated cardiomyopathy in dogs fed grain-free diets: a retrospective case-control study",
    authors: "Kaplan, J.L., Stern, J.A., Fascetti, A.J., Larsen, J.A.",
    year: 2021,
    journal: "PLOS ONE",
    doi: "10.1371/journal.pone.0245510",
    abstract: "Retrospective case-control study investigating the association between grain-free diet consumption, taurine status, and dilated cardiomyopathy in 150 dogs.",
    species: "dog",
    lifeStage: "adult",
    studyType: "observational",
    evidenceLevel: "medium",
    breedRelevance: "Golden Retriever, Labrador Retriever, German Shepherd",
    keywords: ["taurine", "dilated cardiomyopathy", "grain-free diet", "DCM", "dogs", "heart disease"],
    coreSummary: "This retrospective case-control study compared taurine status and diet history in 75 dogs with DCM versus 75 healthy controls. Dogs fed grain-free diets had significantly lower whole blood taurine concentrations (mean 187 vs 312 nmol/mL, p<0.001). DCM dogs were 3.5 times more likely to have been fed grain-free diets. Taurine supplementation combined with diet change resulted in cardiac improvement in 68% of affected dogs with documented follow-up.",
    keyFindings: ["Grain-free diet associated with 3.5x increased DCM risk (OR 3.5, 95% CI 1.8-6.8)", "Significantly lower whole blood taurine in DCM dogs (187 vs 312 nmol/mL)", "Legume-heavy diets associated with impaired taurine synthesis", "68% of dogs showed cardiac improvement with taurine supplementation + diet change", "Golden Retrievers disproportionately represented in DCM cases"],
    practicalRelevance: "Critical evidence for pet food formulators regarding taurine adequacy in grain-free and legume-heavy formulations. Supports taurine supplementation in dog foods, particularly for at-risk breeds.",
    limitations: "Retrospective design limits causal inference. Dietary history relied on owner recall. Taurine measurement methods varied. Confounding variables not fully controlled.",
    harvardReference: "Kaplan, J.L., Stern, J.A., Fascetti, A.J. and Larsen, J.A. (2021) 'Taurine deficiency and dilated cardiomyopathy in dogs fed grain-free diets: a retrospective case-control study', *PLOS ONE*, 16(2), p. e0245510. Available at: https://doi.org/10.1371/journal.pone.0245510.",
    status: "approved",
    featured: true,
    aiGenerated: true,
  },
  {
    title: "Dietary DHA supplementation improves cognitive function in senior dogs: a double-blind placebo-controlled trial",
    authors: "Pan, Y., Larson, B., Araujo, J.A., Lau, W., de Rivera, C., Santana, R.",
    year: 2023,
    journal: "British Journal of Nutrition",
    doi: "10.1017/S0007114523001234",
    abstract: "Double-blind RCT evaluating the cognitive benefits of dietary DHA supplementation in 40 senior dogs with mild cognitive dysfunction syndrome over 6 months.",
    species: "dog",
    lifeStage: "senior",
    studyType: "rct",
    evidenceLevel: "high",
    breedRelevance: "Poodle, Border Collie, German Shepherd",
    keywords: ["DHA", "cognitive dysfunction", "senior dogs", "brain aging", "omega-3", "neuroprotection"],
    coreSummary: "This 6-month double-blind RCT enrolled 40 senior dogs (mean age 10.8 years) with mild cognitive dysfunction syndrome, randomized to DHA-enriched diet (0.5% DM) or control. The DHA group demonstrated significant improvements in spatial learning tasks (maze completion time -32%), recognition memory tests, and owner-assessed cognitive function scores. MRI analysis in a subset showed reduced cortical atrophy progression. Serum DHA levels correlated positively with cognitive test performance.",
    keyFindings: ["32% improvement in maze completion time in DHA group vs 8% in control", "Recognition memory test scores significantly improved (p=0.003)", "Owner-assessed cognitive function scores improved in 75% of DHA group", "Reduced cortical atrophy progression on MRI subset analysis", "Serum DHA levels positively correlated with cognitive performance (r=0.61)"],
    practicalRelevance: "Provides clinical evidence for DHA enrichment in senior dog food formulations targeting cognitive health. Supports brain health positioning for aging dog products.",
    limitations: "Small sample size limits statistical power for subgroup analyses. Cognitive assessment tools lack full standardization. 6-month duration may be insufficient for long-term effects.",
    harvardReference: "Pan, Y. et al. (2023) 'Dietary DHA supplementation improves cognitive function in senior dogs: a double-blind placebo-controlled trial', *British Journal of Nutrition*, 129(8), pp. 1345-1356. Available at: https://doi.org/10.1017/S0007114523001234.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
  {
    title: "High-protein diet preserves lean body mass during caloric restriction in overweight cats",
    authors: "Laflamme, D.P., Hannah, S.S.",
    year: 2022,
    journal: "International Journal of Applied Research in Veterinary Medicine",
    doi: "10.1016/j.ijvs.2022.04.012",
    abstract: "Controlled feeding trial comparing high-protein vs standard-protein caloric restriction diets on body composition changes in 36 overweight adult cats over 18 weeks.",
    species: "cat",
    lifeStage: "adult",
    studyType: "rct",
    evidenceLevel: "high",
    breedRelevance: "British Shorthair, Maine Coon, Ragdoll",
    keywords: ["weight loss", "high protein", "lean body mass", "obesity", "cats", "caloric restriction"],
    coreSummary: "This 18-week controlled trial compared high-protein (45% DM) versus standard-protein (30% DM) caloric restriction diets in 36 overweight cats (mean BCS 7.2/9). Both groups achieved similar weight loss (-18% body weight), but the high-protein group preserved significantly more lean body mass (LBM loss: 8% vs 22%). Resting energy expenditure was better maintained in the high-protein group, and cats showed higher activity levels and improved body condition scores.",
    keyFindings: ["Similar total weight loss achieved in both groups (~18% body weight)", "High-protein diet preserved lean body mass: 8% LBM loss vs 22% in standard group", "Resting energy expenditure better maintained with high-protein diet", "Higher activity levels observed in high-protein group by week 12", "Improved body condition scores with better muscle-to-fat ratio"],
    practicalRelevance: "Supports high-protein formulation strategy for weight management cat foods. Provides evidence for protein content claims in weight control products while maintaining muscle mass.",
    limitations: "Relatively small sample size (n=36). Study duration of 18 weeks may not reflect long-term weight maintenance. Individual variation in protein metabolism not fully characterized.",
    harvardReference: "Laflamme, D.P. and Hannah, S.S. (2022) 'High-protein diet preserves lean body mass during caloric restriction in overweight cats', *International Journal of Applied Research in Veterinary Medicine*, 20(2), pp. 89-101. Available at: https://doi.org/10.1016/j.ijvs.2022.04.012.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
  {
    title: "Dietary fiber type and fermentability influence gut microbiome composition and short-chain fatty acid production in healthy dogs",
    authors: "Middelbos, I.S., Vester Boler, B.M., Qu, A., White, B.A., Swanson, K.S.",
    year: 2023,
    journal: "Journal of Nutrition",
    doi: "10.1093/jn/nxad089",
    abstract: "Crossover study examining how different dietary fiber sources affect gut microbiome composition and SCFA production in 24 healthy adult dogs.",
    species: "dog",
    lifeStage: "adult",
    studyType: "rct",
    evidenceLevel: "medium",
    breedRelevance: null,
    keywords: ["dietary fiber", "gut microbiome", "short-chain fatty acids", "prebiotics", "dogs", "fermentation"],
    coreSummary: "This crossover study fed 24 healthy adult dogs four different fiber sources (inulin, cellulose, beet pulp, psyllium) in a 4-period design. Fermentable fibers (inulin, beet pulp) significantly increased Bifidobacterium and Lactobacillus populations, elevated fecal butyrate concentrations by 45-67%, and improved fecal consistency scores. Non-fermentable cellulose showed minimal microbiome effects. Psyllium demonstrated intermediate effects with improved stool quality.",
    keyFindings: ["Fermentable fibers increased beneficial bacteria (Bifidobacterium +156%, Lactobacillus +89%)", "Fecal butyrate concentrations increased 45-67% with fermentable fibers", "Improved fecal consistency scores with beet pulp and psyllium", "Inulin showed highest prebiotic effect but caused flatulence at high doses", "Fiber source significantly influenced microbiome diversity (Shannon index)"],
    practicalRelevance: "Guides fiber selection in dog food formulation for gut health claims. Supports inclusion of mixed fiber sources (fermentable + non-fermentable) for optimal digestive health benefits.",
    limitations: "Healthy dogs only; results may differ in dogs with GI disorders. Short treatment periods (3 weeks each) may not reflect long-term microbiome adaptation. Single breed (Beagle) used.",
    harvardReference: "Middelbos, I.S. et al. (2023) 'Dietary fiber type and fermentability influence gut microbiome composition and short-chain fatty acid production in healthy dogs', *Journal of Nutrition*, 153(6), pp. 1678-1692. Available at: https://doi.org/10.1093/jn/nxad089.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
  {
    title: "L-tryptophan supplementation reduces anxiety-related behaviors in cats: a randomized controlled trial",
    authors: "Pereira, G.G., Fragoso, S., Pires, E.",
    year: 2021,
    journal: "Journal of Feline Medicine and Surgery",
    doi: "10.1177/1098612X21994823",
    abstract: "RCT evaluating the anxiolytic effects of dietary L-tryptophan supplementation in 52 cats with stress-related behavioral issues over 8 weeks.",
    species: "cat",
    lifeStage: "adult",
    studyType: "rct",
    evidenceLevel: "medium",
    breedRelevance: "Siamese, Ragdoll",
    keywords: ["L-tryptophan", "anxiety", "stress", "behavior", "cats", "serotonin"],
    coreSummary: "This 8-week RCT enrolled 52 cats with owner-reported anxiety behaviors (hiding, aggression, inappropriate elimination), randomized to L-tryptophan-supplemented diet (50mg/kg/day) or control. The supplemented group showed significant reductions in anxiety scores (validated Cat Stress Score -38%), improved social interaction, and reduced stress-related behaviors. Urinary cortisol:creatinine ratios decreased significantly, suggesting reduced physiological stress response.",
    keyFindings: ["38% reduction in validated Cat Stress Score in supplemented group", "Significant improvement in social interaction behaviors (p=0.008)", "Urinary cortisol:creatinine ratio decreased by 24% in treatment group", "Reduced frequency of stress-related behaviors (hiding, aggression) by week 4", "No adverse effects observed at supplemented dose"],
    practicalRelevance: "Supports L-tryptophan inclusion in cat food formulations targeting stress and anxiety management. Relevant for multi-cat household products and environmental enrichment-focused nutrition.",
    limitations: "Behavioral assessment partially subjective (owner-reported). Stress triggers not standardized. 8-week duration may not capture seasonal or long-term behavioral changes.",
    harvardReference: "Pereira, G.G., Fragoso, S. and Pires, E. (2021) 'L-tryptophan supplementation reduces anxiety-related behaviors in cats: a randomized controlled trial', *Journal of Feline Medicine and Surgery*, 23(7), pp. 631-639. Available at: https://doi.org/10.1177/1098612X21994823.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
  {
    title: "Hydrolyzed protein diets in the management of canine food allergy: clinical outcomes and owner satisfaction",
    authors: "Olivry, T., Mueller, R.S., Prelaud, P.",
    year: 2022,
    journal: "Veterinary Dermatology",
    doi: "10.1111/vde.13045",
    abstract: "Prospective observational study evaluating the clinical efficacy of hydrolyzed protein elimination diets in 89 dogs with suspected food-induced allergic dermatitis.",
    species: "dog",
    lifeStage: "all",
    studyType: "observational",
    evidenceLevel: "medium",
    breedRelevance: "French Bulldog, Poodle, Bichon Frise, Golden Retriever",
    keywords: ["food allergy", "hydrolyzed protein", "elimination diet", "allergic dermatitis", "dogs", "adverse food reaction"],
    coreSummary: "This 12-week prospective study enrolled 89 dogs with suspected food-induced allergic dermatitis on strict hydrolyzed protein elimination diets. Clinical remission (>50% reduction in CADESI-04 score) was achieved in 62% of dogs by week 8. Owner satisfaction was high (78% rated diet as acceptable). Provocation testing confirmed food allergy in 71% of responders. Most common allergens identified: beef (34%), chicken (28%), dairy (18%).",
    keyFindings: ["62% clinical remission rate with hydrolyzed protein diet at 8 weeks", "71% of responders confirmed food allergy on provocation testing", "Most common allergens: beef (34%), chicken (28%), dairy (18%)", "Owner satisfaction rated acceptable or excellent in 78% of cases", "Pruritus scores improved significantly from week 4 onwards"],
    practicalRelevance: "Supports the development of hydrolyzed protein formulations for food-sensitive dogs. Identifies key allergen proteins to avoid in novel protein product development.",
    limitations: "No control group (elimination diet is standard of care). Hydrolyzate molecular weight varied between products. Compliance monitoring relied on owner reporting.",
    harvardReference: "Olivry, T., Mueller, R.S. and Prelaud, P. (2022) 'Hydrolyzed protein diets in the management of canine food allergy: clinical outcomes and owner satisfaction', *Veterinary Dermatology*, 33(3), pp. 201-210. Available at: https://doi.org/10.1111/vde.13045.",
    status: "approved",
    featured: false,
    aiGenerated: true,
  },
];

console.log("Seeding papers...");
const paperIds = [];
for (const p of papersData) {
  const [result] = await db.execute(
    `INSERT IGNORE INTO papers (title, authors, year, journal, doi, abstract, species, lifeStage, studyType, evidenceLevel, breedRelevance, keywords, coreSummary, keyFindings, practicalRelevance, limitations, harvardReference, status, featured, aiGenerated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.title, p.authors, p.year, p.journal, p.doi, p.abstract, p.species, p.lifeStage, p.studyType, p.evidenceLevel, p.breedRelevance || null, JSON.stringify(p.keywords), p.coreSummary, JSON.stringify(p.keyFindings), p.practicalRelevance, p.limitations, p.harvardReference, p.status, p.featured ? 1 : 0, p.aiGenerated ? 1 : 0]
  );
  paperIds.push(result.insertId);
}
console.log(`✓ ${papersData.length} papers seeded`);

// ============================================================
// PAPER_TOPICS associations
// ============================================================
const [topicRows] = await db.execute("SELECT id, slug FROM topics");
const topicMap = Object.fromEntries(topicRows.map(t => [t.slug, t.id]));

const paperTopicAssoc = [
  { paperIdx: 0, topics: ["skin-coat"] },
  { paperIdx: 1, topics: ["digestive-health", "gut-microbiome"] },
  { paperIdx: 2, topics: ["kidney-support"] },
  { paperIdx: 3, topics: ["joint-mobility"] },
  { paperIdx: 4, topics: ["heart-health"] },
  { paperIdx: 5, topics: ["cognitive-aging"] },
  { paperIdx: 6, topics: ["weight-management", "muscle-maintenance"] },
  { paperIdx: 7, topics: ["gut-microbiome", "digestive-health"] },
  { paperIdx: 8, topics: ["stress-behavior"] },
  { paperIdx: 9, topics: ["food-sensitivity-allergy", "skin-coat"] },
];

console.log("Seeding paper_topics...");
for (const assoc of paperTopicAssoc) {
  const paperId = paperIds[assoc.paperIdx];
  if (!paperId) continue;
  for (const topicSlug of assoc.topics) {
    const topicId = topicMap[topicSlug];
    if (!topicId) continue;
    await db.execute(
      `INSERT IGNORE INTO paper_topics (paperId, topicId) VALUES (?, ?)`,
      [paperId, topicId]
    );
  }
}
console.log("✓ paper_topics seeded");

// ============================================================
// PAPER_BREEDS associations
// ============================================================
const [breedRows] = await db.execute("SELECT id, slug FROM breeds");
const breedMap = Object.fromEntries(breedRows.map(b => [b.slug, b.id]));

const paperBreedAssoc = [
  { paperIdx: 0, breeds: [["persian", 0.9], ["british-shorthair", 0.85], ["ragdoll", 0.7]] },
  { paperIdx: 1, breeds: [["german-shepherd", 0.85], ["french-bulldog", 0.8], ["labrador-retriever", 0.7]] },
  { paperIdx: 2, breeds: [["persian", 0.9], ["british-shorthair", 0.8]] },
  { paperIdx: 3, breeds: [["labrador-retriever", 0.9], ["golden-retriever", 0.9], ["german-shepherd", 0.8], ["corgi", 0.75]] },
  { paperIdx: 4, breeds: [["golden-retriever", 0.95], ["labrador-retriever", 0.8], ["german-shepherd", 0.75]] },
  { paperIdx: 5, breeds: [["poodle", 0.8], ["border-collie", 0.75], ["german-shepherd", 0.7]] },
  { paperIdx: 6, breeds: [["british-shorthair", 0.9], ["maine-coon", 0.85], ["ragdoll", 0.75]] },
  { paperIdx: 8, breeds: [["siamese", 0.85], ["ragdoll", 0.7]] },
  { paperIdx: 9, breeds: [["french-bulldog", 0.9], ["poodle", 0.8], ["bichon-frise", 0.85], ["golden-retriever", 0.7]] },
];

console.log("Seeding paper_breeds...");
for (const assoc of paperBreedAssoc) {
  const paperId = paperIds[assoc.paperIdx];
  if (!paperId) continue;
  for (const [breedSlug, score] of assoc.breeds) {
    const breedId = breedMap[breedSlug];
    if (!breedId) continue;
    await db.execute(
      `INSERT IGNORE INTO paper_breeds (paperId, breedId, relevanceScore) VALUES (?, ?, ?)`,
      [paperId, breedId, score]
    );
  }
}
console.log("✓ paper_breeds seeded");

// ============================================================
// CONTENT_ANGLES
// ============================================================
const contentAnglesData = [
  // Paper 0: Omega-3 skin/coat cats
  { paperIdx: 0, formatType: "xiaohongshu", titleIdea: "猫咪皮肤总是干痒？研究证实：这个营养素能修复皮肤屏障", consumerSummary: "科学研究发现，每天给猫咪补充适量的EPA和DHA（鱼油中的omega-3脂肪酸），12周内就能显著改善皮肤屏障功能，减少炎症，让毛发更有光泽。", professionalSummary: "RCT证实EPA+DHA补充显著降低IL-6和TNF-α等炎症因子34%，改善经皮水分散失28%，支持皮肤屏障修复机制。", riskNote: "避免声称'治疗皮肤病'，应表述为'支持皮肤健康'或'有助于维持皮肤屏障功能'。", targetAudience: "猫主人，尤其是有皮肤敏感/掉毛困扰的猫咪主人" },
  { paperIdx: 0, formatType: "ecommerce_detail", titleIdea: "深海鱼油配方 | 科学验证的皮肤屏障修复营养方案", consumerSummary: "采用EPA+DHA双效配方，临床研究证实12周改善皮肤屏障功能，减少炎症反应，让猫咪拥有健康亮泽的毛发。", professionalSummary: "基于RCT数据，EPA 180mg/天 + DHA 120mg/天的配比经临床验证，显著改善皮肤屏障指标。", riskNote: "需标注'本产品不能替代兽医诊断和治疗'，避免使用'治疗'等医疗术语。", targetAudience: "电商购物用户，关注猫咪皮肤健康的宠主" },
  // Paper 1: Probiotics dogs
  { paperIdx: 1, formatType: "xiaohongshu", titleIdea: "狗狗总是软便拉稀？益生菌真的有用！这个研究告诉你答案", consumerSummary: "一项严格的双盲对照实验发现，特定乳酸菌菌株能在8周内将狗狗腹泻频率减少52%，同时显著改善肠道菌群多样性。", professionalSummary: "双盲RCT证实L. acidophilus DSM 13241（1×10^9 CFU/天）显著降低腹泻频率52%，提升肠道菌群alpha多样性。", riskNote: "需指定菌株名称，不可泛称'益生菌有效'。效果基于有消化问题的狗，健康狗效果可能不同。", targetAudience: "有消化敏感问题狗狗的主人" },
  { paperIdx: 1, formatType: "faq", titleIdea: "益生菌对狗狗真的有效吗？科学研究这样说", consumerSummary: "Q: 益生菌能改善狗狗消化问题吗？A: 是的，但需要选对菌株。研究证实特定乳酸菌菌株能显著减少腹泻，改善肠道健康。", professionalSummary: "菌株特异性是关键——L. acidophilus DSM 13241经RCT验证有效，其他菌株效果需独立验证。", riskNote: "强调菌株特异性，避免'所有益生菌都有效'的笼统表述。", targetAudience: "对宠物营养有疑问的狗主人" },
  // Paper 4: Taurine DCM
  { paperIdx: 4, formatType: "brand_education", titleIdea: "为什么我们在配方中坚持添加牛磺酸——来自心脏病研究的启示", consumerSummary: "研究发现无谷物狗粮与心脏病风险相关，核心原因之一是牛磺酸摄入不足。我们的配方确保充足的牛磺酸水平，守护狗狗心脏健康。", professionalSummary: "回顾性病例对照研究显示无谷物饮食与DCM风险增加3.5倍相关，全血牛磺酸水平显著降低。牛磺酸补充联合饮食调整使68%的DCM犬只心脏功能改善。", riskNote: "避免声称'预防心脏病'，应表述为'支持心脏健康'。需说明这是相关性研究，不代表因果关系。", targetAudience: "关注狗狗心脏健康的品牌内容团队和消费者" },
];

console.log("Seeding content_angles...");
for (const ca of contentAnglesData) {
  const paperId = paperIds[ca.paperIdx];
  if (!paperId) continue;
  await db.execute(
    `INSERT INTO content_angles (paperId, formatType, titleIdea, consumerSummary, professionalSummary, riskNote, targetAudience) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [paperId, ca.formatType, ca.titleIdea, ca.consumerSummary, ca.professionalSummary, ca.riskNote, ca.targetAudience]
  );
}
console.log("✓ content_angles seeded");

// ============================================================
// UPDATE_LOGS
// ============================================================
const updateLogsData = [
  { source: "PubMed", totalFound: 47, totalImported: 12, totalFlagged: 3, status: "completed", notes: "Monthly scan for cat/dog nutrition keywords. 12 papers imported after AI screening. 3 flagged for manual review due to low evidence quality.", triggeredBy: "scheduled" },
  { source: "Crossref", totalFound: 31, totalImported: 8, totalFlagged: 2, status: "completed", notes: "Crossref API scan for veterinary nutrition journals. Focus on joint health and kidney disease topics.", triggeredBy: "scheduled" },
  { source: "PubMed", totalFound: 52, totalImported: 15, totalFlagged: 5, status: "completed", notes: "Expanded search including gut microbiome and cognitive aging topics. Higher import rate this month.", triggeredBy: "scheduled" },
];

console.log("Seeding update_logs...");
for (const log of updateLogsData) {
  await db.execute(
    `INSERT INTO update_logs (source, totalFound, totalImported, totalFlagged, status, notes, triggeredBy) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [log.source, log.totalFound, log.totalImported, log.totalFlagged, log.status, log.notes, log.triggeredBy]
  );
}
console.log("✓ update_logs seeded");

await db.end();
console.log("\n✅ All seed data inserted successfully!");
