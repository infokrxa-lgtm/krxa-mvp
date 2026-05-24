-- CreateTable
CREATE TABLE "KRXAConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "llm_mode" TEXT NOT NULL,
    "auto_mode" TEXT NOT NULL,
    "cost_mode" TEXT NOT NULL,
    "policy_level" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MemoryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "intent" TEXT,
    "retry" INTEGER,
    "context_summary" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "actions_json" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "success" BOOLEAN,
    "user_feedback" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "success_score" INTEGER NOT NULL DEFAULT 0,
    "last_used" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KRXALog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "state" TEXT,
    "action" TEXT,
    "decision_source" TEXT,
    "message" TEXT NOT NULL,
    "payload_json" TEXT
);
