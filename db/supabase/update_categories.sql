-- ============================================
-- ClipGrove: 更新分类为8个AI视频垂直分类
-- 先清空旧分类，再插入新分类
-- ============================================

-- 清空旧分类
DELETE FROM navigation_category;

-- 插入8个AI视频垂直分类
INSERT INTO navigation_category (name, title, sort, del_flag, create_by, create_time) VALUES
('text-to-video', 'Text-to-Video', 1, 0, NULL, NOW()),
('ai-animation', 'AI Animation', 2, 0, NULL, NOW()),
('ai-avatar', 'AI Avatar', 3, 0, NULL, NOW()),
('ai-video-editing', 'AI Video Editing', 4, 0, NULL, NOW()),
('ai-shorts', 'AI Shorts', 5, 0, NULL, NOW()),
('image-to-video', 'Image-to-Video', 6, 0, NULL, NOW()),
('ai-voiceover', 'AI Voiceover', 7, 0, NULL, NOW()),
('video-enhancement', 'Video Enhancement', 8, 0, NULL, NOW());