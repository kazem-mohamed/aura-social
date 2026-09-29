import type { ChangeEvent, ReactNode } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { Avatar } from "@/shared/kit/Avatar";
import { Counter } from "@/shared/kit/Counter";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import type { User } from "../../model/user.types";
import { ProfileCover } from "./ProfileCover";

interface ProfileHeaderProps {
  profile: User;
  avatarUrl: string;
  coverUrl: string;
  canEdit: boolean;
  postsCount: number;
  followersCount: number;
  /** Follow for someone else; Settings and the menu on your own page. */
  actions: ReactNode;
  photoUploading: boolean;
  coverUpdating: boolean;
  /** Omitted when there is no real photo to look at. */
  onViewPhoto?: () => void;
  onSelectPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onViewCover: () => void;
  onSelectCover: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
}

/** The top of a profile: band, sticker, name as a poster, and the counts. */
export function ProfileHeader({
  profile,
  avatarUrl,
  coverUrl,
  canEdit,
  postsCount,
  followersCount,
  actions,
  photoUploading,
  coverUpdating,
  onViewPhoto,
  onSelectPhoto,
  onViewCover,
  onSelectCover,
  onRemoveCover,
}: ProfileHeaderProps) {
  const identityKey = profile.handle || profile.username || profile.name;
  const avatar = <Avatar identityKey={identityKey} name={profile.name} photo={avatarUrl} size="xl" />;
  const stats = [
    { label: "Posts", value: postsCount },
    { label: "Followers", value: followersCount },
    { label: "Following", value: profile.followingCount },
  ];

  return (
    <section aria-label="Profile" className="grid">
      <ProfileCover
        identityKey={identityKey}
        name={profile.name}
        coverUrl={coverUrl}
        canEdit={canEdit}
        isUpdating={coverUpdating}
        onView={onViewCover}
        onSelect={onSelectCover}
        onRemove={onRemoveCover}
      />

      <div className="-mt-16 flex flex-wrap items-end justify-between gap-4 px-3 sm:-mt-20 sm:px-8">
        <div className="relative">
          {onViewPhoto ? (
            <button type="button" onClick={onViewPhoto} aria-label={`View ${profile.name}’s photo`} className="block cursor-zoom-in rounded-full">
              {avatar}
            </button>
          ) : (
            avatar
          )}
          {canEdit ? (
            <label className="absolute right-1 bottom-1 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-carbon bg-sun text-carbon transition-transform duration-200 hover:-rotate-6 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--focus)">
              <span className="sr-only">Change your photo</span>
              {photoUploading ? <PeelLoader size={22} label="Uploading photo" /> : <Glyph name="camera" size={20} />}
              {/* Not `disabled`: focus returns here when the framer closes mid-upload, and a disabled input drops it. */}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-disabled={photoUploading || undefined}
                onClick={(event) => {
                  if (photoUploading) event.preventDefault();
                }}
                onChange={onSelectPhoto}
              />
            </label>
          ) : null}
        </div>
        <div className="flex items-center gap-2 pb-2">{actions}</div>
      </div>

      <PosterHeader size="xl" title={profile.name} lede={profile.handle} />

      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="grid gap-1">
            <dt className="order-2 type-label text-ink-2">{stat.label}</dt>
            <dd className="order-1 type-heading">
              <Counter value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>

      {canEdit && profile.email ? <p className="mt-4 type-caption text-ink-2">{profile.email}</p> : null}
    </section>
  );
}
