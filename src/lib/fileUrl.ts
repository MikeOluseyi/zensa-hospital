import api from "@/lib/api";

export async function openAttachment(downloadPath: string, fileName: string) {

  try {

    const res = await api.get(downloadPath, {
      responseType: "blob"
    });

    const blobUrl = URL.createObjectURL(res.data);

    window.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

  } catch (err) {

    console.error(err);
    alert("Failed to open attachment.");

  }

}