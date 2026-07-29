import { HomeExperience } from "@/components/home/home-experience";
import { listGithubRepos } from "@/lib/github";

export const revalidate = 300;

export default async function HomePage() {
  const { repos, error } = await listGithubRepos({ includeForks: false });
  return <HomeExperience repos={repos} error={error} />;
}
