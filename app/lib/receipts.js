import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

/* Firestore caps a document at 1,048,576 bytes — everything, not just this
   field. Base64 inflates bytes by ~33%, so the ceiling below leaves room for
   the rest of the doc and some slack. */
const MAX_DATA_URL_BYTES = 700 * 1024;
const MAX_EDGE = 1400; // enough to read a printed receipt on screen

/**
 * Downscale and re-encode an image to a JPEG data URL small enough to live
 * in a Firestore document. Quality steps down until it fits, because a
 * fixed quality can't guarantee a size across wildly different photos.
 */
export async function compressToDataUrl(file) {
  if (!file) return "";
  if (!file.type?.startsWith("image/")) {
    throw new Error("Receipt must be an image (JPG or PNG).");
  }

  /* createImageBitmap with from-image applies the EXIF rotation that phone
     cameras record. Without it, portrait photos land sideways — canvas
     ignores EXIF on its own. */
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  // Receipts are usually photographed on white paper; a white backdrop keeps
  // any transparency in a PNG from turning black in the JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.72, 0.6, 0.5, 0.4, 0.3]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    // A data URL is ASCII, so length is its byte count.
    if (dataUrl.length <= MAX_DATA_URL_BYTES) return dataUrl;
  }

  throw new Error(
    "Couldn't compress that image enough. Try a smaller photo or a clearer crop."
  );
}

/**
 * Fetch a receipt on demand.
 * Receipts live in their own collection, NOT on the admission document: the
 * admin queue listens to every admission, and an inline image would mean
 * downloading every receipt on every snapshot.
 */
export async function fetchReceipt(admissionId) {
  const snap = await getDoc(doc(db, "receipts", admissionId));
  return snap.exists() ? snap.data().dataUrl || "" : "";
}
