-- Create persons table and seed data
-- This script can be run manually or is auto-created by TypeORM synchronize

INSERT INTO persons (name, document, birth_date)
VALUES ('John Doe', '123.456.789-00', '1990-05-15')
ON CONFLICT (document) DO NOTHING;

INSERT INTO persons (name, document, birth_date)
VALUES ('Jane Smith', '987.654.321-00', '1985-10-20')
ON CONFLICT (document) DO NOTHING;
