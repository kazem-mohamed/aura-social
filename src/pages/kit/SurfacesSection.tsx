import { useState } from "react";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { Card } from "@/shared/kit/Card";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import { Field } from "@/shared/kit/Field";
import { IconButton } from "@/shared/kit/IconButton";
import { Menu } from "@/shared/kit/Menu";
import { Modal } from "@/shared/kit/Modal";
import { Tooltip } from "@/shared/kit/Tooltip";
import { useToast } from "@/shared/kit/toast/useToast";
import { KitBlock } from "./KitBlock";

export function SurfacesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastChoice, setLastChoice] = useState("Nothing chosen yet.");
  const toast = useToast();

  return (
    <div className="grid gap-16" id="surfaces">
      <h2 className="type-display">Surfaces</h2>

      <KitBlock title="Cards" note="Interactive cards lift and tilt; the rest stay put.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="font-bold">Default</p>
            <p className="type-body text-ink-2">Posts, panels, comments.</p>
          </Card>
          <Card variant="interactive" tabIndex={0}>
            <p className="font-bold">Interactive</p>
            <p className="type-body text-ink-2">Hover me, press me.</p>
          </Card>
          <Card variant="featured">
            <p className="font-bold">Featured</p>
            <p className="type-body text-ink-2">A band-coloured highlight.</p>
          </Card>
          <Card variant="compact" band="sun">
            <p className="font-bold">Compact · Sunburst band</p>
          </Card>
          <Card variant="profile" band="lav">
            <Avatar identityKey="maya.s" name="Maya S" size="lg" />
            <p className="font-bold">Profile</p>
          </Card>
          <Card variant="content">A content card sets its text at body-large for reading.</Card>
        </div>
      </KitBlock>

      <KitBlock title="Avatars" note="The photo sits inside the person's identity sticker; initials until it decodes.">
        <div className="flex flex-wrap items-end gap-5">
          <Avatar identityKey="leila.harb" name="Leila Harb" size="sm" />
          <Avatar identityKey="idris.okafor" name="Idris Okafor" size="md" />
          <Avatar identityKey="noor_ali" name="Noor Ali" size="lg" />
          <Avatar identityKey="kofi.m" name="Kofi M" size="xl" />
          <Avatar identityKey="sam.k" name="Sam K" size="lg" frame={false} />
        </div>
      </KitBlock>

      <KitBlock title="Modal, sheet, confirm" note="Dialog from 640px up; a draggable bottom sheet on phones. Escape, backdrop and focus trap everywhere.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete post…
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Share to your wall"
          description="Add a caption, or share it as it is."
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  toast.show({ title: "Shared. It’s on your wall." });
                }}
              >
                Share
              </Button>
            </>
          }
        >
          <Field label="Caption" placeholder="Say something about it" />
        </Modal>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            toast.show({ tone: "info", title: "Deleted", action: { label: "Undo", onClick: () => undefined } });
          }}
          title="Delete this post?"
          description="This can’t be undone."
          confirmLabel="Delete"
          destructive
        />
      </KitBlock>

      <KitBlock title="Menu and tooltip" note="Menu: arrows, Home/End, type a letter, Escape. Tooltip: hover waits 400ms, focus is instant.">
        <div className="flex flex-wrap items-center gap-4">
          <Menu
            label="Post options"
            items={[
              { label: "Edit post", glyph: "edit", onSelect: () => setLastChoice("Edit post") },
              { label: "Copy link", glyph: "link", onSelect: () => setLastChoice("Copy link") },
              { label: "Report", glyph: "alert", onSelect: () => setLastChoice("Report"), disabled: true },
              { label: "Delete post", glyph: "trash", tone: "danger", onSelect: () => setConfirmOpen(true) },
            ]}
          />
          <Tooltip label="New post">
            <IconButton glyph="plus" label="New post" variant="primary" />
          </Tooltip>
          <Tooltip label="Alerts" side="bottom">
            <IconButton glyph="bell" label="Alerts" />
          </Tooltip>
          <p className="type-caption text-ink-2">{lastChoice}</p>
        </div>
      </KitBlock>

      <KitBlock title="Toasts" note="Slap on as stickers, pause on hover, lift away. Errors stay 5s.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.show({ title: "Posted. It’s on the wall." })}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.show({ tone: "info", title: "New posts above", description: "Tap to load them." })}>
            Info
          </Button>
          <Button variant="secondary" onClick={() => toast.show({ tone: "warning", title: "480 / 500 — almost at the limit." })}>
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.show({
                tone: "error",
                title: "That didn’t stick.",
                description: "Check your connection and try again.",
                action: { label: "Retry", onClick: () => undefined },
              })
            }
          >
            Error
          </Button>
        </div>
      </KitBlock>
    </div>
  );
}
