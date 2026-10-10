INSERT INTO alerts (title, category, severity, severity_rank, area, latitude, longitude,
  issued_at, retrieved_at, expires_at, source_name, source_url, verification_status, original_instructions)
SELECT 'Coastal flood warning', 'FLASH FLOOD', 'SEVERE', 3, 'Chennai coastal districts',
  13.0827, 80.2707, now() - interval '12 minutes', now() - interval '2 minutes',
  now() + interval '6 hours', 'Chennai Civil Defence', 'https://sachet.ndma.gov.in/',
  'OFFICIAL_SOURCE', 'Move inland and avoid the marked low-lying roads. Follow civil defence instructions and do not enter floodwater.'
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Coastal flood warning' AND area = 'Chennai coastal districts');

INSERT INTO alerts (title, category, severity, severity_rank, area, latitude, longitude,
  issued_at, retrieved_at, source_name, source_url, verification_status, original_instructions)
SELECT 'Heavy rainfall advisory', 'WEATHER ADVISORY', 'MODERATE', 2, 'Greater Chennai region',
  13.0674, 80.2376, now() - interval '34 minutes', now() - interval '5 minutes',
  'Regional Meteorological Centre', 'https://mausam.imd.gov.in/chennai/', 'OFFICIAL_SOURCE',
  'Avoid unnecessary travel during intense rainfall. Keep identity documents and essential medicines accessible.'
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Heavy rainfall advisory' AND area = 'Greater Chennai region');

INSERT INTO hazards (name, hazard_type, area, status, latitude, longitude, source_name,
  source_url, updated_at, verification_status)
SELECT 'Coastal Parkway road closure', 'ROAD_CLOSURE', 'Coastal districts', 'ACTIVE',
  13.0827, 80.2707, 'Chennai Civil Defence', 'https://sachet.ndma.gov.in/',
  now() - interval '4 minutes', 'OFFICIAL_SOURCE'
WHERE NOT EXISTS (SELECT 1 FROM hazards WHERE name = 'Coastal Parkway road closure');

INSERT INTO hazards (name, hazard_type, area, status, latitude, longitude, source_name,
  source_url, updated_at, verification_status)
SELECT 'Adyar low-lying waterlogging', 'FLOODING', 'Adyar river corridor', 'REPORTED',
  13.0068, 80.2574, 'Chennai Corporation', 'https://chennaicorporation.gov.in/',
  now() - interval '22 minutes', 'OFFICIAL_SOURCE'
WHERE NOT EXISTS (SELECT 1 FROM hazards WHERE name = 'Adyar low-lying waterlogging');

INSERT INTO shelters (name, area, latitude, longitude, capacity_status, available_spaces,
  amenities, last_verified_at, distance_km, source_name, source_url)
SELECT 'Central Convention Centre Relief Hall', 'Egmore', 13.0732, 80.2609, 'SPACE AVAILABLE',
  184, ARRAY['Medical post', 'Water & rations', 'Backup power'], now() - interval '8 minutes',
  2.4, 'Chennai Civil Defence', 'https://sachet.ndma.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM shelters WHERE name = 'Central Convention Centre Relief Hall');

INSERT INTO shelters (name, area, latitude, longitude, capacity_status, available_spaces,
  amenities, last_verified_at, distance_km, source_name, source_url)
SELECT 'North Municipal Sports Complex', 'Ayanavaram', 13.0986, 80.2321, 'NEAR CAPACITY',
  36, ARRAY['Water & rations', 'Pet-friendly'], now() - interval '18 minutes',
  4.1, 'Chennai Civil Defence', 'https://sachet.ndma.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM shelters WHERE name = 'North Municipal Sports Complex');

INSERT INTO shelters (name, area, latitude, longitude, capacity_status, available_spaces,
  amenities, last_verified_at, distance_km, source_name, source_url)
SELECT 'Guindy Community Relief Centre', 'Guindy', 13.0067, 80.2206, 'SPACE AVAILABLE',
  92, ARRAY['Accessible entrance', 'Water & rations'], now() - interval '26 minutes',
  6.8, 'Chennai Corporation', 'https://chennaicorporation.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM shelters WHERE name = 'Guindy Community Relief Centre');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, source_url)
SELECT 'United Kingdom', 'Europe & UK', '+91 44 4219 2151', 'Convention Centre B-04', 'https://www.gov.uk/world/organisations/british-high-commission-new-delhi'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'United Kingdom');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, source_url)
SELECT 'United States', 'Americas', '+91 44 2857 4000', 'Convention Centre B-02', 'https://in.usembassy.gov/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'United States');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, source_url)
SELECT 'Germany', 'Europe & UK', '+91 44 6688 8780', 'Convention Centre B-06', 'https://india.diplo.de/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'Germany');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, source_url)
SELECT 'Japan', 'Asia-Pacific', '+91 44 2432 3860', 'Convention Centre C-01', 'https://www.in.emb-japan.go.jp/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'Japan');

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Local master emergency', '112', 'Local Civil Defence', 0, 'Government of India', 'https://112.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '112' AND service = 'Local Civil Defence');

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Chennai Corporation control room', '1913', 'Municipal emergency control room', 1, 'Greater Chennai Corporation', 'https://chennaicorporation.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '1913' AND service = 'Municipal emergency control room');
