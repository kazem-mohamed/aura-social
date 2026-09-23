import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import type { MenuItem } from "@/shared/kit/Menu";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import type { Post } from "../../model/post.types";
import { PostActions } from "./PostActions";
import { PostBody } from "./PostBody";
import { PostEditForm } from "./PostEditForm";
import { PostHeader } from "./PostHeader";
import { QuotedPost } from "./QuotedPost";
import { ShareSheet } from "./ShareSheet";
import { TopComment } from "./TopComment";
import { usePostCardActions } from "./usePostCardActions";

interface PostCardProps {
  post: Post;
  /** `feed` cards open the post page and preview the top comment; `detail` is the post on its own page. */
  variant?: "feed" | "detail";
  /** Position in a list: staggers the first screenful and alternates the arrival tilt. */
  index?: number;
  /** The post page focuses its own comment box instead of navigating. */
  onComment?: () => void;
  /** The post page leaves once its post is deleted. */
  onDeleted?: () => void;
}

/** One post, stuck to the wall — on a feed it slaps on from a tilt as it scrolls into view. */
export function PostCard({ post, variant = "feed", index = 0, onComment, onDeleted }: PostCardProps) {
  const navigate = useNavigate();
  const { reduced } = useMotionPrefs();
  const actions = usePostCardActions(post);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFeed = variant === "feed";
  const arrives = isFeed && !reduced;
  const tilt = index % 2 === 0 ? -7 : 6;
  const openPost = (query = "") => navigate(`${routes.postDetails(post.id)}${query}`, { viewTransition: true });

  const menu: MenuItem[] =
    actions.canManage && !isEditing
      ? [
          { label: "Edit post", glyph: "edit", onSelect: () => setIsEditing(true) },
          { label: "Delete post", glyph: "trash", tone: "danger", onSelect: () => setIsDeleting(true) },
        ]
      : [];

  return (
    <motion.article
      aria-label={`Post by ${post.author.name}`}
      className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-card border border-line bg-surface p-5 sm:p-6"
      initial={arrives ? { opacity: 0, y: -18, rotate: tilt, scale: 1.06 } : false}
      whileInView={arrives ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...spring.arrive, delay: index < 4 ? index * 0.07 : 0 }}
    >
      <PostHeader post={post} menu={menu} />

      {isEditing ? (
        <PostEditForm
          initialBody={post.body}
          saving={actions.isSaving}
          onCancel={() => setIsEditing(false)}
          onSave={(body) => actions.edit(body, () => setIsEditing(false))}
        />
      ) : (
        <PostBody post={post} variant={variant} onOpen={isFeed ? () => openPost() : undefined} />
      )}

      {post.sharedPost ? <QuotedPost post={post.sharedPost} /> : null}

      <PostActions
        post={post}
        onLike={actions.toggleLike}
        onComment={onComment ?? (() => openPost("?showComments=1"))}
        onShare={() => setIsSharing(true)}
        onSave={actions.toggleSave}
      />

      {isFeed && post.topComment ? <TopComment postId={post.id} comment={post.topComment} total={post.commentsCount} /> : null}

      <ShareSheet
        open={isSharing}
        post={post.sharedPost ?? post}
        sharing={actions.isSharing}
        onClose={() => {
          if (!actions.isSharing) setIsSharing(false);
        }}
        onShare={(caption) => actions.share(caption, () => setIsSharing(false))}
      />
      <ConfirmDialog
        open={isDeleting}
        onClose={() => {
          if (!actions.isRemoving) setIsDeleting(false);
        }}
        onConfirm={() =>
          actions.remove(() => {
            setIsDeleting(false);
            onDeleted?.();
          })
        }
        title="Delete this post?"
        description="It comes off every wall, for good."
        confirmLabel="Delete post"
        destructive
        loading={actions.isRemoving}
      />
    </motion.article>
  );
}
