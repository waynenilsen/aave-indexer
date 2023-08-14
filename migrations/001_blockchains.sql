-- Up
--------------------------------------------------------------------------------

CREATE TABLE blockchains
(
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT             NOT NULL,
    symbol      TEXT             NOT NULL,
    blockHeight BIGINT,
    chainId     INT              NOT NULL
);

INSERT INTO blockchains (id, name, symbol, blockHeight, chainId)
VALUES ('7EBFED8C-2C2F-4A67-86CD-F4D6FB3B2CBA', 'Ethereum', 'ETH', null, 1);


-- Note: SQLite does not support the UUID data type by default so we go with text here

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE blockchains;
