-- Up
--------------------------------------------------------------------------------

CREATE TABLE blockchain_events
(
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT             NOT NULL,
    txHash      TEXT             NOT NULL,
    blockHash   TEXT             NOT NULL,
    blockHeight INTEGER          NOT NULL,
    inputs      TEXT             NOT NULL,
    txIndex     INTEGER          NOT NULL,
    created     INTEGER          NOT NULL
);

-- Note: SQLite does not support the UUID data type by default so we go with text here

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE blockchain_events;
