export const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

export async function getSolutions(
  clue: string,
  length: number
): Promise<any> {
  const response = await fetch(`${apiUrl}/solve-clue`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clue: clue,
      word_length: length
    }),
  });

  return await response.json();
}