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

INSERT INTO alerts (title, category, severity, severity_rank, area, latitude, longitude,
  issued_at, retrieved_at, expires_at, source_name, source_url, verification_status, original_instructions)
SELECT 'Heat health advisory', 'EXTREME HEAT', 'MODERATE', 2, 'Chennai and Chengalpattu',
  12.9896, 80.2209, now() - interval '48 minutes', now() - interval '6 minutes',
  now() + interval '10 hours', 'India Meteorological Department',
  'https://mausam.imd.gov.in/', 'OFFICIAL_SOURCE',
  'Avoid strenuous activity during peak afternoon heat. Drink water regularly and check on children, older adults and people with medical conditions.'
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Heat health advisory' AND area = 'Chennai and Chengalpattu');

INSERT INTO alerts (title, category, severity, severity_rank, area, latitude, longitude,
  issued_at, retrieved_at, expires_at, source_name, source_url, verification_status, original_instructions)
SELECT 'Airport access disruption', 'TRANSPORT ADVISORY', 'INFO', 1, 'Chennai International Airport corridor',
  12.9941, 80.1709, now() - interval '26 minutes', now() - interval '4 minutes',
  now() + interval '4 hours', 'Chennai Airport Operations',
  'https://www.aai.aero/en/airports/chennai', 'OFFICIAL_SOURCE',
  'Allow extra travel time and follow airport staff instructions. Confirm flight status with your airline before leaving.'
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Airport access disruption' AND area = 'Chennai International Airport corridor');

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

INSERT INTO hazards (name, hazard_type, area, status, latitude, longitude, source_name,
  source_url, updated_at, verification_status)
SELECT 'Airport access traffic restriction', 'TRANSPORT_DISRUPTION', 'Meenambakkam',
  'ACTIVE', 12.9941, 80.1709, 'Chennai Airport Operations',
  'https://www.aai.aero/en/airports/chennai', now() - interval '14 minutes', 'OFFICIAL_SOURCE'
WHERE NOT EXISTS (SELECT 1 FROM hazards WHERE name = 'Airport access traffic restriction');

INSERT INTO hazards (name, hazard_type, area, status, latitude, longitude, source_name,
  source_url, updated_at, verification_status)
SELECT 'Pallikaranai marsh access caution', 'ENVIRONMENTAL_HAZARD', 'Pallikaranai',
  'REPORTED', 12.9516, 80.2092, 'Greater Chennai Corporation',
  'https://chennaicorporation.gov.in/', now() - interval '31 minutes', 'OFFICIAL_SOURCE'
WHERE NOT EXISTS (SELECT 1 FROM hazards WHERE name = 'Pallikaranai marsh access caution');

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

INSERT INTO shelters (name, area, latitude, longitude, capacity_status, available_spaces,
  amenities, last_verified_at, distance_km, source_name, source_url)
SELECT 'South Chennai Indoor Relief Centre', 'Velachery', 12.9750, 80.2212,
  'SPACE AVAILABLE', 68, ARRAY['Medical post', 'Accessible entrance', 'Charging points'],
  now() - interval '12 minutes', 5.7, 'Greater Chennai Corporation',
  'https://chennaicorporation.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM shelters WHERE name = 'South Chennai Indoor Relief Centre');

INSERT INTO shelters (name, area, latitude, longitude, capacity_status, available_spaces,
  amenities, last_verified_at, distance_km, source_name, source_url)
SELECT 'Airport Transit Support Centre', 'Meenambakkam', 12.9877, 80.1636,
  'NEAR CAPACITY', 19, ARRAY['Water & rations', 'Multilingual volunteers', 'Charging points'],
  now() - interval '21 minutes', 9.2, 'Chennai Airport Operations',
  'https://www.aai.aero/en/airports/chennai'
WHERE NOT EXISTS (SELECT 1 FROM shelters WHERE name = 'Airport Transit Support Centre');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'United Kingdom', 'Europe & UK', '+91 44 4219 2151', 'Convention Centre B-04', 13.0569, 80.2425, 'https://www.gov.uk/world/organisations/british-high-commission-new-delhi'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'United Kingdom');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'United States', 'Americas', '+91 44 2857 4000', 'Convention Centre B-02', 13.0644, 80.2487, 'https://in.usembassy.gov/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'United States');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'Germany', 'Europe & UK', '+91 44 6688 8780', 'Convention Centre B-06', 13.0604, 80.2496, 'https://india.diplo.de/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'Germany');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'Japan', 'Asia-Pacific', '+91 44 2432 3860', 'Convention Centre C-01', 13.0338, 80.2564, 'https://www.in.emb-japan.go.jp/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'Japan');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'Australia', 'Asia-Pacific', '+91 44 4592 1300', 'Convention Centre C-03',
  13.0418, 80.2546, 'https://india.embassy.gov.au/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'Australia');

INSERT INTO diplomatic_missions (country, region, emergency_phone, desk_label, latitude, longitude, source_url)
SELECT 'France', 'Europe & UK', '+91 44 2833 4700', 'Convention Centre B-08',
  13.0608, 80.2491, 'https://in.ambafrance.org/'
WHERE NOT EXISTS (SELECT 1 FROM diplomatic_missions WHERE country = 'France');

UPDATE diplomatic_missions SET latitude = CASE country
  WHEN 'United Kingdom' THEN 13.0569
  WHEN 'United States' THEN 13.0644
  WHEN 'Germany' THEN 13.0604
  WHEN 'Japan' THEN 13.0338
END, longitude = CASE country
  WHEN 'United Kingdom' THEN 80.2425
  WHEN 'United States' THEN 80.2487
  WHEN 'Germany' THEN 80.2496
  WHEN 'Japan' THEN 80.2564
END
WHERE country IN ('United Kingdom', 'United States', 'Germany', 'Japan')
  AND (latitude IS NULL OR longitude IS NULL);

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Local master emergency', '112', 'Local Civil Defence', 0, 'Government of India', 'https://112.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '112' AND service = 'Local Civil Defence');

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Chennai Corporation control room', '1913', 'Municipal emergency control room', 1, 'Greater Chennai Corporation', 'https://chennaicorporation.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '1913' AND service = 'Municipal emergency control room');

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Chennai Police control room', '100', 'Police emergency response', 1, 'Tamil Nadu Police', 'https://eservices.tnpolice.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '100' AND service = 'Police emergency response');

INSERT INTO emergency_contacts (label, phone, service, priority, source_name, source_url)
SELECT 'Ambulance service', '108', 'Emergency medical response', 1, 'Tamil Nadu Health Department', 'https://www.tnhealth.tn.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE phone = '108' AND service = 'Emergency medical response');
