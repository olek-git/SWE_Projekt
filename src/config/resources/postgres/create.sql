CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;

ALTER ROLE auto SET search_path = 'auto';

CREATE TYPE getriebeart AS ENUM ('AUTOMATIK', 'MANUELL');

CREATE TABLE IF NOT EXISTS auto (

    id integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    version integer NOT NULL DEFAULT 0,
    bezeichnung text NOT NULL,
    fahrgestellnummer text NOT NULL,
    baujahr integer NOT NULL,
    ps integer NOT NULL,
    neuKaufpreis integer NOT NULL,
    maxGeschwindigkeit integer NOT NULL,
    marke_id integer NOT NULL REFERENCES marke
    erzeugt timestamp NOT NULL DEFAULT NOW(),
    aktualisiert timestamp NOT NULL DEFAULT NOW()
)TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS ausstattung (
    id integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    klimaanlage boolean,
    sitzheizung boolean,
    getriebe getriebeart NOT NULL,
    innenraummaterial text NOT NULL,
    auto_id integer NOT NULL UNIQUE USING INDEX TABLESPACE autospace REFERENCES auto
)TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS marke (
    id integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    name text NOT NULL,
    gruendungsjahr integer NOT NULL,
    gruender text NOT NULL,
)TABLESPACE autospace;
CREATE INDEX IF NOT EXISTS marke_auto_id_idx ON marke(auto_id) TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS auto_file (
    id  integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    data bytea NOT NULL,
    filename text NOT NULL,
    mimetype text,
    auto_id integer NOT NULL REFERENCES buch
)TABLESPACE autospace;
CREATE INDEX IF NOT EXISTS auto_file_auto_id_idx ON auto_file(auto_id) TABLESPACE autospace;