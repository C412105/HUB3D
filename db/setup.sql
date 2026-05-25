-- ============================================================
-- HUB3D — Supabase database setup
-- Paste this into the Supabase SQL Editor and run it.
-- Safe to re-run: CREATE TABLE IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- ============================================================


-- ========================== 1. TABLES ==========================

-- Profiles — extends Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
    user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username   VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Printers — global catalog
CREATE TABLE IF NOT EXISTS printers (
    printer_id      SERIAL PRIMARY KEY,
    brand           VARCHAR(100) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    build_vol_x     INT,     -- mm
    build_vol_y     INT,
    build_vol_z     INT,
    max_nozzle_temp INT
);

-- Filaments — global catalog
CREATE TABLE IF NOT EXISTS filaments (
    filament_id     SERIAL PRIMARY KEY,
    type            VARCHAR(50) NOT NULL,
    min_print_temp  INT,
    max_print_temp  INT,
    description     TEXT
);

-- User equipment junctions
CREATE TABLE IF NOT EXISTS user_printers (
    user_id    UUID REFERENCES profiles(user_id)  ON DELETE CASCADE,
    printer_id INT  REFERENCES printers(printer_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, printer_id)
);

CREATE TABLE IF NOT EXISTS user_filaments (
    user_id     UUID REFERENCES profiles(user_id)    ON DELETE CASCADE,
    filament_id INT  REFERENCES filaments(filament_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, filament_id)
);

-- Design sources
CREATE TABLE IF NOT EXISTS design_sources (
    source_id    SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    base_url     VARCHAR(255),
    supports_api BOOLEAN DEFAULT FALSE
);

-- Designs
-- compat_check = TRUE  → source supports API filtering (MyMiniFactory, Cults3D)
-- compat_check = FALSE → no API available (Thingiverse, Printables)
CREATE TABLE IF NOT EXISTS designs (
    design_id     SERIAL PRIMARY KEY,
    source_id     INT  REFERENCES design_sources(source_id),
    external_id   VARCHAR(100) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    thumbnail_url TEXT,
    design_url    TEXT,
    likes_count   INT     DEFAULT 0,
    views_count   INT     DEFAULT 0,
    compat_check  BOOLEAN DEFAULT FALSE,
    published_at  TIMESTAMPTZ,
    fetched_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (source_id, external_id)   -- prevents duplicate imports
);

-- Favourites
CREATE TABLE IF NOT EXISTS favourites (
    favourite_id SERIAL PRIMARY KEY,
    user_id      UUID REFERENCES profiles(user_id)  ON DELETE CASCADE,
    design_id    INT  REFERENCES designs(design_id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, design_id)
);

-- Feedback — fully anonymous
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id  SERIAL PRIMARY KEY,
    message      TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========================== 2. SEED DATA ==========================

-- Printers
INSERT INTO printers (brand, model, build_vol_x, build_vol_y, build_vol_z, max_nozzle_temp) VALUES
('Creality',       'Ender 3',        220, 220, 250, 260),
('Creality',       'Ender 3 Pro',    220, 220, 250, 260),
('Prusa Research', 'MK4',            250, 210, 220, 300),
('Bambu Lab',      'X1',             256, 256, 256, 300),
('Bambu Lab',      'P1S',            256, 256, 256, 300),
('Anycubic',       'Kobra',          220, 220, 250, 260),
('Voron',          '2.4',            350, 350, 350, 300),
('Artillery',      'Sidewinder',     300, 300, 400, 240)
ON CONFLICT DO NOTHING;

-- Filaments
INSERT INTO filaments (type, min_print_temp, max_print_temp) VALUES
('PLA',   190, 220),
('PETG',  230, 250),
('ABS',   230, 260),
('TPU',   220, 240),
('ASA',   240, 260),
('Nylon', 250, 270),
('HIPS',  220, 240),
('Resin', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Design sources (order matters — IDs will be 1 = MMF, 2 = Cults3D, 3 = Thingiverse, 4 = Printables)
INSERT INTO design_sources (name, base_url, supports_api) VALUES
('MyMiniFactory', 'https://www.myminifactory.com', TRUE),
('Cults3D',       'https://cults3d.com',           TRUE),
('Thingiverse',   'https://www.thingiverse.com',   FALSE),
('Printables',    'https://www.printables.com',    FALSE)
ON CONFLICT DO NOTHING;

-- Sample designs matching the placeholder cards in designsHUB3Dv0.html
-- source_id 1 = MyMiniFactory, 2 = Cults3D, 3 = Thingiverse, 4 = Printables
INSERT INTO designs (source_id, external_id, title, compat_check, design_url) VALUES
(1, 'mmf-001', 'Normandy SR2 mini',     TRUE,  'https://www.myminifactory.com'),
(1, 'mmf-002', 'Zeratul mini',          TRUE,  'https://www.myminifactory.com'),
(1, 'mmf-003', 'Vacuum container part', TRUE,  'https://www.myminifactory.com'),
(1, 'mmf-004', 'Headphone hook',        TRUE,  'https://www.myminifactory.com'),
(2, 'clt-001', 'Controller stand',      TRUE,  'https://cults3d.com'),
(2, 'clt-002', 'Wall hook',             TRUE,  'https://cults3d.com'),
(2, 'clt-003', 'Door stopper',          TRUE,  'https://cults3d.com'),
(3, 'thg-001', 'Flower pot',            FALSE, 'https://www.thingiverse.com'),
(3, 'thg-002', 'Lamp shade',            FALSE, 'https://www.thingiverse.com'),
(3, 'thg-003', 'Phone stand',           FALSE, 'https://www.thingiverse.com'),
(3, 'thg-004', 'Mini planter',          FALSE, 'https://www.thingiverse.com'),
(4, 'prt-001', 'Cable organizer',       FALSE, 'https://www.printables.com'),
(4, 'prt-002', 'Wrench holder',         FALSE, 'https://www.printables.com'),
(4, 'prt-003', 'Raspberry Pi case',     FALSE, 'https://www.printables.com'),
(4, 'prt-004', 'Filament spool holder', FALSE, 'https://www.printables.com')
ON CONFLICT DO NOTHING;


-- ========================== 3. ROW LEVEL SECURITY ==========================

-- User data — each user can only read/write their own rows
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_printers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_filaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile only"    ON profiles       USING (user_id = auth.uid());
CREATE POLICY "Own printers only"   ON user_printers  USING (user_id = auth.uid());
CREATE POLICY "Own filaments only"  ON user_filaments USING (user_id = auth.uid());
CREATE POLICY "Own favourites only" ON favourites     USING (user_id = auth.uid());

-- Catalog tables — anyone can read, nobody can write via API
ALTER TABLE printers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE filaments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read printers"  ON printers       FOR SELECT USING (TRUE);
CREATE POLICY "Public read filaments" ON filaments      FOR SELECT USING (TRUE);
CREATE POLICY "Public read designs"   ON designs        FOR SELECT USING (TRUE);
CREATE POLICY "Public read sources"   ON design_sources FOR SELECT USING (TRUE);

-- Feedback — anonymous insert, nobody can read via API
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON feedback FOR INSERT WITH CHECK (TRUE);
