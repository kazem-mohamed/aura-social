import { useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { useToast } from "@/shared/kit/toast/useToast";
import { cropToSquare, readFileAsDataUrl, type Offset } from "../lib/imageCrop";
import { useUploadCoverPhoto, useUploadProfilePhoto } from "./useProfilePhotoUpload";

/**
 * Everything the profile page needs to change its avatar and cover: staged
 * files, local previews, the two dialogs, and the upload mutations. Results
 * are reported as toasts.
 *
 * Previews are keyed by profile so a preview from one profile never bleeds onto
 * another after navigation — the behaviour the page implemented with a
 * `profileKey` on each piece of state.
 */
export function useProfileImages(profileKey: string, canEdit: boolean) {
  const uploadPhoto = useUploadProfilePhoto();
  const uploadCover = useUploadCoverPhoto();
  const toast = useToast();

  const [previewKey, setPreviewKey] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isCoverRemoved, setIsCoverRemoved] = useState(false);

  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoEditorUrl, setPhotoEditorUrl] = useState("");

  const isForCurrentProfile = previewKey === profileKey;

  function fail(message: string) {
    toast.show({ tone: "error", title: "Upload failed", description: message });
  }

  function succeed(title: string) {
    toast.show({ tone: "success", title });
  }

  /** Shared validation for both pickers. Resets the input so re-picking works. */
  function takeFile(event: React.ChangeEvent<HTMLInputElement>): File | null {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      fail("Choose an image file.");
      return null;
    }

    if (!canEdit) {
      fail("You can only change images on your own profile.");
      return null;
    }

    return file;
  }

  function selectCoverFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = takeFile(event);
    if (!file) return;

    setIsCoverRemoved(false);
    setPendingCoverFile(file);
  }

  async function confirmCoverUpload() {
    if (!pendingCoverFile) return;

    const file = pendingCoverFile;
    setPendingCoverFile(null);

    let preview = "";
    try {
      preview = await readFileAsDataUrl(file);
    } catch {
      preview = "";
    }

    uploadCover.mutate(file, {
      onSuccess: () => {
        if (preview) {
          setPreviewKey(profileKey);
          setCoverPreview(preview);
        }
        setIsCoverRemoved(false);
        succeed("Cover updated.");
      },
      onError: (error) => fail(getErrorMessage(error, "Your cover didn’t upload. Try again.")),
    });
  }

  function removeCover() {
    if (!canEdit || uploadCover.isPending) return;
    setPreviewKey(profileKey);
    setCoverPreview("");
    setIsCoverRemoved(true);
    succeed("Cover removed.");
  }

  async function selectPhotoFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = takeFile(event);
    if (!file) return;

    try {
      const preview = await readFileAsDataUrl(file);
      if (!preview) throw new Error("Failed to preview selected profile photo.");

      setPendingPhotoFile(file);
      setPhotoEditorUrl(preview);
    } catch {
      fail("That image couldn’t be opened. Try another.");
    }
  }

  function cancelPhotoEditor() {
    if (uploadPhoto.isPending) return;
    setPendingPhotoFile(null);
    setPhotoEditorUrl("");
  }

  async function saveCroppedPhoto(zoom: number, offset: Offset) {
    if (!pendingPhotoFile || uploadPhoto.isPending) return;

    try {
      const { file, previewUrl } = await cropToSquare(photoEditorUrl, pendingPhotoFile, zoom, offset);

      setPreviewKey(profileKey);
      setAvatarPreview(previewUrl);
      setPendingPhotoFile(null);
      setPhotoEditorUrl("");

      uploadPhoto.mutate(file, {
        onSuccess: () => succeed("Photo updated."),
        onError: (error) => {
          setAvatarPreview("");
          fail(getErrorMessage(error, "Your photo didn’t upload. Try again."));
        },
      });
    } catch (error) {
      fail(getErrorMessage(error, "That photo couldn’t be prepared. Try another."));
    }
  }

  return {
    avatarPreview: isForCurrentProfile ? avatarPreview : "",
    coverPreview: isForCurrentProfile ? coverPreview : "",
    isCoverRemoved: isForCurrentProfile && isCoverRemoved,

    isCoverPending: uploadCover.isPending,
    isPhotoPending: uploadPhoto.isPending,

    isCoverDialogOpen: pendingCoverFile !== null,
    photoEditorUrl,

    selectCoverFile,
    confirmCoverUpload,
    cancelCoverUpload: () => {
      if (uploadCover.isPending) return;
      setPendingCoverFile(null);
    },
    removeCover,

    selectPhotoFile,
    cancelPhotoEditor,
    saveCroppedPhoto,
  };
}
