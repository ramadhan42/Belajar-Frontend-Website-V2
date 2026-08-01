export type UploadProgressHandler = (percent: number) => void;

export type UploadFormResult = {
  ok: boolean;
  status: number;
  json: unknown;
  text: string;
};

/**
 * Multipart upload with real browser upload progress (XHR).
 * `fetch()` cannot report upload percentage.
 */
export function uploadFormDataWithProgress(options: {
  url: string;
  method?: string;
  formData: FormData;
  headers?: Record<string, string>;
  onProgress?: UploadProgressHandler;
}): Promise<UploadFormResult> {
  const { url, formData, headers = {}, onProgress, method = "POST" } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === "content-type") {
        continue;
      }
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress) {
        return;
      }
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(99, Math.max(0, percent)));
        return;
      }
      // Fallback when total size is unknown
      onProgress(Math.min(90, 10 + Math.round(event.loaded / 50_000)));
    };

    xhr.upload.onload = () => {
      onProgress?.(99);
    };

    xhr.onload = () => {
      const text = xhr.responseText ?? "";
      let json: unknown = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }
      onProgress?.(100);
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        json,
        text,
      });
    };

    xhr.onerror = () => {
      reject(new Error("Gagal mengunggah. Periksa koneksi Anda."));
    };

    xhr.onabort = () => {
      reject(new Error("Unggahan dibatalkan."));
    };

    onProgress?.(0);
    xhr.send(formData);
  });
}

export function firstValidationError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const data = payload as {
    message?: string;
    errors?: Record<string, string[] | string>;
  };
  if (data.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (typeof first === "string" && first.trim()) {
      return first;
    }
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  return null;
}
