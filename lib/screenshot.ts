// Real screenshot of the page via the browser's screen-capture prompt
// (the visitor picks this tab), saved as a PNG like macOS does.
export async function takeScreenshot() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    alert("Screenshots aren't supported in this browser.");
    return;
  }

  let stream: MediaStream | null = null;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "browser" },
      audio: false,
      // Chromium: offer this tab first.
      preferCurrentTab: true,
    } as DisplayMediaStreamOptions);

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    // Give the capture a frame to settle so the share prompt is gone.
    await new Promise((resolve) => setTimeout(resolve, 250));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} at ${now.toLocaleTimeString("en-GB").replace(/:/g, ".")}`;
    const link = document.createElement("a");
    link.download = `Screenshot ${stamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch {
    /* visitor cancelled the share prompt */
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
  }
}
