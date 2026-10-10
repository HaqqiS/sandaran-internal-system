-- Rename enum value in GlobalRole: CEO -> EXECUTIVE
ALTER TYPE "GlobalRole" RENAME VALUE 'CEO' TO 'EXECUTIVE';

-- Rename enum value in ProjectRole: MANDOR -> SUPERVISOR
ALTER TYPE "ProjectRole" RENAME VALUE 'MANDOR' TO 'SUPERVISOR';

-- Add new enum value to ProjectRole: LOGISTIC
ALTER TYPE "ProjectRole" ADD VALUE 'LOGISTIC';
