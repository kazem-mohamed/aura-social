import { useState } from "react";
import { FollowButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ProfileHeader } from "@/features/users/components/profile/ProfileHeader";
import { ProfilePhotoEditorModal } from "@/features/users/components/profile/ProfilePhotoEditorModal";
import type { User } from "@/features/users/model/user.types";
import { KitBlock } from "./KitBlock";

const SAMPLE: User = {
  id: "kit-profile",
  name: "Idris Okafor",
  username: "idris.okafor",
  handle: "@idris.okafor",
  email: null,
  photo: "",
  coverPhoto: null,
  followersCount: 1204,
  followingCount: 87,
  bookmarksCount: 0,
  isFollowing: false,
  raw: {},
};

const noop = () => {};

/** The profile head with sample data, and the photo framer. Nothing here reaches the API. */
export function ProfileSection() {
  const [following, setFollowing] = useState(false);
  const [framing, setFraming] = useState("");

  return (
    <div className="grid gap-16" id="profile">
      <h2 className="type-display">Profile</h2>
      <KitBlock title="Profile header" note="Sample person, no cover: their identity colour stuck with their own shape.">
        <ProfileHeader
          profile={SAMPLE}
          avatarUrl=""
          coverUrl=""
          canEdit={false}
          postsCount={42}
          followersCount={SAMPLE.followersCount + (following ? 1 : 0)}
          actions={<FollowButton name={SAMPLE.name} following={following} onToggle={() => setFollowing((value) => !value)} />}
          photoUploading={false}
          coverUpdating={false}
          onSelectPhoto={noop}
          onViewCover={noop}
          onSelectCover={noop}
          onRemoveCover={noop}
        />
      </KitBlock>
      <KitBlock title="Photo framer" note="Drag, arrow keys, zoom. Save just closes it here.">
        <Button variant="secondary" iconStart="camera" className="justify-self-start" onClick={() => setFraming("/og.png")}>
          Open the framer
        </Button>
        <ProfilePhotoEditorModal imageUrl={framing} saving={false} onCancel={() => setFraming("")} onSave={() => setFraming("")} />
      </KitBlock>
    </div>
  );
}
