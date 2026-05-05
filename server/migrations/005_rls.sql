-- Enable RLS on all tables
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs   ENABLE ROW LEVEL SECURITY;

-- Projects: users can SELECT projects they are a member of
CREATE POLICY select_own_projects ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
        AND user_id    = auth.uid()
    )
  );

-- Projects: only project admins (or global admins) can manage projects
CREATE POLICY manage_projects ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
        AND user_id    = auth.uid()
        AND role       = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks: members can SELECT tasks for their projects
CREATE POLICY select_project_tasks ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id
        AND user_id    = auth.uid()
    )
  );

-- Tasks: members can manage tasks in their projects
CREATE POLICY manage_project_tasks ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id
        AND user_id    = auth.uid()
    )
  );

-- Project members: users can SELECT their own memberships
CREATE POLICY select_own_memberships ON project_members FOR SELECT
  USING (user_id = auth.uid());

-- Project members: project admins or global admins can manage memberships
CREATE POLICY manage_memberships ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id    = auth.uid()
        AND pm.role       = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs: project members can SELECT
CREATE POLICY select_activity_logs ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = activity_logs.project_id
        AND user_id    = auth.uid()
    )
  );
