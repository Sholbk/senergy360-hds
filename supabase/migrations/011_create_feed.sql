-- Feed posts table (shared project feed)
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  -- Visibility: array of user_ids who can see this post; empty = all project participants
  visible_to UUID[] DEFAULT '{}',
  -- Attached document reference
  document_id UUID REFERENCES documents(id),
  -- Image attachments stored in Supabase Storage
  image_paths TEXT[] DEFAULT '{}',
  -- Feed event type for system-generated posts
  event_type TEXT,
  event_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_feed_posts_project ON feed_posts(project_id);
CREATE INDEX idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_tenant ON feed_posts(tenant_id);
CREATE INDEX idx_feed_posts_deleted_at ON feed_posts(deleted_at);

-- Feed comments table
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_feed_comments_post ON feed_comments(feed_post_id);
CREATE INDEX idx_feed_comments_deleted_at ON feed_comments(deleted_at);

-- Enable realtime for feed tables
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_comments;
