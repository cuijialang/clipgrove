-- ============================================
-- ClipGrove: 添加 AI Agent 分类 + 添加 section 字段
-- ============================================

-- 添加 section 字段用于区分两大主题
ALTER TABLE navigation_category ADD COLUMN IF NOT EXISTS section TEXT;

-- 更新现有视频分类的 section
UPDATE navigation_category SET section = 'video' WHERE section IS NULL;

-- 插入 AI Agent 分类
INSERT INTO navigation_category (name, title, sort, section, del_flag, create_by, create_time) VALUES
('coding-agent', 'AI Coding Agent', 11, 'agent', 0, NULL, NOW()),
('autonomous-agent', 'Autonomous Agent', 12, 'agent', 0, NULL, NOW()),
('agent-framework', 'Agent Framework', 13, 'agent', 0, NULL, NOW()),
('browser-agent', 'Browser Agent', 14, 'agent', 0, NULL, NOW()),
('workflow-agent', 'Workflow Agent', 15, 'agent', 0, NULL, NOW());