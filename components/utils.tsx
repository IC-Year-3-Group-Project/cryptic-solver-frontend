/* Loads an image into an html element as a promise so it can be awaited in sequence. */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = src;
  });
}
