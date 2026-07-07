-- ============================================================
-- Migration 004: Seed 100 metrics across all 6 categories
-- Depends on: 002_create_tables.sql
-- ============================================================
-- Scoring convention for RISK metrics:
--   10 = lowest risk / excellent risk posture (best for startup)
--    0 = highest risk / severe exposure (worst for startup)
-- This is consistent with all other categories (10 = best).
-- ============================================================

INSERT INTO metrics (slug, category, name, description, type, weight, max_score, extraction_prompt, valid_min, valid_max) VALUES

-- ════════════════════════════════════════════════════════════
--  CATEGORY: tech  (20 metrics)
-- ════════════════════════════════════════════════════════════

('trl_level',
 'tech', 'Technology Readiness Level (TRL)',
 'NASA/ESA TRL scale 1-9. TRL 1-3 = basic research, 4-6 = development, 7-9 = deployment.',
 'numeric', 8, 10, NULL, 1, 9),

('patent_filed_count',
 'tech', 'Patents Filed (Count)',
 'Total number of patent applications filed (pending or granted).',
 'numeric', 5, 10, NULL, 0, NULL),

('patent_granted_count',
 'tech', 'Patents Granted (Count)',
 'Total number of patents that have been officially granted.',
 'numeric', 7, 10, NULL, 0, NULL),

('github_stars',
 'tech', 'GitHub Repository Stars',
 'Social proof of developer adoption. Use primary repo star count.',
 'numeric', 3, 10, NULL, 0, NULL),

('test_coverage_pct',
 'tech', 'Automated Test Coverage (%)',
 'Percentage of codebase covered by automated tests (unit + integration).',
 'numeric', 4, 10, NULL, 0, 100),

('system_uptime_pct',
 'tech', 'System Uptime (% last 90 days)',
 'Percentage uptime of the core product over the past 90 days.',
 'numeric', 6, 10, NULL, 0, 100),

('api_response_time_ms',
 'tech', 'API Response Time (median ms)',
 'Median API latency in milliseconds. Lower is better.',
 'numeric', 3, 10, NULL, 0, NULL),

('research_publications',
 'tech', 'Peer-Reviewed Publications (Count)',
 'Number of academic / peer-reviewed publications by the founding team.',
 'numeric', 5, 10, NULL, 0, NULL),

('open_source_contributions',
 'tech', 'Open Source Contributions',
 'Total merged PRs across public repositories (all team members).',
 'numeric', 3, 10, NULL, 0, NULL),

('technical_debt_ratio',
 'tech', 'Technical Debt Ratio (%)',
 'Estimated % of codebase classified as technical debt (SonarQube or similar). Lower is better.',
 'numeric', 4, 10, NULL, 0, 100),

('ml_model_accuracy',
 'tech', 'ML/AI Model Accuracy (%)',
 'Benchmark accuracy of core ML model(s), if applicable. Use 0 if no ML component.',
 'numeric', 5, 10, NULL, 0, 100),

('tech_differentiation',
 'tech', 'Core Technology Differentiation',
 'How novel and defensible is the core technology vs. existing alternatives?',
 'qualitative', 10, 10,
 'Score this startup''s core technology differentiation 0-10. '
 '0 = commodity technology, easily replicated, no proprietary elements. '
 '5 = meaningful improvements on existing tech; some proprietary components but not unique. '
 '10 = breakthrough technology; novel approach with clear IP moat; would require significant resources to replicate. '
 'Cite the specific technical claims from the document that support your score.',
 NULL, NULL),

('architecture_soundness',
 'tech', 'Technical Architecture Soundness',
 'Is the system architecture well-designed for the problem: scalable, maintainable, secure?',
 'qualitative', 8, 10,
 'Score this startup''s technical architecture 0-10. '
 '0 = ad-hoc, monolithic, no clear separation of concerns, obvious scaling bottlenecks. '
 '5 = reasonable architecture for current scale; some technical concerns identified. '
 '10 = exemplary design: microservices or well-structured monolith, clear API boundaries, security-first, demonstrably scalable. '
 'Cite specific architectural details or diagrams mentioned in the document.',
 NULL, NULL),

('scalability_design',
 'tech', 'Scalability Architecture Design',
 'Has the team explicitly designed for 100x user/data growth without a full rewrite?',
 'qualitative', 7, 10,
 'Score scalability design 0-10. '
 '0 = no evidence of scalability planning; will likely require rewrite at growth. '
 '5 = basic horizontal scaling in place; some bottlenecks acknowledged but not fully solved. '
 '10 = explicit multi-region, auto-scaling, load-tested design; documented growth capacity ceiling. '
 'Cite evidence from the document.',
 NULL, NULL),

('founder_technical_depth',
 'tech', 'Founder Technical Depth',
 'How deep is the founding team''s hands-on technical expertise relative to what they are building?',
 'qualitative', 9, 10,
 'Score the founding team''s technical depth 0-10. '
 '0 = no technical founders; entirely dependent on outsourced development. '
 '5 = one technical co-founder with relevant skills but not a domain expert; relies on senior hires. '
 '10 = multiple technical founders with deep domain expertise (PhDs, ex-FAANG, original researchers); team built the core tech themselves. '
 'Cite credentials, GitHub activity, publications, or prior work mentioned in the document.',
 NULL, NULL),

('security_audit',
 'tech', 'Security Audit Completion',
 'Has the product undergone a third-party security audit or penetration test?',
 'document', 8, 10, NULL, NULL, NULL),

('api_documentation',
 'tech', 'API / Developer Documentation',
 'Quality and completeness of public API documentation.',
 'document', 4, 10, NULL, NULL, NULL),

('gdpr_compliance_tech',
 'tech', 'Data Privacy Compliance Documentation (GDPR/CCPA)',
 'Evidence of GDPR/CCPA technical implementation: consent management, data deletion, DPAs.',
 'document', 6, 10, NULL, NULL, NULL),

('product_demo',
 'tech', 'Product Demo or Working Prototype',
 'Is there a live demo, recorded walkthrough, or working prototype available?',
 'document', 5, 10, NULL, NULL, NULL),

('code_quality_score',
 'tech', 'Automated Code Quality Score',
 'Code quality gate score from SonarQube, CodeClimate, or equivalent tool.',
 'numeric', 4, 10, NULL, 0, 100),

-- ════════════════════════════════════════════════════════════
--  CATEGORY: certs  (15 metrics)
-- ════════════════════════════════════════════════════════════

('iso_27001',
 'certs', 'ISO 27001 Certification',
 'International information security management standard. Upload certificate.',
 'document', 9, 10, NULL, NULL, NULL),

('soc2_type2',
 'certs', 'SOC 2 Type II Certification',
 'Service Organization Control 2 Type II report. Upload audit report.',
 'document', 9, 10, NULL, NULL, NULL),

('gdpr_cert',
 'certs', 'GDPR Compliance Certification',
 'Formal GDPR certification or DPA from a recognized supervisory authority.',
 'document', 8, 10, NULL, NULL, NULL),

('industry_cert',
 'certs', 'Industry-Specific Certification',
 'Sector-specific regulatory approval: FDA 510(k), CE marking, FCA authorisation, etc.',
 'document', 10, 10, NULL, NULL, NULL),

('export_control',
 'certs', 'Export Control Compliance',
 'Documentation demonstrating compliance with ITAR, EAR, or equivalent export regulations.',
 'document', 6, 10, NULL, NULL, NULL),

('pci_dss',
 'certs', 'PCI-DSS Certification',
 'Payment Card Industry Data Security Standard compliance (only required if processing card payments).',
 'document', 8, 10, NULL, NULL, NULL),

('hipaa',
 'certs', 'HIPAA Compliance Certification',
 'Health Insurance Portability and Accountability Act compliance (only required for health data).',
 'document', 8, 10, NULL, NULL, NULL),

('trademark_registration',
 'certs', 'Trademark Registration',
 'Registered trademark(s) for the brand name and/or product in key markets.',
 'document', 5, 10, NULL, NULL, NULL),

('financial_audit',
 'certs', 'Independent Financial Audit',
 'Audited financial statements from a recognised accounting firm.',
 'document', 9, 10, NULL, NULL, NULL),

('legal_entity_validation',
 'certs', 'Legal Entity Validation',
 'Certificate of incorporation, articles of association, good standing certificate.',
 'document', 7, 10, NULL, NULL, NULL),

('cap_table_verification',
 'certs', 'Cap Table Verification',
 'Clean, up-to-date cap table verified by legal counsel (e.g., Carta report).',
 'document', 8, 10, NULL, NULL, NULL),

('insurance_coverage',
 'certs', 'Insurance Coverage Documentation',
 'Evidence of appropriate business insurance: D&O, E&O, cyber liability.',
 'document', 6, 10, NULL, NULL, NULL),

('b_corp_cert',
 'certs', 'B Corp Certification',
 'B Lab B Corp certification demonstrating social and environmental performance.',
 'document', 4, 10, NULL, NULL, NULL),

('carbon_neutral_cert',
 'certs', 'Carbon Neutrality Certification',
 'Third-party verified carbon neutrality or net-zero certification.',
 'document', 3, 10, NULL, NULL, NULL),

('data_processing_agreement',
 'certs', 'Data Processing Agreements (DPAs)',
 'Signed DPAs with all sub-processors handling personal data.',
 'document', 6, 10, NULL, NULL, NULL),

-- ════════════════════════════════════════════════════════════
--  CATEGORY: market  (20 metrics)
-- ════════════════════════════════════════════════════════════

('tam_usd',
 'market', 'Total Addressable Market — TAM ($USD)',
 'Total global market opportunity in USD. Source must be cited.',
 'numeric', 8, 10, NULL, 0, NULL),

('sam_usd',
 'market', 'Serviceable Addressable Market — SAM ($USD)',
 'Portion of TAM the startup can realistically target with its current model.',
 'numeric', 7, 10, NULL, 0, NULL),

('som_usd',
 'market', 'Serviceable Obtainable Market — SOM ($USD)',
 'Realistic 3-year market capture target in USD.',
 'numeric', 7, 10, NULL, 0, NULL),

('mrr_usd',
 'market', 'Monthly Recurring Revenue — MRR ($USD)',
 'Current MRR. Enter 0 if pre-revenue.',
 'numeric', 10, 10, NULL, 0, NULL),

('arr_usd',
 'market', 'Annual Recurring Revenue — ARR ($USD)',
 'Current ARR (MRR × 12 or actual contracted ARR).',
 'numeric', 10, 10, NULL, 0, NULL),

('revenue_growth_mom_pct',
 'market', 'Revenue Growth Rate (MoM %)',
 'Month-over-month revenue growth percentage. Average over last 3 months.',
 'numeric', 9, 10, NULL, NULL, NULL),

('customer_count',
 'market', 'Total Paying Customer Count',
 'Number of active paying customers / accounts.',
 'numeric', 8, 10, NULL, 0, NULL),

('nps_score',
 'market', 'Net Promoter Score (NPS)',
 'NPS from -100 to 100. Based on a minimum of 20 respondents.',
 'numeric', 7, 10, NULL, -100, 100),

('churn_rate_pct',
 'market', 'Monthly Churn Rate (%)',
 'Monthly customer churn rate. Lower is better.',
 'numeric', 8, 10, NULL, 0, 100),

('cac_usd',
 'market', 'Customer Acquisition Cost — CAC ($USD)',
 'Fully-loaded CAC: total S&M spend / new customers acquired in same period.',
 'numeric', 7, 10, NULL, 0, NULL),

('ltv_usd',
 'market', 'Customer Lifetime Value — LTV ($USD)',
 'Average LTV: ARPU / churn rate, or historically observed.',
 'numeric', 7, 10, NULL, 0, NULL),

('ltv_cac_ratio',
 'market', 'LTV : CAC Ratio',
 'Ratio of LTV to CAC. A ratio of 3+ is considered healthy.',
 'numeric', 8, 10, NULL, 0, NULL),

('market_timing',
 'market', 'Market Timing',
 'Is the startup entering the market at the optimal moment?',
 'qualitative', 8, 10,
 'Score market timing 0-10. '
 '0 = market does not yet exist or has peaked; strong headwinds; timing is off by years. '
 '5 = market is forming but early; or market is mature and competitive with limited window. '
 '10 = perfect timing: market is inflecting now due to regulatory, tech, or behavioural shift; first-mover with clear tailwind. '
 'Cite the market dynamics or external triggers mentioned in the document.',
 NULL, NULL),

('competitive_moat_clarity',
 'market', 'Competitive Moat Clarity',
 'How clearly articulated and defensible is the startup''s competitive moat?',
 'qualitative', 9, 10,
 'Score competitive moat clarity 0-10. '
 '0 = no identifiable moat; easily replicated by a well-funded competitor in 6 months. '
 '5 = some defensibility (brand, switching costs, or early data advantage) but not durable. '
 '10 = multiple compounding moats: proprietary data, network effects, IP, regulatory approval, or embedded customer workflow. '
 'Cite specific moat evidence from the document.',
 NULL, NULL),

('gtm_realism',
 'market', 'Go-to-Market Strategy Realism',
 'Is the GTM plan credible, specific, and achievable given the team and resources?',
 'qualitative', 8, 10,
 'Score GTM strategy realism 0-10. '
 '0 = vague "we will market on social media" plan; no channel specificity; no unit economics. '
 '5 = reasonable GTM plan with 1-2 proven channels but optimistic assumptions; limited evidence of execution. '
 '10 = specific, channel-by-channel plan with demonstrated traction (conversion rates, CPL, payback period); proven playbook. '
 'Cite the specific GTM claims and supporting data from the document.',
 NULL, NULL),

('hype_substance_gap',
 'market', 'Hype-to-Substance Gap',
 'Does the narrative match the actual traction and evidence? Higher score = less gap (more substance).',
 'qualitative', 7, 10,
 'Score the hype-to-substance gap 0-10. '
 '0 = extreme gap: bold claims (e.g. "100x better than anything") with zero supporting data. '
 '5 = moderate gap: some claims are unsubstantiated; presentation is polished but thin on proof. '
 '10 = no gap: every claim is backed by specific data, customer quotes, or independent validation. '
 'Note which specific claims are unsubstantiated and which are well-supported.',
 NULL, NULL),

('traction_storytelling',
 'market', 'Traction Storytelling Quality',
 'How effectively does the pitch communicate traction milestones?',
 'qualitative', 6, 10,
 'Score traction storytelling 0-10. '
 '0 = traction is absent, buried, or presented without context (e.g. "50 users" with no cohort data). '
 '5 = traction is presented but lacks compelling narrative: numbers given without trend or benchmark. '
 '10 = outstanding: clear growth trajectory, benchmarked against industry, with before/after milestone moments. '
 'Cite the traction slides or sections from the document.',
 NULL, NULL),

('loi_contracts',
 'market', 'Letters of Intent / Signed Contracts',
 'Upload LOIs or signed contracts with named customers. Include value if possible.',
 'document', 9, 10, NULL, NULL, NULL),

('pilot_results',
 'market', 'Pilot Program Results',
 'Documented results from pilot programs: adoption rate, key metrics, customer quotes.',
 'document', 8, 10, NULL, NULL, NULL),

('market_research_docs',
 'market', 'Market Research / Customer Interview Documentation',
 'Structured customer discovery documentation: interview notes, surveys, personas.',
 'document', 6, 10, NULL, NULL, NULL),

-- ════════════════════════════════════════════════════════════
--  CATEGORY: future  (15 metrics)
-- ════════════════════════════════════════════════════════════

('rd_investment_pct',
 'future', 'R&D Investment as % of Revenue',
 'Percentage of revenue reinvested into R&D. Pre-revenue startups: use % of total spend.',
 'numeric', 7, 10, NULL, 0, 100),

('grant_funding_usd',
 'future', 'Grant Funding Secured ($USD)',
 'Total non-dilutive grant funding secured (government, EU Horizon, SBIR, etc.).',
 'numeric', 6, 10, NULL, 0, NULL),

('ai_ml_integration',
 'future', 'AI/ML Integration Plans',
 'How concrete and well-thought-out are the startup''s AI/ML plans?',
 'qualitative', 7, 10,
 'Score AI/ML integration plans 0-10. '
 '0 = no plans; or superficial "we will add AI" without specifics. '
 '5 = credible use case identified; prototype or POC underway. '
 '10 = production AI/ML system already live or in final testing; clear data strategy; measurable performance benchmarks. '
 'Cite specific AI/ML claims and evidence from the document.',
 NULL, NULL),

('regulatory_expansion_readiness',
 'future', 'Regulatory Readiness for Expansion Markets',
 'How prepared is the startup to enter new regulatory jurisdictions?',
 'qualitative', 8, 10,
 'Score regulatory expansion readiness 0-10. '
 '0 = no regulatory mapping for target markets; unaware of compliance requirements. '
 '5 = aware of key regulations; one or two markets mapped but no active compliance work. '
 '10 = fully mapped regulatory landscape for top 3 target markets; active conversations with regulators or approvals in progress. '
 'Cite specific markets and regulatory mentions from the document.',
 NULL, NULL),

('international_expansion',
 'future', 'International Expansion Strategy',
 'How specific and credible is the international expansion plan?',
 'qualitative', 7, 10,
 'Score international expansion strategy 0-10. '
 '0 = "we will go global" with no specifics; no market prioritisation. '
 '5 = 1-2 specific markets identified with rationale; some GTM localisation work started. '
 '10 = phased expansion plan with market entry criteria, localisation roadmap, regulatory path, and local partnerships. '
 'Cite specific markets, timelines, and expansion evidence from the document.',
 NULL, NULL),

('product_vision',
 'future', 'Product Vision Clarity',
 'Is the long-term product vision compelling, specific, and differentiated?',
 'qualitative', 9, 10,
 'Score product vision clarity 0-10. '
 '0 = vague or generic vision ("we want to transform industry X"); no specific product direction. '
 '5 = clear vision statement with a believable 3-year roadmap; some differentiation. '
 '10 = vivid, specific, differentiated vision backed by market insight; roadmap tied to measurable milestones; creates investor excitement. '
 'Cite the vision statement and roadmap details from the document.',
 NULL, NULL),

('platform_extensibility',
 'future', 'Platform Extensibility',
 'Is the product designed as a platform that can grow into adjacent use cases?',
 'qualitative', 7, 10,
 'Score platform extensibility 0-10. '
 '0 = point solution; no API or extension mechanism; would require rewrite to expand. '
 '5 = some extension capability; basic API or plugin system in development. '
 '10 = genuine platform: open APIs, partner integrations, marketplace or ecosystem model; documented extensibility strategy. '
 'Cite platform features or ecosystem evidence from the document.',
 NULL, NULL),

('sustainability_esg',
 'future', 'Sustainability / ESG Strategy',
 'Does the startup have a credible ESG strategy?',
 'qualitative', 5, 10,
 'Score ESG strategy 0-10. '
 '0 = no ESG consideration; or greenwashing without substance. '
 '5 = basic ESG awareness; initial policies in place; not yet measured. '
 '10 = comprehensive ESG framework with targets, third-party verification, and integration into business model. '
 'Cite specific ESG initiatives and metrics from the document.',
 NULL, NULL),

('talent_pipeline',
 'future', 'Talent Acquisition Pipeline',
 'How strong is the startup''s ability to attract and retain top talent going forward?',
 'qualitative', 6, 10,
 'Score talent pipeline strength 0-10. '
 '0 = no hiring plan; relying on founders only; no employer brand. '
 '5 = basic hiring plan; some roles posted; modest employer brand. '
 '10 = strong employer brand (press, awards, thought leadership); pipeline of candidates; competitive comp; equity structure. '
 'Cite talent strategy evidence from the document.',
 NULL, NULL),

('ip_pipeline',
 'future', 'IP Pipeline Defensibility',
 'How strong is the pipeline of future IP protection?',
 'qualitative', 8, 10,
 'Score IP pipeline defensibility 0-10. '
 '0 = no pending IP; trade secrets only with no formal protection strategy. '
 '5 = 1-2 patent applications filed; basic IP strategy in place. '
 '10 = substantial patent portfolio in progress; trade secret programme; IP licensing strategy; freedom-to-operate analysis completed. '
 'Cite specific IP pipeline mentions from the document.',
 NULL, NULL),

('network_effects',
 'future', 'Ecosystem / Network Effects',
 'Does the product exhibit or have a credible path to network effects?',
 'qualitative', 8, 10,
 'Score network effects 0-10. '
 '0 = no network effects; product value does not increase with more users. '
 '5 = some direct or indirect network effects but not yet measurable; hypothesis only. '
 '10 = strong, demonstrated network effects: clear data showing value increases with user growth; virtuous cycle documented. '
 'Cite network effect evidence from the document.',
 NULL, NULL),

('technology_lockin',
 'future', 'Technology Lock-in / Switching Cost',
 'How high are the switching costs for customers once onboarded?',
 'qualitative', 7, 10,
 'Score technology lock-in / switching costs 0-10. '
 '0 = trivial to switch; commodity product; no data migration cost; competitive alternatives readily available. '
 '5 = moderate switching costs: some data migration effort; some workflow dependency. '
 '10 = extreme lock-in: deep workflow integration, proprietary data formats, high migration cost, long contract terms with penalties. '
 'Cite specific lock-in mechanisms from the document.',
 NULL, NULL),

('strategic_roadmap',
 'future', 'Strategic Roadmap Documentation',
 'Upload a product roadmap or strategic plan document.',
 'document', 8, 10, NULL, NULL, NULL),

('partnership_pipeline',
 'future', 'Partnership Pipeline',
 'Upload LOIs or MOUs with strategic partners.',
 'document', 7, 10, NULL, NULL, NULL),

('five_year_moat',
 'future', 'Competitive Moat — 5 Year Horizon',
 'How defensible is the startup''s position in 5 years if a well-funded competitor enters?',
 'qualitative', 8, 10,
 'Score the 5-year competitive moat 0-10. '
 '0 = easily disrupted; no structural advantage over a well-funded entrant. '
 '5 = some durable advantages but a well-funded competitor could catch up in 3-4 years. '
 '10 = compounding advantages (data, network, regulatory, brand) that make disruption extremely difficult even with significant funding. '
 'Cite specific moat-building dynamics from the document.',
 NULL, NULL),

-- ════════════════════════════════════════════════════════════
--  CATEGORY: team  (15 metrics)
-- ════════════════════════════════════════════════════════════

('founding_team_size',
 'team', 'Founding Team Size',
 'Number of co-founders.',
 'numeric', 4, 10, NULL, 1, NULL),

('domain_expertise_pct',
 'team', 'Founders with Domain Expertise (%)',
 'Percentage of co-founders with direct, verifiable experience in the startup''s sector.',
 'numeric', 8, 10, NULL, 0, 100),

('prior_exits',
 'team', 'Prior Startup Exits (Count)',
 'Number of successful exits (acquisition or IPO) across all co-founders.',
 'numeric', 9, 10, NULL, 0, NULL),

('combined_experience_years',
 'team', 'Combined Years of Experience in Sector',
 'Total years of professional experience in this sector across all co-founders.',
 'numeric', 7, 10, NULL, 0, NULL),

('key_hires_count',
 'team', 'Key Hires Made Post-Funding',
 'Number of senior/key hires made since the last funding round.',
 'numeric', 6, 10, NULL, 0, NULL),

('employee_growth_rate_pct',
 'team', 'Employee Headcount Growth Rate (% YoY)',
 'Year-over-year percentage growth in full-time headcount.',
 'numeric', 5, 10, NULL, NULL, NULL),

('employee_retention_pct',
 'team', 'Employee Retention Rate (% last 12 months)',
 'Percentage of employees retained over the past 12 months.',
 'numeric', 7, 10, NULL, 0, 100),

('fulltime_commitment_pct',
 'team', 'Full-Time Founder Commitment (%)',
 'Percentage of co-founders working full-time on the startup.',
 'numeric', 8, 10, NULL, 0, 100),

('diversity_index',
 'team', 'Team Diversity Index (0-100)',
 'Self-reported diversity score across gender, ethnicity, and background. Use standard diversity scoring framework.',
 'numeric', 5, 10, NULL, 0, 100),

('team_cohesion',
 'team', 'Team Cohesion & Complementarity',
 'How well do co-founders complement each other''s skills and work together?',
 'qualitative', 9, 10,
 'Score team cohesion and complementarity 0-10. '
 '0 = single founder or founders with duplicated skills; no clear division of responsibilities; history of conflict. '
 '5 = complementary skills at a basic level; some overlap; functional but not exceptional. '
 '10 = exceptional team: clearly delineated CEO/CTO/CPO split; prior working history together; mutual reinforcing strengths; evidence of high-trust communication. '
 'Cite team background, prior collaboration, or role clarity from the document.',
 NULL, NULL),

('advisor_quality',
 'team', 'Advisor Quality & Relevance',
 'How credible and strategically relevant are the advisors?',
 'qualitative', 7, 10,
 'Score advisor quality 0-10. '
 '0 = no advisors; or advisors with no relevant expertise. '
 '5 = 2-3 advisors with partial relevance; mostly brand names rather than operational contributors. '
 '10 = world-class advisors with direct domain expertise, active involvement, and meaningful equity stakes. '
 'Cite specific advisor names, roles, and contributions from the document.',
 NULL, NULL),

('culture_values',
 'team', 'Culture & Values Alignment',
 'Are the team''s stated culture and values credible, specific, and consistent with their actions?',
 'qualitative', 6, 10,
 'Score culture and values alignment 0-10. '
 '0 = generic values ("we value teamwork and innovation") with no specific evidence. '
 '5 = specific values articulated; some evidence of them in practice (retention, hiring decisions). '
 '10 = deeply embedded culture: specific rituals, decision-making frameworks, and public examples of values in action even when costly. '
 'Cite specific culture or values evidence from the document.',
 NULL, NULL),

('board_composition',
 'team', 'Board Composition & Quality',
 'Upload board structure document or investor deck section showing board.',
 'document', 8, 10, NULL, NULL, NULL),

('reference_checks',
 'team', 'Reference Check Results',
 'Upload documented reference check outcomes from investors or operators.',
 'document', 7, 10, NULL, NULL, NULL),

('linkedin_thought_leadership',
 'team', 'LinkedIn / Thought Leadership Presence',
 'How strong is the founding team''s public-facing professional brand?',
 'qualitative', 4, 10,
 'Score thought leadership and professional brand 0-10. '
 '0 = founders have no public presence; private LinkedIn profiles; no publications or speaking. '
 '5 = some presence: active LinkedIn, occasional posts, 1-2 speaking engagements. '
 '10 = industry-recognised thought leaders: significant following, regular speaking at top conferences, authored publications, cited by press. '
 'Cite specific thought leadership evidence from the document.',
 NULL, NULL),

-- ════════════════════════════════════════════════════════════
--  CATEGORY: risk  (15 metrics)
-- NOTE: 10 = lowest/best risk posture; 0 = highest/worst risk.
-- ════════════════════════════════════════════════════════════

('runway_months',
 'risk', 'Runway Remaining (Months)',
 'Months of runway at current burn rate. Higher is better.',
 'numeric', 10, 10, NULL, 0, NULL),

('top_customer_concentration_pct',
 'risk', 'Top Customer Revenue Concentration (%)',
 '% of total revenue from the single largest customer. Lower is better (less concentration).',
 'numeric', 8, 10, NULL, 0, 100),

('debt_liability_usd',
 'risk', 'Total Debt / Liability Exposure ($USD)',
 'Total outstanding debt and material liabilities. Lower relative to assets is better.',
 'numeric', 7, 10, NULL, 0, NULL),

('regulatory_compliance_risk',
 'risk', 'Regulatory / Compliance Risk',
 'How exposed is the startup to regulatory action, fines, or forced business model change?',
 'qualitative', 9, 10,
 'Score regulatory compliance risk 0-10 (10 = lowest risk, 0 = highest risk). '
 '0 = severe exposure: operating in regulatory grey area; active investigations; no compliance programme. '
 '5 = some regulatory risk; partially compliant; monitoring situation; no immediate threats. '
 '10 = fully compliant across all relevant jurisdictions; proactive engagement with regulators; clean record. '
 'Cite specific regulatory risks or compliance evidence from the document.',
 NULL, NULL),

('key_person_dependency',
 'risk', 'Key Person Dependency Risk',
 'How dependent is the startup on one or two irreplaceable individuals?',
 'qualitative', 8, 10,
 'Score key person dependency risk 0-10 (10 = lowest risk). '
 '0 = entire company depends on one individual who could leave; no succession or documentation. '
 '5 = some key person risk; processes partially documented; some succession planning. '
 '10 = no single point of failure; all critical knowledge documented and cross-trained; strong second line of leadership. '
 'Cite specific team structure evidence from the document.',
 NULL, NULL),

('competitive_displacement_risk',
 'risk', 'Competitive Displacement Risk',
 'How likely is the startup to be displaced by a well-funded new entrant or incumbent pivot?',
 'qualitative', 7, 10,
 'Score competitive displacement risk 0-10 (10 = lowest risk). '
 '0 = highly likely to be displaced: low switching costs, no moat, large incumbents could replicate easily. '
 '5 = moderate risk: some protection but incumbents or well-funded entrants pose a real threat. '
 '10 = minimal displacement risk: deep moats make it uneconomical for competitors to displace within a 5-year horizon. '
 'Cite specific competitive dynamics from the document.',
 NULL, NULL),

('technical_implementation_risk',
 'risk', 'Technical Implementation Risk',
 'How likely is the startup to face major technical setbacks or failures?',
 'qualitative', 7, 10,
 'Score technical implementation risk 0-10 (10 = lowest risk). '
 '0 = unproven technology at TRL 1-3; depends on breakthroughs not yet achieved; no fallback. '
 '5 = technology mostly de-risked; some integration challenges remain; fallback paths exist. '
 '10 = technology fully de-risked; production-proven; experienced engineering team; clear fallback options. '
 'Cite technical risk evidence from the document.',
 NULL, NULL),

('geopolitical_risk',
 'risk', 'Geopolitical Risk Exposure',
 'How exposed is the startup to geopolitical events, sanctions, or political instability?',
 'qualitative', 6, 10,
 'Score geopolitical risk exposure 0-10 (10 = lowest risk). '
 '0 = severely exposed: core operations or supply chain in high-risk geopolitical regions; sanctions risk. '
 '5 = some exposure: partial operations in moderate-risk regions; monitoring but no mitigation. '
 '10 = minimal exposure: operations in stable jurisdictions; diversified supply chain; no significant geopolitical dependencies. '
 'Cite specific geopolitical risk factors from the document.',
 NULL, NULL),

('supply_chain_dependency',
 'risk', 'Supply Chain Dependency Risk',
 'How exposed is the startup to supply chain disruptions?',
 'qualitative', 6, 10,
 'Score supply chain dependency risk 0-10 (10 = lowest risk). '
 '0 = entire product depends on a single supplier with no alternatives; no inventory buffer. '
 '5 = some concentration; partial diversification; could survive short disruption. '
 '10 = fully diversified supply chain; multiple qualified suppliers for all critical components; significant buffer inventory. '
 'Cite specific supply chain dependencies from the document.',
 NULL, NULL),

('negative_press_risk',
 'risk', 'Negative Press / Reputation Risk',
 'Is the startup or its founders exposed to significant reputational risk?',
 'qualitative', 7, 10,
 'Score reputation risk 0-10 (10 = lowest risk). '
 '0 = active negative press, founder controversies, or public PR crisis. '
 '5 = one or two minor historical incidents; no current press but some legacy risk. '
 '10 = clean reputation; positive media coverage; no known controversies. '
 'Cite reputation evidence from the document or note if no evidence found.',
 NULL, NULL),

('ip_infringement_risk',
 'risk', 'IP Infringement Risk Documentation',
 'Upload freedom-to-operate (FTO) analysis or legal opinion on IP position.',
 'document', 8, 10, NULL, NULL, NULL),

('litigation_history',
 'risk', 'Litigation History',
 'Upload legal disclosure document covering all past or pending litigation.',
 'document', 9, 10, NULL, NULL, NULL),

('data_breach_history',
 'risk', 'Data Breach History & Response',
 'Upload documentation of any past data breaches and incident response plans.',
 'document', 8, 10, NULL, NULL, NULL),

('founder_conflicts',
 'risk', 'Founder Conflicts of Interest Disclosed',
 'Upload signed conflicts-of-interest disclosure from all founders.',
 'document', 7, 10, NULL, NULL, NULL),

('market_timing_risk',
 'risk', 'Market Timing Risk',
 'How significant is the risk that the market does not materialise or moves too slowly?',
 'qualitative', 6, 10,
 'Score market timing risk 0-10 (10 = lowest risk). '
 '0 = high risk: market is speculative or has not formed; multiple failed predecessors; long adoption curve. '
 '5 = moderate risk: market is forming; some uncertainty about pace of adoption. '
 '10 = low risk: market timing is validated by strong macro indicators, regulatory tailwinds, or existing customer demand. '
 'Cite market timing risk factors from the document.',
 NULL, NULL);

-- Verify count
DO $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM metrics;
  IF cnt < 100 THEN
    RAISE WARNING 'Expected 100 metrics, found %. Check seed file.', cnt;
  ELSE
    RAISE NOTICE 'Metrics seeded successfully: % rows.', cnt;
  END IF;
END;
$$;
