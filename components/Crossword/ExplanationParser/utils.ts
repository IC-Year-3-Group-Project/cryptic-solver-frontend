const Vowels = "aeiou";

export function articulate(word: string) {
  return Vowels.includes(word.toLowerCase()[0]) ? "an " + word : "a " + word;
}
