-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id    ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id           ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to          ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status               ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date             ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id   ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id      ON activity_logs(user_id);
