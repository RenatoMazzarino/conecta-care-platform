import { getGedArtifactDownloadLink } from './getGedArtifactDownloadLink';

export async function getGedArtifactDownloadUrl(artifactId: string) {
  return getGedArtifactDownloadLink(artifactId);
}
