export async function getFbUid(url: string) {
  try {
    const res = await fetch("/api/get-uid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.status === "success") {
      return data.uid;
    }

    throw new Error(data.msg);
  } catch (error) {
    throw error;
  }
}