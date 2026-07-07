import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitOnboarding } from '../api/client';

// ─── 100 Key Points — All 6 Sections ─────────────────────────────────────────

const SECTIONS = [
  {
    id: 1, slug: 'tech',
    title: 'Technology, Material Science & R&D',
    colorHex: '#3B82F6', icon: '⚗️', maxScore: '+20',
    description: "Evaluate your core technology's maturity, IP position, and scientific validity.",
    questions: [
      { slug: 'trl_level', label: 'TRL (Technology Readiness Level)', description: 'Stage of development from TRL 1 (basic principles) to TRL 9 (proven in operational environment).', type: 'numeric', unit: 'TRL (1–9)', min: 1, max: 9, placeholder: 'e.g. 4', hint: 'TRL 1–3: Research | TRL 4–6: Development | TRL 7–9: Deployment ready' },
      { slug: 'mrl_level', label: 'MRL (Manufacturing Readiness Level)', description: 'Scalability of the production process from MRL 1 (basic concepts) to MRL 10 (full-rate production).', type: 'numeric', unit: 'MRL (1–10)', min: 1, max: 10, placeholder: 'e.g. 3', hint: 'MRL 1–3: Lab-scale | MRL 4–6: Pilot-scale | MRL 7–10: Commercial-scale' },
      { slug: 'novelty_moat', label: 'Novelty & Moat', description: 'Uniqueness of the underlying physical or chemical properties versus existing solutions.', type: 'rating', hint: '0 = easily replicated by any lab,  10 = breakthrough with a deep scientific moat' },
      { slug: 'ip_strength', label: 'IP Strength', description: 'Strength of your IP portfolio — granted utility patents vs. pending provisional applications.', type: 'status_plus_text', statusOptions: ['No IP Filed', 'Provisional Filed', 'Patent Pending', 'Granted Patent(s)'], placeholder: 'Describe your IP portfolio — patents filed, jurisdictions, key claims…', hint: 'Granted patents provide stronger protection than provisional filings' },
      { slug: 'freedom_to_operate', label: 'Freedom to Operate (FTO)', description: 'Risk clearance against existing global patents that could block your commercial pathway.', type: 'status', options: ['Not Assessed', 'Assessment In Progress', 'FTO Cleared', 'FTO Issues Identified'] },
      { slug: 'lab_to_fab', label: 'Lab-to-Fab Scalability', description: 'Complexity of transitioning from laboratory to pilot or commercial production lines.', type: 'rating', hint: '0 = massive engineering challenges to scale,  10 = proven and straightforward scale-up path' },
      { slug: 'simulation_accuracy', label: 'Simulation Accuracy', description: 'Alignment between digital twin models and actual physical test results.', type: 'rating', hint: '0 = no simulation capability,  10 = >95% correlation between model and physical results' },
      { slug: 'substitutability_risk', label: 'Substitutability Risk', description: 'How easily a competitor could replace your material with a cheaper alternative.', type: 'rating', hint: '0 = trivially substitutable (high risk),  10 = no viable substitute exists at any price' },
      { slug: 'raw_material_degradation', label: 'Raw Material Degradation', description: 'Life-cycle stability and shelf-life of your base materials under real-world conditions.', type: 'rating', hint: '0 = degrades within weeks,  10 = indefinite stability under all operating conditions' },
      { slug: 'toxicity_safety', label: 'Toxicity & Safety Profile', description: 'Inherent chemical hazards, handling risks, and safety implications of your materials.', type: 'rating', hint: '0 = highly hazardous (OSHA red list),  10 = fully benign and green chemistry' },
      { slug: 'energy_density_efficiency', label: 'Energy Density / Efficiency', description: 'Core performance metrics compared to established industry benchmarks.', type: 'rating_plus_text', hint: '0 = significantly below industry baseline,  10 = sets new global performance benchmark', placeholder: 'e.g. 340 Wh/kg vs. 250 Wh/kg industry average — describe your key metric vs. baseline' },
      { slug: 'yield_rate', label: 'Yield Rate', description: 'Percentage of non-defective, specification-compliant outputs during batch synthesis.', type: 'numeric', unit: '% yield', min: 0, max: 100, placeholder: 'e.g. 78' },
      { slug: 'characterization_validity', label: 'Characterization Validity', description: 'Robustness of material characterization via third-party spectroscopy, SEM, XRD, or equivalent.', type: 'status', options: ['No Characterization', 'Internal Methods Only', 'Third-Party Partial', 'Full Third-Party Validated'] },
      { slug: 'cycle_life_durability', label: 'Cycle Life / Durability', description: 'Stress-tested longevity of your material or product under extreme operational parameters.', type: 'rating_plus_text', hint: '0 = no durability data collected,  10 = exceeds all relevant industry benchmarks', placeholder: 'e.g. 2,000 cycles at 80% capacity retention at 45°C' },
      { slug: 'supply_chain_sensitivity', label: 'Supply Chain Sensitivity', description: 'Reliance on critical rare-earth elements, single-source minerals, or constrained supply chains.', type: 'rating', hint: '0 = entirely dependent on rare single-source inputs,  10 = 100% commodity-source supply chain' },
      { slug: 'geopolitical_risk_materials', label: 'Geopolitical Risk of Materials', description: 'Vulnerability to export bans on critical materials (e.g. Gallium, Germanium, Lithium, Cobalt).', type: 'rating', hint: '0 = critical inputs controlled by adversarial nations,  10 = zero geopolitical material exposure' },
      { slug: 'co_product_utility', label: 'Co-Product Utility', description: 'Commercial value of waste materials or byproducts generated during your production process.', type: 'rating_plus_text', hint: '0 = expensive waste disposal only,  10 = byproducts have significant independent revenue potential', placeholder: 'Describe any byproducts and their potential market value' },
      { slug: 'recyclability', label: 'Recyclability', description: 'End-of-life circular economy viability — how recyclable or recoverable is your material?', type: 'rating', hint: '0 = non-recyclable (ends in landfill),  10 = fully cradle-to-cradle / closed-loop recyclable' },
      { slug: 'interoperability', label: 'Interoperability', description: 'Ease of integrating your material into existing legacy manufacturing lines without major CAPEX.', type: 'rating', hint: '0 = requires a complete new manufacturing line,  10 = drop-in replacement with zero retrofit needed' },
      { slug: 'legacy_tech_inertia', label: 'Legacy Tech Inertia', description: 'Risk that incumbent technologies reduce their costs faster than your innovation can scale.', type: 'rating', hint: '0 = incumbents rapidly cost-improving (high threat),  10 = incumbents are stagnant and cannot improve' },
    ],
  },
  {
    id: 2, slug: 'certs',
    title: 'Certifications, Standards & Compliance',
    colorHex: '#10B981', icon: '📋', maxScore: '+15',
    description: 'Document your compliance journey with industry standards, regulatory bodies, and safety certifications.',
    questions: [
      { slug: 'iso_9001', label: 'ISO 9001 Readiness', description: 'Core quality management system (QMS) alignment and certification status.', type: 'status', options: ['Not Started', 'Gap Analysis Done', 'Implementation In Progress', 'Certified'] },
      { slug: 'iso_14001', label: 'ISO 14001 Compliance', description: 'Environmental management systems standard — tracking and reducing environmental impact.', type: 'status', options: ['Not Started', 'Gap Analysis Done', 'Implementation In Progress', 'Certified'] },
      { slug: 'iso_45001', label: 'ISO 45001 Status', description: 'Occupational health and safety protocols — critical for advanced material science labs.', type: 'status', options: ['Not Started', 'Gap Analysis Done', 'Implementation In Progress', 'Certified'] },
      { slug: 'industry_specific_credentials', label: 'Industry-Specific Credentials', description: 'Sector-specific certifications relevant to your target market.', type: 'status_plus_text', statusOptions: ['None Identified', 'Identified & Roadmapped', 'In Progress', 'Achieved'], placeholder: 'List the certifications required in your sector. e.g. IATF 16949 (Automotive) — In Progress with TUV', hint: 'Automotive: IATF 16949 | Aerospace: AS9100 | Medical: ISO 13485 | Battery: IEC 62133 | Defense: ITAR' },
      { slug: 'regulatory_clearances', label: 'Regulatory Clearances', description: 'Timeline and progress with regulatory agencies (EPA, REACH, FDA, EMA, or national equivalents).', type: 'rating_plus_text', hint: '0 = not started with any regulatory body,  10 = all required clearances obtained', placeholder: 'Describe your regulatory roadmap — agencies engaged, submissions made, approvals received' },
      { slug: 'astm_iso_standards', label: 'ASTM / ISO Material Standards', description: 'Compliance with standardized material testing protocols (ASTM, ISO, EN, DIN, JIS).', type: 'status', options: ['Not Tested', 'Internal Standards Only', 'Partially Compliant', 'Fully Compliant with Key Standards'] },
      { slug: 'third_party_lab', label: 'Third-Party Lab Validation', description: 'Certification from independent, accredited testing bodies (TUV, UL, SGS, Intertek, NIST).', type: 'status_plus_text', statusOptions: ['None Engaged', 'Quotes Received', 'Testing In Progress', 'Reports Received'], placeholder: 'Name the testing bodies engaged and describe which tests have been completed' },
      { slug: 'carbon_footprint_verification', label: 'Carbon Footprint Verification', description: 'Certified Lifecycle Assessment (LCA) tracking the embodied carbon of your product.', type: 'status', options: ['None', 'Internal Estimate Only', 'Partial LCA Conducted', 'Certified ISO 14040/44 LCA'] },
      { slug: 'rohs_weee', label: 'RoHS and WEEE Compliance', description: 'Restriction of Hazardous Substances and waste disposal compliance for hardware components.', type: 'status', options: ['Not Applicable', 'Non-Compliant (Working On It)', 'Partially Compliant', 'Fully Compliant'] },
      { slug: 'export_control', label: 'Export Control Alignment', description: 'Compliance with international export regulations including ITAR, EAR, or dual-use technology laws.', type: 'status_plus_text', statusOptions: ['Not Assessed', 'Assessment In Progress', 'Compliant (No Restrictions)', 'Controlled (Restrictions Apply)'], placeholder: 'Describe any ITAR, EAR, or dual-use classification relevant to your technology' },
      { slug: 'supply_chain_traceability', label: 'Supply Chain Traceability', description: 'Ability to certify the ethical sourcing and sustainability of your input materials.', type: 'rating', hint: '0 = no traceability beyond tier-1 supplier,  10 = fully audited supply chain to raw material origin' },
      { slug: 'cyber_physical_security', label: 'Cyber-Physical Security', description: 'Information security certification for connected industrial hardware or IoT-enabled equipment (ISO/IEC 27001).', type: 'status', options: ['Not Applicable', 'Not Started', 'In Progress', 'ISO/IEC 27001 Certified'] },
      { slug: 'pilot_plant_accreditation', label: 'Pilot Plant Accreditation', description: 'Local, state, and national environmental and operational permits for your pilot or production facility.', type: 'status_plus_text', statusOptions: ['No Pilot Plant Yet', 'Permit Applications Filed', 'Partial Permits Granted', 'Fully Permitted and Operational'], placeholder: 'List specific permits obtained (environmental, fire, zoning, occupancy) and jurisdictions covered' },
      { slug: 'patent_litigation_insurance', label: 'Patent Litigation Insurance', description: 'Financial protection against costly patent infringement lawsuits.', type: 'status', options: ['None', 'Being Researched', 'Quoted/Under Review', 'Policy In Place'] },
      { slug: 'testing_documentation', label: 'Testing Documentation', description: 'Completeness and transparency of your auditable engineering test logs and lab notebooks.', type: 'rating', hint: '0 = informal unsystematic notes,  10 = fully structured GLP/GMP-grade documentation' },
    ],
  },
  {
    id: 3, slug: 'market',
    title: 'Market, Scalability & Unit Economics',
    colorHex: '#F59E0B', icon: '📈', maxScore: '+15',
    description: 'Define your market opportunity, commercial traction, and the fundamental economics of your business.',
    questions: [
      { slug: 'tam', label: 'TAM (Total Addressable Market)', description: 'Total size of the global market for your specific deep-tech vertical or material application.', type: 'numeric', unit: 'USD millions', min: 0, max: 10000000, placeholder: 'e.g. 5000  (= $5 billion TAM)' },
      { slug: 'sam', label: 'SAM (Serviceable Addressable Market)', description: 'Realistic portion of the TAM you can capture with your current technology and geographic reach.', type: 'numeric', unit: 'USD millions', min: 0, max: 10000000, placeholder: 'e.g. 500  (= $500 million SAM)' },
      { slug: 'green_premium', label: 'Green Premium', description: 'Additional cost % customers must pay for your technology vs. the conventional incumbent solution.', type: 'numeric', unit: '% premium over conventional', min: -100, max: 1000, placeholder: 'e.g. 15  (your product costs 15% more)', hint: 'Negative value = already cheaper than incumbent! 0 = cost-competitive today' },
      { slug: 'time_to_parity', label: 'Time-to-Parity', description: 'Projected years until your technology reaches cost-parity with conventional alternatives at scale.', type: 'numeric', unit: 'years', min: 0, max: 30, placeholder: 'e.g. 3' },
      { slug: 'capex_intensity', label: 'CAPEX Intensity', description: 'Total capital investment required to build a commercial-scale production facility.', type: 'numeric', unit: 'USD millions per facility', min: 0, max: 50000, placeholder: 'e.g. 50  (= $50M per facility)' },
      { slug: 'opex_predictability', label: 'OPEX Predictability', description: 'Stability of your operating costs — especially energy and chemical input price volatility.', type: 'rating', hint: '0 = highly volatile OPEX exposed to commodity swings,  10 = stable, contracted, or hedged costs' },
      { slug: 'off_take_agreements', label: 'Off-Take Agreements', description: 'Hard, legally-binding volume purchase commitments signed by corporate buyers.', type: 'status_plus_text', statusOptions: ['None', 'Under Discussion', 'Non-Binding LOI Signed', 'Binding Off-Take Signed'], placeholder: 'Name companies and specify volumes committed, duration, and pricing terms' },
      { slug: 'loi_quality', label: 'LOI (Letters of Intent) Quality', description: 'Whether your LOIs are binding commitments vs. informal expressions of interest.', type: 'rating_plus_text', hint: '0 = zero LOIs or all non-binding MoUs,  10 = multiple binding LOIs with large-cap corporations', placeholder: 'Describe your LOI pipeline — company names, binding nature, volumes, stage in negotiation' },
      { slug: 'poc_velocity', label: 'PoC (Proof of Concept) Velocity', description: 'Speed and success rate of completing validation cycles with enterprise clients.', type: 'rating_plus_text', hint: '0 = no PoC started with any customer,  10 = multiple successful PoCs with tier-1 corporations', placeholder: 'List PoCs — company name, duration, outcome, and whether it led to a commercial agreement' },
      { slug: 'sales_cycle_duration', label: 'Sales Cycle Duration', description: 'Average months required to close a B2B contract from first conversation to signed agreement.', type: 'numeric', unit: 'months', min: 0, max: 120, placeholder: 'e.g. 12' },
      { slug: 'switching_costs', label: 'Switching Costs', description: 'How costly and disruptive it is for a customer to stop using your technology and switch away.', type: 'rating', hint: '0 = customers can switch away trivially (low lock-in),  10 = switching is extremely costly for customers' },
      { slug: 'unit_margin_stability', label: 'Unit Margin Stability', description: 'Projected gross margin per unit at full economies of scale.', type: 'numeric', unit: '% gross margin at scale', min: -100, max: 100, placeholder: 'e.g. 45' },
      { slug: 'distribution_infrastructure', label: 'Distribution Infrastructure', description: 'Availability of logistics or specialized transport channels for your materials at scale.', type: 'rating', hint: '0 = no viable distribution pathway at scale,  10 = established global logistics network' },
      { slug: 'market_fragmentation', label: 'Market Fragmentation', description: 'Competitive landscape — dominant incumbents vs. a fragmented market you can disrupt.', type: 'rating', hint: '0 = dominated by mega-incumbents with deep moats,  10 = highly fragmented with clear market openings' },
      { slug: 'macro_regulatory_tailwinds', label: 'Macro Regulatory Tailwinds', description: 'Subsidies, carbon taxes, green mandates, or procurement policies favoring your technology.', type: 'rating_plus_text', hint: '0 = regulatory headwinds or neutral environment,  10 = strong multi-government tailwinds with active subsidies', placeholder: 'List specific regulations, subsidies, carbon credit schemes, or mandates that benefit your startup' },
    ],
  },
  {
    id: 4, slug: 'future',
    title: 'Future Readiness & Macro Megatrends',
    colorHex: '#8B5CF6', icon: '🚀', maxScore: '+15',
    description: 'Assess how strategically positioned your technology is against future macro forces and global megatrends.',
    questions: [
      { slug: 'climate_resiliency', label: 'Climate Resiliency', description: "Stability of your technology's performance under shifting climate baselines, extreme temperatures, or weather events.", type: 'rating', hint: '0 = highly performance-sensitive to climate variation,  10 = consistent across all projected climate scenarios' },
      { slug: 'ai_integration', label: 'AI Integration Efficiency', description: 'Active use of machine learning, generative AI, or computational modeling in your R&D or manufacturing process.', type: 'rating_plus_text', hint: '0 = no AI/ML used,  10 = AI-native R&D pipeline with proven efficiency gains', placeholder: 'Describe how AI/ML is embedded in your process — tools used, models trained, efficiency gains achieved' },
      { slug: 'software_defined', label: 'Software-Defined Architecture', description: 'Whether your product supports over-the-air updates, remote diagnostics, or digital twin integration.', type: 'rating', hint: '0 = pure static hardware with zero software,  10 = fully software-defined, remotely updatable and monitored' },
      { slug: 'automation_potential', label: 'Automation Potential', description: 'Percentage of your manufacturing or synthesis process that can be robotized or fully automated.', type: 'numeric', unit: '% automatable', min: 0, max: 100, placeholder: 'e.g. 65' },
      { slug: 'grid_infrastructure', label: 'Grid/Infrastructure Reliance', description: 'How dependent is your process on reliable centralized power grids or specialized port infrastructure?', type: 'rating', hint: '0 = 100% dependent on reliable grid (high risk),  10 = fully off-grid or grid-independent capable' },
      { slug: 'decentralization', label: 'Decentralization Capability', description: 'Feasibility of deploying your technology as distributed micro-factories rather than a single mega-plant.', type: 'rating', hint: '0 = requires one massive centralized facility only,  10 = fully modular and deployable as micro-factories anywhere' },
      { slug: 'cross_sector_elasticity', label: 'Cross-Sector Elasticity', description: 'Ability of your technology to pivot applications across multiple industries beyond your primary market.', type: 'rating_plus_text', hint: '0 = single-industry application only,  10 = applicable across 5+ diverse industries', placeholder: 'List secondary sectors where your technology could be applied (e.g. automotive to aerospace to construction)' },
      { slug: 'water_intensity', label: 'Water Intensity', description: 'Volume of water consumed per unit of production (lower consumption = higher score).', type: 'rating', hint: '0 = extremely water-intensive process,  10 = near-zero or closed-loop water usage' },
      { slug: 'geopolitical_friendshoring', label: 'Geopolitical Friend-Shoring', description: 'Proportion of operations, suppliers, and customers within allied trading blocs (EU, USMCA, QUAD).', type: 'rating', hint: '0 = critical operations in adversarial zones,  10 = 100% operations in allied/stable nations' },
      { slug: 'labor_availability', label: 'Labor Market Availability', description: 'Access to specialized material scientists, process engineers, and metallurgists near your sites.', type: 'rating', hint: '0 = extreme talent scarcity in your location,  10 = deep talent pool with university clusters nearby' },
      { slug: 'quantum_readiness', label: 'Quantum Computing Readiness', description: 'Strategic preparedness to leverage quantum simulation for materials discovery or process optimization.', type: 'rating', hint: '0 = no quantum strategy or partnerships,  10 = active quantum computing R&D partnerships' },
      { slug: 'next_gen_subsidies', label: 'Next-Gen Subsidies', description: 'Positioning to access future government subsidy programs (IRA, EU Green Deal, India PLI, etc.).', type: 'rating_plus_text', hint: '0 = not eligible for any programs,  10 = positioned for multiple large-scale government grants', placeholder: 'List specific grant programs, subsidies, or industrial policy schemes you are applying for or eligible for' },
      { slug: 'demographic_alignment', label: 'Demographic Alignment', description: 'How directly your technology addresses major demographic megatrends — urbanization, aging infrastructure, resource scarcity.', type: 'rating', hint: '0 = no clear demographic tailwind,  10 = directly solves a major megatrend affecting billions' },
      { slug: 'synthetic_biology', label: 'Synthetic Biology Convergence', description: 'Integration of bio-based inputs, fermentation processes, or synthetic biology in your material production.', type: 'rating_plus_text', hint: '0 = purely traditional chemistry with zero bio-component,  10 = synbio-enabled processes at the core', placeholder: 'Describe any bio-based inputs, enzymes, microorganisms, or bioprocesses in your manufacturing' },
      { slug: 'resource_security', label: 'Long-Term Resource Security', description: 'Security of raw material inputs that will remain geographically abundant for 50+ years.', type: 'rating_plus_text', hint: '0 = critical inputs face scarcity within 10 years,  10 = 100% earth-abundant and stable inputs long-term', placeholder: 'Identify your 3 most critical raw materials, their global reserves, and projected availability over 50 years' },
    ],
  },
  {
    id: 5, slug: 'team',
    title: 'Team, Execution & Governance',
    colorHex: '#EC4899', icon: '👥', maxScore: '+15',
    description: "Tell us about your founding team's credentials, execution track record, and organizational maturity.",
    questions: [
      { slug: 'founder_technical_depth', label: 'Founder Technical Depth', description: 'Academic and industrial credentials of the founding team in the core technology domain.', type: 'status_plus_text', statusOptions: ['No Technical Background', 'Industry Practitioner (BSc)', 'Masters Level (MSc/MEng)', 'Doctorate (PhD/PostDoc)', 'Professorial / Domain Expert'], placeholder: "Describe each founder's highest qualification, institution, years of domain experience, and key publications or patents", hint: 'A PhD from a top research lab in your core domain is a strong signal for deep-tech investors' },
      { slug: 'commercialization_track_record', label: 'Commercialization Track Record', description: 'Previous experience scaling physical hardware, advanced materials, or chemical products to market.', type: 'rating_plus_text', hint: '0 = first-time founders with no commercial experience,  10 = serial founders with multiple hard-tech exits', placeholder: 'List previous companies founded or scaled, products commercialized, revenue milestones, and any exits' },
      { slug: 'complementary_skill_mix', label: 'Complementary Skill Mix', description: 'Balance of technical, engineering, business development, and financial expertise across the founding team.', type: 'rating', hint: '0 = homogeneous (all technical, zero commercial skills),  10 = well-balanced across science, engineering, business, and finance' },
      { slug: 'advisory_board_quality', label: 'Advisory Board Quality', description: 'Seniority and relevance of your advisors — C-suite executives, renowned researchers, or sector veterans.', type: 'rating_plus_text', hint: '0 = no formal advisors,  10 = world-class advisors from top global companies and research institutions', placeholder: 'List key advisors, their background, and how actively they contribute (monthly calls, introductions made, etc.)' },
      { slug: 'key_man_dependency', label: 'Key-Man Dependency', description: "Degree to which the startup's existence depends on a single founder or scientist (lower dependency = better).", type: 'rating', hint: '0 = company collapses if one person leaves (critical red flag),  10 = deep leadership bench with no single-point-of-failure' },
      { slug: 'retention_incentives', label: 'Retention Incentives', description: 'Quality and competitiveness of your ESOP for retaining top-tier researchers and engineers.', type: 'status_plus_text', statusOptions: ['No ESOP Exists', 'ESOP Being Designed', 'ESOP In Place (Basic)', 'Competitive ESOP (Market-Benchmarked)'], placeholder: 'Describe your ESOP pool size, vesting schedule, and coverage — what % of key researchers are included?' },
      { slug: 'execution_velocity', label: 'Execution Velocity', description: 'Historical speed of achieving technical milestones relative to the capital deployed to reach them.', type: 'rating_plus_text', hint: '0 = significantly behind milestones relative to capital spent,  10 = consistently ahead of milestones and under budget', placeholder: 'List your 3 most significant milestones achieved, capital spent to achieve each, and whether on time/budget' },
      { slug: 'governance_structure', label: 'Governance Structure', description: 'Formality and independence of your board — audit committee, independent directors, financial transparency.', type: 'rating', hint: '0 = no board or governance structure,  10 = formal board with independent directors, audit committee, and regular investor reporting' },
      { slug: 'co_founder_alignment', label: 'Co-Founder Alignment', description: 'Cohesion of the founding team — vesting schedules, equity split, and history of working together.', type: 'rating_plus_text', hint: '0 = recent conflicts, misaligned equity, or no vesting schedule,  10 = long-tenured team with aligned cliff/vesting', placeholder: 'How long have co-founders worked together? Describe equity split rationale, vesting schedule, and cliff terms' },
      { slug: 'ip_assignment_clearances', label: 'IP Assignment Clearances', description: 'Clear legal transfer of IP ownership from universities, government labs, or prior employers to the startup.', type: 'status_plus_text', statusOptions: ['Not Yet Assessed', 'In Discussion with Institution', 'Partial Assignment Completed', 'Full Clean Assignment Completed'], placeholder: 'Which institutions own or co-own IP? What agreements are in place? Are there university royalty obligations?' },
      { slug: 'regulatory_relationships', label: 'Regulatory Relationship Management', description: 'In-house capability and external advisors to navigate regulatory agencies and institutional politics.', type: 'rating', hint: '0 = no regulatory expertise in-house,  10 = dedicated regulatory team with established agency relationships' },
      { slug: 'capital_allocation_discipline', label: 'Capital Allocation Discipline', description: 'Historical accuracy of budget projections versus actual spending across all capital raises.', type: 'rating_plus_text', hint: '0 = consistent significant budget overruns,  10 = every budget round has come in on or under plan', placeholder: 'For each funding round, compare planned vs. actual spend and explain any variances' },
      { slug: 'crisis_management', label: 'Crisis Management Readiness', description: 'Formal emergency response protocols for laboratory accidents, equipment failures, or field incidents.', type: 'status', options: ['None In Place', 'Informal Ad-Hoc Plan', 'Documented Written Protocol', 'Fully Tested and Rehearsed Protocol'] },
      { slug: 'diversity_of_thought', label: 'Diversity of Thought', description: 'Cross-disciplinary, cross-cultural, and gender diversity across the engineering and leadership team.', type: 'rating', hint: '0 = homogeneous team from the same institution and background,  10 = diverse team spanning multiple disciplines, cultures, and experiences' },
      { slug: 'talent_pipeline', label: 'Talent Pipeline', description: 'Active partnerships with leading research universities to source future scientists and engineers.', type: 'rating_plus_text', hint: '0 = no university partnerships for talent,  10 = established pipeline from top global research institutions', placeholder: 'List university research partnerships, PhD sponsorships, joint labs, or internship programs in place' },
    ],
  },
  {
    id: 6, slug: 'risk',
    title: 'Risk Factors & Deductions',
    colorHex: '#EF4444', icon: '⚠️', maxScore: '−20',
    description: "Honestly assess your startup's risk exposure. Transparency here builds long-term trust with investors.",
    questions: [
      { slug: 'risk_technical_debt', label: 'Technical Debt', description: 'Shortcuts taken during early prototyping that will require expensive redesigns before commercialization.', type: 'severity' },
      { slug: 'risk_regulatory_red_flags', label: 'Regulatory Red Flags', description: "Past citations, OSHA violations, safety incidents, or environmental penalties at any team member's previous ventures.", type: 'severity' },
      { slug: 'risk_founder_litigation', label: 'Founder-Led Litigation Risk', description: 'Ongoing or threatened legal disputes involving founders regarding prior art, non-compete, or employment contracts.', type: 'severity' },
      { slug: 'risk_cap_table_distress', label: 'Cap Table Distress', description: 'Founders hold less than 50% equity before Series A, or predatory terms from early investors.', type: 'severity' },
      { slug: 'risk_customer_concentration', label: 'High Customer Concentration', description: 'Over 60% of projected revenue tied to a single customer or distribution partner.', type: 'severity' },
      { slug: 'risk_burn_rate', label: 'High Burn Rate / Low Runway', description: 'Current cash runway is less than 6 months relative to remaining R&D milestones.', type: 'severity' },
      { slug: 'risk_hype_gap', label: 'Hype-to-Substance Gap', description: 'Public marketing claims that outpace what is supported by audited lab reports or peer-reviewed data.', type: 'severity' },
      { slug: 'risk_single_vendor', label: 'Single-Source Vendor Vulnerability', description: 'Critical machinery, synthesis tools, or key materials with no alternative supplier globally.', type: 'severity' },
      { slug: 'risk_environmental_costs', label: 'High Environmental Remediation Costs', description: 'Large projected future expenses for toxic waste disposal, site cleanup, or environmental liability.', type: 'severity' },
      { slug: 'risk_patent_infringement', label: 'Patent Infringement Vulnerability', description: 'Active legacy patents held by competitors that could block your near-term commercial pathways.', type: 'severity' },
      { slug: 'risk_geopolitical_exposure', label: 'Geopolitical Exposure', description: 'Assets, R&D facilities, or critical supply nodes in geopolitically high-risk or unstable zones.', type: 'severity' },
      { slug: 'risk_rd_talent_churn', label: 'High Churn in R&D Talent', description: 'High annual turnover rate among core engineering scientists or key technical staff.', type: 'severity' },
      { slug: 'risk_inflated_valuation', label: 'Inflated Pre-Money Valuation', description: 'Current valuation detached from physical milestones achieved, creating material down-round risk.', type: 'severity' },
      { slug: 'risk_grant_reliance', label: 'Over-Reliance on Non-Dilutive Grants', description: 'Grant income masks a lack of genuine commercial market validation or paying customers.', type: 'severity' },
      { slug: 'risk_product_liability', label: 'Product Liability Exposure', description: 'Inherent risk of product failure causing catastrophic physical, environmental, or human harm.', type: 'severity' },
      { slug: 'risk_inflexible_scale', label: 'Inflexible Scale-Up Cost Curve', description: 'Manufacturing costs do not meaningfully decrease with volume (no learning curve or economies of scale).', type: 'severity' },
      { slug: 'risk_cofounder_disputes', label: 'Unresolved Co-Founder Disputes', description: 'Active or historical co-founder conflicts, or ongoing unvested equity clawback fights.', type: 'severity' },
      { slug: 'risk_opaque_accounting', label: 'Opaque Accounting', description: 'Absence of third-party audited financial statements or transparent R&D tax credit accounting.', type: 'severity' },
      { slug: 'risk_ethical_supply_chain', label: 'Ethical Supply Chain Exposure', description: 'Known or suspected sourcing of inputs from regions with documented human rights or labor violations.', type: 'severity' },
      { slug: 'risk_choke_point', label: 'Choke-Point Dependence', description: 'Critical dependency on proprietary software, cloud infrastructure, or hardware platforms owned by direct competitors.', type: 'severity' },
    ],
  },
];

// ─── Input Components ─────────────────────────────────────────────────────────

function RatingInput({ q, value, onChange }) {
  const v = value?.rating ?? 5;
  const pct = (v / 10) * 100;
  const color = v <= 3 ? '#EF4444' : v <= 6 ? '#F59E0B' : '#10B981';
  return (
    <div className="ob-rating-wrap">
      <div className="ob-rating-row">
        <span className="ob-rating-label-edge">0</span>
        <div className="ob-slider-track">
          <input
            type="range" min={0} max={10} step={1}
            value={v}
            className="ob-slider"
            style={{ '--fill-pct': `${pct}%`, '--fill-color': color }}
            onChange={e => onChange({ ...(value || {}), rating: +e.target.value })}
          />
        </div>
        <span className="ob-rating-label-edge">10</span>
        <span className="ob-rating-badge" style={{ background: color + '22', color }}>
          {v}<span style={{ fontSize: 10, opacity: 0.7 }}>/10</span>
        </span>
      </div>
      {q.hint && <p className="ob-hint">💡 {q.hint}</p>}
    </div>
  );
}

function RatingPlusTextInput({ q, value, onChange }) {
  return (
    <div>
      <RatingInput q={q} value={value} onChange={onChange} />
      <textarea
        className="ob-textarea"
        placeholder={q.placeholder || 'Add context or supporting data…'}
        value={value?.text || ''}
        rows={3}
        onChange={e => onChange({ ...(value || {}), text: e.target.value })}
      />
    </div>
  );
}

function NumericInput({ q, value, onChange }) {
  return (
    <div className="ob-numeric-wrap">
      <div className="ob-numeric-row">
        <input
          type="number"
          className="ob-numeric-input"
          min={q.min} max={q.max}
          placeholder={q.placeholder || ''}
          value={value?.num ?? ''}
          onChange={e => onChange({ ...(value || {}), num: e.target.value })}
        />
        <span className="ob-numeric-unit">{q.unit}</span>
      </div>
      {q.hint && <p className="ob-hint">💡 {q.hint}</p>}
    </div>
  );
}

function StatusInput({ q, value, onChange }) {
  const opts = q.options || [];
  const selected = value?.status || null;
  return (
    <div className="ob-pills">
      {opts.map(opt => (
        <button
          key={opt}
          className={`ob-pill${selected === opt ? ' active' : ''}`}
          onClick={() => onChange({ ...(value || {}), status: opt })}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function StatusPlusTextInput({ q, value, onChange }) {
  const opts = q.statusOptions || [];
  const selected = value?.status || null;
  return (
    <div>
      <div className="ob-pills">
        {opts.map(opt => (
          <button
            key={opt}
            className={`ob-pill${selected === opt ? ' active' : ''}`}
            onClick={() => onChange({ ...(value || {}), status: opt })}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
      {q.hint && <p className="ob-hint" style={{ marginTop: 8 }}>💡 {q.hint}</p>}
      <textarea
        className="ob-textarea"
        placeholder={q.placeholder || 'Add details…'}
        value={value?.text || ''}
        rows={3}
        onChange={e => onChange({ ...(value || {}), text: e.target.value })}
      />
    </div>
  );
}

const SEVERITY_CONFIG = [
  { key: 'none', label: 'None', color: '#64748B', bg: 'rgba(100,116,139,0.15)' },
  { key: 'low', label: 'Low', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'medium', label: 'Medium', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  { key: 'high', label: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
];

function SeverityInput({ value, onChange }) {
  const selected = value?.severity || null;
  return (
    <div className="ob-severity-row">
      {SEVERITY_CONFIG.map(s => (
        <button
          key={s.key}
          className={`ob-severity-btn${selected === s.key ? ' active' : ''}`}
          style={selected === s.key
            ? { background: s.bg, color: s.color, borderColor: s.color }
            : {}}
          onClick={() => onChange({ severity: s.key })}
          type="button"
        >
          <span className="ob-severity-dot" style={{ background: selected === s.key ? s.color : '#475569' }} />
          {s.label}
        </button>
      ))}
    </div>
  );
}

function QuestionCard({ q, value, onChange, idx, sectionColor }) {
  const hasAnswer = value && Object.keys(value).length > 0 &&
    Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
  return (
    <div className={`ob-question-card${hasAnswer ? ' answered' : ''}`}>
      <div className="ob-question-header">
        <span className="ob-question-num" style={{ color: sectionColor, background: sectionColor + '18' }}>
          {idx + 1}
        </span>
        <div className="ob-question-text">
          <div className="ob-question-label">{q.label}</div>
          <div className="ob-question-desc">{q.description}</div>
        </div>
        {hasAnswer && (
          <span className="ob-answered-tick" style={{ color: sectionColor }}>✓</span>
        )}
      </div>
      <div className="ob-question-body">
        {q.type === 'rating' && <RatingInput q={q} value={value} onChange={onChange} />}
        {q.type === 'rating_plus_text' && <RatingPlusTextInput q={q} value={value} onChange={onChange} />}
        {q.type === 'numeric' && <NumericInput q={q} value={value} onChange={onChange} />}
        {q.type === 'status' && <StatusInput q={q} value={value} onChange={onChange} />}
        {q.type === 'status_plus_text' && <StatusPlusTextInput q={q} value={value} onChange={onChange} />}
        {q.type === 'severity' && <SeverityInput value={value} onChange={onChange} />}
      </div>
    </div>
  );
}

// ─── Review Section Card ──────────────────────────────────────────────────────

function ReviewSection({ section, answers, onEdit }) {
  const answered = section.questions.filter(q => {
    const v = answers[q.slug];
    return v && Object.values(v).some(x => x !== '' && x !== null && x !== undefined);
  }).length;
  const pct = Math.round((answered / section.questions.length) * 100);
  const color = pct === 100 ? '#10B981' : pct >= 50 ? section.colorHex : '#64748B';
  return (
    <div className="ob-review-card" onClick={onEdit}>
      <div className="ob-review-card-left" style={{ borderLeftColor: section.colorHex }}>
        <div className="ob-review-card-icon">{section.icon}</div>
        <div>
          <div className="ob-review-card-title">{section.title}</div>
          <div className="ob-review-card-meta">{answered}/{section.questions.length} answered · {section.maxScore} pts</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="ob-review-mini-bar">
          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
        <span className="ob-review-pct" style={{ color }}>{pct}%</span>
        <button className="ob-review-edit-btn" style={{ color: section.colorHex, borderColor: section.colorHex + '44' }}>
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0–5 = sections, 6 = review
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('zoora_user') || '{}'); }
    catch { return {}; }
  })();
  const startupName = localStorage.getItem('zoora_startup_name') || 'Your Startup';
  const startupId = user.startupId;

  const TOTAL = SECTIONS.length; // 6
  const isReview = step === TOTAL;
  const currentSection = isReview ? null : SECTIONS[step];
  const progress = isReview ? 100 : Math.round((step / TOTAL) * 100);

  const handleAnswer = useCallback((slug, val) => {
    setAnswers(prev => ({ ...prev, [slug]: val }));
  }, []);

  const answeredInSection = (sec) =>
    sec.questions.filter(q => {
      const v = answers[q.slug];
      return v && Object.values(v).some(x => x !== '' && x !== null && x !== undefined);
    }).length;

  const totalAnswered = Object.keys(answers).filter(k => {
    const v = answers[k];
    return v && Object.values(v).some(x => x !== '' && x !== null && x !== undefined);
  }).length;

  async function handleSubmit(skip = false) {
    setSubmitting(true);
    setError('');
    try {
      await submitOnboarding({
        startup_id: startupId,
        answers: skip ? {} : answers,
        completed: !skip,
      });
      navigate('/founder');
    } catch (err) {
      setError('Failed to save your answers. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="ob-page">

      {/* ── Sticky Header / Progress ── */}
      <div className="ob-header">
        <div className="ob-header-top">
          <div className="ob-brand">
            <span style={{ color: 'var(--color-cyan)' }}>Z</span>oora
            <span className="ob-brand-sub">· Founder Onboarding</span>
          </div>
          <div className="ob-header-mid">
            {isReview
              ? <span className="ob-step-chip" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                  ✅ Review & Submit
                </span>
              : <span className="ob-step-chip" style={{ background: currentSection.colorHex + '18', color: currentSection.colorHex }}>
                  {currentSection.icon} Step {step + 1}/{TOTAL} — {currentSection.title}
                </span>
            }
          </div>

        </div>

        {/* Progress bar */}
        <div className="ob-progress-track">
          <div
            className="ob-progress-fill"
            style={{
              width: `${progress}%`,
              background: isReview ? '#10B981' : currentSection?.colorHex
            }}
          />
        </div>

        {/* Step dots */}
        <div className="ob-dots-row">
          {SECTIONS.map((sec, i) => {
            const isDone = i < step;
            const isActive = i === step;
            const filled = answeredInSection(sec);
            return (
              <button
                key={sec.id}
                className={`ob-dot${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                style={{
                  ...(isActive ? { borderColor: sec.colorHex, background: sec.colorHex + '20' } : {}),
                  ...(isDone ? { background: sec.colorHex, borderColor: sec.colorHex } : {}),
                }}
                onClick={() => setStep(i)}
                title={sec.title}
              >
                <span className="ob-dot-icon">{isDone ? '✓' : sec.icon}</span>
                <span className="ob-dot-label">{sec.title.split('&')[0].split(',')[0].trim()}</span>
                {filled > 0 && !isDone && !isActive &&
                  <span className="ob-dot-badge" style={{ background: sec.colorHex }}>{filled}</span>
                }
              </button>
            );
          })}
          <button
            className={`ob-dot${isReview ? ' active' : ''}`}
            style={isReview ? { borderColor: '#10B981', background: 'rgba(16,185,129,0.15)' } : {}}
            onClick={() => setStep(TOTAL)}
            title="Review & Submit"
          >
            <span className="ob-dot-icon">✅</span>
            <span className="ob-dot-label">Review</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="ob-body">

        {/* Welcome banner on step 0 */}
        {step === 0 && (
          <div className="ob-welcome">
            <div className="ob-welcome-glow" />
            <div className="ob-welcome-emoji">🎉</div>
            <h1 className="ob-welcome-title">Welcome, <span style={{ color: 'var(--color-cyan)' }}>{startupName}</span>!</h1>
            <p className="ob-welcome-sub">
              You're registered on Zoraa's deep-tech evaluation network. Complete your <strong>100-point investor-readiness profile</strong> to unlock your scorecard and become visible to investors. This is required before accessing your dashboard.
            </p>
            <div className="ob-welcome-tags">
              <span className="ob-tag" style={{ color: '#3B82F6', background: '#3B82F620' }}>⚗️ 20 Tech Points</span>
              <span className="ob-tag" style={{ color: '#10B981', background: '#10B98120' }}>📋 15 Cert Points</span>
              <span className="ob-tag" style={{ color: '#F59E0B', background: '#F59E0B20' }}>📈 15 Market Points</span>
              <span className="ob-tag" style={{ color: '#8B5CF6', background: '#8B5CF620' }}>🚀 15 Future Points</span>
              <span className="ob-tag" style={{ color: '#EC4899', background: '#EC489920' }}>👥 15 Team Points</span>
              <span className="ob-tag" style={{ color: '#EF4444', background: '#EF444420' }}>⚠️ −20 Risk Deductions</span>
            </div>
          </div>
        )}

        {/* Section banner */}
        {!isReview && (
          <div className="ob-section-banner"
            style={{ borderColor: currentSection.colorHex + '55', background: currentSection.colorHex + '08' }}>
            <div className="ob-section-banner-left">
              <div className="ob-section-icon-big">{currentSection.icon}</div>
              <div>
                <div className="ob-section-banner-title" style={{ color: currentSection.colorHex }}>
                  {currentSection.title}
                  <span className="ob-score-badge" style={{ background: currentSection.colorHex + '22', color: currentSection.colorHex }}>
                    {currentSection.maxScore}
                  </span>
                </div>
                <div className="ob-section-banner-desc">{currentSection.description}</div>
              </div>
            </div>
            <div className="ob-section-banner-right">
              <div className="ob-section-count" style={{ color: currentSection.colorHex }}>
                {answeredInSection(currentSection)}<span style={{ color: 'var(--text-tertiary)' }}>/{currentSection.questions.length}</span>
              </div>
              <div className="ob-section-count-label">answered</div>
            </div>
          </div>
        )}

        {/* Question cards */}
        {!isReview && (
          <div className="ob-questions-list">
            {currentSection.questions.map((q, idx) => (
              <QuestionCard
                key={q.slug}
                q={q}
                idx={idx}
                sectionColor={currentSection.colorHex}
                value={answers[q.slug]}
                onChange={(val) => handleAnswer(q.slug, val)}
              />
            ))}
          </div>
        )}

        {/* Review page */}
        {isReview && (
          <div className="ob-review">
            <div className="ob-review-hero">
              <div className="ob-review-emoji">📊</div>
              <h2 className="ob-review-title">Review Your Profile</h2>
              <p className="ob-review-sub">
                Here's your onboarding progress. Go back to any section to fill in more answers,
                or submit now and complete the rest from your dashboard.
              </p>
              <div className="ob-total-badge">
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-cyan)' }}>{totalAnswered}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 16 }}> / 100 questions answered</span>
              </div>
            </div>

            <div className="ob-review-list">
              {SECTIONS.map((sec, i) => (
                <ReviewSection
                  key={sec.id}
                  section={sec}
                  answers={answers}
                  onEdit={() => setStep(i)}
                />
              ))}
            </div>

            {error && <div className="ob-error">{error}</div>}
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="ob-nav">
        <button
          className="btn btn-ghost ob-nav-btn"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ opacity: step === 0 ? 0.3 : 1 }}
        >
          ← Back
        </button>
        <div className="ob-nav-center">
          <div className="ob-nav-mini-bar">
            <div style={{ width: `${progress}%`, background: isReview ? '#10B981' : currentSection?.colorHex, height: '100%', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <span className="ob-nav-pct">{progress}% complete</span>
        </div>
        {!isReview ? (
          <button
            className="ob-nav-btn ob-nav-next"
            style={{ background: currentSection?.colorHex, boxShadow: `0 4px 20px ${currentSection?.colorHex}55` }}
            onClick={() => setStep(s => s + 1)}
          >
            {step === SECTIONS.length - 1 ? 'Review Answers →' : 'Next Section →'}
          </button>
        ) : (
          <button
            className="ob-nav-btn ob-nav-submit"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? '⏳ Saving…' : '🚀 Submit & Go to Dashboard'}
          </button>
        )}
      </div>
    </div>
  );
}
