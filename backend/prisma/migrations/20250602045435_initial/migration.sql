-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "task_priority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "priority" "task_priority" NOT NULL DEFAULT 'medium',
    "status" "task_status" NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_categories" (
    "task_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_categories_pkey" PRIMARY KEY ("task_id","category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_user_is_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_user_created_at" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "idx_task_user_id" ON "tasks"("user_id");

-- CreateIndex
CREATE INDEX "idx_task_priority" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "idx_task_status" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "idx_task_due_date" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "idx_task_created_at" ON "tasks"("created_at");

-- CreateIndex
CREATE INDEX "idx_task_user_status" ON "tasks"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_task_user_priority" ON "tasks"("user_id", "priority");

-- CreateIndex
CREATE INDEX "idx_task_user_due_date" ON "tasks"("user_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "idx_category_name" ON "categories"("name");

-- CreateIndex
CREATE INDEX "idx_category_created_at" ON "categories"("created_at");

-- CreateIndex
CREATE INDEX "idx_task_category_task" ON "task_categories"("task_id");

-- CreateIndex
CREATE INDEX "idx_task_category_category" ON "task_categories"("category_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
