export function withProfilePhoto(uris: string[], profileUri: string): string[] {
  return uris.includes(profileUri)
    ? [profileUri, ...uris.filter((uri) => uri !== profileUri)]
    : uris;
}
